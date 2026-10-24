import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

// Store setup for Vietnam: npx medusa exec ./src/scripts/seed.ts
// Idempotent: the team shares one database, so every step looks up what exists before creating it.

const STORE_NAME = "Pawl"
const REGION_NAME = "Việt Nam"
const STOCK_LOCATION_NAME = "Kho TP.HCM"
const FULFILLMENT_SET_NAME = "Kho TP.HCM – Giao hàng"
const SERVICE_ZONE_NAME = "Toàn quốc"
const API_KEY_TITLE = "Pawl Storefront"
const MANUAL_FULFILLMENT_PROVIDER = "manual_manual"
const COD_PAYMENT_PROVIDER = "pp_system_default"
// Added to the region automatically once the VNPay provider (M3) is registered
const VNPAY_PAYMENT_PROVIDER = "pp_vnpay_vnpay"

const SHIPPING_OPTIONS = [
  { name: "Giao tiêu chuẩn (2–4 ngày)", code: "standard", amount: 30000, description: "Giao trong 2–4 ngày làm việc." },
  { name: "Giao nhanh (trong ngày, nội thành)", code: "express", amount: 45000, description: "Giao trong ngày cho đơn nội thành." },
]

export default async function seed({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const storeModule = container.resolve(Modules.STORE)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const regionModule = container.resolve(Modules.REGION)
  const taxModule = container.resolve(Modules.TAX)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const paymentModule = container.resolve(Modules.PAYMENT)
  const apiKeyModule = container.resolve(Modules.API_KEY)

  const [store] = await storeModule.listStores()

  // Sales channel
  let salesChannel = store.default_sales_channel_id
    ? (await salesChannelModule.listSalesChannels({ id: store.default_sales_channel_id }))[0]
    : undefined
  if (!salesChannel) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: "Default Sales Channel" }] },
    })
    salesChannel = result[0]
    logger.info(`Created sales channel "${salesChannel.name}"`)
  }

  // Store: VND only, prices include VAT
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: STORE_NAME,
        supported_currencies: [{ currency_code: "vnd", is_default: true, is_tax_inclusive: true }],
        default_sales_channel_id: salesChannel.id,
      },
    },
  })
  logger.info("Store: VND, tax-inclusive prices")

  // Region
  const paymentProviders = (await paymentModule.listPaymentProviders({ is_enabled: true })).map((p) => p.id)
  const regionProviders = [COD_PAYMENT_PROVIDER, VNPAY_PAYMENT_PROVIDER].filter((id) => paymentProviders.includes(id))

  let region = (await regionModule.listRegions({ currency_code: "vnd" }))[0]
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: REGION_NAME,
            currency_code: "vnd",
            countries: ["vn"],
            payment_providers: regionProviders,
            is_tax_inclusive: true,
          },
        ],
      },
    })
    region = result[0]
    logger.info(`Created region "${REGION_NAME}"`)
  } else {
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: { payment_providers: regionProviders, is_tax_inclusive: true },
      },
    })
  }
  logger.info(`Region payment providers: ${regionProviders.join(", ")}`)

  // Tax region. VAT 10% is a demo simplification; prices already include it, so totals do not change.
  const taxRegions = await taxModule.listTaxRegions({ country_code: "vn" })
  if (!taxRegions.length) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: "vn",
          provider_id: "tp_system",
          default_tax_rate: { name: "VAT", code: "VAT10", rate: 10 },
        },
      ],
    })
    logger.info("Created tax region VN (VAT 10%)")
  }

  // Stock location
  let stockLocation = (await stockLocationModule.listStockLocations({ name: STOCK_LOCATION_NAME }))[0]
  if (!stockLocation) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: STOCK_LOCATION_NAME,
            address: {
              address_1: "123 Nguyễn Văn Linh (địa chỉ demo)",
              city: "Phường Tân Thuận",
              province: "TP. Hồ Chí Minh",
              country_code: "VN",
            },
          },
        ],
      },
    })
    stockLocation = result[0]
    logger.info(`Created stock location "${STOCK_LOCATION_NAME}"`)
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_region_id: region.id, default_location_id: stockLocation.id },
    },
  })

  const {
    data: [locationLinks],
  } = await query.graph({
    entity: "stock_location",
    fields: ["id", "fulfillment_providers.id", "fulfillment_sets.id", "sales_channels.id"],
    filters: { id: stockLocation.id },
  })

  if (!locationLinks.fulfillment_providers?.some((p) => p?.id === MANUAL_FULFILLMENT_PROVIDER)) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: MANUAL_FULFILLMENT_PROVIDER },
    })
  }

  // Shipping profile
  let shippingProfile = (await fulfillmentModule.listShippingProfiles({ type: "default" }))[0]
  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: { data: [{ name: "Default Shipping Profile", type: "default" }] },
    })
    shippingProfile = result[0]
  }

  // Fulfillment set + service zone covering Vietnam
  let fulfillmentSet = (
    await fulfillmentModule.listFulfillmentSets({ name: FULFILLMENT_SET_NAME }, { relations: ["service_zones"] })
  )[0]
  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModule.createFulfillmentSets({
      name: FULFILLMENT_SET_NAME,
      type: "shipping",
      service_zones: [{ name: SERVICE_ZONE_NAME, geo_zones: [{ country_code: "vn", type: "country" }] }],
    })
    logger.info(`Created fulfillment set "${FULFILLMENT_SET_NAME}"`)
  }

  if (!locationLinks.fulfillment_sets?.some((s) => s?.id === fulfillmentSet.id)) {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })
  }

  // Shipping options with flat prices
  const serviceZone = fulfillmentSet.service_zones[0]
  const existingOptions = await fulfillmentModule.listShippingOptions({ service_zone: { id: serviceZone.id } })
  const missingOptions = SHIPPING_OPTIONS.filter((o) => !existingOptions.some((e) => e.name === o.name))

  if (missingOptions.length) {
    await createShippingOptionsWorkflow(container).run({
      input: missingOptions.map((o) => ({
        name: o.name,
        price_type: "flat",
        provider_id: MANUAL_FULFILLMENT_PROVIDER,
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: { label: o.name, description: o.description, code: o.code },
        prices: [
          { currency_code: "vnd", amount: o.amount },
          { region_id: region.id, amount: o.amount },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      })),
    })
    logger.info(`Created shipping options: ${missingOptions.map((o) => o.name).join(", ")}`)
  }

  if (!locationLinks.sales_channels?.some((c) => c?.id === salesChannel.id)) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocation.id, add: [salesChannel.id] },
    })
  }

  // Publishable API key: reuse an existing one so the storefront .env stays valid
  let apiKey = (await apiKeyModule.listApiKeys({ type: "publishable" })).find((k) => !k.revoked_at)
  if (!apiKey) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: { api_keys: [{ title: API_KEY_TITLE, type: "publishable", created_by: "" }] },
    })
    apiKey = result[0]
    logger.info(`Created publishable API key "${API_KEY_TITLE}"`)
  }

  const {
    data: [keyLinks],
  } = await query.graph({
    entity: "api_key",
    fields: ["id", "sales_channels.id"],
    filters: { id: apiKey.id },
  })
  if (!keyLinks.sales_channels?.some((c) => c?.id === salesChannel.id)) {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: apiKey.id, add: [salesChannel.id] },
    })
  }

  logger.info("Seed finished.")
  logger.info(`Put this in apps/storefront/.env -> VITE_MEDUSA_PUBLISHABLE_KEY=${apiKey.token}`)
}
