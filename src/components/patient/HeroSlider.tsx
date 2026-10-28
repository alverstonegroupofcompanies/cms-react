import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './hero-slider.css'

export interface BannerSlide {
  id: string
  image: string
  alt: string
  link?: string
}

/**
 * DEFAULT BANNER SLIDES
 * You can easily add, remove, or swap banner images here.
 * Optional `link` allows clicking the banner to navigate to a page.
 */
export const DEFAULT_BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'banner-complete-care',
    image: '/images/banner-complete-care.jpg',
    alt: 'Complete Care for Every Stage of Life - Alverstone Medcity',
    link: '/patient/book',
  },
  {
    id: 'banner-healthy-families',
    image: '/images/banner-healthy-families.png',
    alt: 'Healthy Families Brighter Tomorrows - Alverstone Medcity',
    link: '/patient/book',
  },
]

interface HeroSliderProps {
  slides?: BannerSlide[]
  signedIn?: boolean
}

export default function HeroSlider({ slides = DEFAULT_BANNER_SLIDES }: HeroSliderProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartXRef = useRef<number | null>(null)
  const autoPlayTimerRef = useRef<number | null>(null)

  const slideCount = slides.length

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % slideCount)
  }, [slideCount])

  const prevSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + slideCount) % slideCount)
  }, [slideCount])

  // Auto-advance banner every 5.5 seconds, pause on mouse hover
  useEffect(() => {
    if (isPaused || slideCount <= 1) return
    autoPlayTimerRef.current = window.setInterval(nextSlide, 5500)
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
    }
  }, [isPaused, nextSlide, slideCount])

  // Keyboard navigation when focused
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.closest('.ps-hero-image-slider')) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          prevSlide()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          nextSlide()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [prevSlide, nextSlide])

  // Mobile / tablet touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchEndX - touchStartXRef.current
    if (deltaX > 45) {
      prevSlide()
    } else if (deltaX < -45) {
      nextSlide()
    }
    touchStartXRef.current = null
  }

  return (
    <section
      className="ps-hero-image-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Clinic Highlights Banners"
      tabIndex={0}
    >
      {/* ==================================================================
          IMAGE BANNERS TRACK (SMOOTH CROSS-FADE, FIT TO SCREEN SIZE)
          ================================================================== */}
      <div className="ps-banner-track">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIdx
          const slideElement = (
            <div
              className={`ps-banner-slide ${isActive ? 'ps-banner-slide--active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Banner ${idx + 1} of ${slideCount}`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="ps-banner-img"
                loading={idx === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          )

          if (slide.link) {
            return (
              <Link
                key={slide.id}
                to={slide.link}
                className={`ps-banner-slide-link ${isActive ? 'ps-banner-slide-link--active' : ''}`}
                tabIndex={isActive ? 0 : -1}
                aria-label={slide.alt}
              >
                {slideElement}
              </Link>
            )
          }

          return <React.Fragment key={slide.id}>{slideElement}</React.Fragment>
        })}
      </div>

      {/* ==================================================================
          MINIMALIST SLEEK NAVIGATION ARROWS
          ================================================================== */}
      {slideCount > 1 && (
        <>
          <button
            type="button"
            className="ps-banner-nav-arrow ps-banner-nav-arrow--prev"
            onClick={prevSlide}
            aria-label="Previous banner"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="ps-banner-nav-arrow ps-banner-nav-arrow--next"
            onClick={nextSlide}
            aria-label="Next banner"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* ==================================================================
          BOTTOM PAGINATION INDICATORS (PILL DOTS & COUNTER)
          ================================================================== */}
      {slideCount > 1 && (
        <div className="ps-banner-pagination">
          <div className="ps-banner-dots" role="tablist" aria-label="Banner slides">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIdx
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to banner ${idx + 1}`}
                  className={`ps-banner-dot ${isActive ? 'ps-banner-dot--active' : ''}`}
                  onClick={() => setCurrentIdx(idx)}
                >
                  {isActive && <span className="ps-banner-dot-fill" />}
                </button>
              )
            })}
          </div>

          <div className="ps-banner-counter" aria-hidden="true">
            <span className="ps-banner-counter-curr">0{currentIdx + 1}</span>
            <span className="ps-banner-counter-sep">/</span>
            <span className="ps-banner-counter-total">0{slideCount}</span>
          </div>
        </div>
      )}
    </section>
  )
}
