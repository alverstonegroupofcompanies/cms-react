import { useState } from 'react'
import { Link } from 'react-router-dom'
import PatientSiteLayout from '../../components/PatientSiteLayout'
import PatientEnquiryForm from '../../components/PatientEnquiryForm'
import { useAuth } from '../../context/AuthContext'
import { usePageTitle } from '../../hooks/usePageTitle'
import { CLINIC } from '../../config/clinic'
import {
  IconCalendar,
  IconQueue,
  IconFlask,
  IconPill,
  IconStethoscope,
  IconPhone,
  IconCheck,
  IconChevronDown,
  IconStar,
  IconClock,
  IconBuilding,
  IconHeart,
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

const DEPARTMENTS = [
  {
    title: 'Pediatrics & Child Wellness',
    badge: 'Child Care',
    chips: ['Newborn Care', 'Vaccinations', 'Growth Checks'],
    text: 'Gentle, attentive outpatient care for infants, children, and adolescents with friendly specialist pediatricians.',
    image: '/images/dept-pediatrics.jpg',
  },
  {
    title: 'Dermatology & Aesthetics',
    badge: 'Skin Clinic',
    chips: ['Acne & Rashes', 'Cosmetology', 'Allergies'],
    text: 'Specialized consultations for dermatological health, chronic skin allergies, and advanced non-invasive aesthetics.',
    image: '/images/dept-dermatology.jpg',
  },
  {
    title: 'General & Internal Medicine',
    badge: 'Primary Care',
    chips: ['Fever Clinic', 'Diabetes Care', 'Preventive Health'],
    text: 'Everyday adult health concerns, lifestyle disease monitoring, hypertension checkups, and routine wellness screenings.',
    image: '/images/dept-general-medicine.jpg',
  },
  {
    title: 'Advanced Diagnostic Pathology',
    badge: 'Modern Lab',
    chips: ['Automated Analyzers', 'Home Sample', 'Digital Reports'],
    text: 'Precision laboratory diagnostics with automated testing machinery and rapid digital report delivery to your portal.',
    image: '/images/dept-lab-diagnostics.jpg',
  },
] as const

const DOCTORS_SHOWCASE = [
  {
    name: 'Dr. Sarah Johnson',
    degree: 'MBBS, MD',
    specialty: 'Senior General Physician',
    experience: '14+ Yrs Experience',
    days: 'Mon – Fri (09:00 AM – 04:00 PM)',
    tags: ['Adult Health', 'Preventive Care', 'Family Medicine'],
  },
  {
    name: 'Dr. Priya Sharma',
    degree: 'MD, DM Cardiology',
    specialty: 'Consultant Cardiologist',
    experience: '12+ Yrs Experience',
    days: 'Mon, Wed, Fri (10:00 AM – 02:00 PM)',
    tags: ['Cardiology', 'ECG Review', 'Heart Health'],
  },
  {
    name: 'Dr. Rajesh Menon',
    degree: 'MBBS, MD',
    specialty: 'Internal Medicine Specialist',
    experience: '16+ Yrs Experience',
    days: 'Tue, Thu, Sat (09:00 AM – 03:00 PM)',
    tags: ['Diabetes OP', 'Hypertension', 'Geriatric Care'],
  },
  {
    name: 'Dr. Meera Krishnan',
    degree: 'MS Orthopedics',
    specialty: 'Orthopedic Surgeon',
    experience: '10+ Yrs Experience',
    days: 'Mon, Wed, Thu (11:00 AM – 05:00 PM)',
    tags: ['Joint Care', 'Sports Injury', 'Bone Health'],
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
            HERO SECTION - LUXURY SPLIT WITH REAL IMAGERY & FLOATING BADGES
            ================================================================== */}
        <section className="ps-hero-luxury" data-reveal="hero">
          <div className="ps-hero-grid">
            <div className="ps-hero-content">
              <div className="ps-eyebrow-pill ps-eyebrow-pill--light">
                <span className="ps-pulse-dot" />
                <span>Alverstone Medcity · Chandanathope, Kollam · Open 24/7</span>
              </div>

              <h1 className="ps-hero-title">
                Healthcare Designed Around Your Life,{' '}
                <span className="ps-hero-title-accent">Elevated for Peace of Mind.</span>
              </h1>

              <p className="ps-hero-description">
                Book board-certified specialists on your exact schedule, track your live queue token from anywhere,
                and access verified diagnostics and digital prescriptions — all securely in one place.
              </p>

              <div className="ps-hero-cta-group">
                <Link to={bookVisitTo} className="ps-btn-primary">
                  <span>{signedIn ? 'Book an Appointment' : 'Book a Consultation'}</span>
                  <span aria-hidden>→</span>
                </Link>

                {signedIn ? (
                  <Link to="/patient/dashboard" className="ps-btn-glass">
                    Patient Portal Overview
                  </Link>
                ) : (
                  <Link to="/patient/register?next=%2Fpatient%2Fbook" className="ps-btn-glass">
                    Create Patient Account
                  </Link>
                )}

                <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`} className="ps-btn-call">
                  <IconPhone size={18} />
                  <span>Call: {CLINIC.phone}</span>
                </a>
              </div>

              <div className="ps-hero-trust-bar">
                <div className="ps-trust-item">
                  <div className="ps-trust-val">
                    <span>4.9</span>
                    <span className="star-rating">
                      <IconStar size={16} />
                      <IconStar size={16} />
                      <IconStar size={16} />
                      <IconStar size={16} />
                      <IconStar size={16} />
                    </span>
                  </div>
                  <span className="ps-trust-label">1,200+ Verified Patient Reviews</span>
                </div>

                <div className="ps-trust-item">
                  <div className="ps-trust-val">15+</div>
                  <span className="ps-trust-label">Specialist Doctors On Panel</span>
                </div>

                <div className="ps-trust-item">
                  <div className="ps-trust-val">0 Min</div>
                  <span className="ps-trust-label">Lobby Waiting with Digital Queue</span>
                </div>
              </div>
            </div>

            <div className="ps-hero-media-wrap">
              <div className="ps-hero-media-frame">
                <div className="ps-hero-img-box">
                  <img
                    src="/images/patient-hero-doctors.jpg"
                    alt="Alverstone Medcity Doctor Team in Modern Clinic Atrium"
                  />
                  <div className="ps-hero-img-overlay" />
                </div>

                {/* Floating Top Badge */}
                <div className="ps-float-badge ps-float-badge--top">
                  <div className="ps-badge-icon-box">
                    <IconStethoscope size={22} />
                  </div>
                  <div className="ps-badge-content">
                    <strong>Specialists On Duty Now</strong>
                    <span>Walk-ins & scheduled visits active</span>
                  </div>
                </div>

                {/* Floating Bottom Badge */}
                <div className="ps-float-badge ps-float-badge--bottom">
                  <div className="ps-badge-icon-box">
                    <IconQueue size={22} />
                  </div>
                  <div className="ps-badge-content">
                    <strong>Live Digital Queue Board</strong>
                    <span>Check your live turn on your mobile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            VALUE PROPOSITIONS RIBBON (DIRECTLY UNDER HERO)
            ================================================================== */}
        <section className="ps-values-ribbon">
          <div className="ps-values-grid">
            <div className="ps-value-card">
              <div className="ps-value-icon">
                <IconClock size={22} />
              </div>
              <div className="ps-value-info">
                <h4>24/7 Walk-in & OP</h4>
                <p>Always open for acute care, outpatient visits, and emergencies.</p>
              </div>
            </div>

            <div className="ps-value-card">
              <div className="ps-value-icon">
                <IconQueue size={22} />
              </div>
              <div className="ps-value-info">
                <h4>Zero Waiting Stress</h4>
                <p>Real-time slot reservation eliminates crowded waiting rooms.</p>
              </div>
            </div>

            <div className="ps-value-card">
              <div className="ps-value-icon">
                <IconBuilding size={22} />
              </div>
              <div className="ps-value-info">
                <h4>Everything Under One Roof</h4>
                <p>Consultations, diagnostics, and 24/7 pharmacy on a single campus.</p>
              </div>
            </div>

            <div className="ps-value-card">
              <div className="ps-value-icon">
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
            CORE PATIENT SERVICES - IMAGE-DRIVEN GLOW CARDS
            ================================================================== */}
        <section className="ps-services-wrapper" id="services">
          <div className="ps-section-header">
            <div className="ps-eyebrow-pill">
              <IconStethoscope size={14} />
              <span>Patient Convenience</span>
            </div>
            <h2>
              Designed for Speed, <span className="ps-gradient-text">Comfort & Clarity</span>
            </h2>
            <p>
              Manage your entire healthcare journey seamlessly from any device without long phone calls or waiting room confusion.
            </p>
          </div>

          <div className="ps-services-cards-grid">
            {CORE_SERVICES.map((s) => {
              const Icon = s.icon
              const targetUrl = signedIn ? s.signedInTo : s.guestTo
              return (
                <Link key={s.title} to={targetUrl} className="ps-service-box">
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
            SPECIALIZED CLINICAL DEPARTMENTS (RICH CLINICAL PHOTOGRAPHY)
            ================================================================== */}
        <section className="ps-dept-section" id="departments">
          <div className="ps-dept-inner">
            <div className="ps-section-header">
              <div className="ps-eyebrow-pill">
                <IconBuilding size={14} />
                <span>Specialized Centers of Care</span>
              </div>
              <h2>
                Care Across Our <span className="ps-gradient-text">Specialty Disciplines</span>
              </h2>
              <p>
                From gentle pediatric visits to certified pathology diagnostics, book experienced clinicians dedicated to your health.
              </p>
            </div>

            <div className="ps-dept-cards-grid">
              {DEPARTMENTS.map((d) => (
                <article key={d.title} className="ps-dept-clinical-card">
                  <div className="ps-dept-img-container">
                    <img src={d.image} alt={d.title} />
                    <span className="ps-dept-img-badge">{d.badge}</span>
                  </div>
                  <div className="ps-dept-card-body">
                    <h3>{d.title}</h3>
                    <div className="ps-dept-chips">
                      {d.chips.map((c) => (
                        <span key={c} className="ps-dept-chip">
                          {c}
                        </span>
                      ))}
                    </div>
                    <p>{d.text}</p>
                    <Link to={bookVisitTo} className="ps-dept-book-btn">
                      <span>Book Specialist</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================================
            CAMPUS & HOSPITAL EXPERIENCE SPLIT FEATURE
            ================================================================== */}
        <section className="ps-experience-section">
          <div className="ps-experience-grid">
            <div className="ps-experience-media-column">
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

            <div className="ps-experience-copy-column">
              <div className="ps-eyebrow-pill">
                <IconHeart size={14} />
                <span>The Alverstone Difference</span>
              </div>
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
            DOCTORS & SPECIALISTS SPOTLIGHT
            ================================================================== */}
        <section className="ps-doctors-panel">
          <div className="ps-doctors-inner">
            <div className="ps-section-header">
              <div className="ps-eyebrow-pill">
                <IconStethoscope size={14} />
                <span>Meet Our Clinicians</span>
              </div>
              <h2>
                Experienced Specialists, <span className="ps-gradient-text">Dedicated to You</span>
              </h2>
              <p>
                Our panel brings together accomplished physicians across major medical disciplines, committed to compassionate, evidence-based care.
              </p>
            </div>

            <div className="ps-doctors-grid">
              {DOCTORS_SHOWCASE.map((doc) => {
                const initials = doc.name
                  .replace('Dr. ', '')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                return (
                  <article key={doc.name} className="ps-doc-card">
                    <div className="ps-doc-avatar-wrap">
                      <div className="ps-doc-avatar">{initials}</div>
                      <div className="ps-doc-meta">
                        <h4>{doc.name}</h4>
                        <span className="ps-doc-spec">{doc.specialty}</span>
                      </div>
                    </div>

                    <div className="ps-doc-tags">
                      <span className="ps-doc-badge">{doc.degree}</span>
                      <span className="ps-doc-badge">{doc.experience}</span>
                    </div>

                    <p className="ps-doc-detail">
                      <strong>Consulting:</strong> {doc.days}
                    </p>

                    <Link to={bookVisitTo} className="ps-doc-action-btn">
                      <span>Book Consultation</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ==================================================================
            PATIENT TESTIMONIALS & REVIEWS
            ================================================================== */}
        <section className="ps-testimonials-section">
          <div className="ps-section-header">
            <div className="ps-eyebrow-pill">
              <IconHeart size={14} />
              <span>Patient Stories</span>
            </div>
            <h2>
              What Families Say <span className="ps-gradient-text">About Their Care</span>
            </h2>
            <p>Read experiences from patients and caregivers who visit Alverstone Medcity in Kollam.</p>
          </div>

          <div className="ps-testimonials-grid">
            {CLINIC.testimonials.map((t) => (
              <div key={t.name} className="ps-testimonial-card">
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
        <section className="ps-emergency-strip">
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
              <Link to="/patient#contact" className="ps-btn-glass">
                Find Directions
              </Link>
            </div>
          </div>
        </section>

        {/* ==================================================================
            INTERACTIVE FAQ ACCORDION
            ================================================================== */}
        <section className="ps-faq-section">
          <div className="ps-section-header">
            <div className="ps-eyebrow-pill">
              <IconQueue size={14} />
              <span>Questions & Answers</span>
            </div>
            <h2>
              Frequently Asked <span className="ps-gradient-text">Questions</span>
            </h2>
            <p>Everything you need to know about booking, queue numbers, test turnaround, and pharmacy.</p>
          </div>

          <div className="ps-faq-list">
            {CLINIC.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div key={faq.q} className={`ps-faq-item${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="ps-faq-trigger"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span className="ps-faq-chevron">
                      <IconChevronDown size={20} />
                    </span>
                  </button>
                  {isOpen && <div className="ps-faq-body">{faq.a}</div>}
                </div>
              )
            })}
          </div>
        </section>

        {/* ==================================================================
            CONTACT, HOURS & ENQUIRY FORM
            ================================================================== */}
        <section className="ps-enquiry-section-modern" id="contact">
          <div className="ps-enquiry-container">
            <div className="ps-contact-info-col">
              <div className="ps-eyebrow-pill">
                <IconPhone size={14} />
                <span>Get In Touch</span>
              </div>
              <h2>
                We&apos;re Here to <span className="ps-gradient-text">Support Your Health</span>
              </h2>
              <p>
                Visit us in Chandanathope, reach out to our front desk, or request a call back for appointments, home lab sample collection, or general guidance.
              </p>

              <div className="ps-info-cards-stack">
                <div className="ps-info-card-item">
                  <div className="ps-info-icon-box">
                    <IconBuilding size={20} />
                  </div>
                  <div>
                    <h4>Campus Address</h4>
                    <p>{CLINIC.address}</p>
                  </div>
                </div>

                <div className="ps-info-card-item">
                  <div className="ps-info-icon-box">
                    <IconPhone size={20} />
                  </div>
                  <div>
                    <h4>Phone & Emergency</h4>
                    <p>
                      <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`}>{CLINIC.phone}</a>
                    </p>
                  </div>
                </div>

                <div className="ps-info-card-item">
                  <div className="ps-info-icon-box">
                    <IconFlask size={20} />
                  </div>
                  <div>
                    <h4>Email Support</h4>
                    <p>
                      <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="ps-hours-table-wrap">
                <h4>
                  <IconClock size={18} />
                  <span>Campus Visiting Hours</span>
                </h4>
                {CLINIC.hours.map((h) => (
                  <div key={h.day} className="ps-hours-list-item">
                    <span>{h.day}</span>
                    <strong>{h.time}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="ps-form-card-glass">
              <PatientEnquiryForm
                title="Schedule an Enquiry & Callback"
                lead="Select a service purpose below and our front desk will get back to you promptly."
                submitLabel="Send Enquiry Now"
                compact
              />
            </div>
          </div>
        </section>
      </div>
    </PatientSiteLayout>
  )
}
