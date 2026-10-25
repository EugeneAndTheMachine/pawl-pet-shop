import { createHmac, timingSafeEqual } from "crypto"

// Signing rules from the VNPay Node.js sample: keep vnp_* params, drop the hash fields, sort keys,
// URL-encode keys and values (space -> "+"), join as key=value&..., then HMAC-SHA512 with the hash secret.

const HASH_FIELDS = new Set(["vnp_SecureHash", "vnp_SecureHashType"])

export type VnpParams = Record<string, string | number | undefined>

export function encodeVnp(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, "+")
}

export function buildSignData(params: VnpParams): string {
  return Object.keys(params)
    .filter((key) => key.startsWith("vnp_") && !HASH_FIELDS.has(key) && params[key] !== undefined)
    .sort()
    .map((key) => `${encodeVnp(key)}=${encodeVnp(String(params[key]))}`)
    .join("&")
}

export function hmacSha512(secret: string, data: string): string {
  return createHmac("sha512", secret).update(Buffer.from(data, "utf-8")).digest("hex")
}

export function signParams(params: VnpParams, secret: string): string {
  return hmacSha512(secret, buildSignData(params))
}

/** Case-insensitive, constant-time comparison of the received vnp_SecureHash */
export function verifySignature(params: VnpParams, secret: string): boolean {
  const received = params.vnp_SecureHash
  if (typeof received !== "string" || !/^[0-9a-fA-F]+$/.test(received)) {
    return false
  }
  const expected = signParams(params, secret)
  const a = Buffer.from(expected.toLowerCase(), "utf-8")
  const b = Buffer.from(received.toLowerCase(), "utf-8")
  return a.length === b.length && timingSafeEqual(a, b)
}
