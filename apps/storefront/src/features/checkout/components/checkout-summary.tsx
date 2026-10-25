import type { HttpTypes } from '@medusajs/types'
import { Link } from 'react-router'
import { formatVND } from '../../../lib/format'
import { CartTotals } from '../../cart/components/cart-totals'
import { PromoCodeForm } from '../../cart/components/promo-code-form'
import { ProductImage } from '../../catalog/components/product-image'

/** Order summary column of the checkout: items, discount code and totals */
export function CheckoutSummary({ cart }: { cart: HttpTypes.StoreCart }) {
  const items = cart.items ?? []
  return (
    <div className="space-y-5 rounded-3xl bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <Link to="/cart" className="text-sm font-semibold text-accent hover:text-accent-dark">
          Edit cart
        </Link>
      </div>
      <ul className="max-h-80 divide-y divide-line overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 py-3 first:pt-0">
            <div className="relative size-16 shrink-0 rounded-xl bg-surface p-1">
              <ProductImage src={item.thumbnail} alt={item.product_title ?? ''} className="size-full" />
              <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold leading-5 text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold">{item.product_title}</p>
              {item.variant_title && <p className="text-xs text-ink-soft">{item.variant_title}</p>}
            </div>
            <p className="text-sm font-semibold">{formatVND(item.unit_price * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <PromoCodeForm />
      <CartTotals cart={cart} />
    </div>
  )
}
