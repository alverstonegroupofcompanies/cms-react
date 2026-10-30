import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../motion/Reveal'
import SplitText from '../motion/SplitText'
import AnimatedCounter from '../motion/AnimatedCounter'
import './trusted-doctors-arc.css'

export interface TrustedDoctor {
  id: string
  name: string
  degree: string
  department: string
  experienceYears: number
  experience: string
  image: string
  rating: number
  reviewsCount: number
  days: string
  room: string
  badge: string
  bio: string
  specializations: string[]
}

export const TRUSTED_DOCTORS: TrustedDoctor[] = [
  {
    id: 'doc-sharma',
    name: 'Dr. Sarah Sharma',
    degree: 'MBBS, MD (General Medicine)',
    department: 'General & Internal Medicine',
    experienceYears: 14,
    experience: '14+ Years Exp',
    image: '/images/doctors/doc-sharma-general.jpg',
    rating: 4.9,
    reviewsCount: 420,
    days: 'Mon – Sat · 09:00 AM – 03:00 PM',
    room: 'OPD Suite 102',
    badge: 'Senior Physician',
    bio: 'Compassionate adult primary care with a focus on preventive wellness, chronic lifestyle care, and holistic treatment.',
    specializations: ['Preventive Health', 'Diabetes Care', 'Hypertension', 'Fever Clinic'],
  },
  {
    id: 'doc-priya',
    name: 'Dr. Priya Sharma',
    degree: 'MD, DM (Cardiology), FACC',
    department: 'Cardiology & Heart Care',
    experienceYears: 12,
    experience: '12+ Years Exp',
    image: '/images/doctors/doc-priya-cardiology.jpg',
    rating: 5.0,
    reviewsCount: 380,
    days: 'Mon, Wed, Fri · 10:00 AM – 02:00 PM',
    room: 'Cardio Suite 204',
    badge: 'Cardiologist',
    bio: 'Interventional cardiology specialist dedicated to non-invasive cardiac diagnostics, ECG analysis, and heart longevity.',
    specializations: ['Echocardiography', 'Heart Longevity', 'Arrhythmia', 'Cardiac Wellness'],
  },
  {
    id: 'doc-rajesh',
    name: 'Dr. Rajesh Menon',
    degree: 'MBBS, MD (Internal Medicine)',
    department: 'Internal Medicine & Geriatrics',
    experienceYears: 16,
    experience: '16+ Years Exp',
    image: '/images/doctors/doc-rajesh-internal.jpg',
    rating: 4.9,
    reviewsCount: 510,
    days: 'Tue, Thu, Sat · 09:30 AM – 03:30 PM',
    room: 'OPD Suite 105',
    badge: 'Chief Diagnostician',
    bio: 'Over 16 years diagnosing complex multi-system disorders, endocrine imbalances, and senior patient well-being.',
    specializations: ['Geriatric Care', 'Thyroid Health', 'Metabolic Disorders', 'Infectious Diseases'],
  },
  {
    id: 'doc-meera',
    name: 'Dr. Meera Krishnan',
    degree: 'MS (Orthopedics), MCh (Joints)',
    department: 'Orthopedics & Joint Care',
    experienceYears: 10,
    experience: '10+ Years Exp',
    image: '/images/doctors/doc-meera-ortho.jpg',
    rating: 4.8,
    reviewsCount: 290,
    days: 'Mon, Wed, Thu · 11:00 AM – 05:00 PM',
    room: 'Ortho Suite 301',
    badge: 'Orthopedic Surgeon',
    bio: 'Restoring active, pain-free mobility through minimally invasive joint arthroscopy and personalized bone rehabilitation.',
    specializations: ['Joint Mobility', 'Sports Injury', 'Spine Rehabilitation', 'Fracture Healing'],
  },
  {
    id: 'doc-david',
    name: 'Dr. David Chen',
    degree: 'MD, DM (Neurology)',
    department: 'Neurology & Neurosciences',
    experienceYears: 13,
    experience: '13+ Years Exp',
    image: '/images/doctors/doc-david-neuro.jpg',
    rating: 4.9,
    reviewsCount: 340,
    days: 'Mon, Tue, Thu · 10:00 AM – 04:00 PM',
    room: 'Neuro Suite 210',
    badge: 'Consultant Neurologist',
    bio: 'Comprehensive neurological assessment utilizing modern EEG, EMG, headache management, and stroke prevention.',
    specializations: ['Migraine Solutions', 'Stroke Prevention', 'Epilepsy Clinic', 'Neuropathy'],
  },
  {
    id: 'doc-jenkins',
    name: 'Dr. Sarah Jenkins',
    degree: 'MBBS, DNB, FAAP (Pediatrics)',
    department: 'Pediatrics & Child Wellness',
    experienceYears: 11,
    experience: '11+ Years Exp',
    image: '/images/doctors/doc-jenkins-pediatrics.jpg',
    rating: 5.0,
    reviewsCount: 460,
    days: 'Mon – Fri · 09:00 AM – 02:00 PM',
    room: 'Pediatric Wing 108',
    badge: 'Chief Pediatrician',
    bio: 'Gentle, friendly child specialist fostering a reassuring environment for infants, children, and their parents.',
    specializations: ['Newborn Screening', 'Child Vaccinations', 'Growth Milestones', 'Pediatric Asthma'],
  },
  {
    id: 'doc-bennett',
    name: 'Dr. A. Bennett',
    degree: 'MD (Dermatology & Venereology)',
    department: 'Dermatology & Aesthetics',
    experienceYears: 15,
    experience: '15+ Years Exp',
    image: '/images/doctors/doc-bennett-derma.jpg',
    rating: 4.9,
    reviewsCount: 395,
    days: 'Tue, Wed, Fri · 01:00 PM – 06:00 PM',
    room: 'Derma Suite 202',
    badge: 'Senior Dermatologist',
    bio: 'Advanced clinical dermatology resolving chronic allergies, eczema, acne, and providing evidence-based skin therapies.',
    specializations: ['Clinical Skincare', 'Eczema & Psoriasis', 'Laser Therapy', 'Allergy Diagnostics'],
  },
]

interface TrustedDoctorsArcProps {
  signedIn?: boolean
}

export default function TrustedDoctorsArc({ signedIn = false }: TrustedDoctorsArcProps) {
  // Center card initially selected (index 3 out of 7)
  const [activeIndex, setActiveIndex] = useState<number>(3)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const bookBaseUrl = signedIn ? '/patient/book' : '/patient/login?next=%2Fpatient%2Fbook'
  const arcStageRef = useRef<HTMLDivElement>(null)

  const activeDoc = TRUSTED_DOCTORS[activeIndex]

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : TRUSTED_DOCTORS.length - 1))
  }, [])

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < TRUSTED_DOCTORS.length - 1 ? prev + 1 : 0))
  }, [])

  // Keyboard navigation when stage is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.closest('.tda-section')) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          handlePrev()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          handleNext()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext])

  return (
    <section className="tda-section" aria-label="Our Trusted Doctors and Specialists">
      <div className="tda-container">
        {/* ==================================================================
            1. TOP HEADER (MATCHING USER SCREENSHOT ARCHITECTURE)
            ================================================================== */}
        <div className="tda-header">
          <SplitText as="h2" className="tda-title">
            Our Trusted Doctors
          </SplitText>

          <Reveal direction="up" distance={14} delay={0.12} duration={0.75}>
            <p className="tda-subtitle">
              Experienced medical specialists across all major clinical disciplines — dedicated to clear diagnosis,
              unhurried consultations, and patient-first care.
            </p>
          </Reveal>

          <Reveal direction="up" distance={16} delay={0.2} duration={0.75} className="tda-cta-wrap">
            <Link to={bookBaseUrl} className="tda-pill-btn">
              <span>Book a Consultation</span>
              <span className="tda-pill-arrow" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </Reveal>
        </div>

        {/* ==================================================================
            2. THE 3D CURVED PANORAMIC ARC GALLERY
            ================================================================== */}
        <div className="tda-arc-stage-wrap" data-reveal style={{ ['--d' as string]: '100ms' }}>
          {/* Subtle vignette fade masks on left and right for seamless edge blend */}
          <div className="tda-edge-fade tda-edge-fade--left" aria-hidden="true" />
          <div className="tda-edge-fade tda-edge-fade--right" aria-hidden="true" />

          {/* Navigation Arrows */}
          <button
            type="button"
            className="tda-nav-btn tda-nav-btn--prev"
            onClick={handlePrev}
            aria-label="View previous doctor"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            className="tda-nav-btn tda-nav-btn--next"
            onClick={handleNext}
            aria-label="View next doctor"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* The 3D Arc Track */}
          <div className="tda-arc-stage" ref={arcStageRef} role="region" aria-roledescription="carousel">
            <div className="tda-cards-row">
              {TRUSTED_DOCTORS.map((doc, idx) => {
                const offset = idx - activeIndex
                const absOffset = Math.abs(offset)
                const isActive = idx === activeIndex
                const isHovered = idx === hoveredIndex

                // 3D Arc Curvature calculation
                // Left cards rotate outward clockwise (+rotateY), right cards rotate counter-clockwise (-rotateY)
                const rotateY = -offset * 7.5
                // Outer cards are closer to camera in a concave cylinder (taller at sides)
                const translateZ = absOffset * 22
                // Parabolic curve: center is slightly lower or higher to match screenshot's inverted-U top
                const translateY = absOffset * 4

                return (
                  <article
                    key={doc.id}
                    className={`tda-card ${isActive ? 'tda-card--active' : ''} ${
                      isHovered ? 'tda-card--hovered' : ''
                    }`}
                    style={
                      {
                        '--offset': offset,
                        '--abs-offset': absOffset,
                        '--rotate-y': `${rotateY}deg`,
                        '--translate-z': `${translateZ}px`,
                        '--translate-y': `${translateY}px`,
                        zIndex: 20 - absOffset,
                      } as React.CSSProperties
                    }
                    onClick={() => setActiveIndex(idx)}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select ${doc.name}, ${doc.department}, ${doc.experience}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setActiveIndex(idx)
                      }
                    }}
                  >
                    <div className="tda-card-inner">
                      {/* Portrait Image */}
                      <div className="tda-card-photo-box">
                        <img
                          src={doc.image}
                          alt={`${doc.name} - ${doc.department}`}
                          className="tda-card-photo"
                          loading="lazy"
                        />
                      </div>

                      {/* Top Experience Badge Pill */}
                      <div className="tda-card-top-pill">
                        <span className="tda-pill-icon">★</span>
                        <span className="tda-pill-exp">{doc.experience}</span>
                      </div>

                      {/* Bottom Details Dock - Clean clinical typography */}
                      <div className="tda-card-scrim">
                        <div className="tda-card-info">
                          <span className="tda-card-dept">{doc.department}</span>
                          <h3 className="tda-card-name">{doc.name}</h3>
                          <div className="tda-card-meta-row">
                            <span className="tda-card-degree">{doc.degree.split(',')[0]}</span>
                            <span className="tda-card-dot">•</span>
                            <span className="tda-card-exp-highlight">
                              <AnimatedCounter value={doc.experienceYears} suffix=" Yrs Practice" />
                            </span>
                          </div>
                        </div>

                        <div className="tda-card-hover-action" aria-hidden="true">
                          <span>View Profile &amp; Book</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          {/* Dots Indicator for Mobile & Easy Scanning */}
          <div className="tda-dots-row">
            {TRUSTED_DOCTORS.map((doc, idx) => (
              <button
                key={doc.id}
                type="button"
                className={`tda-dot ${idx === activeIndex ? 'tda-dot--active' : ''}`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Select ${doc.name}`}
              />
            ))}
          </div>
        </div>

        {/* ==================================================================
            3. ACTIVE DOCTOR CLINICAL HIGHLIGHT BANNER
            ================================================================== */}
        <div className="tda-spotlight-bar" aria-live="polite">
          <div className="tda-spotlight-left">
            <div className="tda-spotlight-avatar">
              <img src={activeDoc.image} alt={activeDoc.name} />
            </div>
            <div className="tda-spotlight-meta">
              <div className="tda-spotlight-title-row">
                <h4 className="tda-spotlight-name">{activeDoc.name}</h4>
                <span className="tda-spotlight-badge">{activeDoc.badge}</span>
                <span className="tda-spotlight-rating">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>
                    <AnimatedCounter value={activeDoc.rating} decimals={1} duration={1.2} />
                  </span>
                  <small>
                    <AnimatedCounter value={activeDoc.reviewsCount} prefix="(" suffix=" patients)" duration={1.4} />
                  </small>
                </span>
              </div>
              <p className="tda-spotlight-dept">
                <strong>{activeDoc.department}</strong> · {activeDoc.degree} · <span className="tda-exp-accent"><AnimatedCounter value={activeDoc.experienceYears} suffix="+ Years Exp" duration={1.2} /></span>
              </p>
              <div className="tda-spotlight-schedule">
                <span className="tda-schedule-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {activeDoc.days}
                </span>
                <span className="tda-schedule-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
                  </svg>
                  {activeDoc.room}
                </span>
              </div>
            </div>
          </div>

          <div className="tda-spotlight-action">
            <Link
              to={`${bookBaseUrl}?doctor=${encodeURIComponent(activeDoc.name)}&dept=${encodeURIComponent(
                activeDoc.department
              )}`}
              className="tda-spotlight-book-btn"
            >
              <span>Book with {activeDoc.name.split(' ')[1] || activeDoc.name}</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ==================================================================
            4. THREE BOTTOM PILLARS (PREMIUM CLINICAL CARD DESIGN)
            ================================================================== */}
        <Reveal direction="up" distance={24} stagger={0.08} className="tda-pillars-grid">
          <div className="tda-pillar-card">
            <div className="tda-pillar-card-head">
              <div className="tda-pillar-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <span className="tda-pillar-kicker">Verified Faculty</span>
            </div>
            <h4 className="tda-pillar-title">Board-Certified Specialists</h4>
            <p className="tda-pillar-text">
              Every doctor is thoroughly vetted with postgraduate MD/MS accreditations, fellowships, and verified clinical hospital practice.
            </p>
            <div className="tda-pillar-footer">
              <span className="tda-pillar-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Postgraduate MD / MS Doctors
              </span>
            </div>
          </div>

          <div className="tda-pillar-card">
            <div className="tda-pillar-card-head">
              <div className="tda-pillar-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M9 14l2 2 4-4" />
                </svg>
              </div>
              <span className="tda-pillar-kicker">Zero Delay</span>
            </div>
            <h4 className="tda-pillar-title">Guaranteed Slot Scheduling</h4>
            <p className="tda-pillar-text">
              Lock in your exact consultation time online with real-time digital token tracking. Say goodbye to chaotic, overcrowded waiting rooms.
            </p>
            <div className="tda-pillar-footer">
              <span className="tda-pillar-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Live Token Queue Tracking
              </span>
            </div>
          </div>

          <div className="tda-pillar-card">
            <div className="tda-pillar-card-head">
              <div className="tda-pillar-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
                  <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
                </svg>
              </div>
              <span className="tda-pillar-kicker">All-In-One Campus</span>
            </div>
            <h4 className="tda-pillar-title">Unified Campus Care</h4>
            <p className="tda-pillar-text">
              Consultation suites, NABL pathology diagnostics, and our 24/7 clinical pharmacy operate under one seamless, modern roof.
            </p>
            <div className="tda-pillar-footer">
              <span className="tda-pillar-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                OPD, Lab & Pharmacy Under 1 Roof
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
