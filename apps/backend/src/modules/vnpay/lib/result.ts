import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { findVnpayTransaction, VnpayLookup } from "./lookup"
import { verifySignature, VnpParams } from "./sign"

export type VnpayResult = {
  valid: boolean
  success: boolean
  amountMatches: boolean
  txnRef: string
  responseCode: string
  lookup: VnpayLookup | null
}

/**
 * Shared by the return-URL verify route and the IPN route: checks the signature, finds the session,
 * compares the amount and, for a successful payment, records the signed result on the session so
 * authorizePayment can use it when querydr is unavailable.
 */
export async function processVnpayResult(container: MedusaContainer, params: VnpParams): Promise<VnpayResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const hashSecret = process.env.VNP_HASH_SECRET ?? ""
  const txnRef = String(params.vnp_TxnRef ?? "")
  const responseCode = String(params.vnp_ResponseCode ?? "99")
  const transactionStatus = String(params.vnp_TransactionStatus ?? "")
  const amount = Number(params.vnp_Amount ?? 0) / 100

  const valid = Boolean(hashSecret) && verifySignature(params, hashSecret)
  if (!valid) {
    logger.warn(`[vnpay] invalid signature for txn ${txnRef}`)
    return { valid, success: false, amountMatches: false, txnRef, responseCode, lookup: null }
  }

  const lookup = await findVnpayTransaction(container, txnRef)
  const amountMatches = Boolean(lookup?.session && lookup.session.amount === amount)
  const success = responseCode === "00" && transactionStatus === "00" && amountMatches

  logger.info(`[vnpay] result txn=${txnRef} amount=${amount} response=${responseCode} status=${transactionStatus} matched=${amountMatches}`)

  if (success && lookup?.session && !lookup.session.data.vnp_verified) {
    const paymentModule = container.resolve(Modules.PAYMENT)
    await paymentModule.updatePaymentSession({
      id: lookup.session.id,
      amount: lookup.session.amount,
      currency_code: lookup.session.currency_code,
      data: {
        ...lookup.session.data,
        vnp_verified: true,
        vnp_response_code: responseCode,
        vnp_transaction_no: String(params.vnp_TransactionNo ?? ""),
        vnp_amount: amount,
      },
    })
  }

  return { valid, success, amountMatches, txnRef, responseCode, lookup }
}
