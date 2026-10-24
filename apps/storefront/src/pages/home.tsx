import { ProductRail } from '../features/catalog/components/product-rail'
import { useCollection, useProductRail } from '../features/catalog/hooks'
import { AboutSection } from '../features/home/components/about-section'
import { CategoryShowcase } from '../features/home/components/category-showcase'
import { HealthNeeds } from '../features/home/components/health-needs'
import { Hero } from '../features/home/components/hero'
import { SubscriptionTeaser } from '../features/home/components/subscription-teaser'
import { TrustStrip } from '../features/home/components/trust-strip'

const BESTSELLER_HANDLE = 'ban-chay'

export default function HomePage() {
  const bestsellerCollection = useCollection(BESTSELLER_HANDLE)
  const collectionId = bestsellerCollection.data?.id
  const bestsellers = useProductRail({ collectionId, enabled: Boolean(collectionId) })
  const newest = useProductRail({ limit: 8 })

  return (
    <>
      <title>Pawl – Thức ăn & phụ kiện cho chó mèo, giao trong ngày</title>
      <meta
        name="description"
        content="Pawl bán thức ăn hạt, pate, cát vệ sinh, snack và phụ kiện chính hãng cho chó mèo. Lọc theo độ tuổi và nhu cầu sức khoẻ, giao nhanh tại TP.HCM và Hà Nội."
      />
      <Hero />
      <TrustStrip />
      <AboutSection />
      <CategoryShowcase />
      <ProductRail
        title="Bán chạy"
        subtitle="Những món được các sen tin chọn nhiều nhất"
        products={bestsellers.data}
        isLoading={bestsellerCollection.isLoading || (Boolean(collectionId) && bestsellers.isLoading)}
        viewAllHref={`/products?collection=${BESTSELLER_HANDLE}`}
      />
      <HealthNeeds />
      <ProductRail title="Sản phẩm mới" subtitle="Vừa cập bến Pawl" products={newest.data} isLoading={newest.isLoading} viewAllHref="/products" />
      <SubscriptionTeaser />
    </>
  )
}
