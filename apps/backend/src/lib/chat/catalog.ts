import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, getVariantAvailability, MedusaError, QueryContext } from "@medusajs/framework/utils"

// Read-only view of the published catalog for the chat assistant. Everything goes through Medusa's Query
// (the same data the Store API serves): published products only, prices of the VND region (tax-inclusive),
// stock of the storefront's sales channel. No SQL, no write access.

export type CatalogVariant = {
  id: string
  title: string
  sku: string | null
  price: number | null
  original_price: number | null
  manage_inventory: boolean
  allow_backorder: boolean
}

export type CatalogProduct = {
  id: string
  handle: string
  title: string
  description: string
  thumbnail: string | null
  created_at: string
  brand: string | null
  ingredients: string | null
  kcal_per_kg: number | null
  feeding_guide: string | null
  tags: string[]
  categories: { handle: string; name: string }[]
  sales_channel_ids: string[]
  variants: CatalogVariant[]
  /** Normalised text used for keyword search */
  search_text: { strong: string; weak: string }
}

type ProductRow = {
  id: string
  handle: string
  title: string
  description: string | null
  thumbnail: string | null
  created_at: string | Date
  metadata: Record<string, unknown> | null
  tags?: ({ value: string } | null)[] | null
  categories?: ({ handle: string; name: string; is_active?: boolean; is_internal?: boolean } | null)[] | null
  sales_channels?: ({ id: string } | null)[] | null
  variants?: ({
    id: string
    title: string | null
    sku: string | null
    manage_inventory: boolean | null
    allow_backorder: boolean | null
    calculated_price?: { calculated_amount?: number | null; original_amount?: number | null } | null
  } | null)[] | null
}

const CACHE_TTL_MS = 60_000
let cache: { at: number; products: CatalogProduct[] } | null = null
let regionCache: { id: string; currency_code: string } | null = null

/** Lowercase, no Vietnamese diacritics, single spaces */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9:.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function metaString(meta: Record<string, unknown> | null, key: string): string | null {
  const value = meta?.[key]
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function metaNumber(meta: Record<string, unknown> | null, key: string): number | null {
  const value = meta?.[key]
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN
  return Number.isFinite(n) ? n : null
}

async function loadRegion(container: MedusaContainer) {
  if (regionCache) return regionCache
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
    filters: { currency_code: "vnd" },
  })
  const region = data[0] as { id: string; currency_code: string } | undefined
  if (!region) throw new MedusaError(MedusaError.Types.NOT_FOUND, "No VND region found; run seed.ts first")
  regionCache = region
  return region
}

export function toCatalogProduct(row: ProductRow): CatalogProduct {
  const tags = (row.tags ?? []).flatMap((t) => (t?.value ? [t.value] : []))
  const categories = (row.categories ?? []).flatMap((c) =>
    c && c.is_active !== false && c.is_internal !== true ? [{ handle: c.handle, name: c.name }] : []
  )
  const brand = metaString(row.metadata, "brand")
  const ingredients = metaString(row.metadata, "ingredients")
  const description = row.description ?? ""

  return {
    id: row.id,
    handle: row.handle,
    title: row.title,
    description,
    thumbnail: row.thumbnail,
    created_at: new Date(row.created_at).toISOString(),
    brand,
    ingredients,
    kcal_per_kg: metaNumber(row.metadata, "kcal_per_kg"),
    feeding_guide: metaString(row.metadata, "feeding_guide"),
    tags,
    categories,
    sales_channel_ids: (row.sales_channels ?? []).flatMap((s) => (s?.id ? [s.id] : [])),
    variants: (row.variants ?? []).flatMap((v) =>
      v
        ? [
            {
              id: v.id,
              title: v.title ?? "",
              sku: v.sku,
              price: v.calculated_price?.calculated_amount ?? null,
              original_price: v.calculated_price?.original_amount ?? null,
              manage_inventory: v.manage_inventory !== false,
              allow_backorder: v.allow_backorder === true,
            },
          ]
        : []
    ),
    search_text: {
      strong: normalize([row.title, brand ?? "", ...categories.map((c) => c.name), ...tags].join(" ")),
      weak: normalize(
        [description, ingredients ?? "", row.handle.replace(/-/g, " "), ...(row.variants ?? []).map((v) => v?.title ?? "")].join(" ")
      ),
    },
  }
}

/** All published products with VND prices, cached for one minute (stock is never cached) */
export async function loadCatalog(container: MedusaContainer, now = Date.now()): Promise<CatalogProduct[]> {
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.products

  const region = await loadRegion(container)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "title",
      "description",
      "thumbnail",
      "created_at",
      "metadata",
      "tags.value",
      "categories.handle",
      "categories.name",
      "categories.is_active",
      "categories.is_internal",
      "sales_channels.id",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.manage_inventory",
      "variants.allow_backorder",
      "variants.calculated_price.calculated_amount",
      "variants.calculated_price.original_amount",
    ],
    filters: { status: "published" },
    context: {
      variants: { calculated_price: QueryContext({ region_id: region.id, currency_code: region.currency_code }) },
    },
  })

  const products = (data as unknown as ProductRow[]).map(toCatalogProduct)
  cache = { at: now, products }
  return products
}

/** Units that can be ordered per variant in the sales channel; Infinity when stock is not tracked */
export async function loadAvailability(
  container: MedusaContainer,
  variants: CatalogVariant[],
  salesChannelId: string | undefined
): Promise<Map<string, number>> {
  const result = new Map<string, number>()
  const tracked = variants.filter((v) => v.manage_inventory && !v.allow_backorder)
  for (const v of variants) {
    if (!tracked.includes(v)) result.set(v.id, Number.POSITIVE_INFINITY)
  }
  if (!tracked.length) return result
  if (!salesChannelId) {
    for (const v of tracked) result.set(v.id, 0)
    return result
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const availability = await getVariantAvailability(query, {
    variant_ids: tracked.map((v) => v.id),
    sales_channel_id: salesChannelId,
  })
  for (const v of tracked) {
    result.set(v.id, Math.max(0, availability[v.id]?.availability ?? 0))
  }
  return result
}

/** For tests: forget the cached catalog and region */
export function clearCatalogCache() {
  cache = null
  regionCache = null
}
