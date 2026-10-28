import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import { AbstractPaymentProvider, BigNumber, MedusaError, PaymentActions } from "@medusajs/framework/utils"
import { createSessionData, DEFAULT_EXPIRY_MINUTES, isPaid, QrSessionData } from "./lib/session"

export type QrPaymentOptions = {
  expiryMinutes?: number
}

function toVnd(amount: InitiatePaymentInput["amount"]): number {
  return Math.round(new BigNumber(amount).numeric)
}

/**
 * SIMULATED online payment by bank transfer (QR code). No bank or payment gateway is called:
 * the storefront shows a static QR code and POST /store/qr-payments/confirm plays the role of the
 * bank notifying Pawl that the transfer arrived. See apps/implementation.md "Thanh toán".
 */
class QrPaymentProviderService extends AbstractPaymentProvider<QrPaymentOptions> {
  static identifier = "qr"

  protected logger_: Logger
  protected expiryMinutes_: number

  constructor(container: { logger: Logger }, options: QrPaymentOptions) {
    super(container, options)
    this.logger_ = container.logger
    this.expiryMinutes_ = options?.expiryMinutes ?? DEFAULT_EXPIRY_MINUTES
  }

  private createSession(cartId: string, amount: number): QrSessionData {
    const data = createSessionData(cartId, amount, this.expiryMinutes_)
    this.logger_.info(`[qr-payment] awaiting transfer ${data.reference} amount=${amount} VND until ${data.expires_at}`)
    return data
  }

  async initiatePayment({ amount, data }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const cartId = data?.cart_id
    if (typeof cartId !== "string") {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "QR payment requires data.cart_id when initiating a payment session")
    }
    const session = this.createSession(cartId, toVnd(amount))
    return { id: session.reference, data: session, status: "pending" }
  }

  /** The cart total changed before payment: issue a new reference for the new amount */
  async updatePayment({ amount, data }: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const current = data as QrSessionData | undefined
    const vnd = toVnd(amount)
    if (current?.cart_id && current.amount !== vnd && !isPaid(current)) {
      return { data: this.createSession(current.cart_id, vnd), status: "pending" }
    }
    return { data }
  }

  /** Called by cart completion: only a session the confirm route marked as paid in full is accepted */
  async authorizePayment({ data }: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const session = data as QrSessionData
    if (isPaid(session)) {
      // The money is already received, so the payment is captured right away (Admin shows "Paid")
      return { status: "captured", data: session }
    }
    return { status: "pending", data: session }
  }

  async capturePayment({ data }: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data }
  }

  // Simulated: a real integration would send the money back through the bank
  async refundPayment({ data, amount }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const session = data as QrSessionData
    this.logger_.info(`[qr-payment] simulated refund for ${session?.reference}: ${toVnd(amount)} VND`)
    return { data: { ...session, simulated_refund: true } }
  }

  async cancelPayment({ data }: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data }
  }

  async deletePayment({ data }: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data }
  }

  async retrievePayment({ data }: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data }
  }

  async getPaymentStatus({ data }: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    return { status: isPaid(data as QrSessionData | undefined) ? "captured" : "pending", data }
  }

  // Payment confirmations arrive through /store/qr-payments/confirm, not Medusa's webhook route
  async getWebhookActionAndData(_payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    return { action: PaymentActions.NOT_SUPPORTED }
  }
}

export default QrPaymentProviderService
