type AddressLike = {
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  city?: string | null
  province?: string | null
  phone?: string | null
}

/** Recipient name plus display lines: street, ward + province, phone */
export function formatAddress(address: AddressLike | null | undefined) {
  if (!address) return { name: '', lines: [] as string[] }
  return {
    name: [address.first_name, address.last_name].filter(Boolean).join(' '),
    lines: [address.address_1, [address.city, address.province].filter(Boolean).join(', '), address.phone].filter((l): l is string => Boolean(l)),
  }
}
