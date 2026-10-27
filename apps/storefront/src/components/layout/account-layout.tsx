import type { ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { RequireAuth } from '../../app/guards'
import { useAuth } from '../../features/auth/use-auth'
import { cx } from '../../lib/cx'

const LINKS = [
  { to: '/account', label: 'Overview', end: true },
  { to: '/account/orders', label: 'Orders', end: false },
  { to: '/account/profile', label: 'Profile', end: true },
  { to: '/account/addresses', label: 'Addresses', end: true },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cx(
    'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors lg:block lg:rounded-xl',
    isActive ? 'bg-accent text-white' : 'text-ink hover:bg-accent-soft',
  )

export function AccountLayout() {
  return (
    <RequireAuth>
      <AccountShell />
    </RequireAuth>
  )
}

function AccountShell() {
  const { customer, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="rounded-3xl bg-white p-3 shadow-card lg:sticky lg:top-24 lg:p-4">
          <div className="hidden border-b border-line px-2 pb-4 lg:block">
            <p className="font-display text-xl text-brand">My account</p>
            <p className="mt-1 truncate text-sm text-ink-soft">{customer?.email}</p>
          </div>
          <nav aria-label="Account" className="-mx-1 flex gap-1 overflow-x-auto px-1 lg:mx-0 lg:mt-3 lg:flex-col lg:overflow-visible lg:px-0">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              className="shrink-0 rounded-full px-4 py-2 text-left text-sm font-semibold text-danger hover:bg-danger-soft lg:rounded-xl"
              onClick={async () => {
                // Leave the account synchronously first (no transition), otherwise RequireAuth would send us to /login
                await navigate('/', { flushSync: true })
                await logout()
              }}
            >
              Sign out
            </button>
          </nav>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

/** Page heading used by every account page */
export function AccountHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <h1 className="font-display text-3xl text-brand">{title}</h1>
      {children}
    </div>
  )
}
