import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { deleteInventoryItemWorkflow, deleteProductsWorkflow } from "@medusajs/medusa/core-flows"

// Clears every product, order and cart so the catalog can be re-seeded from scratch:
//   npx medusa exec ./src/scripts/clear-catalog-and-orders.ts confirm
//   npx medusa exec ./src/scripts/seed-catalog.ts
// Only for a shop that is not trading yet: orders, carts, payments, fulfillments and stock
// reservations are removed for good. Product photos uploaded to the bucket are deleted too.
// Keeps the store, region, shipping options, stock location, categories, collections, tags,
// customers, promotions and admin users.

export default async function clearCatalogAndOrders({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!args.includes("confirm")) {
    logger.warn(
      "This deletes ALL products, orders and carts. Run again with: npx medusa exec ./src/scripts/clear-catalog-and-orders.ts confirm"
    )
    return
  }

  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const orderModule = container.resolve(Modules.ORDER)
  const cartModule = container.resolve(Modules.CART)
  const paymentModule = container.resolve(Modules.PAYMENT)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const inventoryModule = container.resolve(Modules.INVENTORY)
  const productModule = container.resolve(Modules.PRODUCT)
  const fileModule = container.resolve(Modules.FILE)

  // Stock reservations held by open orders and carts (they block deleting inventory items)
  const reservations = await inventoryModule.listReservationItems({}, { select: ["id"] })
  if (reservations.length) {
    await inventoryModule.deleteReservationItems(reservations.map((r) => r.id))
    logger.info(`Deleted ${reservations.length} stock reservations`)
  }

  // Orders (items, summaries and transactions go with them) and their links
  const orders = await orderModule.listOrders({}, { select: ["id"] })
  const orderIds = orders.map((o) => o.id)
  if (orderIds.length) {
    await link.delete({ [Modules.ORDER]: { order_id: orderIds } })
    await orderModule.softDeleteOrders(orderIds)
    logger.info(`Deleted ${orderIds.length} orders`)
  }

  // A fulfillment must be canceled before it can be deleted, and shipped/delivered ones cannot be
  // canceled, so their shipping dates are cleared first (their orders are already gone)
  const fulfillments = await fulfillmentModule.listFulfillments({}, { select: ["id", "canceled_at", "shipped_at", "delivered_at"] })
  for (const f of fulfillments) {
    if (!f.canceled_at) {
      if (f.shipped_at || f.delivered_at) {
        await fulfillmentModule.updateFulfillment(f.id, { shipped_at: null, delivered_at: null })
      }
      await fulfillmentModule.cancelFulfillment(f.id)
    }
    await fulfillmentModule.deleteFulfillment(f.id)
  }
  if (fulfillments.length) {
    logger.info(`Deleted ${fulfillments.length} fulfillments`)
  }

  // Carts and their payment collections (sessions and payments go with them)
  const carts = await cartModule.listCarts({}, { select: ["id"] })
  const cartIds = carts.map((c) => c.id)
  if (cartIds.length) {
    await link.delete({ [Modules.CART]: { cart_id: cartIds } })
    await cartModule.softDeleteCarts(cartIds)
    logger.info(`Deleted ${cartIds.length} carts`)
  }

  const paymentCollections = await paymentModule.listPaymentCollections({}, { select: ["id"] })
  if (paymentCollections.length) {
    await paymentModule.deletePaymentCollections(paymentCollections.map((p) => p.id))
    logger.info(`Deleted ${paymentCollections.length} payment collections`)
  }

  // Products, plus the photos they had in the bucket
  const products = await productModule.listProducts({}, { select: ["id", "thumbnail"], relations: ["images"] })
  const fileUrl = process.env.S3_FILE_URL?.replace(/\/+$/, "")
  const fileKeys = fileUrl
    ? [...new Set(products.flatMap((p) => [p.thumbnail, ...(p.images ?? []).map((i) => i.url)]))]
        .filter((url): url is string => Boolean(url?.startsWith(`${fileUrl}/`)))
        .map((url) => decodeURIComponent(url.slice(fileUrl.length + 1)))
    : []

  if (products.length) {
    await deleteProductsWorkflow(container).run({ input: { ids: products.map((p) => p.id) } })
    logger.info(`Deleted ${products.length} products`)
  }

  // Inventory items no longer attached to any variant
  const inventoryItems = await inventoryModule.listInventoryItems({}, { select: ["id"] })
  if (inventoryItems.length) {
    await deleteInventoryItemWorkflow(container).run({ input: inventoryItems.map((i) => i.id) })
    logger.info(`Deleted ${inventoryItems.length} inventory items`)
  }

  if (fileKeys.length) {
    try {
      await fileModule.deleteFiles(fileKeys)
      logger.info(`Deleted ${fileKeys.length} product images from storage`)
    } catch (e) {
      logger.warn(`Could not delete old product images from storage: ${(e as Error).message}`)
    }
  }

  logger.info("Catalog and orders cleared. Now run seed-catalog.ts.")
}
