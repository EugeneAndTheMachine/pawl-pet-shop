import type { HttpTypes } from '@medusajs/types'
import { createContext, useContext } from 'react'
import type { RegisterInput } from './api'

export const authKeys = { customer: ['customer'] as const }

export type AuthContextValue = {
  customer: HttpTypes.StoreCustomer | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
