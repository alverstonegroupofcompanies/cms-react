import { useState } from 'react'
import { Link } from 'react-router-dom'
import PatientSiteLayout from '../../components/PatientSiteLayout'
import { usePageTitle } from '../../hooks/usePageTitle'
import { CLINIC } from '../../config/clinic'
import { IconChevronDown, IconQuote, iconMap } from '../../components/Icons'

const GALLERY = [
  { src: '/images/patient-hero.jpg', alt: 'Consultation room', span: 'tall' as const },
  { src: '/images/roles/receptionist.jpg', alt: 'Reception desk', span: 'wide' as const },
  { src: '/images/patient-banner-book.jpg', alt: 'Booking your visit', span: 'normal' as const },
  { src: '/images/patient-footer-interior.jpg', alt: 'Clinic interior', span: 'normal' as const },
  { src: '/images/staff-hero.jpg', alt: 'Campus care', span: 'wide' as const },
]

export default function PatientAbout() {
  usePageTitle('About us', 'Patient')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <PatientSiteLayout>
      <section
        className="ps-page-hero ps-about-hero"
        data-reveal="hero"
        style={{ backgroundImage: "url('/images/patient-about.jpg')" }}
      >
        <div className="ps-about-hero-orb" aria-hidden />
        <div className="ps-page-hero-inner">
          <p className="ps-kicker ps-hero-line" style={{ ['--d' as string]: '0ms' }}>About us</p>
          <h1 className="ps-hero-line" style={{ ['--d' as string]: '90ms' }}>
            {CLINIC.name}
          </h1>
          <p className="ps-hero-lead ps-hero-line" style={{ ['--d' as string]: '180ms' }}>
            {CLINIC.tagline}
          </p>
          <div className="ps-about-hero-actions ps-hero-line" style={{ ['--d' as string]: '280ms' }}>
            <Link to="/patient/register" className="ps-btn">Become a patient</Link>
            <a href="#our-story" className="ps-btn-ghost">Our story</a>
          </div>
        </div>
      </section>

      <section className="ps-section ps-about-intro">
        <div className="ps-about-intro-grid">
          <div className="ps-about-intro-copy" data-reveal>
            <p className="ps-kicker ps-kicker-dark">Who we are</p>
            <h2>Care that fits your day</h2>
            {CLINIC.aboutIntro.map((para) => (
              <p key={para.slice(0, 48)}>{para}</p>
            ))}
          </div>
          <aside className="ps-about-aside" data-reveal style={{ ['--d' as string]: '120ms' }}>
            <p className="ps-about-aside-label">Visit us</p>
            <p className="ps-about-aside-place">{CLINIC.address}</p>
            <dl className="ps-about-aside-dl">
              {CLINIC.hours.map((h) => (
                <div key={h.day}>
                  <dt>{h.day}</dt>
                  <dd>{h.time}</dd>
                </div>
              ))}
            </dl>
            <p className="ps-about-aside-note">
              Consultation, pharmacy, and lab — one campus, fewer trips.
            </p>
          </aside>
        </div>
      </section>

      <section className="ps-about-story" id="our-story">
        <div className="ps-section-head ps-about-story-head" data-reveal>
          <p className="ps-kicker ps-kicker-dark">Our story</p>
          <h2>From a promise to a campus</h2>
          <p>Four chapters of how Alverstone Medcity grew around patients — not queues.</p>
        </div>

        <div className="ps-about-story-list">
          {CLINIC.aboutStory.map((chapter, i) => {
            const reverse = i % 2 === 1
            return (
              <article
                key={chapter.step}
                className={`ps-about-story-row${reverse ? ' is-reverse' : ''}`}
              >
                <div
                  className="ps-about-story-media"
                  data-reveal={reverse ? 'right' : 'left'}
                  style={{ backgroundImage: `url('${chapter.image}')` }}
                  role="img"
                  aria-label={chapter.imageAlt}
                >
                  <span className="ps-about-story-step">{chapter.step}</span>
                </div>
                <div
                  className="ps-about-story-copy"
                  data-reveal={reverse ? 'left' : 'right'}
                  style={{ ['--d' as string]: '100ms' }}
                >
                  <p className="ps-kicker ps-kicker-dark">Chapter {chapter.step}</p>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.text}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="ps-about-gallery">
        <div className="ps-section-head" data-reveal>
          <p className="ps-kicker ps-kicker-dark">On campus</p>
          <h2>Spaces built for calm care</h2>
          <p>Reception, consultation, and diagnostics — designed to feel clear the moment you walk in.</p>
        </div>
        <div className="ps-about-gallery-grid">
          {GALLERY.map((shot, i) => (
            <figure
              key={shot.src}
              className={`ps-about-gallery-item ps-about-gallery-item--${shot.span}`}
              data-reveal
              style={{ ['--d' as string]: `${i * 80}ms` }}
            >
              <img src={shot.src} alt={shot.alt} loading="lazy" />
              <figcaption>{shot.alt}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="ps-section ps-about-features">
        <div className="ps-section-head" data-reveal>
          <p className="ps-kicker ps-kicker-dark">Why patients choose us</p>
          <h2>Built around your time</h2>
          <p>
            From the moment you book to the moment you leave with reports — every step is designed
            to be clear, calm, and efficient.
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
                style={{ ['--d' as string]: `${i * 70}ms` }}
              >
                <span className="ps-about-feature-ico" aria-hidden>
                  <Icon size={22} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="ps-about-facts">
        <div className="ps-about-facts-inner">
          <div className="ps-section-head" data-reveal>
            <p className="ps-kicker ps-kicker-dark">Health notes</p>
            <h2>Good facts for everyday wellness</h2>
            <p>Simple habits our doctors remind patients about — small changes that compound.</p>
          </div>
          <div className="ps-about-facts-grid">
            {CLINIC.healthFacts.map((fact, i) => {
              const Icon = iconMap[fact.icon]
              return (
                <article
                  key={fact.label}
                  className="ps-about-fact-card"
                  data-reveal
                  style={{ ['--d' as string]: `${i * 90}ms` }}
                >
                  <span className="ps-about-fact-ico" aria-hidden>
                    <Icon size={22} />
                  </span>
                  <p className="ps-about-fact-stat">{fact.stat}</p>
                  <h3>{fact.label}</h3>
                  <p>{fact.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="ps-about-voices">
        <div className="ps-section-head" data-reveal>
          <p className="ps-kicker ps-kicker-dark">Testimonials</p>
          <h2>What patients tell us</h2>
          <p>Real visits, clearer days — in their own words.</p>
        </div>
        <div className="ps-about-voice-grid">
          {CLINIC.testimonials.map((t, i) => (
            <blockquote
              key={t.name}
              className="ps-about-voice"
              data-reveal
              style={{ ['--d' as string]: `${i * 100}ms` }}
            >
              <span className="ps-about-voice-mark" aria-hidden>
                <IconQuote size={28} />
              </span>
              <p>{t.quote}</p>
              <footer>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="ps-about-faq">
        <div className="ps-about-faq-inner">
          <div className="ps-about-faq-intro" data-reveal>
            <p className="ps-kicker ps-kicker-dark">FAQ</p>
            <h2>Questions we hear often</h2>
            <p>Booking, hours, reports, and rescheduling — answered simply.</p>
            <Link to="/patient#contact" className="ps-text-link">
              Still unsure? Contact us →
            </Link>
          </div>
          <div className="ps-about-faq-list" data-reveal style={{ ['--d' as string]: '100ms' }}>
            {CLINIC.faqs.map((item, i) => {
              const open = openFaq === i
              return (
                <div key={item.q} className={`ps-about-faq-item${open ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="ps-about-faq-q"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : i)}
                  >
                    <span>{item.q}</span>
                    <IconChevronDown size={20} />
                  </button>
                  <div className="ps-about-faq-a" hidden={!open}>
                    <p>{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="ps-about-cta" data-reveal>
        <div className="ps-about-cta-inner">
          <div>
            <p className="ps-kicker">Join our clinic</p>
            <h2>Ready when you are</h2>
            <p>
              Create a patient account to book your preferred doctor, track visits, and open lab
              reports from home.
            </p>
          </div>
          <div className="ps-about-actions">
            <Link to="/patient/register" className="ps-btn ps-btn-lg">
              Become a patient
            </Link>
            <Link to="/patient#contact" className="ps-btn-ghost">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </PatientSiteLayout>
  )
}
