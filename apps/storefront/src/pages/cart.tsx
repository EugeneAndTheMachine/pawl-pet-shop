import { Link } from 'react-router'
import { Breadcrumb } from '../components/layout/breadcrumb'
import { ButtonLink } from '../components/ui/button'
import { CartIcon, ShieldIcon, TrashIcon, TruckIcon } from '../components/ui/icons'
import { QuantityInput } from '../components/ui/quantity-input'
import { Skeleton } from '../components/ui/skeleton'
import { CartTotals } from '../features/cart/components/cart-totals'
import { PromoCodeForm } from '../features/cart/components/promo-code-form'
import { useCart } from '../features/cart/use-cart'
import { ProductImage } from '../features/catalog/components/product-image'
import { variantAvailable } from '../features/catalog/product-utils'
import { formatVND } from '../lib/format'

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem, isUpdating, itemCount } = useCart()
  const items = cart?.items ?? []

  return (
    <div className="container-page py-6 sm:py-8">
      <title>Your cart – Pawl</title>
      <meta name="robots" content="noindex" />
      <Breadcrumb items={[{ label: 'Cart' }]} />
      <h1 className="mt-4 font-display text-3xl text-brand sm:text-4xl">Your cart</h1>

      {isLoading ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center shadow-card">
          <span className="grid size-20 place-items-center rounded-full bg-brand-soft text-4xl text-brand">
            <CartIcon />
          </span>
          <h2 className="text-lg font-semibold">Your cart is empty</h2>
          <p className="max-w-sm text-sm text-ink-soft">Find food, litter and treats your pet will love.</p>
          <ButtonLink to="/products">Start shopping</ButtonLink>
        </div>
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
          <section aria-label="Cart items" className="rounded-3xl bg-white p-4 shadow-card sm:p-6">
            <p className="mb-2 text-sm text-ink-soft">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
            <ul className="divide-y divide-line" aria-busy={isUpdating}>
              {items.map((item) => {
                const max = Math.min(99, variantAvailable(item.variant ?? undefined))
                return (
                  <li key={item.id} className="flex gap-4 py-4">
                    <Link to={`/products/${item.product_handle}`} className="size-20 shrink-0 overflow-hidden rounded-2xl border border-line/60 bg-white p-2 sm:size-24">
                      <ProductImage src={item.thumbnail} alt={item.product_title ?? ''} className="size-full" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <Link to={`/products/${item.product_handle}`} className="line-clamp-2 font-semibold hover:text-brand-strong">
                          {item.product_title}
                        </Link>
                        {item.variant_title && <p className="text-sm text-ink-soft">{item.variant_title}</p>}
                        <p className="text-sm text-ink-soft">{formatVND(item.unit_price)} each</p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <QuantityInput
                          size="sm"
                          value={item.quantity}
                          max={Number.isFinite(max) ? Math.max(max, item.quantity) : 99}
                          disabled={isUpdating}
                          onChange={(quantity) => updateItem(item.id, quantity)}
                          label={`Quantity of ${item.product_title}`}
                        />
                        <p className="w-28 text-right font-bold">{formatVND(item.unit_price * item.quantity)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={isUpdating}
                      className="self-start rounded-full p-2 text-ink-soft hover:bg-danger-soft hover:text-danger"
                      aria-label={`Remove ${item.product_title}`}
                    >
                      <TrashIcon />
                    </button>
                  </li>
                )
              })}
            </ul>
            <Link to="/products" className="mt-2 inline-block text-sm font-semibold text-accent hover:text-accent-dark">
              ← Continue shopping
            </Link>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Order summary">
            <div className="space-y-5 rounded-3xl bg-white p-5 shadow-card sm:p-6">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <PromoCodeForm />
              {cart && <CartTotals cart={cart} />}
              <ButtonLink to="/checkout" size="lg" className="w-full">
                Go to checkout
              </ButtonLink>
            </div>
            <ul className="space-y-2 rounded-3xl bg-surface p-5 text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <TruckIcon className="text-lg text-brand-strong" /> Standard delivery ₫30,000 · Express ₫45,000
              </li>
              <li className="flex items-center gap-2">
                <ShieldIcon className="text-lg text-brand-strong" /> Secure checkout, pay on delivery or by QR bank transfer
              </li>
            </ul>
          </aside>
        </div>
      )}
    </div>
  )
}
