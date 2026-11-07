import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PatientSiteLayout from '../../components/PatientSiteLayout'
import { getDoctors } from '../../api/client'
import type { Doctor } from '../../api/types'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useAuth } from '../../context/AuthContext'
import {
  CLINIC_DEPARTMENTS,
  mergeUnifiedDoctors,
} from '../../utils/doctorDirectoryData'
import type { DepartmentMeta, UnifiedDoctor } from '../../utils/doctorDirectoryData'
import { Reveal, CountUp } from '../../components/motion'
import './doctors-directory.css'

function renderDeptIcon(iconType?: string) {
  switch (iconType) {
    case 'cardiology':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )
    case 'ortho':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6" />
          <path d="M12 9v12" />
          <circle cx="12" cy="5" r="2" />
        </svg>
      )
    case 'pediatrics':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      )
    case 'dental':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8 2 5 5 5 9c0 3.5 1.5 7 2.5 10.5C8.5 23 10 23 10 20c0-2.5 1-4 2-4s2 1.5 2 4c0 3 1.5 3 2.5-.5C17.5 16 19 12.5 19 9c0-4-3-7-7-7z" />
        </svg>
      )
    case 'derma':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 4.24 4.24" />
          <path d="m14.83 9.17 4.24-4.24" />
          <path d="m14.83 14.83 4.24 4.24" />
          <path d="m9.17 14.83-4.24 4.24" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      )
    case 'neuro':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    case 'medicine':
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
          <path d="M9 12.5v3a4.5 4.5 0 0 0 9 0v-1.5" />
          <circle cx="18" cy="14" r="2.5" />
        </svg>
      )
  }
}

export default function DoctorsDirectory() {
  usePageTitle('Our Best Doctors & Department Specialists', 'Patient')
  const { user } = useAuth()
  const isPatient = user?.role === 'patient'
  const [searchParams, setSearchParams] = useSearchParams()

  const [dbDoctors, setDbDoctors] = useState<Doctor[]>([])

  // Filter & Search states
  const selectedDept = searchParams.get('dept') || 'all'
  const searchQuery = searchParams.get('q') || ''
  const viewMode = (searchParams.get('view') as 'sections' | 'grid') || 'sections'

  // Fetch doctors from backend
  useEffect(() => {
    let mounted = true
    getDoctors()
      .then((res) => {
        if (mounted) setDbDoctors(res.data || [])
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  // Unified list of doctors
  const allDoctors = useMemo(() => {
    return mergeUnifiedDoctors(dbDoctors)
  }, [dbDoctors])

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return allDoctors.filter((doc) => {
      // Dept filter
      if (selectedDept !== 'all') {
        const matchesSlug = doc.departmentSlug.includes(selectedDept) || selectedDept.includes(doc.departmentSlug)
        const matchesName = doc.departmentName.toLowerCase().includes(selectedDept.toLowerCase())
        if (!matchesSlug && !matchesName) return false
      }

      // Query filter
      if (q) {
        const matchName = doc.name.toLowerCase().includes(q)
        const matchSpec = doc.specialization.toLowerCase().includes(q)
        const matchDept = doc.departmentName.toLowerCase().includes(q)
        const matchDegree = doc.degree.toLowerCase().includes(q)
        const matchSkills = doc.specializations.some((s) => s.toLowerCase().includes(q))
        if (!matchName && !matchSpec && !matchDept && !matchDegree && !matchSkills) {
          return false
        }
      }

      return true
    })
  }, [allDoctors, selectedDept, searchQuery])

  // Department counts
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allDoctors.length }
    CLINIC_DEPARTMENTS.forEach((d) => {
      counts[d.slug] = allDoctors.filter(
        (doc) => doc.departmentSlug.includes(d.slug) || d.slug.includes(doc.departmentSlug)
      ).length
    })
    return counts
  }, [allDoctors])

  // Grouped by department for department-wise view
  const departmentSections = useMemo(() => {
    const sections: Array<{
      meta: DepartmentMeta
      doctors: UnifiedDoctor[]
    }> = []

    CLINIC_DEPARTMENTS.forEach((dept) => {
      const docsInDept = filteredDoctors.filter(
        (doc) => doc.departmentSlug.includes(dept.slug) || dept.slug.includes(doc.departmentSlug)
      )
      if (docsInDept.length > 0) {
        sections.push({
          meta: dept,
          doctors: docsInDept,
        })
      }
    })

    // Capture any uncategorized doctors
    const categorizedIds = new Set(sections.flatMap((s) => s.doctors.map((d) => d.id)))
    const uncategorized = filteredDoctors.filter((d) => !categorizedIds.has(d.id))
    if (uncategorized.length > 0) {
      sections.push({
        meta: {
          id: 'other',
          name: 'Specialist Consultants',
          slug: 'other',
          tagline: 'Outpatient specialist consulting clinics',
          icon: 'medicine',
          description: 'Specialized clinical outpatient services.',
        },
        doctors: uncategorized,
      })
    }

    return sections
  }, [filteredDoctors])

  const handleDeptSelect = (slug: string) => {
    const next = new URLSearchParams(searchParams)
    if (slug === 'all') {
      next.delete('dept')
    } else {
      next.set('dept', slug)
    }
    setSearchParams(next, { replace: true })
  }

  const handleSearchChange = (val: string) => {
    const next = new URLSearchParams(searchParams)
    if (!val) {
      next.delete('q')
    } else {
      next.set('q', val)
    }
    setSearchParams(next, { replace: true })
  }

  const handleViewChange = (mode: 'sections' | 'grid') => {
    const next = new URLSearchParams(searchParams)
    next.set('view', mode)
    setSearchParams(next, { replace: true })
  }

  const clearAllFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const scrollToCatalog = () => {
    const el = document.getElementById('dept-catalog')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const bookUrlFor = (doc: UnifiedDoctor) => {
    const base = isPatient ? '/patient/book' : '/patient/login?next=%2Fpatient%2Fbook'
    const params = new URLSearchParams()
    if (doc.dbId) params.set('doctor_id', String(doc.dbId))
    if (doc.name) params.set('doctor', doc.name)
    if (doc.departmentId) params.set('department_id', String(doc.departmentId))
    return `${base}?${params.toString()}`
  }

  const generalBookUrl = isPatient ? '/patient/book' : '/patient/login?next=%2Fpatient%2Fbook'

  return (
    <PatientSiteLayout>
      <div className="alv-doctors-landing">
        {/* ==================================================================
            1. HERO SECTION (MATCHING SCREENSHOT LAYOUT & OUR COLOR THEME)
            ================================================================== */}
        <section className="alv-doc-hero">
          <div className="alv-doc-hero-container">
            {/* Left Copy & Action Cluster */}
            <div className="alv-doc-hero-content">
              <div className="alv-doc-hero-kicker">
                <span className="alv-kicker-line" />
                <span>Meet With Senior Faculty</span>
              </div>

              <h1 className="alv-doc-hero-title">
                Our Best <br />
                <span className="alv-title-highlight">Doctors</span> Online
              </h1>

              <p className="alv-doc-hero-sub">
                Connect with board-certified physicians, senior diagnosticians, and surgeons across all major clinical departments. Experience transparent healthcare, dedicated OPD suites, and unhurried consultations.
              </p>

              <div className="alv-doc-hero-actions">
                <Link to={generalBookUrl} className="alv-btn-primary">
                  <span>Schedule Appointment</span>
                </Link>
                <button
                  type="button"
                  onClick={scrollToCatalog}
                  className="alv-btn-outline"
                >
                  <span>Explore Departments</span>
                </button>
              </div>

              {/* Trust Micro-Metrics */}
              <div className="alv-hero-trust-strip">
                <div className="alv-trust-item">
                  <span className="alv-trust-dot" />
                  <span>Verified MD / MS Specialists</span>
                </div>
                <div className="alv-trust-item">
                  <span className="alv-trust-dot" />
                  <span>Real-Time Token Queue</span>
                </div>
                <div className="alv-trust-item">
                  <span className="alv-trust-dot" />
                  <span>Mon – Sat OPD Clinics</span>
                </div>
              </div>
            </div>

            {/* Right Doctor Visual (Matches Reference Pose) */}
            <div className="alv-doc-hero-visual">
              <div className="alv-hero-img-backdrop">
                <div className="alv-hero-circle-accent" />
                <img
                  src="/images/doctors-hero-banner.jpg"
                  alt="Senior Physician at Alverstone Medcity"
                  className="alv-hero-doctor-img"
                  loading="eager"
                  onError={(e) => {
                    const target = e.currentTarget
                    if (!target.src.includes('patient-hero-doctors.jpg')) {
                      target.src = '/images/patient-hero-doctors.jpg'
                    }
                  }}
                />

                {/* Floating Badge 1: Rating Seal */}
                <div className="alv-floating-seal alv-seal-rating">
                  <div className="alv-seal-icon">★</div>
                  <div>
                    <strong>4.9 Rating</strong>
                    <span>4,200+ Reviews</span>
                  </div>
                </div>

                {/* Floating Badge 2: Certified Specialists */}
                <div className="alv-floating-seal alv-seal-certified">
                  <div className="alv-seal-check">✓</div>
                  <div>
                    <strong>Certified Specialists</strong>
                    <span>Board-Certified Faculty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. STATS SECTION (MATCHING REFERENCE STATS BAR)
            ================================================================== */}
        <section className="alv-stats-section" aria-label="Hospital Statistics">
          <div className="alv-stats-container">
            <div className="alv-stats-header">
              <h2 className="alv-stats-heading">
                Our Stats show that we&rsquo;ve <br className="alv-stats-br" />
                <span>Happy Patients</span>
              </h2>
              <p className="alv-stats-lead">
                Dedicated to clinical precision, warm bedside manner, and comforting healthcare excellence every day.
              </p>
            </div>

            <div className="alv-stats-grid">
              <div className="alv-stat-card">
                <h3 className="alv-stat-val">
                  <CountUp to={25356} suffix="+" />
                </h3>
                <p className="alv-stat-lbl">Patients Served</p>
                <span className="alv-stat-sub">Across South Kerala</span>
              </div>

              <div className="alv-stat-card">
                <h3 className="alv-stat-val">
                  <CountUp to={6050} suffix="+" />
                </h3>
                <p className="alv-stat-lbl">Consultations</p>
                <span className="alv-stat-sub">Completed This Month</span>
              </div>

              <div className="alv-stat-card">
                <h3 className="alv-stat-val">
                  <CountUp to={21} suffix="+" />
                </h3>
                <p className="alv-stat-lbl">Specialist Suites</p>
                <span className="alv-stat-sub">Dedicated OPD Rooms</span>
              </div>

              <div className="alv-stat-card">
                <h3 className="alv-stat-val">
                  <CountUp to={99} suffix="%" />
                </h3>
                <p className="alv-stat-lbl">Satisfaction Rate</p>
                <span className="alv-stat-sub">Verified Feedback</span>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. ABOUT US STORY SECTION (MATCHING SCREENSHOT ABOUT SECTION)
            ================================================================== */}
        <section className="alv-about-strip" aria-label="About Our Medical Faculty">
          <div className="alv-about-container">
            <Reveal direction="left" className="alv-about-content">
              <span className="alv-about-kicker">About Us</span>
              <h2 className="alv-about-title">
                Unhurried Medical Care with Senior Specialists
              </h2>
              <p className="alv-about-body">
                Alverstone Medcity was founded on a simple conviction: medicine works best when doctors have the time to truly listen. Our multispecialty faculty brings together senior internists, interventional cardiologists, pediatricians, orthopedic surgeons, and dermatologists in one harmonious campus.
              </p>
              <p className="alv-about-body">
                From digital token tracking that eliminates crowded waiting rooms to an accredited pathology lab delivering fast automated reports, every touchpoint is designed around patient comfort and scientific precision.
              </p>

              <div className="alv-about-points">
                <div className="alv-about-point">
                  <span className="alv-point-check">✓</span>
                  <span>Board-Certified MD / MS Specialists Only</span>
                </div>
                <div className="alv-about-point">
                  <span className="alv-point-check">✓</span>
                  <span>Modern Consultation Suites &amp; Digital Tokens</span>
                </div>
                <div className="alv-about-point">
                  <span className="alv-point-check">✓</span>
                  <span>In-House NABL Diagnostics &amp; 24/7 Pharmacy</span>
                </div>
              </div>

              <Link to="/about" className="alv-about-link">
                <span>Read More About Our Hospital →</span>
              </Link>
            </Reveal>

            <Reveal direction="right" className="alv-about-visual">
              <div className="alv-about-frame">
                <img
                  src="/images/patient-about.jpg"
                  alt="Doctor consulting warmly with patient"
                  className="alv-about-img"
                  onError={(e) => {
                    const target = e.currentTarget
                    if (!target.src.includes('patient-care-banner.jpg')) {
                      target.src = '/images/patient-care-banner.jpg'
                    }
                  }}
                />
                <div className="alv-about-badge">
                  <strong>Patient-First Ethos</strong>
                  <span>Compassion &amp; Precision</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ==================================================================
            4. HOW IT WORKS SECTION (MATCHING 4-STEP SCREENSHOT ROW)
            ================================================================== */}
        <section className="alv-how-section" aria-label="How Booking Works">
          <div className="alv-how-container">
            <div className="alv-how-header">
              <span className="alv-how-kicker">Simple 4-Step Process</span>
              <h2 className="alv-how-title">How It Works</h2>
              <p className="alv-how-lead">
                Book your specialist consultation online in less than two minutes and arrive with guaranteed queue priority.
              </p>
            </div>

            <Reveal direction="up" stagger={0.09} className="alv-how-grid">
              <div className="alv-how-card">
                <div className="alv-how-step-num">01</div>
                <div className="alv-how-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <h4 className="alv-how-card-title">Pick Department</h4>
                <p className="alv-how-card-text">
                  Choose from General Medicine, Cardiology, Orthopedics, Pediatrics, Dental, Derma, or Neurology.
                </p>
              </div>

              <div className="alv-how-card">
                <div className="alv-how-step-num">02</div>
                <div className="alv-how-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h4 className="alv-how-card-title">Select Doctor</h4>
                <p className="alv-how-card-text">
                  Review verified credentials, room number, clinical biography, and weekly OPD day schedules.
                </p>
              </div>

              <div className="alv-how-card">
                <div className="alv-how-step-num">03</div>
                <div className="alv-how-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h4 className="alv-how-card-title">Schedule Appointment</h4>
                <p className="alv-how-card-text">
                  Lock in your exact time slot with instant token generation without any booking fee partiality.
                </p>
              </div>

              <div className="alv-how-card">
                <div className="alv-how-step-num">04</div>
                <div className="alv-how-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 14" />
                  </svg>
                </div>
                <h4 className="alv-how-card-title">Start Consultation</h4>
                <p className="alv-how-card-text">
                  Walk into the specialist suite when your token appears on the waiting room digital display.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ==================================================================
            5. OUR BEST DOCTORS / DEPARTMENT-WISE CATALOG SECTION
            ================================================================== */}
        <section className="alv-catalog-section" id="dept-catalog" aria-label="Our Doctors Catalog">
          <div className="alv-catalog-container">
            <div className="alv-catalog-header">
              <span className="alv-catalog-kicker">Faculty &amp; Specialists Directory</span>
              <h2 className="alv-catalog-title">Our Best Doctors</h2>
              <p className="alv-catalog-lead">
                Browse our complete medical faculty grouped department by department, or use filters to find the exact specialist you need.
              </p>
            </div>

            {/* Department Filter Pills Track */}
            <div className="alv-dept-pills-wrap" role="tablist" aria-label="Filter by department">
              <button
                type="button"
                className={`alv-dept-pill ${selectedDept === 'all' ? 'active' : ''}`}
                onClick={() => handleDeptSelect('all')}
              >
                <span>All Departments</span>
                <span className="alv-pill-count">{departmentCounts.all ?? allDoctors.length}</span>
              </button>

              {CLINIC_DEPARTMENTS.map((dept) => {
                const count = departmentCounts[dept.slug] ?? 0
                return (
                  <button
                    key={dept.id}
                    type="button"
                    className={`alv-dept-pill ${selectedDept === dept.slug ? 'active' : ''}`}
                    onClick={() => handleDeptSelect(dept.slug)}
                  >
                    <span>{dept.name}</span>
                    <span className="alv-pill-count">{count}</span>
                  </button>
                )
              })}
            </div>

            {/* Search Box & View Mode Toggle */}
            <div className="alv-search-bar-row">
              <div className="alv-search-box">
                <svg className="alv-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="search"
                  className="alv-search-input"
                  placeholder="Search doctor by name, qualification, or condition..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  aria-label="Search doctors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="alv-search-clear"
                    onClick={() => handleSearchChange('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="alv-view-toggle">
                <button
                  type="button"
                  className={`alv-view-btn ${viewMode === 'sections' ? 'active' : ''}`}
                  onClick={() => handleViewChange('sections')}
                  title="Department-wise grouped view"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                  <span>Department Wise</span>
                </button>
                <button
                  type="button"
                  className={`alv-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => handleViewChange('grid')}
                  title="All doctors unified grid"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>All Doctors</span>
                </button>
              </div>
            </div>

            {/* Results Counter / Filter Indicator */}
            {(selectedDept !== 'all' || searchQuery) && (
              <div className="alv-filter-banner">
                <span>
                  Showing <strong>{filteredDoctors.length}</strong> matching specialist{filteredDoctors.length === 1 ? '' : 's'}
                  {selectedDept !== 'all' && <> in <em>{CLINIC_DEPARTMENTS.find((d) => d.slug === selectedDept)?.name || selectedDept}</em></>}
                  {searchQuery && <> matching &ldquo;{searchQuery}&rdquo;</>}
                </span>
                <button type="button" onClick={clearAllFilters} className="alv-clear-link">
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Cards Output */}
            {filteredDoctors.length === 0 ? (
              <div className="alv-empty-box">
                <span className="alv-empty-icon" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <h3 className="alv-empty-title">No doctors match your criteria</h3>
                <p className="alv-empty-desc">
                  Try searching with a different doctor name, specialty keyword, or choose &ldquo;All Departments&rdquo;.
                </p>
                <button type="button" className="alv-btn-primary" onClick={clearAllFilters}>
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'sections' && selectedDept === 'all' ? (
              /* DEPARTMENT-WISE SECTIONS VIEW */
              departmentSections.map(({ meta, doctors }) => (
                <section key={meta.id} className="alv-dept-block" id={`dept-${meta.slug}`}>
                  <div className="alv-dept-block-header">
                    <div className="alv-dept-block-left">
                      <div className="alv-dept-icon-circle" aria-hidden="true">
                        {renderDeptIcon(meta.icon)}
                      </div>
                      <div>
                        <h3 className="alv-dept-block-title">{meta.name}</h3>
                        <p className="alv-dept-block-tagline">{meta.tagline}</p>
                      </div>
                    </div>

                    <Link to={`/specialties/${meta.slug}`} className="alv-dept-overview-link">
                      <span>Department Overview &amp; Services →</span>
                    </Link>
                  </div>

                  <div className="alv-doctors-cards-grid">
                    {doctors.map((doc) => (
                      <ModernDoctorCard key={String(doc.id)} doc={doc} bookUrl={bookUrlFor(doc)} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              /* UNIFIED GRID VIEW */
              <div className="alv-doctors-cards-grid">
                {filteredDoctors.map((doc) => (
                  <ModernDoctorCard key={String(doc.id)} doc={doc} bookUrl={bookUrlFor(doc)} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ==================================================================
            6. TESTIMONIALS SECTION (MATCHING SCREENSHOT CLIENT REVIEWS)
            ================================================================== */}
        <section className="alv-reviews-section" aria-label="Patient Testimonials">
          <div className="alv-reviews-container">
            <div className="alv-reviews-header">
              <span className="alv-reviews-kicker">Patient Experiences</span>
              <h2 className="alv-reviews-title">What Clients Say About Us</h2>
              <p className="alv-reviews-lead">
                Real feedback from families who entrusted their health to our clinical team.
              </p>
            </div>

            <Reveal direction="up" stagger={0.09} className="alv-reviews-grid">
              <div className="alv-review-card">
                <div className="alv-review-stars">★★★★★</div>
                <blockquote className="alv-review-quote">
                  &ldquo;Dr. Priya Sharma took the time to explain my ECG and cardiac results in clear detail with zero rush. The waiting lounge was calm and the digital token made everything orderly.&rdquo;
                </blockquote>
                <div className="alv-review-author">
                  <strong>Ramesh Pillai</strong>
                  <span>Cardiology OPD Consultation</span>
                </div>
              </div>

              <div className="alv-review-card">
                <div className="alv-review-stars">★★★★★</div>
                <blockquote className="alv-review-quote">
                  &ldquo;Finding a pediatrician who makes children smile while receiving vaccines is rare. Dr. Sarah Jenkins is gentle, patient, and thoroughly reassuring for nervous parents.&rdquo;
                </blockquote>
                <div className="alv-review-author">
                  <strong>Anjali &amp; Vivek Nair</strong>
                  <span>Pediatrics &amp; Child Care</span>
                </div>
              </div>

              <div className="alv-review-card">
                <div className="alv-review-stars">★★★★★</div>
                <blockquote className="alv-review-quote">
                  &ldquo;From doctor consultation to on-site NABL lab blood testing and digital prescriptions, everything was completed under one roof in under 45 minutes with zero chaos.&rdquo;
                </blockquote>
                <div className="alv-review-author">
                  <strong>K. Thomas</strong>
                  <span>General &amp; Internal Medicine</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ==================================================================
            7. BOTTOM CARE CTA BANNER (ALVERSTONE SIGNATURE COLOR THEME)
            ================================================================== */}
        <section className="alv-bottom-cta-strip">
          <Reveal direction="up" className="alv-bottom-cta-inner">
            <div>
              <span className="alv-cta-eyebrow">24/7 Clinical Support</span>
              <h3 className="alv-cta-title">Need Immediate Medical Advice or Assistance?</h3>
              <p className="alv-cta-desc">
                Our care concierge and 24/7 emergency team are available round the clock to guide your visit.
              </p>
            </div>

            <div className="alv-cta-btns-row">
              <a href="tel:04742712233" className="alv-cta-phone-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Call Care Desk: 0474 271 2233</span>
              </a>
              <Link to={generalBookUrl} className="alv-cta-book-btn">
                <span>Book Appointment Online</span>
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </PatientSiteLayout>
  )
}

/**
 * Modern Doctor Card component tailored to match the screenshot layout
 * with our signature Alverstone Medcity color palette.
 */
function ModernDoctorCard({ doc, bookUrl }: { doc: UnifiedDoctor; bookUrl: string }) {
  const profileUrl = `/doctors/${doc.slug || doc.id}`

  return (
    <article className="alv-doctor-card">
      {/* Top Portrait Wrap */}
      <div className="alv-card-photo-wrap">
        <Link to={profileUrl} aria-label={`View profile of ${doc.name}`}>
          <img
            src={doc.image}
            alt={doc.name}
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
        <span className="alv-card-badge">{doc.badge}</span>
        <span className="alv-card-room-pill">{doc.room}</span>
      </div>

      {/* Body Info */}
      <div className="alv-card-body">
        <span className="alv-card-dept-tag">{doc.departmentName}</span>
        <h3 className="alv-card-name">
          <Link to={profileUrl}>{doc.name}</Link>
        </h3>
        <div className="alv-card-degree">{doc.degree}</div>

        {/* Action Buttons Cluster (Matches Screenshot) */}
        <div className="alv-card-actions">
          <Link to={bookUrl} className="alv-card-btn-schedule">
            <span>Schedule Appointment</span>
          </Link>
          <Link to={profileUrl} className="alv-card-btn-profile">
            <span>View Profile</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}
