import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { processVnpayResult } from "../../../../modules/vnpay/lib/result"
import type { VnpParams } from "../../../../modules/vnpay/lib/sign"

/**
 * GET /hooks/vnpay/ipn: VNPay's server-to-server notification (VNPay uses GET, so Medusa's POST
 * webhook route cannot be used). Responds with VNPay's RspCode contract and is idempotent.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const params = (req.validatedQuery ?? req.query) as VnpParams
    const result = await processVnpayResult(req.scope, params)

    if (!result.valid) return res.json({ RspCode: "97", Message: "Invalid signature" })
    if (!result.lookup?.session) return res.json({ RspCode: "01", Message: "Order not found" })
    if (result.lookup.completed) return res.json({ RspCode: "02", Message: "Order already confirmed" })
    if (!result.amountMatches) return res.json({ RspCode: "04", Message: "Invalid amount" })

    // The shopper may have closed the browser before reaching the result page: complete the cart here
    if (result.success) {
      await completeCartWorkflow(req.scope).run({ input: { id: result.lookup.cartId } })
      logger.info(`[vnpay] IPN completed cart ${result.lookup.cartId} for txn ${result.txnRef}`)
    }
    // A failed payment is still acknowledged: the result was received and recorded
    return res.json({ RspCode: "00", Message: "Confirm Success" })
  } catch (error) {
    logger.error(`[vnpay] IPN error: ${(error as Error).message}`)
    return res.json({ RspCode: "99", Message: "Unknown error" })
  }
}
