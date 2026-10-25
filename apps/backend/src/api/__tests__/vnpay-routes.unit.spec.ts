import { validateAndTransformQuery } from "@medusajs/framework/http"
import { signParams } from "../../modules/vnpay/lib/sign"
import { VnpayResultQuery } from "../middlewares"

const completeCartRun = jest.fn()
jest.mock("@medusajs/medusa/core-flows", () => ({
  completeCartWorkflow: () => ({ run: completeCartRun }),
}))

// Imported after the mock so the IPN route picks it up
import { GET as ipn } from "../hooks/vnpay/ipn/route"
import { GET as verify } from "../store/vnpay/verify/route"

const SECRET = "ROUTETESTSECRET0123456789ABCDEF"
const CART_ID = "cart_01M5PZTEYJX3XX1GZHDHZCRZVZ"
const TXN_REF = "01M5PZTEYJX3XX1GZHDHZCRZVZMH5K2P1C"

type CartState = { completed?: boolean; sessionAmount?: number; verified?: boolean }

function makeScope(state: CartState) {
  const updatePaymentSession = jest.fn()
  const services: Record<string, unknown> = {
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    query: {
      graph: jest.fn(async () => ({
        data: [
          {
            id: CART_ID,
            completed_at: state.completed ? new Date() : null,
            order: state.completed ? { id: "order_1" } : null,
            payment_collection: {
              payment_sessions: [
                {
                  id: "payses_1",
                  provider_id: "pp_vnpay_vnpay",
                  amount: state.sessionAmount ?? 175000,
                  currency_code: "vnd",
                  data: { txn_ref: TXN_REF, amount: state.sessionAmount ?? 175000, vnp_verified: state.verified },
                },
              ],
            },
          },
        ],
      })),
    },
    payment: { updatePaymentSession },
  }
  return { scope: { resolve: (key: string) => services[key] }, updatePaymentSession }
}

function signedQuery(overrides: Record<string, string> = {}) {
  const params: Record<string, string> = {
    vnp_Amount: "17500000",
    vnp_BankCode: "NCB",
    vnp_OrderInfo: `Thanh toan don hang Pawl ${TXN_REF}`,
    vnp_ResponseCode: "00",
    vnp_TmnCode: "TESTCODE",
    vnp_TransactionNo: "14512345",
    vnp_TransactionStatus: "00",
    vnp_TxnRef: TXN_REF,
    ...overrides,
  }
  return { ...params, vnp_SecureHash: signParams(params, SECRET) }
}

type RouteHandler = (req: never, res: never) => Promise<unknown>

async function call(handler: RouteHandler, query: Record<string, string>, state: CartState) {
  const { scope, updatePaymentSession } = makeScope(state)
  const json = jest.fn()
  await handler({ scope, validatedQuery: query, query } as never, { json } as never)
  return { body: json.mock.calls[0][0], updatePaymentSession }
}

beforeAll(() => {
  process.env.VNP_HASH_SECRET = SECRET
})
beforeEach(() => completeCartRun.mockReset())

describe("GET /store/vnpay/verify", () => {
  it("accepts a correctly signed successful payment and records it on the session", async () => {
    const { body, updatePaymentSession } = await call(verify, signedQuery(), {})
    expect(body).toMatchObject({ valid: true, success: true, response_code: "00", cart_id: CART_ID })
    expect(updatePaymentSession).toHaveBeenCalledWith(expect.objectContaining({ id: "payses_1", data: expect.objectContaining({ vnp_verified: true, vnp_amount: 175000 }) }))
  })

  it("rejects a wrong signature without touching the session", async () => {
    const query = { ...signedQuery(), vnp_Amount: "100" }
    const { body, updatePaymentSession } = await call(verify, query, {})
    expect(body).toMatchObject({ valid: false, success: false })
    expect(updatePaymentSession).not.toHaveBeenCalled()
  })

  it("reports a cancelled payment as not successful", async () => {
    const { body } = await call(verify, signedQuery({ vnp_ResponseCode: "24", vnp_TransactionStatus: "02" }), {})
    expect(body).toMatchObject({ valid: true, success: false, response_code: "24", message: "You cancelled the payment." })
  })

  it("does not accept an amount that differs from the session", async () => {
    const { body } = await call(verify, signedQuery(), { sessionAmount: 200000 })
    expect(body.success).toBe(false)
  })
})

describe("GET /hooks/vnpay/ipn", () => {
  it("returns 97 for an invalid signature", async () => {
    const { body } = await call(ipn, { ...signedQuery(), vnp_SecureHash: "ab".repeat(64) }, {})
    expect(body).toEqual({ RspCode: "97", Message: "Invalid signature" })
  })

  it("returns 02 when the order was already confirmed (idempotent)", async () => {
    const { body } = await call(ipn, signedQuery(), { completed: true })
    expect(body.RspCode).toBe("02")
    expect(completeCartRun).not.toHaveBeenCalled()
  })

  it("returns 04 when the amount does not match", async () => {
    const { body } = await call(ipn, signedQuery(), { sessionAmount: 1000 })
    expect(body.RspCode).toBe("04")
  })

  it("completes the cart and returns 00 for a successful payment", async () => {
    const { body } = await call(ipn, signedQuery(), {})
    expect(body).toEqual({ RspCode: "00", Message: "Confirm Success" })
    expect(completeCartRun).toHaveBeenCalledWith({ input: { id: CART_ID } })
  })
})

describe("VNPay query validation", () => {
  // Runs Medusa's real middleware, which makes object schemas strict before parsing
  async function validate(query: Record<string, string>) {
    const req = { query, allowed: [] } as unknown as { validatedQuery?: Record<string, string> }
    const next = jest.fn()
    await validateAndTransformQuery(VnpayResultQuery, {})(req as never, {} as never, next)
    return { error: next.mock.calls[0][0] as Error | undefined, validated: req.validatedQuery }
  }

  it("accepts every vnp_* parameter VNPay sends", async () => {
    const { error, validated } = await validate(signedQuery())
    expect(error).toBeUndefined()
    expect(validated).toEqual(signedQuery())
  })

  it("rejects unrelated parameters and malformed values", async () => {
    expect((await validate({ ...signedQuery(), redirect: "https://evil.example" })).error).toBeDefined()
    expect((await validate({ ...signedQuery(), vnp_TxnRef: "bad ref!" })).error).toBeDefined()
    const { vnp_SecureHash: _hash, ...unsigned } = signedQuery()
    expect((await validate(unsigned)).error).toBeDefined()
  })
})
