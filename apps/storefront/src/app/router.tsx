import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { AccountLayout } from '../components/layout/account-layout'
import { AppLoading } from '../components/layout/app-loading'
import { RootLayout } from '../components/layout/root-layout'
import HomePage from '../pages/home'
import NotFoundPage from '../pages/not-found'
import ProductDetailPage from '../pages/product-detail'
import ProductsPage from '../pages/products'
import RouteErrorPage from '../pages/route-error'

type PageModule = { default: ComponentType }

/**
 * Pages outside the catalog load on demand, so the first visit only downloads what browsing needs
 * (forms, zod and markdown live in their own chunks). The header shows a progress bar meanwhile.
 */
const page = (load: () => Promise<PageModule>): Pick<RouteObject, 'lazy'> => ({
  lazy: async () => ({ Component: (await load()).default }),
})

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    hydrateFallbackElement: <AppLoading />,
    children: [
      {
        // Errors render inside the layout so the header and footer stay usable
        errorElement: <RouteErrorPage />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/products', element: <ProductsPage /> },
          { path: '/products/:handle', element: <ProductDetailPage /> },
          { path: '/c/:handle', element: <ProductsPage /> },
          { path: '/search', element: <ProductsPage /> },
          { path: '/cart', ...page(() => import('../pages/cart')) },
          { path: '/checkout', ...page(() => import('../pages/checkout')) },
          { path: '/checkout/pay', ...page(() => import('../pages/checkout-pay')) },
          { path: '/orders/:id/confirmed', ...page(() => import('../pages/order-confirmed')) },
          { path: '/login', ...page(() => import('../pages/auth/login')) },
          { path: '/register', ...page(() => import('../pages/auth/register')) },
          { path: '/forgot-password', ...page(() => import('../pages/auth/forgot-password')) },
          { path: '/reset-password', ...page(() => import('../pages/auth/reset-password')) },
          { path: '/policies/:slug', ...page(() => import('../pages/policy')) },
          { path: '/about', ...page(() => import('../pages/about')) },
          { path: '/contact', ...page(() => import('../pages/contact')) },
          {
            // Signed-in customers only (RequireAuth inside the layout)
            path: '/account',
            element: <AccountLayout />,
            children: [
              { index: true, ...page(() => import('../pages/account/overview')) },
              { path: 'orders', ...page(() => import('../pages/account/orders/list')) },
              { path: 'orders/:id', ...page(() => import('../pages/account/orders/detail')) },
              { path: 'profile', ...page(() => import('../pages/account/profile')) },
              { path: 'addresses', ...page(() => import('../pages/account/addresses')) },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
