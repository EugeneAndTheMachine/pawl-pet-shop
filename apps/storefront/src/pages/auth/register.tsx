import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { GuestOnly } from '../../app/guards'
import { Button } from '../../components/ui/button'
import { CheckboxField, FormError, InputField } from '../../components/ui/field'
import { isDuplicateIdentity } from '../../features/auth/api'
import { AuthCard } from '../../features/auth/components/auth-card'
import { authLink } from '../../features/auth/components/auth-link'
import { registerSchema, type RegisterValues } from '../../features/auth/schemas'
import { useAuth } from '../../features/auth/use-auth'

export default function RegisterPage() {
  return (
    <GuestOnly>
      <RegisterForm />
    </GuestOnly>
  )
}

function RegisterForm() {
  const { register: signUp } = useAuth()
  const [params] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [duplicateEmail, setDuplicateEmail] = useState<string | null>(null)
  const redirect = params.get('redirect')
  const redirectQuery = redirect ? `redirect=${encodeURIComponent(redirect)}` : ''

  const { register, handleSubmit, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { first_name: '', last_name: '', email: params.get('email') ?? '', phone: '', password: '', confirm_password: '', consent: false },
  })

  const submit = handleSubmit(async ({ email, password, first_name, last_name, phone }) => {
    setError(null)
    setDuplicateEmail(null)
    try {
      await signUp({ email, password, first_name, last_name, phone })
    } catch (e) {
      if (isDuplicateIdentity(e)) setDuplicateEmail(email)
      else setError('We could not create your account right now. Please try again.')
    }
  })

  return (
    <AuthCard
      title="Join Pawl"
      subtitle="Save your addresses, follow your orders and reorder in one click."
      footer={
        <>
          Already have an account?{' '}
          <Link to={`/login${redirectQuery ? `?${redirectQuery}` : ''}`} className={authLink}>
            Sign in
          </Link>
        </>
      }
    >
      <title>Create an account – Pawl</title>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        {duplicateEmail && (
          <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
            An account with this email already exists.{' '}
            <Link to={`/login?email=${encodeURIComponent(duplicateEmail)}${redirectQuery ? `&${redirectQuery}` : ''}`} className="font-semibold underline">
              Sign in instead
            </Link>{' '}
            or{' '}
            <Link to="/forgot-password" className="font-semibold underline">
              reset your password
            </Link>
            .
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label="First name" autoComplete="given-name" error={formState.errors.first_name?.message} {...register('first_name')} />
          <InputField label="Last name" autoComplete="family-name" error={formState.errors.last_name?.message} {...register('last_name')} />
        </div>
        <InputField label="Email" type="email" autoComplete="email" error={formState.errors.email?.message} {...register('email')} />
        <InputField label="Phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0901234567" error={formState.errors.phone?.message} {...register('phone')} />
        <InputField label="Password" type="password" autoComplete="new-password" hint="At least 8 characters." error={formState.errors.password?.message} {...register('password')} />
        <InputField label="Confirm password" type="password" autoComplete="new-password" error={formState.errors.confirm_password?.message} {...register('confirm_password')} />
        <CheckboxField
          error={formState.errors.consent?.message}
          label={
            <>
              I agree to the{' '}
              <Link to="/policies/terms" target="_blank" rel="noopener" className={authLink}>
                Terms of Service
              </Link>{' '}
              and consent to Pawl processing my personal data as described in the{' '}
              <Link to="/policies/privacy" target="_blank" rel="noopener" className={authLink}>
                Privacy Policy
              </Link>
              .
            </>
          }
          {...register('consent')}
        />
        <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
