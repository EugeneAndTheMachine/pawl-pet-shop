import { ButtonLink } from '../components/ui/button'
import { PawIcon } from '../components/ui/icons'

export default function NotFoundPage() {
  return (
    <section className="container-page flex flex-col items-center py-20 text-center">
      <title>Không tìm thấy trang – Pawl</title>
      <div className="relative">
        <p className="font-display text-8xl text-brand/25 sm:text-9xl" aria-hidden="true">404</p>
        <PawIcon className="absolute -right-6 -top-2 text-5xl text-brand" />
      </div>
      <h1 className="mt-4 text-2xl font-bold">Ôi, trang này đi lạc mất rồi!</h1>
      <p className="mt-2 max-w-md text-ink-soft">Trang bạn tìm có thể đã bị xoá hoặc chưa từng tồn tại. Cùng quay lại chọn đồ cho boss nhé.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/">Về trang chủ</ButtonLink>
        <ButtonLink to="/products" variant="outline">
          Xem sản phẩm
        </ButtonLink>
      </div>
    </section>
  )
}
