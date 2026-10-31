import type { FinishReason } from "@google/genai" with { "resolution-mode": "import" }
import type { ChatModel, ModelRequest, ModelTurn } from "./agent"
import type { ChatConfig } from "./config"

/** HTTP status of a failed Gemini call (429 = quota or rate limit) */
export class ChatModelError extends Error {
  constructor(
    message: string,
    readonly status: number | undefined
  ) {
    super(message)
  }
}

// @google/genai is an ES module while the Medusa backend compiles to CommonJS, so it is loaded with import().
type GenAI = typeof import("@google/genai", { with: { "resolution-mode": "import" } })
let sdk: Promise<GenAI> | null = null
const loadSdk = () => (sdk ??= import("@google/genai"))

/** Gemini through the official @google/genai SDK (generateContent with function calling) */
export function createGeminiModel(config: ChatConfig & { apiKey: string }): ChatModel {
  let client: InstanceType<GenAI["GoogleGenAI"]> | null = null

  return {
    async generate(request: ModelRequest): Promise<ModelTurn> {
      const genai = await loadSdk()
      client ??= new genai.GoogleGenAI({ apiKey: config.apiKey })
      const blocked: (FinishReason | undefined)[] = [
        genai.FinishReason.SAFETY,
        genai.FinishReason.PROHIBITED_CONTENT,
        genai.FinishReason.BLOCKLIST,
        genai.FinishReason.SPII,
      ]
      const thinkingLevel = {
        minimal: genai.ThinkingLevel.MINIMAL,
        low: genai.ThinkingLevel.LOW,
        medium: genai.ThinkingLevel.MEDIUM,
        high: genai.ThinkingLevel.HIGH,
      }[config.thinkingLevel]

      try {
        const response = await client.models.generateContent({
          model: config.model,
          contents: request.contents,
          config: {
            systemInstruction: request.system,
            tools: [{ functionDeclarations: request.tools }],
            toolConfig: {
              functionCallingConfig: {
                mode: request.allowTools ? genai.FunctionCallingConfigMode.AUTO : genai.FunctionCallingConfigMode.NONE,
              },
            },
            thinkingConfig: { thinkingLevel },
            maxOutputTokens: 4096,
            abortSignal: AbortSignal.timeout(config.timeoutMs),
          },
        })

        const candidate = response.candidates?.[0]
        const functionCalls = response.functionCalls ?? []
        return {
          content: candidate?.content,
          // response.text logs a warning when the turn also holds function calls; that text is not shown anyway
          text: functionCalls.length ? "" : (response.text ?? ""),
          functionCalls,
          tokens: response.usageMetadata?.totalTokenCount ?? 0,
          blocked: Boolean(response.promptFeedback?.blockReason) || blocked.includes(candidate?.finishReason),
        }
      } catch (error) {
        const status = error instanceof genai.ApiError ? error.status : undefined
        throw new ChatModelError((error as Error).message, status)
      }
    },
  }
}
