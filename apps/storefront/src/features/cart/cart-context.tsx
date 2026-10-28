import type { HttpTypes } from '@medusajs/types'
import { FetchError } from '@medusajs/js-sdk'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useToast } from '../../components/ui/use-toast'
import { readStorage, removeStorage, writeStorage } from '../../lib/storage'
import { useRegion } from '../catalog/hooks'
import { addLineItem, createCart, deleteLineItem, retrieveCart, updateLineItem } from './api'
import { CartContext, cartKeys, type CartContextValue, type CartLineInput } from './use-cart'

const CART_ID_KEY = 'pawl_cart_id'

function errorMessage(error: unknown, fallback: string) {
  return error instanceof FetchError && /inventory|stock/i.test(error.message) ? 'Sorry, there is not enough stock for that quantity.' : fallback
}

export function CartProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const region = useRegion()
  const [cartId, setCartId] = useState<string | null>(() => readStorage(CART_ID_KEY))
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const forgetCart = useCallback(() => {
    removeStorage(CART_ID_KEY)
    setCartId(null)
  }, [])

  const cartQuery = useQuery({
    queryKey: cartKeys.cart(cartId),
    queryFn: async () => {
      const cart = await retrieveCart(cartId!)
      if (!cart) forgetCart()
      return cart
    },
    enabled: Boolean(cartId),
    staleTime: 30_000,
  })

  const setCart = useCallback(
    (cart: HttpTypes.StoreCart | null) => {
      if (!cart) {
        forgetCart()
        return
      }
      writeStorage(CART_ID_KEY, cart.id)
      setCartId(cart.id)
      queryClient.setQueryData(cartKeys.cart(cart.id), cart)
    },
    [forgetCart, queryClient],
  )

  const addMutation = useMutation({
    mutationFn: async ({ lines }: { lines: CartLineInput[]; openDrawer: boolean }) => {
      let id = cartQuery.data?.id ?? null
      if (!id) {
        if (!region.data) throw new Error('Region not loaded')
        // First add: one request creates the cart with its items. If one of them cannot be added
        // (e.g. out of stock) the whole request fails, so fall back to adding the lines one by one.
        try {
          return { cart: await createCart(region.data.id, lines), failed: 0 }
        } catch {
          id = (await createCart(region.data.id)).id
        }
      }
      // Lines that fail (e.g. out of stock) are skipped so the rest still reach the cart
      const addAll = async (cartId: string) => {
        let cart: HttpTypes.StoreCart | null = null
        let failed = 0
        let lastError: unknown
        for (const line of lines) {
          try {
            cart = await addLineItem(cartId, line.variantId, line.quantity)
          } catch (error) {
            failed++
            lastError = error
          }
        }
        if (!cart) throw lastError
        return { cart, failed }
      }
      try {
        return await addAll(id)
      } catch (error) {
        // Only when the stored cart is gone (completed in another tab): retry once with a fresh cart
        if (!region.data || (await retrieveCart(id))) throw error
        const fresh = await createCart(region.data.id)
        return addAll(fresh.id)
      }
    },
    onSuccess: ({ cart, failed }, { openDrawer }) => {
      setCart(cart)
      if (openDrawer) setDrawerOpen(true)
      if (failed > 0) showToast(`${failed} ${failed === 1 ? 'item is' : 'items are'} no longer available and ${failed === 1 ? 'was' : 'were'} not added.`, 'info')
    },
    onError: (error) => showToast(errorMessage(error, 'Could not add the item to your cart. Please try again.'), 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ lineId, quantity }: { lineId: string; quantity: number }) => updateLineItem(cartId!, lineId, quantity),
    onSuccess: setCart,
    onError: (error) => showToast(errorMessage(error, 'Could not update your cart. Please try again.'), 'error'),
  })

  const removeMutation = useMutation({
    mutationFn: (lineId: string) => deleteLineItem(cartId!, lineId),
    onSuccess: setCart,
    onError: () => showToast('Could not update your cart. Please try again.', 'error'),
  })

  const cart = cartQuery.data ?? null
  // Cart updates take a few seconds (many database round trips), so the badge counts items being added right away
  const pendingCount = addMutation.isPending ? (addMutation.variables?.lines ?? []).reduce((sum, line) => sum + line.quantity, 0) : 0
  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0) + pendingCount,
      isLoading: cartQuery.isLoading,
      isUpdating: addMutation.isPending || updateMutation.isPending || removeMutation.isPending,
      addItem: async (variantId, quantity, options) =>
        addMutation
          .mutateAsync({ lines: [{ variantId, quantity }], openDrawer: options?.openDrawer ?? true })
          .then(() => true)
          .catch(() => false),
      addItems: async (lines, options) =>
        lines.length === 0
          ? false
          : addMutation
              .mutateAsync({ lines, openDrawer: options?.openDrawer ?? true })
              .then(() => true)
              .catch(() => false),
      updateItem: async (lineId, quantity) => {
        await updateMutation.mutateAsync({ lineId, quantity }).catch(() => undefined)
      },
      removeItem: async (lineId) => {
        await removeMutation.mutateAsync(lineId).catch(() => undefined)
      },
      setCart,
      clearCart: forgetCart,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [cart, pendingCount, cartQuery.isLoading, addMutation, updateMutation, removeMutation, setCart, forgetCart, isDrawerOpen],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
