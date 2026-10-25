import QrPaymentProviderService from "../../service"
import { createReference, createSessionData, isExpired, isPaid, REFERENCE_PATTERN } from "../session"

const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
const provider = new QrPaymentProviderService({ logger } as never, { expiryMinutes: 15 })
const CART_ID = "cart_01M5PZTEYJX3XX1GZHDHZCRZVZ"

describe("QR payment session data", () => {
  it("creates unique transfer references without look-alike characters", () => {
    const refs = new Set(Array.from({ length: 200 }, createReference))
    expect(refs.size).toBe(200)
    for (const ref of refs) expect(ref).toMatch(REFERENCE_PATTERN)
  })

  it("expires 15 minutes after it is created", () => {
    const now = new Date("2026-10-25T07:00:00Z")
    const data = createSessionData(CART_ID, 175000, 15, now)
    expect(data.expires_at).toBe("2026-10-25T07:15:00.000Z")
    expect(isExpired(data, new Date("2026-10-25T07:14:59Z"))).toBe(false)
    expect(isExpired(data, new Date("2026-10-25T07:15:01Z"))).toBe(true)
  })

  it("counts a session as paid only when the full amount was received", () => {
    const data = createSessionData(CART_ID, 175000, 15)
    expect(isPaid(data)).toBe(false)
    expect(isPaid({ ...data, paid_at: new Date().toISOString(), paid_amount: 100000 })).toBe(false)
    expect(isPaid({ ...data, paid_at: new Date().toISOString(), paid_amount: 175000 })).toBe(true)
  })
})

describe("QrPaymentProviderService", () => {
  it("requires the cart id and returns a pending session with the amount in VND", async () => {
    await expect(provider.initiatePayment({ amount: 175000, currency_code: "vnd", data: {} })).rejects.toThrow(/cart_id/)
    const result = await provider.initiatePayment({ amount: 175000, currency_code: "vnd", data: { cart_id: CART_ID } })
    expect(result.status).toBe("pending")
    expect(result.data).toMatchObject({ amount: 175000, cart_id: CART_ID })
    expect(result.id).toBe(result.data!.reference)
  })

  it("authorizes (and captures) only a paid session", async () => {
    const data = createSessionData(CART_ID, 175000, 15)
    expect((await provider.authorizePayment({ data })).status).toBe("pending")
    const paid = { ...data, paid_at: new Date().toISOString(), paid_amount: 175000 }
    expect((await provider.authorizePayment({ data: paid })).status).toBe("captured")
  })

  it("issues a new reference when the cart total changes before payment", async () => {
    const data = createSessionData(CART_ID, 175000, 15)
    const same = await provider.updatePayment({ amount: 175000, currency_code: "vnd", data })
    expect(same.data).toBe(data)
    const changed = await provider.updatePayment({ amount: 200000, currency_code: "vnd", data })
    expect(changed.data).toMatchObject({ amount: 200000, cart_id: CART_ID })
    expect(changed.data!.reference).not.toBe(data.reference)
  })
})
