import type { HttpTypes } from '@medusajs/types'
import { FetchError } from '@medusajs/js-sdk'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useToast } from '../../components/ui/use-toast'
import { readStorage, removeStorage, writeStorage } from '../../lib/storage'
import { useRegion } from '../catalog/hooks'
import { addLineItem, createCart, deleteLineItem, retrieveCart, updateLineItem } from './api'
import { CartContext, cartKeys, type CartContextValue } from './use-cart'

const CART_ID_KEY = 'pawl_cart_id'

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

  const onError = useCallback(
    (error: Error) => {
      const outOfStock = error instanceof FetchError && /inventory|stock/i.test(error.message)
      showToast(outOfStock ? 'Sản phẩm không còn đủ số lượng bạn chọn.' : 'Không cập nhật được giỏ hàng. Vui lòng thử lại.', 'error')
    },
    [showToast],
  )

  const addMutation = useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: string; quantity: number }) => {
      let id = cartQuery.data?.id ?? null
      if (!id) {
        if (!region.data) throw new Error('Region not loaded')
        id = (await createCart(region.data.id)).id
      }
      try {
        return await addLineItem(id, variantId, quantity)
      } catch (error) {
        // Only when the stored cart is gone (completed in another tab): retry once with a fresh cart
        if (!region.data || (await retrieveCart(id))) throw error
        const fresh = await createCart(region.data.id)
        return addLineItem(fresh.id, variantId, quantity)
      }
    },
    onSuccess: (cart) => {
      setCart(cart)
      setDrawerOpen(true)
    },
    onError: (error) => {
      const outOfStock = error instanceof FetchError && /inventory|stock/i.test(error.message)
      showToast(outOfStock ? 'Sản phẩm không còn đủ số lượng bạn chọn.' : 'Không thêm được vào giỏ. Vui lòng thử lại.', 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ lineId, quantity }: { lineId: string; quantity: number }) => updateLineItem(cartId!, lineId, quantity),
    onSuccess: setCart,
    onError,
  })

  const removeMutation = useMutation({
    mutationFn: (lineId: string) => deleteLineItem(cartId!, lineId),
    onSuccess: setCart,
    onError,
  })

  const cart = cartQuery.data ?? null
  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
      isLoading: cartQuery.isLoading,
      isUpdating: addMutation.isPending || updateMutation.isPending || removeMutation.isPending,
      addItem: async (variantId, quantity) => {
        await addMutation.mutateAsync({ variantId, quantity }).catch(() => undefined)
      },
      updateItem: async (lineId, quantity) => {
        await updateMutation.mutateAsync({ lineId, quantity }).catch(() => undefined)
      },
      removeItem: async (lineId) => {
        await removeMutation.mutateAsync(lineId).catch(() => undefined)
      },
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [cart, cartQuery.isLoading, addMutation, updateMutation, removeMutation, isDrawerOpen],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

