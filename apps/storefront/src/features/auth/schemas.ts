import { z } from 'zod'
import { VN_PHONE, normalizePhone } from '../../lib/phone'
import { VN_PROVINCES } from '../../lib/vn-provinces'

export { VN_PHONE, normalizePhone }

const email = z.string().trim().min(1, 'Please enter your email.').email('Please enter a valid email address.')
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
