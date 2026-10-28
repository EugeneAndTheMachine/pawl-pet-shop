import { useId, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { cx } from '../../lib/cx'
import { SearchIcon } from '../ui/icons'

export function SearchBox({ className, onSubmitted }: { className?: string; onSubmitted?: () => void }) {
  // The header renders two search boxes (desktop and mobile), so each needs its own id for its label
  const inputId = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const initial = location.pathname === '/search' ? (params.get('q') ?? '') : ''
  const [value, setValue] = useState(initial)
  // Reset the input when the user navigates to another search or leaves the search page
  const [prevInitial, setPrevInitial] = useState(initial)
  if (initial !== prevInitial) {
    setPrevInitial(initial)
    setValue(initial)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const q = value.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
    onSubmitted?.()
  }

  return (
    <form role="search" onSubmit={submit} className={cx('relative', className)}>
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search food, litter, treats…"
        className="h-10 w-full rounded-full border border-transparent bg-white pl-4 pr-11 text-sm text-ink placeholder:text-ink-soft focus:border-brand focus:outline-none"
        enterKeyHint="search"
      />
      <button type="submit" className="absolute right-1 top-1 grid size-8 place-items-center rounded-full bg-brand-strong text-white hover:bg-brand-deep" aria-label="Search">
        <SearchIcon />
      </button>
    </form>
  )
}
