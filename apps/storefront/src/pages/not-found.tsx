import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 text-center">
      <title>Không tìm thấy trang – Pawl</title>
      <h1 className="text-2xl font-bold text-brand">Không tìm thấy trang</h1>
      <p className="mt-2">Trang bạn tìm có thể đã bị xoá hoặc chưa từng tồn tại.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark">
        Về trang chủ
      </Link>
    </section>
  )
}
