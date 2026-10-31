import { authenticate, defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { REFERENCE_PATTERN } from "../modules/qr-payment/lib/session"

const CART_ID = /^cart_[0-9A-Z]{26}$/

export const QrConfirmSchema = z.object({
  cart_id: z.string().regex(CART_ID),
  reference: z.string().regex(REFERENCE_PATTERN),
})

export type QrConfirmBody = z.infer<typeof QrConfirmSchema>

export const ChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().trim().min(1).max(1000),
      })
    )
    .min(1)
    .max(30)
    .refine((messages) => messages[messages.length - 1].role === "user", "The last message must come from the user"),
  cart_id: z.string().regex(CART_ID).optional(),
})

export type ChatRequestBody = z.infer<typeof ChatRequestSchema>

export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/store/qr-payments/confirm",
      middlewares: [validateAndTransformBody(QrConfirmSchema)],
    },
    {
      method: ["POST"],
      matcher: "/store/chat",
      middlewares: [
        // Guests may chat too; when a customer session exists, req.auth_context identifies them
        authenticate("customer", ["session", "bearer"], { allowUnauthenticated: true }),
        validateAndTransformBody(ChatRequestSchema),
      ],
    },
  ],
})
