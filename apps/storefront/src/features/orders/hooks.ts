import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listOrders, retrieveOrder } from './api'

// Everything starts with 'orders' so signing out can drop all of it at once
export const orderKeys = {
  all: ['orders'] as const,
  list: (limit: number, offset: number) => ['orders', 'list', limit, offset] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
}

export function useOrders(limit: number, offset = 0) {
  return useQuery({
    queryKey: orderKeys.list(limit, offset),
    queryFn: () => listOrders(limit, offset),
    placeholderData: keepPreviousData,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: () => retrieveOrder(id!),
    enabled: Boolean(id),
  })
}
