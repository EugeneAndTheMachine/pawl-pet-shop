import Medusa from '@medusajs/js-sdk'

export const sdk = new Medusa({
  // Empty in production: Vercel proxies /store and /auth to the backend (vercel.json), so the API is on the
  // storefront's own origin and the session cookie stays first-party.
  baseUrl: import.meta.env.VITE_MEDUSA_URL || window.location.origin,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY,
  debug: import.meta.env.DEV,
  auth: { type: 'session' },
})
