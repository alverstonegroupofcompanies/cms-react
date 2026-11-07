import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PatientSiteLayout from '../../components/PatientSiteLayout'
import DoctorDayTrack from '../../components/DoctorDayTrack'
import { getDoctor, getDoctors } from '../../api/client'
import type { Doctor } from '../../api/types'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useAuth } from '../../context/AuthContext'
import {
  findDoctorBySlugOrId,
  mergeUnifiedDoctors,
} from '../../utils/doctorDirectoryData'
import type { UnifiedDoctor } from '../../utils/doctorDirectoryData'
import { Reveal } from '../../components/motion'
import './doctors-directory.css'

export default function DoctorProfile() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isPatient = user?.role === 'patient'

  const [dbDoctor, setDbDoctor] = useState<Doctor | null>(null)
  const [allDbDoctors, setAllDbDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch doctor and colleague list
  useEffect(() => {
    let mounted = true
    const isNumeric = id && /^\d+$/.test(id)

    const docPromise = isNumeric
      ? getDoctor(Number(id)).then((res) => res.data).catch(() => null)
      : Promise.resolve(null)

    const allPromise = getDoctors().then((res) => res.data).catch(() => [])

    Promise.all([docPromise, allPromise]).then(([docData, allData]) => {
      if (!mounted) return
      if (docData) setDbDoctor(docData)
      setAllDbDoctors(allData || [])
      setLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [id])

  // Resolve unified doctor
  const doctor: UnifiedDoctor | undefined = useMemo(() => {
    if (dbDoctor) {
      return findDoctorBySlugOrId(dbDoctor.id, [dbDoctor, ...allDbDoctors])
    }
    return findDoctorBySlugOrId(id, allDbDoctors)
  }, [id, dbDoctor, allDbDoctors])

  usePageTitle(doctor ? `${doctor.name} - ${doctor.departmentName}` : 'Doctor Profile', 'Patient')

  // Related doctors in same department
  const relatedDoctors = useMemo(() => {
    if (!doctor) return []
    const all = mergeUnifiedDoctors(allDbDoctors)
    return all
      .filter((d) => String(d.id) !== String(doctor.id) && d.slug !== doctor.slug)
      .filter(
        (d) =>
          d.departmentSlug.includes(doctor.departmentSlug) ||
          doctor.departmentSlug.includes(d.departmentSlug) ||
          d.departmentName === doctor.departmentName
      )
      .slice(0, 3)
  }, [doctor, allDbDoctors])

  if (loading && !doctor) {
    return (
      <PatientSiteLayout>
        <div className="dp-page" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#8b1e2b', fontWeight: 650 }}>Loading doctor profile...</p>
        </div>
      </PatientSiteLayout>
    )
  }

  if (!doctor) {
    return (
      <PatientSiteLayout>
        <div className="dp-page" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', color: '#2a0b12', marginBottom: '1rem' }}>
            Doctor Not Found
          </h2>
          <p style={{ color: '#6c5a52', marginBottom: '2rem' }}>
            We could not find the medical specialist you were looking for.
          </p>
          <Link
            to="/doctors"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '9999px',
              background: '#8b1e2b',
              color: '#ffffff',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            ← View Our Doctors Directory
          </Link>
        </div>
      </PatientSiteLayout>
    )
  }

  const bookBaseUrl = isPatient ? '/patient/book' : '/patient/login?next=%2Fpatient%2Fbook'
  const bookUrl = `${bookBaseUrl}?doctor_id=${doctor.dbId || doctor.id}&doctor=${encodeURIComponent(
    doctor.name
  )}${doctor.departmentId ? `&department_id=${doctor.departmentId}` : ''}`

  return (
    <PatientSiteLayout>
      <div className="dp-page">
        {/* ==================================================================
            1. DOCTOR HERO BANNER & PROFILE CARD
            ================================================================== */}
        <section className="dp-hero">
          <div className="dp-hero-inner">
            <Link to="/doctors" className="dp-back-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back to all doctors</span>
            </Link>

            <div className="dp-card-hero">
              <div className="dp-portrait-wrap">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="dp-portrait-img"
                  onError={(e) => {
                    const target = e.currentTarget
                    if (!target.src.includes('doc-sharma-general.jpg')) {
                      target.src = '/images/doctors/doc-sharma-general.jpg'
                    }
                  }}
                />
                <div className="dp-verified-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>Verified Medical Specialist</span>
                </div>
              </div>

              <div className="dp-info-col">
                <div className="dp-dept-badge">
                  <span>{doctor.departmentName}</span>
                </div>

                <h1 className="dp-doc-name">{doctor.name}</h1>
                <p className="dp-doc-spec-headline">{doctor.specialization}</p>
                <p className="dp-doc-degree-line">{doctor.degree}</p>

                <div className="dp-metrics-row">
                  <div className="dp-metric-cell">
                    <span className="dp-metric-label">Experience</span>
                    <span className="dp-metric-val">{doctor.experienceYears}+ Years</span>
                  </div>

                  <div className="dp-metric-cell">
                    <span className="dp-metric-label">Consulting Room</span>
                    <span className="dp-metric-val">{doctor.room}</span>
                  </div>

                  <div className="dp-metric-cell">
                    <span className="dp-metric-label">Patient Rating</span>
                    <span className="dp-metric-val">★ {doctor.rating} / 5.0</span>
                  </div>

                  <div className="dp-metric-cell">
                    <span className="dp-metric-label">OPD Days</span>
                    <span className="dp-metric-val">{doctor.daysSummary}</span>
                  </div>
                </div>

                <Link to={bookUrl} className="dp-hero-cta-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Book Appointment with {doctor.name}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. DOCTOR BIOGRAPHY & SCHEDULE CONTAINER
            ================================================================== */}
        <div className="dp-content-container">
          {/* Main Left Column */}
          <main className="dp-main-column">
            {/* Biography & Philosophy */}
            <section className="dp-section-card">
              <div className="dp-section-head">
                <span className="dp-section-head-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <h2 className="dp-section-title">About {doctor.name}</h2>
              </div>

              <p className="dp-bio-lead">{doctor.bio}</p>

              <div className="dp-philosophy-box">
                <blockquote className="dp-philosophy-quote">
                  &ldquo;{doctor.philosophy}&rdquo;
                </blockquote>
                <div className="dp-philosophy-author">
                  — {doctor.name}, {doctor.badge}
                </div>
              </div>
            </section>

            {/* Clinical Specializations & Conditions Treated */}
            <section className="dp-section-card">
              <div className="dp-section-head">
                <span className="dp-section-head-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </span>
                <h2 className="dp-section-title">Clinical Expertise &amp; Conditions Treated</h2>
              </div>

              <div className="dp-specializations-grid">
                {doctor.specializations.map((spec, idx) => (
                  <span key={idx} className="dp-spec-pill">
                    <span className="dp-spec-bullet">✓</span>
                    <span>{spec}</span>
                  </span>
                ))}
              </div>
            </section>

            {/* Education & Accreditations */}
            <section className="dp-section-card">
              <div className="dp-section-head">
                <span className="dp-section-head-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                  </svg>
                </span>
                <h2 className="dp-section-title">Education &amp; Qualifications</h2>
              </div>

              <ul className="dp-education-list">
                {doctor.education.map((edu, idx) => (
                  <li key={idx} className="dp-edu-item">
                    <span className="dp-edu-icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span>{edu}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Visit Walkthrough */}
            <section className="dp-section-card">
              <div className="dp-section-head">
                <span className="dp-section-head-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 14" />
                  </svg>
                </span>
                <h2 className="dp-section-title">What to Expect on Your Consultation Day</h2>
              </div>

              <div className="dp-steps-strip">
                <div className="dp-step-box">
                  <span className="dp-step-num">1</span>
                  <h4 className="dp-step-heading">Book Online</h4>
                  <p className="dp-step-desc">Pick your preferred slot date and time from the schedule.</p>
                </div>

                <div className="dp-step-box">
                  <span className="dp-step-num">2</span>
                  <h4 className="dp-step-heading">Check in at Reception</h4>
                  <p className="dp-step-desc">Arrive 10 minutes prior for quick check-in and queue token generation.</p>
                </div>

                <div className="dp-step-box">
                  <span className="dp-step-num">3</span>
                  <h4 className="dp-step-heading">Enter {doctor.room}</h4>
                  <p className="dp-step-desc">Enter when your token number appears on the OPD waiting room TV display.</p>
                </div>
              </div>
            </section>
          </main>

          {/* Right Sidebar Column */}
          <aside className="dp-sidebar-column">
            <div className="dp-sidebar-booking-card">
              <h3 className="dp-sidebar-card-title">Consultation Schedule</h3>
              <p className="dp-sidebar-card-sub">
                Weekly outpatient clinic hours for <strong>{doctor.name}</strong>.
              </p>

              <div className="dp-schedule-days-summary">
                <DoctorDayTrack availability={doctor.availability} showSummary size="md" />
              </div>

              <dl>
                <div className="dp-sidebar-info-row">
                  <dt>Consulting Room</dt>
                  <dd>{doctor.room}</dd>
                </div>

                <div className="dp-sidebar-info-row">
                  <dt>Hours of Practice</dt>
                  <dd>{doctor.hoursSummary}</dd>
                </div>

                <div className="dp-sidebar-info-row">
                  <dt>Lunch Break</dt>
                  <dd>{doctor.lunchBreak}</dd>
                </div>

                <div className="dp-sidebar-info-row">
                  <dt>Languages Spoken</dt>
                  <dd>{doctor.languages.join(', ')}</dd>
                </div>

                <div className="dp-sidebar-info-row">
                  <dt>Department</dt>
                  <dd>{doctor.departmentName}</dd>
                </div>
              </dl>

              <Link to={bookUrl} className="dp-sidebar-book-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Book Appointment Now</span>
              </Link>

              <p className="dp-sidebar-guarantee-note">
                Online reservations guarantee your token position in the clinic queue.
              </p>
            </div>
          </aside>
        </div>

        {/* ==================================================================
            3. OTHER DOCTORS IN THIS DEPARTMENT
            ================================================================== */}
        {relatedDoctors.length > 0 && (
          <section className="dp-related-section">
            <Reveal direction="up" className="dp-related-header">
              <h3>Other Specialists in {doctor.departmentName}</h3>
              <p>Explore other board-certified consultants caring for patients in this department.</p>
            </Reveal>

            <Reveal direction="up" stagger={0.08} className="alv-doctors-cards-grid">
              {relatedDoctors.map((rel) => {
                const relProfileUrl = `/doctors/${rel.slug || rel.id}`
                const relBookUrl = `${bookBaseUrl}?doctor_id=${rel.dbId || rel.id}&doctor=${encodeURIComponent(
                  rel.name
                )}${rel.departmentId ? `&department_id=${rel.departmentId}` : ''}`

                return (
                  <article key={String(rel.id)} className="alv-doctor-card">
                    {/* Top Portrait Wrap */}
                    <div className="alv-card-photo-wrap">
                      <Link to={relProfileUrl} aria-label={`View profile of ${rel.name}`}>
                        <img
                          src={rel.image}
                          alt={rel.name}
                          className="alv-card-photo-img"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget
                            if (!target.src.includes('doc-sharma-general.jpg')) {
                              target.src = '/images/doctors/doc-sharma-general.jpg'
                            }
                          }}
                        />
                      </Link>
                      <span className="alv-card-badge">{rel.badge}</span>
                      <span className="alv-card-room-pill">{rel.room}</span>
                    </div>

                    {/* Body Info */}
                    <div className="alv-card-body">
                      <span className="alv-card-dept-tag">{rel.departmentName}</span>
                      <h3 className="alv-card-name">
                        <Link to={relProfileUrl}>{rel.name}</Link>
                      </h3>
                      <div className="alv-card-degree">{rel.degree}</div>

                      {/* Action Buttons Cluster */}
                      <div className="alv-card-actions">
                        <Link to={relBookUrl} className="alv-card-btn-schedule">
                          <span>Schedule Appointment</span>
                        </Link>
                        <Link to={relProfileUrl} className="alv-card-btn-profile">
                          <span>View Profile</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </Reveal>
          </section>
        )}
      </div>
    </PatientSiteLayout>
  )
}
