import type { HttpTypes } from '@medusajs/types'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { FormError } from '../../../components/ui/field'
import { Skeleton } from '../../../components/ui/skeleton'
import { cx } from '../../../lib/cx'
import { formatVND } from '../../../lib/format'
import { listShippingOptions, setShippingMethod } from '../../cart/api'

export function ShippingStep({ cart, onSaved }: { cart: HttpTypes.StoreCart; onSaved: (cart: HttpTypes.StoreCart) => void }) {
  const options = useQuery({
    queryKey: ['shipping-options', cart.id, cart.shipping_address?.province],
    queryFn: () => listShippingOptions(cart.id),
  })
  const [selected, setSelected] = useState<string | undefined>(cart.shipping_methods?.[0]?.shipping_option_id ?? undefined)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const current = selected ?? options.data?.[0]?.id

  const submit = async () => {
    if (!current) return
    setPending(true)
    setError(null)
    try {
      onSaved(await setShippingMethod(cart.id, current))
    } catch {
      setError('We could not set this delivery method. Please try again.')
    } finally {
      setPending(false)
    }
  }

  if (options.isLoading) return <Skeleton className="h-28 rounded-2xl" />
  if (options.isError || !options.data?.length) {
    return <FormError message="No delivery method is available for this address. Please check the address or contact us." />
  }

  return (
    <div className="space-y-4">
      <FormError message={error} />
      <fieldset className="space-y-2">
        <legend className="sr-only">Delivery method</legend>
        {options.data.map((option) => (
          <label key={option.id} className={cx('flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4', current === option.id ? 'border-accent bg-accent-soft/40' : 'border-line')}>
            <input type="radio" name="shipping-option" className="accent-accent" checked={current === option.id} onChange={() => setSelected(option.id)} />
            <span className="flex-1 text-sm font-medium">{option.name}</span>
            <span className="font-semibold">{formatVND(option.amount)}</span>
          </label>
        ))}
      </fieldset>
      <Button onClick={submit} loading={pending}>
        Continue to payment
      </Button>
    </div>
  )
}
