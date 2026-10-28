import { loadEnv, defineConfig, MedusaError } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

// Medusa already refuses to start in production without these secrets; also refuse the .env.example placeholders.
if (process.env.NODE_ENV === "production") {
  for (const key of ["JWT_SECRET", "COOKIE_SECRET"]) {
    const value = process.env[key] ?? ""
    if (value.length < 32 || ["change-me", "supersecret"].includes(value)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `${key} must be a random string of at least 32 characters in production`)
    }
  }
}

// Every query is a round trip to Supabase and opening a TLS connection through the pooler costs ~1 s,
// so extra connections stay open for 10 minutes instead of 30 s after a burst of requests.
// The Free plan's Session pooler allows only 15 clients for the whole project (shared by the team),
// so each backend uses at most 5 instead of knex's default 10.
const pool = {
  min: Number(process.env.DB_POOL_MIN ?? 2),
  max: Number(process.env.DB_POOL_MAX ?? 5),
  idleTimeoutMillis: 10 * 60_000,
}

// Supabase requires SSL even in development, so this follows DB_SSL instead of NODE_ENV.
// Per Medusa docs, DATABASE_URL must end with `?ssl_mode=disable` when rejectUnauthorized is false,
// so the URL parameter does not override this driver config (the connection is still encrypted).
const databaseDriverOptions =
  process.env.DB_SSL === "true"
    ? { connection: { ssl: { rejectUnauthorized: false } }, pool }
    : { pool }

// The File Module accepts exactly one provider: Supabase Storage (S3 API) when keys exist, local disk otherwise.
const fileProvider = process.env.S3_ACCESS_KEY_ID
  ? {
      resolve: "@medusajs/medusa/file-s3",
      id: "s3",
      options: {
        file_url: process.env.S3_FILE_URL,
        access_key_id: process.env.S3_ACCESS_KEY_ID,
        secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION,
        bucket: process.env.S3_BUCKET,
        endpoint: process.env.S3_ENDPOINT,
        // Required for Supabase Storage
        additional_client_config: { forcePathStyle: true },
      },
    }
  : { resolve: "@medusajs/medusa/file-local", id: "local" }

// Online payment is SIMULATED: a bank transfer by QR code confirmed by the storefront (no real gateway).
// Provider id: pp_qr_qr. COD (pp_system_default) is built in.
const paymentProviders = [
  {
    resolve: "./src/modules/qr-payment",
    id: "qr",
    options: { expiryMinutes: 15 },
  },
]

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions,
    // Phase 1 has no Redis: leaving redisUrl undefined makes Medusa use in-memory session storage.
    ...(process.env.REDIS_URL ? { redisUrl: process.env.REDIS_URL } : {}),
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    // Caching Module (behind MEDUSA_FF_CACHING=true): caches Store API product queries, regions, variant prices,
    // shipping options… Changes made through this backend (Admin) clear the matching entries via events.
    // The cache lives in this process, so changes made elsewhere (a teammate's backend on the shared database,
    // seed scripts) only show up after the TTL. Stock levels are never cached.
    // Use @medusajs/caching-redis instead when running several backend instances.
    ...(process.env.MEDUSA_FF_CACHING === "true"
      ? [
          {
            resolve: "@medusajs/medusa/caching",
            options: {
              ttl: Number(process.env.CACHE_TTL_SECONDS ?? 300),
              in_memory: { enable: true },
            },
          },
        ]
      : []),
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [fileProvider],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: paymentProviders,
      },
    },
    {
      // Emails (order confirmation, password reset) are printed to the console in Phase 1
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: { channels: ["email"] },
          },
        ],
      },
    },
  ],
})
