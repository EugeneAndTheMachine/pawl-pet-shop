import { createHmac } from "crypto"
import { buildPaymentUrl, cartIdFromTxnRef, createTxnRef, formatVnpDate } from "../build-url"
import { buildSignData, signParams, verifySignature } from "../sign"

const SECRET = "TESTSECRETKEY1234567890ABCDEFGHI"

describe("VNPay signing", () => {
  const params = {
    vnp_TxnRef: "ABC123",
    vnp_Amount: 14500000,
    vnp_OrderInfo: "Thanh toan don hang Pawl ABC123",
    vnp_Command: "pay",
    vnp_ReturnUrl: "http://localhost:5173/checkout/result",
  }

  it("sorts keys, URL-encodes values with + for spaces and skips hash fields", () => {
    const data = buildSignData({ ...params, vnp_SecureHash: "dead", vnp_SecureHashType: "SHA512", other: "x" })
    expect(data).toBe(
      "vnp_Amount=14500000&vnp_Command=pay&vnp_OrderInfo=Thanh+toan+don+hang+Pawl+ABC123" +
        "&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A5173%2Fcheckout%2Fresult&vnp_TxnRef=ABC123"
    )
  })

  it("signs with HMAC-SHA512 of the sign data", () => {
    const expected = createHmac("sha512", SECRET).update(buildSignData(params)).digest("hex")
    expect(signParams(params, SECRET)).toBe(expected)
    expect(expected).toHaveLength(128)
  })

  it("accepts a valid hash in any letter case", () => {
    const hash = signParams(params, SECRET)
    expect(verifySignature({ ...params, vnp_SecureHash: hash }, SECRET)).toBe(true)
    expect(verifySignature({ ...params, vnp_SecureHash: hash.toUpperCase() }, SECRET)).toBe(true)
  })

  it("rejects tampered, missing or malformed hashes", () => {
    const hash = signParams(params, SECRET)
    expect(verifySignature({ ...params, vnp_Amount: 100, vnp_SecureHash: hash }, SECRET)).toBe(false)
    expect(verifySignature({ ...params, vnp_SecureHash: hash }, "WRONGSECRET")).toBe(false)
    expect(verifySignature(params, SECRET)).toBe(false)
    expect(verifySignature({ ...params, vnp_SecureHash: "not-hex!" }, SECRET)).toBe(false)
  })
})

describe("VNPay payment URL", () => {
  const now = new Date("2026-10-24T17:30:00Z") // 00:30 on 25/10 in Vietnam

  it("formats dates as yyyyMMddHHmmss in Asia/Ho_Chi_Minh", () => {
    expect(formatVnpDate(now)).toBe("20261025003000")
  })

  it("builds a URL whose signature verifies after decoding, like VNPay does", () => {
    const { url, createDate, expireDate } = buildPaymentUrl({
      payUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
      tmnCode: "TESTCODE",
      hashSecret: SECRET,
      returnUrl: "http://localhost:5173/checkout/result",
      amount: 175000,
      txnRef: "01ABCDEFGHJKMNPQRSTVWXYZ12LZ3K9",
      ipAddr: "127.0.0.1",
      now,
    })
    const query = Object.fromEntries(new URL(url).searchParams.entries())

    expect(query.vnp_Amount).toBe("17500000")
    expect(query.vnp_CurrCode).toBe("VND")
    expect(query.vnp_Version).toBe("2.1.0")
    expect(createDate).toBe("20261025003000")
    expect(expireDate).toBe("20261025004500")
    expect(query.vnp_OrderInfo).toBe("Thanh toan don hang Pawl 01ABCDEFGHJKMNPQRSTVWXYZ12LZ3K9")
    expect(verifySignature(query, SECRET)).toBe(true)
  })

  it("encodes the cart id in an alphanumeric transaction reference", () => {
    const cartId = "cart_01M5PZTEYJX3XX1GZHDHZCRZVZ"
    const ref = createTxnRef(cartId, 1792845451000)
    expect(ref).toMatch(/^[0-9A-Z]+$/)
    expect(cartIdFromTxnRef(ref)).toBe(cartId)
    expect(cartIdFromTxnRef("short")).toBeNull()
    expect(() => createTxnRef("cart_invalid")).toThrow()
  })
})
