import type { HttpTypes } from '@medusajs/types'
import { queryOptions, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { listPaymentProviders, listShippingOptions } from '../cart/api'

/** Options depend on the delivery address, so the province is part of the key */
export function shippingOptionsQuery(cartId: string, province: string | null | undefined) {
  return queryOptions({
    queryKey: ['shipping-options', cartId, province],
    queryFn: () => listShippingOptions(cartId),
  })
}

export function paymentProvidersQuery(regionId: string | null | undefined) {
  return queryOptions({
    queryKey: ['payment-providers', regionId],
    queryFn: () => listPaymentProviders(regionId!),
    enabled: Boolean(regionId),
    staleTime: 30 * 60_000,
  })
}

/**
 * Loads the delivery and payment options in the background as soon as they can be known,
 * so those steps open without waiting while the shopper is still filling in earlier steps.
 */
export function usePrefetchCheckoutOptions(cart: HttpTypes.StoreCart | null) {
  const queryClient = useQueryClient()
  const cartId = cart?.id
  const regionId = cart?.region_id
  const province = cart?.shipping_address?.province

  useEffect(() => {
    if (regionId) void queryClient.prefetchQuery(paymentProvidersQuery(regionId))
  }, [queryClient, regionId])

  useEffect(() => {
    if (cartId && province) void queryClient.prefetchQuery(shippingOptionsQuery(cartId, province))
  }, [queryClient, cartId, province])
}
