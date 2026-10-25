import { useQuery } from '@tanstack/react-query'
import { finishVnpayPayment } from './api'

export const checkoutKeys = {
  vnpayResult: (search: string) => ['vnpay-result', search] as const,
}

/** Runs once per return URL: the query cache also stops StrictMode or a re-render from completing the cart twice */
export function useVnpayResult(search: string, enabled: boolean) {
  return useQuery({
    queryKey: checkoutKeys.vnpayResult(search),
    queryFn: () => finishVnpayPayment(new URLSearchParams(search)),
    enabled,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  })
}
