import { Link } from 'react-router'
import logoDark from '../../assets/images/logo-dark.webp'
import { FacebookIcon, InstagramIcon, MailIcon, MapPinIcon, PhoneIcon, TiktokIcon, YoutubeIcon } from '../ui/icons'

const SHOP_LINKS = [
  { to: '/c/meo', label: 'Cho Mèo' },
  { to: '/c/cho', label: 'Cho Chó' },
  { to: '/products?collection=ban-chay', label: 'Bán chạy' },
  { to: '/products', label: 'Tất cả sản phẩm' },
]

const POLICY_LINKS = [
  { to: '/policies/terms', label: 'Điều khoản sử dụng' },
  { to: '/policies/privacy', label: 'Chính sách bảo mật' },
  { to: '/policies/returns', label: 'Đổi trả & hoàn tiền' },
  { to: '/policies/shipping', label: 'Vận chuyển' },
  { to: '/policies/payment', label: 'Thanh toán' },
]

const SOCIALS = [
  { href: 'https://www.facebook.com', label: 'Facebook', icon: <FacebookIcon /> },
  { href: 'https://www.instagram.com', label: 'Instagram', icon: <InstagramIcon /> },
  { href: 'https://www.youtube.com', label: 'YouTube', icon: <YoutubeIcon /> },
  { href: 'https://www.tiktok.com', label: 'TikTok', icon: <TiktokIcon /> },
]

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3 text-sm">
          <img src={logoDark} alt="Pawl" width={87} height={40} className="h-10 w-auto" />
          <p className="font-semibold">Pawl – Cửa hàng thú cưng trực tuyến</p>
          <p className="flex gap-2 text-ink-soft">
            <MapPinIcon className="mt-0.5 shrink-0" /> 268 Lý Thường Kiệt, Phường Diên Hồng, TP. Hồ Chí Minh
          </p>
          <p className="flex gap-2 text-ink-soft">
            <PhoneIcon className="mt-0.5 shrink-0" /> Hotline: 1900 0000 (8:00 – 21:00)
          </p>
          <p className="flex gap-2 text-ink-soft">
            <MailIcon className="mt-0.5 shrink-0" /> hotro@pawl.vn
          </p>
          <p className="text-ink-soft">Công ty TNHH Pawl Việt Nam (demo) · MST: 0000000000</p>
        </div>

        <FooterColumn title="Mua sắm" links={SHOP_LINKS} />
        <FooterColumn title="Chính sách" links={POLICY_LINKS} />

        <div className="text-sm">
          <h2 className="mb-3 font-semibold">Theo dõi Pawl</h2>
          <p className="mb-4 text-ink-soft">Nhận tin khuyến mãi và mẹo chăm boss mỗi tuần.</p>
          <ul className="flex gap-2">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-10 place-items-center rounded-full bg-accent text-lg text-white transition-colors hover:bg-brand-strong"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <h2 className="mb-2 font-semibold">Thanh toán</h2>
            <div className="flex gap-2 text-xs font-bold">
              <span className="rounded-md border border-line bg-white px-2.5 py-1">COD</span>
              <span className="rounded-md border border-line bg-white px-2.5 py-1 text-accent">VNPAY</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-1 py-4 text-xs text-ink-soft sm:flex-row sm:justify-between">
          <p>© {YEAR} Pawl. Mọi quyền được bảo lưu.</p>
          <p className="font-semibold text-brand-strong">Dự án học tập – không kinh doanh thật.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div className="text-sm">
      <h2 className="mb-3 font-semibold">{title}</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-ink-soft hover:text-brand-strong">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
