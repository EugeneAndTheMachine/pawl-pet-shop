import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

// Supabase requires SSL even in development, so this follows DB_SSL instead of NODE_ENV.
// Per Medusa docs, DATABASE_URL must end with `?ssl_mode=disable` when rejectUnauthorized is false,
// so the URL parameter does not override this driver config (the connection is still encrypted).
const databaseDriverOptions =
  process.env.DB_SSL === "true"
    ? { connection: { ssl: { rejectUnauthorized: false } } }
    : {}

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
