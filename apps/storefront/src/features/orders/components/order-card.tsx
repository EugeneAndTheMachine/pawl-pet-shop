import type { HttpTypes } from '@medusajs/types'
import { Link } from 'react-router'
import { ChevronRightIcon } from '../../../components/ui/icons'
import { formatDate, formatVND } from '../../../lib/format'
import { ProductImage } from '../../catalog/components/product-image'
import { fulfillmentStatus, paymentStatus } from '../order-status'
import { StatusBadge } from './order-details'

/** One order in the account lists: number, date, total, statuses and item thumbnails */
export function OrderCard({ order }: { order: HttpTypes.StoreOrder }) {
  const items = order.items ?? []
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Link
      to={`/account/orders/${order.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-card sm:flex-row sm:items-center"
    >
      <div className="flex -space-x-3">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="size-14 overflow-hidden rounded-xl border-2 border-white bg-surface p-1">
            <ProductImage src={item.thumbnail} alt="" className="size-full" />
          </div>
        ))}
        {items.length > 3 && (
          <div className="grid size-14 place-items-center rounded-xl border-2 border-white bg-accent-soft text-sm font-semibold text-accent">+{items.length - 3}</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Order #{order.display_id}</p>
        <p className="text-sm text-ink-soft">
          {formatDate(order.created_at)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusBadge {...paymentStatus(order)} />
          <StatusBadge {...fulfillmentStatus(order)} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="text-lg font-bold">{formatVND(order.total)}</p>
        <ChevronRightIcon className="text-ink-soft transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </Link>
  )
}
