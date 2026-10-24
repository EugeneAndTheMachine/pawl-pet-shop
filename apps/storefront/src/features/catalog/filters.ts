import { TAG_GROUPS, type TagGroup } from './tag-labels'

// Filter state lives in the URL so links can be shared, e.g. /products?species=cat&health=urinary,hairball&sort=price_asc

export type SortKey = 'newest' | 'price_asc' | 'price_desc'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
]

export const PAGE_SIZE = 12

export type CatalogFilters = {
  tags: Record<TagGroup, string[]>
  minPrice?: number
  maxPrice?: number
  sort: SortKey
  page: number
  q?: string
  collection?: string
}

const GROUP_KEYS = TAG_GROUPS.map((g) => g.key)

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export function parseFilters(params: URLSearchParams): CatalogFilters {
  const tags = Object.fromEntries(
    GROUP_KEYS.map((key) => {
      const allowed = TAG_GROUPS.find((g) => g.key === key)!.options.map((o) => o.value)
      const values = (params.get(key) ?? '').split(',').filter((v) => allowed.includes(v))
      return [key, values]
    }),
  ) as Record<TagGroup, string[]>

  const sort = params.get('sort')
  const page = Number.parseInt(params.get('page') ?? '1', 10)

  return {
    tags,
    minPrice: parseNumber(params.get('min')),
    maxPrice: parseNumber(params.get('max')),
    sort: sort === 'price_asc' || sort === 'price_desc' ? sort : 'newest',
    page: Number.isFinite(page) && page > 0 ? page : 1,
    q: params.get('q')?.trim() || undefined,
    collection: params.get('collection') || undefined,
  }
}

/** Returns new params with one change applied; any filter change resets the page. */
export function updateParams(params: URLSearchParams, changes: Record<string, string | null>): URLSearchParams {
  const next = new URLSearchParams(params)
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
  }
  if (!('page' in changes)) next.delete('page')
  return next
}

export function toggleTag(params: URLSearchParams, group: TagGroup, value: string): URLSearchParams {
  const current = (params.get(group) ?? '').split(',').filter(Boolean)
  const nextValues = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
  return updateParams(params, { [group]: nextValues.join(',') || null })
}

export function clearFilters(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams()
  const q = params.get('q')
  if (q) next.set('q', q)
  return next
}

export function countActiveFilters(filters: CatalogFilters): number {
  const tagCount = Object.values(filters.tags).reduce((sum, values) => sum + values.length, 0)
  return tagCount + (filters.minPrice != null || filters.maxPrice != null ? 1 : 0) + (filters.collection ? 1 : 0)
}

export function needsClientSideProcessing(filters: CatalogFilters): boolean {
  return filters.sort !== 'newest' || filters.minPrice != null || filters.maxPrice != null
}
