import { randomBytes } from "crypto"
import { formatVnpDate } from "./build-url"
import { hmacSha512 } from "./sign"

export type QueryDrInput = {
  apiUrl: string
  tmnCode: string
  hashSecret: string
  txnRef: string
  transactionDate: string // vnp_CreateDate of the original payment
  ipAddr: string
}

export type QueryDrResult = {
  responseCode: string // "00" = the query itself succeeded
  transactionStatus?: string // "00" = paid, "01" = pending, others = failed
  amount?: number // VND
  transactionNo?: string
  payDate?: string
  signatureValid: boolean
}

/** Server-to-server transaction lookup (vnp_Command=querydr). Throws on network errors. */
export async function queryTransaction(input: QueryDrInput): Promise<QueryDrResult> {
  const body = {
    vnp_RequestId: randomBytes(8).toString("hex"),
    vnp_Version: "2.1.0",
    vnp_Command: "querydr",
    vnp_TmnCode: input.tmnCode,
    vnp_TxnRef: input.txnRef,
    vnp_OrderInfo: `Truy van giao dich ${input.txnRef}`,
    vnp_TransactionDate: input.transactionDate,
    vnp_CreateDate: formatVnpDate(new Date()),
    vnp_IpAddr: input.ipAddr,
  }
  // querydr signs a pipe-separated list in a fixed order (not the sorted query string)
  const signData = [
    body.vnp_RequestId,
    body.vnp_Version,
    body.vnp_Command,
    body.vnp_TmnCode,
    body.vnp_TxnRef,
    body.vnp_TransactionDate,
    body.vnp_CreateDate,
    body.vnp_IpAddr,
    body.vnp_OrderInfo,
  ].join("|")

  const response = await fetch(input.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, vnp_SecureHash: hmacSha512(input.hashSecret, signData) }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) {
    throw new Error(`querydr HTTP ${response.status}`)
  }
  const r = (await response.json()) as Record<string, string | undefined>

  const responseSignData = [
    r.vnp_ResponseId, r.vnp_Command, r.vnp_ResponseCode, r.vnp_Message, r.vnp_TmnCode, r.vnp_TxnRef,
    r.vnp_Amount, r.vnp_BankCode, r.vnp_PayDate, r.vnp_TransactionNo, r.vnp_TransactionType,
    r.vnp_TransactionStatus, r.vnp_OrderInfo, r.vnp_PromotionCode, r.vnp_PromotionAmount,
  ].map((v) => v ?? "").join("|")
  const signatureValid =
    typeof r.vnp_SecureHash === "string" &&
    hmacSha512(input.hashSecret, responseSignData).toLowerCase() === r.vnp_SecureHash.toLowerCase()

  return {
    responseCode: r.vnp_ResponseCode ?? "99",
    transactionStatus: r.vnp_TransactionStatus,
    amount: r.vnp_Amount ? Number(r.vnp_Amount) / 100 : undefined,
    transactionNo: r.vnp_TransactionNo,
    payDate: r.vnp_PayDate,
    signatureValid,
  }
}
