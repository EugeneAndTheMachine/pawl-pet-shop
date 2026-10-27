import { Link, useParams } from 'react-router'
import { Button } from '../../../components/ui/button'
import { ChevronLeftIcon, RefreshIcon } from '../../../components/ui/icons'
import { Skeleton } from '../../../components/ui/skeleton'
import { OrderFacts, OrderItems, OrderTotals, StatusBadge } from '../../../features/orders/components/order-details'
import { OrderTimeline } from '../../../features/orders/components/order-timeline'
import { useOrder } from '../../../features/orders/hooks'
import { fulfillmentStatus, paymentStatus } from '../../../features/orders/order-status'
import { useBuyAgain } from '../../../features/orders/use-buy-again'
import { formatDateTime } from '../../../lib/format'

export default function AccountOrderDetailPage() {
  const { id } = useParams()
  const order = useOrder(id)
  const { buyAgain, pending } = useBuyAgain()

  const back = (
    <Link to="/account/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-dark">
      <ChevronLeftIcon /> All orders
    </Link>
  )

  if (order.isPending) {
    return (
      <div className="space-y-4">
        {back}
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    )
  }

  // The Store API only returns orders that belong to the signed-in customer
  if (order.isError) {
    return (
      <>
        {back}
        <div className="rounded-3xl bg-white p-8 text-center shadow-card">
          <title>Order not found – Pawl</title>
          <h1 className="text-lg font-semibold">Order not found</h1>
          <p className="mt-1 text-sm text-ink-soft">This order does not exist or belongs to another account.</p>
        </div>
      </>
    )
  }

  const o = order.data

  return (
    <>
      <title>{`Order #${o.display_id} – Pawl`}</title>
      {back}
      <div className="space-y-5">
        <section className="flex flex-wrap items-start justify-between gap-4 rounded-3xl bg-white p-5 shadow-card sm:p-6">
          <div>
            <h1 className="font-display text-3xl text-brand">Order #{o.display_id}</h1>
            <p className="mt-1 text-sm text-ink-soft">Placed on {formatDateTime(o.created_at)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge {...paymentStatus(o)} />
              <StatusBadge {...fulfillmentStatus(o)} />
            </div>
          </div>
          <Button variant="secondary" onClick={() => buyAgain(o)} loading={pending}>
            <RefreshIcon /> Buy again
          </Button>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6" aria-labelledby="order-progress">
          <h2 id="order-progress" className="mb-4 font-semibold">
            Order progress
          </h2>
          <OrderTimeline order={o} />
        </section>

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
      </div>
    </>
  )
}
