import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { processVnpayResult } from "../../../../modules/vnpay/lib/result"
import { vnpayMessage } from "../../../../modules/vnpay/lib/response-codes"
import type { VnpParams } from "../../../../modules/vnpay/lib/sign"

/**
 * GET /store/vnpay/verify?vnp_...: called by the storefront with the query VNPay appended to the return URL.
 * Only checks the signature and records the result; the storefront completes the cart afterwards.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const params = (req.validatedQuery ?? req.query) as VnpParams
  const result = await processVnpayResult(req.scope, params)

  const message = !result.valid
    ? "The payment result could not be verified."
    : result.responseCode === "00" && !result.amountMatches
      ? "The paid amount does not match your order. Please contact support."
      : vnpayMessage(result.responseCode)

  res.json({
    valid: result.valid,
    success: result.success,
    txn_ref: result.txnRef,
    response_code: result.responseCode,
    message,
    cart_id: result.lookup?.cartId ?? null,
    // Set when the IPN already turned the cart into an order
    order_id: result.lookup?.orderId ?? null,
  })
}
