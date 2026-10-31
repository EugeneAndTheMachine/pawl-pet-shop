import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { getOrdersListWorkflow } from "@medusajs/medusa/core-flows"
import type { FunctionDeclaration } from "@google/genai" with { "resolution-mode": "import" }
import { CatalogProduct, loadAvailability, loadCatalog } from "./catalog"
import { estimatePortion } from "./nutrition"
import { FREE_FROM, HEALTH_NEEDS, LIFE_STAGES, PRODUCT_TYPES, searchCatalog } from "./search"

// The functions Gemini may call. Each one is READ-ONLY and scoped on the server:
// - catalog tools only see published products of the storefront's sales channel;
// - order/cart tools only see the signed-in customer's own data. The customer id comes from the
//   session (req.auth_context), never from the model's arguments, so a prompt cannot reach other people's data.

export type ChatProductCard = {
  handle: string
  title: string
  brand: string | null
  thumbnail: string | null
  price_min: number | null
  price_max: number | null
  in_stock: boolean
}

export type ToolContext = {
  container: MedusaContainer
  salesChannelId?: string
  customerId?: string
  cartId?: string
  /** Products the tools returned during this turn, so the storefront can show them as cards */
  seenProducts: Map<string, ChatProductCard>
}

type ToolDefinition<S extends z.ZodType> = {
  name: string
  description: string
  schema: S
  run: (args: z.output<S>, ctx: ToolContext) => Promise<unknown>
}

function defineTool<S extends z.ZodType>(tool: ToolDefinition<S>) {
  return tool
}

const VN_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh",
})

async function describeProducts(products: CatalogProduct[], ctx: ToolContext, detailed: boolean) {
  const stock = await loadAvailability(
    ctx.container,
    products.flatMap((p) => p.variants),
    ctx.salesChannelId
  )

  return products.map((p) => {
    const variants = p.variants.map((v) => {
      const available = stock.get(v.id) ?? 0
      return {
        option: v.title,
        price_vnd: v.price,
        ...(v.original_price != null && v.price != null && v.original_price > v.price ? { original_price_vnd: v.original_price } : {}),
        in_stock: available > 0,
        ...(detailed && Number.isFinite(available) && available > 0 && available <= 10 ? { only_left: available } : {}),
      }
    })
    const prices = variants.map((v) => v.price_vnd).filter((n): n is number => n != null)
    const card: ChatProductCard = {
      handle: p.handle,
      title: p.title,
      brand: p.brand,
      thumbnail: p.thumbnail,
      price_min: prices.length ? Math.min(...prices) : null,
      price_max: prices.length ? Math.max(...prices) : null,
      in_stock: variants.some((v) => v.in_stock),
    }
    ctx.seenProducts.set(p.handle, card)

    return {
      handle: p.handle,
      link: `/products/${p.handle}`,
      title: p.title,
      brand: p.brand,
      tags: p.tags,
      categories: p.categories.map((c) => c.name),
      description: detailed ? p.description : p.description.slice(0, 180),
      variants,
      ...(detailed
        ? {
            ingredients: p.ingredients,
            kcal_per_kg: p.kcal_per_kg,
            feeding_guide: p.feeding_guide,
          }
        : {}),
    }
  })
}

const searchProducts = defineTool({
  name: "search_products",
  description:
    "Search Pawl's catalog. Use it before recommending or naming any product. Combine structured filters with English keywords " +
    "(the catalog is written in English, so translate the customer's words). Returns at most `limit` products with prices in VND and stock.",
  schema: z.object({
    query: z
      .string()
      .max(100)
      .optional()
      .describe("English keywords: brand, product name, flavour or feature, e.g. 'royal canin', 'salmon', 'clumping'. Leave empty to browse by filters."),
    species: z.enum(["cat", "dog"]).optional(),
    life_stage: z.enum(LIFE_STAGES).optional(),
    health_needs: z.array(z.enum(HEALTH_NEEDS)).max(3).optional().describe("All listed needs must match. 'sterilised' means for neutered pets."),
    free_from: z.array(z.enum(FREE_FROM)).max(4).optional().describe("Ingredients the product must NOT contain (allergies)."),
    product_type: z.enum(PRODUCT_TYPES).optional().describe("dry = kibble, wet = pate/pouches, treat = snacks"),
    max_price: z.number().int().positive().optional().describe("Maximum price in VND of the cheapest option"),
    sort: z.enum(["relevance", "price_asc", "price_desc", "newest"]).optional(),
    limit: z.number().int().min(1).max(8).optional(),
  }),
  async run(args, ctx) {
    const catalog = await loadCatalog(ctx.container)
    const { total, products } = searchCatalog(catalog, args, ctx.salesChannelId)
    return {
      total_matches: total,
      products: await describeProducts(products, ctx, false),
      ...(total === 0 ? { hint: "No match. Retry with fewer filters or other English keywords before telling the customer." } : {}),
    }
  },
})

const getProductDetails = defineTool({
  name: "get_product_details",
  description: "Full details of one product: description, ingredients, kcal per kg, feeding guide, every option with price and stock.",
  schema: z.object({
    handle: z.string().min(1).max(120).describe("Product handle from search_products"),
  }),
  async run({ handle }, ctx) {
    const catalog = await loadCatalog(ctx.container)
    const product = catalog.find(
      (p) => p.handle === handle && (!ctx.salesChannelId || p.sales_channel_ids.includes(ctx.salesChannelId))
    )
    if (!product) return { error: "not_found", message: `No published product with handle '${handle}'.` }
    const [details] = await describeProducts([product], ctx, true)
    return details
  },
})

const listCategories = defineTool({
  name: "list_categories",
  description: "The store's product categories with their page links.",
  schema: z.object({}),
  async run(_args, ctx) {
    const catalog = await loadCatalog(ctx.container)
    const counts = new Map<string, { name: string; count: number }>()
    for (const p of catalog) {
      if (ctx.salesChannelId && !p.sales_channel_ids.includes(ctx.salesChannelId)) continue
      for (const c of p.categories) {
        const entry = counts.get(c.handle) ?? { name: c.name, count: 0 }
        entry.count += 1
        counts.set(c.handle, entry)
      }
    }
    return {
      pets: [
        { name: "Cats", link: "/c/cat" },
        { name: "Dogs", link: "/c/dog" },
      ],
      categories: [...counts].map(([handle, { name, count }]) => ({
        pet: handle.startsWith("dog") ? "dog" : "cat",
        name,
        link: `/c/${handle}`,
        products: count,
      })),
    }
  },
})

const estimateDailyPortion = defineTool({
  name: "estimate_daily_portion",
  description:
    "Calculates a pet's daily calories (RER × factor) and, with a product handle, grams per day and how many days each pack lasts. " +
    "Use it for every 'how much should my pet eat' or 'how long will this bag last' question instead of guessing.",
  schema: z.object({
    species: z.enum(["cat", "dog"]),
    weight_kg: z.number().min(0.3).max(90),
    life_stage: z.enum(LIFE_STAGES),
    neutered: z.boolean().optional(),
    activity: z.enum(["low", "normal", "high"]).optional(),
    goal: z.enum(["maintain", "lose_weight", "gain_weight"]).optional(),
    product_handle: z.string().max(120).optional().describe("Food to portion; its kcal_per_kg is read from the catalog"),
  }),
  async run({ product_handle, ...pet }, ctx) {
    if (!product_handle) {
      return { ...estimatePortion(pet), note: "Give a product handle to convert calories into grams." }
    }
    const catalog = await loadCatalog(ctx.container)
    const product = catalog.find((p) => p.handle === product_handle)
    if (!product) return { error: "not_found", message: `No product with handle '${product_handle}'.` }
    if (!product.kcal_per_kg) {
      return { ...estimatePortion(pet), note: `${product.title} has no kcal_per_kg; use its feeding guide.`, feeding_guide: product.feeding_guide }
    }
    return {
      product: product.title,
      kcal_per_kg: product.kcal_per_kg,
      ...estimatePortion(pet, { kcal_per_kg: product.kcal_per_kg, packs: product.variants.map((v) => v.title) }),
      note: "Estimate only. Adjust by body condition and follow the vet's advice for pets with health issues.",
    }
  },
})

type OrderRow = {
  id: string
  display_id: number
  created_at: string | Date
  status: string
  payment_status?: string
  fulfillment_status?: string
  total?: unknown
  items?: ({ product_title: string | null; title: string; variant_title: string | null; quantity: unknown } | null)[] | null
  shipping_methods?: ({ name: string } | null)[] | null
  payment_collections?: ({ payment_sessions?: ({ provider_id: string } | null)[] | null } | null)[] | null
}

const PAYMENT_METHOD: Record<string, string> = {
  pp_system_default: "Cash on delivery",
  pp_qr_qr: "Bank transfer (QR)",
}

const getMyOrders = defineTool({
  name: "get_my_orders",
  description:
    "The signed-in customer's own orders, newest first, with payment and delivery status. " +
    "Returns not_signed_in for guests; then ask them to sign in at /login. Never ask for an email or phone number to look up orders.",
  schema: z.object({
    order_number: z.number().int().positive().optional().describe("The order number shown as #123, without '#'"),
    limit: z.number().int().min(1).max(10).optional(),
  }),
  async run({ order_number, limit }, ctx) {
    if (!ctx.customerId) return { error: "not_signed_in", message: "The customer must sign in at /login to see their orders." }

    const { result } = await getOrdersListWorkflow(ctx.container).run({
      input: {
        fields: [
          "id",
          "display_id",
          "created_at",
          "status",
          "payment_status",
          "fulfillment_status",
          "total",
          "items.title",
          "items.product_title",
          "items.variant_title",
          "items.quantity",
          "shipping_methods.name",
          "payment_collections.payment_sessions.provider_id",
        ],
        variables: {
          filters: {
            customer_id: ctx.customerId,
            is_draft_order: false,
            ...(order_number ? { display_id: order_number } : {}),
          },
          skip: 0,
          take: limit ?? 5,
          order: { created_at: "DESC" },
        },
      },
    })

    // With pagination the workflow returns { rows, metadata }; OrderDTO lacks the computed status fields, hence OrderRow
    const rows = (Array.isArray(result) ? result : result.rows) as unknown as OrderRow[]
    if (!rows.length) {
      return order_number ? { error: "not_found", message: `No order #${order_number} in this account.` } : { orders: [] }
    }
    return {
      orders: rows.map((o) => {
        const provider = o.payment_collections?.[0]?.payment_sessions?.[0]?.provider_id
        return {
          order_number: o.display_id,
          link: `/account/orders/${o.id}`,
          placed_at: VN_TIME.format(new Date(o.created_at)),
          status: o.status,
          payment_status: o.payment_status,
          delivery_status: o.fulfillment_status,
          payment_method: provider ? (PAYMENT_METHOD[provider] ?? provider) : null,
          shipping: o.shipping_methods?.[0]?.name ?? null,
          total_vnd: Number(o.total ?? 0),
          items: (o.items ?? []).flatMap((i) =>
            i ? [`${i.product_title ?? i.title}${i.variant_title ? ` (${i.variant_title})` : ""} × ${Number(i.quantity)}`] : []
          ),
        }
      }),
    }
  },
})

type CartRow = {
  id: string
  completed_at: string | Date | null
  customer_id: string | null
  total?: unknown
  subtotal?: unknown
  discount_total?: unknown
  items?: ({ product_title: string | null; title: string; variant_title: string | null; product_handle: string | null; quantity: unknown; unit_price: unknown } | null)[] | null
  promotions?: ({ code: string | null } | null)[] | null
}

const getMyCart = defineTool({
  name: "get_my_cart",
  description: "What is in the customer's shopping cart right now, to answer questions about it or suggest products that go well with it.",
  schema: z.object({}),
  async run(_args, ctx) {
    if (!ctx.cartId) return { items: [], message: "The cart is empty." }
    const query = ctx.container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "completed_at",
        "customer_id",
        "total",
        "subtotal",
        "discount_total",
        "items.title",
        "items.product_title",
        "items.variant_title",
        "items.product_handle",
        "items.quantity",
        "items.unit_price",
        "promotions.code",
      ],
      filters: { id: ctx.cartId },
    })
    const cart = data[0] as CartRow | undefined
    // A cart that belongs to another customer is treated as missing
    if (!cart || cart.completed_at || (cart.customer_id && cart.customer_id !== ctx.customerId)) {
      return { items: [], message: "The cart is empty." }
    }
    return {
      items: (cart.items ?? []).flatMap((i) =>
        i
          ? [
              {
                product: i.product_title ?? i.title,
                option: i.variant_title,
                link: i.product_handle ? `/products/${i.product_handle}` : null,
                quantity: Number(i.quantity),
                unit_price_vnd: Number(i.unit_price),
              },
            ]
          : []
      ),
      promo_codes: (cart.promotions ?? []).flatMap((p) => (p?.code ? [p.code] : [])),
      discount_vnd: Number(cart.discount_total ?? 0),
      total_vnd_before_shipping: Number(cart.total ?? 0),
    }
  },
})

export const TOOLS = [searchProducts, getProductDetails, listCategories, estimateDailyPortion, getMyOrders, getMyCart]

export function functionDeclarations(): FunctionDeclaration[] {
  return TOOLS.map((tool) => {
    const { $schema: _ignored, ...schema } = z.toJSONSchema(tool.schema, { io: "input" }) as Record<string, unknown>
    return { name: tool.name, description: tool.description, parametersJsonSchema: schema }
  })
}

/** Validates the model's arguments and runs the tool; errors are returned to the model as data */
export async function runTool(name: string, args: unknown, ctx: ToolContext): Promise<Record<string, unknown>> {
  const tool = TOOLS.find((t) => t.name === name)
  if (!tool) return { error: "unknown_tool", message: `There is no tool named ${name}.` }

  const parsed = tool.schema.safeParse(args ?? {})
  if (!parsed.success) {
    return { error: "invalid_arguments", issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) }
  }
  // Each tool's run accepts its own schema's output; the union of tools loses that link for TypeScript.
  const run = tool.run as (args: unknown, ctx: ToolContext) => Promise<unknown>
  const output = await run(parsed.data, ctx)
  return { result: output }
}
