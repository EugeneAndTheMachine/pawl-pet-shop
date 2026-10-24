import { RefreshIcon, ShieldIcon, TruckIcon, WalletIcon } from '../../../components/ui/icons'

const ITEMS = [
  { icon: <TruckIcon />, title: 'Giao nhanh trong ngày', text: 'Nội thành TP.HCM, từ 30.000₫' },
  { icon: <WalletIcon />, title: 'COD hoặc VNPay', text: 'Thanh toán khi nhận hàng' },
  { icon: <RefreshIcon />, title: 'Đổi trả trong 7 ngày', text: 'Sản phẩm lỗi, giao nhầm' },
  { icon: <ShieldIcon />, title: 'Hàng chính hãng', text: 'Thành phần minh bạch' },
]

export function TrustStrip() {
  return (
    <section aria-label="Cam kết của Pawl" className="border-b border-line bg-surface">
      <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-5 py-6 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <li key={item.title} className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-xl text-brand-strong">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-ink-soft">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
