import type { HttpTypes } from '@medusajs/types'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronRightIcon } from '../../../components/ui/icons'
import { ProductCard } from './product-card'
import { ProductCardSkeleton } from './product-grid'

type ProductRailProps = {
  title: ReactNode
  subtitle?: string
  products: HttpTypes.StoreProduct[] | undefined
  isLoading: boolean
  viewAllHref?: string
}

/** Horizontal scroller on mobile, 4-column grid on desktop */
export function ProductRail({ title, subtitle, products, isLoading, viewAllHref }: ProductRailProps) {
  if (!isLoading && !products?.length) return null

  return (
    <section className="container-page py-10 sm:py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-brand sm:text-4xl">{title}</h2>
          {subtitle && <p className="mt-1 text-ink-soft">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link to={viewAllHref} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent hover:text-accent-dark">
            Xem tất cả <ChevronRightIcon />
          </Link>
        )}
      </div>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="w-[70%] shrink-0 snap-start sm:w-auto">
                <ProductCardSkeleton />
              </li>
            ))
          : products!.slice(0, 8).map((product) => (
              <li key={product.id} className="w-[70%] shrink-0 snap-start sm:w-auto">
                <ProductCard product={product} />
              </li>
            ))}
      </ul>
    </section>
  )
}
