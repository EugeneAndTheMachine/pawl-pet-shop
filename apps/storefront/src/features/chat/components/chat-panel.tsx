import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { CloseIcon, RefreshIcon, SendIcon } from '../../../components/ui/icons'
import { useChat } from '../use-chat'
import { ChatMarkdown } from './chat-markdown'
import { ChatProductCard } from './chat-product-card'
import { LogoBadge } from './logo-badge'

const SUGGESTIONS = [
  'Food for an adult cat with urinary problems',
  'How much should my 4 kg neutered cat eat per day?',
  'Grain-free treats for my dog',
  'Where is my latest order?',
  'How much is shipping and how can I pay?',
]

const MAX_LENGTH = 1000

/** The assistant's window: full screen on phones, a floating panel from the sm breakpoint */
export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const { messages, send, retry, reset, isSending, error, isSignedIn } = useChat()
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const titleId = useId()
  const inputId = useId()

  useEffect(() => {
    inputRef.current?.focus()
    const onKeyDown = (event: globalThis.KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Keep the newest message in view
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isSending, error])

  // On a phone the panel covers the page, so following a link closes it
  const onNavigate = () => {
    if (window.matchMedia('(max-width: 639px)').matches) onClose()
  }

  const submit = (text: string) => {
    if (!text.trim() || isSending) return
    void send(text)
    setDraft('')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit(draft)
  }

  // Enter sends, Shift+Enter adds a new line
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit(draft)
    }
  }

  return (
    <section
      role="dialog"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[45] flex animate-fade-in flex-col bg-surface sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[400px] sm:overflow-hidden sm:rounded-2xl sm:shadow-lift"
    >
      <header className="flex items-center gap-3 bg-linear-to-r from-accent to-accent-deep px-4 py-3 text-white">
        <span className="relative">
          <LogoBadge className="size-11" />
          <span className="absolute bottom-0 right-0 size-3 rounded-full bg-success ring-2 ring-accent-dark" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-semibold leading-tight">
            Pawl Assistant
          </h2>
          {/* <p className="truncate text-xs text-white/75">AI helper · products, orders, shipping</p> */}
        </div>
        {messages.length > 0 && (
          <button type="button" onClick={reset} className="rounded-full p-2 text-lg hover:bg-white/10" aria-label="Start a new conversation" title="New conversation">
            <RefreshIcon />
          </button>
        )}
        <button type="button" onClick={onClose} className="rounded-full p-2 text-xl hover:bg-white/10" aria-label="Close assistant">
          <CloseIcon />
        </button>
      </header>

      <div ref={listRef} className="chat-backdrop flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div>
            <div className="mb-4 mt-2 flex flex-col items-center text-center">
              <LogoBadge className="size-20 shadow-card" />
              <p className="mt-3 font-hand text-2xl text-accent">How can I help your pet today?</p>
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white p-3 text-sm shadow-card">
              <p className="leading-relaxed">
                Hi! I'm Pawl's assistant. Tell me about your cat or dog and I'll help you find the right food, work out portions, or check on
                your order. You can write in English or Vietnamese.
              </p>
              {!isSignedIn && (
                <p className="mt-2 text-ink-soft">
                  <Link to="/login" onClick={onNavigate} className="font-medium text-brand-strong underline underline-offset-2">
                    Sign in
                  </Link>{' '}
                  to ask about your orders.
                </p>
              )}
            </div>
            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-left text-sm transition-colors hover:border-brand hover:text-brand-strong"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-accent px-3.5 py-2 text-sm text-white">{m.text}</p>
            </div>
          ) : (
            <div key={m.id} className="flex max-w-[94%] items-start gap-2">
              <LogoBadge className="size-8 ring-1" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="break-words rounded-2xl rounded-tl-sm border-l-4 border-brand bg-white px-3.5 py-2.5 text-sm shadow-card">
                  <ChatMarkdown text={m.text} onNavigate={onNavigate} />
                </div>
                {m.products?.map((p) => <ChatProductCard key={p.handle} product={p} onNavigate={onNavigate} />)}
              </div>
            </div>
          ),
        )}

        {isSending && (
          <div className="flex items-start gap-2">
            <LogoBadge className="size-8 ring-1" />
            <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-card" role="status" aria-label="Assistant is typing">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="size-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </div>
        )}

        {error && !isSending && (
          <div className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => void retry()} className="mt-1 font-semibold underline underline-offset-2">
              Try again
            </button>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-line bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="flex items-end gap-2">
          <label htmlFor={inputId} className="sr-only">
            Message
          </label>
          <textarea
            id={inputId}
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask about products, portions, orders…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-sm [field-sizing:content] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="submit"
            disabled={!draft.trim() || isSending}
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-strong text-xl text-white transition-colors hover:bg-brand-deep disabled:opacity-50"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </section>
  )
}
