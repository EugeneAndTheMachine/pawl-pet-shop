import type { HttpTypes } from '@medusajs/types'
import { sdk } from '../../lib/medusa'

const ORDER_FIELDS =
  '*items,*items.variant,*shipping_address,*shipping_methods,*payment_collections,*payment_collections.payments,*fulfillments,+original_item_total,+metadata'

export async function listOrders(limit: number, offset = 0): Promise<{ orders: HttpTypes.StoreOrder[]; count: number }> {
  const { orders, count } = await sdk.store.order.list({ limit, offset, order: '-created_at', fields: ORDER_FIELDS })
  return { orders, count }
}

export async function retrieveOrder(id: string): Promise<HttpTypes.StoreOrder> {
  const { order } = await sdk.store.order.retrieve(id, { fields: ORDER_FIELDS })
  return order
}
