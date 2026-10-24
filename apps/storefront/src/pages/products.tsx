import { useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import { Breadcrumb, type Crumb } from '../components/layout/breadcrumb'
import { Button } from '../components/ui/button'
import { Drawer } from '../components/ui/drawer'
import { AlertIcon, FilterIcon, PawIcon, SearchIcon } from '../components/ui/icons'
import { ActiveFilters } from '../features/catalog/components/active-filters'
import { FilterPanel } from '../features/catalog/components/filter-panel'
import { Pagination } from '../features/catalog/components/pagination'
import { ProductGrid, ProductGridSkeleton } from '../features/catalog/components/product-grid'
import { PAGE_SIZE, SORT_OPTIONS, clearFilters, countActiveFilters, parseFilters, updateParams, type SortKey } from '../features/catalog/filters'
import { useCatalogProducts, useCategories, useCollection } from '../features/catalog/hooks'
import type { TagGroup } from '../features/catalog/tag-labels'
import { cx } from '../lib/cx'
import NotFoundPage from './not-found'

export default function ProductsPage() {
  const { handle } = useParams()
  const { pathname } = useLocation()
  const isSearch = pathname === '/search'
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(params), [params])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { tree } = useCategories()
  const category = handle ? tree?.byHandle(handle) : undefined
  const parent = category?.parent_category_id ? tree?.byId(category.parent_category_id) : undefined
  const root = parent ?? category
  const collection = useCollection(filters.collection)

  const categoryIds = useMemo(() => (category && tree ? tree.descendantIds(category.id) : undefined), [category, tree])
  const scopeReady = (!handle || Boolean(tree)) && (!filters.collection || collection.isFetched)

  const { products, count, isLoading, isFetching, isError, refetch } = useCatalogProducts(filters, {
    categoryIds,
    collectionId: collection.data?.id ?? (filters.collection ? 'missing' : undefined),
    ready: scopeReady && (!isSearch || Boolean(filters.q)),
  })

  if (handle && tree && !category) return <NotFoundPage />

  // Inside the cat or dog tree the species filter is implied
  const hiddenGroups: TagGroup[] = root?.handle === 'meo' || root?.handle === 'cho' ? ['species'] : []
  const hiddenOptions = root?.handle === 'meo' ? ['life:puppy'] : root?.handle === 'cho' ? ['life:kitten'] : []
  const title = isSearch
    ? filters.q
      ? `Kết quả cho “${filters.q}”`
      : 'Tìm kiếm'
    : category
      ? parent
        ? `${category.name} cho ${parent.name}`
        : `Sản phẩm cho ${category.name}`
      : (collection.data?.title ?? 'Tất cả sản phẩm')

  const crumbs: Crumb[] = isSearch
    ? [{ label: 'Tìm kiếm' }]
    : category
      ? [...(parent ? [{ label: parent.name, to: `/c/${parent.handle}` }] : []), { label: category.name }]
      : [{ label: collection.data?.title ?? 'Sản phẩm' }]

  const chips = root && tree ? tree.children(root.id) : []
  // Switching sub-category keeps the filters but starts again at page 1
  const chipParams = updateParams(params, {}).toString()
  const chipHref = (h: string) => `/c/${h}${chipParams ? `?${chipParams}` : ''}`
  const activeCount = countActiveFilters(filters)
  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div className="container-page py-6 sm:py-8">
      <title>{`${title} – Pawl`}</title>
      <meta name="description" content={`${title} tại Pawl: thức ăn, cát vệ sinh, snack và phụ kiện cho chó mèo, giá rõ ràng, giao nhanh.`} />

      <Breadcrumb items={crumbs} />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl text-brand sm:text-4xl">{title}</h1>
        {!isLoading && (isSearch ? Boolean(filters.q) : true) && <p className="text-sm text-ink-soft">{count} sản phẩm</p>}
      </div>

      {chips.length > 0 && root && (
        <nav aria-label="Danh mục con" className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <CategoryChip to={chipHref(root.handle)} active={category?.id === root.id} label="Tất cả" />
          {chips.map((child) => (
            <CategoryChip key={child.id} to={chipHref(child.handle)} active={category?.id === child.id} label={child.name} />
          ))}
        </nav>
      )}

      {isSearch && !filters.q ? (
        <EmptyState icon={<SearchIcon />} title="Bạn muốn tìm gì cho boss?" text="Nhập tên sản phẩm hoặc thương hiệu vào ô tìm kiếm phía trên." />
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside className="hidden lg:block" aria-label="Bộ lọc">
            <div className="sticky top-32 rounded-2xl bg-white p-4 shadow-card">
              <h2 className="mb-1 font-semibold">Bộ lọc</h2>
              <FilterPanel filters={filters} hiddenGroups={hiddenGroups} hiddenOptions={hiddenOptions} />
            </div>
          </aside>

          <div className="min-w-0 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
                <FilterIcon /> Bộ lọc{activeCount > 0 && ` (${activeCount})`}
              </Button>
              <label className="ml-auto flex items-center gap-2 text-sm">
                <span className="hidden text-ink-soft sm:inline">Sắp xếp:</span>
                <select
                  value={filters.sort}
                  onChange={(e) => setParams(updateParams(params, { sort: (e.target.value as SortKey) === 'newest' ? null : e.target.value }), { preventScrollReset: true })}
                  className="h-9 rounded-full border border-line bg-white px-3 pr-8 text-sm font-medium"
                  aria-label="Sắp xếp sản phẩm"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <ActiveFilters filters={filters} collectionTitle={collection.data?.title} />

            {isError ? (
              <EmptyState
                icon={<AlertIcon />}
                title="Không tải được sản phẩm"
                text="Kết nối đang chậm hoặc máy chủ tạm thời gián đoạn."
                action={<Button onClick={refetch}>Thử lại</Button>}
              />
            ) : isLoading ? (
              <ProductGridSkeleton count={6} className="lg:grid-cols-3" />
            ) : products.length === 0 ? (
              <EmptyState
                icon={<PawIcon />}
                title="Chưa có sản phẩm phù hợp"
                text={activeCount ? 'Thử bỏ bớt một vài bộ lọc nhé.' : 'Danh mục này đang được cập nhật.'}
                action={
                  activeCount > 0 ? (
                    <Button variant="outline" onClick={() => setParams(clearFilters(params))}>
                      Xoá bộ lọc
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className={cx('space-y-8 transition-opacity', isFetching && 'opacity-60')}>
                <ProductGrid products={products} className="lg:grid-cols-3" />
                <Pagination page={filters.page} totalPages={totalPages} />
              </div>
            )}
          </div>
        </div>
      )}

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Bộ lọc"
        side="left"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setParams(clearFilters(params))} disabled={!activeCount}>
              Xoá lọc
            </Button>
            <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
              Xem {count} sản phẩm
            </Button>
          </div>
        }
      >
        <div className="px-5">
          <FilterPanel filters={filters} hiddenGroups={hiddenGroups} hiddenOptions={hiddenOptions} />
        </div>
      </Drawer>
    </div>
  )
}

function CategoryChip({ to, active, label }: { to: string; active: boolean; label: string }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
        active ? 'border-accent bg-accent text-white' : 'border-line bg-white hover:border-accent hover:text-accent',
      )}
    >
      {label}
    </Link>
  )
}

function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-16 text-center shadow-card">
      <span className="grid size-16 place-items-center rounded-full bg-brand-soft text-3xl text-brand-strong">{icon}</span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-ink-soft">{text}</p>
      {action}
    </div>
  )
}
