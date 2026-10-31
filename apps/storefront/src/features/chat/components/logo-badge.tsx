import logoDark from '../../../assets/images/logo-dark.webp'
import { cx } from '../../../lib/cx'

/** The Pawl wordmark inside a round white badge (assistant avatar) */
export function LogoBadge({ className }: { className?: string }) {
  return (
    <span className={cx('grid shrink-0 place-items-center rounded-full bg-white ring-2 ring-brand/70', className)}>
      <img src={logoDark} alt="" width={87} height={40} className="h-auto w-[78%]" />
    </span>
  )
}
