import { useState, type FormEvent } from 'react'
import { CloseIcon } from '../../../components/ui/icons'
import { applyPromoCode, removePromoCode } from '../api'
import { useCart } from '../use-cart'

export function PromoCodeForm() {
  const { cart, setCart } = useCart()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  if (!cart) return null

  const codes = (cart.promotions ?? []).map((p) => p.code).filter((c): c is string => Boolean(c))

  const apply = async (event: FormEvent) => {
    event.preventDefault()
    const value = code.trim().toUpperCase()
    if (!value) return
    setPending(true)
    setError(null)
    try {
      const updated = await applyPromoCode(cart.id, value)
      // Medusa ignores unknown codes instead of failing, so check the result
      if (!(updated.promotions ?? []).some((p) => p.code?.toUpperCase() === value)) {
        setError('This code is not valid or has expired.')
      } else {
        setCode('')
      }
      setCart(updated)
    } catch {
      setError('This code is not valid or has expired.')
    } finally {
      setPending(false)
    }
  }

  const remove = async (value: string) => {
    setPending(true)
    try {
      setCart(await removePromoCode(cart.id, value))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={apply} className="flex gap-2">
        <label htmlFor="promo-code" className="sr-only">
          Discount code
        </label>
        <input
          id="promo-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Discount code"
          className="h-10 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm uppercase placeholder:normal-case"
          autoComplete="off"
        />
        <button type="submit" disabled={pending || !code.trim()} className="h-10 rounded-full bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50">
          Apply
        </button>
      </form>
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      {codes.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {codes.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => remove(c)}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-full bg-success-soft py-1 pl-3 pr-2 text-sm font-semibold text-success"
                aria-label={`Remove code ${c}`}
              >
                {c} <CloseIcon className="text-xs" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
