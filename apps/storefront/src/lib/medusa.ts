import Medusa from '@medusajs/js-sdk'

export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_MEDUSA_URL ?? 'http://localhost:9000',
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY,
  debug: import.meta.env.DEV,
  auth: { type: 'session' },
})
