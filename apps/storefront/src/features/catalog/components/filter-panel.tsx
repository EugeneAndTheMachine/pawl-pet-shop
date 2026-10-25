import { useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { CheckIcon, ChevronDownIcon } from '../../../components/ui/icons'
import { cx } from '../../../lib/cx'
import { formatVND } from '../../../lib/format'
import { toggleTag, updateParams, type CatalogFilters } from '../filters'
import { TAG_GROUPS, type TagGroup } from '../tag-labels'

const PRICE_PRESETS = [
  { label: 'Under ₫100,000', min: undefined, max: 100000 },
  { label: '₫100,000 – ₫300,000', min: 100000, max: 300000 },
  { label: '₫300,000 – ₫500,000', min: 300000, max: 500000 },
  { label: 'Over ₫500,000', min: 500000, max: undefined },
]

type FilterPanelProps = {
  filters: CatalogFilters
  hiddenGroups?: TagGroup[]
  /** Options that make no sense in the current scope, e.g. `life:puppy` inside the cat category */
  hiddenOptions?: string[]
}

export function FilterPanel({ filters, hiddenGroups = [], hiddenOptions = [] }: FilterPanelProps) {
  const [params, setParams] = useSearchParams()

  return (
    <div className="divide-y divide-line">
      {TAG_GROUPS.filter((g) => !hiddenGroups.includes(g.key)).map((group) => (
        <FilterSection key={group.key} title={group.label} defaultOpen={group.key !== 'free' || filters.tags.free.length > 0}>
          <ul className="space-y-1">
            {group.options.filter((option) => !hiddenOptions.includes(`${group.key}:${option.value}`)).map((option) => {
              const checked = filters.tags[group.key].includes(option.value)
              return (
                <li key={option.value}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-ink/5">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={checked}
                      onChange={() => setParams(toggleTag(params, group.key, option.value), { preventScrollReset: true })}
                    />
                    <span
                      className={cx(
                        'grid size-5 shrink-0 place-items-center rounded-md border text-xs text-white transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
                        checked ? 'border-accent bg-accent' : 'border-ink/30 bg-white',
                      )}
                      aria-hidden="true"
                    >
                      {checked && <CheckIcon />}
                    </span>
                    {option.label}
                  </label>
                </li>
              )
            })}
          </ul>
        </FilterSection>
      ))}

      <FilterSection title="Price" defaultOpen>
        <PriceFilter
          key={`${filters.minPrice ?? ''}-${filters.maxPrice ?? ''}`}
          filters={filters}
          onApply={(min, max) => setParams(updateParams(params, { min, max }), { preventScrollReset: true })} />
      </FilterSection>
    </div>
  )
}

function FilterSection({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  return (
    <section className="py-3">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between py-1 text-left text-sm font-semibold"
          aria-expanded={open}
        >
          {title}
          <ChevronDownIcon className={cx('transition-transform', open && 'rotate-180')} />
        </button>
      </h3>
      {open && <div className="mt-2">{children}</div>}
    </section>
  )
}

function PriceFilter({ filters, onApply }: { filters: CatalogFilters; onApply: (min: string | null, max: string | null) => void }) {
  const [min, setMin] = useState(filters.minPrice?.toString() ?? '')
  const [max, setMax] = useState(filters.maxPrice?.toString() ?? '')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onApply(min || null, max || null)
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-1">
        {PRICE_PRESETS.map((preset) => {
          const active = filters.minPrice === preset.min && filters.maxPrice === preset.max
          return (
            <li key={preset.label}>
              <button
                type="button"
                onClick={() => {
                  setMin(preset.min?.toString() ?? '')
                  setMax(preset.max?.toString() ?? '')
                  onApply(active ? null : (preset.min?.toString() ?? null), active ? null : (preset.max?.toString() ?? null))
                }}
                className={cx(
                  'w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-ink/5',
                  active && 'bg-accent-soft font-semibold text-accent-dark',
                )}
                aria-pressed={active}
              >
                {preset.label}
              </button>
            </li>
          )
        })}
      </ul>
      <form onSubmit={submit} className="flex items-center gap-2">
        <label className="sr-only" htmlFor="price-min">Minimum price</label>
        <input
          id="price-min"
          inputMode="numeric"
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))}
          className="h-9 w-full min-w-0 rounded-lg border border-line bg-white px-2 text-sm"
        />
        <span aria-hidden="true">–</span>
        <label className="sr-only" htmlFor="price-max">Maximum price</label>
        <input
          id="price-max"
          inputMode="numeric"
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))}
          className="h-9 w-full min-w-0 rounded-lg border border-line bg-white px-2 text-sm"
        />
        <button type="submit" className="h-9 shrink-0 rounded-lg bg-accent px-3 text-sm font-semibold text-white hover:bg-accent-dark">
          Apply
        </button>
      </form>
      {(filters.minPrice != null || filters.maxPrice != null) && (
        <p className="text-xs text-ink-soft">
          Showing: {filters.minPrice != null ? formatVND(filters.minPrice) : '₫0'} – {filters.maxPrice != null ? formatVND(filters.maxPrice) : 'no limit'}
        </p>
      )}
    </div>
  )
}
