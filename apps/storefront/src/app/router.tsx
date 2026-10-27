import { createBrowserRouter } from 'react-router'
import { AccountLayout } from '../components/layout/account-layout'
import { RootLayout } from '../components/layout/root-layout'
import AccountAddressesPage from '../pages/account/addresses'
import AccountOrderDetailPage from '../pages/account/orders/detail'
import AccountOrdersPage from '../pages/account/orders/list'
import AccountOverviewPage from '../pages/account/overview'
import AccountProfilePage from '../pages/account/profile'
import ForgotPasswordPage from '../pages/auth/forgot-password'
import LoginPage from '../pages/auth/login'
import RegisterPage from '../pages/auth/register'
import ResetPasswordPage from '../pages/auth/reset-password'
import CartPage from '../pages/cart'
import CheckoutPage from '../pages/checkout'
import CheckoutPayPage from '../pages/checkout-pay'
import HomePage from '../pages/home'
import NotFoundPage from '../pages/not-found'
import OrderConfirmedPage from '../pages/order-confirmed'
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
          { path: '/cart', element: <CartPage /> },
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/checkout/pay', element: <CheckoutPayPage /> },
          { path: '/orders/:id/confirmed', element: <OrderConfirmedPage /> },
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
          {
            // Signed-in customers only (RequireAuth inside the layout)
            path: '/account',
            element: <AccountLayout />,
            children: [
              { index: true, element: <AccountOverviewPage /> },
              { path: 'orders', element: <AccountOrdersPage /> },
              { path: 'orders/:id', element: <AccountOrderDetailPage /> },
              { path: 'profile', element: <AccountProfilePage /> },
              { path: 'addresses', element: <AccountAddressesPage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
