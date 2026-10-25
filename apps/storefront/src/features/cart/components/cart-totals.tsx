import type { HttpTypes } from '@medusajs/types'
import { formatVND } from '../../../lib/format'

type Totals = Pick<
  HttpTypes.StoreCart,
  'original_item_total' | 'item_total' | 'discount_total' | 'shipping_total' | 'tax_total' | 'total' | 'shipping_methods'
>

/** Prices are tax-inclusive: subtotal − discount + shipping = total, with the VAT share shown for information */
export function CartTotals({ cart }: { cart: Totals }) {
  const hasShipping = (cart.shipping_methods ?? []).length > 0

  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-ink-soft">Subtotal</dt>
        <dd className="font-medium">{formatVND(cart.original_item_total ?? cart.item_total)}</dd>
      </div>
      {cart.discount_total > 0 && (
        <div className="flex justify-between text-success">
          <dt>Discount</dt>
          <dd className="font-medium">−{formatVND(cart.discount_total)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-ink-soft">Shipping</dt>
        <dd className="font-medium">{hasShipping ? formatVND(cart.shipping_total) : 'Calculated at checkout'}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3">
        <dt className="font-semibold">Total</dt>
        <dd className="text-xl font-bold text-brand-strong">{formatVND(cart.total)}</dd>
      </div>
      <p className="text-right text-xs text-ink-soft">Includes {formatVND(cart.tax_total)} VAT</p>
    </dl>
  )
}
