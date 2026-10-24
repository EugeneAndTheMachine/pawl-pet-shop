import { loadEnv } from "@medusajs/framework/utils"
import pg from "pg"

// Verifies the Supabase connection before any migration: node ./src/scripts/check-db.mjs
// Runs without booting Medusa, whose modules need their tables to exist on startup.

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const HINTS = {
  ENOTFOUND: "Host not found. Use the Session pooler host, not db.<ref>.supabase.co (IPv6 only).",
  ENOENT: "Host not found. Use the Session pooler host, not db.<ref>.supabase.co (IPv6 only).",
  ENETUNREACH: "Network unreachable. Use the Session pooler, not Direct connection (IPv6 only).",
  ETIMEDOUT: "Connection timed out. Check the host and port 5432, or restore a paused project.",
  "28P01": "Wrong password. Special characters must be percent-encoded (@ -> %40).",
  XX000: "Tenant or user not found. Check the pooler host region and the postgres.<ref> username.",
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is not set in apps/backend/.env")
  process.exit(1)
}

// Same SSL rule as medusa-config.ts
const client = new pg.Client({
  connectionString: url,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 15_000,
})

try {
  const { hostname, port, username } = new URL(url)
  console.log(`Connecting to ${hostname}:${port} as ${username}...`)

  await client.connect()
  const { rows } = await client.query(`
    select version(), current_database(), now(),
      (select count(*)::int from information_schema.tables where table_schema = 'public') as public_tables
  `)
  const row = rows[0]

  console.log(`Postgres version: ${row.version}`)
  console.log(`Database: ${row.current_database}`)
  console.log(`Server time: ${new Date(row.now).toISOString()}`)
  console.log(`TLS: ${client.connection.stream.encrypted ? "yes" : "no"}`)
  console.log(`Tables in public schema: ${row.public_tables}${row.public_tables ? "" : " (run npx medusa db:migrate)"}`)
} catch (error) {
  console.error(`Connection failed [${error.code ?? "unknown"}]: ${error.message}`)
  if (HINTS[error.code]) {
    console.error(`Hint: ${HINTS[error.code]}`)
  }
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}
