import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductTagsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  BESTSELLER_COLLECTION,
  CATEGORIES,
  PRODUCTS,
  ProductSeed,
} from "./data/catalog"

// Demo catalog: npx medusa exec ./src/scripts/seed-catalog.ts (run seed.ts first)
// Idempotent: existing categories, tags and products (matched by handle) are left untouched,
// so edits made in Admin survive a re-run.

const STOCK_LOCATION_NAME = "Kho TP.HCM"

// Tag convention shared with the storefront filters and Phase 2 recommendations
const TAG_VALUES: Record<string, string[]> = {
  species: ["cat", "dog"],
  life: ["kitten", "puppy", "adult", "senior", "all"],
  health: ["urinary", "hairball", "sensitive-stomach", "weight-control", "skin-coat", "dental", "sterilised"],
  free: ["chicken", "beef", "fish", "grain"],
  form: ["dry", "wet", "litter", "treat", "supplement", "accessory"],
}

function assertValidTag(tag: string, handle: string) {
  const [prefix, value] = tag.split(":")
  if (!TAG_VALUES[prefix]?.includes(value)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `Invalid tag "${tag}" on product "${handle}"`)
  }
}

function placeholderImage(brand: string) {
  const text = encodeURIComponent(brand)
  return `https://placehold.co/800x800/F4EBDD/F18926/png?text=${text}&font=raleway`
}

export default async function seedCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storeModule = container.resolve(Modules.STORE)
  const productModule = container.resolve(Modules.PRODUCT)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)
  const inventoryModule = container.resolve(Modules.INVENTORY)

  PRODUCTS.forEach((p) => p.tags.forEach((t) => assertValidTag(t, p.handle)))

  const [store] = await storeModule.listStores()
  const [stockLocation] = await stockLocationModule.listStockLocations({ name: STOCK_LOCATION_NAME })
  const [shippingProfile] = await fulfillmentModule.listShippingProfiles({ type: "default" })
  if (!store.default_sales_channel_id || !stockLocation || !shippingProfile) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Store setup is missing. Run `npx medusa exec ./src/scripts/seed.ts` first.")
  }

  // Categories: parents before children
  const categoryIds = new Map(
    (await productModule.listProductCategories({ handle: CATEGORIES.map((c) => c.handle) })).map((c) => [c.handle, c.id])
  )
  for (const level of [CATEGORIES.filter((c) => !c.parent), CATEGORIES.filter((c) => c.parent)]) {
    const missing = level.filter((c) => !categoryIds.has(c.handle))
    if (!missing.length) {
      continue
    }
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missing.map((c) => ({
          name: c.name,
          handle: c.handle,
          is_active: true,
          parent_category_id: c.parent ? categoryIds.get(c.parent) : null,
        })),
      },
    })
    result.forEach((c) => categoryIds.set(c.handle, c.id))
    logger.info(`Created categories: ${missing.map((c) => c.handle).join(", ")}`)
  }

  // Tags
  const tagValues = [...new Set(PRODUCTS.flatMap((p) => p.tags))]
  const tagIds = new Map(
    (await productModule.listProductTags({ value: tagValues })).map((t) => [t.value, t.id])
  )
  const missingTags = tagValues.filter((v) => !tagIds.has(v))
  if (missingTags.length) {
    const { result } = await createProductTagsWorkflow(container).run({
      input: { product_tags: missingTags.map((value) => ({ value })) },
    })
    result.forEach((t) => tagIds.set(t.value, t.id))
    logger.info(`Created ${missingTags.length} tags`)
  }

  // "Bán chạy" collection (shown on the home page; editable in Admin)
  let [collection] = await productModule.listProductCollections({ handle: BESTSELLER_COLLECTION.handle })
  if (!collection) {
    const { result } = await createCollectionsWorkflow(container).run({
      input: { collections: [BESTSELLER_COLLECTION] },
    })
    collection = result[0]
    logger.info(`Created collection "${BESTSELLER_COLLECTION.title}"`)
  }

  // Products
  const existingHandles = new Set(
    (await productModule.listProducts({ handle: PRODUCTS.map((p) => p.handle) })).map((p) => p.handle)
  )
  const newProducts = PRODUCTS.filter((p) => !existingHandles.has(p.handle))

  const toInput = (p: ProductSeed) => {
    const image = placeholderImage(p.brand)
    return {
      title: p.title,
      handle: p.handle,
      description: p.description,
      status: ProductStatus.PUBLISHED,
      thumbnail: image,
      images: [{ url: image }],
      category_ids: p.categories.map((handle) => categoryIds.get(handle)!),
      tag_ids: p.tags.map((value) => tagIds.get(value)!),
      collection_id: p.bestseller ? collection.id : null,
      shipping_profile_id: shippingProfile.id,
      sales_channels: [{ id: store.default_sales_channel_id! }],
      metadata: {
        brand: p.brand,
        ...(p.ingredients ? { ingredients: p.ingredients } : {}),
        ...(p.kcal_per_kg ? { kcal_per_kg: p.kcal_per_kg } : {}),
        ...(p.feeding_guide ? { feeding_guide: p.feeding_guide } : {}),
      },
      options: [{ title: p.option, values: p.variants.map((v) => v.value) }],
      variants: p.variants.map((v) => ({
        title: v.value,
        sku: v.sku,
        manage_inventory: true,
        allow_backorder: false,
        options: { [p.option]: v.value },
        prices: [{ currency_code: "vnd", amount: v.price }],
      })),
    }
  }

  if (newProducts.length) {
    await createProductsWorkflow(container).run({
      input: { products: newProducts.map(toInput) },
    })
    logger.info(`Created ${newProducts.length} products`)
  }
  if (existingHandles.size) {
    logger.info(`Skipped ${existingHandles.size} products that already exist`)
  }

  // Stock at Kho TP.HCM, only for inventory items that have no level there yet
  const stockBySku = new Map(PRODUCTS.flatMap((p) => p.variants.map((v) => [v.sku, v.stock] as const)))
  const inventoryItems = await inventoryModule.listInventoryItems({ sku: [...stockBySku.keys()] })
  const levels = await inventoryModule.listInventoryLevels({
    inventory_item_id: inventoryItems.map((i) => i.id),
    location_id: stockLocation.id,
  })
  const stocked = new Set(levels.map((l) => l.inventory_item_id))
  const missingLevels = inventoryItems
    .filter((i) => !stocked.has(i.id))
    .map((i) => ({
      inventory_item_id: i.id,
      location_id: stockLocation.id,
      stocked_quantity: stockBySku.get(i.sku!) ?? 0,
    }))

  if (missingLevels.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: missingLevels },
    })
    logger.info(`Set stock for ${missingLevels.length} variants at "${STOCK_LOCATION_NAME}"`)
  }

  logger.info(`Catalog ready: ${PRODUCTS.length} products in ${CATEGORIES.length} categories.`)
}
