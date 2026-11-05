import hero960 from '../../../assets/images/hero-960.webp'
import hero1920 from '../../../assets/images/hero-1920.webp'
import { ButtonLink } from '../../../components/ui/button'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-accent-deep">
      <img
        src={hero1920}
        srcSet={`${hero960} 960w, ${hero1920} 1920w`}
        sizes="100vw"
        alt="A woman shopping on her laptop while petting her golden retriever"
        className="absolute inset-0 -z-10 size-full object-cover object-[70%_center]"
        fetchPriority="high"
      />
      {/* Darkens the left side so the white title stays readable on the light photo */}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-accent-deep/90 via-accent-deep/75 to-accent-deep/45 sm:via-accent-deep/45 sm:to-accent-deep/0" aria-hidden="true" />

      <div className="container-page flex min-h-[460px] flex-col justify-center py-16 sm:min-h-[560px] lg:min-h-[620px]">
        <h1 className="font-display text-7xl leading-tight text-white drop-shadow-sm sm:text-8xl lg:text-9xl">Pawl</h1>
        <p className="mt-1 font-hand text-3xl text-brand sm:text-4xl">The Pal of your Paw</p>
        <p className="mt-5 max-w-md text-base text-white/90 sm:text-lg">
          Genuine food, litter, treats and accessories for your furry boss. Order in minutes, delivered the same day.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/products" size="lg">
            Shop now
          </ButtonLink>
          <ButtonLink to="/c/cat" size="lg" variant="light">
            For cats
          </ButtonLink>
          <ButtonLink to="/c/dog" size="lg" variant="light">
            For dogs
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
