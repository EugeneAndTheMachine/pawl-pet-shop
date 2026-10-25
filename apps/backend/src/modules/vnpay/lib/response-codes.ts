// Customer-facing messages for vnp_ResponseCode (VNPay payment result codes)
const MESSAGES: Record<string, string> = {
  "00": "Payment successful.",
  "07": "The amount was deducted but the transaction is flagged as suspicious. Please contact your bank.",
  "09": "Your card or account is not registered for internet banking.",
  "10": "Card or account verification failed more than 3 times.",
  "11": "The payment window expired. Please try again.",
  "12": "Your card or account is locked.",
  "13": "The OTP you entered is incorrect. Please try again.",
  "24": "You cancelled the payment.",
  "51": "Your account balance is insufficient.",
  "65": "Your account has exceeded its daily transaction limit.",
  "75": "The bank is under maintenance. Please try again later.",
  "79": "Wrong payment password entered too many times. Please try again.",
  "99": "The payment could not be completed. Please try again.",
}

export function vnpayMessage(code: string | undefined): string {
  return (code && MESSAGES[code]) || MESSAGES["99"]
}
