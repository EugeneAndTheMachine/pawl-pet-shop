import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import QrPaymentProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [QrPaymentProviderService],
})
