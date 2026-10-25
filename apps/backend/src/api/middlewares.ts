import { defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { REFERENCE_PATTERN } from "../modules/qr-payment/lib/session"

export const QrConfirmSchema = z.object({
  cart_id: z.string().regex(/^cart_[0-9A-Z]{26}$/),
  reference: z.string().regex(REFERENCE_PATTERN),
})

export type QrConfirmBody = z.infer<typeof QrConfirmSchema>

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/store/qr-payments/confirm",
      middlewares: [validateAndTransformBody(QrConfirmSchema)],
    },
  ],
})
