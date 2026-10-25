import { zodResolver } from '@hookform/resolvers/zod'
import type { HttpTypes } from '@medusajs/types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/button'
import { FormError, InputField } from '../../../components/ui/field'
import { contactSchema, normalizePhone, type ContactValues } from '../../auth/schemas'
import { useAuth } from '../../auth/use-auth'
import { updateCart } from '../../cart/api'
import { contactPhone } from '../checkout-utils'


export function ContactStep({ cart, onSaved }: { cart: HttpTypes.StoreCart; onSaved: (cart: HttpTypes.StoreCart) => void }) {
  const { customer } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { email: cart.email ?? customer?.email ?? '', phone: contactPhone(cart) ?? customer?.phone ?? '' },
  })

  const submit = handleSubmit(async (values) => {
    setError(null)
    try {
      onSaved(await updateCart(cart.id, { email: values.email, metadata: { ...(cart.metadata ?? {}), contact_phone: normalizePhone(values.phone) } }))
    } catch {
      setError('We could not save your contact details. Please try again.')
    }
  })

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <FormError message={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Email" type="email" autoComplete="email" hint="Your order confirmation is sent here." error={formState.errors.email?.message} {...register('email')} />
        <InputField label="Phone" type="tel" autoComplete="tel" inputMode="tel" hint="The courier calls this number." error={formState.errors.phone?.message} {...register('phone')} />
      </div>
      <Button type="submit" loading={formState.isSubmitting}>
        Continue to address
      </Button>
    </form>
  )
}
