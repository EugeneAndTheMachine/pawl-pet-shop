import { Outlet, ScrollRestoration, useNavigation } from 'react-router'
import { MiniCartDrawer } from '../../features/cart/components/mini-cart-drawer'
import { ChatLauncher } from '../../features/chat/components/chat-launcher'
import { Footer } from './footer'
import { Header } from './header'

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-50 rounded-full bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to main content
      </a>
      <NavigationProgress />
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MiniCartDrawer />
      <ChatLauncher />
      <ScrollRestoration />
    </div>
  )
}

/** Thin bar at the top while the next page's code is downloading */
function NavigationProgress() {
  const navigation = useNavigation()
  if (navigation.state === 'idle') return null
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-brand-soft" role="progressbar" aria-label="Loading page">
      <div className="h-full w-1/3 animate-progress bg-brand" />
    </div>
  )
}
