import type { HttpTypes } from '@medusajs/types'
import { sdk } from '../../lib/medusa'

// `+`/`*` keep the default fields and add what product cards and the detail page need
export const PRODUCT_LIST_FIELDS = '+metadata,*tags,*variants.calculated_price,+variants.inventory_quantity'
export const PRODUCT_DETAIL_FIELDS =
  '+metadata,*tags,*images,*categories,*variants.calculated_price,+variants.inventory_quantity'

export type ProductQuery = {
  regionId: string
  categoryIds?: string[]
  collectionId?: string
  q?: string
  /** Each inner array is OR-ed; the groups are AND-ed (species AND health…) */
  tagGroups?: string[][]
  excludeId?: string
  limit: number
  offset: number
  order?: string
}

export async function getVietnamRegion(): Promise<HttpTypes.StoreRegion> {
  const { regions } = await sdk.store.region.list({ limit: 20 })
  const region = regions.find((r) => r.currency_code === 'vnd') ?? regions[0]
  if (!region) throw new Error('No region configured')
  return region
}

export async function listCategories(): Promise<HttpTypes.StoreProductCategory[]> {
  const { product_categories } = await sdk.store.category.list({
    limit: 100,
    fields: 'id,name,handle,rank,parent_category_id',
  })
  return product_categories
}

export async function listTags(): Promise<HttpTypes.StoreProductTag[]> {
  const { product_tags } = await sdk.client.fetch<HttpTypes.StoreProductTagListResponse>('/store/product-tags', {
    query: { limit: 200, fields: 'id,value' },
  })
  return product_tags
}

export async function getCollectionByHandle(handle: string): Promise<HttpTypes.StoreCollection | null> {
  const { collections } = await sdk.store.collection.list({ handle, limit: 1 })
  return collections[0] ?? null
}

export async function listProducts(query: ProductQuery): Promise<{ products: HttpTypes.StoreProduct[]; count: number }> {
  const groups = (query.tagGroups ?? []).filter((ids) => ids.length)
  const { products, count } = await sdk.store.product.list({
    region_id: query.regionId,
    fields: PRODUCT_LIST_FIELDS,
    limit: query.limit,
    offset: query.offset,
    order: query.order ?? '-created_at',
    ...(query.q ? { q: query.q } : {}),
    ...(query.categoryIds?.length ? { category_id: query.categoryIds } : {}),
    ...(query.collectionId ? { collection_id: [query.collectionId] } : {}),
    ...(groups.length ? { $and: groups.map((ids) => ({ tag_id: ids })) } : {}),
  } as HttpTypes.StoreProductListParams)
  const filtered = query.excludeId ? products.filter((p) => p.id !== query.excludeId) : products
  return { products: filtered, count: query.excludeId ? count - (products.length - filtered.length) : count }
}

/** Fetches every matching product (paged requests) for client-side price sorting and filtering. */
export async function listAllProducts(query: Omit<ProductQuery, 'limit' | 'offset'>): Promise<HttpTypes.StoreProduct[]> {
  const pageSize = 100
  const all: HttpTypes.StoreProduct[] = []
  for (let offset = 0; offset < 1000; offset += pageSize) {
    const { products, count } = await listProducts({ ...query, limit: pageSize, offset })
    all.push(...products)
    if (offset + pageSize >= count) break
  }
  return all
}

export async function getProductByHandle(handle: string, regionId: string): Promise<HttpTypes.StoreProduct | null> {
  const { products } = await sdk.store.product.list({
    handle,
    region_id: regionId,
    fields: PRODUCT_DETAIL_FIELDS,
    limit: 1,
  })
  return products[0] ?? null
}
