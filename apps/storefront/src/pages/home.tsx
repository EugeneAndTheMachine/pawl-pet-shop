import { ProductRail } from '../features/catalog/components/product-rail'
import { useCollection, useProductRail } from '../features/catalog/hooks'
import { AboutSection } from '../features/home/components/about-section'
import { CategoryShowcase } from '../features/home/components/category-showcase'
import { HealthNeeds } from '../features/home/components/health-needs'
import { Hero } from '../features/home/components/hero'
import { SubscriptionTeaser } from '../features/home/components/subscription-teaser'
import { TrustStrip } from '../features/home/components/trust-strip'

const BESTSELLER_HANDLE = 'best-sellers'

export default function HomePage() {
  const bestsellerCollection = useCollection(BESTSELLER_HANDLE)
  const collectionId = bestsellerCollection.data?.id
  const bestsellers = useProductRail({ collectionId, enabled: Boolean(collectionId) })
  const newest = useProductRail({ limit: 8 })

  return (
    <>
      <title>Pawl - Food & accessories for cats and dogs</title>
      <meta
        name="description"
        content="Pawl sells genuine dry food, wet food, litter, treats and accessories for cats and dogs. Filter by life stage and health needs, with fast delivery in Ho Chi Minh City."
      />
      <Hero />
      <TrustStrip />
      <AboutSection />
      <CategoryShowcase />
      <ProductRail
        title="Best sellers"
        subtitle="The picks pet parents trust most"
        products={bestsellers.data}
        isLoading={bestsellerCollection.isLoading || (Boolean(collectionId) && bestsellers.isLoading)}
        viewAllHref={`/products?collection=${BESTSELLER_HANDLE}`}
      />
      <HealthNeeds />
      <ProductRail title="New arrivals" subtitle="Just landed at Pawl" products={newest.data} isLoading={newest.isLoading} viewAllHref="/products" />
      <SubscriptionTeaser />
    </>
  )
}
