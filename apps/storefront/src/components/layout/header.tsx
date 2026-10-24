import { Link } from 'react-router'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="font-display text-3xl leading-none text-brand" aria-label="Pawl – Trang chủ">
          Pawl
        </Link>
        <nav aria-label="Điều hướng chính" className="flex items-center gap-4 text-sm font-medium">
          <Link to="/" className="hover:text-brand">Mèo</Link>
          <Link to="/" className="hover:text-brand">Chó</Link>
        </nav>
      </div>
    </header>
  )
}
