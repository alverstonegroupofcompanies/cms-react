import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getTvDisplay } from '../api/client'
import type { TvDisplayData, TvDoctorData } from '../api/types'
import { clinicAudioNotifier } from '../utils/soundAlert'
import BrandLogo from '../components/BrandLogo'
import '../tv-display.css'

export default function TvDisplay() {
  const [searchParams, setSearchParams] = useSearchParams()
  const paramLayout = searchParams.get('layout') as 'horizontal' | 'vertical' | null
  const initialLayout = paramLayout || 'vertical'

  const initialTheme = (searchParams.get('theme') as 'dark' | 'light') ||
    (localStorage.getItem('tv_theme') as 'dark' | 'light') ||
    'dark'

  const doctorIdParam = searchParams.get('doctor_id')
  const doctorId = doctorIdParam ? Number(doctorIdParam) : null

  const [layout, setLayout] = useState<'horizontal' | 'vertical'>(initialLayout)
  const [theme, setTheme] = useState<'dark' | 'light'>(initialTheme)
  const [data, setData] = useState<TvDisplayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('tv_sound_enabled') === 'true'
  })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [announcement, setAnnouncement] = useState<{
    token: string
    doctorName?: string
    roomNumber?: string
  } | null>(null)

  // Doctor Carousel & Auto-Loop State
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0)
  const [isAutoLooping, setIsAutoLooping] = useState(true)
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single')
  const hasInitializedDocRef = useRef(false)
  const lastCallRef = useRef<string | null>(null)

  const doctors: TvDoctorData[] = data?.doctors || []
  const currentDoctor = doctors.length > 0 ? doctors[currentDoctorIndex % doctors.length] : null
  const displayedDoctors = viewMode === 'all'
    ? doctors
    : currentDoctor
      ? [currentDoctor]
      : []

  // Switch to next doctor
  const handleNextDoctor = useCallback(() => {
    if (doctors.length <= 1) return
    setCurrentDoctorIndex((prev) => (prev + 1) % doctors.length)
  }, [doctors.length])

  // Switch to previous doctor
  const handlePrevDoctor = useCallback(() => {
    if (doctors.length <= 1) return
    setCurrentDoctorIndex((prev) => (prev - 1 + doctors.length) % doctors.length)
  }, [doctors.length])

  // Jump to specific doctor
  const handleSelectDoctor = useCallback((index: number) => {
    setCurrentDoctorIndex(index % doctors.length)
  }, [doctors.length])

  // Toggle auto-loop play/pause
  const toggleAutoLoop = useCallback(() => {
    setIsAutoLooping((prev) => !prev)
  }, [])

  // Auto-switch between doctors every 15s in background without showing progress bar/timer
  useEffect(() => {
    if (!isAutoLooping || doctors.length <= 1 || viewMode === 'all') {
      return
    }

    const timer = setInterval(() => {
      setCurrentDoctorIndex((prev) => (prev + 1) % doctors.length)
    }, 15000)

    return () => clearInterval(timer)
  }, [isAutoLooping, doctors.length, viewMode, currentDoctorIndex])

  // Sync layout changes to URL and localStorage
  const handleSetLayout = (newLayout: 'horizontal' | 'vertical') => {
    setLayout(newLayout)
    localStorage.setItem('tv_layout', newLayout)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('layout', newLayout)
    setSearchParams(nextParams)
  }

  // Sync theme changes to URL and localStorage
  const handleSetTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme)
    localStorage.setItem('tv_theme', newTheme)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('theme', newTheme)
    setSearchParams(nextParams)
  }

  const toggleTheme = () => {
    handleSetTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Sound toggle
  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    localStorage.setItem('tv_sound_enabled', String(next))
    if (next) {
      clinicAudioNotifier.playChime()
    }
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {/* ignore */})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {/* ignore */})
      setIsFullscreen(false)
    }
  }

  // Live Digital Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Keyboard shortcuts (N: Next, P: Prev, Space: Pause/Resume loop, F: Fullscreen, H: Horizontal, V: Vertical, M: Mute, T: Theme)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      } else if (e.key === 'h' || e.key === 'H') {
        handleSetLayout('horizontal')
      } else if (e.key === 'v' || e.key === 'V') {
        handleSetLayout('vertical')
      } else if (e.key === 'm' || e.key === 'M') {
        toggleSound()
      } else if (e.key === 't' || e.key === 'T') {
        toggleTheme()
      } else if (e.key === 'l' || e.key === 'L') {
        handleSetTheme('light')
      } else if (e.key === 'd' || e.key === 'D') {
        handleSetTheme('dark')
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
        handleNextDoctor()
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowLeft') {
        handlePrevDoctor()
      } else if (e.key === ' ') {
        e.preventDefault()
        toggleAutoLoop()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [soundEnabled, searchParams, theme, handleNextDoctor, handlePrevDoctor, toggleAutoLoop])

  // Fetch TV Display Queue Data (fetch all doctors to enable switching)
  const fetchData = useCallback(async () => {
    try {
      const res = await getTvDisplay()
      const tvData: TvDisplayData = res.data
      setData(tvData)
      setLoading(false)

      // Initialize doctor index once if doctor_id was given in URL
      if (!hasInitializedDocRef.current && tvData.doctors && tvData.doctors.length > 0) {
        if (doctorIdParam) {
          const initIdx = tvData.doctors.findIndex((d) => d.id === Number(doctorIdParam))
          if (initIdx !== -1) {
            setCurrentDoctorIndex(initIdx)
          }
        }
        hasInitializedDocRef.current = true
      }

      // Check for new token call event
      const latest = tvData.latest_call
      if (latest) {
        const callKey = `${latest.token_code}-${latest.called_at}`
        if (lastCallRef.current && lastCallRef.current !== callKey) {
          // Auto-switch to doctor who called the token
          const calledIdx = tvData.doctors.findIndex((d) => d.id === latest.doctor_id)
          if (calledIdx !== -1) {
            setCurrentDoctorIndex(calledIdx)
          }

          setAnnouncement({
            token: latest.token_code,
            doctorName: latest.doctor_name,
            roomNumber: latest.room_number,
          })

          if (soundEnabled) {
            clinicAudioNotifier.announce(latest.token_code, latest.doctor_name, latest.room_number)
          }

          // Clear announcement banner after 10 seconds
          window.setTimeout(() => {
            setAnnouncement((curr) => (curr?.token === latest.token_code ? null : curr))
          }, 10000)
        }
        lastCallRef.current = callKey
      }
    } catch {
      // Network hiccup - ignore and keep existing display
    }
  }, [doctorIdParam, soundEnabled])

  // Polling every 3.5 seconds
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3500)
    return () => clearInterval(interval)
  }, [fetchData])

  // Format time (HH:MM:SS) and AM/PM
  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  const [timeOnly, ampm] = timeString.split(' ')

  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Dynamic grid classes based on doctor count for vertical layout
  let gridCountClass = ''
  if (displayedDoctors.length === 1) gridCountClass = 'has-1-doc'
  else if (displayedDoctors.length === 2) gridCountClass = 'has-2-docs'
  else if (displayedDoctors.length === 3) gridCountClass = 'has-3-docs'

  return (
    <div className={`tv-screen is-${layout} is-${theme}`} id="tv-display-root" data-theme={theme}>
      {/* Top Header Bar */}
      <header className="tv-header">
        <div className="tv-brand">
          <BrandLogo
            height={44}
            onDark={theme === 'dark'}
            className="tv-suite-logo"
          />
          <div className="tv-brand-divider" aria-hidden="true" />
          <div className="tv-brand-info">
            <h1>
              {data?.clinic?.name || 'Clinic Waiting Room'}
              <span className="tv-live-beacon">
                <span className="tv-beacon-dot" /> LIVE QUEUE
              </span>
            </h1>
            <p className="tv-brand-sub">
              {currentDoctor ? (
                <>
                  <strong style={{ color: '#38bdf8' }}>{currentDoctor.name}</strong>
                  {currentDoctor.room_number && ` · Room ${currentDoctor.room_number}`}
                  {currentDoctor.department && ` · ${currentDoctor.department.name}`}
                  {doctors.length > 1 && viewMode === 'single' && (
                    <span style={{ opacity: 0.75, marginLeft: '0.45rem' }}>
                      (Doctor {(currentDoctorIndex % doctors.length) + 1} of {doctors.length})
                    </span>
                  )}
                </>
              ) : (
                doctorId ? 'Specialist Consultation Room Display' : 'Central Patient Token Display Board'
              )}
            </p>
          </div>
        </div>

        {/* Floating TV Controls */}
        <div className="tv-controls">
          {/* Doctor Switcher & 15s Auto-Loop Group */}
          {doctors.length > 1 && (
            <>
              <div className="tv-controls-group tv-doc-switcher" role="group" aria-label="Doctor carousel switcher">
                <button
                  type="button"
                  className="tv-btn-toggle"
                  onClick={handlePrevDoctor}
                  title="Previous Doctor (Key: P or Left Arrow)"
                  aria-label="Previous doctor"
                  id="tv-prev-doc-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <div
                  className="tv-doc-counter-badge"
                  title={`Viewing doctor ${(currentDoctorIndex % doctors.length) + 1} of ${doctors.length}: ${currentDoctor?.name || ''}`}
                >
                  <span className="tv-doc-num">{(currentDoctorIndex % doctors.length) + 1}</span>
                  <span className="tv-doc-total">/{doctors.length}</span>
                </div>

                <button
                  type="button"
                  className="tv-btn-toggle"
                  onClick={handleNextDoctor}
                  title="Next Doctor (Key: N or Right Arrow)"
                  aria-label="Next doctor"
                  id="tv-next-doc-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                {/* Auto-Loop Toggle */}
                <button
                  type="button"
                  className={`tv-btn-toggle tv-btn-loop ${isAutoLooping ? 'is-active' : ''}`}
                  onClick={toggleAutoLoop}
                  title={isAutoLooping ? 'Auto-switching doctors enabled (Click to pause, Key: Space)' : 'Auto-switching paused (Click to resume, Key: Space)'}
                  aria-label={isAutoLooping ? 'Pause auto-switching' : 'Resume auto-switching'}
                  id="tv-loop-toggle-btn"
                >
                  {isAutoLooping ? (
                    <span className="tv-loop-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                      Auto
                    </span>
                  ) : (
                    <span className="tv-loop-badge is-paused">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Loop
                    </span>
                  )}
                </button>

                {/* View Mode Toggle: 1 Doctor vs All Doctors */}
                <button
                  type="button"
                  className={`tv-btn-toggle ${viewMode === 'all' ? 'is-active' : ''}`}
                  onClick={() => setViewMode((m) => (m === 'single' ? 'all' : 'single'))}
                  title={viewMode === 'single' ? 'Switch to All Doctors Grid view' : 'Switch to Single Doctor (15s Loop) view'}
                  aria-label="Toggle view mode"
                  id="tv-viewmode-toggle-btn"
                >
                  {viewMode === 'single' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                    </svg>
                  )}
                </button>
              </div>

              <span className="tv-controls-divider" aria-hidden="true" />
            </>
          )}

          {/* Layout Mode Group */}
          <div className="tv-controls-group" role="group" aria-label="Display layout">
            <button
              type="button"
              className={`tv-btn-toggle ${layout === 'horizontal' ? 'is-active' : ''}`}
              onClick={() => handleSetLayout('horizontal')}
              title="Horizontal Layout (Key: H)"
              aria-label="Horizontal layout"
              id="tv-layout-horizontal-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
              </svg>
            </button>

            <button
              type="button"
              className={`tv-btn-toggle ${layout === 'vertical' ? 'is-active' : ''}`}
              onClick={() => handleSetLayout('vertical')}
              title="Vertical Layout (Key: V)"
              aria-label="Vertical layout"
              id="tv-layout-vertical-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
              </svg>
            </button>
          </div>

          <span className="tv-controls-divider" aria-hidden="true" />

          {/* Theme Mode Group: Dark & Light */}
          <div className="tv-controls-group" role="group" aria-label="Theme mode">
            <button
              type="button"
              className={`tv-btn-toggle ${theme === 'dark' ? 'is-active' : ''}`}
              onClick={() => handleSetTheme('dark')}
              title="Dark High-Contrast Mode (Key: D or T)"
              aria-label="Dark theme"
              id="tv-theme-dark-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>

            <button
              type="button"
              className={`tv-btn-toggle ${theme === 'light' ? 'is-active' : ''}`}
              onClick={() => handleSetTheme('light')}
              title="Light Clean Medical Mode (Key: L or T)"
              aria-label="Light theme"
              id="tv-theme-light-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </button>
          </div>

          <span className="tv-controls-divider" aria-hidden="true" />

          {/* Sound Toggle */}
          <button
            type="button"
            className={`tv-btn-icon ${soundEnabled ? 'is-active-sound' : ''}`}
            onClick={toggleSound}
            title={soundEnabled ? 'Sound is ON (Click to mute, Key: M)' : 'Sound is OFF (Click to unmute, Key: M)'}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            id="tv-sound-toggle-btn"
          >
            {soundEnabled ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="tv-btn-icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (Key: F)' : 'Enter Fullscreen (Key: F)'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            id="tv-fullscreen-toggle-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isFullscreen ? (
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              ) : (
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              )}
            </svg>
          </button>
        </div>

        {/* Digital Clock */}
        <div className="tv-clock-wrap">
          <div className="tv-digital-clock">
            {timeOnly}
            <span className="tv-clock-ampm">{ampm}</span>
          </div>
          <div className="tv-date-display">{dateString}</div>
        </div>
      </header>



      {/* Real-time Call Announcement Banner */}
      {announcement && (
        <div className="tv-announcement-overlay">
          <div className="tv-announcement-pulse-icon">🔔</div>
          <div className="tv-announcement-body">
            <p className="tv-announcement-kicker">NOW CALLING PATIENT</p>
            <div className="tv-announcement-title">
              Token <span className="tv-announcement-token">{announcement.token}</span>
              <span>Please proceed to</span>
              <span className="tv-announcement-room">{announcement.roomNumber || 'Consultation Room'}</span>
            </div>
            {announcement.doctorName && (
              <p style={{ margin: '0.4rem 0 0', fontSize: '1.15rem', color: '#e0f2fe' }}>
                With {announcement.doctorName}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area: Doctor Display Sections */}
      <main className="tv-main-content">
        {/* Floating Side Nav Chevrons */}
        {doctors.length > 1 && viewMode === 'single' && (
          <>
            <button
              type="button"
              className="tv-side-nav-btn tv-side-prev"
              onClick={handlePrevDoctor}
              title="Previous Doctor (Key: P or Left Arrow)"
              aria-label="Previous doctor"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="tv-side-nav-btn tv-side-next"
              onClick={handleNextDoctor}
              title="Next Doctor (Key: N or Right Arrow)"
              aria-label="Next doctor"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {loading && doctors.length === 0 ? (
          <div className="tv-empty-container">
            <div className="tv-beacon-dot" style={{ margin: '0 auto 1.5rem', width: '20px', height: '20px' }} />
            <h2 className="tv-empty-heading">Connecting to Live Clinic Queue…</h2>
            <p className="tv-empty-sub">Loading doctor schedules and token states</p>
          </div>
        ) : displayedDoctors.length === 0 ? (
          <div className="tv-empty-container">
            <h2 className="tv-empty-heading">No Active Doctors on Duty</h2>
            <p className="tv-empty-sub">
              Please contact the reception desk for token assistance.
            </p>
          </div>
        ) : (
          <>
            <div className={`tv-doctor-grid ${gridCountClass}`}>
            {displayedDoctors.map((doc) => {
              const current = doc.current_token
              const waiting = doc.waiting_tokens || []
              const isConsulting = doc.status === 'in_consultation' || Boolean(current)

              return (
                <section
                  key={doc.id}
                  className={`tv-doctor-card ${isConsulting ? 'is-consulting' : ''}`}
                  id={`doctor-display-${doc.id}`}
                >
                  {/* Doctor Profile Header */}
                  <div className="tv-card-head">
                    <div className="tv-doctor-profile">
                      <div className="tv-doctor-avatar-wrap">
                        {doc.photo_url ? (
                          <img src={doc.photo_url} alt={doc.name} />
                        ) : (
                          <div className="tv-doctor-avatar-placeholder">
                            {doc.name.replace(/^Dr\.\s*/i, '').charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="tv-doctor-info">
                        <h2 className="tv-doctor-name">{doc.name}</h2>
                        <div className="tv-doctor-dept">
                          {doc.department?.name || 'Department'}
                        </div>
                        <div className="tv-doctor-spec">{doc.specialization}</div>
                      </div>
                    </div>

                    {/* Room Badge */}
                    <div className="tv-room-badge">
                      <span className="tv-room-badge-kicker">ROOM</span>
                      {doc.room_number || `OPD ${doc.id}`}
                    </div>
                  </div>

                  {/* Now Serving Section */}
                  <div className={`tv-card-serving ${current ? 'has-token' : ''}`}>
                    <div className="tv-serving-kicker">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      NOW SERVING
                    </div>

                    {current ? (
                      <>
                        <div className="tv-serving-token-number">
                          {current.display_code}
                        </div>
                        <div className="tv-serving-patient">
                          {current.patient_name}
                        </div>
                        {current.patient_code && (
                          <div className="tv-serving-patient-code">
                            ID: {current.patient_code}
                          </div>
                        )}
                        <div className="tv-serving-status-badge">
                          <span className="tv-beacon-dot" style={{ width: '6px', height: '6px' }} />
                          IN CONSULTATION
                        </div>
                      </>
                    ) : (
                      <div className="tv-serving-empty">
                        {waiting.length > 0 ? (
                          <>
                            <div className="tv-serving-calling-next">CALLING NEXT...</div>
                            <p className="tv-serving-empty-sub">Next patient please prepare to enter</p>
                          </>
                        ) : (
                          <>
                            <p className="tv-serving-empty-title">DOCTOR AVAILABLE</p>
                            <p className="tv-serving-empty-sub">No patients currently in waiting queue</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Upcoming Waiting Queue */}
                  <div className="tv-card-upcoming">
                    <div>
                      <div className="tv-upcoming-head">
                        <h3 className="tv-upcoming-title">NEXT IN QUEUE</h3>
                        <span className={`tv-waiting-count-pill ${doc.waiting_count > 0 ? 'is-active' : ''}`}>
                          {doc.waiting_count} Waiting
                        </span>
                      </div>

                      {waiting.length === 0 ? (
                        <div className="tv-upcoming-empty-msg">No patients waiting in queue</div>
                      ) : (
                        <div className="tv-upcoming-tokens-list">
                          {waiting.map((token) => (
                            <div key={token.id} className="tv-upcoming-token-item">
                              <span className="tv-upcoming-pos">#{token.position}</span>
                              <span className="tv-upcoming-code">{token.display_code}</span>
                              <span className="tv-upcoming-name">{token.patient_name}</span>
                              {token.slot_time && (
                                <span className="tv-upcoming-time">{token.slot_time}</span>
                              )}
                            </div>
                          ))}
                          {doc.waiting_count > waiting.length && (
                            <div className="tv-upcoming-token-more" title={`${doc.waiting_count - waiting.length} additional patients queued for consultation`}>
                              +{doc.waiting_count - waiting.length} more in queue
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Stats Footer */}
                    <div className="tv-card-stats">
                      <span>Completed Today: <b>{doc.completed_count}</b></span>
                      <span>Total Registered: <b>{doc.total_today}</b></span>
                    </div>
                  </div>
                </section>
              )
            })}
          </div>

            {/* Doctor Navigation Tabs (Below Card) */}
            {doctors.length > 1 && viewMode === 'single' && (
              <nav className="tv-doctor-tabs" aria-label="Doctors list">
                <div className="tv-doctor-tabs-label">DOCTORS:</div>
                <div className="tv-doctor-tabs-scroll">
                  {doctors.map((doc, idx) => {
                    const isCurrent = idx === currentDoctorIndex % doctors.length
                    const isConsulting = doc.status === 'in_consultation' || Boolean(doc.current_token)
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        className={`tv-doc-tab-pill ${isCurrent ? 'is-active' : ''} ${isConsulting ? 'is-consulting' : ''}`}
                        onClick={() => handleSelectDoctor(idx)}
                        title={`${doc.name} · Room ${doc.room_number || `OPD ${doc.id}`}`}
                        id={`tv-tab-doc-${doc.id}`}
                      >
                        <span className="tv-tab-index">#{idx + 1}</span>
                        <span className="tv-tab-name">{doc.name}</span>
                        <span className="tv-tab-room">{doc.room_number || `OPD ${doc.id}`}</span>
                        {doc.waiting_count > 0 && (
                          <span className="tv-tab-waiting">{doc.waiting_count}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </nav>
            )}
          </>
        )}
      </main>

      {/* Bottom Live Marquee Ticker */}
      <footer className="tv-ticker-bar">
        <div className="tv-ticker-tag">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          NOTICE
        </div>
        <div className="tv-ticker-content">
          <div className="tv-ticker-track">
            <span>📢 Please keep your appointment or walk-in slip ready with token number.</span>
            <span>🏥 Proceed directly to the designated Consultation Room / OPD when your token is called.</span>
            <span>⏱️ Estimated wait times may vary depending on patient consultation complexity.</span>
            <span>🛡️ If you require emergency care or immediate assistance, please notify Reception immediately.</span>
            <span>📞 Helpdesk & Token Queries: Contact Reception counter or dial Ext. 101.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
