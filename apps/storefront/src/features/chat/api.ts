import { FetchError } from '@medusajs/js-sdk'
import { sdk } from '../../lib/medusa'

export type ChatRole = 'user' | 'model'

export type ChatProductCard = {
  handle: string
  title: string
  brand: string | null
  thumbnail: string | null
  price_min: number | null
  price_max: number | null
  in_stock: boolean
}

export type ChatMessage = {
  id: string
  role: ChatRole
  text: string
  products?: ChatProductCard[]
}

type ChatResponse = { reply: string; products: ChatProductCard[] }

/** POST /store/chat: the backend runs Gemini with read-only tools; the session cookie identifies a signed-in customer */
export async function sendChat(messages: ChatMessage[], cartId: string | null): Promise<ChatResponse> {
  return sdk.client.fetch<ChatResponse>('/store/chat', {
    method: 'POST',
    body: {
      messages: messages.map(({ role, text }) => ({ role, text })),
      ...(cartId ? { cart_id: cartId } : {}),
    },
  })
}

export function chatErrorMessage(error: unknown): string {
  if (error instanceof FetchError) {
    if (error.status === 429) return "You're sending messages a little fast. Please wait a moment and try again."
    if (error.status === 503) return 'The assistant is offline right now. You can reach us at 1900 0000 or support@pawl.vn.'
  }
  return "Sorry, I couldn't reply just now. Please try again."
}
