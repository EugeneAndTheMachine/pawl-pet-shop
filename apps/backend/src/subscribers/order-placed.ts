import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const vnd = new Intl.NumberFormat("en-US", { style: "currency", currency: "VND", maximumFractionDigits: 0 })

// Sends the order confirmation email through the notification module (the local provider prints it)
export default async function orderPlacedHandler({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModule = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "total", "items.title", "items.variant_title", "items.quantity", "shipping_address.*", "shipping_methods.name"],
    filters: { id: data.id },
  })
  if (!order?.email) return

  const lines = (order.items ?? []).map((i) => `${i?.quantity} x ${i?.title}${i?.variant_title ? ` (${i.variant_title})` : ""}`)
  logger.info(`[order] #${order.display_id} placed by ${order.email}, total ${vnd.format(Number(order.total))}`)

  await notificationModule.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-placed",
    data: {
      subject: `Pawl order #${order.display_id} confirmed`,
      display_id: order.display_id,
      total: vnd.format(Number(order.total)),
      items: lines,
      shipping_method: order.shipping_methods?.[0]?.name,
      ship_to: order.shipping_address
        ? `${order.shipping_address.address_1}, ${order.shipping_address.city}, ${order.shipping_address.province}`
        : undefined,
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
