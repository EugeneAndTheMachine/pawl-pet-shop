import { Link } from 'react-router'
import bowl from '../../../assets/images/bowl.webp'
import foodImg from '../../../assets/images/category-food.webp'
import hygieneImg from '../../../assets/images/category-hygiene.webp'
import toysImg from '../../../assets/images/category-toys.webp'
import { ChevronRightIcon } from '../../../components/ui/icons'

const CARDS = [
  { title: 'Dry & wet food', text: 'Complete meals for every life stage', to: '/products?form=dry,wet', image: foodImg },
  { title: 'Treats & supplements', text: 'Little rewards and healthy extras', to: '/products?form=treat,supplement', image: bowl, round: true },
  { title: 'Litter & hygiene', text: 'A clean, odour-free corner for your cat', to: '/products?form=litter', image: hygieneImg },
  { title: 'Toys & accessories', text: 'Play, walks and easy mealtimes', to: '/products?form=accessory', image: toysImg },
]

export function CategoryShowcase() {
  return (
    <section className="relative overflow-hidden bg-accent">
      <img src={bowl} alt="" aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 hidden w-44 rounded-full opacity-90 lg:block" />

      <div className="container-page py-16 lg:py-20">
        <div className="text-center">
          <h2 className="font-display text-4xl text-white sm:text-5xl">Shop by category</h2>
          <p className="mt-3 text-white/80">Start with what you need, then filter by age and health</p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2">
          {CARDS.map((card) => (
            <li key={card.title}>
              <Link
                to={card.to}
                className="group flex h-full items-center gap-4 rounded-3xl bg-accent-dark p-5 shadow-lift transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-white sm:flex-col sm:p-8 sm:text-center"
              >
                <div className="grid size-28 shrink-0 place-items-center sm:size-44">
                  <img
                    src={card.image}
                    alt=""
                    loading="lazy"
                    className={card.round ? 'size-full rounded-full object-cover' : 'max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105'}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white sm:text-2xl">{card.title}</h3>
                  <p className="mt-1 text-sm text-white/75">{card.text}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    Shop now <ChevronRightIcon />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
