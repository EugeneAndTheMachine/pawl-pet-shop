import { useSearchParams } from 'react-router'
import { CloseIcon } from '../../../components/ui/icons'
import { formatVND } from '../../../lib/format'
import { clearFilters, countActiveFilters, toggleTag, updateParams, type CatalogFilters } from '../filters'
import { TAG_GROUPS } from '../tag-labels'

export function ActiveFilters({ filters, collectionTitle }: { filters: CatalogFilters; collectionTitle?: string }) {
  const [params, setParams] = useSearchParams()
  if (!countActiveFilters(filters)) return null

  const chips: { key: string; label: string; next: URLSearchParams }[] = []
  for (const group of TAG_GROUPS) {
    for (const value of filters.tags[group.key]) {
      const label = group.options.find((o) => o.value === value)?.label ?? value
      chips.push({ key: `${group.key}:${value}`, label, next: toggleTag(params, group.key, value) })
    }
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    chips.push({
      key: 'price',
      label: `${filters.minPrice != null ? formatVND(filters.minPrice) : '₫0'} – ${filters.maxPrice != null ? formatVND(filters.maxPrice) : '∞'}`,
      next: updateParams(params, { min: null, max: null }),
    })
  }
  if (filters.collection) {
    chips.push({ key: 'collection', label: collectionTitle ?? 'Collection', next: updateParams(params, { collection: null }) })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => setParams(chip.next, { preventScrollReset: true })}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft py-1 pl-3 pr-2 text-sm font-medium text-accent-dark hover:bg-accent/15"
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <CloseIcon className="text-xs" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => setParams(clearFilters(params), { preventScrollReset: true })}
        className="text-sm font-semibold text-brand-strong underline-offset-2 hover:underline"
      >
        Clear all
      </button>
    </div>
  )
}
