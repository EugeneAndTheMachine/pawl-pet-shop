const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
})

export function formatVND(amount: number | null | undefined): string {
  return amount == null ? '' : vndFormatter.format(amount)
}

export function formatDate(value: string | Date): string {
  return dateFormatter.format(new Date(value))
}
