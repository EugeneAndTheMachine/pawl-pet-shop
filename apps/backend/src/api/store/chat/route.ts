import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ChatModel, runChatTurn } from "../../../lib/chat/agent"
import { readChatConfig } from "../../../lib/chat/config"
import { ChatModelError, createGeminiModel } from "../../../lib/chat/gemini"
import { RateLimiter } from "../../../lib/chat/rate-limit"
import { buildSystemPrompt } from "../../../lib/chat/system-prompt"
import { functionDeclarations, ToolContext } from "../../../lib/chat/tools"
import type { ChatRequestBody } from "../../middlewares"

const config = readChatConfig()
const limiter = new RateLimiter(config.rateLimit, config.rateWindowMs)
const declarations = functionDeclarations()
let model: ChatModel | null = null

function getModel(): ChatModel | null {
  if (!config.apiKey) return null
  model ??= createGeminiModel({ ...config, apiKey: config.apiKey })
  return model
}

async function customerFirstName(req: AuthenticatedMedusaRequest, customerId: string): Promise<string | null> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "customer", fields: ["first_name"], filters: { id: customerId } })
  return (data[0] as { first_name: string | null } | undefined)?.first_name ?? null
}

/**
 * POST /store/chat { messages: [{ role, text }], cart_id? } → { reply, products }
 * Pawl Assistant (Gemini with read-only function calling). Works for guests; order questions need a signed-in customer.
 */
export async function POST(req: AuthenticatedMedusaRequest<ChatRequestBody>, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const gemini = getModel()
  if (!gemini) {
    logger.warn("[chat] GEMINI_API_KEY is not set: the assistant is disabled")
    res.status(503).json({ code: "chat_unavailable", message: "The assistant is not available right now." })
    return
  }

  // A signed-in identity that has not created its customer profile yet has no actor_id: treat it as a guest
  const customerId = req.auth_context?.actor_type === "customer" && req.auth_context.actor_id ? req.auth_context.actor_id : undefined
  const limit = limiter.hit(customerId ?? `ip:${req.ip ?? "unknown"}`)
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(limit.retryAfterSeconds))
    res.status(429).json({ code: "rate_limited", message: "You're sending messages too quickly. Please wait a moment." })
    return
  }

  const { messages, cart_id } = req.validatedBody
  const ctx: ToolContext = {
    container: req.scope,
    salesChannelId: req.publishable_key_context?.sales_channel_ids?.[0],
    customerId,
    cartId: cart_id,
    seenProducts: new Map(),
  }
  const started = Date.now()

  try {
    const result = await runChatTurn({
      model: gemini,
      system: buildSystemPrompt({
        now: new Date(),
        signedIn: Boolean(customerId),
        customerName: customerId ? await customerFirstName(req, customerId) : null,
        hasCart: Boolean(cart_id),
      }),
      tools: declarations,
      // Only the most recent messages are sent, to keep each request small
      history: messages.slice(-12),
      ctx,
      maxToolRounds: config.maxToolRounds,
    })

    // Metadata only: never log what the customer wrote
    logger.info(
      `[chat] ok model=${config.model} customer=${customerId ? "yes" : "guest"} rounds=${result.rounds} ` +
        `tools=${result.toolCalls.join(",") || "-"} tokens=${result.tokens} ms=${Date.now() - started}`
    )
    res.json({ reply: result.reply, products: result.products })
  } catch (error) {
    const status = error instanceof ChatModelError ? error.status : undefined
    logger.error(`[chat] failed model=${config.model} status=${status ?? "-"} ms=${Date.now() - started}: ${(error as Error).message}`)

    // 429 = quota, 503 = Google reports the model as overloaded
    if (status === 429 || status === 503) {
      res.status(429).json({ code: "busy", message: "The assistant is busy right now. Please try again in a minute." })
      return
    }
    res.status(502).json({ code: "chat_failed", message: "The assistant could not answer right now. Please try again." })
  }
}
