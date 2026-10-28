import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { Button, ButtonLink } from '../../components/ui/button'
import { FormError, InputField } from '../../components/ui/field'
import { CheckIcon } from '../../components/ui/icons'
import { resetPassword } from '../../features/auth/api'
import { AuthCard } from '../../features/auth/components/auth-card'
import { authLink } from '../../features/auth/components/auth-link'
import { resetPasswordSchema } from '../../features/auth/schemas'

type ResetValues = { password: string; confirm_password: string }

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const email = params.get('email')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<ResetValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: '', confirm_password: '' } })

  const submit = handleSubmit(async ({ password }) => {
    if (!token || !email) return
    setError(null)
    try {
      await resetPassword(token, email, password)
      setDone(true)
    } catch {
      setError('This reset link is invalid or has expired. Please request a new one.')
    }
  })

  if (!token || !email) {
    return (
      <AuthCard title="Link not valid" subtitle="This password reset link is incomplete. Please request a new one.">
        <title>Reset your password – Pawl</title>
        <meta name="robots" content="noindex" />
        <ButtonLink to="/forgot-password" className="w-full">
          Request a new link
        </ButtonLink>
      </AuthCard>
    )
  }

  if (done) {
    return (
      <AuthCard title="Password updated">
        <title>Password updated – Pawl</title>
        <meta name="robots" content="noindex" />
        <div className="space-y-4 text-center text-sm">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-2xl text-success">
            <CheckIcon />
          </span>
          <p>You can now sign in with your new password.</p>
          <ButtonLink to={`/login?email=${encodeURIComponent(email)}`} className="w-full">
            Sign in
          </ButtonLink>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle={
        <>
          For <strong className="text-ink">{email}</strong>
        </>
      }
      footer={
        <Link to="/forgot-password" className={authLink}>
          Request a new link
        </Link>
      }
    >
      <title>Choose a new password – Pawl</title>
      <meta name="robots" content="noindex" />
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <InputField label="New password" type="password" autoComplete="new-password" hint="At least 8 characters." error={formState.errors.password?.message} {...register('password')} />
        <InputField label="Confirm new password" type="password" autoComplete="new-password" error={formState.errors.confirm_password?.message} {...register('confirm_password')} />
        <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
          Update password
        </Button>
      </form>
    </AuthCard>
  )
}
