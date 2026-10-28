import { useSearchParams } from 'react-router'
import { AccountHeading } from '../../../components/layout/account-layout'
import { ButtonLink } from '../../../components/ui/button'
import { CartIcon } from '../../../components/ui/icons'
import { Skeleton } from '../../../components/ui/skeleton'
import { Pagination } from '../../../features/catalog/components/pagination'
import { OrderCard } from '../../../features/orders/components/order-card'
import { useOrders } from '../../../features/orders/hooks'

const PAGE_SIZE = 10

export default function AccountOrdersPage() {
  const [params] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const orders = useOrders(PAGE_SIZE, (page - 1) * PAGE_SIZE)
  const totalPages = Math.ceil((orders.data?.count ?? 0) / PAGE_SIZE)

  return (
    <>
      <title>My orders – Pawl</title>
      <meta name="robots" content="noindex" />
      <AccountHeading title="My orders">{orders.data && orders.data.count > 0 && <p className="text-sm text-ink-soft">{orders.data.count} orders</p>}</AccountHeading>

      {orders.isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : orders.isError ? (
        <p className="rounded-3xl bg-white p-6 text-sm text-danger shadow-card">We could not load your orders. Please refresh the page.</p>
      ) : orders.data.orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-14 text-center shadow-card">
          <span className="grid size-16 place-items-center rounded-full bg-brand-soft text-3xl text-brand">
            <CartIcon />
          </span>
          <p className="text-ink-soft">No orders yet. Your first order will show up here.</p>
          <ButtonLink to="/products">Start shopping</ButtonLink>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3" aria-busy={orders.isPlaceholderData}>
            {orders.data.orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </div>
      )}
    </>
  )
}
