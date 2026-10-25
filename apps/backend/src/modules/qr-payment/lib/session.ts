import { randomBytes } from "crypto"

export const QR_PROVIDER_ID = "pp_qr_qr"
export const DEFAULT_EXPIRY_MINUTES = 15

// Transfer note the shopper types in their banking app: "PAWL" + 8 characters without look-alikes (0/O, 1/I)
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
export const REFERENCE_PATTERN = /^PAWL[2-9A-HJ-NP-Z]{8}$/

/** Data stored on the payment session. The confirm route adds the paid_* fields. */
export type QrSessionData = {
  reference: string
  amount: number // VND
  cart_id: string
  expires_at: string // ISO date
  paid_at?: string
  paid_amount?: number
  transaction_no?: string
}

export function createReference(): string {
  const bytes = randomBytes(8)
  return `PAWL${[...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("")}`
}

export function createSessionData(cartId: string, amount: number, expiryMinutes: number, now = new Date()): QrSessionData {
  return {
    reference: createReference(),
    amount,
    cart_id: cartId,
    expires_at: new Date(now.getTime() + expiryMinutes * 60_000).toISOString(),
  }
}

export function isExpired(data: Pick<QrSessionData, "expires_at">, now = new Date()): boolean {
  return now.getTime() > new Date(data.expires_at).getTime()
}

/** Paid in full: the simulated bank confirmation recorded exactly the session amount */
export function isPaid(data: Partial<QrSessionData> | undefined): boolean {
  return Boolean(data?.paid_at) && data?.paid_amount === data?.amount
}
