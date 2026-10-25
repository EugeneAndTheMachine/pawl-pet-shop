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
import { buildPaymentUrl, createTxnRef } from "./lib/build-url"
import { queryTransaction } from "./lib/querydr"

export type VnpayOptions = {
  tmnCode?: string
  hashSecret?: string
  payUrl: string
  apiUrl: string
  returnUrl: string
}

/** Data stored on the payment session. The verify/IPN routes add the vnp_* result fields. */
export type VnpaySessionData = {
  txn_ref: string
  create_date: string
  payment_url: string
  amount: number
  cart_id: string
  vnp_verified?: boolean
  vnp_response_code?: string
  vnp_transaction_no?: string
  vnp_amount?: number
}

// The provider has no access to the shopper's request; VNPay only uses this for its own records
const SERVER_IP = "127.0.0.1"

function toVnd(amount: InitiatePaymentInput["amount"]): number {
  return Math.round(new BigNumber(amount).numeric)
}

class VnpayProviderService extends AbstractPaymentProvider<VnpayOptions> {
  static identifier = "vnpay"

  protected logger_: Logger
  protected options_: VnpayOptions

  constructor(container: { logger: Logger }, options: VnpayOptions) {
    super(container, options)
    this.logger_ = container.logger
    this.options_ = options
  }

  private credentials() {
    const { tmnCode, hashSecret } = this.options_
    if (!tmnCode || !hashSecret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "VNPay is not configured: set VNP_TMN_CODE and VNP_HASH_SECRET in apps/backend/.env"
      )
    }
    return { tmnCode, hashSecret }
  }

  private createSession(cartId: string, amount: number): VnpaySessionData {
    const { tmnCode, hashSecret } = this.credentials()
    const txnRef = createTxnRef(cartId)
    const { url, createDate } = buildPaymentUrl({
      payUrl: this.options_.payUrl,
      tmnCode,
      hashSecret,
      returnUrl: this.options_.returnUrl,
      amount,
      txnRef,
      ipAddr: SERVER_IP,
    })
    this.logger_.info(`[vnpay] created txn ${txnRef} amount=${amount} VND at ${createDate}`)
    return { txn_ref: txnRef, create_date: createDate, payment_url: url, amount, cart_id: cartId }
  }

  async initiatePayment({ amount, data }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const cartId = data?.cart_id
    if (typeof cartId !== "string") {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "VNPay requires data.cart_id when initiating a payment session")
    }
    const session = this.createSession(cartId, toVnd(amount))
    return { id: session.txn_ref, data: session, status: "pending" }
  }

  /** The cart total changed: issue a new payment URL. Otherwise keep the data (e.g. result flags from the verify route). */
  async updatePayment({ amount, data }: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    const current = data as VnpaySessionData | undefined
    const vnd = toVnd(amount)
    if (current?.cart_id && current.amount !== vnd && !current.vnp_verified) {
      return { data: this.createSession(current.cart_id, vnd), status: "pending" }
    }
    return { data }
  }

  /**
   * Called by cart completion. Confirms the payment on the server:
   * A) querydr against VNPay; B) fallback to the signed result recorded by the verify/IPN routes.
   */
  async authorizePayment({ data }: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const session = data as VnpaySessionData
    const { tmnCode, hashSecret } = this.credentials()

    try {
      const result = await queryTransaction({
        apiUrl: this.options_.apiUrl,
        tmnCode,
        hashSecret,
        txnRef: session.txn_ref,
        transactionDate: session.create_date,
        ipAddr: SERVER_IP,
      })
      this.logger_.info(
        `[vnpay] querydr ${session.txn_ref}: response=${result.responseCode} status=${result.transactionStatus ?? "-"} amount=${result.amount ?? "-"}`
      )
      if (result.responseCode === "00" && result.signatureValid) {
        if (result.transactionStatus === "00" && result.amount === session.amount) {
          return {
            status: "captured",
            data: { ...session, vnp_verified: true, vnp_response_code: "00", vnp_transaction_no: result.transactionNo, verified_by: "querydr" },
          }
        }
        if (result.transactionStatus === "01") {
          return { status: "pending", data: session }
        }
        return { status: "error", data: session }
      }
    } catch (error) {
      this.logger_.warn(`[vnpay] querydr unavailable for ${session.txn_ref}, using the verified return result: ${(error as Error).message}`)
    }

    if (session.vnp_verified && session.vnp_response_code === "00" && session.vnp_amount === session.amount) {
      return { status: "captured", data: { ...session, verified_by: "return_url" } }
    }
    return { status: "pending", data: session }
  }

  // VNPay charges immediately, so an authorized payment is already captured
  async capturePayment({ data }: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data }
  }

  // Phase 1: refunds are simulated (logged only); a real refund would call vnp_Command=refund
  async refundPayment({ data, amount }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const session = data as VnpaySessionData
    this.logger_.info(`[vnpay] simulated refund for ${session?.txn_ref}: ${toVnd(amount)} VND`)
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
    const session = data as VnpaySessionData | undefined
    return { status: session?.vnp_verified && session.vnp_response_code === "00" ? "captured" : "pending", data }
  }

  // VNPay calls our own GET route (/hooks/vnpay/ipn) instead of Medusa's POST webhook endpoint
  async getWebhookActionAndData(_payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    return { action: PaymentActions.NOT_SUPPORTED }
  }
}

export default VnpayProviderService
