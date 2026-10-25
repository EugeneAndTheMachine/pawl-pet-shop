import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  deleteCollectionsWorkflow,
  deleteInventoryItemWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductsWorkflow,
  deleteShippingOptionsWorkflow,
  deleteStockLocationsWorkflow,
} from "@medusajs/medusa/core-flows"
import { BESTSELLER_COLLECTION, CATEGORIES, PRODUCTS } from "./data/catalog"
import { FULFILLMENT_SET_NAME, STOCK_LOCATION_NAME } from "./seed"

// Removes the data created by seed.ts / seed-catalog.ts so they can be run again from scratch:
//   npx medusa exec ./src/scripts/reset-demo-data.ts confirm
// Keeps the store, region, tax region, publishable key, promotions, admin users, customers and orders.
// Products are matched by the seeded SKUs, so products created in Admin are not touched.

// Names and handles used by the first (Vietnamese) version of the seed
const LEGACY_CATEGORY_HANDLES = [
  "meo-thuc-an-hat", "meo-pate", "meo-cat-ve-sinh", "meo-snack", "meo-dinh-duong", "meo-phu-kien",
  "cho-thuc-an-hat", "cho-pate", "cho-snack", "cho-dinh-duong", "cho-phu-kien", "meo", "cho",
]
const LEGACY_COLLECTION_HANDLES = ["ban-chay"]
const LEGACY_STOCK_LOCATIONS = ["Kho TP.HCM"]
const LEGACY_FULFILLMENT_SETS = ["Kho TP.HCM – Giao hàng"]

export default async function resetDemoData({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!args.includes("confirm")) {
    logger.warn("This deletes the seeded demo catalog. Run again with: npx medusa exec ./src/scripts/reset-demo-data.ts confirm")
    return
  }

  const productModule = container.resolve(Modules.PRODUCT)
  const inventoryModule = container.resolve(Modules.INVENTORY)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)

  const skus = PRODUCTS.flatMap((p) => p.variants.map((v) => v.sku))

  // Products (their variants go with them)
  const variants = await productModule.listProductVariants({ sku: skus }, { select: ["id", "product_id"] })
  const productIds = [...new Set(variants.map((v) => v.product_id).filter((id): id is string => Boolean(id)))]
  if (productIds.length) {
    await deleteProductsWorkflow(container).run({ input: { ids: productIds } })
    logger.info(`Deleted ${productIds.length} products`)
  }

  // Inventory items left behind with the seeded SKUs
  const inventoryItems = await inventoryModule.listInventoryItems({ sku: skus })
  if (inventoryItems.length) {
    await deleteInventoryItemWorkflow(container).run({ input: inventoryItems.map((i) => i.id) })
    logger.info(`Deleted ${inventoryItems.length} inventory items`)
  }

  // Categories: children before parents
  const handles = [...LEGACY_CATEGORY_HANDLES, ...CATEGORIES.map((c) => c.handle)]
  const categories = await productModule.listProductCategories({ handle: handles }, { select: ["id", "parent_category_id"] })
  for (const level of [categories.filter((c) => c.parent_category_id), categories.filter((c) => !c.parent_category_id)]) {
    if (level.length) {
      await deleteProductCategoriesWorkflow(container).run({ input: level.map((c) => c.id) })
    }
  }
  if (categories.length) logger.info(`Deleted ${categories.length} categories`)

  const collections = await productModule.listProductCollections({ handle: [...LEGACY_COLLECTION_HANDLES, BESTSELLER_COLLECTION.handle] })
  if (collections.length) {
    await deleteCollectionsWorkflow(container).run({ input: { ids: collections.map((c) => c.id) } })
    logger.info(`Deleted ${collections.length} collections`)
  }

  // Shipping options, fulfillment sets and stock locations
  const fulfillmentSets = await fulfillmentModule.listFulfillmentSets(
    { name: [...LEGACY_FULFILLMENT_SETS, FULFILLMENT_SET_NAME] },
    { relations: ["service_zones", "service_zones.shipping_options"] }
  )
  const optionIds = fulfillmentSets.flatMap((s) => s.service_zones.flatMap((z) => z.shipping_options.map((o) => o.id)))
  if (optionIds.length) {
    await deleteShippingOptionsWorkflow(container).run({ input: { ids: optionIds } })
  }
  if (fulfillmentSets.length) {
    await fulfillmentModule.deleteFulfillmentSets(fulfillmentSets.map((s) => s.id))
    logger.info(`Deleted ${fulfillmentSets.length} fulfillment sets and ${optionIds.length} shipping options`)
  }

  const locations = await stockLocationModule.listStockLocations({ name: [...LEGACY_STOCK_LOCATIONS, STOCK_LOCATION_NAME] })
  if (locations.length) {
    await deleteStockLocationsWorkflow(container).run({ input: { ids: locations.map((l) => l.id) } })
    logger.info(`Deleted ${locations.length} stock locations`)
  }

  logger.info("Demo data removed. Now run seed.ts and seed-catalog.ts again.")
}
