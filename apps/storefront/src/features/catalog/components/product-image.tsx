import { useState } from 'react'
import { PawIcon } from '../../../components/ui/icons'
import { cx } from '../../../lib/cx'

type ProductImageProps = {
  src?: string | null
  alt: string
  className?: string
  sizes?: string
  eager?: boolean
}

/** Product photo with a branded fallback when the product has no image or the URL fails */
export function ProductImage({ src, alt, className, eager }: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={cx('grid place-items-center bg-brand-soft text-brand/60', className)} role="img" aria-label={alt}>
        <PawIcon className="size-1/3" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={cx('object-contain', className)}
    />
  )
}
