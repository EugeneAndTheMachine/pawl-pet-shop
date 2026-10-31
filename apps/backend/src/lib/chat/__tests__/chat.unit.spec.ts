import type { MedusaContainer } from "@medusajs/framework/types"
import { ChatRequestSchema } from "../../../api/middlewares"
import { cardsForReply, ChatModel, ModelRequest, ModelTurn, runChatTurn } from "../agent"
import { CatalogProduct, normalize, toCatalogProduct } from "../catalog"
import { estimatePortion, packGrams } from "../nutrition"
import { RateLimiter } from "../rate-limit"
import { searchCatalog } from "../search"
import { ChatProductCard, functionDeclarations, runTool, ToolContext } from "../tools"

function product(handle: string, tags: string[], price: number, extra: Partial<{ title: string; description: string }> = {}): CatalogProduct {
  return toCatalogProduct({
    id: `prod_${handle}`,
    handle,
    title: extra.title ?? handle.replace(/-/g, " "),
    description: extra.description ?? "",
    thumbnail: null,
    created_at: "2026-10-01T00:00:00Z",
    metadata: { brand: "Brand" },
    tags: tags.map((value) => ({ value })),
    categories: [{ handle: tags.includes("species:dog") ? "dog-dry-food" : "cat-dry-food", name: "Dry Food" }],
    sales_channels: [{ id: "sc_1" }],
    variants: [{ id: `var_${handle}`, title: "400g", sku: null, manage_inventory: true, allow_backorder: false, calculated_price: { calculated_amount: price } }],
  })
}

const CATALOG = [
  product("urinary-cat", ["species:cat", "life:adult", "health:urinary", "form:dry"], 300000, { title: "Urinary Care Cat Food" }),
  product("kitten-food", ["species:cat", "life:kitten", "form:dry"], 150000, { title: "Kitten Salmon Kibble" }),
  product("cat-treat", ["species:cat", "life:all", "free:grain", "form:treat"], 50000, { title: "Tuna Lickable Treat" }),
  product("dog-food", ["species:dog", "life:adult", "form:dry"], 200000, { title: "Adult Dog Lamb Kibble" }),
]

describe("nutrition", () => {
  it("computes RER, DER and grams per day for a neutered 4 kg cat", () => {
    const result = estimatePortion({ species: "cat", weight_kg: 4, life_stage: "adult", neutered: true }, { kcal_per_kg: 3720, packs: ["400g", "2kg", "Box of 12"] })
    expect(result.resting_energy_kcal).toBe(198) // 70 × 4^0.75 = 197.99
    expect(result.factor).toBe(1.2)
    expect(result.daily_energy_kcal).toBe(238)
    expect(result.grams_per_day).toBe(64)
    expect(result.packs).toEqual([
      { label: "400g", grams: 400, lasts_days: 6 },
      { label: "2kg", grams: 2000, lasts_days: 31 },
    ])
  })

  it("uses a lower factor for weight loss", () => {
    expect(estimatePortion({ species: "cat", weight_kg: 6, life_stage: "adult", goal: "lose_weight" }).factor).toBe(0.8)
  })

  it("reads pack sizes", () => {
    expect(packGrams("1.5kg")).toBe(1500)
    expect(packGrams("4 tubes x 14g")).toBe(56)
    expect(packGrams("1 pouch (85g)")).toBe(85)
    expect(packGrams("Box of 12")).toBeNull()
  })
})

describe("catalog search", () => {
  it("normalises Vietnamese text", () => {
    expect(normalize("Hạt cho Mèo ĐỰC")).toBe("hat cho meo duc")
  })

  it("applies tag filters together", () => {
    const { products } = searchCatalog(CATALOG, { species: "cat", health_needs: ["urinary"] })
    expect(products.map((p) => p.handle)).toEqual(["urinary-cat"])
  })

  it("treats life:all as suitable for every life stage", () => {
    const { products } = searchCatalog(CATALOG, { species: "cat", life_stage: "kitten" })
    expect(products.map((p) => p.handle).sort()).toEqual(["cat-treat", "kitten-food"])
  })

  it("ranks keyword matches and drops products without any", () => {
    const { products } = searchCatalog(CATALOG, { query: "salmon kibble" })
    expect(products[0].handle).toBe("kitten-food")
    expect(products.map((p) => p.handle)).not.toContain("cat-treat")
  })

  it("filters by price and sorts", () => {
    const { products } = searchCatalog(CATALOG, { max_price: 200000, sort: "price_asc" })
    expect(products.map((p) => p.handle)).toEqual(["cat-treat", "kitten-food", "dog-food"])
  })

  it("only returns products of the storefront's sales channel", () => {
    expect(searchCatalog(CATALOG, {}, "sc_other").total).toBe(0)
  })
})

describe("tools", () => {
  const ctx: ToolContext = { container: {} as MedusaContainer, seenProducts: new Map() }

  it("declares a JSON schema for every tool", () => {
    const declarations = functionDeclarations()
    expect(declarations.map((d) => d.name)).toEqual([
      "search_products",
      "get_product_details",
      "list_categories",
      "estimate_daily_portion",
      "get_my_orders",
      "get_my_cart",
    ])
    for (const d of declarations) {
      expect(d.parametersJsonSchema).toMatchObject({ type: "object" })
      expect(d.parametersJsonSchema).not.toHaveProperty("$schema")
    }
  })

  it("rejects invalid arguments without running the tool", async () => {
    const result = await runTool("estimate_daily_portion", { species: "horse", weight_kg: 4, life_stage: "adult" }, ctx)
    expect(result.error).toBe("invalid_arguments")
  })

  it("never shows orders to a guest", async () => {
    const result = await runTool("get_my_orders", {}, ctx)
    expect(result).toEqual({ result: { error: "not_signed_in", message: expect.any(String) } })
  })

  it("reports unknown tools", async () => {
    expect((await runTool("drop_tables", {}, ctx)).error).toBe("unknown_tool")
  })
})

describe("chat turn", () => {
  function scriptedModel(turns: Partial<ModelTurn>[]): ChatModel & { requests: ModelRequest[] } {
    const requests: ModelRequest[] = []
    return {
      requests,
      async generate(request) {
        requests.push({ ...request, contents: [...request.contents] })
        const next = turns.shift() ?? { text: "done" }
        return { text: "", functionCalls: [], tokens: 10, blocked: false, ...next }
      },
    }
  }

  const base = { system: "sys", tools: functionDeclarations(), maxToolRounds: 2 }

  it("runs the requested tool, sends the result back and returns the answer", async () => {
    const signedContent = {
      role: "model",
      parts: [{ functionCall: { id: "c1", name: "estimate_daily_portion", args: { species: "cat", weight_kg: 4, life_stage: "adult" } }, thoughtSignature: "sig" }],
    }
    const model = scriptedModel([
      { content: signedContent, functionCalls: [signedContent.parts[0].functionCall] },
      { text: "About 238 kcal per day." },
    ])
    const ctx: ToolContext = { container: {} as MedusaContainer, seenProducts: new Map() }

    const result = await runChatTurn({ ...base, model, history: [{ role: "user", text: "How much should my cat eat?" }], ctx })

    expect(result.reply).toBe("About 238 kcal per day.")
    expect(result.toolCalls).toEqual(["estimate_daily_portion"])
    expect(result.tokens).toBe(20)
    const second = model.requests[1].contents
    expect(second[1]).toBe(signedContent) // echoed unchanged, with its thought signature
    const response = second[2].parts?.[0].functionResponse
    expect(response).toMatchObject({ id: "c1", name: "estimate_daily_portion", response: { result: { daily_energy_kcal: 238 } } })
  })

  it("forces a text answer when the tool budget is spent", async () => {
    const call = { name: "list_unknown", args: {} }
    const model = scriptedModel([{ functionCalls: [call] }, { functionCalls: [call] }, { text: "final" }])
    const ctx: ToolContext = { container: {} as MedusaContainer, seenProducts: new Map() }

    const result = await runChatTurn({ ...base, model, history: [{ role: "user", text: "hi" }], ctx })

    expect(model.requests.map((r) => r.allowTools)).toEqual([true, true, false])
    expect(result.reply).toBe("final")
  })

  it("returns a safe fallback when the answer is blocked", async () => {
    const model = scriptedModel([{ blocked: true, text: "" }])
    const ctx: ToolContext = { container: {} as MedusaContainer, seenProducts: new Map() }
    const result = await runChatTurn({ ...base, model, history: [{ role: "user", text: "x" }], ctx })
    expect(result.reply).toMatch(/Sorry/)
  })

  it("shows cards only for products the answer links to", () => {
    const card = (handle: string): ChatProductCard => ({ handle, title: handle, brand: null, thumbnail: null, price_min: 1, price_max: 1, in_stock: true })
    const seen = new Map([
      ["a", card("a")],
      ["b", card("b")],
    ])
    expect(cardsForReply("Try [B](/products/b) or [B again](/products/b)", seen).map((c) => c.handle)).toEqual(["b"])
  })
})

describe("request validation and rate limit", () => {
  it("requires the last message to come from the user", () => {
    expect(ChatRequestSchema.safeParse({ messages: [{ role: "model", text: "hi" }] }).success).toBe(false)
    expect(ChatRequestSchema.safeParse({ messages: [{ role: "user", text: "x".repeat(1001) }] }).success).toBe(false)
    expect(ChatRequestSchema.safeParse({ messages: [{ role: "user", text: "hi" }], cart_id: "cart_01JABCDEFGHJKMNPQRSTVWXYZ0" }).success).toBe(true)
  })

  it("limits messages per window", () => {
    const limiter = new RateLimiter(2, 60_000)
    expect(limiter.hit("ip:1", 0).allowed).toBe(true)
    expect(limiter.hit("ip:1", 1).allowed).toBe(true)
    expect(limiter.hit("ip:1", 2)).toEqual({ allowed: false, retryAfterSeconds: 60 })
    expect(limiter.hit("ip:2", 2).allowed).toBe(true)
    expect(limiter.hit("ip:1", 60_000).allowed).toBe(true)
  })
})
