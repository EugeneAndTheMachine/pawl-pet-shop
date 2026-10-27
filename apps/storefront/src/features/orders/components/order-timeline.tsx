import type { HttpTypes } from '@medusajs/types'
import { CheckIcon, CloseIcon } from '../../../components/ui/icons'
import { cx } from '../../../lib/cx'
import { formatDateTime } from '../../../lib/format'
import { orderSteps } from '../order-status'

export function OrderTimeline({ order }: { order: HttpTypes.StoreOrder }) {
  if (order.status === 'canceled') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-danger-soft p-4 text-sm text-danger">
        <CloseIcon className="text-lg" />
        <span>This order was cancelled. Contact us if you have any questions.</span>
      </div>
    )
  }

  const steps = orderSteps(order)
  // The step after the last completed one is "in progress"
  const current = steps.findIndex((s) => !s.done)

  return (
    <ol className="grid gap-0 sm:grid-flow-col sm:auto-cols-fr">
      {steps.map((step, i) => (
        <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0 sm:flex-col sm:items-center sm:pb-0 sm:text-center">
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={cx(
                'absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 sm:left-[calc(50%+1rem)] sm:top-[15px] sm:h-0.5 sm:w-[calc(100%-2rem)]',
                steps[i + 1].done ? 'bg-success' : 'bg-line',
              )}
            />
          )}
          <span
            className={cx(
              'relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-sm',
              step.done ? 'border-success bg-success text-white' : i === current ? 'border-brand bg-brand-soft text-brand-strong' : 'border-line bg-white text-ink-soft',
            )}
          >
            {step.done ? <CheckIcon /> : i + 1}
          </span>
          <div className="sm:mt-2">
            <p className={cx('text-sm font-semibold', !step.done && i !== current && 'text-ink-soft')}>{step.label}</p>
            <p className="text-xs text-ink-soft">{step.done && step.at ? formatDateTime(step.at) : i === current ? 'In progress' : 'Pending'}</p>
            <span className="sr-only">{step.done ? '(completed)' : i === current ? '(current step)' : '(not started)'}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
