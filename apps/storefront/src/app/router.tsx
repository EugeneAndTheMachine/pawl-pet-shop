import { createBrowserRouter } from 'react-router'
import { RootLayout } from '../components/layout/root-layout'
import HomePage from '../pages/home'
import NotFoundPage from '../pages/not-found'
import ProductDetailPage from '../pages/product-detail'
import ProductsPage from '../pages/products'
import RouteErrorPage from '../pages/route-error'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
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
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
