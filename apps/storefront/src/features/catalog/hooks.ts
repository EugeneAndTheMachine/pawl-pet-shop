import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { HttpTypes } from '@medusajs/types'
import { useMemo } from 'react'
import {
  getCollectionByHandle,
  getProductByHandle,
  getVietnamRegion,
  listAllProducts,
  listCategories,
  listProducts,
  listTags,
  type ProductQuery,
} from './api'
import { PAGE_SIZE, needsClientSideProcessing, type CatalogFilters } from './filters'
import { productPriceRange } from './product-utils'
import { TAG_GROUPS } from './tag-labels'

export const catalogKeys = {
  region: ['region'] as const,
  categories: ['categories'] as const,
  tags: ['product-tags'] as const,
  collection: (handle: string) => ['collection', handle] as const,
  products: (query: unknown) => ['products', query] as const,
  product: (handle: string, regionId: string | undefined) => ['product', handle, regionId] as const,
}

const LONG_STALE = 30 * 60_000

export function useRegion() {
  return useQuery({ queryKey: catalogKeys.region, queryFn: getVietnamRegion, staleTime: Number.POSITIVE_INFINITY })
}

export type CategoryTree = {
  all: HttpTypes.StoreProductCategory[]
  byHandle: (handle: string) => HttpTypes.StoreProductCategory | undefined
  byId: (id: string) => HttpTypes.StoreProductCategory | undefined
  children: (parentId: string | null) => HttpTypes.StoreProductCategory[]
  descendantIds: (id: string) => string[]
}

export function useCategories() {
  const query = useQuery({ queryKey: catalogKeys.categories, queryFn: listCategories, staleTime: LONG_STALE })
  const tree = useMemo<CategoryTree | undefined>(() => {
    if (!query.data) return undefined
    const all = query.data
    const children = (parentId: string | null) =>
      all.filter((c) => (c.parent_category_id ?? null) === parentId).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    const descendantIds = (id: string): string[] => [id, ...children(id).flatMap((c) => descendantIds(c.id))]
    return {
      all,
      byHandle: (handle) => all.find((c) => c.handle === handle),
      byId: (id) => all.find((c) => c.id === id),
      children,
      descendantIds,
    }
  }, [query.data])
  return { ...query, tree }
}

/** Maps tag values like `species:cat` to their IDs */
export function useTagIds() {
  const query = useQuery({ queryKey: catalogKeys.tags, queryFn: listTags, staleTime: LONG_STALE })
  const map = useMemo(() => new Map((query.data ?? []).map((t) => [t.value, t.id])), [query.data])
  return { ...query, map }
}

export function useCollection(handle: string | undefined) {
  return useQuery({
    queryKey: catalogKeys.collection(handle ?? ''),
    queryFn: () => getCollectionByHandle(handle!),
    enabled: Boolean(handle),
    staleTime: LONG_STALE,
  })
}

type Scope = { categoryIds?: string[]; collectionId?: string; ready: boolean }

/**
 * Product listing with filters from the URL.
 * Tag filters and search run on the Store API. The API cannot sort by price, so a price sort or
 * price range loads every match and sorts/filters/paginates on the client (fine for a catalog of
 * a few hundred products; a larger catalog would need a search index).
 */
export function useCatalogProducts(filters: CatalogFilters, scope: Scope) {
  const region = useRegion()
  const tags = useTagIds()

  // A selected group whose values match no existing tag can only yield an empty result
  const { tagGroups, impossible } = useMemo(() => {
    const groups: string[][] = []
    let none = false
    for (const g of TAG_GROUPS) {
      const selected = filters.tags[g.key]
      if (!selected.length) continue
      const ids = selected.map((v) => tags.map.get(`${g.key}:${v}`)).filter((id): id is string => Boolean(id))
      if (!ids.length) none = true
      groups.push(ids)
    }
    return { tagGroups: groups, impossible: none }
  }, [filters.tags, tags.map])

  const clientSide = needsClientSideProcessing(filters)
  const base: Omit<ProductQuery, 'limit' | 'offset'> | undefined = region.data
    ? { regionId: region.data.id, categoryIds: scope.categoryIds, collectionId: scope.collectionId, q: filters.q, tagGroups }
    : undefined

  const query = useQuery({
    queryKey: catalogKeys.products({
      ...base,
      clientSide,
      page: clientSide ? undefined : filters.page,
    }),
    queryFn: async () => {
      if (!clientSide) {
        return listProducts({ ...base!, limit: PAGE_SIZE, offset: (filters.page - 1) * PAGE_SIZE })
      }
      const products = await listAllProducts(base!)
      return { products, count: products.length }
    },
    enabled: Boolean(base) && tags.isSuccess && scope.ready && !impossible,
    placeholderData: keepPreviousData,
  })

  const result = useMemo(() => {
    if (impossible || !query.data) return { products: [] as HttpTypes.StoreProduct[], count: 0 }
    if (!clientSide) return query.data
    const { minPrice, maxPrice, sort, page } = filters
    let list = query.data.products.filter((p) => {
      const { min } = productPriceRange(p)
      if (min == null) return minPrice == null && maxPrice == null
      return (minPrice == null || min >= minPrice) && (maxPrice == null || min <= maxPrice)
    })
    if (sort !== 'newest') {
      const dir = sort === 'price_asc' ? 1 : -1
      list = [...list].sort((a, b) => dir * ((productPriceRange(a).min ?? 0) - (productPriceRange(b).min ?? 0)))
    }
    return { products: list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), count: list.length }
  }, [query.data, clientSide, filters, impossible])

  return {
    ...result,
    isLoading: region.isLoading || tags.isLoading || (!impossible && (query.isLoading || !scope.ready)),
    isFetching: query.isFetching,
    isError: region.isError || tags.isError || query.isError,
    refetch: () => {
      void region.refetch()
      void tags.refetch()
      void query.refetch()
    },
  }
}

/** A short list of products for home page rails and "related products" */
export function useProductRail(params: { categoryIds?: string[]; collectionId?: string; limit?: number; excludeId?: string; enabled?: boolean }) {
  const region = useRegion()
  const { categoryIds, collectionId, limit = 8, excludeId, enabled = true } = params
  return useQuery({
    queryKey: catalogKeys.products({ rail: true, categoryIds, collectionId, limit, excludeId, regionId: region.data?.id }),
    queryFn: () =>
      listProducts({ regionId: region.data!.id, categoryIds, collectionId, limit: excludeId ? limit + 1 : limit, offset: 0, excludeId }).then(
        (r) => r.products.slice(0, limit),
      ),
    enabled: Boolean(region.data) && enabled,
  })
}

export function useProduct(handle: string | undefined) {
  const region = useRegion()
  return useQuery({
    queryKey: catalogKeys.product(handle ?? '', region.data?.id),
    queryFn: () => getProductByHandle(handle!, region.data!.id),
    enabled: Boolean(handle && region.data),
  })
}
