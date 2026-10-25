import aboutFood from '../../../assets/images/about-food.webp'
import bowl from '../../../assets/images/bowl.webp'
import { CheckIcon } from '../../../components/ui/icons'

const POINTS = ["Filter products by your pet's health needs",'Ingredients, calories and feeding amounts clearly listed', 'Same-day delivery and cash on delivery']

export function AboutSection() {
  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Decorative bowl cut by the section edge, as in the landing page design */}
      <img src={bowl} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 hidden w-48 rounded-full xl:block" />

      <div className="container-page grid items-center gap-10 py-16 md:grid-cols-[1.2fr_1fr] lg:py-24">
        <div>
          <h2 className="font-display text-4xl text-brand sm:text-5xl">About Pawl</h2>
          <p className="mt-6 leading-relaxed">
            Pawl was started by busy pet parents in Ho Chi Minh City and Hanoi. We know the feeling of running out of kibble mid-week with no time to visit
            a store, or standing in front of a whole shelf of food without knowing which one suits your pet.
          </p>
          <p className="mt-4 leading-relaxed">
            So Pawl curates genuine food, litter, treats and accessories, labelled by life stage, health needs and ingredients, so you can pick the right one
            in just a few minutes.
          </p>
          <ul className="mt-6 space-y-2">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-xs text-white">
                  <CheckIcon />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <img src={aboutFood} alt="A bowl of kibble, a can of wet food and a paw print" className="mx-auto w-full max-w-sm" loading="lazy" width={492} height={516} />
      </div>
    </section>
  )
}
