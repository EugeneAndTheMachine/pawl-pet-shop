import type { HttpTypes } from '@medusajs/types'
import { createContext, useContext } from 'react'

export type CartLineInput = { variantId: string; quantity: number }

export const cartKeys = { cart: (id: string | null) => ['cart', id] as const }

export type CartContextValue = {
  cart: HttpTypes.StoreCart | null
  itemCount: number
  isLoading: boolean
  isUpdating: boolean
  addItem: (variantId: string, quantity: number, options?: { openDrawer?: boolean }) => Promise<boolean>
  /** Adds several lines in one go ("Buy again"), creating the cart once */
  addItems: (lines: CartLineInput[], options?: { openDrawer?: boolean }) => Promise<boolean>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  /** Replaces the cached cart after a checkout step updated it on the server */
  setCart: (cart: HttpTypes.StoreCart | null) => void
  /** Forgets the cart (after the order is placed) */
  clearCart: () => void
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
