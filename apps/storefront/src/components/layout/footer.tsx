import { Link } from 'react-router'
import logoDark from '../../assets/images/logo-dark.webp'
import { FacebookIcon, InstagramIcon, MailIcon, MapPinIcon, PhoneIcon, TiktokIcon, YoutubeIcon } from '../ui/icons'

const SHOP_LINKS = [
  { to: '/c/cat', label: 'For cats' },
  { to: '/c/dog', label: 'For dogs' },
  { to: '/products?collection=best-sellers', label: 'Best sellers' },
  { to: '/products', label: 'All products' },
]

const HELP_LINKS = [
  { to: '/about', label: 'About Pawl' },
  { to: '/contact', label: 'Contact us' },
  { to: '/policies/shipping', label: 'Shipping' },
  { to: '/policies/returns', label: 'Returns & refunds' },
  { to: '/policies/payment', label: 'Payment methods' },
]

const LEGAL_LINKS = [
  { to: '/policies/terms', label: 'Terms of service' },
  { to: '/policies/privacy', label: 'Privacy policy' },
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
          <p className="font-semibold">Pawl – Online pet supplies store in Vietnam</p>
          <p className="flex gap-2 text-ink-soft">
            <MapPinIcon className="mt-0.5 shrink-0" /> 268 Ly Thuong Kiet, Dien Hong Ward, Ho Chi Minh City
          </p>
          <p className="flex gap-2 text-ink-soft">
            <PhoneIcon className="mt-0.5 shrink-0" /> Hotline: 1900 0000 (8:00 – 21:00)
          </p>
          <p className="flex gap-2 text-ink-soft">
            <MailIcon className="mt-0.5 shrink-0" /> support@pawl.vn
          </p>
          <p className="text-ink-soft">Pawl Vietnam Co., Ltd. (demo) · Tax code: 0000000000</p>
        </div>

        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn title="Help" links={HELP_LINKS} />

        <div className="text-sm">
          <h2 className="mb-3 font-semibold">Follow Pawl</h2>
          <p className="mb-4 text-ink-soft">Deals and pet care tips every week.</p>
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
            <h2 className="mb-2 font-semibold">We accept</h2>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="whitespace-nowrap rounded-md border border-line bg-white px-2.5 py-1">Cash on delivery</span>
              <span className="whitespace-nowrap rounded-md border border-line bg-white px-2.5 py-1 text-accent">Bank transfer (QR)</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-4 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {YEAR} Pawl. All rights reserved.</p>
          <ul className="flex gap-4">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-brand-strong">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="font-semibold text-brand-strong">Pawl - The pet shop</p>
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
