import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/use-auth'
import { useCart } from '../cart/use-cart'
import { chatErrorMessage, sendChat, type ChatMessage } from './api'

// The conversation lives in sessionStorage (this tab only) and belongs to whoever was signed in when it started:
// signing in or out starts a new conversation, so order details never stay on screen for the next person.
const STORAGE_KEY = 'pawl_chat'
const MAX_STORED = 40

type Stored = { owner: string | null; messages: ChatMessage[] }

function load(owner: string | null): ChatMessage[] {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? 'null') as Stored | null
    return stored && stored.owner === owner && Array.isArray(stored.messages) ? stored.messages : []
  } catch {
    return []
  }
}

function save(owner: string | null, messages: ChatMessage[]) {
  try {
    const value: Stored = { owner, messages: messages.slice(-MAX_STORED) }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Not persisted (private mode): the chat still works for this page view
  }
}

const newId = () => Math.random().toString(36).slice(2, 10)

export function useChat() {
  const { customer, isLoading: authLoading } = useAuth()
  const { cart } = useCart()
  const owner = customer?.id ?? null
  const [state, setState] = useState(() => ({ owner, messages: load(owner) }))
  const [error, setError] = useState<string | null>(null)

  // Signing in or out switches to that person's conversation (empty for a new person)
  if (!authLoading && state.owner !== owner) {
    setState({ owner, messages: load(owner) })
    setError(null)
  }

  useEffect(() => save(state.owner, state.messages), [state])

  const mutation = useMutation({
    mutationFn: (history: ChatMessage[]) => sendChat(history, cart?.id ?? null),
  })

  const ask = useCallback(
    async (history: ChatMessage[]) => {
      setError(null)
      try {
        // The last 12 messages are enough context; the backend trims too
        const { reply, products } = await mutation.mutateAsync(history.slice(-12))
        // Dropped if the person signed in or out while waiting
        setState((s) => (s.owner === owner ? { ...s, messages: [...s.messages, { id: newId(), role: 'model', text: reply, products }] } : s))
      } catch (err) {
        setError(chatErrorMessage(err))
      }
    },
    [mutation, owner],
  )

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim().slice(0, 1000)
      if (!trimmed || mutation.isPending) return
      const history = [...state.messages, { id: newId(), role: 'user' as const, text: trimmed }]
      setState((s) => ({ ...s, messages: history }))
      await ask(history)
    },
    [ask, mutation.isPending, state.messages],
  )

  /** Asks the last question again after an error */
  const retry = useCallback(async () => {
    const last = state.messages[state.messages.length - 1]
    if (last?.role === 'user' && !mutation.isPending) await ask(state.messages)
  }, [ask, mutation.isPending, state.messages])

  const reset = useCallback(() => {
    setState((s) => ({ ...s, messages: [] }))
    setError(null)
  }, [])

  return { messages: state.messages, send, retry, reset, isSending: mutation.isPending, error, isSignedIn: Boolean(customer) }
}
