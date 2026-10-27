import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, type ReactNode } from 'react'
import { transferCart } from '../cart/api'
import { useCart } from '../cart/use-cart'
import { getCustomer, login as loginRequest, logout as logoutRequest, register as registerRequest, type RegisterInput } from './api'
import { AuthContext, authKeys, type AuthContextValue } from './use-auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { cart, setCart, clearCart } = useCart()
  const customerQuery = useQuery({ queryKey: authKeys.customer, queryFn: getCustomer, staleTime: 5 * 60_000, retry: false })

  const afterSignIn = useCallback(async () => {
    // staleTime 0: the cached value is the guest's null, it must be fetched again with the new session
    const customer = await queryClient.fetchQuery({ queryKey: authKeys.customer, queryFn: getCustomer, staleTime: 0 })
    // Attach the guest cart to the account so it follows the customer
    if (customer && cart && cart.customer_id !== customer.id) {
      try {
        setCart(await transferCart(cart.id))
      } catch {
        // The cart stays usable as a guest cart
      }
    }
  }, [queryClient, cart, setCart])

  const value = useMemo<AuthContextValue>(
    () => ({
      customer: customerQuery.data ?? null,
      isLoading: customerQuery.isLoading,
      login: async (email, password) => {
        await loginRequest(email, password)
        await afterSignIn()
      },
      register: async (input: RegisterInput) => {
        await registerRequest(input)
        await afterSignIn()
      },
      logout: async () => {
        await logoutRequest().catch(() => undefined)
        clearCart()
        queryClient.setQueryData(authKeys.customer, null)
        queryClient.removeQueries({ queryKey: ['orders'] })
      },
      refresh: async () => {
        await queryClient.invalidateQueries({ queryKey: authKeys.customer })
      },
    }),
    [customerQuery.data, customerQuery.isLoading, afterSignIn, clearCart, queryClient],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
