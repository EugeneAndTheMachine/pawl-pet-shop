import { Breadcrumb } from '../components/layout/breadcrumb'
import { ButtonLink } from '../components/ui/button'
import { WalletIcon } from '../components/ui/icons'
import { Skeleton } from '../components/ui/skeleton'
import { useCart } from '../features/cart/use-cart'
import { qrPayment } from '../features/checkout/checkout-utils'
import { QrPaymentPanel } from '../features/checkout/components/qr-payment-panel'

export default function CheckoutPayPage() {
  const { cart, isLoading } = useCart()
  const payment = qrPayment(cart)

  return (
    <div className="container-page py-6 sm:py-8">
      <title>Payment – Pawl</title>
      <Breadcrumb items={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout', to: '/checkout' }, { label: 'Payment' }]} />
      <h1 className="mb-6 mt-4 font-display text-3xl text-brand sm:text-4xl">Bank transfer</h1>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      ) : cart && payment ? (
        <QrPaymentPanel cart={cart} payment={payment} />
      ) : (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl bg-white px-6 py-14 text-center shadow-card">
          <span className="grid size-16 place-items-center rounded-full bg-brand-soft text-3xl text-brand">
            <WalletIcon />
          </span>
          <h2 className="text-lg font-semibold">No payment in progress</h2>
          <p className="max-w-sm text-sm text-ink-soft">Your cart changed or the payment was not started. Please review your order again.</p>
          <ButtonLink to="/checkout">Back to checkout</ButtonLink>
        </div>
      )}
    </div>
  )
}
