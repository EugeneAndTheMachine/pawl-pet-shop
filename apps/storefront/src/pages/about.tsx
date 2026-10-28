import type { ReactNode } from 'react'
import aboutFood from '../assets/images/about-food.webp'
import { ButtonLink } from '../components/ui/button'
import { CalendarIcon, PawIcon, ShieldIcon, TruckIcon, WalletIcon } from '../components/ui/icons'

const VALUES: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <ShieldIcon />,
    title: 'Only genuine products',
    text: 'We buy from official distributors and show the ingredients, calories and feeding guide of every food we sell.',
  },
  {
    icon: <PawIcon />,
    title: 'Made for your pet',
    text: 'Filter by species, life stage and health needs such as urinary care, hairballs or a sensitive stomach.',
  },
  {
    icon: <TruckIcon />,
    title: 'Fast, reliable delivery',
    text: 'Same-day express in the inner districts of Ho Chi Minh City and Hanoi, and 2–4 day delivery everywhere else.',
  },
  {
    icon: <WalletIcon />,
    title: 'Pay the way you like',
    text: 'Cash on delivery or a quick bank transfer by QR code. Prices always include VAT.',
  },
]

export default function AboutPage() {
  return (
    <>
      <title>About Pawl – The Pal of your Paw</title>
      <meta
        name="description"
        content="Pawl is an online pet supplies store for busy pet parents in Vietnam: genuine food, litter, treats and accessories for cats and dogs, delivered fast."
      />

      <section className="bg-accent-deep text-white">
        <div className="container-page py-14 sm:py-20">
          <p className="font-hand text-2xl text-brand-light">The Pal of your Paw</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">About Pawl</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
            Everything your cat or dog needs, chosen with care and delivered to your door, so you can spend less time shopping and more time with your pet.
          </p>
        </div>
      </section>

      <section className="container-page grid items-center gap-10 py-14 md:grid-cols-[1.2fr_1fr] lg:py-20">
        <div>
          <h2 className="font-display text-3xl text-brand sm:text-4xl">Our story</h2>
          <p className="mt-5 leading-relaxed">
            Pawl was started by busy pet parents in Ho Chi Minh City and Hanoi. We kept running out of kibble in the middle of the week, and every visit to a pet
            shop meant standing in front of a shelf of look-alike bags, trying to guess which one suited a kitten with a sensitive stomach.
          </p>
          <p className="mt-4 leading-relaxed">
            So we built the store we wanted: a short list of genuine products, labelled by what actually matters for your pet, with honest ingredient lists and
            delivery that arrives when you need it. We started with cats, because most of us are cat people, and added everything dogs love too.
          </p>
        </div>
        <img src={aboutFood} alt="A bowl of kibble, a can of wet food and a paw print" className="mx-auto w-full max-w-sm" loading="lazy" width={492} height={516} />
      </section>

      <section aria-labelledby="values-title" className="bg-surface">
        <div className="container-page py-14 lg:py-20">
          <h2 id="values-title" className="font-display text-3xl text-brand sm:text-4xl">
            What we promise
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <li key={v.title} className="rounded-3xl bg-white p-6 shadow-card">
                <span className="grid size-12 place-items-center rounded-full bg-brand-soft text-2xl text-brand-strong">{v.icon}</span>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-14 lg:py-20">
        <div className="grid items-center gap-8 rounded-3xl bg-accent-deep p-6 text-white sm:p-10 md:grid-cols-[1fr_auto]">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-light">
              <CalendarIcon /> Coming soon
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Pet profiles and repeat deliveries</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-white/85">
              Soon you will be able to tell us about your pet and get food suggestions that fit its age, weight and health, then have them delivered every
              2, 4 or 6 weeks without reordering.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/products" size="lg">
              Shop now
            </ButtonLink>
            <ButtonLink to="/contact" variant="light" size="lg">
              Contact us
            </ButtonLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="company-title" className="container-page pb-14 lg:pb-20">
        <div className="rounded-3xl border border-line bg-white p-6 text-sm sm:p-8">
          <h2 id="company-title" className="text-lg font-bold">
            Company information
          </h2>
          <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            <InfoRow label="Business name">Pawl Vietnam Co., Ltd. (demo)</InfoRow>
            <InfoRow label="Tax code">0000000000</InfoRow>
            <InfoRow label="Address">268 Ly Thuong Kiet, Dien Hong Ward, Ho Chi Minh City</InfoRow>
            <InfoRow label="Contact">1900 0000 · support@pawl.vn</InfoRow>
          </dl>
          <p className="mt-5 font-semibold text-brand-strong">Pawl is a student project for an e-commerce course – not a real business. No real orders are fulfilled.</p>
        </div>
      </section>
    </>
  )
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-ink-soft">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}
