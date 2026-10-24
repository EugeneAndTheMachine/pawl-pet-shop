import { cx } from '../../lib/cx'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-lg bg-line/70', className)} aria-hidden="true" />
}
