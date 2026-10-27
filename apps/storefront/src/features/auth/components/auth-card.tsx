import type { ReactNode } from 'react'
import { PawIcon } from '../../../components/ui/icons'

/** The centred card shared by sign in, sign up and the password pages */
export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="container-page flex justify-center py-10 sm:py-16">
      <div className="w-full max-w-md">
        <section className="rounded-3xl bg-white p-6 shadow-card sm:p-8">
          <div className="mb-6 text-center">
            <PawIcon className="mx-auto mb-2 text-3xl text-brand" />
            <h1 className="font-display text-3xl text-brand">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>}
          </div>
          {children}
        </section>
        {footer && <div className="mt-5 text-center text-sm text-ink-soft">{footer}</div>}
      </div>
    </div>
  )
}
