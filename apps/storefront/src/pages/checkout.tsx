import type { HttpTypes } from '@medusajs/types'
import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { Breadcrumb } from '../components/layout/breadcrumb'
import { ButtonLink } from '../components/ui/button'
import { CartIcon } from '../components/ui/icons'
import { Skeleton } from '../components/ui/skeleton'
import { formatAddress } from '../features/account/address-utils'
import { useAuth } from '../features/auth/use-auth'
import { useCart } from '../features/cart/use-cart'
import { AddressStep } from '../features/checkout/components/address-step'
import { CheckoutSummary } from '../features/checkout/components/checkout-summary'
import { ContactStep } from '../features/checkout/components/contact-step'
import { PaymentStep } from '../features/checkout/components/payment-step'
import { ReviewStep } from '../features/checkout/components/review-step'
import { ShippingStep } from '../features/checkout/components/shipping-step'
import { StepSection } from '../features/checkout/components/step-section'
import { completedSteps, contactPhone, firstIncompleteStep, selectedProvider, STEPS, type StepKey } from '../features/checkout/checkout-utils'
import { usePrefetchCheckoutOptions } from '../features/checkout/queries'
import { paymentMethodLabel } from '../features/orders/order-status'
import { formatVND } from '../lib/format'

const TITLES: Record<StepKey, string> = {
  contact: 'Contact',
  address: 'Delivery address',
  shipping: 'Delivery method',
  payment: 'Payment',
  review: 'Review and place order',
}

function isStep(value: string | null): value is StepKey {
  return STEPS.includes(value as StepKey)
}

export default function CheckoutPage() {
  const { cart, isLoading, setCart } = useCart()
  const auth = useAuth()
  const [params] = useSearchParams()
  // A step the shopper chose to edit; ?step= lets the payment result page send them back to "Payment"
  const [editing, setEditing] = useState<StepKey | null>(() => (isStep(params.get('step')) ? (params.get('step') as StepKey) : null))
  usePrefetchCheckoutOptions(cart)

  if (isLoading || auth.isLoading) {
    return (
      <CheckoutShell>
        <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
          <div className="space-y-4">
            {STEPS.map((s) => (
              <Skeleton key={s} className="h-20 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </CheckoutShell>
    )
  }

  if (!cart || (cart.items ?? []).length === 0) {
    return (
      <CheckoutShell>
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-16 text-center shadow-card">
          <span className="grid size-20 place-items-center rounded-full bg-brand-soft text-4xl text-brand">
            <CartIcon />
          </span>
          <h2 className="text-lg font-semibold">Your cart is empty</h2>
          <p className="max-w-sm text-sm text-ink-soft">Add a few things for your pet before checking out.</p>
          <ButtonLink to="/products">Start shopping</ButtonLink>
        </div>
      </CheckoutShell>
    )
  }

  const done = completedSteps(cart)
  const first = firstIncompleteStep(cart)
  // Shoppers can go back to any finished step, but never skip ahead of the first unfinished one
  const active = editing && STEPS.indexOf(editing) <= STEPS.indexOf(first) ? editing : first

  const onSaved = (updated: HttpTypes.StoreCart) => {
    setCart(updated)
    setEditing(null)
  }

  const stateOf = (step: StepKey) => (step === active ? 'active' : step !== 'review' && done[step] ? 'done' : 'upcoming')
  const address = formatAddress(cart.shipping_address)
  const shippingMethod = cart.shipping_methods?.[0]

  return (
    <CheckoutShell>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-4">
          <StepSection index={1} title={TITLES.contact} state={stateOf('contact')} onEdit={() => setEditing('contact')} summary={`${cart.email} · ${contactPhone(cart) ?? ''}`}>
            <ContactStep cart={cart} onSaved={onSaved} />
          </StepSection>
          <StepSection
            index={2}
            title={TITLES.address}
            state={stateOf('address')}
            onEdit={() => setEditing('address')}
            summary={
              <>
                <span className="block font-medium text-ink">{address.name}</span>
                {address.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </>
            }
          >
            <AddressStep cart={cart} onSaved={onSaved} />
          </StepSection>
          <StepSection
            index={3}
            title={TITLES.shipping}
            state={stateOf('shipping')}
            onEdit={() => setEditing('shipping')}
            summary={shippingMethod && `${shippingMethod.name} · ${formatVND(shippingMethod.amount)}`}
          >
            <ShippingStep cart={cart} onSaved={onSaved} />
          </StepSection>
          <StepSection index={4} title={TITLES.payment} state={stateOf('payment')} onEdit={() => setEditing('payment')} summary={paymentMethodLabel(selectedProvider(cart))}>
            <PaymentStep cart={cart} onSaved={onSaved} />
          </StepSection>
          <StepSection index={5} title={TITLES.review} state={stateOf('review')}>
            <ReviewStep cart={cart} />
          </StepSection>
        </div>

        <aside className="lg:sticky lg:top-24" aria-label="Order summary">
          <CheckoutSummary cart={cart} />
        </aside>
      </div>
    </CheckoutShell>
  )
}

function CheckoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="container-page py-6 sm:py-8">
      <title>Checkout – Pawl</title>
      <meta name="robots" content="noindex" />
      <Breadcrumb items={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="mb-6 mt-4 font-display text-3xl text-brand sm:text-4xl">Checkout</h1>
      {children}
    </div>
  )
}
