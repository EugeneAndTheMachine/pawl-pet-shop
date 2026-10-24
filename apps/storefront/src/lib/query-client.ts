import { QueryClient } from '@tanstack/react-query'

// The database lives in Singapore, so keep data fresh for a while to avoid refetch jank.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
