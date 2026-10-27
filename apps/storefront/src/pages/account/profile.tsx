import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { AccountHeading } from '../../components/layout/account-layout'
import { Button } from '../../components/ui/button'
import { FormError, InputField } from '../../components/ui/field'
import { useToast } from '../../components/ui/use-toast'
import { updateProfile } from '../../features/account/api'
import { authLink } from '../../features/auth/components/auth-link'
import { profileSchema, type ProfileValues } from '../../features/auth/schemas'
import { useAuth } from '../../features/auth/use-auth'

export default function AccountProfilePage() {
  const { customer, refresh } = useAuth()
  const { showToast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState, reset } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: customer?.first_name ?? '', last_name: customer?.last_name ?? '', phone: customer?.phone ?? '' },
  })

  const submit = handleSubmit(async (values) => {
    setError(null)
    try {
      const updated = await updateProfile(values)
      reset({ first_name: updated.first_name ?? '', last_name: updated.last_name ?? '', phone: updated.phone ?? '' })
      await refresh()
      showToast('Your profile has been updated.', 'success')
    } catch {
      setError('We could not save your changes. Please try again.')
    }
  })

  return (
    <>
      <title>Profile – Pawl</title>
      <AccountHeading title="Profile" />
      <section className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
        <form onSubmit={submit} className="max-w-xl space-y-4" noValidate>
          <FormError message={error} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="First name" autoComplete="given-name" error={formState.errors.first_name?.message} {...register('first_name')} />
            <InputField label="Last name" autoComplete="family-name" error={formState.errors.last_name?.message} {...register('last_name')} />
          </div>
          <InputField label="Phone" type="tel" inputMode="tel" autoComplete="tel" error={formState.errors.phone?.message} {...register('phone')} />
          <InputField label="Email" type="email" value={customer?.email ?? ''} disabled readOnly hint="Your email is your sign-in name and cannot be changed." />
          <Button type="submit" loading={formState.isSubmitting} disabled={!formState.isDirty}>
            Save changes
          </Button>
        </form>
      </section>

      <section className="mt-5 rounded-3xl bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-semibold">Password</h2>
        <p className="mt-1 text-sm text-ink-soft">
          To change your password, we will email you a secure link.{' '}
          <Link to="/forgot-password" className={authLink}>
            Send me a reset link
          </Link>
        </p>
      </section>
    </>
  )
}
