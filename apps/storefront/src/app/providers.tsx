import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ToastProvider } from '../components/ui/toast'
import { AuthProvider } from '../features/auth/auth-context'
import { CartProvider } from '../features/cart/cart-context'
import { queryClient } from '../lib/query-client'

// AuthProvider sits inside CartProvider so signing in can transfer the guest cart
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CartProvider>
          <AuthProvider>{children}</AuthProvider>
        </CartProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
