import { ButtonLink } from '../components/ui/button'
import { AlertIcon } from '../components/ui/icons'

/** Shown when a page crashes; never exposes technical details to the customer */
export default function RouteErrorPage() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <title>Đã có lỗi xảy ra – Pawl</title>
      <AlertIcon className="text-5xl text-danger" />
      <h1 className="mt-4 text-2xl font-bold">Đã có lỗi xảy ra</h1>
      <p className="mt-2 max-w-md text-ink-soft">Xin lỗi vì sự bất tiện. Bạn thử tải lại trang hoặc quay về trang chủ nhé.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={() => window.location.reload()} className="rounded-full border border-accent px-5 py-2.5 font-semibold text-accent hover:bg-accent-soft">
          Tải lại trang
        </button>
        <ButtonLink to="/">Về trang chủ</ButtonLink>
      </div>
    </section>
  )
}
