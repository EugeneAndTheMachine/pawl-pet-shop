import { cx } from '../../lib/cx'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'light'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 select-none'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-strong text-white hover:bg-brand-deep',
  secondary: 'bg-accent text-white hover:bg-accent-dark',
  outline: 'border border-accent text-accent hover:bg-accent-soft',
  ghost: 'text-ink hover:bg-ink/5',
  light: 'bg-white text-accent-deep hover:bg-cream',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-12 px-7 text-base',
}

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cx(base, variants[variant], sizes[size], className)
}
