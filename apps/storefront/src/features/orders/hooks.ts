import { useQuery } from '@tanstack/react-query'
import { retrieveOrder } from './api'

// Everything starts with 'orders' so signing out can drop all of it at once
export const orderKeys = {
  all: ['orders'] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: () => retrieveOrder(id!),
    enabled: Boolean(id),
  })
}
