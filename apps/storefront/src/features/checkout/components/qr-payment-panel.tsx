import type { HttpTypes } from '@medusajs/types'
import { FetchError } from '@medusajs/js-sdk'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import paymentQr from '../../../assets/images/payment-qr.png'
import { Button, ButtonLink } from '../../../components/ui/button'
import { FormError } from '../../../components/ui/field'
import { ClockIcon, CopyIcon, RefreshIcon, ShieldIcon } from '../../../components/ui/icons'
import { useToast } from '../../../components/ui/use-toast'
import { cx } from '../../../lib/cx'
import { formatVND } from '../../../lib/format'
import { useCart } from '../../cart/use-cart'
import { confirmQrPayment, startQrPayment } from '../api'
import type { QrPayment } from '../checkout-utils'
import { useCountdown } from '../hooks'

// The simulated confirmation answers instantly; a short wait mirrors how long a bank notification takes
const CONFIRM_DELAY_MS = 2500

function formatRemaining(ms: number) {
  const seconds = Math.ceil(ms / 1000)
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

export function QrPaymentPanel({ cart, payment }: { cart: HttpTypes.StoreCart; payment: QrPayment }) {
  const { setCart, clearCart } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const remaining = useCountdown(payment.expiresAt)
  const [verifying, setVerifying] = useState(false)
  const [renewing, setRenewing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const expired = remaining === 0

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      showToast(`${label} copied`, 'success')
    } catch {
      showToast(`Could not copy the ${label.toLowerCase()}`, 'error')
    }
  }

  const renew = async () => {
    setRenewing(true)
    setError(null)
    try {
      setCart(await startQrPayment(cart))
    } catch {
      setError('We could not create a new QR code. Please try again.')
    }
    setRenewing(false)
  }

  const confirm = async () => {
    setVerifying(true)
    setError(null)
    try {
      const [orderId] = await Promise.all([confirmQrPayment(cart.id, payment.reference), new Promise((r) => setTimeout(r, CONFIRM_DELAY_MS))])
      clearCart()
      navigate(`/orders/${orderId}/confirmed`, { replace: true })
    } catch (e) {
      setVerifying(false)
      setError(e instanceof FetchError && e.message ? e.message : 'We could not verify your payment yet. Please try again in a moment.')
    }
  }

  if (verifying) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-white px-6 py-14 text-center shadow-card" aria-live="polite">
        <span className="mx-auto mb-5 block size-14 animate-spin rounded-full border-4 border-accent border-r-transparent" aria-hidden="true" />
        <h2 className="text-xl font-bold">Verifying your payment…</h2>
        <p className="mt-2 text-ink-soft">We are checking the transfer of {formatVND(payment.amount)}. Please do not close this page.</p>
      </div>
    )
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
      <section className="rounded-3xl bg-white p-5 text-center shadow-card sm:p-6" aria-label="QR code">
        <div className="relative mx-auto aspect-square w-full max-w-72 overflow-hidden rounded-2xl border border-line bg-white p-3">
          <img src={paymentQr} alt="QR code for the bank transfer" className={cx('size-full object-contain transition', expired && 'opacity-15 blur-sm')} />
          {expired && (
            <div className="absolute inset-0 grid place-items-center p-4">
              <div className="space-y-3">
                <p className="font-semibold">This QR code has expired</p>
                <Button size="sm" onClick={renew} loading={renewing}>
                  <RefreshIcon /> Get a new QR code
                </Button>
              </div>
            </div>
          )}
        </div>
        <p
          className={cx(
            'mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold',
            expired ? 'bg-danger-soft text-danger' : remaining < 120_000 ? 'bg-brand-soft text-brand-deep' : 'bg-accent-soft text-accent-dark',
          )}
          role="timer"
          aria-live="off"
        >
          <ClockIcon /> {expired ? 'Expired' : `Expires in ${formatRemaining(remaining)}`}
        </p>
        <p className="mt-3 text-sm text-ink-soft">Scan with your banking app or e-wallet.</p>
      </section>

      <section className="space-y-5 rounded-3xl bg-white p-5 shadow-card sm:p-6" aria-label="Transfer details">
        <FormError message={error} />
        <dl className="divide-y divide-line rounded-2xl border border-line">
          <div className="flex items-center justify-between gap-3 p-4">
            <div>
              <dt className="text-sm text-ink-soft">Amount</dt>
              <dd className="text-2xl font-bold text-brand-strong">{formatVND(payment.amount)}</dd>
            </div>
            <CopyButton label="Amount" onClick={() => copy(String(payment.amount), 'Amount')} />
          </div>
          <div className="flex items-center justify-between gap-3 p-4">
            <div>
              <dt className="text-sm text-ink-soft">Transfer note</dt>
              <dd className="font-mono text-lg font-bold tracking-wider">{payment.reference}</dd>
            </div>
            <CopyButton label="Transfer note" onClick={() => copy(payment.reference, 'Transfer note')} />
          </div>
        </dl>

        <ol className="space-y-2 text-sm">
          {[
            'Open your banking app and scan the QR code.',
            <>
              Check the amount and enter the transfer note <strong>{payment.reference}</strong> exactly.
            </>,
            'Confirm the transfer in your app, then tap the button below.',
          ].map((text, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-white">{i + 1}</span>
              <span className="pt-0.5">{text}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={confirm} disabled={expired}>
            I have completed the transfer
          </Button>
          <ButtonLink to="/checkout?step=payment" variant="outline" size="lg">
            Change payment method
          </ButtonLink>
        </div>
        <p className="flex items-start gap-2 text-xs text-ink-soft">
          <ShieldIcon className="mt-0.5 shrink-0 text-base text-success" />
          Your order is created as soon as we receive the payment. If the transfer does not arrive within 15 minutes, nothing is charged and your cart stays saved.
        </p>
      </section>
    </div>
  )
}

function CopyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent-soft" aria-label={`Copy ${label.toLowerCase()}`}>
      <CopyIcon /> Copy
    </button>
  )
}
