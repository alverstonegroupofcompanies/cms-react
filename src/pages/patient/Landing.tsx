import { useState } from 'react'
import { Link } from 'react-router-dom'
import PatientSiteLayout from '../../components/PatientSiteLayout'
import PatientEnquiryForm from '../../components/PatientEnquiryForm'
import { useAuth } from '../../context/AuthContext'
import { usePageTitle } from '../../hooks/usePageTitle'
import BuildingToReceptionWalkthrough from '../../components/patient/BuildingToReceptionWalkthrough'
import TrustedDoctorsArc from '../../components/patient/TrustedDoctorsArc'
import InfrastructureSpotlight from '../../components/patient/InfrastructureSpotlight'
import ElderCareSection from '../../components/patient/ElderCareSection'
import SpecialtyDisciplinesGrid from '../../components/patient/SpecialtyDisciplinesGrid'
import Reveal from '../../components/motion/Reveal'
import SplitText from '../../components/motion/SplitText'
import FloatingMotifs from '../../components/motion/FloatingMotifs'
import { CLINIC } from '../../config/clinic'
import {
  IconCalendar,
  IconQueue,
  IconFlask,
  IconPill,
  IconStethoscope,
  IconPhone,
  IconStar,
  IconClock,
  IconBuilding,
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
            2. SPECIALIZED CLINICAL DEPARTMENTS - 8-TILE CHECKERBOARD GRID
            ================================================================== */}
        <SpecialtyDisciplinesGrid signedIn={signedIn} />

        {/* ==================================================================
            4. OUR TRUSTED DOCTORS & SPECIALISTS - 3D PANORAMIC ARC
            ================================================================== */}
        <TrustedDoctorsArc signedIn={signedIn} />

        {/* ==================================================================
            5. CORE PATIENT SERVICES - IMAGE-DRIVEN GLOW CARDS
            ================================================================== */}
        <section className="ps-services-section" id="services">
          {/* Section Background Visual Depth Layer - Pointer-events-none & z-index below content */}
          <div className="ps-services-bg-decorations" aria-hidden="true">
            {/* 1. Large Blurred Gradient Blobs */}
            <div className="ps-blob ps-blob-top-left" />
            <div className="ps-blob ps-blob-bottom-right" />

            {/* 2. Animated Medical ECG / Heartbeat Pulse Wave crossing behind heading */}
            <svg
              className="ps-decor-ecg"
              viewBox="0 0 900 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="psEcgPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B1A32" stopOpacity="0" />
                  <stop offset="40%" stopColor="#8B1A32" stopOpacity="0.4" />
                  <stop offset="85%" stopColor="#b91c1c" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Static faint baseline track */}
              <path
                className="ps-ecg-track"
                d="M0 60 L 260 60 L 290 60 L 305 40 L 320 85 L 340 15 L 360 100 L 378 45 L 392 68 L 405 60 L 900 60"
                stroke="#8B1A32"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Animated glowing heartbeat pulse line flowing across */}
              <path
                className="ps-ecg-pulse"
                d="M0 60 L 260 60 L 290 60 L 305 40 L 320 85 L 340 15 L 360 100 L 378 45 L 392 68 L 405 60 L 900 60"
                stroke="url(#psEcgPulseGrad)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* 3. Small scattered plus signs and circles at 10-15% opacity */}
            <div className="ps-decor-motifs">
              {/* Plus 1 (top left area) */}
              <svg className="ps-motif ps-motif-plus-1" width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 3V19M3 11H19" stroke="#8B1A32" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.14" />
              </svg>
              {/* Plus 2 (top right area) */}
              <svg className="ps-motif ps-motif-plus-2" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 4V20M4 12H20" stroke="#8B1A32" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.12" />
              </svg>
              {/* Plus 3 (center right) */}
              <svg className="ps-motif ps-motif-plus-3" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3V15M3 9H15" stroke="#8B1A32" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.11" />
              </svg>
              {/* Plus 4 (bottom left) */}
              <svg className="ps-motif ps-motif-plus-4" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3V17M3 10H17" stroke="#8B1A32" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.13" />
              </svg>
              {/* Circle 1 (near heading) */}
              <svg className="ps-motif ps-motif-circle-1" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="#8B1A32" strokeWidth="2" strokeOpacity="0.12" />
              </svg>
              {/* Circle 2 (mid left) */}
              <svg className="ps-motif ps-motif-circle-2" width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#8B1A32" strokeWidth="1.8" strokeOpacity="0.14" />
              </svg>
              {/* Circle 3 (lower right) */}
              <svg className="ps-motif ps-motif-circle-3" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="#8B1A32" strokeWidth="2" strokeOpacity="0.11" />
              </svg>
            </div>

            {/* 4. Large Faint Abstract Wave/Curve Running Across Bottom (maroon at 5% opacity) */}
            <svg
              className="ps-decor-bottom-wave"
              viewBox="0 0 1440 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M0,90 C320,160 540,30 840,110 C1140,190 1320,80 1440,120 L1440,220 L0,220 Z"
                fill="#8B1A32"
                fillOpacity="0.05"
              />
              <path
                d="M0,90 C320,160 540,30 840,110 C1140,190 1320,80 1440,120"
                stroke="#8B1A32"
                strokeWidth="1.5"
                strokeOpacity="0.05"
              />
            </svg>
          </div>

          <div className="ps-services-container">
            <div className="ps-section-header">
              <SplitText as="h2">
                Designed for Speed, <span className="ps-gradient-text">Comfort & Clarity</span>
              </SplitText>
              <Reveal direction="up" distance={14} delay={0.12} duration={0.75}>
                <p>
                  Manage your entire healthcare journey seamlessly from any device without long phone calls or waiting room confusion.
                </p>
              </Reveal>
            </div>

            <Reveal direction="up" distance={24} stagger={0.08} className="ps-services-cards-grid">
              {CORE_SERVICES.map((s) => {
                const Icon = s.icon
                const targetUrl = signedIn ? s.signedInTo : s.guestTo
                return (
                  <Link
                    key={s.title}
                    to={targetUrl}
                    className="ps-service-box"
                  >
                    <div className="ps-service-img-wrap">
                      <img src={s.image} alt={s.title} />
                      <span className="ps-service-tag-pill">{s.tag}</span>
                    </div>
                    <div className="ps-service-icon-floating" aria-hidden="true">
                      <Icon size={22} />
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
            </Reveal>
          </div>
        </section>

        {/* ==================================================================
            6. CAMPUS & HOSPITAL INFRASTRUCTURE SPOTLIGHT (FROSTED GLASS SHOWCASE)
            ================================================================== */}
        <InfrastructureSpotlight signedIn={signedIn} />

        {/* ==================================================================
            8. ELDER & SENIOR CARE SECTION (STADIUM CAPSULES & CURVED WAVE)
            ================================================================== */}
        <ElderCareSection signedIn={signedIn} />

        {/* ==================================================================
            PATIENT TESTIMONIALS & REVIEWS
            ================================================================== */}
        <section className="ps-testimonials-section">
          <FloatingMotifs density="minimal" />
          <div className="ps-testimonials-container">
            <div className="ps-section-header">
              <SplitText as="h2">
                What Families Say <span className="ps-gradient-text">About Their Care</span>
              </SplitText>
              <Reveal direction="up" distance={14} delay={0.12} duration={0.75}>
                <p>Read experiences from patients and caregivers who visit Alverstone Medcity in Kollam.</p>
              </Reveal>
            </div>

            <Reveal direction="up" distance={24} stagger={0.08} className="ps-testimonials-grid">
              {CLINIC.testimonials.map((t) => (
                <div
                  key={t.name}
                  className="ps-testimonial-card"
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
            </Reveal>
          </div>
        </section>

        {/* ==================================================================
            EMERGENCY 24/7 CALLOUT STRIP
            ================================================================== */}
        <Reveal direction="up" distance={20} duration={0.7} as="section" className="ps-emergency-strip">
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
        </Reveal>

        {/* ==================================================================
            INTERACTIVE FAQ ACCORDION - MINIMALIST 2-COLUMN EDITORIAL DESIGN
            ================================================================== */}
        <section className="ps-faq-section" id="faq">
          <div className="ps-faq-container">
            {/* Left Column: Heading & Lead */}
            <Reveal direction="left" distance={26} duration={0.8} className="ps-faq-sidebar">
              <SplitText as="h2" className="ps-faq-title">
                Frequently asked questions
              </SplitText>
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
            </Reveal>

            {/* Right Column: Divider Accordion List */}
            <Reveal direction="right" distance={26} duration={0.8} className="ps-faq-accordion">
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
            </Reveal>
          </div>
        </section>

        {/* ==================================================================
            GET IN TOUCH & CLINICAL ACCESS SECTION
            ================================================================== */}
        <section className="ps-contact-section" id="contact">
          {/* Ambient background colorful glow blobs and floating motifs */}
          <div className="ps-contact-bg-decorations" aria-hidden="true">
            <div className="ps-contact-blob ps-contact-blob-1" />
            <div className="ps-contact-blob ps-contact-blob-2" />
            <div className="ps-contact-blob ps-contact-blob-3" />
            <div className="ps-contact-blob ps-contact-blob-4" />

            {/* Subtle floating medical motifs in the background */}
            <div className="ps-contact-motifs">
              <svg className="ps-c-motif ps-c-motif-1" width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M13 4V22M4 13H22" stroke="#8B1A32" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.15" />
              </svg>
              <svg className="ps-c-motif ps-c-motif-2" width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#8B1A32" strokeWidth="2" strokeOpacity="0.12" />
              </svg>
              <svg className="ps-c-motif ps-c-motif-3" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3V17M3 10H17" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.13" />
              </svg>
              <svg className="ps-c-motif ps-c-motif-4" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#0284c7" strokeWidth="2" strokeOpacity="0.11" />
              </svg>
              <svg className="ps-c-motif ps-c-motif-5" width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 3V19M3 11H19" stroke="#8B1A32" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.12" />
              </svg>
            </div>
          </div>

          <div className="ps-contact-container">
            {/* Top Section Header */}
            <div className="ps-contact-header">
              <SplitText as="h2" className="ps-contact-title">
                Get In Touch with <span className="ps-contact-accent">Our Care Team</span>
              </SplitText>
              <Reveal direction="up" distance={14} delay={0.12} duration={0.75}>
                <p className="ps-contact-subtitle">
                  Visit our campus in Chandanathope, call our 24-hour hospital desk directly, or request a priority callback for appointments, home diagnostics, and healthcare queries.
                </p>
              </Reveal>
            </div>

            {/* 2-Column Split: Info Hub (Left) + Form (Right) */}
            <div className="ps-contact-grid">
              {/* Left Column: Direct Access & Channels */}
              <Reveal direction="left" distance={28} duration={0.85} className="ps-contact-left-col">
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
              </Reveal>

              {/* Right Column: High-converting Callback Form */}
              <Reveal direction="right" distance={28} duration={0.85} className="ps-contact-right-col">
                <div className="ps-contact-form-wrapper">
                  <PatientEnquiryForm
                    title="Request a Priority Call Back"
                    lead="Leave your details below and our hospital reception desk will reach out to assist you promptly."
                    submitLabel="Request Priority Call Back"
                    compact
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </div>
    </PatientSiteLayout>
  )
}
