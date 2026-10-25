import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { cartIdFromTxnRef } from "./build-url"

export const VNPAY_PROVIDER_ID = "pp_vnpay_vnpay"

export type VnpayLookup = {
  cartId: string
  completed: boolean
  orderId?: string
  session?: {
    id: string
    amount: number
    currency_code: string
    data: Record<string, unknown>
  }
}

/** Finds the cart and VNPay payment session behind a vnp_TxnRef (the ref encodes the cart id). */
export async function findVnpayTransaction(container: MedusaContainer, txnRef: string): Promise<VnpayLookup | null> {
  const cartId = cartIdFromTxnRef(txnRef)
  if (!cartId) return null

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "completed_at",
      "order.id",
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.amount",
      "payment_collection.payment_sessions.currency_code",
      "payment_collection.payment_sessions.data",
    ],
    filters: { id: cartId },
  })
  const cart = data[0] as
    | {
        completed_at?: string | Date | null
        order?: { id: string } | null
        payment_collection?: { payment_sessions?: ({ id: string; provider_id: string; amount: unknown; currency_code: string; data: Record<string, unknown> | null } | null)[] } | null
      }
    | undefined
  if (!cart) return null

  const session = (cart.payment_collection?.payment_sessions ?? []).find(
    (s) => s?.provider_id === VNPAY_PROVIDER_ID && s.data?.txn_ref === txnRef
  )

  return {
    cartId,
    completed: Boolean(cart.completed_at || cart.order?.id),
    orderId: cart.order?.id,
    session: session
      ? { id: session.id, amount: Number(session.amount), currency_code: session.currency_code, data: session.data ?? {} }
      : undefined,
  }
}
