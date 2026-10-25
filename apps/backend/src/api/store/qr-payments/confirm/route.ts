import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { confirmQrPayment } from "../../../../modules/qr-payment/lib/confirm"
import type { QrConfirmBody } from "../../../middlewares"

const HTTP_STATUS = { paid: 200, not_found: 404, expired: 410, failed: 409 } as const

/**
 * POST /store/qr-payments/confirm { cart_id, reference }: SIMULATED bank confirmation of a QR transfer.
 * Marks the payment session as paid and creates the order (see modules/qr-payment/lib/confirm.ts).
 */
export async function POST(req: MedusaRequest<QrConfirmBody>, res: MedusaResponse) {
  const { cart_id, reference } = req.validatedBody
  const result = await confirmQrPayment(req.scope, cart_id, reference)

  if (result.status === "paid") {
    res.json({ status: "paid", order_id: result.orderId })
    return
  }
  res.status(HTTP_STATUS[result.status]).json({ status: result.status, message: result.message })
}
