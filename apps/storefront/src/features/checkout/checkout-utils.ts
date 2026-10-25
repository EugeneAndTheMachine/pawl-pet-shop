import type { HttpTypes } from '@medusajs/types'

export const VNPAY_PROVIDER = 'pp_vnpay_vnpay'
export const COD_PROVIDER = 'pp_system_default'

export type StepKey = 'contact' | 'address' | 'shipping' | 'payment' | 'review'
export const STEPS: StepKey[] = ['contact', 'address', 'shipping', 'payment', 'review']

export function contactPhone(cart: HttpTypes.StoreCart): string | undefined {
  const phone = cart.metadata?.contact_phone
  return typeof phone === 'string' ? phone : undefined
}

export function selectedProvider(cart: HttpTypes.StoreCart): string | undefined {
  return cart.payment_collection?.payment_sessions?.[0]?.provider_id
}

/** Which steps are complete, derived from the cart itself so a reload keeps the progress */
export function completedSteps(cart: HttpTypes.StoreCart): Record<Exclude<StepKey, 'review'>, boolean> {
  return {
    contact: Boolean(cart.email && contactPhone(cart)),
    address: Boolean(cart.shipping_address?.address_1 && cart.shipping_address.province),
    shipping: (cart.shipping_methods ?? []).length > 0,
    payment: Boolean(selectedProvider(cart)),
  }
}

export function firstIncompleteStep(cart: HttpTypes.StoreCart): StepKey {
  const done = completedSteps(cart)
  return (STEPS.find((s) => s !== 'review' && !done[s]) ?? 'review') as StepKey
}

export function vnpayPaymentUrl(cart: HttpTypes.StoreCart): string | undefined {
  const session = cart.payment_collection?.payment_sessions?.find((s) => s.provider_id === VNPAY_PROVIDER)
  const url = session?.data?.payment_url
  return typeof url === 'string' ? url : undefined
}
