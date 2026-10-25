import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { isExpired, isPaid, QR_PROVIDER_ID, QrSessionData } from "./session"

export type ConfirmResult =
  | { status: "paid"; orderId: string }
  | { status: "not_found" | "expired" | "failed"; message: string }

type CartRow = {
  completed_at?: string | Date | null
  order?: { id: string } | null
  payment_collection?: {
    payment_sessions?: ({ id: string; provider_id: string; amount: unknown; currency_code: string; data: Record<string, unknown> | null } | null)[]
  } | null
}

async function loadCart(container: MedusaContainer, cartId: string): Promise<CartRow | undefined> {
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
  return data[0] as CartRow | undefined
}

/**
 * SIMULATED bank confirmation for a QR transfer. In a real integration the bank (or a payment
 * gateway) would call Pawl with a signed notification; here the storefront calls it when the shopper
 * says the transfer is done. It records the payment on the session, then turns the cart into an order.
 * Idempotent: confirming an already completed cart returns the same order.
 */
export async function confirmQrPayment(container: MedusaContainer, cartId: string, reference: string, now = new Date()): Promise<ConfirmResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const cart = await loadCart(container, cartId)
  const session = (cart?.payment_collection?.payment_sessions ?? []).find(
    (s) => s?.provider_id === QR_PROVIDER_ID && s.data?.reference === reference
  )
  if (!cart || !session) {
    logger.warn(`[qr-payment] confirm ${reference}: no matching payment session`)
    return { status: "not_found", message: "This payment could not be found. Please start the payment again." }
  }
  if (cart.order?.id) {
    return { status: "paid", orderId: cart.order.id }
  }

  const data = session.data as unknown as QrSessionData
  if (!isPaid(data)) {
    if (isExpired(data, now)) {
      logger.info(`[qr-payment] confirm ${reference}: expired at ${data.expires_at}`)
      return { status: "expired", message: "This QR code has expired. Please get a new one and try again." }
    }
    const paymentModule = container.resolve(Modules.PAYMENT)
    await paymentModule.updatePaymentSession({
      id: session.id,
      amount: Number(session.amount),
      currency_code: session.currency_code,
      data: {
        ...data,
        paid_at: now.toISOString(),
        paid_amount: Number(session.amount),
        transaction_no: `SIM${now.getTime()}`,
      },
    })
    logger.info(`[qr-payment] received ${reference} amount=${Number(session.amount)} VND at ${now.toISOString()} (simulated)`)
  }

  try {
    const { result } = await completeCartWorkflow(container).run({ input: { id: cartId } })
    logger.info(`[qr-payment] cart ${cartId} completed as order ${result.id}`)
    return { status: "paid", orderId: result.id }
  } catch (error) {
    // A second click may have completed the cart at the same moment
    const again = await loadCart(container, cartId)
    if (again?.order?.id) return { status: "paid", orderId: again.order.id }
    logger.error(`[qr-payment] payment ${reference} received but the order failed: ${(error as Error).message}`)
    const stock = /inventory|stock/i.test((error as Error).message)
    return {
      status: "failed",
      message: stock
        ? "Some items went out of stock before your order was created. Please contact us for a refund."
        : "Your payment was received but we could not create the order. Please contact us.",
    }
  }
}
