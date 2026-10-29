import { Link } from 'react-router-dom'
import { CLINIC } from '../../config/clinic'
import './elder-care-section.css'

export interface ElderCareService {
  id: string
  line1: string
  line2: string
  description: string
  image: string
  imageAlt: string
  link: string
  isAccent?: boolean
}

interface ElderCareSectionProps {
  signedIn?: boolean
}

export default function ElderCareSection({ signedIn = false }: ElderCareSectionProps) {
  const baseBookUrl = signedIn ? '/patient/book' : '/patient/login?next=%2Fpatient%2Fbook'

  const ELDER_SERVICES: ElderCareService[] = [
    {
      id: 'veterans-care',
      line1: 'Veterans & Senior',
      line2: 'Care',
      description:
        'Attentive routine monitoring, gentle mobility assistance, fall prevention, and blood pressure checks designed around daily comfort.',
      image: '/images/elders/elder-mobility-care.jpg',
      imageAlt: 'Compassionate nurse assisting senior grandfather with walking frame in warm sunlit home',
      link: `${baseBookUrl}?service=elder_mobility`,
    },
    {
      id: 'personal-care',
      line1: 'Personal Bedside',
      line2: 'Care',
      description:
        'Certified registered nurses visiting your residence for post-discharge wound dressing, scheduled injections, IV therapy, and vital checks.',
      image: '/images/elders/elder-bedside-nursing.jpg',
      imageAlt: 'Caring nurse sitting at bedside holding hands with senior woman patient with warmth',
      link: `${baseBookUrl}?service=home_nursing`,
    },
    {
      id: 'respite-care',
      line1: 'Respite & Rehab',
      line2: 'Care',
      description:
        'Post-operative joint recovery, geriatric physiotherapy, and unhurried doctor checkups giving family caregivers complete peace of mind.',
      image: '/images/dept-general-medicine.jpg',
      imageAlt: 'Senior specialist doctor reviewing recovery health trends with patient in clinical suite',
      link: `${baseBookUrl}?service=elder_rehab`,
    },
    {
      id: 'more-services',
      line1: 'More Senior',
      line2: 'Services',
      description:
        'Priority zero-wait OPD tokens, 100% step-free wheelchair campus transit, home lab sample collections, and 24/7 emergency dispatch.',
      image: '/images/patient-hero-doctors.jpg',
      imageAlt: 'Multidisciplinary hospital medical faculty ready in modern atrium',
      link: '/patient/about',
      isAccent: true,
    },
  ]

  return (
    <section className="ecs-section" aria-labelledby="ecs-main-title">
      {/* Background Organic Wave matching user screenshot */}
      <div className="ecs-wave-container" aria-hidden="true">
        <svg
          className="ecs-wave-svg"
          viewBox="0 0 1440 380"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,200 C320,160 460,270 760,240 C1060,210 1200,90 1440,130 L1440,380 L0,380 Z"
            fill="#FF2E2E"
          />
        </svg>
      </div>

      <div className="ecs-container">
        {/* ==================================================================
            1. HEADER WITH CLASSIC EDITORIAL SERIF
            ================================================================== */}
        <div className="ecs-header" data-reveal>
          <h2 id="ecs-main-title" className="ecs-title">
            Home Care That&apos;s Tailored to Your Needs
          </h2>
          <p className="ecs-subtitle">
            Dignified, unhurried healthcare and compassionate bedside support designed to keep senior loved ones safe,
            healthy, and cherished in the comfort of their home or at our campus.
          </p>
        </div>

        {/* ==================================================================
            2. THE FOUR ASYMMETRICAL ARCHED CARDS (EXACT SHAPE FINISH)
            ================================================================== */}
        <div className="ecs-cards-grid">
          {ELDER_SERVICES.map((srv, idx) => (
            <article
              key={srv.id}
              className={`ecs-card ${srv.isAccent ? 'ecs-card--accent' : ''}`}
              data-reveal
              style={{ ['--d' as string]: `${idx * 90}ms` }}
            >
              {/* Card Upper Body */}
              <div className="ecs-card-body">
                {/* 2x2 Dot Accent Icon at top-left (exact match to screenshot) */}
                <div className="ecs-dot-grid" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                {/* Two-Line Typographic Title */}
                <h3 className="ecs-card-title">
                  <span className="ecs-title-line1">{srv.line1}</span>
                  <span className="ecs-title-line2">{srv.line2}</span>
                </h3>

                <p className="ecs-card-desc">{srv.description}</p>
              </div>

              {/* Bottom Circular Photo Window with Floating Arrow Action Button */}
              <div className="ecs-photo-dock">
                <div className="ecs-photo-circle">
                  <img src={srv.image} alt={srv.imageAlt} loading="lazy" />
                </div>

                <Link
                  to={srv.link}
                  className="ecs-floating-arrow-btn"
                  aria-label={`Learn more about ${srv.line1} ${srv.line2}`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* ==================================================================
            3. DEDICATED SENIOR CARE ASSISTANCE STRIP
            ================================================================== */}
        <div className="ecs-assistance-strip">
          <div className="ecs-strip-info">
            <span className="ecs-strip-badge">
              <span className="ecs-strip-pulse" />
              Dedicated Senior Care Desk
            </span>
            <p className="ecs-strip-text">
              Need assistance arranging wheelchair transit, home blood collection, or doctor appointments for an elderly parent?
            </p>
          </div>
          <div className="ecs-strip-actions">
            <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`} className="ecs-strip-call-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              <span>Call Senior Desk: {CLINIC.phone}</span>
            </a>
            <Link to={baseBookUrl} className="ecs-strip-book-btn">
              <span>Book Elder Visit</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
