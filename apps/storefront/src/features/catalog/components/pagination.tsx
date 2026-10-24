import { useSearchParams } from 'react-router'
import { ChevronLeftIcon, ChevronRightIcon } from '../../../components/ui/icons'
import { cx } from '../../../lib/cx'
import { updateParams } from '../filters'

function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('…')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < total - 1) pages.push('…')
  pages.push(total)
  return pages
}

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const [params, setParams] = useSearchParams()
  if (totalPages <= 1) return null

  const go = (p: number) => {
    setParams(updateParams(params, { page: p > 1 ? String(p) : null }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const btn = 'grid size-10 place-items-center rounded-full text-sm font-semibold transition-colors'

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-1">
      <button type="button" className={cx(btn, 'hover:bg-ink/5 disabled:opacity-40')} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Trang trước">
        <ChevronLeftIcon />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-ink-soft">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            className={cx(btn, p === page ? 'bg-accent text-white' : 'hover:bg-ink/5')}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Trang ${p}`}
          >
            {p}
          </button>
        ),
      )}
      <button type="button" className={cx(btn, 'hover:bg-ink/5 disabled:opacity-40')} onClick={() => go(page + 1)} disabled={page >= totalPages} aria-label="Trang sau">
        <ChevronRightIcon />
      </button>
    </nav>
  )
}
