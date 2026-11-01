// Chat assistant settings, read from the backend .env only (the Gemini key never reaches the browser).

export type ThinkingLevelName = "minimal" | "low" | "medium" | "high"

export type ChatConfig = {
  apiKey: string | undefined
  model: string
  thinkingLevel: ThinkingLevelName
  /** Messages per client (IP or customer) per window */
  rateLimit: number
  rateWindowMs: number
  /** Model ⇄ tool round trips allowed for one answer before the model must reply in text */
  maxToolRounds: number
  timeoutMs: number
  /** Header holding the visitor IP when behind a proxy (e.g. x-forwarded-for); empty = req.ip */
  clientIpHeader: string | undefined
}

const THINKING_LEVELS: ThinkingLevelName[] = ["minimal", "low", "medium", "high"]

function positiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

export function readChatConfig(env: NodeJS.ProcessEnv = process.env): ChatConfig {
  const level = (env.GEMINI_THINKING_LEVEL ?? "low").toLowerCase() as ThinkingLevelName
  return {
    apiKey: env.GEMINI_API_KEY?.trim() || undefined,
    model: env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite",
    thinkingLevel: THINKING_LEVELS.includes(level) ? level : "low",
    rateLimit: positiveInt(env.CHAT_RATE_LIMIT, 20),
    rateWindowMs: positiveInt(env.CHAT_RATE_WINDOW_MINUTES, 10) * 60_000,
    maxToolRounds: 5,
    timeoutMs: 45_000,
    clientIpHeader: env.CHAT_CLIENT_IP_HEADER?.trim().toLowerCase() || undefined,
  }
}
