import { useState } from 'react'
import { Link } from 'react-router-dom'
import PatientSiteLayout from '../../components/PatientSiteLayout'
import { usePageTitle } from '../../hooks/usePageTitle'
import { CLINIC } from '../../config/clinic'
import {
  IconChevronDown,
  IconQuote,
  IconStethoscope,
  IconShield,
  IconQueue,
  IconPill,
  IconFlask,
  IconClock,
  IconBuilding,
  IconPhone,
  IconHeart,
  IconStar,
  iconMap,
} from '../../components/Icons'
import ExpandableImage from '../../components/motion/ExpandableImage'

const GALLERY = [
  { src: '/images/patient-hero.jpg', alt: 'Consultation Suite', span: 'tall' as const },
  { src: '/images/roles/receptionist.jpg', alt: 'Welcoming Reception & Helpdesk', span: 'wide' as const },
  { src: '/images/patient-banner-book.jpg', alt: 'Doctor Consultation Desk', span: 'normal' as const },
  { src: '/images/patient-footer-interior.jpg', alt: 'Calm Clinic Hallways', span: 'normal' as const },
  { src: '/images/patient-site-banner.jpg', alt: 'Chandanathope Medical Campus', span: 'wide' as const },
]

export default function PatientAbout() {
  usePageTitle('About Us', 'Alverstone Medcity')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <PatientSiteLayout>
      {/* 1. Master Hero Section */}
      <section
        className="ps-page-hero ps-about-hero"
        data-reveal="hero"
        style={{
          backgroundImage: "url('/images/patient-care-banner.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          position: 'relative',
          padding: '5.5rem 1.5rem 4rem',
        }}
      >
        <div className="ps-about-hero-orb" aria-hidden />

        <div className="ps-page-hero-inner" style={{ position: 'relative', zIndex: 3, maxWidth: '1160px', margin: '0 auto' }}>
          {/* Eyebrow Chip */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(8px)',
                color: '#fed7aa',
                fontSize: '0.76rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                border: '1px solid rgba(254, 215, 170, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <IconBuilding size={14} />
              Alverstone Medcity • Chandanathope, Kollam
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 'clamp(2.1rem, 4.2vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              margin: '0 0 1.25rem',
              maxWidth: '820px',
              textShadow: '0 2px 14px rgba(0, 0, 0, 0.4)',
            }}
          >
            Pioneering Excellence in Compassionate Healthcare
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.02rem, 1.6vw, 1.2rem)',
              lineHeight: 1.65,
              color: 'rgba(255, 255, 255, 0.92)',
              maxWidth: '680px',
              margin: '0 0 2rem',
              fontWeight: 450,
            }}
          >
            Where board-certified clinical mastery, zero-wait token pacing, and modern diagnostics unite under one serene campus in Kollam. No chaotic lobbies, no fragmented care.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: 0 }}>
            <Link
              to="/patient/book"
              className="ps-btn"
              style={{
                padding: '0.85rem 1.75rem',
                fontSize: '0.96rem',
                fontWeight: 750,
                boxShadow: '0 10px 24px rgba(139, 30, 43, 0.45)',
              }}
            >
              Schedule an Appointment &rarr;
            </Link>

            <a
              href="#who-we-are"
              className="ps-btn-ghost"
              style={{
                padding: '0.82rem 1.4rem',
                fontSize: '0.94rem',
                fontWeight: 650,
              }}
            >
              Our Story &amp; Campus
            </a>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(10px)',
                padding: '0.55rem 1rem',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: '0.84rem',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.35)',
                  display: 'inline-block',
                }}
              />
              <span style={{ color: '#86efac', display: 'inline-flex' }}>
                <IconPhone size={14} />
              </span>
              <span>24/7 Helpline: <strong>0474 271 2233</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Redesigned "Who We Are" Section (Directly replacing the user's screenshot) */}
      <section id="who-we-are" className="ps-section" style={{ padding: '4.5rem 1.5rem 3.5rem', background: '#ffffff' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div className="ps-about-intro-grid" style={{ alignItems: 'stretch', gap: '2.5rem' }}>
            {/* Left Column: Narrative & Key Pillars */}
            <div data-reveal style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: '#8b1e2b',
                    background: '#fff1f2',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    border: '1px solid #fecdd3',
                  }}
                >
                  Who We Are &amp; Our Mission
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: '#0f172a',
                  margin: '0 0 1.25rem',
                  lineHeight: 1.2,
                }}
              >
                Care Designed Around Your Time, Family &amp; Well-Being
              </h2>

              <p style={{ fontSize: '1.05rem', lineHeight: 1.75, color: '#334155', margin: '0 0 1.15rem' }}>
                We are a multi-specialty healthcare institution serving families, working professionals, and seniors across Kollam and Chandanathope. We built Alverstone Medcity with a decisive goal: to eliminate unmanaged queues, chaotic lobbies, and fragmented clinic trips.
              </p>

              <p style={{ fontSize: '1rem', lineHeight: 1.7, color: '#64748b', margin: '0 0 2rem' }}>
                Book your preferred specialist by name, arrive at your scheduled consultation slot, and proceed through outpatient care, sample collection, and prescription dispensing under one unified roof.
              </p>

              {/* 3 Value Advantage Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    padding: '1rem 1.15rem',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: '#fff1f2',
                      color: '#8b1e2b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconStethoscope size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.96rem', fontWeight: 750, color: '#0f172a' }}>
                      Board-Certified Senior Consultants
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                      Direct appointments with verified MD / MS faculty across Cardiology, General Medicine, Pediatrics, Orthopedics, and Dermatology.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    padding: '1rem 1.15rem',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: '#f0fdf4',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconQueue size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.96rem', fontWeight: 750, color: '#0f172a' }}>
                      Paced Zero-Wait Digital Token System
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                      Live TV calling screens and digital queue counters ensure you walk straight into your doctor&rsquo;s chamber without losing your day.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    padding: '1rem 1.15rem',
                    borderRadius: '12px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: '#faf5ff',
                      color: '#7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconPill size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.96rem', fontWeight: 750, color: '#0f172a' }}>
                      On-Campus Pharmacy &amp; Diagnostics Lab
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                      Collect medicines and complete blood work immediately after your consultation. Digital reports sync automatically to your patient portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Upgraded Executive Campus & Visit Card */}
            <aside
              className="ps-about-aside"
              data-reveal
              style={{
                ['--d' as string]: '120ms',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="ps-about-aside-label">VISIT OUR CAMPUS</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#86efac',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 750,
                      textTransform: 'uppercase',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                    Active 24/7
                  </span>
                </div>

                <p className="ps-about-aside-place" style={{ fontSize: '1.35rem', marginBottom: '0.35rem' }}>
                  {CLINIC.name}
                </p>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 1.25rem', lineHeight: 1.45 }}>
                  {CLINIC.address}
                </p>

                {/* Hours Table */}
                <dl className="ps-about-aside-dl">
                  <div>
                    <dt style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: '#fca5a5', display: 'inline-flex' }}><IconStethoscope size={14} /></span>
                      <span>Outpatient Clinics (OPD)</span>
                    </dt>
                    <dd style={{ color: '#fed7aa' }}>08:00 AM &ndash; 09:00 PM</dd>
                  </div>
                  <div>
                    <dt style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: '#fca5a5', display: 'inline-flex' }}><IconPill size={14} /></span>
                      <span>24/7 Clinical Pharmacy</span>
                    </dt>
                    <dd style={{ color: '#86efac' }}>Open 24 &times; 7</dd>
                  </div>
                  <div>
                    <dt style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: '#fca5a5', display: 'inline-flex' }}><IconFlask size={14} /></span>
                      <span>Pathology &amp; Diagnostics</span>
                    </dt>
                    <dd style={{ color: '#86efac' }}>Open 24 &times; 7</dd>
                  </div>
                  <div>
                    <dt style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ color: '#fca5a5', display: 'inline-flex' }}><IconShield size={14} /></span>
                      <span>Reception &amp; Emergency</span>
                    </dt>
                    <dd style={{ color: '#86efac' }}>Always Staffed</dd>
                  </div>
                </dl>
              </div>

              <div>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '0.95rem 1rem',
                    marginBottom: '1.25rem',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <p style={{ margin: '0 0 0.35rem', fontSize: '0.78rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 700 }}>
                    Direct Telephone Helpline
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>0474 271 2233</span>
                    <a
                      href="tel:+914742712233"
                      style={{
                        background: '#8b1e2b',
                        color: '#ffffff',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 750,
                        textDecoration: 'none',
                      }}
                    >
                      Call Now
                    </a>
                  </div>
                </div>

                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  Get Directions in Google Maps &rarr;
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 3. Core Values & Care Philosophy */}
      <section style={{ padding: '4rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#8b1e2b',
                background: '#fff1f2',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                border: '1px solid #fecdd3',
              }}
            >
              Our Core Philosophy
            </span>
            <h2
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 'clamp(1.9rem, 3vw, 2.5rem)',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0.75rem 0 0.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Four Pillars of Patient-Centered Medicine
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
              Every clinical protocol, consultation room design, and staff interaction is guided by our fundamental commitments to your health.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '1.75rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                borderTop: '4px solid #8b1e2b',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#fff1f2',
                  color: '#8b1e2b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <IconHeart size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                Compassionate Empathy
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Listening without haste. Our doctors dedicate time to comprehend your complete medical story, answering questions clearly so you leave reassured.
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: '1.75rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                borderTop: '4px solid #0284c7',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#f0f9ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <IconClock size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                Zero-Wait Respect for Time
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                We believe your time is irreplaceable. Synchronized scheduling and live lobby token alerts allow you to plan your day with confidence.
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: '1.75rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                borderTop: '4px solid #0d9488',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#f0fdfa',
                  color: '#0d9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <IconFlask size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                Calibrated Clinical Precision
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Modern automated hematology and biochemistry analyzers deliver rapid, validated pathology reports directly to your physician’s console.
              </p>
            </div>

            <div
              style={{
                background: '#ffffff',
                padding: '1.75rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                borderTop: '4px solid #7c3aed',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#faf5ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <IconShield size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                Radical Price Transparency
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                No hidden clinic fees, no surprise diagnostic charges. Transparent consultation rates, genuine formulary medication billing, and honest care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Story (From a Promise to a Campus - 4 Chapters) */}
      <section className="ps-about-story" id="our-story" style={{ padding: '4.5rem 1.5rem' }}>
        <div className="ps-section-head ps-about-story-head" data-reveal style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
          <p className="ps-kicker ps-kicker-dark" style={{ color: '#8b1e2b' }}>Our Journey</p>
          <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(2rem, 3vw, 2.6rem)' }}>
            From a Promise to a Complete Campus
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            How Alverstone Medcity grew into a healthcare destination designed for patients — not waiting queues.
          </p>
        </div>

        <div className="ps-about-story-list">
          {CLINIC.aboutStory.map((chapter, i) => {
            const reverse = i % 2 === 1
            return (
              <article
                key={chapter.step}
                className={`ps-about-story-row${reverse ? ' is-reverse' : ''}`}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '1.25rem',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div
                  className="ps-about-story-media"
                  data-reveal={reverse ? 'right' : 'left'}
                  style={{
                    backgroundImage: `url('${chapter.image}')`,
                    borderRadius: '14px',
                    minHeight: '300px',
                  }}
                  role="img"
                  aria-label={chapter.imageAlt}
                >
                  <span
                    className="ps-about-story-step"
                    style={{
                      background: 'rgba(139, 30, 43, 0.85)',
                      padding: '0.2rem 0.8rem',
                      borderRadius: '8px',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                    }}
                  >
                    {chapter.step}
                  </span>
                </div>
                <div
                  className="ps-about-story-copy"
                  data-reveal={reverse ? 'left' : 'right'}
                  style={{ ['--d' as string]: '100ms', padding: '1rem 1.5rem' }}
                >
                  <div style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#8b1e2b',
                        background: '#fff1f2',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '999px',
                      }}
                    >
                      Chapter {chapter.step}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.65rem', color: '#0f172a', margin: '0.3rem 0 0.85rem' }}>
                    {chapter.title}
                  </h3>
                  <p style={{ color: '#475569', fontSize: '1.02rem', lineHeight: 1.7, margin: 0 }}>
                    {chapter.text}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* 5. Medical Director's Statement / Clinical Commitment */}
      <section style={{ padding: '3.5rem 1.5rem', background: 'linear-gradient(135deg, #2a0b12 0%, #50101b 50%, #6e131e 100%)', color: '#ffffff' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#fed7aa',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <IconQuote size={28} />
          </div>

          <blockquote style={{ margin: '0 0 2rem', padding: 0 }}>
            <p
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 'clamp(1.25rem, 2.3vw, 1.75rem)',
                lineHeight: 1.55,
                fontWeight: 500,
                color: '#ffffff',
                fontStyle: 'italic',
                maxWidth: '820px',
                margin: '0 auto',
              }}
            >
              &ldquo;Healthcare should restore peace of mind, not add to daily anxiety. At Alverstone Medcity, every physician, pharmacist, and nurse is dedicated to giving you unhurried, evidence-based care in a calm, modern environment.&rdquo;
            </p>
          </blockquote>

          <div>
            <strong style={{ display: 'block', fontSize: '1.15rem', color: '#fed7aa', fontWeight: 800 }}>
              Dr. K. R. Nair, MD, FRCP
            </strong>
            <span style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Chief Medical Director • Alverstone Medcity, Chandanathope
            </span>
          </div>
        </div>
      </section>

      {/* 6. On-Campus Spaces Gallery */}
      <section className="ps-about-gallery" style={{ background: '#f8fafc', padding: '4rem 1.5rem' }}>
        <div className="ps-section-head" data-reveal style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          <p className="ps-kicker ps-kicker-dark" style={{ color: '#8b1e2b' }}>On Campus</p>
          <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(2rem, 3vw, 2.6rem)' }}>
            Spaces Built for Calm &amp; Restorative Care
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Ergonomic consultation suites, digital lobby calling displays, automated diagnostics, and 24/7 pharmacy.
          </p>
        </div>
        <div className="ps-about-gallery-grid">
          {GALLERY.map((shot, i) => (
            <figure
              key={shot.src}
              className={`ps-about-gallery-item ps-about-gallery-item--${shot.span}`}
              data-reveal
              style={{ ['--d' as string]: `${i * 80}ms`, borderRadius: '16px', overflow: 'hidden' }}
            >
              <ExpandableImage
                src={shot.src}
                alt={shot.alt}
                caption={`Alverstone Medcity - ${shot.alt}`}
                loading="lazy"
              />
              <figcaption>{shot.alt}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 7. Why Patients Choose Us Feature Cards */}
      <section className="ps-section ps-about-features" style={{ padding: '4rem 1.5rem', background: '#ffffff' }}>
        <div className="ps-section-head" data-reveal style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          <p className="ps-kicker ps-kicker-dark" style={{ color: '#8b1e2b' }}>Why Choose Us</p>
          <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(2rem, 3vw, 2.6rem)' }}>
            Excellence Built Around Your Schedule
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            From booking your consultation to retrieving certified lab results online &mdash; every step is transparent and prompt.
          </p>
        </div>

        <div className="ps-about-feature-grid">
          {CLINIC.aboutHighlights.map((item, i) => {
            const Icon = iconMap[item.icon]
            return (
              <article
                key={item.title}
                className={`ps-about-feature ps-about-feature--${(i % 3) + 1}`}
                data-reveal
                style={{
                  ['--d' as string]: `${i * 70}ms`,
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                }}
              >
                <span
                  className="ps-about-feature-ico"
                  aria-hidden
                  style={{
                    background: '#fff1f2',
                    color: '#8b1e2b',
                    borderColor: '#fecdd3',
                  }}
                >
                  <Icon size={22} />
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 750, color: '#0f172a' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>{item.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* 8. Patient Voices & Testimonials */}
      <section className="ps-about-voices" style={{ padding: '4rem 1.5rem', background: '#f8fafc' }}>
        <div className="ps-section-head" data-reveal style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          <p className="ps-kicker ps-kicker-dark" style={{ color: '#8b1e2b' }}>Patient Experiences</p>
          <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(2rem, 3vw, 2.6rem)' }}>
            Real Visits, Calmer Days &mdash; In Their Words
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Trusted by thousands of families across Kollam and Chandanathope.
          </p>
        </div>
        <div className="ps-about-voice-grid" style={{ maxWidth: '1160px', margin: '0 auto' }}>
          {CLINIC.testimonials.map((t, i) => (
            <blockquote
              key={t.name}
              className="ps-about-voice"
              data-reveal
              style={{
                ['--d' as string]: `${i * 100}ms`,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.2rem', color: '#eab308', marginBottom: '0.75rem' }}>
                <IconStar size={16} />
                <IconStar size={16} />
                <IconStar size={16} />
                <IconStar size={16} />
                <IconStar size={16} />
              </div>
              <p style={{ fontSize: '0.96rem', lineHeight: 1.65, color: '#334155', fontStyle: 'italic', margin: '0 0 1.25rem' }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                <strong style={{ color: '#8b1e2b', fontSize: '0.94rem' }}>{t.name}</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>{t.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* 9. Interactive FAQ Accordion */}
      <section className="ps-about-faq" style={{ padding: '4.5rem 1.5rem', background: '#ffffff' }}>
        <div className="ps-about-faq-inner" style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div className="ps-about-faq-intro" data-reveal>
            <p className="ps-kicker ps-kicker-dark" style={{ color: '#8b1e2b' }}>FAQ</p>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(2rem, 3vw, 2.5rem)', color: '#0f172a' }}>
              Common Questions About Care &amp; Visits
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.65, margin: '0 0 1.5rem' }}>
              Booking appointments, 24/7 hours, digital lab report delivery, and pharmacy services &mdash; answered clearly.
            </p>
            <Link to="/patient/register" className="ps-btn" style={{ padding: '0.75rem 1.4rem' }}>
              Create Patient Account &rarr;
            </Link>
          </div>

          <div className="ps-about-faq-list" data-reveal style={{ ['--d' as string]: '100ms' }}>
            {CLINIC.faqs.map((item, i) => {
              const open = openFaq === i
              return (
                <div
                  key={item.q}
                  className={`ps-about-faq-item${open ? ' is-open' : ''}`}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    marginBottom: '0.75rem',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    className="ps-about-faq-q"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : i)}
                    style={{
                      padding: '1.1rem 1.25rem',
                      background: open ? '#f8fafc' : '#ffffff',
                      fontWeight: 700,
                      color: open ? '#8b1e2b' : '#0f172a',
                    }}
                  >
                    <span>{item.q}</span>
                    <IconChevronDown size={20} className={open ? 'rotate-180' : ''} />
                  </button>
                  <div
                    className="ps-about-faq-a"
                    hidden={!open}
                    style={{ padding: '1rem 1.25rem', background: '#ffffff', color: '#475569', lineHeight: 1.7 }}
                  >
                    <p style={{ margin: 0 }}>{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 10. Master Bottom Call to Action */}
      <section
        style={{
          padding: '4rem 1.5rem 5rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <div
          data-reveal
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            borderRadius: '24px',
            background:
              'radial-gradient(circle at 100% 0%, rgba(225, 29, 72, 0.3), transparent 50%), radial-gradient(circle at 0% 100%, rgba(254, 215, 170, 0.16), transparent 45%), linear-gradient(135deg, #1c0910 0%, #2f0d19 50%, #4a1221 100%)',
            color: '#ffffff',
            border: '1px solid rgba(254, 205, 211, 0.22)',
            boxShadow: '0 24px 50px rgba(28, 9, 16, 0.28)',
            padding: 'clamp(2rem, 4vw, 3.25rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Left Column: Heading, Perks & Actions */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(8px)',
                  color: '#fed7aa',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(254, 215, 170, 0.3)',
                }}
              >
                Experience Alverstone Medcity • Chandanathope
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 'clamp(1.9rem, 3.2vw, 2.7rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#ffffff',
                margin: '0 0 1rem',
                letterSpacing: '-0.02em',
              }}
            >
              Ready for Healthcare Without Waiting?
            </h2>

            <p
              style={{
                fontSize: '1.02rem',
                lineHeight: 1.65,
                color: 'rgba(255, 255, 255, 0.88)',
                margin: '0 0 1.5rem',
                maxWidth: '520px',
              }}
            >
              Book your consultation with our board-certified specialists or walk in directly to our 24/7 campus in Chandanathope, Kollam.
            </p>

            {/* Feature Perks */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem 1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', color: '#fed7aa', fontWeight: 650 }}>
                <span style={{ color: '#86efac' }}>&#10003;</span>
                <span>Zero Unmanaged Waiting</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', color: '#fed7aa', fontWeight: 650 }}>
                <span style={{ color: '#86efac' }}>&#10003;</span>
                <span>Verified MD / MS Specialists</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', color: '#fed7aa', fontWeight: 650 }}>
                <span style={{ color: '#86efac' }}>&#10003;</span>
                <span>24/7 Pharmacy &amp; Lab On-Campus</span>
              </div>
            </div>

            {/* High Contrast Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <Link
                to="/patient/book"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.65rem',
                  borderRadius: '12px',
                  background: '#fed7aa',
                  color: '#6e131e',
                  fontWeight: 800,
                  fontSize: '0.94rem',
                  textDecoration: 'none',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
                  transition: 'transform 0.15s, background 0.15s',
                }}
              >
                <span>Book an Appointment</span>
                <span style={{ fontSize: '1.1rem' }}>&rarr;</span>
              </Link>

              <a
                href="tel:+914742712233"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.82rem 1.4rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1.5px solid rgba(255, 255, 255, 0.35)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span style={{ color: '#86efac', display: 'inline-flex' }}><IconPhone size={15} /></span>
                <span>Call 0474 271 2233</span>
              </a>
            </div>
          </div>

          {/* Right Column: Executive Frosted Info Plate */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              padding: '1.75rem',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#8b1e2b',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconBuilding size={16} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                  Alverstone Medcity
                </span>
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(34, 197, 94, 0.22)',
                  color: '#86efac',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 750,
                  textTransform: 'uppercase',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                Open 24/7
              </span>
            </div>

            <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
              Central Medical Campus, Chandanathope, Kollam, Kerala 691014
            </p>

            {/* Quick Access Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.84rem',
                }}
              >
                <span style={{ color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#fed7aa', display: 'inline-flex' }}><IconStethoscope size={14} /></span>
                  OPD Specialty Clinics
                </span>
                <strong style={{ color: '#fed7aa' }}>08:00 AM &ndash; 09:00 PM</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.84rem',
                }}
              >
                <span style={{ color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#86efac', display: 'inline-flex' }}><IconPill size={14} /></span>
                  Clinical Pharmacy &amp; Lab
                </span>
                <strong style={{ color: '#86efac' }}>24 &times; 7 Always Open</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.84rem',
                }}
              >
                <span style={{ color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#93c5fd', display: 'inline-flex' }}><IconShield size={14} /></span>
                  Emergency &amp; Helpdesk
                </span>
                <strong style={{ color: '#93c5fd' }}>Fully Staffed</strong>
              </div>
            </div>

            <Link
              to="/doctors"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <span>Explore Our Doctors &amp; Specialists</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </PatientSiteLayout>
  )
}
