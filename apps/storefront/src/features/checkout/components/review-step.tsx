import type { HttpTypes } from '@medusajs/types'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '../../../components/ui/button'
import { CheckboxField, FormError } from '../../../components/ui/field'
import { ShieldIcon } from '../../../components/ui/icons'
import { formatVND } from '../../../lib/format'
import { completeCart } from '../../cart/api'
import { useCart } from '../../cart/use-cart'
import { startVnpayPayment } from '../api'
import { selectedProvider, VNPAY_PROVIDER } from '../checkout-utils'

const policyLink = 'font-semibold text-accent underline underline-offset-2 hover:text-accent-dark'

export function ReviewStep({ cart }: { cart: HttpTypes.StoreCart }) {
  const { setCart, clearCart } = useCart()
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false)
  const [showConsentError, setShowConsentError] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isVnpay = selectedProvider(cart) === VNPAY_PROVIDER

  const placeOrder = async () => {
    if (!agreed) {
      setShowConsentError(true)
      return
    }
    setPending(true)
    setError(null)
    try {
      if (isVnpay) {
        // The order is created after VNPay sends the shopper back to /checkout/result
        window.location.assign(await startVnpayPayment(cart))
        return
      }
      const result = await completeCart(cart.id)
      if (result.type === 'order') {
        clearCart()
        navigate(`/orders/${result.order.id}/confirmed`, { replace: true })
        return
      }
      setCart(result.cart)
      setError(/inventory|stock/i.test(result.message) ? 'Some items are no longer in stock. Please update your cart.' : 'We could not place your order. Please check your details and try again.')
    } catch {
      setError(isVnpay ? 'We could not connect to VNPay. Please try again or choose cash on delivery.' : 'We could not place your order. Please try again.')
    }
    setPending(false)
  }

  return (
    <div className="space-y-4">
      <FormError message={error} />
      <p className="text-sm text-ink-soft">
        Please check your details above. You will pay <strong className="text-ink">{formatVND(cart.total)}</strong>
        {isVnpay ? ' on the VNPay page.' : ' in cash when the order arrives.'}
      </p>
      <CheckboxField
        checked={agreed}
        onChange={(e) => {
          setAgreed(e.target.checked)
          if (e.target.checked) setShowConsentError(false)
        }}
        error={showConsentError ? 'Please agree to the Terms of Service and the Privacy Policy to place your order.' : undefined}
        label={
          <>
            I agree to the{' '}
            <Link to="/policies/terms" target="_blank" rel="noopener" className={policyLink}>
              Terms of Service
            </Link>{' '}
            and the{' '}
            <Link to="/policies/privacy" target="_blank" rel="noopener" className={policyLink}>
              Privacy Policy
            </Link>
            , including the processing of my personal data to deliver this order.
          </>
        }
      />
      <Button size="lg" className="w-full sm:w-auto" onClick={placeOrder} loading={pending}>
        {isVnpay ? 'Pay with VNPay' : 'Place order'}
      </Button>
      <p className="flex items-center gap-2 text-xs text-ink-soft">
        <ShieldIcon className="text-base text-success" />
        {isVnpay ? 'Card details are entered on VNPay’s secure page. Pawl never sees or stores them.' : 'No payment is taken now.'}
      </p>
    </div>
  )
}
