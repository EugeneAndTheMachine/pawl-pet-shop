import type { HttpTypes } from '@medusajs/types'
import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { Breadcrumb, type Crumb } from '../components/layout/breadcrumb'
import { Button } from '../components/ui/button'
import { AlertIcon, CartIcon, RefreshIcon, TruckIcon, WalletIcon } from '../components/ui/icons'
import { QuantityInput } from '../components/ui/quantity-input'
import { Skeleton } from '../components/ui/skeleton'
import { useCart } from '../features/cart/use-cart'
import { ProductGallery } from '../features/catalog/components/product-gallery'
import { ProductRail } from '../features/catalog/components/product-rail'
import { ProductTabs } from '../features/catalog/components/product-tabs'
import { StockStatus } from '../features/catalog/components/stock-status'
import { VariantPicker } from '../features/catalog/components/variant-picker'
import { useCategories, useProduct, useProductRail } from '../features/catalog/hooks'
import {
  findVariant,
  isVariantInStock,
  optionsOf,
  productBrand,
  variantAvailable,
  variantOriginalPrice,
  variantPrice,
} from '../features/catalog/product-utils'
import { tagLabel } from '../features/catalog/tag-labels'
import { formatVND } from '../lib/format'
import NotFoundPage from './not-found'

export default function ProductDetailPage() {
  const { handle } = useParams()
  const { data: product, isLoading, isError, refetch } = useProduct(handle)

  if (isLoading) return <ProductDetailSkeleton />
  if (isError) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-20 text-center">
        <AlertIcon className="text-4xl text-danger" />
        <p className="font-semibold">We couldn't load this product. Please try again.</p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    )
  }
  if (!product) return <NotFoundPage />

  return <ProductDetail key={product.id} product={product} />
}

function ProductDetail({ product }: { product: HttpTypes.StoreProduct }) {
  const { addItem, isUpdating } = useCart()
  const [params, setParams] = useSearchParams()
  const variants = product.variants ?? []

  // Start from ?variant= when present (shared link), otherwise the first variant in stock
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const fromUrl = variants.find((v) => v.id === params.get('variant'))
    return optionsOf(fromUrl ?? variants.find(isVariantInStock) ?? variants[0])
  })
  const [quantity, setQuantity] = useState(1)

  const variant = findVariant(product, selected)
  const available = variantAvailable(variant)
  const inStock = available > 0
  const price = variantPrice(variant)
  const original = variantOriginalPrice(variant)
  const maxQty = Number.isFinite(available) ? Math.min(available, 99) : 99
  const brand = productBrand(product)
  const tags = (product.tags ?? []).map((t) => tagLabel(t.value)).filter((l): l is string => Boolean(l))

  // The API returns the parent category without its name, so resolve it from the cached category tree
  const { tree } = useCategories()
  const category = product.categories?.[0]
  const parent = category?.parent_category_id ? tree?.byId(category.parent_category_id) : undefined
  const crumbs: Crumb[] = [
    ...(parent ? [{ label: parent.name, to: `/c/${parent.handle}` }] : []),
    ...(category ? [{ label: category.name, to: `/c/${category.handle}` }] : []),
    { label: product.title ?? '' },
  ]
  const related = useProductRail({ categoryIds: category ? [category.id] : undefined, excludeId: product.id, limit: 4, enabled: Boolean(category) })

  const selectOption = (optionId: string, value: string) => {
    const next = { ...selected, [optionId]: value }
    setSelected(next)
    setQuantity(1)
    const match = findVariant(product, next)
    setParams(
      (prev) => {
        const p = new URLSearchParams(prev)
        if (match) p.set('variant', match.id)
        return p
      },
      { replace: true, preventScrollReset: true },
    )
  }

  const addToCart = () => {
    if (variant && inStock) void addItem(variant.id, quantity)
  }

  return (
    <div className="pb-24 lg:pb-0">
      <title>{`${product.title} – Pawl`}</title>
      <meta name="description" content={product.description?.slice(0, 160) ?? `${product.title} at Pawl`} />

      <div className="container-page py-6 sm:py-8">
        <Breadcrumb items={crumbs} />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery product={product} />

          <div className="space-y-6">
            <div className="space-y-2">
              {brand && <p className="text-sm font-semibold uppercase tracking-wide text-accent">{brand}</p>}
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{product.title}</h1>
              {tags.length > 0 && (
                <ul className="flex flex-wrap gap-1.5 pt-1" aria-label="Highlights">
                  {tags.map((label) => (
                    <li key={label} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-dark">
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-3xl font-bold text-brand-strong">{price != null ? formatVND(price) : 'Price on request'}</p>
              {original != null && price != null && original > price && <p className="text-lg text-ink-soft line-through">{formatVND(original)}</p>}
              <StockStatus available={variant ? available : 0} />
            </div>
            <p className="-mt-4 text-xs text-ink-soft">VAT included</p>

            {variants.length > 1 && <VariantPicker product={product} selected={selected} onChange={selectOption} />}

            <div className="flex flex-wrap items-center gap-3">
              <QuantityInput value={quantity} onChange={setQuantity} max={Math.max(1, maxQty)} disabled={!inStock} />
              <Button size="lg" className="flex-1 sm:flex-none sm:px-10" onClick={addToCart} disabled={!variant || !inStock} loading={isUpdating}>
                <CartIcon className="text-xl" />
                {inStock ? 'Add to cart' : 'Out of stock'}
              </Button>
            </div>

            <ul className="grid gap-3 rounded-2xl bg-white p-4 text-sm shadow-card sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <TruckIcon className="shrink-0 text-xl text-brand-strong" /> Delivered in 2–4 days, same day in the inner city
              </li>
              <li className="flex items-center gap-2">
                <WalletIcon className="shrink-0 text-xl text-brand-strong" /> Cash on delivery or VNPay
              </li>
              <li className="flex items-center gap-2">
                <RefreshIcon className="shrink-0 text-xl text-brand-strong" /> 7-day returns
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <ProductTabs product={product} />
        </div>
      </div>

      {category && (
        <ProductRail
          title="Your pet may also like"
          products={related.data}
          isLoading={related.isLoading}
          viewAllHref={`/c/${category.handle}`}
        />
      )}

      {/* Sticky add-to-cart bar on small screens */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-soft">{variant?.title ?? product.title}</p>
            <p className="font-bold text-brand-strong">{price != null ? formatVND(price) : 'Price on request'}</p>
          </div>
          <Button onClick={addToCart} disabled={!variant || !inStock} loading={isUpdating}>
            {inStock ? 'Add to cart' : 'Out of stock'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="container-page py-8" aria-busy="true" aria-label="Loading product">
      <Skeleton className="h-4 w-64" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-20 rounded-xl" />
            <Skeleton className="h-11 w-20 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
