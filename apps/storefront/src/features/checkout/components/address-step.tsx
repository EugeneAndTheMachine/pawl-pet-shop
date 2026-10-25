import { zodResolver } from '@hookform/resolvers/zod'
import type { HttpTypes } from '@medusajs/types'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/button'
import { CheckboxField, FormError } from '../../../components/ui/field'
import { cx } from '../../../lib/cx'
import { createAddress, fromMedusaAddress, toMedusaAddress } from '../../account/api'
import { formatAddress } from '../../account/address-utils'
import { AddressFields } from '../../account/components/address-fields'
import { addressSchema, type AddressValues } from '../../auth/schemas'
import { useAuth } from '../../auth/use-auth'
import { updateCart } from '../../cart/api'
import { contactPhone } from '../checkout-utils'

export function AddressStep({ cart, onSaved }: { cart: HttpTypes.StoreCart; onSaved: (cart: HttpTypes.StoreCart) => void }) {
  const { customer, refresh } = useAuth()
  const saved = customer?.addresses ?? []
  const defaultSaved = saved.find((a) => a.is_default_shipping) ?? saved[0]
  // Saved address id, or "new" for the form
  const [choice, setChoice] = useState<string>(cart.shipping_address?.address_1 || !defaultSaved ? 'new' : defaultSaved.id)
  const [saveToBook, setSaveToBook] = useState(Boolean(customer) && saved.length === 0)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState } = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      ...fromMedusaAddress(cart.shipping_address),
      full_name: cart.shipping_address?.first_name || [customer?.first_name, customer?.last_name].filter(Boolean).join(' '),
      phone: cart.shipping_address?.phone || contactPhone(cart) || customer?.phone || '',
    },
  })

  const save = async (address: ReturnType<typeof toMedusaAddress>) => {
    setError(null)
    try {
      onSaved(await updateCart(cart.id, { shipping_address: address, billing_address: address }))
    } catch {
      setError('We could not save this address. Please try again.')
    }
  }

  const submitNew = handleSubmit(async (values) => {
    if (customer && saveToBook) {
      await createAddress(values, saved.length === 0).catch(() => undefined)
      void refresh()
    }
    await save(toMedusaAddress(values))
  })

  const useSaved = async () => {
    const address = saved.find((a) => a.id === choice)
    if (!address) return
    await save({
      first_name: address.first_name ?? '',
      last_name: address.last_name ?? '',
      phone: address.phone ?? '',
      province: address.province ?? '',
      city: address.city ?? '',
      address_1: address.address_1 ?? '',
      country_code: 'vn',
    })
  }

  return (
    <div className="space-y-4">
      <FormError message={error} />
      {saved.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Saved addresses</legend>
          {saved.map((address) => {
            const f = formatAddress(address)
            return (
              <label key={address.id} className={cx('flex cursor-pointer gap-3 rounded-2xl border-2 p-4 text-sm', choice === address.id ? 'border-accent bg-accent-soft/40' : 'border-line')}>
                <input type="radio" name="address-choice" className="mt-1 accent-accent" checked={choice === address.id} onChange={() => setChoice(address.id)} />
                <span>
                  <span className="font-semibold">{f.name}</span>
                  {address.is_default_shipping && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-white">Default</span>}
                  {f.lines.map((l) => (
                    <span key={l} className="block text-ink-soft">
                      {l}
                    </span>
                  ))}
                </span>
              </label>
            )
          })}
          <label className={cx('flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 text-sm font-medium', choice === 'new' ? 'border-accent bg-accent-soft/40' : 'border-line')}>
            <input type="radio" name="address-choice" className="accent-accent" checked={choice === 'new'} onChange={() => setChoice('new')} />
            Use a new address
          </label>
        </fieldset>
      )}

      {choice === 'new' ? (
        <form onSubmit={submitNew} className="space-y-4" noValidate>
          <AddressFields register={register} errors={formState.errors} />
          {customer && <CheckboxField label="Save this address to my account" checked={saveToBook} onChange={(e) => setSaveToBook(e.target.checked)} />}
          <Button type="submit" loading={formState.isSubmitting}>
            Continue to delivery
          </Button>
        </form>
      ) : (
        <Button onClick={useSaved}>Deliver to this address</Button>
      )}
    </div>
  )
}
