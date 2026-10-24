import type { HttpTypes } from '@medusajs/types'
import { FetchError } from '@medusajs/js-sdk'
import { sdk } from '../../lib/medusa'

const CART_FIELDS = '*items,*items.variant,+items.variant.inventory_quantity,+items.variant.manage_inventory,+items.variant.allow_backorder'

/** Returns null when the cart no longer exists or was already turned into an order */
export async function retrieveCart(cartId: string): Promise<HttpTypes.StoreCart | null> {
  try {
    const { cart } = await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS })
    return cart.completed_at ? null : cart
  } catch (error) {
    if (error instanceof FetchError && error.status === 404) return null
    throw error
  }
}

export async function createCart(regionId: string): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.create({ region_id: regionId }, { fields: CART_FIELDS })
  return cart
}

export async function addLineItem(cartId: string, variantId: string, quantity: number): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.createLineItem(cartId, { variant_id: variantId, quantity }, { fields: CART_FIELDS })
  return cart
}

export async function updateLineItem(cartId: string, lineId: string, quantity: number): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.updateLineItem(cartId, lineId, { quantity }, { fields: CART_FIELDS })
  return cart
}

export async function deleteLineItem(cartId: string, lineId: string): Promise<HttpTypes.StoreCart | null> {
  await sdk.store.cart.deleteLineItem(cartId, lineId)
  return retrieveCart(cartId)
}
