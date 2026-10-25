import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

type PasswordResetData = { entity_id: string; token: string; actor_type: string }

// Sends the reset link from POST /auth/{actor}/emailpass/reset-password (printed to the console in Phase 1)
export default async function passwordResetHandler({ event: { data }, container }: SubscriberArgs<PasswordResetData>) {
  const notificationModule = container.resolve(Modules.NOTIFICATION)
  const base = data.actor_type === "customer" ? process.env.STOREFRONT_URL ?? "http://localhost:5173" : `${process.env.BACKEND_URL ?? "http://localhost:9000"}/app`
  const url = `${base}/reset-password?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(data.entity_id)}`

  await notificationModule.createNotifications({
    to: data.entity_id,
    channel: "email",
    template: "password-reset",
    data: { subject: "Reset your Pawl password", reset_url: url },
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
