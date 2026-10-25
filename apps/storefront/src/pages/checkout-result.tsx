import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Button, ButtonLink } from '../components/ui/button'
import { AlertIcon } from '../components/ui/icons'
import { FormError } from '../components/ui/field'
import { useCart } from '../features/cart/use-cart'
import { startVnpayPayment } from '../features/checkout/api'
import { useVnpayResult } from '../features/checkout/hooks'

/** VNPay sends the shopper back here (VNP_RETURN_URL) with the signed result in the query string */
export default function CheckoutResultPage() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { cart, clearCart } = useCart()
  const hasResult = new URLSearchParams(search).has('vnp_TxnRef')
  const result = useVnpayResult(search, hasResult)
  const [retrying, setRetrying] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)
  const outcome = result.data

  useEffect(() => {
    if (outcome?.status === 'paid') {
      if (cart?.id === outcome.cartId) clearCart()
      navigate(`/orders/${outcome.orderId}/confirmed`, { replace: true })
    } else if (outcome?.status === 'failed') {
      // The cart is kept; reload it so the checkout shows its current state
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  }, [outcome, cart?.id, clearCart, navigate, queryClient])

  const retry = async () => {
    if (!cart) return
    setRetrying(true)
    setRetryError(null)
    try {
      window.location.assign(await startVnpayPayment(cart))
    } catch {
      setRetryError('We could not connect to VNPay. Please try again in a moment or pay on delivery.')
      setRetrying(false)
    }
  }

  if (!hasResult) {
    return (
      <ResultShell title="No payment to check" tone="danger">
        <p className="text-ink-soft">This page shows the result of a VNPay payment. Your cart is still saved.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/cart">Back to cart</ButtonLink>
        </div>
      </ResultShell>
    )
  }

  if (result.isPending || outcome?.status === 'paid') {
    return (
      <ResultShell title="Confirming your payment…" tone="pending">
        <p className="text-ink-soft">Please keep this page open while we confirm the payment with VNPay and create your order.</p>
      </ResultShell>
    )
  }

  const message = outcome?.status === 'failed' ? outcome.message : 'We could not check the payment result. Please try again.'
  return (
    <ResultShell title="Payment not completed" tone="danger">
      <p className="text-ink-soft">{message}</p>
      <p className="mt-2 text-sm text-ink-soft">No order was created and your cart is still saved.</p>
      {outcome?.status === 'failed' && outcome.txnRef && <p className="mt-2 text-xs text-ink-soft">Reference: {outcome.txnRef}</p>}
      <div className="mx-auto mt-4 max-w-md text-left">
        <FormError message={retryError} />
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {cart && (cart.items ?? []).length > 0 ? (
          <>
            <Button onClick={retry} loading={retrying}>
              Try VNPay again
            </Button>
            <ButtonLink to="/checkout?step=payment" variant="outline">
              Pay on delivery instead
            </ButtonLink>
          </>
        ) : (
          <ButtonLink to="/cart">Back to cart</ButtonLink>
        )}
      </div>
    </ResultShell>
  )
}

function ResultShell({ title, tone, children }: { title: string; tone: 'pending' | 'danger'; children: ReactNode }) {
  return (
    <section className="container-page py-12 sm:py-16">
      <title>Payment result – Pawl</title>
      <div className="mx-auto max-w-xl rounded-3xl bg-white px-6 py-10 text-center shadow-card sm:px-10" aria-live="polite">
        {tone === 'pending' ? (
          <span className="mx-auto mb-5 block size-14 animate-spin rounded-full border-4 border-accent border-r-transparent" aria-hidden="true" />
        ) : (
          <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-danger-soft text-3xl text-danger">
            <AlertIcon />
          </span>
        )}
        <h1 className="mb-3 text-2xl font-bold">{title}</h1>
        {children}
      </div>
    </section>
  )
}
