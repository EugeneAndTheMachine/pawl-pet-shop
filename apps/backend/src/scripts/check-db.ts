import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type CheckRow = { version: string; current_database: string; now: Date }

// Verifies the Supabase connection: npx medusa exec ./src/scripts/check-db.ts
export default async function checkDb({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const result = await pg.raw("select version(), current_database(), now()")
  const row = (result.rows as CheckRow[])[0]

  logger.info(`Postgres version: ${row.version}`)
  logger.info(`Database: ${row.current_database}`)
  logger.info(`Server time: ${new Date(row.now).toISOString()}`)
}
