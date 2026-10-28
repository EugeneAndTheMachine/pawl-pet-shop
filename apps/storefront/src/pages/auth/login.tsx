import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { GuestOnly } from '../../app/guards'
import { Button } from '../../components/ui/button'
import { FormError, InputField } from '../../components/ui/field'
import { isAuthError } from '../../features/auth/api'
import { AuthCard } from '../../features/auth/components/auth-card'
import { authLink } from '../../features/auth/components/auth-link'
import { loginSchema, type LoginValues } from '../../features/auth/schemas'
import { useAuth } from '../../features/auth/use-auth'

export default function LoginPage() {
  return (
    <GuestOnly>
      <LoginForm />
    </GuestOnly>
  )
}

function LoginForm() {
  const { login } = useAuth()
  const [params] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const redirect = params.get('redirect')

  const { register, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: params.get('email') ?? '', password: '' },
  })

  // GuestOnly sends the customer on to ?redirect= as soon as the session exists
  const submit = handleSubmit(async ({ email, password }) => {
    setError(null)
    try {
      await login(email, password)
    } catch (e) {
      setError(isAuthError(e) ? 'The email or password is incorrect.' : 'We could not sign you in right now. Please try again.')
    }
  })

  return (
    <AuthCard
      title="Welcome back"
      subtitle={redirect?.startsWith('/account') ? 'Please sign in to view your account.' : 'Sign in to track orders and check out faster.'}
      footer={
        <>
          New to Pawl?{' '}
          <Link to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'} className={authLink}>
            Create an account
          </Link>
        </>
      }
    >
      <title>Sign in – Pawl</title>
      <meta name="robots" content="noindex" />
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormError message={error} />
        <InputField label="Email" type="email" autoComplete="email" error={formState.errors.email?.message} {...register('email')} />
        <InputField label="Password" type="password" autoComplete="current-password" error={formState.errors.password?.message} {...register('password')} />
        <div className="text-right text-sm">
          <Link to="/forgot-password" className={authLink}>
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  )
}
