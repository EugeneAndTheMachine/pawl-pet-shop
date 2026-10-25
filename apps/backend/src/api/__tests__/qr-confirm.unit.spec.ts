import { validateAndTransformBody } from "@medusajs/framework/http"
import { QrConfirmSchema } from "../middlewares"

const completeCartRun = jest.fn()
jest.mock("@medusajs/medusa/core-flows", () => ({
  completeCartWorkflow: () => ({ run: completeCartRun }),
}))

// Imported after the mock so the route picks it up
import { POST as confirm } from "../store/qr-payments/confirm/route"

const CART_ID = "cart_01M5PZTEYJX3XX1GZHDHZCRZVZ"
const REFERENCE = "PAWL7K3M9XQ2"

type CartState = { order?: boolean; reference?: string; expired?: boolean; paid?: boolean }

function makeScope(state: CartState) {
  const updatePaymentSession = jest.fn()
  const expires = new Date(Date.now() + (state.expired ? -1 : 1) * 60_000).toISOString()
  const data: Record<string, unknown> = { reference: state.reference ?? REFERENCE, amount: 175000, cart_id: CART_ID, expires_at: expires }
  if (state.paid) Object.assign(data, { paid_at: new Date().toISOString(), paid_amount: 175000 })
  const services: Record<string, unknown> = {
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    query: {
      graph: jest.fn(async () => ({
        data: [
          {
            id: CART_ID,
            order: state.order ? { id: "order_1" } : null,
            payment_collection: {
              payment_sessions: [{ id: "payses_1", provider_id: "pp_qr_qr", amount: 175000, currency_code: "vnd", data }],
            },
          },
        ],
      })),
    },
    payment: { updatePaymentSession },
  }
  return { scope: { resolve: (key: string) => services[key] }, updatePaymentSession }
}

async function call(state: CartState, body = { cart_id: CART_ID, reference: REFERENCE }) {
  const { scope, updatePaymentSession } = makeScope(state)
  const json = jest.fn()
  const res = { json, status: jest.fn(() => res) }
  await confirm({ scope, validatedBody: body } as never, res as never)
  return { body: json.mock.calls[0][0], status: (res.status.mock.calls[0] as unknown[] | undefined)?.[0] ?? 200, updatePaymentSession }
}

beforeEach(() => {
  completeCartRun.mockReset()
  completeCartRun.mockResolvedValue({ result: { id: "order_new" } })
})

describe("POST /store/qr-payments/confirm (simulated bank confirmation)", () => {
  it("records the payment and creates the order", async () => {
    const { body, status, updatePaymentSession } = await call({})
    expect(status).toBe(200)
    expect(body).toEqual({ status: "paid", order_id: "order_new" })
    expect(updatePaymentSession).toHaveBeenCalledWith(
      expect.objectContaining({ id: "payses_1", data: expect.objectContaining({ paid_amount: 175000, paid_at: expect.any(String) }) })
    )
    expect(completeCartRun).toHaveBeenCalledWith({ input: { id: CART_ID } })
  })

  it("returns the existing order when the cart was already completed (idempotent)", async () => {
    const { body, updatePaymentSession } = await call({ order: true, paid: true })
    expect(body).toEqual({ status: "paid", order_id: "order_1" })
    expect(updatePaymentSession).not.toHaveBeenCalled()
    expect(completeCartRun).not.toHaveBeenCalled()
  })

  it("rejects an unknown reference", async () => {
    const { body, status } = await call({ reference: "PAWLAAAAAAAA" })
    expect(status).toBe(404)
    expect(body.status).toBe("not_found")
    expect(completeCartRun).not.toHaveBeenCalled()
  })

  it("rejects an expired QR code", async () => {
    const { body, status, updatePaymentSession } = await call({ expired: true })
    expect(status).toBe(410)
    expect(body.status).toBe("expired")
    expect(updatePaymentSession).not.toHaveBeenCalled()
  })

  it("reports a failed order creation without losing the recorded payment", async () => {
    completeCartRun.mockRejectedValue(new Error("Insufficient inventory"))
    const { body, status, updatePaymentSession } = await call({})
    expect(status).toBe(409)
    expect(body.message).toMatch(/out of stock/)
    expect(updatePaymentSession).toHaveBeenCalled()
  })
})

describe("QR confirm body validation", () => {
  // Runs Medusa's real middleware, which makes the schema strict
  async function validate(body: Record<string, unknown>) {
    const next = jest.fn()
    await validateAndTransformBody(QrConfirmSchema)({ body } as never, {} as never, next)
    return next.mock.calls[0][0] as Error | undefined
  }

  it("accepts a cart id and reference and rejects anything else", async () => {
    expect(await validate({ cart_id: CART_ID, reference: REFERENCE })).toBeUndefined()
    expect(await validate({ cart_id: CART_ID, reference: "PAWL0O1I" })).toBeDefined()
    expect(await validate({ cart_id: "cart_x", reference: REFERENCE })).toBeDefined()
    expect(await validate({ cart_id: CART_ID, reference: REFERENCE, paid_amount: 1 })).toBeDefined()
  })
})
