import { useState } from 'react'
import { Link } from 'react-router-dom'
import PatientSiteLayout from '../../components/PatientSiteLayout'
import PatientEnquiryForm from '../../components/PatientEnquiryForm'
import { useAuth } from '../../context/AuthContext'
import { usePageTitle } from '../../hooks/usePageTitle'
import BuildingToReceptionWalkthrough from '../../components/patient/BuildingToReceptionWalkthrough'
import TrustedDoctorsArc from '../../components/patient/TrustedDoctorsArc'
import ElderCareSection from '../../components/patient/ElderCareSection'
import SpecialtyDisciplinesGrid from '../../components/patient/SpecialtyDisciplinesGrid'
import { CLINIC } from '../../config/clinic'
import {
  IconCalendar,
  IconQueue,
  IconFlask,
  IconPill,
  IconStethoscope,
  IconPhone,
  IconCheck,
  IconStar,
  IconClock,
  IconBuilding,
  IconHeart,
  IconDroplet,
} from '../../components/Icons'

const CORE_SERVICES = [
  {
    title: 'Book an Appointment',
    tag: 'Instant Slot',
    text: 'Choose your specialist, pick an exact time slot, and walk in with zero waiting room guesswork.',
    signedInTo: '/patient/book',
    guestTo: '/patient/login?next=%2Fpatient%2Fbook',
    icon: IconCalendar,
    image: '/images/patient-banner-book.jpg',
  },
  {
    title: 'Live Queue & Token Status',
    tag: 'Real-time Tracker',
    text: 'Check live consultation queues and expected wait times before leaving home or from our quiet lounge.',
    signedInTo: '/patient/dashboard',
    guestTo: '/patient/login?next=%2Fpatient%2Fdashboard',
    icon: IconQueue,
    image: '/images/service-live-queue.jpg',
  },
  {
    title: 'Diagnostic Lab Reports',
    tag: 'NABL Certified',
    text: 'Automated blood panels, lipid profiles, and biochemistry reports available digitally as soon as verified.',
    signedInTo: '/patient/lab-reports',
    guestTo: '/patient/login?next=%2Fpatient%2Flab-reports',
    icon: IconFlask,
    image: '/images/dept-lab-diagnostics.jpg',
  },
  {
    title: '24/7 Clinical Pharmacy',
    tag: 'Fast Dispensing',
    text: 'Fulfill prescriptions immediately post-consultation with verified genuine medicines and digital refill tracking.',
    signedInTo: '/patient/prescriptions',
    guestTo: '/patient/login?next=%2Fpatient%2Fprescriptions',
    icon: IconPill,
    image: '/images/service-pharmacy.jpg',
  },
] as const





export default function PatientLanding() {
  usePageTitle('Patient Care · Modern Multispecialty Healthcare', 'Patient')
  const { user } = useAuth()
  const signedIn = user?.role === 'patient'
  const bookVisitTo = signedIn ? '/patient/book' : '/patient/login?next=%2Fpatient%2Fbook'
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <PatientSiteLayout>
      <div className="ps-patient-page">
        {/* ==================================================================
            1. INTERACTIVE AUTO-TOUR HOME BANNER (BUILDING TO RECEPTION)
            Silky 60/120fps GPU scroll zoom from exterior facade into reception desk
            ================================================================== */}
        <BuildingToReceptionWalkthrough signedIn={signedIn} bookVisitTo={bookVisitTo} />

        {/* ==================================================================
            2. VALUE PROPOSITIONS RIBBON (DIRECTLY UNDER HERO)
            ================================================================== */}
        <section className="ps-values-ribbon">
          <div className="ps-values-grid">
            <div className="ps-value-card ps-value-card--blue" data-reveal style={{ ['--d' as string]: '0ms' }}>
              <div className="ps-value-icon ps-value-icon--blue">
                <IconClock size={22} />
              </div>
              <div className="ps-value-info">
                <h4>24/7 Walk-in & OP</h4>
                <p>Always open for acute care, outpatient visits, and emergencies.</p>
              </div>
            </div>

            <div className="ps-value-card ps-value-card--green" data-reveal style={{ ['--d' as string]: '80ms' }}>
              <div className="ps-value-icon ps-value-icon--green">
                <IconQueue size={22} />
              </div>
              <div className="ps-value-info">
                <h4>Zero Waiting Stress</h4>
                <p>Real-time slot reservation eliminates crowded waiting rooms.</p>
              </div>
            </div>

            <div className="ps-value-card ps-value-card--amber" data-reveal style={{ ['--d' as string]: '160ms' }}>
              <div className="ps-value-icon ps-value-icon--amber">
                <IconBuilding size={22} />
              </div>
              <div className="ps-value-info">
                <h4>Everything Under One Roof</h4>
                <p>Consultations, diagnostics, and 24/7 pharmacy on a single campus.</p>
              </div>
            </div>

            <div className="ps-value-card ps-value-card--rose" data-reveal style={{ ['--d' as string]: '240ms' }}>
              <div className="ps-value-icon ps-value-icon--rose">
                <IconHeart size={22} />
              </div>
              <div className="ps-value-info">
                <h4>Transparent & Fair Care</h4>
                <p>Honest consultation rates with zero hidden hospital markups.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. SPECIALIZED CLINICAL DEPARTMENTS - 8-TILE CHECKERBOARD GRID
            ================================================================== */}
        <SpecialtyDisciplinesGrid signedIn={signedIn} />

        {/* ==================================================================
            4. OUR TRUSTED DOCTORS & SPECIALISTS - 3D PANORAMIC ARC
            ================================================================== */}
        <TrustedDoctorsArc signedIn={signedIn} />

        {/* ==================================================================
            5. CORE PATIENT SERVICES - IMAGE-DRIVEN GLOW CARDS
            ================================================================== */}
        <section className="ps-services-wrapper" id="services">
          <div className="ps-section-header" data-reveal>
            <h2>
              Designed for Speed, <span className="ps-gradient-text">Comfort & Clarity</span>
            </h2>
            <p>
              Manage your entire healthcare journey seamlessly from any device without long phone calls or waiting room confusion.
            </p>
          </div>

          <div className="ps-services-cards-grid">
            {CORE_SERVICES.map((s, idx) => {
              const Icon = s.icon
              const targetUrl = signedIn ? s.signedInTo : s.guestTo
              return (
                <Link
                  key={s.title}
                  to={targetUrl}
                  className="ps-service-box"
                  data-reveal
                  style={{ ['--d' as string]: `${idx * 80}ms` }}
                >
                  <div className="ps-service-img-wrap">
                    <img src={s.image} alt={s.title} />
                    <span className="ps-service-tag-pill">{s.tag}</span>
                    <div className="ps-service-icon-floating">
                      <Icon size={22} />
                    </div>
                  </div>
                  <div className="ps-service-body">
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                    <span className="ps-service-action-link">
                      <span>Get started</span>
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ==================================================================
            6. CAMPUS & HOSPITAL EXPERIENCE SPLIT FEATURE
            ================================================================== */}
        <section className="ps-experience-section">
          <div className="ps-experience-grid">
            <div className="ps-experience-media-column" data-reveal="left">
              <div className="ps-exp-main-img">
                <img
                  src="/images/patient-site-banner.jpg"
                  alt="Alverstone Medcity Healthcare Campus Building in Kollam"
                />
              </div>
              <div className="ps-exp-floating-card">
                <div className="card-head">
                  <IconBuilding size={18} />
                  <span>Integrated Campus</span>
                </div>
                <p>
                  Pharmacy, pathology laboratory, and consultation suites all housed together in Chandanathope, Kollam.
                </p>
              </div>
            </div>

            <div className="ps-experience-copy-column" data-reveal="right">
              <h2>
                A Healthcare Experience <span className="ps-gradient-text">That Respects Your Time</span>
              </h2>
              <p>
                We believe medical visits should feel organized and reassuring, not stressful. Alverstone Medcity was founded
                to eliminate long waits and fragmented care through smart scheduling and campus integration.
              </p>

              <ul className="ps-exp-checklist">
                <li className="ps-exp-check-item">
                  <div className="ps-exp-check-icon">
                    <IconCheck size={18} />
                  </div>
                  <div className="ps-exp-check-text">
                    <strong>Smart Slot Scheduling</strong>
                    <span>Pick a slot that fits your day and walk in knowing your doctor is ready for you.</span>
                  </div>
                </li>

                <li className="ps-exp-check-item">
                  <div className="ps-exp-check-icon">
                    <IconCheck size={18} />
                  </div>
                  <div className="ps-exp-check-text">
                    <strong>Diagnostics & Pharmacy On Campus</strong>
                    <span>Collect medicines and provide lab samples without traveling across town.</span>
                  </div>
                </li>

                <li className="ps-exp-check-item">
                  <div className="ps-exp-check-icon">
                    <IconCheck size={18} />
                  </div>
                  <div className="ps-exp-check-text">
                    <strong>Unified Electronic Patient Account</strong>
                    <span>Your prescriptions, doctor notes, and lab reports stay organized and accessible 24/7.</span>
                  </div>
                </li>
              </ul>

              <Link to="/patient/about" className="ps-btn-primary">
                <span>Learn More About Us</span>
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================================
            8. ELDER & SENIOR CARE SECTION (STADIUM CAPSULES & CURVED WAVE)
            ================================================================== */}
        <ElderCareSection signedIn={signedIn} />

        {/* ==================================================================
            PATIENT TESTIMONIALS & REVIEWS
            ================================================================== */}
        <section className="ps-testimonials-section">
          <div className="ps-section-header" data-reveal>
            <h2>
              What Families Say <span className="ps-gradient-text">About Their Care</span>
            </h2>
            <p>Read experiences from patients and caregivers who visit Alverstone Medcity in Kollam.</p>
          </div>

          <div className="ps-testimonials-grid">
            {CLINIC.testimonials.map((t, idx) => (
              <div
                key={t.name}
                className="ps-testimonial-card"
                data-reveal
                style={{ ['--d' as string]: `${idx * 90}ms` }}
              >
                <div className="ps-stars-row">
                  <IconStar size={18} />
                  <IconStar size={18} />
                  <IconStar size={18} />
                  <IconStar size={18} />
                  <IconStar size={18} />
                </div>
                <blockquote className="ps-testimonial-quote">&ldquo;{t.quote}&rdquo;</blockquote>
                <div className="ps-testimonial-author">
                  <div className="ps-author-avatar">{t.name[0]}</div>
                  <div className="ps-author-info">
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================================
            EMERGENCY 24/7 CALLOUT STRIP
            ================================================================== */}
        <section className="ps-emergency-strip" data-reveal>
          <div className="ps-emergency-inner">
            <div className="ps-emergency-copy">
              <h3>Need Immediate Medical Attention or Night Walk-in?</h3>
              <p>
                Our 24-hour outpatient clinic, certified emergency triage, and campus pharmacy are open round-the-clock
                every day of the year in Chandanathope, Kollam.
              </p>
            </div>
            <div className="ps-emergency-actions">
              <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`} className="ps-emergency-btn">
                <IconPhone size={20} />
                <span>Call Emergency: {CLINIC.phone}</span>
              </a>
              <Link to="/#contact" className="ps-btn-secondary">
                Find Directions
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================================
            INTERACTIVE FAQ ACCORDION - MINIMALIST 2-COLUMN EDITORIAL DESIGN
            ================================================================== */}
        <section className="ps-faq-section" id="faq">
          <div className="ps-faq-container">
            {/* Left Column: Heading & Lead */}
            <div className="ps-faq-sidebar" data-reveal="left">
              <h2 className="ps-faq-title">
                Frequently asked<br />questions
              </h2>
              <p className="ps-faq-lead">
                To help you make informed decisions, we've compiled answers to some of the most commonly asked questions.
              </p>
              <div className="ps-faq-sidebar-footer">
                <span className="ps-faq-footer-label">Have questions about your care?</span>
                <a href="#contact" className="ps-faq-footer-link">
                  <span>Speak with our 24/7 care desk</span>
                  <span className="ps-faq-footer-arrow">→</span>
                </a>
              </div>
            </div>

            {/* Right Column: Divider Accordion List */}
            <div className="ps-faq-accordion" data-reveal="right">
              {CLINIC.faqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div key={faq.q} className={`ps-faq-row${isOpen ? ' is-open' : ''}`}>
                    <button
                      type="button"
                      className="ps-faq-question-btn"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                    >
                      <span className="ps-faq-question-text">{faq.q}</span>
                      <span
                        className="ps-faq-circle-btn"
                        aria-label={isOpen ? 'Collapse answer' : 'Expand answer'}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ps-faq-arrow"
                        >
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="ps-faq-answer">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ==================================================================
            GET IN TOUCH & CLINICAL ACCESS SECTION
            ================================================================== */}
        <section className="ps-contact-section" id="contact">
          <div className="ps-contact-container">
            {/* Top Section Header */}
            <div className="ps-contact-header" data-reveal>
              <h2 className="ps-contact-title">
                Get In Touch with <span className="ps-contact-accent">Our Care Team</span>
              </h2>
              <p className="ps-contact-subtitle">
                Visit our campus in Chandanathope, call our 24-hour hospital desk directly, or request a priority callback for appointments, home diagnostics, and healthcare queries.
              </p>
            </div>

            {/* 2-Column Split: Info Hub (Left) + Form (Right) */}
            <div className="ps-contact-grid">
              {/* Left Column: Direct Access & Channels */}
              <div className="ps-contact-left-col" data-reveal="left">
                {/* 24/7 Emergency & Hotline Banner */}
                <div className="ps-contact-hotline-card">
                  <div className="ps-hotline-icon-wrap">
                    <IconPhone size={22} />
                    <span className="ps-hotline-pulse" />
                  </div>
                  <div className="ps-hotline-info">
                    <div className="ps-hotline-eyebrow">24/7 Immediate Care Desk</div>
                    <a
                      href={`tel:${CLINIC.phone.replace(/\s/g, '')}`}
                      className="ps-hotline-tel"
                    >
                      {CLINIC.phone}
                    </a>
                    <span className="ps-hotline-sub">Round-the-clock emergency triage & outpatient assistance</span>
                  </div>
                </div>

                {/* 2x2 Feature Grid */}
                <div className="ps-contact-cards-grid">
                  {/* Card 1: Campus Address */}
                  <div className="ps-contact-card">
                    <div className="ps-card-icon-box ps-card-icon--emerald">
                      <IconBuilding size={20} />
                    </div>
                    <div className="ps-card-body">
                      <h4>Campus Location</h4>
                      <p>{CLINIC.address}</p>
                      <a
                        href="https://maps.google.com/?q=Chandanathope,+Kollam,+Kerala"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ps-card-link"
                      >
                        <span>Open in Google Maps</span>
                        <span>↗</span>
                      </a>
                    </div>
                  </div>

                  {/* Card 2: Email Desk */}
                  <div className="ps-contact-card">
                    <div className="ps-card-icon-box ps-card-icon--navy">
                      <IconFlask size={20} />
                    </div>
                    <div className="ps-card-body">
                      <h4>Email Desk</h4>
                      <p>
                        <a href={`mailto:${CLINIC.email}`} className="ps-card-email-link">
                          {CLINIC.email}
                        </a>
                      </p>
                      <span className="ps-card-badge">Direct desk reply</span>
                    </div>
                  </div>

                  {/* Card 3: Outpatient & Pharmacy */}
                  <div className="ps-contact-card">
                    <div className="ps-card-icon-box ps-card-icon--teal">
                      <IconStethoscope size={20} />
                    </div>
                    <div className="ps-card-body">
                      <h4>24/7 Services</h4>
                      <p>Outpatient care, certified emergency room, and campus pharmacy open 24 hours.</p>
                      <span className="ps-card-badge ps-card-badge--live">Always Open</span>
                    </div>
                  </div>

                  {/* Card 4: Diagnostics */}
                  <div className="ps-contact-card">
                    <div className="ps-card-icon-box ps-card-icon--purple">
                      <IconDroplet size={20} />
                    </div>
                    <div className="ps-card-body">
                      <h4>Lab & Diagnostics</h4>
                      <p>Walk-in blood tests, digital ECG, and home sample collection across Kollam.</p>
                      <span className="ps-card-badge">Home Pickup Available</span>
                    </div>
                  </div>
                </div>

                {/* Visiting Hours Table */}
                <div className="ps-contact-hours-card">
                  <div className="ps-hours-header">
                    <IconClock size={18} />
                    <h4>Campus Working Hours</h4>
                  </div>
                  <div className="ps-hours-list">
                    {CLINIC.hours.map((h) => (
                      <div key={h.day} className="ps-hours-row">
                        <span className="ps-hours-day">{h.day}</span>
                        <span className="ps-hours-time">{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facility Trust Perks Strip */}
                <div className="ps-contact-perks-strip">
                  <span className="ps-perk-item">✓ Ample Free Parking</span>
                  <span className="ps-perk-item">✓ Wheelchair Accessible</span>
                  <span className="ps-perk-item">✓ Touchless Automatic Doors</span>
                  <span className="ps-perk-item">✓ Ground Floor Pharmacy</span>
                </div>
              </div>

              {/* Right Column: High-converting Callback Form */}
              <div className="ps-contact-right-col" data-reveal="right">
                <div className="ps-contact-form-wrapper">
                  <PatientEnquiryForm
                    title="Request a Priority Call Back"
                    lead="Leave your details below and our hospital reception desk will reach out to assist you promptly."
                    submitLabel="Request Priority Call Back"
                    compact
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PatientSiteLayout>
  )
}
