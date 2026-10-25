import type { ReactNode } from 'react'
import { CheckIcon } from '../../../components/ui/icons'
import { cx } from '../../../lib/cx'

type StepSectionProps = {
  index: number
  title: string
  state: 'active' | 'done' | 'upcoming'
  summary?: ReactNode
  onEdit?: () => void
  children: ReactNode
}

/** One accordion step: open while active, a short summary with "Edit" once done */
export function StepSection({ index, title, state, summary, onEdit, children }: StepSectionProps) {
  return (
    <section className={cx('rounded-3xl bg-white p-5 shadow-card sm:p-6', state === 'upcoming' && 'opacity-60')} aria-current={state === 'active' ? 'step' : undefined}>
      <div className="flex items-center gap-3">
        <span
          className={cx(
            'grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold',
            state === 'done' ? 'bg-success text-white' : state === 'active' ? 'bg-accent text-white' : 'bg-line text-ink-soft',
          )}
          aria-hidden="true"
        >
          {state === 'done' ? <CheckIcon /> : index}
        </span>
        <h2 className="flex-1 text-lg font-semibold">
          <span className="sr-only">Step {index}: </span>
          {title}
        </h2>
        {state === 'done' && onEdit && (
          <button type="button" onClick={onEdit} className="text-sm font-semibold text-accent hover:text-accent-dark">
            Edit
          </button>
        )}
      </div>
      {state === 'active' && <div className="mt-5">{children}</div>}
      {state === 'done' && summary && <div className="mt-3 pl-11 text-sm text-ink-soft">{summary}</div>}
    </section>
  )
}
