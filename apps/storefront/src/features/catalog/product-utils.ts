import type { HttpTypes } from '@medusajs/types'

type Variant = HttpTypes.StoreProductVariant

export function variantPrice(variant: Variant | undefined): number | undefined {
  const amount = variant?.calculated_price?.calculated_amount
  return typeof amount === 'number' ? amount : undefined
}

export function variantOriginalPrice(variant: Variant | undefined): number | undefined {
  const amount = variant?.calculated_price?.original_amount
  return typeof amount === 'number' ? amount : undefined
}

/** Units available to order, or Infinity when stock is not tracked or backorders are allowed */
export function variantAvailable(variant: Variant | undefined): number {
  if (!variant) return 0
  if (!variant.manage_inventory || variant.allow_backorder) return Number.POSITIVE_INFINITY
  return Math.max(0, variant.inventory_quantity ?? 0)
}

export function isVariantInStock(variant: Variant | undefined): boolean {
  return variantAvailable(variant) > 0
}

export function productPriceRange(product: HttpTypes.StoreProduct): { min?: number; max?: number } {
  const prices = (product.variants ?? []).map(variantPrice).filter((p): p is number => p != null)
  if (!prices.length) return {}
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

export function isProductInStock(product: HttpTypes.StoreProduct): boolean {
  return (product.variants ?? []).some(isVariantInStock)
}

export function productBrand(product: HttpTypes.StoreProduct): string | undefined {
  const brand = product.metadata?.brand
  return typeof brand === 'string' ? brand : undefined
}

export function metadataString(product: HttpTypes.StoreProduct, key: string): string | undefined {
  const value = product.metadata?.[key]
  return typeof value === 'string' && value.trim() ? value : undefined
}

/** The variant matching every selected option value (option id -> value) */
export function findVariant(product: HttpTypes.StoreProduct, selected: Record<string, string>): Variant | undefined {
  const options = product.options ?? []
  return (product.variants ?? []).find((v) =>
    options.every((option) => (v.options ?? []).some((o) => o.option_id === option.id && o.value === selected[option.id])),
  )
}

export function optionsOf(variant: Variant | undefined): Record<string, string> {
  return Object.fromEntries((variant?.options ?? []).map((o) => [o.option_id ?? '', o.value]))
}

export function metadataNumber(product: HttpTypes.StoreProduct, key: string): number | undefined {
  const value = product.metadata?.[key]
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
  return Number.isFinite(n) ? n : undefined
}
