// Kept apart from the zod schemas so API modules can use them without pulling zod into the first page load.

// Vietnamese mobile numbers: 0 or +84 followed by a 9-digit number starting with 3, 5, 7, 8 or 9
export const VN_PHONE = /^(0|\+84)(3|5|7|8|9)\d{8}$/

/** Removes spaces, dots and dashes people type in phone numbers */
export function normalizePhone(value: string): string {
  return value.replace(/[\s.-]/g, '')
}
