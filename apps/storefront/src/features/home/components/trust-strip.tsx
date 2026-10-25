import { RefreshIcon, ShieldIcon, TruckIcon, WalletIcon } from '../../../components/ui/icons'

const ITEMS = [
  { icon: <TruckIcon />, title: 'Same-day delivery', text: 'Inner Ho Chi Minh City, from ₫30,000' },
  { icon: <WalletIcon />, title: 'Cash on delivery or VNPay', text: 'Pay the way you prefer' },
  { icon: <RefreshIcon />, title: '7-day returns', text: 'For damaged or wrong items' },
  { icon: <ShieldIcon />, title: '100% genuine', text: 'Clear ingredient lists' },
]

export function TrustStrip() {
  return (
    <section aria-label="Why shop with Pawl" className="border-b border-line bg-surface">
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
