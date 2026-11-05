import type { HttpTypes } from '@medusajs/types'
import { Link } from 'react-router'
import { CartIcon, ChevronRightIcon } from '../../../components/ui/icons'
import { formatVND } from '../../../lib/format'
import { useCart } from '../../cart/use-cart'
import { usePrefetchProduct } from '../hooks'
import { isProductInStock, isVariantInStock, productBrand, productPriceRange, variantOriginalPrice } from '../product-utils'
import { healthLabels } from '../tag-labels'
import { ProductImage } from './product-image'

export function ProductCard({ product }: { product: HttpTypes.StoreProduct }) {
  const { addItem, isUpdating } = useCart()
  const prefetch = usePrefetchProduct()
  const variants = product.variants ?? []
  const { min, max } = productPriceRange(product)
  const inStock = isProductInStock(product)
  const brand = productBrand(product)
  const health = healthLabels(product.tags).slice(0, 2)
  const single = variants.length === 1 ? variants[0] : undefined
  const original = single ? variantOriginalPrice(single) : undefined
  const onSale = single && original != null && min != null && original > min
  const href = `/products/${product.handle}`

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-shadow hover:shadow-lift"
      onPointerEnter={() => prefetch(product.handle)}
      onFocus={() => prefetch(product.handle)}
    >
      {/* Fixed square frame: the photo is taken out of the flow and scaled to fit, so tall or wide
          photos never stretch the card and are always shown whole */}
      <Link to={href} className="relative block aspect-square overflow-hidden border-b border-line/60 bg-white" tabIndex={-1} aria-hidden="true">
        <ProductImage
          src={product.thumbnail}
          alt=""
          className="absolute inset-0 size-full p-4 transition-transform duration-300 group-hover:scale-105"
        />
        {!inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-semibold text-white">Out of stock</span>
        )}
        {inStock && onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white">Sale</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {brand && <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{brand}</p>}
        <h3 className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug">
          <Link to={href} className="after:absolute after:inset-0 hover:text-brand-strong focus-visible:outline-none">
            {product.title}
          </Link>
        </h3>
        {health.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {health.map((label) => (
              <span key={label} className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-dark">
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            {min != null ? (
              <p className="flex flex-wrap items-baseline gap-x-1 text-lg font-bold text-brand-strong">
                {max != null && max > min && <span className="text-xs font-medium text-ink-soft">from</span>}
                {formatVND(min)}
              </p>
            ) : (
              <p className="text-sm text-ink-soft">Price on request</p>
            )}
            {onSale && <p className="text-xs text-ink-soft line-through">{formatVND(original)}</p>}
            {variants.length > 1 && <p className="text-xs text-ink-soft">{variants.length} options</p>}
          </div>

          {/* Quick add only when there is nothing to choose; otherwise go to the detail page */}
          {single && isVariantInStock(single) ? (
            <button
              type="button"
              onClick={() => addItem(single.id, 1)}
              disabled={isUpdating}
              className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-brand-strong text-lg text-white transition-colors hover:bg-brand-deep disabled:opacity-60"
              aria-label={`Add ${product.title} to cart`}
            >
              <CartIcon />
            </button>
          ) : (
            <Link
              to={href}
              className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-line text-lg text-ink transition-colors hover:border-accent hover:text-accent"
              aria-label={inStock ? `Choose options for ${product.title}` : `View ${product.title}`}
            >
              <ChevronRightIcon />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
