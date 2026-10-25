import { z } from 'zod'
import { VN_PROVINCES } from '../../lib/vn-provinces'

// Vietnamese mobile numbers: 0 or +84 followed by a 9-digit number starting with 3, 5, 7, 8 or 9
export const VN_PHONE = /^(0|\+84)(3|5|7|8|9)\d{8}$/

const email = z.string().trim().min(1, 'Please enter your email.').email('Please enter a valid email address.')
/** Removes spaces, dots and dashes people type in phone numbers */
export function normalizePhone(value: string): string {
  return value.replace(/[\s.-]/g, '')
}

const phone = z
  .string()
  .trim()
  .refine((v) => VN_PHONE.test(normalizePhone(v)), 'Please enter a valid Vietnamese mobile number, e.g. 0901234567.')
const password = z.string().min(8, 'Password must be at least 8 characters.')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Please enter your password.'),
})

export const registerSchema = z
  .object({
    first_name: z.string().trim().min(1, 'Please enter your first name.'),
    last_name: z.string().trim().min(1, 'Please enter your last name.'),
    email,
    phone,
    password,
    confirm_password: z.string(),
    consent: z.boolean().refine((v) => v, 'Please agree to the processing of your personal data.'),
  })
  .refine((d) => d.password === d.confirm_password, { path: ['confirm_password'], message: 'Passwords do not match.' })

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({ password, confirm_password: z.string() })
  .refine((d) => d.password === d.confirm_password, { path: ['confirm_password'], message: 'Passwords do not match.' })

export const profileSchema = z.object({
  first_name: z.string().trim().min(1, 'Please enter your first name.'),
  last_name: z.string().trim().min(1, 'Please enter your last name.'),
  phone,
})

export const contactSchema = z.object({ email, phone })

/** Medusa mapping: province = province/city, city = ward/commune, address_1 = street address */
export const addressSchema = z.object({
  full_name: z.string().trim().min(2, 'Please enter the recipient name.'),
  phone,
  province: z.enum(VN_PROVINCES, { message: 'Please choose a province or city.' }),
  city: z.string().trim().min(2, 'Please enter the ward or commune.'),
  address_1: z.string().trim().min(3, 'Please enter the street address.'),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type ProfileValues = z.infer<typeof profileSchema>
export type ContactValues = z.infer<typeof contactSchema>
export type AddressValues = z.infer<typeof addressSchema>
