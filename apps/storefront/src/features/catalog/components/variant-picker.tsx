import type { HttpTypes } from '@medusajs/types'
import { cx } from '../../../lib/cx'
import { isVariantInStock } from '../product-utils'

type VariantPickerProps = {
  product: HttpTypes.StoreProduct
  selected: Record<string, string>
  onChange: (optionId: string, value: string) => void
}

/** One button group per product option; values that only exist in sold-out variants are marked */
export function VariantPicker({ product, selected, onChange }: VariantPickerProps) {
  const options = product.options ?? []
  const variants = product.variants ?? []

  return (
    <div className="space-y-4">
      {options.map((option) => {
        const values = Array.from(new Set((option.values ?? []).map((v) => v.value)))
        return (
          <fieldset key={option.id}>
            <legend className="mb-2 text-sm font-semibold">
              {option.title}: <span className="font-normal text-ink-soft">{selected[option.id]}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected = selected[option.id] === value
                // A value is available if some in-stock variant has it together with the other selected values
                const available = variants.some(
                  (v) =>
                    isVariantInStock(v) &&
                    (v.options ?? []).some((o) => o.option_id === option.id && o.value === value) &&
                    options.every(
                      (other) => other.id === option.id || !selected[other.id] || (v.options ?? []).some((o) => o.option_id === other.id && o.value === selected[other.id]),
                    ),
                )
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onChange(option.id, value)}
                    aria-pressed={isSelected}
                    className={cx(
                      'relative min-w-16 rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-colors',
                      isSelected ? 'border-accent bg-accent-soft text-accent-dark' : 'border-line bg-white hover:border-accent/60',
                      !available && 'text-ink-soft line-through decoration-ink/40',
                    )}
                  >
                    {value}
                    {!available && <span className="sr-only"> (hết hàng)</span>}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
