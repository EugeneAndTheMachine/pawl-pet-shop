import type { HttpTypes } from '@medusajs/types'
import { FetchError } from '@medusajs/js-sdk'
import { sdk } from '../../lib/medusa'

export const CART_FIELDS =
  '*items,*items.variant,+items.variant.inventory_quantity,+items.variant.manage_inventory,+items.variant.allow_backorder,' +
  '*promotions,*shipping_methods,*payment_collection,*payment_collection.payment_sessions,+original_item_total,+metadata'

const q = { fields: CART_FIELDS }

/** Returns null when the cart no longer exists or was already turned into an order */
export async function retrieveCart(cartId: string): Promise<HttpTypes.StoreCart | null> {
  try {
    const { cart } = await sdk.store.cart.retrieve(cartId, q)
    return cart.completed_at ? null : cart
  } catch (error) {
    if (error instanceof FetchError && error.status === 404) return null
    throw error
  }
}

/** Creating the cart together with its first items saves a whole round of cart workflows */
export async function createCart(regionId: string, lines: { variantId: string; quantity: number }[] = []): Promise<HttpTypes.StoreCart> {
  const items = lines.map((line) => ({ variant_id: line.variantId, quantity: line.quantity }))
  const { cart } = await sdk.store.cart.create({ region_id: regionId, ...(items.length ? { items } : {}) }, q)
  return cart
}

export async function addLineItem(cartId: string, variantId: string, quantity: number): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.createLineItem(cartId, { variant_id: variantId, quantity }, q)
  return cart
}

export async function updateLineItem(cartId: string, lineId: string, quantity: number): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.updateLineItem(cartId, lineId, { quantity }, q)
  return cart
}

export async function deleteLineItem(cartId: string, lineId: string): Promise<HttpTypes.StoreCart | null> {
  await sdk.store.cart.deleteLineItem(cartId, lineId)
  return retrieveCart(cartId)
}

export async function updateCart(cartId: string, body: HttpTypes.StoreUpdateCart): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.update(cartId, body, q)
  return cart
}

export async function applyPromoCode(cartId: string, code: string): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.addPromotions(cartId, { promo_codes: [code] }, q)
  return cart
}

export async function removePromoCode(cartId: string, code: string): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.removePromotions(cartId, { promo_codes: [code] }, q)
  return cart
}

export async function listShippingOptions(cartId: string): Promise<HttpTypes.StoreCartShippingOption[]> {
  const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cartId })
  return shipping_options
}

export async function setShippingMethod(cartId: string, optionId: string): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.addShippingMethod(cartId, { option_id: optionId }, q)
  return cart
}

export async function listPaymentProviders(regionId: string): Promise<HttpTypes.StorePaymentProvider[]> {
  const { payment_providers } = await sdk.store.payment.listPaymentProviders({ region_id: regionId })
  return payment_providers
}

/** Creates (or replaces) the cart's payment session for a provider and returns the refreshed cart */
export async function initiatePayment(cart: HttpTypes.StoreCart, providerId: string): Promise<HttpTypes.StoreCart> {
  await sdk.store.payment.initiatePaymentSession(cart, { provider_id: providerId, data: { cart_id: cart.id } })
  const fresh = await retrieveCart(cart.id)
  if (!fresh) throw new Error('Cart not found')
  return fresh
}

export type CompleteResult = { type: 'order'; order: HttpTypes.StoreOrder } | { type: 'cart'; cart: HttpTypes.StoreCart; message: string }

export async function completeCart(cartId: string): Promise<CompleteResult> {
  const result = await sdk.store.cart.complete(cartId)
  if (result.type === 'order') return { type: 'order', order: result.order }
  return { type: 'cart', cart: result.cart, message: result.error?.message ?? 'The order could not be placed.' }
}

export async function transferCart(cartId: string): Promise<HttpTypes.StoreCart> {
  const { cart } = await sdk.store.cart.transferCart(cartId, q)
  return cart
}
