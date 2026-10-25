import type { HttpTypes } from '@medusajs/types'
import { sdk } from '../../lib/medusa'
import { initiatePayment } from '../cart/api'
import { QR_PROVIDER } from './checkout-utils'

/**
 * Creates a fresh bank transfer (new reference, 15 minutes to pay) right before showing the QR code,
 * since the shopper may have spent a while on the review step.
 */
export function startQrPayment(cart: HttpTypes.StoreCart): Promise<HttpTypes.StoreCart> {
  return initiatePayment(cart, QR_PROVIDER)
}

/** Asks the backend to confirm the transfer; it creates the order when the payment is received */
export async function confirmQrPayment(cartId: string, reference: string): Promise<string> {
  const { order_id } = await sdk.client.fetch<{ status: 'paid'; order_id: string }>('/store/qr-payments/confirm', {
    method: 'POST',
    body: { cart_id: cartId, reference },
  })
  return order_id
}
