import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import logoLight from '../../assets/images/logo-light.webp'
import { useCart } from '../../features/cart/use-cart'
import { useCategories } from '../../features/catalog/hooks'
import { cx } from '../../lib/cx'
import { Drawer } from '../ui/drawer'
import { CartIcon, CatIcon, DogIcon, MenuIcon, TruckIcon, UserIcon, WalletIcon } from '../ui/icons'
import { SearchBox } from './search-box'

const navLink = ({ isActive }: { isActive: boolean }) =>
  cx('rounded-full px-3 py-2 text-sm font-semibold transition-colors', isActive ? 'text-brand' : 'text-white hover:text-brand')

export function Header() {
  const { itemCount, openDrawer } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const species = pathname.startsWith('/c/meo') ? 'meo' : pathname.startsWith('/c/cho') ? 'cho' : null

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand-soft text-ink">
        <div className="container-page flex h-8 items-center justify-center gap-6 text-xs font-medium sm:justify-between">
          <p className="flex items-center gap-1.5">
            <TruckIcon className="text-brand-strong" /> Giao nhanh trong ngày nội thành TP.HCM
          </p>
          <p className="hidden items-center gap-1.5 sm:flex">
            <WalletIcon className="text-brand-strong" /> Thanh toán khi nhận hàng (COD) hoặc VNPay
          </p>
        </div>
      </div>

      <div className="bg-accent shadow-md">
        <div className="container-page flex h-16 items-center gap-2 sm:gap-4">
          <button type="button" className="-ml-2 rounded-full p-2 text-2xl text-white hover:bg-white/10 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Mở menu">
            <MenuIcon />
          </button>

          <Link to="/" className="shrink-0" aria-label="Pawl – Trang chủ">
            <img src={logoLight} alt="Pawl" width={87} height={40} className="h-9 w-auto sm:h-10" />
          </Link>

          <nav aria-label="Điều hướng chính" className="ml-4 hidden items-center gap-1 lg:flex">
            <NavLink to="/" end className={navLink}>
              Trang chủ
            </NavLink>
            <NavLink to="/products" end className={navLink}>
              Sản phẩm
            </NavLink>
            <div className="ml-2 flex rounded-full bg-accent-deep/60 p-1" role="group" aria-label="Chọn thú cưng">
              <SpeciesLink to="/c/meo" active={species === 'meo'} icon={<CatIcon />} label="Mèo" />
              <SpeciesLink to="/c/cho" active={species === 'cho'} icon={<DogIcon />} label="Chó" />
            </div>
          </nav>

          <SearchBox className="ml-auto hidden w-full max-w-xs md:block xl:max-w-sm" />

          <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="rounded-full bg-brand-strong px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-deep">
                Đăng nhập
              </Link>
              <Link to="/register" className="rounded-full border border-white/80 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10">
                Đăng ký
              </Link>
            </div>
            <Link to="/login" className="rounded-full p-2 text-2xl text-white hover:bg-white/10 sm:hidden" aria-label="Tài khoản">
              <UserIcon />
            </Link>
            <button type="button" onClick={openDrawer} className="relative rounded-full p-2 text-2xl text-white hover:bg-white/10" aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}>
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
      className={cx(
        'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold transition-colors',
        active ? 'bg-brand text-white' : 'text-white/90 hover:text-white',
      )}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tree } = useCategories()
  const roots = tree?.children(null) ?? []

  return (
    <Drawer open={open} onClose={onClose} title="Danh mục" side="left">
      <nav className="space-y-6 p-5" aria-label="Menu di động">
        <div className="grid grid-cols-2 gap-2">
          <Link to="/login" onClick={onClose} className="rounded-full bg-brand-strong py-2 text-center text-sm font-semibold text-white">
            Đăng nhập
          </Link>
          <Link to="/register" onClick={onClose} className="rounded-full border border-accent py-2 text-center text-sm font-semibold text-accent">
            Đăng ký
          </Link>
        </div>
        <ul className="space-y-1 font-semibold">
          <li><Link to="/" onClick={onClose} className="block rounded-lg px-3 py-2 hover:bg-ink/5">Trang chủ</Link></li>
          <li><Link to="/products" onClick={onClose} className="block rounded-lg px-3 py-2 hover:bg-ink/5">Tất cả sản phẩm</Link></li>
          <li><Link to="/products?collection=ban-chay" onClick={onClose} className="block rounded-lg px-3 py-2 hover:bg-ink/5">Bán chạy</Link></li>
        </ul>
        {roots.map((root) => (
          <div key={root.id}>
            <Link to={`/c/${root.handle}`} onClick={onClose} className="mb-2 flex items-center gap-2 font-display text-2xl text-brand">
              {root.handle === 'cho' ? <DogIcon /> : <CatIcon />} {root.name}
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
