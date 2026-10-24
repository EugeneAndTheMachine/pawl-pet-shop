import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { AlertIcon, CheckIcon, CloseIcon } from './icons'
import { ToastContext, type ToastTone } from './use-toast'

type Toast = { id: number; tone: ToastTone; message: string }
let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = nextId++
      setToasts((list) => [...list.slice(-2), { id, tone, message }])
      window.setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              'pointer-events-auto flex w-full max-w-sm animate-fade-in items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lift',
              t.tone === 'error' ? 'bg-danger text-white' : t.tone === 'success' ? 'bg-accent-deep text-white' : 'bg-ink text-white',
            )}
          >
            <span className="mt-0.5 text-base">{t.tone === 'error' ? <AlertIcon /> : <CheckIcon />}</span>
            <p className="flex-1">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} className="text-base opacity-80 hover:opacity-100" aria-label="Đóng thông báo">
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

