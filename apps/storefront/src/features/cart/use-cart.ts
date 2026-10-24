import type { HttpTypes } from '@medusajs/types'
import { createContext, useContext } from 'react'

export const cartKeys = { cart: (id: string | null) => ['cart', id] as const }

export type CartContextValue = {
  cart: HttpTypes.StoreCart | null
  itemCount: number
  isLoading: boolean
  isUpdating: boolean
  addItem: (variantId: string, quantity: number) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
