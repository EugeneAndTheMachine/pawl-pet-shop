import type { HttpTypes } from '@medusajs/types'
import { FetchError } from '@medusajs/js-sdk'
import { sdk } from '../../lib/medusa'
import { normalizePhone } from '../../lib/phone'

const CUSTOMER_FIELDS = '*addresses'

/** The signed-in customer, or null for guests */
export async function getCustomer(): Promise<HttpTypes.StoreCustomer | null> {
  try {
    const { customer } = await sdk.store.customer.retrieve({ fields: CUSTOMER_FIELDS })
    return customer
  } catch (error) {
    if (error instanceof FetchError && (error.status === 401 || error.status === 403)) return null
    throw error
  }
}

export async function login(email: string, password: string): Promise<void> {
  const result = await sdk.auth.login('customer', 'emailpass', { email, password })
  if (typeof result !== 'string') throw new Error('Unsupported login flow')
}

export async function logout(): Promise<void> {
  await sdk.auth.logout()
}

export type RegisterInput = { email: string; password: string; first_name: string; last_name: string; phone: string }

/** Medusa customer registration: auth identity -> customer record (with the registration token) -> session */
export async function register(input: RegisterInput): Promise<void> {
  const token = await sdk.auth.register('customer', 'emailpass', { email: input.email, password: input.password })
  try {
    await sdk.store.customer.create(
      {
        email: input.email,
        first_name: input.first_name,
        last_name: input.last_name,
        phone: normalizePhone(input.phone),
        // Proof of consent under the Personal Data Protection Law (91/2025/QH15)
        metadata: { data_consent_at: new Date().toISOString() },
      },
      {},
      { Authorization: `Bearer ${token}` },
    )
  } finally {
    // register() also stores the one-time token in localStorage; sessions do not need it
    await sdk.client.clearToken()
  }
  await login(input.email, input.password)
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sdk.auth.resetPassword('customer', 'emailpass', { identifier: email })
}

export async function resetPassword(token: string, email: string, password: string): Promise<void> {
  await sdk.auth.updateProvider('customer', 'emailpass', { email, password }, token)
}

/** Only same-site paths, so ?redirect= cannot send people to another website */
export function safeRedirect(value: string | null, fallback = '/account'): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback
}

export function isAuthError(error: unknown): boolean {
  return error instanceof FetchError && (error.status === 401 || error.status === 400)
}

export function isDuplicateIdentity(error: unknown): boolean {
  return error instanceof FetchError && /already exists/i.test(error.message)
}
