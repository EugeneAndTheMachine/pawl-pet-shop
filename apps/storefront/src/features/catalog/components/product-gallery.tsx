import type { HttpTypes } from '@medusajs/types'
import { useState } from 'react'
import { cx } from '../../../lib/cx'
import { ProductImage } from './product-image'

export function ProductGallery({ product }: { product: HttpTypes.StoreProduct }) {
  const urls = Array.from(new Set([product.thumbnail, ...(product.images ?? []).map((i) => i.url)].filter((u): u is string => Boolean(u))))
  const [active, setActive] = useState(0)
  const current = urls[active]

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse">
      <div className="relative aspect-square flex-1 overflow-hidden rounded-3xl bg-white p-6 shadow-card">
        <ProductImage src={current} alt={product.title ?? ''} className="size-full" eager />
      </div>
      {urls.length > 1 && (
        <ul className="no-scrollbar flex gap-3 overflow-x-auto md:w-20 md:flex-col" aria-label="Product images">
          {urls.map((url, i) => (
            <li key={url} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                className={cx(
                  'size-16 overflow-hidden rounded-xl border-2 bg-white p-1 md:size-20',
                  i === active ? 'border-accent' : 'border-transparent hover:border-line',
                )}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
              >
                <ProductImage src={url} alt="" className="size-full" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
