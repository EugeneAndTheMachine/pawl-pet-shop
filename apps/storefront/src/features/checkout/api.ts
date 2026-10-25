import type { HttpTypes } from '@medusajs/types'
import { sdk } from '../../lib/medusa'
import { completeCart, initiatePayment } from '../cart/api'
import { VNPAY_PROVIDER, vnpayPaymentUrl } from './checkout-utils'

/** Response of GET /store/vnpay/verify (see apps/backend/src/api/store/vnpay/verify/route.ts) */
export type VnpayVerifyResult = {
  valid: boolean
  success: boolean
  txn_ref: string
  response_code: string
  message: string
  cart_id: string | null
  order_id: string | null
}

export type VnpayOutcome =
  | { status: 'paid'; orderId: string; cartId: string | null }
  | { status: 'failed'; message: string; txnRef: string; cartId: string | null }

export function verifyVnpayReturn(search: URLSearchParams): Promise<VnpayVerifyResult> {
  // Only the vnp_* parameters VNPay appended to the return URL are signed and accepted by the backend
  const query = Object.fromEntries([...search.entries()].filter(([key]) => key.startsWith('vnp_')))
  return sdk.client.fetch<VnpayVerifyResult>('/store/vnpay/verify', { query })
}

/**
 * Creates a fresh VNPay session right before redirecting: a payment URL expires 15 minutes after it is
 * created, and the shopper may have spent longer on the review step.
 */
export async function startVnpayPayment(cart: HttpTypes.StoreCart): Promise<string> {
  const url = vnpayPaymentUrl(await initiatePayment(cart, VNPAY_PROVIDER))
  if (!url) throw new Error('VNPay did not return a payment URL')
  return url
}

/** Verifies the VNPay return on the server, then completes the cart unless the IPN already did */
export async function finishVnpayPayment(search: URLSearchParams): Promise<VnpayOutcome> {
  const result = await verifyVnpayReturn(search)
  const failed = (message: string): VnpayOutcome => ({ status: 'failed', message, txnRef: result.txn_ref, cartId: result.cart_id })

  if (!result.valid || !result.success) return failed(result.message)
  if (result.order_id) return { status: 'paid', orderId: result.order_id, cartId: result.cart_id }
  if (!result.cart_id) return failed('We could not find the cart for this payment. Please contact us.')

  try {
    const completed = await completeCart(result.cart_id)
    if (completed.type === 'order') return { status: 'paid', orderId: completed.order.id, cartId: result.cart_id }
  } catch {
    // Checked below: the IPN may have completed the cart at the same moment
  }
  const again = await verifyVnpayReturn(search)
  if (again.order_id) return { status: 'paid', orderId: again.order_id, cartId: result.cart_id }
  return failed(`Your payment was received but we could not create the order. Please contact us with reference ${result.txn_ref}.`)
}
