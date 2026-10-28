import { z } from 'zod'
import { VN_PHONE, normalizePhone } from '../../lib/phone'

export const CONTACT_TOPICS = ['Question about a product', 'My order', 'Returns & refunds', 'Partnership', 'Other'] as const

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(100, 'Please keep your name under 100 characters.'),
  email: z.string().trim().min(1, 'Please enter your email.').email('Please enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || VN_PHONE.test(normalizePhone(v)), 'Please enter a valid Vietnamese mobile number, e.g. 0901234567.'),
  // A plain string so the select can start empty ("Choose a topic")
  topic: z.string().refine((v) => (CONTACT_TOPICS as readonly string[]).includes(v), 'Please choose a topic.'),
  order_number: z.string().trim().max(20, 'Please check your order number.'),
  message: z.string().trim().min(10, 'Please tell us a little more (at least 10 characters).').max(2000, 'Please keep your message under 2,000 characters.'),
})

export type ContactInput = z.input<typeof contactSchema>
