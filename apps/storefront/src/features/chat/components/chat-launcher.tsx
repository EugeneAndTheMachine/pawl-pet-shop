import { lazy, Suspense, useCallback, useState } from 'react'
import { useLocation } from 'react-router'
import { ChatIcon, CloseIcon } from '../../../components/ui/icons'
import { cx } from '../../../lib/cx'

// The panel (and react-markdown) is only downloaded the first time the assistant is opened
const ChatPanel = lazy(() => import('./chat-panel'))

/** Floating "Ask Pawl" button shown on every page except checkout */
export function ChatLauncher() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const close = useCallback(() => setOpen(false), [])

  if (pathname.startsWith('/checkout')) return null

  return (
    <>
      {open && (
        <Suspense fallback={null}>
          <ChatPanel onClose={close} />
        </Suspense>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close assistant' : 'Open Pawl Assistant'}
        className={cx(
          'fixed bottom-5 right-5 z-[45] items-center gap-2 rounded-full bg-brand-strong py-3 pl-3.5 pr-4 text-white shadow-lift transition-colors hover:bg-brand-deep sm:bottom-6 sm:right-6',
          // On phones the open panel is full screen and has its own close button
          open ? 'hidden sm:flex' : 'flex',
        )}
      >
        <span className="text-2xl">{open ? <CloseIcon /> : <ChatIcon />}</span>
        <span className="text-sm font-semibold">{open ? 'Close' : 'Ask Pawl'}</span>
      </button>
    </>
  )
}
