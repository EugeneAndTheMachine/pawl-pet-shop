import type { ReactNode } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router'
import { Skeleton } from '../components/ui/skeleton'
import { safeRedirect } from '../features/auth/api'
import { useAuth } from '../features/auth/use-auth'

/** Account pages: guests are sent to /login and come back here after signing in */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { customer, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[15rem_1fr]">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    )
  }
  if (!customer) {
    const redirect = location.pathname + location.search
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
  }
  return children
}

/** Sign-in pages: once signed in (already, or just now), go to ?redirect= or the account */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { customer, isLoading } = useAuth()
  const [params] = useSearchParams()
  if (isLoading) return <div className="min-h-[60vh]" />
  if (customer) return <Navigate to={safeRedirect(params.get('redirect'))} replace />
  return children
}
