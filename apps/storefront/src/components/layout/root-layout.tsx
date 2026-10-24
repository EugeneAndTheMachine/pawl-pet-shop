import { Outlet, ScrollRestoration } from 'react-router'
import { MiniCartDrawer } from '../../features/cart/components/mini-cart-drawer'
import { Footer } from './footer'
import { Header } from './header'

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-50 rounded-full bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Bỏ qua đến nội dung chính
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MiniCartDrawer />
      <ScrollRestoration />
    </div>
  )
}
