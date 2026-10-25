import { useParams } from 'react-router'
import { ButtonLink } from '../components/ui/button'
import { CheckIcon, MailIcon, UserIcon } from '../components/ui/icons'
import { Skeleton } from '../components/ui/skeleton'
import { useAuth } from '../features/auth/use-auth'
import { OrderFacts, OrderItems, OrderTotals, StatusBadge } from '../features/orders/components/order-details'
import { useOrder } from '../features/orders/hooks'
import { paymentStatus } from '../features/orders/order-status'
import { formatDateTime } from '../lib/format'
import NotFoundPage from './not-found'

export default function OrderConfirmedPage() {
  const { id } = useParams()
  const { customer } = useAuth()
  const order = useOrder(id)

  if (order.isError) return <NotFoundPage />

  if (order.isPending) {
    return (
      <div className="container-page max-w-3xl space-y-4 py-10">
        <Skeleton className="mx-auto h-40 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    )
  }

  const o = order.data
  const payment = paymentStatus(o)

  return (
    <div className="container-page max-w-3xl space-y-6 py-8 sm:py-12">
      <title>{`Order #${o.display_id} confirmed – Pawl`}</title>

      <section className="rounded-3xl bg-white px-6 py-8 text-center shadow-card sm:px-10">
        <span className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-success-soft text-3xl text-success">
          <CheckIcon />
        </span>
        <h1 className="font-display text-3xl text-brand sm:text-4xl">Thank you!</h1>
        <p className="mt-3 text-lg font-semibold">Order #{o.display_id} has been placed</p>
        <p className="mt-1 text-sm text-ink-soft">Placed on {formatDateTime(o.created_at)}</p>
        <div className="mt-3 flex justify-center">
          <StatusBadge {...payment} />
        </div>
        <p className="mx-auto mt-4 flex max-w-md items-start justify-center gap-2 text-sm text-ink-soft">
          <MailIcon className="mt-0.5 shrink-0" />
          <span>
            A confirmation has been sent to <strong className="text-ink">{o.email}</strong>. We will call before delivery.
          </span>
        </p>
      </section>

      {!customer && o.email && (
        <section className="flex flex-col items-start gap-4 rounded-3xl bg-accent-soft p-5 sm:flex-row sm:items-center sm:p-6">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-2xl text-white">
            <UserIcon />
          </span>
          <div className="flex-1">
            <h2 className="font-semibold">Create an account with this email</h2>
            <p className="text-sm text-ink-soft">Track your orders, save addresses and check out faster next time.</p>
          </div>
          <ButtonLink to={`/register?email=${encodeURIComponent(o.email)}`} variant="secondary">
            Create account
          </ButtonLink>
        </section>
      )}

      <section className="space-y-6 rounded-3xl bg-white p-5 shadow-card sm:p-6" aria-label="Order details">
        <OrderFacts order={o} />
        <div className="border-t border-line pt-4">
          <h2 className="mb-1 font-semibold">Items</h2>
          <OrderItems order={o} />
        </div>
        <div className="border-t border-line pt-4">
          <OrderTotals order={o} />
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink to="/products">Continue shopping</ButtonLink>
        {customer && (
          <ButtonLink to={`/account/orders/${o.id}`} variant="outline">
            View in my orders
          </ButtonLink>
        )}
      </div>
    </div>
  )
}
