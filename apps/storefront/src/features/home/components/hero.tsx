import hero960 from '../../../assets/images/hero-960.webp'
import hero1920 from '../../../assets/images/hero-1920.webp'
import { ButtonLink } from '../../../components/ui/button'
import { CatIcon, DogIcon } from '../../../components/ui/icons'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-accent-deep">
      <img
        src={hero1920}
        srcSet={`${hero960} 960w, ${hero1920} 1920w`}
        sizes="100vw"
        alt="Cô gái vừa mua sắm trên laptop vừa vuốt ve chú chó golden"
        className="absolute inset-0 -z-10 size-full object-cover object-[70%_center]"
        fetchPriority="high"
      />
      {/* Darkens the left side so the white title stays readable on the light photo */}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-accent-deep/90 via-accent-deep/75 to-accent-deep/45 sm:via-accent-deep/45 sm:to-accent-deep/0" aria-hidden="true" />

      <div className="container-page flex min-h-[460px] flex-col justify-center py-16 sm:min-h-[560px] lg:min-h-[620px]">
        <h1 className="font-display text-7xl leading-tight text-white drop-shadow-sm sm:text-8xl lg:text-9xl">Pawl</h1>
        <p className="mt-1 font-hand text-3xl text-brand sm:text-4xl">The Pal of your Paw</p>
        <p className="mt-5 max-w-md text-base text-white/90 sm:text-lg">
          Thức ăn, cát vệ sinh, snack và phụ kiện chính hãng cho boss nhà bạn. Đặt trong vài phút, giao ngay trong ngày.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/products" size="lg">
            Mua ngay
          </ButtonLink>
          <ButtonLink to="/c/meo" size="lg" variant="light">
            <CatIcon className="text-xl" /> Cho Mèo
          </ButtonLink>
          <ButtonLink to="/c/cho" size="lg" variant="light">
            <DogIcon className="text-xl" /> Cho Chó
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
