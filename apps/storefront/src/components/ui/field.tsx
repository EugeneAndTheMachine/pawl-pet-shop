import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'

const control =
  'h-11 w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink placeholder:text-ink-soft/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-cream'

type FieldWrapperProps = { id: string; label: string; error?: string; hint?: string; children: ReactNode; optional?: boolean }

function FieldWrapper({ id, label, error, hint, optional, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-soft">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-soft">{hint}</p>
      )}
    </div>
  )
}

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; optional?: boolean }

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { label, error, hint, optional, className, id, ...props },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <FieldWrapper id={inputId} label={label} error={error} hint={hint} optional={optional}>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cx(control, error ? 'border-danger' : 'border-line', className)}
        {...props}
      />
    </FieldWrapper>
  )
})

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; options: readonly string[]; placeholder?: string }

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, options, placeholder, className, id, ...props },
  ref,
) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <FieldWrapper id={selectId} label={label} error={error}>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={cx(control, 'pr-8', error ? 'border-danger' : 'border-line', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
})

type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; error?: string }

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(function CheckboxField({ label, error, id, ...props }, ref) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          aria-invalid={Boolean(error)}
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-accent"
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p className="pl-8 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null
  return (
    <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
      {message}
    </div>
  )
}
