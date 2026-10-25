import { cx } from '../../../lib/cx'

const LOW_STOCK = 5

export function StockStatus({ available }: { available: number }) {
  const label = available <= 0 ? 'Out of stock' : available <= LOW_STOCK ? `Only ${available} left` : 'In stock'
  const tone = available <= 0 ? 'bg-danger-soft text-danger' : available <= LOW_STOCK ? 'bg-brand-soft text-brand-deep' : 'bg-success-soft text-success'

  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold', tone)}>
      <span className="size-2 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  )
}
