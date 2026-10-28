// Policy pages are static Markdown written by the team (src/content/policies/*.md), bundled with the policy page chunk.
const files = import.meta.glob<string>('../../content/policies/*.md', { query: '?raw', import: 'default', eager: true })

export type Policy = { slug: string; title: string; description: string }

export const POLICIES: readonly Policy[] = [
  { slug: 'terms', title: 'Terms of Service', description: 'The rules for using the Pawl website and buying from Pawl.' },
  { slug: 'privacy', title: 'Privacy Policy', description: 'What personal data Pawl collects, why, how long we keep it and your rights.' },
  { slug: 'shipping', title: 'Shipping Policy', description: 'Delivery options, fees and times for Pawl orders across Vietnam.' },
  { slug: 'returns', title: 'Returns & Refunds', description: 'How to return an item or get a refund from Pawl.' },
  { slug: 'payment', title: 'Payment Policy', description: 'Pay by cash on delivery or bank transfer by QR code at Pawl.' },
]

export function findPolicy(slug: string | undefined): (Policy & { content: string }) | null {
  const policy = POLICIES.find((p) => p.slug === slug)
  const content = policy && files[`../../content/policies/${policy.slug}.md`]
  return policy && content ? { ...policy, content } : null
}
