import type { HttpTypes } from '@medusajs/types'
import { useState } from 'react'
import { useToast } from '../../components/ui/use-toast'
import { useCart } from '../cart/use-cart'

/** "Buy again": adds every item of a past order to the cart at today's prices */
export function useBuyAgain() {
  const { addItems } = useCart()
  const { showToast } = useToast()
  const [pending, setPending] = useState(false)

  const buyAgain = async (order: HttpTypes.StoreOrder) => {
    // Variants removed from the catalog since the order cannot be bought again
    const lines = (order.items ?? []).filter((item) => item.variant_id && item.variant).map((item) => ({ variantId: item.variant_id!, quantity: item.quantity }))
    if (lines.length === 0) {
      showToast('These products are no longer available.', 'error')
      return
    }
    setPending(true)
    await addItems(lines)
    setPending(false)
  }

  return { buyAgain, pending }
}
