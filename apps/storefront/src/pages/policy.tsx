import { NavLink, useParams } from 'react-router'
import { Breadcrumb } from '../components/layout/breadcrumb'
import { Markdown } from '../components/ui/markdown'
import { POLICIES, findPolicy } from '../features/policies/policies'
import { cx } from '../lib/cx'
import NotFoundPage from './not-found'

export default function PolicyPage() {
  const { slug } = useParams()
  const policy = findPolicy(slug)
  if (!policy) return <NotFoundPage />

  return (
    <div className="container-page py-6 sm:py-8">
      <title>{`${policy.title} – Pawl`}</title>
      <meta name="description" content={policy.description} />
      <Breadcrumb items={[{ label: policy.title }]} />

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Policies" className="rounded-3xl bg-white p-3 shadow-card lg:sticky lg:top-24 lg:p-4">
          <p className="hidden px-2 pb-2 text-sm font-semibold text-ink-soft lg:block">Policies</p>
          <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {POLICIES.map((p) => (
              <li key={p.slug} className="shrink-0">
                <NavLink
                  to={`/policies/${p.slug}`}
                  className={({ isActive }) =>
                    cx(
                      'block rounded-full px-4 py-2 text-sm font-semibold transition-colors lg:rounded-xl',
                      isActive ? 'bg-accent text-white' : 'text-ink hover:bg-accent-soft',
                    )
                  }
                >
                  {p.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <article className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
          <Markdown>{policy.content}</Markdown>
        </article>
      </div>
    </div>
  )
}
