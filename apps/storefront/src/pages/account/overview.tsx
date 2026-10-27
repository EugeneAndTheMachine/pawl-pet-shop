import { Link } from 'react-router'
import { AccountHeading } from '../../components/layout/account-layout'
import { ButtonLink } from '../../components/ui/button'
import { MapPinIcon, UserIcon } from '../../components/ui/icons'
import { Skeleton } from '../../components/ui/skeleton'
import { formatAddress } from '../../features/account/address-utils'
import { useAuth } from '../../features/auth/use-auth'
import { OrderCard } from '../../features/orders/components/order-card'
import { useOrders } from '../../features/orders/hooks'

const cardLink = 'text-sm font-semibold text-accent hover:text-accent-dark'

export default function AccountOverviewPage() {
  const { customer } = useAuth()
  const orders = useOrders(3)
  const addresses = customer?.addresses ?? []
  const defaultAddress = formatAddress(addresses.find((a) => a.is_default_shipping) ?? addresses[0])
  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ')

  return (
    <>
      <title>My account – Pawl</title>
      <AccountHeading title={`Hi ${customer?.first_name || 'there'}!`} />

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <UserIcon className="text-accent" /> Profile
            </h2>
            <Link to="/account/profile" className={cardLink}>
              Edit
            </Link>
          </div>
          <p className="text-sm">{name || '—'}</p>
          <p className="text-sm text-ink-soft">{customer?.email}</p>
          <p className="text-sm text-ink-soft">{customer?.phone || 'No phone number yet'}</p>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <MapPinIcon className="text-accent" /> Default address
            </h2>
            <Link to="/account/addresses" className={cardLink}>
              {addresses.length > 0 ? 'Manage' : 'Add'}
            </Link>
          </div>
          {defaultAddress.name ? (
            <>
              <p className="text-sm">{defaultAddress.name}</p>
              {defaultAddress.lines.map((line) => (
                <p key={line} className="text-sm text-ink-soft">
                  {line}
                </p>
              ))}
            </>
          ) : (
            <p className="text-sm text-ink-soft">Save an address to check out faster.</p>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          {(orders.data?.count ?? 0) > 3 && (
            <Link to="/account/orders" className={cardLink}>
              View all
            </Link>
          )}
        </div>
        {orders.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ) : orders.isError ? (
          <p className="text-sm text-danger">We could not load your orders. Please refresh the page.</p>
        ) : orders.data.orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-ink-soft">You have not placed any orders yet.</p>
            <ButtonLink to="/products" size="sm">
              Start shopping
            </ButtonLink>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.data.orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
