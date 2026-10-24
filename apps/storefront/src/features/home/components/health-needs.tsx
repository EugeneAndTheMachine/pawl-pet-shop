import { Link } from 'react-router'
import { PawIcon } from '../../../components/ui/icons'
import { TAG_GROUPS } from '../../catalog/tag-labels'

const HEALTH = TAG_GROUPS.find((g) => g.key === 'health')!.options

export function HealthNeeds() {
  return (
    <section className="bg-surface">
      <div className="container-page py-12 sm:py-16">
        <div className="flex flex-col gap-6 rounded-3xl bg-accent-soft p-6 sm:p-10 lg:flex-row lg:items-center">
          <div className="lg:w-80">
            <p className="font-hand text-2xl text-accent">Bé nhà bạn cần gì?</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Mua theo nhu cầu sức khoẻ</h2>
            <p className="mt-2 text-sm text-ink-soft">Chọn một nhu cầu để xem các sản phẩm phù hợp.</p>
          </div>
          <ul className="flex flex-1 flex-wrap gap-2 sm:gap-3">
            {HEALTH.map((option) => (
              <li key={option.value}>
                <Link
                  to={`/products?health=${option.value}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold shadow-card transition-colors hover:bg-accent hover:text-white"
                >
                  <PawIcon className="text-brand" />
                  {option.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
