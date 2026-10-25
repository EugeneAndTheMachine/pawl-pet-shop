import { cx } from '../../lib/cx'
import { MinusIcon, PlusIcon } from './icons'

type QuantityInputProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  disabled?: boolean
  label?: string
}

export function QuantityInput({ value, onChange, min = 1, max = 99, size = 'md', disabled, label = 'Quantity' }: QuantityInputProps) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n))
  const btn = cx(
    'grid place-items-center text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40',
    size === 'sm' ? 'size-8 text-sm' : 'size-11',
  )

  return (
    <div className={cx('inline-flex items-center rounded-full border border-line bg-white', disabled && 'opacity-60')}>
      <button type="button" className={cx(btn, 'rounded-l-full')} onClick={() => onChange(clamp(value - 1))} disabled={disabled || value <= min} aria-label="Decrease quantity">
        <MinusIcon />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        className={cx('w-10 bg-transparent text-center font-semibold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none', size === 'sm' && 'w-8 text-sm')}
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10)
          if (!Number.isNaN(n)) onChange(clamp(n))
        }}
      />
      <button type="button" className={cx(btn, 'rounded-r-full')} onClick={() => onChange(clamp(value + 1))} disabled={disabled || value >= max} aria-label="Increase quantity">
        <PlusIcon />
      </button>
    </div>
  )
}
