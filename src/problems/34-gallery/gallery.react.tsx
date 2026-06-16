import css from './gallery.module.css'
import flex from '@course/styles'
import cx from '@course/cx'
import { useState, useEffect, useCallback } from 'react'

type TGalleryProps = {
  images: string[]
}

/**
 * Expected input:
 * <Gallery images={['url1.jpg', 'url2.jpg', 'url3.jpg']} />
 */
export const Gallery = ({ images }: TGalleryProps) => {
  // Step 1: Set up state
  // - currentIndex (number, default 0) to track the active slide
  const [currentIndex, setCurrentIndex] = useState(0)
  // Step 2: Create navigation handlers with useCallback
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [currentIndex, images.length])

  // Step 3: Add keyboard navigation with useEffect
  // - Listen for 'keydown' on window
  // - ArrowLeft → handlePrev, ArrowRight → handleNext
  // - Clean up the event listener on unmount
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext])

  // Step 4: Handle empty state
  if (images.length === 0) {
    return (
      <section className={cx(flex.pRel, css.gallery)}>
        <div className={cx(flex.flexRowCenter, flex.h100, flex.fontX)}>No images to display</div>
      </section>
    )
  }

  // Step 5: Render the gallery
  // - <section> container with positioning classes
  // - Prev button (disabled when currentIndex === 0), positioned absolute left, aria-label="Previous image"
  // - <ul> with transform: translateX(-currentIndex * 100%) for sliding
  // - Each <li> contains an <img>; use lazy loading: src={currentIndex + 2 >= index ? image : undefined}
  // - Next button (disabled when currentIndex === images.length - 1), positioned absolute right, aria-label="Next image"
  // - Dot indicators: one <button> per image, active dot gets css.dotActive class
  //   - onClick sets currentIndex to that dot's index, aria-label="Go to image {index + 1}"

  const transform = { transform: `translateX(-${currentIndex * 100}%)` }

  return (
    <section className={cx(flex.pRel, css.gallery)}>
      <button
        disabled={currentIndex === 0}
        onClick={handlePrev}
        aria-label="Previous image"
        className={cx(css.button__prev, css.button)}
      >
        {'<'}
      </button>
      <ul className={css.image__list} style={transform}>
        {images.map((image, index) => {
          return (
            <li key={index} className={css.image}>
              <img
                src={currentIndex + 2 >= index ? image : undefined}
                alt={`Gallery image ${index + 1}`}
                className={flex.wh100}
              />
            </li>
          )
        })}
      </ul>
      <button
        disabled={currentIndex === images.length - 1}
        onClick={handleNext}
        aria-label="Next image"
        className={cx(css.button__next, css.button)}
      >
        {'>'}
      </button>
      <div className={cx(flex.justifyCenter, flex.flexGap8, css.indicators)}>
        {images.map((_, index) => {
          return (
            <button
              key={index}
              className={cx(
                css.dot,
                flex.bgWhite5,
                flex.br128,
                currentIndex === index ? css.dotActive : '',
              )}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          )
        })}
      </div>
    </section>
  )
}
