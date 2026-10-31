import type { Content, FunctionCall, FunctionDeclaration } from "@google/genai" with { "resolution-mode": "import" }
import { ChatProductCard, runTool, ToolContext } from "./tools"

// One customer question → one answer. The model may call tools several times (function calling);
// each call runs on the server and its JSON result goes back to the model, until it answers in text.

export type ChatMessage = { role: "user" | "model"; text: string }

export type ModelRequest = {
  system: string
  contents: Content[]
  tools: FunctionDeclaration[]
  /** false forces a text answer (used when the tool budget is spent) */
  allowTools: boolean
}

export type ModelTurn = {
  /** The model's content exactly as received: it carries thought signatures that must be sent back unchanged */
  content?: Content
  text: string
  functionCalls: FunctionCall[]
  tokens: number
  blocked: boolean
}

export interface ChatModel {
  generate(request: ModelRequest): Promise<ModelTurn>
}

export type ChatTurnResult = {
  reply: string
  products: ChatProductCard[]
  toolCalls: string[]
  rounds: number
  tokens: number
}

const FALLBACK_REPLY =
  "Sorry, I couldn't answer that just now. Please try rephrasing, or contact us at 1900 0000 / support@pawl.vn."

/** Product cards for the products the answer links to (/products/<handle>), in the order they appear */
export function cardsForReply(reply: string, seen: Map<string, ChatProductCard>, max = 4): ChatProductCard[] {
  const cards: ChatProductCard[] = []
  for (const match of reply.matchAll(/\/products\/([a-z0-9-]+)/g)) {
    const card = seen.get(match[1])
    if (card && !cards.includes(card)) cards.push(card)
    if (cards.length >= max) break
  }
  return cards
}

export async function runChatTurn(input: {
  model: ChatModel
  system: string
  tools: FunctionDeclaration[]
  history: ChatMessage[]
  ctx: ToolContext
  maxToolRounds: number
}): Promise<ChatTurnResult> {
  const { model, system, tools, ctx, maxToolRounds } = input
  // Earlier turns are sent as plain text; only the current turn keeps the model's raw content (with signatures).
  const contents: Content[] = input.history.map((m) => ({ role: m.role, parts: [{ text: m.text }] }))
  const toolCalls: string[] = []
  let tokens = 0

  for (let round = 0; round <= maxToolRounds; round++) {
    const turn = await model.generate({ system, contents, tools, allowTools: round < maxToolRounds })
    tokens += turn.tokens

    if (turn.blocked) {
      return { reply: FALLBACK_REPLY, products: [], toolCalls, rounds: round + 1, tokens }
    }
    if (!turn.functionCalls.length) {
      const reply = turn.text.trim() || FALLBACK_REPLY
      return { reply, products: cardsForReply(reply, ctx.seenProducts), toolCalls, rounds: round + 1, tokens }
    }

    contents.push(turn.content ?? { role: "model", parts: turn.functionCalls.map((functionCall) => ({ functionCall })) })

    // Independent calls of one round run in parallel
    const responses = await Promise.all(
      turn.functionCalls.map(async (call) => {
        const name = call.name ?? ""
        toolCalls.push(name)
        let response: Record<string, unknown>
        try {
          response = await runTool(name, call.args, ctx)
        } catch {
          response = { error: "tool_failed", message: "This information is temporarily unavailable." }
        }
        return { functionResponse: { ...(call.id ? { id: call.id } : {}), name, response } }
      })
    )
    contents.push({ role: "user", parts: responses })
  }

  return { reply: FALLBACK_REPLY, products: [], toolCalls, rounds: maxToolRounds + 1, tokens }
}
