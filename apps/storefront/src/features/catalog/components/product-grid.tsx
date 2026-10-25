import type { HttpTypes } from '@medusajs/types'
import { Skeleton } from '../../../components/ui/skeleton'
import { cx } from '../../../lib/cx'
import { ProductCard } from './product-card'

const GRID = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3'

export function ProductGrid({ products, className }: { products: HttpTypes.StoreProduct[]; className?: string }) {
  return (
    <ul className={cx(GRID, className)}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-4 h-6 w-1/2" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cx(GRID, className)} aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
