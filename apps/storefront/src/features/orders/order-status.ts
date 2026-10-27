import type { HttpTypes } from '@medusajs/types'
import { COD_PROVIDER } from '../checkout/checkout-utils'

type Tone = 'success' | 'warning' | 'danger' | 'neutral'

const PAYMENT: Record<string, { label: string; tone: Tone }> = {
  captured: { label: 'Paid', tone: 'success' },
  partially_captured: { label: 'Partly paid', tone: 'warning' },
  authorized: { label: 'Pay on delivery', tone: 'warning' },
  partially_authorized: { label: 'Pay on delivery', tone: 'warning' },
  awaiting: { label: 'Awaiting payment', tone: 'warning' },
  not_paid: { label: 'Not paid', tone: 'neutral' },
  requires_action: { label: 'Action required', tone: 'danger' },
  partially_refunded: { label: 'Partly refunded', tone: 'neutral' },
  refunded: { label: 'Refunded', tone: 'neutral' },
  canceled: { label: 'Cancelled', tone: 'danger' },
}

const FULFILLMENT: Record<string, { label: string; tone: Tone }> = {
  not_fulfilled: { label: 'Processing', tone: 'neutral' },
  partially_fulfilled: { label: 'Packing', tone: 'warning' },
  fulfilled: { label: 'Packed', tone: 'warning' },
  partially_shipped: { label: 'Partly shipped', tone: 'warning' },
  shipped: { label: 'Shipped', tone: 'success' },
  partially_delivered: { label: 'Partly delivered', tone: 'success' },
  delivered: { label: 'Delivered', tone: 'success' },
  canceled: { label: 'Cancelled', tone: 'danger' },
}

export const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-brand-soft text-brand-deep',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-accent-soft text-accent-dark',
}

export function paymentStatus(order: Pick<HttpTypes.StoreOrder, 'payment_status'>) {
  return PAYMENT[order.payment_status] ?? { label: order.payment_status, tone: 'neutral' as Tone }
}

export function fulfillmentStatus(order: Pick<HttpTypes.StoreOrder, 'fulfillment_status' | 'status'>) {
  if (order.status === 'canceled') return FULFILLMENT.canceled
  return FULFILLMENT[order.fulfillment_status] ?? { label: order.fulfillment_status, tone: 'neutral' as Tone }
}

export function paymentMethodLabel(providerId: string | undefined | null): string {
  if (!providerId) return 'Not selected'
  if (providerId === 'pp_qr_qr') return 'Bank transfer (QR)'
  if (providerId === 'pp_system_default') return 'Cash on delivery (COD)'
  return providerId
}

export function orderPaymentProvider(order: HttpTypes.StoreOrder): string | undefined {
  const collection = order.payment_collections?.[0]
  return collection?.payments?.[0]?.provider_id ?? collection?.payment_sessions?.[0]?.provider_id
}

export type OrderStep = { label: string; at: string | Date | null | undefined; done: boolean }

/** Placed → (paid) → packed → shipped → delivered; cash orders are paid last, on delivery */
export function orderSteps(order: HttpTypes.StoreOrder): OrderStep[] {
  const fulfillment = order.fulfillments?.[0]
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const paid = { label: 'Payment received', at: payment?.captured_at, done: Boolean(payment?.captured_at) || order.payment_status === 'captured' }
  const isCod = orderPaymentProvider(order) === COD_PROVIDER

  const steps: OrderStep[] = [
    { label: 'Order placed', at: order.created_at, done: true },
    ...(isCod ? [] : [paid]),
    { label: 'Packed', at: fulfillment?.packed_at, done: Boolean(fulfillment?.packed_at) },
    { label: 'Shipped', at: fulfillment?.shipped_at, done: Boolean(fulfillment?.shipped_at) },
    { label: 'Delivered', at: fulfillment?.delivered_at, done: Boolean(fulfillment?.delivered_at) },
    ...(isCod ? [{ ...paid, label: 'Paid in cash' }] : []),
  ]
  return steps
}
