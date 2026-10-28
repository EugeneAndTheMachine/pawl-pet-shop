import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { Button } from '../../components/ui/button'
import { FormError, InputField } from '../../components/ui/field'
import { MailIcon } from '../../components/ui/icons'
import { requestPasswordReset } from '../../features/auth/api'
import { AuthCard } from '../../features/auth/components/auth-card'
import { authLink } from '../../features/auth/components/auth-link'
import { forgotPasswordSchema } from '../../features/auth/schemas'

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<{ email: string }>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } })

  const submit = handleSubmit(async ({ email }) => {
    setError(null)
    try {
      // Medusa answers the same way whether or not the email has an account, so nobody can probe for accounts
      await requestPasswordReset(email)
      setSentTo(email)
    } catch {
      setError('We could not send the reset link right now. Please try again.')
    }
  })

  const footer = (
    <Link to="/login" className={authLink}>
      Back to sign in
    </Link>
  )

  if (sentTo) {
    return (
      <AuthCard title="Check your inbox" footer={footer}>
        <title>Reset your password – Pawl</title>
        <meta name="robots" content="noindex" />
        <div className="space-y-4 text-center text-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent-soft text-2xl text-accent">
            <MailIcon />
          </span>
          <p>
            If an account exists for <strong>{sentTo}</strong>, we have sent a link to reset your password. The link is valid for 15 minutes.
          </p>
          <p className="text-ink-soft">Did not get it? Check your spam folder or try again.</p>
          <Button variant="outline" onClick={() => setSentTo(null)}>
            Try again
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Forgot password?" subtitle="Enter the email you signed up with and we will send you a reset link." footer={footer}>
      <title>Reset your password – Pawl</title>
      <meta name="robots" content="noindex" />
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <InputField label="Email" type="email" autoComplete="email" error={formState.errors.email?.message} {...register('email')} />
        <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
          Send reset link
        </Button>
      </form>
    </AuthCard>
  )
}
