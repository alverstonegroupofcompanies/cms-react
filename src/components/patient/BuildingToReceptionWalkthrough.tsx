import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { IconCalendar } from '../Icons'
import './building-walkthrough.css'

interface SceneData {
  id: string
  stepNumber: string
  title: string
  image: string
  alt: string
}

const SCENES: SceneData[] = [
  {
    id: 'campus',
    stepNumber: '01',
    title: 'Hospital Campus',
    image: '/images/walkthrough/01-building.jpg',
    alt: 'Alverstone Medcity Hospital Exterior Architecture',
  },
  {
    id: 'entrance',
    stepNumber: '02',
    title: 'Main Entrance',
    image: '/images/walkthrough/02-entrance.jpg',
    alt: 'Grand Glass Entrance Doors of Alverstone Medcity',
  },
  {
    id: 'atrium',
    stepNumber: '03',
    title: 'Lobby & Atrium',
    image: '/images/walkthrough/03-atrium.jpg',
    alt: 'Grand Interior Atrium and Waiting Lobby',
  },
  {
    id: 'reception',
    stepNumber: '04',
    title: 'Reception Desk',
    image: '/images/walkthrough/04-reception.jpg',
    alt: 'Friendly Clinic Receptionist at Check-in Desk',
  },
]

interface Props {
  signedIn?: boolean
  bookVisitTo?: string
}

function getHeaderOffset(): number {
  if (typeof document === 'undefined') return 108
  const header = document.querySelector('.alv-header') as HTMLElement | null
  return header ? header.offsetHeight : 108
}

export default function BuildingToReceptionWalkthrough({
  signedIn = false,
  bookVisitTo = '/patient/book',
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [activeScene, setActiveScene] = useState(0)
  const [autoTour, setAutoTour] = useState(false)
  const [navOffset, setNavOffset] = useState(108)
  const currentProgressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const animFrameRef = useRef<number | null>(null)
  const autoTourRef = useRef(false)

  // Keep ref in sync for loop
  autoTourRef.current = autoTour

  // Preload walkthrough images on mount for instantaneous rendering
  useEffect(() => {
    SCENES.forEach((scene) => {
      const img = new Image()
      img.src = scene.image
    })
  }, [])

  // Calculate scroll progress relative to the track container below the sticky navbar
  const handleScroll = useCallback(() => {
    const headerH = getHeaderOffset()
    setNavOffset((prev) => (prev !== headerH ? headerH : prev))

    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const trackHeight = rect.height
    const viewportHeight = window.innerHeight || 800
    const stickyHeight = Math.max(320, viewportHeight - headerH)
    const scrollTravel = trackHeight - stickyHeight

    if (scrollTravel <= 0) return

    // rect.top equals headerH when the top of the track sits right under the sticky navbar
    const scrolledPx = headerH - rect.top
    const rawProgress = Math.max(0, Math.min(1, scrolledPx / scrollTravel))
    targetProgressRef.current = rawProgress
  }, [])

  // Passive scroll listener for silky mobile & desktop tracking
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [handleScroll])

  // Smooth Lerp animation loop (smooth physics interpolation)
  useEffect(() => {
    let lastTime = performance.now()

    const updateLoop = (now: number) => {
      const delta = Math.min(40, now - lastTime)
      lastTime = now

      // If Auto Tour is active, steadily advance scroll position
      if (autoTourRef.current && trackRef.current) {
        const headerH = getHeaderOffset()
        const rect = trackRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight || 800
        const stickyHeight = Math.max(320, viewportHeight - headerH)
        const scrollTravel = rect.height - stickyHeight

        if (scrollTravel > 0) {
          const scrollStep = (scrollTravel / 6000) * delta // Completes in ~6 seconds
          const newScrollY = window.scrollY + scrollStep
          const maxScrollY = window.scrollY + rect.bottom - viewportHeight

          if (window.scrollY >= maxScrollY - 2) {
            setAutoTour(false)
          } else {
            window.scrollTo(0, newScrollY)
          }
        }
      }

      // Smooth lerp (friction = 0.14)
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.0004) {
        currentProgressRef.current += diff * 0.14
      } else {
        currentProgressRef.current = targetProgressRef.current
      }

      const p = currentProgressRef.current
      setProgress(p)

      // Map progress to active scene index for HUD
      let idx = 0
      if (p >= 0.75) idx = 3
      else if (p >= 0.48) idx = 2
      else if (p >= 0.22) idx = 1
      else idx = 0

      setActiveScene((prev) => (prev !== idx ? idx : prev))

      animFrameRef.current = requestAnimationFrame(updateLoop)
    }

    animFrameRef.current = requestAnimationFrame(updateLoop)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  // Jump smoothly to a specific waypoint scene
  const goToScene = (index: number) => {
    setAutoTour(false)
    if (!trackRef.current) return
    const headerH = getHeaderOffset()
    const rect = trackRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight || 800
    const stickyHeight = Math.max(320, viewportHeight - headerH)
    const scrollTravel = rect.height - stickyHeight
    const currentAbsoluteTop = window.scrollY + rect.top - headerH

    // Target waypoint offsets
    const offsets = [0, 0.32, 0.62, 0.95]
    const targetScrollY = Math.max(0, currentAbsoluteTop + scrollTravel * offsets[index])

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    })
  }

  // Skip past the walkthrough directly to the next section below the home banner
  const handleSkip = () => {
    setAutoTour(false)
    if (trackRef.current) {
      const headerH = getHeaderOffset()
      const rect = trackRef.current.getBoundingClientRect()
      window.scrollTo({
        top: window.scrollY + rect.bottom - headerH,
        behavior: 'smooth',
      })
    }
  }

  const toggleAutoTour = () => {
    if (!autoTour && progress >= 0.95) {
      goToScene(0)
    }
    setAutoTour((prev) => !prev)
  }

  // Compute transform styles for each scene layer based on current smooth progress
  const getSceneStyle = (index: number) => {
    const p = progress
    let opacity = 0
    let scale = 1

    if (index === 0) {
      // Scene 1: Campus Exterior (0.00 to 0.30) — starts at 1.00 scale so roof/top is never cropped
      if (p <= 0.2) {
        opacity = 1
      } else if (p <= 0.32) {
        opacity = Math.max(0, 1 - (p - 0.2) / 0.12)
      } else {
        opacity = 0
      }
      scale = 1 + p * 0.28
    } else if (index === 1) {
      // Scene 2: Grand Glass Entrance (0.20 to 0.58)
      if (p < 0.2) {
        opacity = 0
      } else if (p <= 0.28) {
        opacity = (p - 0.2) / 0.08
      } else if (p <= 0.48) {
        opacity = 1
      } else if (p <= 0.58) {
        opacity = Math.max(0, 1 - (p - 0.48) / 0.1)
      } else {
        opacity = 0
      }
      const localP = Math.max(0, Math.min(1, (p - 0.2) / 0.38))
      scale = 1 + localP * 0.18
    } else if (index === 2) {
      // Scene 3: Atrium & Live Queue Screens (0.48 to 0.84)
      if (p < 0.48) {
        opacity = 0
      } else if (p <= 0.56) {
        opacity = (p - 0.48) / 0.08
      } else if (p <= 0.74) {
        opacity = 1
      } else if (p <= 0.84) {
        opacity = Math.max(0, 1 - (p - 0.74) / 0.1)
      } else {
        opacity = 0
      }
      const localP = Math.max(0, Math.min(1, (p - 0.48) / 0.36))
      scale = 1 + localP * 0.16
    } else if (index === 3) {
      // Scene 4: Reception Desk & Check-in (0.74 to 1.00)
      if (p < 0.74) {
        opacity = 0
      } else if (p <= 0.82) {
        opacity = (p - 0.74) / 0.08
      } else {
        opacity = 1
      }
      const localP = Math.max(0, Math.min(1, (p - 0.74) / 0.26))
      scale = 1 + localP * 0.08
    }

    return {
      backgroundImage: `url(${SCENES[index].image})`,
      opacity: Number(opacity.toFixed(3)),
      transform: `translate3d(0, 0, 0) scale3d(${scale.toFixed(3)}, ${scale.toFixed(3)}, 1)`,
      visibility: opacity > 0.005 ? ('visible' as const) : ('hidden' as const),
    }
  }

  // Shimmer opacity calculation (flashes subtly when entering glass doors)
  const shimmerOpacity =
    progress >= 0.38 && progress <= 0.52
      ? Math.sin(((progress - 0.38) / 0.14) * Math.PI) * 0.6
      : 0

  const activeSceneData = SCENES[activeScene]
  const pctDisplay = Math.round(progress * 100)

  return (
    <section
      className="btr-section"
      aria-label="Interactive Arrival Experience"
      style={{ ['--btr-nav-h' as string]: `${navOffset}px` }}
    >
      {/* Outer Scroll Track */}
      <div className="btr-scroll-track" ref={trackRef}>
        {/* Sticky Viewport pinned cleanly below the navbar */}
        <div className="btr-sticky-viewport">
          {/* Layered Background Scenes (100% Unobstructed Full-Fit View) */}
          <div className="btr-canvas-stage" aria-hidden>
            {SCENES.map((scene, i) => (
              <div
                key={scene.id}
                className="btr-scene-layer"
                data-scene={i}
                style={getSceneStyle(i)}
                role="img"
                aria-label={scene.alt}
              />
            ))}
          </div>

          {/* Atmospheric Depth Overlays */}
          <div className="btr-vignette" aria-hidden />
          <div className="btr-gradient-top" aria-hidden />
          <div className="btr-gradient-bottom" aria-hidden />
          <div
            className="btr-door-shimmer"
            style={{ opacity: Number(shimmerOpacity.toFixed(2)) }}
            aria-hidden
          />

          {/* ==============================================================
              HEADS-UP DISPLAY (HUD)
              Top Bar + Clean Bottom Console neatly fitted below Navbar
              ============================================================== */}
          <div className="btr-hud-container">
            {/* Top Bar: Location / Campus Tag + Auto Tour & Skip Buttons */}
            <header className="btr-top-bar">
              <div className="btr-top-meta">
                <span className="btr-meta-location">Chandanathope, Kollam</span>
              </div>

              <div className="btr-top-actions">
                <button
                  type="button"
                  className={`btr-action-btn btr-play-btn ${autoTour ? 'is-active' : ''}`}
                  onClick={toggleAutoTour}
                  aria-label={autoTour ? 'Pause Tour' : 'Play Tour'}
                  title={autoTour ? 'Pause' : 'Play'}
                >
                  <span style={{ fontSize: '0.85rem' }}>{autoTour ? '❚❚' : '▶'}</span>
                </button>

                <button
                  type="button"
                  className="btr-action-btn btr-skip-btn"
                  onClick={handleSkip}
                  aria-label="Explore Departments & Services"
                >
                  <span>Explore</span>
                  <span aria-hidden>↓</span>
                </button>
              </div>
            </header>

            {/* Bottom Dock: Progress Bar + Unified Clinical Console */}
            <footer className="btr-bottom-dock">
              {/* Continuous Progress Line */}
              <div
                className="btr-progress-track"
                role="progressbar"
                aria-valuenow={pctDisplay}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Walkthrough progress"
              >
                <div
                  className="btr-progress-fill"
                  style={{ width: `${pctDisplay}%` }}
                />
              </div>

              {/* Unified Bottom Console - Minimal */}
              <div className="btr-console-bar" key={activeSceneData.id}>
                {/* Left: Step Tag & Clean Minimal Title */}
                <div className="btr-console-identity">
                  <span className="btr-step-label">{activeSceneData.stepNumber} / 04</span>
                  <h3 className="btr-console-title">{activeSceneData.title}</h3>
                </div>

                {/* Right: Quick Stepper + Primary Book CTA */}
                <div className="btr-console-actions">
                  <div className="btr-stepper-nav">
                    <button
                      type="button"
                      className="btr-arrow-btn"
                      disabled={activeScene === 0}
                      onClick={() => goToScene(activeScene - 1)}
                      aria-label="Previous step"
                      title="Previous step"
                    >
                      ‹
                    </button>
                    <div className="btr-dot-track">
                      {SCENES.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          className={`btr-dot-btn ${activeScene === idx ? 'is-active' : ''}`}
                          onClick={() => goToScene(idx)}
                          aria-label={`Jump to step ${idx + 1}: ${s.title}`}
                          title={s.title}
                        >
                          <span>{idx + 1}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btr-arrow-btn"
                      disabled={activeScene === 3}
                      onClick={() => goToScene(activeScene + 1)}
                      aria-label="Next step"
                      title="Next step"
                    >
                      ›
                    </button>
                  </div>

                  <div className="btr-cta-group">
                    <Link to={bookVisitTo} className="btr-btn-primary">
                      <IconCalendar size={15} />
                      <span>{signedIn ? 'Book Visit' : 'Book Consultation'}</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </section>
  )
}
