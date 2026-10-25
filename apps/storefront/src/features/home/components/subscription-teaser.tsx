import { CalendarIcon, CheckIcon } from '../../../components/ui/icons'

const BENEFITS = ['Automatic delivery every 2, 4 or 6 weeks', 'Special prices for subscription orders', 'A reminder 5 days ahead: skip or cancel any time']

/** Static teaser only: subscriptions are a Phase 2 feature */
export function SubscriptionTeaser() {
  return (
    <section className="container-page pb-16 pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-accent-deep px-6 py-10 text-white sm:px-12 sm:py-14">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-brand/20" aria-hidden="true" />
        <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <span className="inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wide">Coming soon</span>
            <h2 className="mt-4 font-display text-3xl text-brand sm:text-4xl">Subscribe & save</h2>
            <p className="mt-2 max-w-xl text-white/85">Never run out of food mid-week again. Pawl remembers the schedule for you.</p>
            <ul className="mt-5 space-y-2">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <CheckIcon className="mt-0.5 shrink-0 text-brand" /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid size-32 place-items-center rounded-full bg-white/10 text-6xl text-brand" aria-hidden="true">
            <CalendarIcon />
          </div>
        </div>
      </div>
    </section>
  )
}
