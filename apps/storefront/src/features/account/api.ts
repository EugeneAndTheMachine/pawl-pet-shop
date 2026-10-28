import type { HttpTypes } from '@medusajs/types'
import { sdk } from '../../lib/medusa'
import { normalizePhone } from '../../lib/phone'
import type { AddressValues, ProfileValues } from '../auth/schemas'

export async function updateProfile(values: ProfileValues): Promise<HttpTypes.StoreCustomer> {
  const { customer } = await sdk.store.customer.update({ ...values, phone: normalizePhone(values.phone) })
  return customer
}

/** Address form values -> Medusa address (full name kept in first_name, Vietnamese names are not split) */
export function toMedusaAddress(values: AddressValues): {
  first_name: string
  last_name: string
  phone: string
  province: string
  city: string
  address_1: string
  country_code: string
} {
  return {
    first_name: values.full_name,
    last_name: '',
    phone: normalizePhone(values.phone),
    province: values.province,
    city: values.city,
    address_1: values.address_1,
    country_code: 'vn',
  }
}

type AddressFieldsLike = { first_name?: string | null; last_name?: string | null; phone?: string | null; province?: string | null; city?: string | null; address_1?: string | null }

export function fromMedusaAddress(address: AddressFieldsLike | null | undefined): Partial<AddressValues> {
  if (!address) return {}
  return {
    full_name: [address.first_name, address.last_name].filter(Boolean).join(' '),
    phone: address.phone ?? '',
    province: (address.province ?? '') as AddressValues['province'],
    city: address.city ?? '',
    address_1: address.address_1 ?? '',
  }
}

export async function createAddress(values: AddressValues, isDefault: boolean): Promise<HttpTypes.StoreCustomer> {
  const { customer } = await sdk.store.customer.createAddress({ ...toMedusaAddress(values), is_default_shipping: isDefault, is_default_billing: isDefault })
  return customer
}

export async function updateAddress(id: string, values: AddressValues, isDefault: boolean): Promise<HttpTypes.StoreCustomer> {
  const { customer } = await sdk.store.customer.updateAddress(id, { ...toMedusaAddress(values), is_default_shipping: isDefault, is_default_billing: isDefault })
  return customer
}

export async function setDefaultAddress(id: string): Promise<HttpTypes.StoreCustomer> {
  const { customer } = await sdk.store.customer.updateAddress(id, { is_default_shipping: true, is_default_billing: true })
  return customer
}

export async function deleteAddress(id: string): Promise<void> {
  await sdk.store.customer.deleteAddress(id)
}
