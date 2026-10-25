import type { HttpTypes } from '@medusajs/types'
import { Link } from 'react-router'
import { cx } from '../../../lib/cx'
import { formatVND } from '../../../lib/format'
import { formatAddress } from '../../account/address-utils'
import { ProductImage } from '../../catalog/components/product-image'
import { orderPaymentProvider, paymentMethodLabel, TONE_CLASSES } from '../order-status'

export function StatusBadge({ label, tone }: { label: string; tone: keyof typeof TONE_CLASSES }) {
  return <span className={cx('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', TONE_CLASSES[tone])}>{label}</span>
}

export function OrderItems({ order }: { order: HttpTypes.StoreOrder }) {
  return (
    <ul className="divide-y divide-line">
      {(order.items ?? []).map((item) => (
        <li key={item.id} className="flex gap-3 py-3">
          <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-white p-1">
            <ProductImage src={item.thumbnail} alt={item.product_title ?? item.title} className="size-full" />
          </div>
          <div className="min-w-0 flex-1">
            {item.product_handle ? (
              <Link to={`/products/${item.product_handle}`} className="line-clamp-2 text-sm font-semibold hover:text-brand-strong">
                {item.product_title ?? item.title}
              </Link>
            ) : (
              <p className="line-clamp-2 text-sm font-semibold">{item.product_title ?? item.title}</p>
            )}
            <p className="text-xs text-ink-soft">
              {item.variant_title && `${item.variant_title} · `}Qty {item.quantity}
            </p>
          </div>
          <p className="text-sm font-semibold">{formatVND(item.unit_price * item.quantity)}</p>
        </li>
      ))}
    </ul>
  )
}

export function OrderTotals({ order }: { order: HttpTypes.StoreOrder }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-ink-soft">Subtotal</dt>
        <dd>{formatVND(order.original_item_total ?? order.item_total)}</dd>
      </div>
      {order.discount_total > 0 && (
        <div className="flex justify-between text-success">
          <dt>Discount</dt>
          <dd>−{formatVND(order.discount_total)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-ink-soft">Shipping</dt>
        <dd>{formatVND(order.shipping_total)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3">
        <dt className="font-semibold">Total</dt>
        <dd className="text-xl font-bold text-brand-strong">{formatVND(order.total)}</dd>
      </div>
      <p className="text-right text-xs text-ink-soft">Includes {formatVND(order.tax_total)} VAT</p>
    </dl>
  )
}

/** Shipping address, delivery method and payment method */
export function OrderFacts({ order }: { order: HttpTypes.StoreOrder }) {
  const address = formatAddress(order.shipping_address)
  return (
    <div className="grid gap-5 text-sm sm:grid-cols-3">
      <div>
        <h3 className="mb-1 font-semibold">Delivery address</h3>
        <p>{address.name}</p>
        {address.lines.map((line) => (
          <p key={line} className="text-ink-soft">
            {line}
          </p>
        ))}
      </div>
      <div>
        <h3 className="mb-1 font-semibold">Delivery method</h3>
        <p className="text-ink-soft">{order.shipping_methods?.[0]?.name ?? '—'}</p>
      </div>
      <div>
        <h3 className="mb-1 font-semibold">Payment</h3>
        <p className="text-ink-soft">{paymentMethodLabel(orderPaymentProvider(order))}</p>
      </div>
    </div>
  )
}
