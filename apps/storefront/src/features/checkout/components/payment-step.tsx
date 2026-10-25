import type { HttpTypes } from '@medusajs/types'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { FormError } from '../../../components/ui/field'
import { Skeleton } from '../../../components/ui/skeleton'
import { cx } from '../../../lib/cx'
import { initiatePayment, listPaymentProviders } from '../../cart/api'
import { paymentMethodLabel } from '../../orders/order-status'
import { selectedProvider } from '../checkout-utils'

const DESCRIPTIONS: Record<string, string> = {
  pp_system_default: 'Pay in cash when the courier delivers your order.',
  pp_vnpay_vnpay: 'Pay online with an ATM card, QR code or internet banking. You will be redirected to VNPay.',
}


export function PaymentStep({ cart, onSaved }: { cart: HttpTypes.StoreCart; onSaved: (cart: HttpTypes.StoreCart) => void }) {
  const providers = useQuery({
    queryKey: ['payment-providers', cart.region_id],
    queryFn: () => listPaymentProviders(cart.region_id!),
    enabled: Boolean(cart.region_id),
  })
  const [selected, setSelected] = useState<string | undefined>(selectedProvider(cart))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const current = selected ?? providers.data?.[0]?.id

  const submit = async () => {
    if (!current) return
    setPending(true)
    setError(null)
    try {
      onSaved(await initiatePayment(cart, current))
    } catch {
      setError('This payment method is not available right now. Please choose another one.')
    } finally {
      setPending(false)
    }
  }

  if (providers.isLoading) return <Skeleton className="h-28 rounded-2xl" />
  if (providers.isError || !providers.data?.length) return <FormError message="No payment method is available. Please contact us." />

  return (
    <div className="space-y-4">
      <FormError message={error} />
      <fieldset className="space-y-2">
        <legend className="sr-only">Payment method</legend>
        {providers.data.map((provider) => (
          <label key={provider.id} className={cx('flex cursor-pointer gap-3 rounded-2xl border-2 p-4', current === provider.id ? 'border-accent bg-accent-soft/40' : 'border-line')}>
            <input type="radio" name="payment-provider" className="mt-1 accent-accent" checked={current === provider.id} onChange={() => setSelected(provider.id)} />
            <span>
              <span className="block text-sm font-semibold">{paymentMethodLabel(provider.id)}</span>
              {DESCRIPTIONS[provider.id] && <span className="block text-sm text-ink-soft">{DESCRIPTIONS[provider.id]}</span>}
            </span>
          </label>
        ))}
      </fieldset>
      <Button onClick={submit} loading={pending}>
        Review order
      </Button>
    </div>
  )
}
