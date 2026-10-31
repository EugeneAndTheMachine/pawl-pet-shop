import { Link } from 'react-router'
import { formatVND } from '../../../lib/format'
import { ProductImage } from '../../catalog/components/product-image'
import type { ChatProductCard as Card } from '../api'

export function ChatProductCard({ product, onNavigate }: { product: Card; onNavigate: () => void }) {
  const { price_min: min, price_max: max } = product
  return (
    <Link
      to={`/products/${product.handle}`}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-xl border border-line bg-white p-2 transition-colors hover:border-brand"
    >
      <ProductImage src={product.thumbnail} alt="" className="size-14 shrink-0 rounded-lg bg-surface" />
      <span className="min-w-0 flex-1">
        {product.brand && <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{product.brand}</span>}
        <span className="line-clamp-2 text-sm font-semibold leading-snug">{product.title}</span>
        <span className="mt-0.5 block text-sm">
          {min != null && (
            <span className="font-bold text-brand-strong">
              {max != null && max > min && <span className="mr-1 text-xs font-medium text-ink-soft">from</span>}
              {formatVND(min)}
            </span>
          )}
          {!product.in_stock && <span className="ml-2 text-xs font-medium text-danger">Out of stock</span>}
        </span>
      </span>
    </Link>
  )
}
