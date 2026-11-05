import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PatientSiteLayout from '../../components/PatientSiteLayout'
import DoctorDayTrack from '../../components/DoctorDayTrack'
import { getDoctors } from '../../api/client'
import type { Doctor } from '../../api/types'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useAuth } from '../../context/AuthContext'
import {
  CLINIC_DEPARTMENTS,
  mergeUnifiedDoctors,
} from '../../utils/doctorDirectoryData'
import type { DepartmentMeta, UnifiedDoctor } from '../../utils/doctorDirectoryData'
import './doctors-directory.css'

function renderDeptIcon(iconType?: string) {
  switch (iconType) {
    case 'cardiology':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )
    case 'ortho':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6" />
          <path d="M12 9v12" />
          <circle cx="12" cy="5" r="2" />
        </svg>
      )
    case 'pediatrics':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      )
    case 'dental':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8 2 5 5 5 9c0 3.5 1.5 7 2.5 10.5C8.5 23 10 23 10 20c0-2.5 1-4 2-4s2 1.5 2 4c0 3 1.5 3 2.5-.5C17.5 16 19 12.5 19 9c0-4-3-7-7-7z" />
        </svg>
      )
    case 'derma':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    case 'medicine':
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
          <path d="M9 12.5v3a4.5 4.5 0 0 0 9 0v-1.5" />
          <circle cx="18" cy="14" r="2.5" />
        </svg>
      )
  }
}

export default function DoctorsDirectory() {
  usePageTitle('Our Doctors & Medical Specialists', 'Patient')
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

  const bookUrlFor = (doc: UnifiedDoctor) => {
    const base = isPatient ? '/patient/book' : '/patient/login?next=%2Fpatient%2Fbook'
    const params = new URLSearchParams()
    if (doc.dbId) params.set('doctor_id', String(doc.dbId))
    if (doc.name) params.set('doctor', doc.name)
    if (doc.departmentId) params.set('department_id', String(doc.departmentId))
    return `${base}?${params.toString()}`
  }

  return (
    <PatientSiteLayout>
      <div className="dr-directory-page">
        {/* ==================================================================
            1. HERO HEADER
            ================================================================== */}
        <header className="dr-hero">
          <div className="dr-hero-inner">
            <nav className="dr-breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="dr-breadcrumbs-sep">/</span>
              <span aria-current="page">Our Doctors</span>
            </nav>

            <span className="dr-hero-kicker">Faculty &amp; Specialists Directory</span>
            <h1 className="dr-hero-title">Our Trusted Doctors &amp; Specialists</h1>
            <p className="dr-hero-lead">
              Meet our board-certified medical specialists, senior diagnosticians, and surgeons.
              Experience unhurried consultations, dedicated OPD suites, and calm, transparent healthcare for your whole family.
            </p>

            <div className="dr-hero-stats">
              <div className="dr-stat-pill">
                <span className="dr-stat-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <div>
                  <span className="dr-stat-num">{allDoctors.length}+ Specialists</span>
                  <span className="dr-stat-label">Full Clinical Faculty</span>
                </div>
              </div>

              <div className="dr-stat-pill">
                <span className="dr-stat-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <div>
                  <span className="dr-stat-num">6-Day OPD</span>
                  <span className="dr-stat-label">Mon – Sat Consultations</span>
                </div>
              </div>

              <div className="dr-stat-pill">
                <span className="dr-stat-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
                  </svg>
                </span>
                <div>
                  <span className="dr-stat-num">Private Suites</span>
                  <span className="dr-stat-label">Unhurried OPD Rooms</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ==================================================================
            2. SEARCH & DEPARTMENT FILTER CONTROLS BAR
            ================================================================== */}
        <section className="dr-controls-bar" aria-label="Search and filter doctors">
          <div className="dr-controls-inner">
            <div className="dr-controls-top">
              <div className="dr-search-box">
                <span className="dr-search-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="search"
                  className="dr-search-input"
                  placeholder="Search doctor by name, qualification, or condition..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  aria-label="Search doctors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="dr-search-clear"
                    onClick={() => handleSearchChange('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="dr-view-modes" role="radiogroup" aria-label="View format">
                <button
                  type="button"
                  className={`dr-view-btn ${viewMode === 'sections' ? 'is-active' : ''}`}
                  onClick={() => handleViewChange('sections')}
                  aria-checked={viewMode === 'sections'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                  <span>Department Wise</span>
                </button>
                <button
                  type="button"
                  className={`dr-view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                  onClick={() => handleViewChange('grid')}
                  aria-checked={viewMode === 'grid'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>All Doctors</span>
                </button>
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="dr-dept-pills-row" role="tablist" aria-label="Filter by department">
              <button
                type="button"
                className={`dr-dept-pill ${selectedDept === 'all' ? 'is-active' : ''}`}
                onClick={() => handleDeptSelect('all')}
                role="tab"
                aria-selected={selectedDept === 'all'}
              >
                <span>All Departments</span>
                <span className="dr-dept-pill-count">{departmentCounts.all || allDoctors.length}</span>
              </button>

              {CLINIC_DEPARTMENTS.map((dept) => {
                const count = departmentCounts[dept.slug] || 0
                if (count === 0 && selectedDept !== dept.slug) return null
                return (
                  <button
                    key={dept.id}
                    type="button"
                    className={`dr-dept-pill ${selectedDept === dept.slug ? 'is-active' : ''}`}
                    onClick={() => handleDeptSelect(dept.slug)}
                    role="tab"
                    aria-selected={selectedDept === dept.slug}
                  >
                    <span>{dept.name}</span>
                    <span className="dr-dept-pill-count">{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* ==================================================================
            3. DOCTORS DIRECTORY CONTENT
            ================================================================== */}
        <main className="dr-main-container">
          <div className="dr-results-count">
            Showing <strong>{filteredDoctors.length}</strong> doctor{filteredDoctors.length === 1 ? '' : 's'}
            {selectedDept !== 'all' && (
              <> in <strong>{CLINIC_DEPARTMENTS.find((d) => d.slug === selectedDept)?.name || selectedDept}</strong></>
            )}
            {searchQuery && (
              <> matching &ldquo;<strong>{searchQuery}</strong>&rdquo;</>
            )}
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="dr-empty-state">
              <span className="dr-empty-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <h3 className="dr-empty-title">No doctors match your criteria</h3>
              <p className="dr-empty-desc">
                Try searching with a different doctor name, specialty keyword, or choose &ldquo;All Departments&rdquo;.
              </p>
              <button type="button" className="dr-empty-reset-btn" onClick={clearAllFilters}>
                Reset all filters
              </button>
            </div>
          ) : viewMode === 'sections' && selectedDept === 'all' ? (
            /* -------------------------------------------------------------
               DEPARTMENT-WISE SECTIONS VIEW (Neat grouping requested)
               ------------------------------------------------------------- */
            departmentSections.map(({ meta, doctors }) => (
              <section key={meta.id} className="dr-dept-section" id={`dept-${meta.slug}`}>
                <div className="dr-dept-header">
                  <div className="dr-dept-header-left">
                    <div className="dr-dept-icon-box" aria-hidden="true">
                      {renderDeptIcon(meta.icon)}
                    </div>
                    <div className="dr-dept-title-wrap">
                      <h2>{meta.name}</h2>
                      <p>{meta.tagline}</p>
                    </div>
                  </div>

                  <Link to={`/specialties/${meta.slug}`} className="dr-dept-specialty-link">
                    <span>Department overview &amp; services</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="dr-cards-grid">
                  {doctors.map((doc) => (
                    <DoctorCard key={String(doc.id)} doc={doc} bookUrl={bookUrlFor(doc)} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            /* -------------------------------------------------------------
               UNIFIED GRID VIEW (When filtered or Grid selected)
               ------------------------------------------------------------- */
            <div className="dr-cards-grid">
              {filteredDoctors.map((doc) => (
                <DoctorCard key={String(doc.id)} doc={doc} bookUrl={bookUrlFor(doc)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </PatientSiteLayout>
  )
}

function DoctorCard({ doc, bookUrl }: { doc: UnifiedDoctor; bookUrl: string }) {
  const profileUrl = `/doctors/${doc.slug || doc.id}`

  return (
    <article className="dr-card">
      <div className="dr-card-photo-wrap">
        <Link to={profileUrl} aria-label={`View profile of ${doc.name}`}>
          <img
            src={doc.image}
            alt={doc.name}
            className="dr-card-img"
            loading="lazy"
            onError={(e) => {
              // Fallback to default photo if file path doesn't load
              const target = e.currentTarget
              if (!target.src.includes('doc-sharma-general.jpg')) {
                target.src = '/images/doctors/doc-sharma-general.jpg'
              }
            }}
          />
        </Link>
        <span className="dr-card-badge">{doc.badge}</span>
        <span className="dr-card-room-pill">{doc.room}</span>
      </div>

      <div className="dr-card-body">
        <span className="dr-card-dept-tag">{doc.departmentName}</span>
        <h3 className="dr-card-name">
          <Link to={profileUrl}>{doc.name}</Link>
        </h3>
        <div className="dr-card-degree">{doc.degree}</div>
        <p className="dr-card-spec-lead">{doc.specialization}</p>

        {/* Schedule Strip */}
        <div className="dr-card-schedule-box">
          <div className="dr-card-schedule-head">
            <span>Weekly OPD Days:</span>
            <span className="dr-card-hours">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {doc.hoursSummary}
            </span>
          </div>
          <DoctorDayTrack availability={doc.availability} showSummary={false} size="sm" />
        </div>

        {/* Action Buttons */}
        <div className="dr-card-actions">
          <Link to={profileUrl} className="dr-btn-profile">
            <span>View Profile</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link to={bookUrl} className="dr-btn-book">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Book Visit</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
