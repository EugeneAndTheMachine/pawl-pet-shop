import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import logoLight from '../../assets/images/logo-light.webp'
import { useAuth } from '../../features/auth/use-auth'
import { useCart } from '../../features/cart/use-cart'
import { useCategories } from '../../features/catalog/hooks'
import { cx } from '../../lib/cx'
import { Drawer } from '../ui/drawer'
import { CartIcon, CatIcon, ChevronDownIcon, DogIcon, MenuIcon, UserIcon } from '../ui/icons'
import { SearchBox } from './search-box'

const navLink = ({ isActive }: { isActive: boolean }) =>
  cx('rounded-full px-3 py-2 text-sm font-semibold transition-colors', isActive ? 'text-brand' : 'text-white hover:text-brand')

export function Header() {
  const { itemCount, openDrawer } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const species = pathname.startsWith('/c/cat') ? 'cat' : pathname.startsWith('/c/dog') ? 'dog' : null

  return (
    <header className="sticky top-0 z-40 bg-accent shadow-md">
      <div className="container-page flex h-16 items-center gap-2 sm:gap-4">
        <button type="button" className="-ml-2 rounded-full p-2 text-2xl text-white hover:bg-white/10 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <MenuIcon />
        </button>

        <Link to="/" className="shrink-0" aria-label="Pawl – Home">
          <img src={logoLight} alt="Pawl" width={87} height={40} className="h-9 w-auto sm:h-10" />
        </Link>

        <nav aria-label="Main navigation" className="ml-4 hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={navLink}>
            Home
          </NavLink>
          <NavLink to="/products" end className={navLink}>
            Shop
          </NavLink>
          <div className="ml-2 flex rounded-full bg-accent-deep/60 p-1" role="group" aria-label="Shop by pet">
            <SpeciesLink to="/c/cat" active={species === 'cat'} icon={<CatIcon />} label="Cats" />
            <SpeciesLink to="/c/dog" active={species === 'dog'} icon={<DogIcon />} label="Dogs" />
          </div>
        </nav>

        <SearchBox className="ml-auto hidden w-full max-w-xs md:block xl:max-w-sm" />

        <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
          <AccountMenu />
          <button type="button" onClick={openDrawer} className="relative rounded-full p-2 text-2xl text-white hover:bg-white/10" aria-label={`Cart, ${itemCount} items`}>
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold leading-5 text-white" aria-hidden="true">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="container-page pb-3 md:hidden">
        <SearchBox />
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}

function SpeciesLink({ to, active, icon, label }: { to: string; active: boolean; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={cx('flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold transition-colors', active ? 'bg-brand text-white' : 'text-white/90 hover:text-white')}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  )
}

function AccountMenu() {
  const { customer, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  if (!customer) {
    return (
      <>
        <div className="hidden items-center gap-2 sm:flex">
          <Link to="/login" className="rounded-full bg-brand-strong px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-deep">
            Sign in
          </Link>
          <Link to="/register" className="rounded-full border border-white/80 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10">
            Sign up
          </Link>
        </div>
        <Link to="/login" className="rounded-full p-2 text-2xl text-white hover:bg-white/10 sm:hidden" aria-label="Sign in">
          <UserIcon />
        </Link>
      </>
    )
  }

  const item = 'block rounded-lg px-3 py-2 text-sm hover:bg-ink/5'
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full p-2 text-white hover:bg-white/10 sm:px-3"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserIcon className="text-2xl sm:text-xl" />
        <span className="hidden max-w-28 truncate text-sm font-semibold sm:inline">{customer.first_name || 'Account'}</span>
        <ChevronDownIcon className="hidden text-sm sm:inline" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-52 animate-fade-in rounded-2xl bg-white p-2 text-ink shadow-lift">
          <p className="truncate px-3 py-2 text-xs text-ink-soft">{customer.email}</p>
          <Link role="menuitem" to="/account" className={item} onClick={() => setOpen(false)}>
            My account
          </Link>
          <Link role="menuitem" to="/account/orders" className={item} onClick={() => setOpen(false)}>
            Orders
          </Link>
          <Link role="menuitem" to="/account/addresses" className={item} onClick={() => setOpen(false)}>
            Addresses
          </Link>
          <button
            role="menuitem"
            type="button"
            className={cx(item, 'w-full text-left text-danger')}
            onClick={async () => {
              setOpen(false)
              await logout()
              navigate('/')
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tree } = useCategories()
  const { customer } = useAuth()
  const roots = tree?.children(null) ?? []

  return (
    <Drawer open={open} onClose={onClose} title="Menu" side="left">
      <nav className="space-y-6 p-5" aria-label="Mobile menu">
        {customer ? (
          <Link to="/account" onClick={onClose} className="block rounded-full bg-accent py-2 text-center text-sm font-semibold text-white">
            My account
          </Link>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Link to="/login" onClick={onClose} className="rounded-full bg-brand-strong py-2 text-center text-sm font-semibold text-white">
              Sign in
            </Link>
            <Link to="/register" onClick={onClose} className="rounded-full border border-accent py-2 text-center text-sm font-semibold text-accent">
              Sign up
            </Link>
          </div>
        )}
        <ul className="space-y-1 font-semibold">
          <li><Link to="/" onClick={onClose} className="block rounded-lg px-3 py-2 hover:bg-ink/5">Home</Link></li>
          <li><Link to="/products" onClick={onClose} className="block rounded-lg px-3 py-2 hover:bg-ink/5">All products</Link></li>
          <li><Link to="/products?collection=best-sellers" onClick={onClose} className="block rounded-lg px-3 py-2 hover:bg-ink/5">Best sellers</Link></li>
        </ul>
        {roots.map((root) => (
          <div key={root.id}>
            <Link to={`/c/${root.handle}`} onClick={onClose} className="mb-2 flex items-center gap-2 font-display text-2xl text-brand">
              {root.handle === 'dog' ? <DogIcon /> : <CatIcon />} {root.name}
            </Link>
            <ul className="grid grid-cols-2 gap-1 text-sm">
              {tree!.children(root.id).map((child) => (
                <li key={child.id}>
                  <Link to={`/c/${child.handle}`} onClick={onClose} className="block rounded-lg px-3 py-2 hover:bg-ink/5">
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </Drawer>
  )
}
