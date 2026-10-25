import { defineMiddlewares, validateAndTransformQuery } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

const REQUIRED_VNP_FIELDS: Record<string, RegExp> = {
  vnp_TxnRef: /^[0-9A-Za-z]{1,100}$/,
  vnp_SecureHash: /^[0-9A-Fa-f]{64,256}$/,
  vnp_Amount: /^\d+$/,
  vnp_ResponseCode: /^\d{2}$/,
}

// Every vnp_* value VNPay appends to the return URL / IPN request. Unknown vnp_* keys are kept
// (the signature covers all of them), anything else is rejected.
// A record instead of an object: Medusa's validator calls .strict() on objects, which would drop the catch-all.
export const VnpayResultQuery = z
  .record(z.string().regex(/^vnp_[A-Za-z]+$/, "Only vnp_* parameters are accepted"), z.string().max(500))
  .superRefine((query, ctx) => {
    for (const [key, pattern] of Object.entries(REQUIRED_VNP_FIELDS)) {
      if (!pattern.test(query[key] ?? "")) {
        ctx.addIssue({ code: "custom", path: [key], message: `Missing or invalid ${key}` })
      }
    }
  })

export default defineMiddlewares({
  routes: [
    {
      method: ["GET"],
      matcher: "/store/vnpay/verify",
      middlewares: [validateAndTransformQuery(VnpayResultQuery, {})],
    },
    {
      method: ["GET"],
      matcher: "/hooks/vnpay/ipn",
      middlewares: [validateAndTransformQuery(VnpayResultQuery, {})],
    },
  ],
})
