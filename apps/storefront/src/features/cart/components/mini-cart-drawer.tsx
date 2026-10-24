import { Link } from 'react-router'
import { ButtonLink } from '../../../components/ui/button'
import { Drawer } from '../../../components/ui/drawer'
import { CartIcon, TrashIcon } from '../../../components/ui/icons'
import { QuantityInput } from '../../../components/ui/quantity-input'
import { formatVND } from '../../../lib/format'
import { ProductImage } from '../../catalog/components/product-image'
import { variantAvailable } from '../../catalog/product-utils'
import { useCart } from '../use-cart'

export function MiniCartDrawer() {
  const { cart, itemCount, isDrawerOpen, closeDrawer, updateItem, removeItem, isUpdating } = useCart()
  const items = [...(cart?.items ?? [])].sort((a, b) => (a.created_at && b.created_at ? String(b.created_at).localeCompare(String(a.created_at)) : 0))

  return (
    <Drawer
      open={isDrawerOpen}
      onClose={closeDrawer}
      title={`Giỏ hàng (${itemCount})`}
      footer={
        items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Tạm tính</span>
              <span className="text-xl font-bold text-brand-strong">{formatVND(cart?.item_total)}</span>
            </div>
            <p className="text-xs text-ink-soft">Giá đã gồm VAT. Phí giao hàng và mã giảm giá được tính ở bước thanh toán.</p>
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink to="/cart" variant="outline" onClick={closeDrawer}>
                Xem giỏ hàng
              </ButtonLink>
              <ButtonLink to="/checkout" onClick={closeDrawer}>
                Thanh toán
              </ButtonLink>
            </div>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-brand-soft text-4xl text-brand">
            <CartIcon />
          </span>
          <p className="font-semibold">Giỏ hàng đang trống</p>
          <p className="text-sm text-ink-soft">Boss nhà bạn đang chờ món ngon đấy!</p>
          <ButtonLink to="/products" onClick={closeDrawer}>
            Mua sắm ngay
          </ButtonLink>
        </div>
      ) : (
        <ul className="divide-y divide-line px-5" aria-busy={isUpdating}>
          {items.map((item) => {
            const max = Math.min(99, variantAvailable(item.variant ?? undefined))
            return (
              <li key={item.id} className="flex gap-3 py-4">
                <Link to={`/products/${item.product_handle}`} onClick={closeDrawer} className="size-20 shrink-0 overflow-hidden rounded-xl bg-white p-1.5">
                  <ProductImage src={item.thumbnail} alt={item.product_title ?? ''} className="size-full" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Link to={`/products/${item.product_handle}`} onClick={closeDrawer} className="line-clamp-2 text-sm font-semibold hover:text-brand-strong">
                    {item.product_title}
                  </Link>
                  {item.variant_title && <p className="text-xs text-ink-soft">{item.variant_title}</p>}
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <QuantityInput
                      size="sm"
                      value={item.quantity}
                      max={Number.isFinite(max) ? Math.max(max, item.quantity) : 99}
                      disabled={isUpdating}
                      onChange={(quantity) => updateItem(item.id, quantity)}
                      label={`Số lượng ${item.product_title}`}
                    />
                    <span className="text-sm font-bold">{formatVND(item.total ?? item.unit_price * item.quantity)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={isUpdating}
                  className="self-start rounded-full p-1.5 text-ink-soft hover:bg-danger-soft hover:text-danger"
                  aria-label={`Xoá ${item.product_title} khỏi giỏ`}
                >
                  <TrashIcon />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Drawer>
  )
}
