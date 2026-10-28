import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { Breadcrumb } from '../components/layout/breadcrumb'
import { Button } from '../components/ui/button'
import { InputField, SelectField, TextareaField } from '../components/ui/field'
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from '../components/ui/icons'
import { useToast } from '../components/ui/use-toast'
import { CONTACT_TOPICS, contactSchema, type ContactInput } from '../features/contact/schemas'

const EMPTY: ContactInput = { name: '', email: '', phone: '', topic: '', order_number: '', message: '' }

export default function ContactPage() {
  const { showToast } = useToast()
  const { register, handleSubmit, reset, formState } = useForm<ContactInput>({ resolver: zodResolver(contactSchema), defaultValues: EMPTY })
  const { errors } = formState

  // Phase 1: the form is not sent anywhere yet, it only confirms to the customer
  const submit = handleSubmit(() => {
    showToast('Thanks for reaching out! We will reply by email within 24 hours.', 'success')
    reset(EMPTY)
  })

  return (
    <div className="container-page py-6 sm:py-8">
      <title>Contact us – Pawl</title>
      <meta name="description" content="Questions about a product or an order? Call the Pawl hotline 1900 0000, email support@pawl.vn or send us a message." />
      <Breadcrumb items={[{ label: 'Contact us' }]} />

      <header className="mt-6 max-w-2xl">
        <h1 className="font-display text-4xl text-brand sm:text-5xl">Contact us</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Questions about food for a picky eater, an order on its way or a return? Our team answers every day from 8:00 to 21:00.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <ContactCard icon={<PhoneIcon />} title="Hotline">
            <a href="tel:19000000" className="font-semibold text-brand-strong hover:text-brand-deep">
              1900 0000
            </a>
          </ContactCard>
          <ContactCard icon={<MailIcon />} title="Email">
            <a href="mailto:support@pawl.vn" className="font-semibold text-brand-strong hover:text-brand-deep">
              support@pawl.vn
            </a>
          </ContactCard>
          <ContactCard icon={<MapPinIcon />} title="Office & warehouse">
            268 Ly Thuong Kiet, Dien Hong Ward, Ho Chi Minh City
          </ContactCard>
          <ContactCard icon={<ClockIcon />} title="Opening hours">
            Every day, 8:00 – 21:00
          </ContactCard>
        </ul>

        <section aria-labelledby="contact-form-title" className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
          <h2 id="contact-form-title" className="text-xl font-bold">
            Send us a message
          </h2>
          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Your name" autoComplete="name" error={errors.name?.message} {...register('name')} />
              <InputField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
              <InputField label="Phone" type="tel" autoComplete="tel" optional error={errors.phone?.message} {...register('phone')} />
              <InputField label="Order number" optional hint="For questions about an order, e.g. #1024" error={errors.order_number?.message} {...register('order_number')} />
            </div>
            <SelectField label="Topic" options={CONTACT_TOPICS} placeholder="Choose a topic" error={errors.topic?.message} {...register('topic')} />
            <TextareaField label="Message" rows={5} error={errors.message?.message} {...register('message')} />
            <p className="text-xs text-ink-soft">
              We only use your details to answer your message. See our{' '}
              <Link to="/policies/privacy" className="font-medium text-brand-strong underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
            <Button type="submit" size="lg" className="w-full sm:w-auto" loading={formState.isSubmitting}>
              Send message
            </Button>
          </form>
        </section>
      </div>
    </div>
  )
}

function ContactCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-card">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft text-xl text-brand-strong">{icon}</span>
      <div>
        <h2 className="text-sm font-semibold text-ink-soft">{title}</h2>
        <p className="mt-0.5">{children}</p>
      </div>
    </li>
  )
}
