import { buildSignData, signParams, VnpParams } from "./sign"

const TIME_ZONE = "Asia/Ho_Chi_Minh"
export const PAYMENT_TTL_MINUTES = 15

/** yyyyMMddHHmmss in Vietnam time, the format VNPay expects for every date field */
export function formatVnpDate(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  )
  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`
}

/**
 * A unique, alphanumeric transaction reference that also encodes the cart:
 * the 26-char ULID of the cart id followed by a base36 timestamp.
 */
export function createTxnRef(cartId: string, now = Date.now()): string {
  const ulid = cartId.replace(/^cart_/, "")
  if (!/^[0-9A-Z]{26}$/.test(ulid)) {
    throw new Error(`Unexpected cart id format: ${cartId}`)
  }
  return `${ulid}${now.toString(36).toUpperCase()}`
}

export function cartIdFromTxnRef(txnRef: string): string | null {
  return /^[0-9A-Z]{27,}$/.test(txnRef) ? `cart_${txnRef.slice(0, 26)}` : null
}

export type PaymentUrlInput = {
  payUrl: string
  tmnCode: string
  hashSecret: string
  returnUrl: string
  amount: number // VND
  txnRef: string
  ipAddr: string
  locale?: "vn" | "en"
  now?: Date
}

export function buildPaymentUrl(input: PaymentUrlInput): { url: string; createDate: string; expireDate: string } {
  const now = input.now ?? new Date()
  const createDate = formatVnpDate(now)
  const expireDate = formatVnpDate(new Date(now.getTime() + PAYMENT_TTL_MINUTES * 60_000))

  const params: VnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: input.tmnCode,
    vnp_Amount: Math.round(input.amount) * 100,
    vnp_CurrCode: "VND",
    vnp_TxnRef: input.txnRef,
    vnp_OrderInfo: `Thanh toan don hang Pawl ${input.txnRef}`,
    vnp_OrderType: "other",
    vnp_Locale: input.locale ?? "vn",
    vnp_ReturnUrl: input.returnUrl,
    vnp_IpAddr: input.ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  }

  const query = buildSignData(params)
  const hash = signParams(params, input.hashSecret)
  return { url: `${input.payUrl}?${query}&vnp_SecureHash=${hash}`, createDate, expireDate }
}
