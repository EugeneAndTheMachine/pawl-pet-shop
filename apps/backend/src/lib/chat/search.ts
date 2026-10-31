import { CatalogProduct, normalize } from "./catalog"

// Keyword + tag search over the catalog snapshot. Tags follow the `prefix:value` convention of seed-catalog.ts.

export const HEALTH_NEEDS = ["urinary", "hairball", "sensitive-stomach", "weight-control", "skin-coat", "dental", "sterilised"] as const
export const FREE_FROM = ["chicken", "beef", "fish", "grain"] as const
export const PRODUCT_TYPES = ["dry", "wet", "litter", "treat", "supplement", "accessory"] as const
export const LIFE_STAGES = ["kitten", "puppy", "adult", "senior"] as const

export type SearchFilters = {
  query?: string
  species?: "cat" | "dog"
  life_stage?: (typeof LIFE_STAGES)[number]
  health_needs?: (typeof HEALTH_NEEDS)[number][]
  free_from?: (typeof FREE_FROM)[number][]
  product_type?: (typeof PRODUCT_TYPES)[number]
  category_handle?: string
  max_price?: number
  sort?: "relevance" | "price_asc" | "price_desc" | "newest"
  limit?: number
}

const STOPWORDS = new Set(["a", "an", "and", "the", "for", "with", "of", "to", "in", "my", "some", "food", "product", "products", "best", "good"])

export function minPrice(p: CatalogProduct): number | null {
  const prices = p.variants.map((v) => v.price).filter((n): n is number => n != null)
  return prices.length ? Math.min(...prices) : null
}

function keywordScore(p: CatalogProduct, tokens: string[]): number {
  let score = 0
  for (const token of tokens) {
    const re = new RegExp(`(^|[\\s:-])${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`)
    if (re.test(p.search_text.strong)) score += 3
    else if (re.test(p.search_text.weak)) score += 1
  }
  return score
}

/**
 * Applies the hard filters (all must match), then ranks by keyword relevance.
 * "food" is not a keyword: "food" alone would match everything, use product_type instead.
 */
export function searchCatalog(products: CatalogProduct[], filters: SearchFilters, salesChannelId?: string) {
  const tokens = normalize(filters.query ?? "")
    .split(" ")
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))

  const has = (p: CatalogProduct, tag: string) => p.tags.includes(tag)

  const matches = products
    .filter((p) => !salesChannelId || p.sales_channel_ids.includes(salesChannelId))
    .filter((p) => !filters.species || has(p, `species:${filters.species}`))
    // A product for all ages suits every life stage
    .filter((p) => !filters.life_stage || has(p, `life:${filters.life_stage}`) || has(p, "life:all"))
    .filter((p) => (filters.health_needs ?? []).every((h) => has(p, `health:${h}`)))
    .filter((p) => (filters.free_from ?? []).every((f) => has(p, `free:${f}`)))
    .filter((p) => !filters.product_type || has(p, `form:${filters.product_type}`))
    .filter(
      (p) =>
        !filters.category_handle ||
        p.categories.some((c) => c.handle === filters.category_handle || c.handle.startsWith(`${filters.category_handle}-`))
    )
    .filter((p) => filters.max_price == null || (minPrice(p) ?? Number.POSITIVE_INFINITY) <= filters.max_price)
    .map((p) => ({ p, score: tokens.length ? keywordScore(p, tokens) : 0 }))
    .filter(({ score }) => !tokens.length || score > 0)

  const sort = filters.sort ?? "relevance"
  matches.sort((a, b) => {
    if (sort === "price_asc") return (minPrice(a.p) ?? Infinity) - (minPrice(b.p) ?? Infinity)
    if (sort === "price_desc") return (minPrice(b.p) ?? -Infinity) - (minPrice(a.p) ?? -Infinity)
    if (sort === "newest") return b.p.created_at.localeCompare(a.p.created_at)
    return b.score - a.score || a.p.title.localeCompare(b.p.title)
  })

  return { total: matches.length, products: matches.slice(0, filters.limit ?? 5).map((m) => m.p) }
}
