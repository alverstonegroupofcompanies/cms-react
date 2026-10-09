import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getTvDisplay } from '../../api/client'
import type { TvDisplayData } from '../../api/types'
import { receptionistNav, adminNav } from '../../config/navigation'
import { clinicAudioNotifier } from '../../utils/soundAlert'
import '../../tv-display.css'

export default function TvDisplayManager() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const nav = isAdmin ? adminNav : receptionistNav

  const [data, setData] = useState<TvDisplayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'none' | 'horizontal' | 'vertical'>('none')
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark')
  const [previewDocId, setPreviewDocId] = useState<number | null>(null)

  const fetchStatus = async () => {
    try {
      const res = await getTvDisplay()
      setData(res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 3500)
    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = (url: string, id: string) => {
    const fullUrl = window.location.origin + url
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2500)
    })
  }

  const doctors = data?.doctors || []
  const totalConsulting = doctors.filter((d) => d.current_token).length
  const totalWaiting = doctors.reduce((sum, d) => sum + d.waiting_count, 0)
  const totalCompleted = doctors.reduce((sum, d) => sum + d.completed_count, 0)

  return (
    <Layout
      title="Doctor TV Displays"
      subtitle="Manage waiting room TV monitors and dedicated room screens for each doctor"
      nav={nav}
    >
      <div className="staff-tv-manager">
        {/* Top Hero / Control Banner */}
        <section className="staff-tv-hero">
          <div className="staff-tv-hero-copy">
            <h2>Live TV Waiting Room Monitors</h2>
            <p>
              Display live tokens on waiting room TVs in <b>Horizontal (16:9 Landscape)</b> or{' '}
              <b>Vertical (9:16 Portrait totem)</b>. Individual displays are also available for each doctor's room.
            </p>
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', fontSize: '0.88rem' }}>
              <span>Doctors on duty: <strong style={{ color: '#38bdf8' }}>{doctors.length}</strong></span>
              <span>In consultation: <strong style={{ color: '#34d399' }}>{totalConsulting}</strong></span>
              <span>Total waiting: <strong style={{ color: '#fbbf24' }}>{totalWaiting}</strong></span>
              <span>Completed today: <strong style={{ color: '#cbd5e1' }}>{totalCompleted}</strong></span>
            </div>
          </div>

          <div className="staff-tv-hero-actions">
            <a
              href="/tv?layout=horizontal"
              target="_blank"
              rel="noreferrer"
              className="staff-tv-btn-primary"
              title="Launch All Doctors Main TV in Horizontal 16:9 Landscape mode"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                <polyline points="17 2 12 7 7 2" />
              </svg>
              Open Main TV (Horizontal)
            </a>

            <a
              href="/tv?layout=vertical"
              target="_blank"
              rel="noreferrer"
              className="staff-tv-btn-primary"
              title="Launch All Doctors Main TV in Vertical 9:16 Portrait mode"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              Open Main TV (Vertical)
            </a>

            <a
              href="/tv?layout=horizontal&theme=light"
              target="_blank"
              rel="noreferrer"
              className="staff-tv-btn-secondary"
              title="Launch All Doctors Main TV in Clean Medical Light Mode"
            >
              ☀️ Open Light TV
            </a>

            <button
              type="button"
              className="staff-tv-btn-secondary"
              onClick={() => copyToClipboard('/tv', 'main')}
            >
              {copiedId === 'main' ? '✓ Link Copied!' : '📋 Copy TV Link'}
            </button>

            <button
              type="button"
              className="staff-tv-btn-secondary"
              onClick={() => clinicAudioNotifier.playChime()}
              title="Play test hospital chime sound"
            >
              🔔 Test Chime
            </button>

            <button
              type="button"
              className="staff-tv-btn-secondary"
              onClick={() => {
                if (previewMode === 'none') {
                  setPreviewMode('horizontal')
                  setPreviewDocId(null)
                } else {
                  setPreviewMode('none')
                }
              }}
            >
              {previewMode === 'none' ? '👁️ Live Preview' : '✕ Close Preview'}
            </button>
          </div>
        </section>

        {/* In-page Embedded Live Preview (Optional interactive preview) */}
        {previewMode !== 'none' && (
          <section
            style={{
              background: '#070d19',
              borderRadius: '16px',
              border: '2px solid #0284c7',
              padding: '1.25rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <strong style={{ fontSize: '1.1rem', color: '#38bdf8' }}>
                  Live TV Screen Preview ({previewMode.toUpperCase()})
                  {previewDocId ? ` · Doctor #${previewDocId}` : ' · All Doctors'}
                </strong>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  This is exactly what patients see on the waiting room TV monitor.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${previewMode === 'horizontal' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPreviewMode('horizontal')}
                >
                  Horizontal View
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${previewMode === 'vertical' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPreviewMode('vertical')}
                >
                  Vertical View
                </button>

                {/* Theme Selector */}
                <div style={{ display: 'inline-flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid #334155' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${previewTheme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPreviewTheme('dark')}
                    style={{ borderRadius: 0, padding: '0.25rem 0.65rem' }}
                    title="Preview in Dark Theme"
                  >
                    🌙 Dark
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${previewTheme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPreviewTheme('light')}
                    style={{ borderRadius: 0, padding: '0.25rem 0.65rem' }}
                    title="Preview in Light Theme"
                  >
                    ☀️ Light
                  </button>
                </div>

                {previewDocId && (
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setPreviewDocId(null)}
                  >
                    Show All Doctors
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setPreviewMode('none')}
                >
                  Close
                </button>
              </div>
            </div>

            <div
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: previewTheme === 'light' ? '1px solid #cbd5e1' : '1px solid #1e293b',
                height: previewMode === 'horizontal' ? '560px' : '720px',
                width: previewMode === 'horizontal' ? '100%' : '520px',
                margin: '0 auto',
                background: previewTheme === 'light' ? '#f1f5f9' : '#070d19',
                transition: 'background-color 0.25s ease',
              }}
            >
              <iframe
                title="TV Screen Live Preview"
                src={`/tv?layout=${previewMode}&theme=${previewTheme}${previewDocId ? `&doctor_id=${previewDocId}` : ''}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </section>
        )}

        {/* Section Heading */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
              Doctor Token Displays ({doctors.length} Doctors)
            </h3>
            <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Each doctor's consultation room can have its own dedicated TV display or tablet screen.
            </p>
          </div>
        </div>

        {/* Grid of Doctor Display Sections */}
        {loading && doctors.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading doctor display statuses…
          </div>
        ) : (
          <div className="staff-doc-displays-grid">
            {doctors.map((doc) => {
              const current = doc.current_token
              const waiting = doc.waiting_tokens || []
              const isConsulting = Boolean(current)
              const docRoomUrl = `/tv?doctor_id=${doc.id}&layout=horizontal`
              const docVertUrl = `/tv?doctor_id=${doc.id}&layout=vertical`

              return (
                <div
                  key={doc.id}
                  className={`staff-doc-display-card ${isConsulting ? 'is-active-consult' : ''}`}
                  id={`staff-display-card-${doc.id}`}
                >
                  {/* Doctor Card Header */}
                  <div className="staff-doc-head">
                    <div className="staff-doc-details">
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: '#e2e8f0',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#0284c7',
                        }}
                      >
                        {doc.photo_url ? (
                          <img
                            src={doc.photo_url}
                            alt={doc.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          doc.name.replace(/^Dr\.\s*/i, '').charAt(0)
                        )}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <h4 className="staff-doc-name">{doc.name}</h4>
                        <div className="staff-doc-dept">{doc.department?.name || 'Department'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.specialization}</div>
                      </div>
                    </div>

                    <div className="staff-doc-room">
                      {doc.room_number || `OPD ${doc.id}`}
                    </div>
                  </div>

                  {/* Doctor Card Body: Live Token & Waiting Summary */}
                  <div className="staff-doc-body">
                    {/* Serving Token Block */}
                    <div className={`staff-serving-block ${!current ? 'is-empty' : ''}`}>
                      <div className="staff-serving-label">
                        {current ? '● NOW IN CONSULTATION' : '○ DOCTOR AVAILABLE'}
                      </div>
                      <div className="staff-serving-token">
                        {current ? current.display_code : '—'}
                      </div>
                      <div className="staff-serving-patient">
                        {current ? (
                          <>
                            <span>{current.patient_name}</span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '0.4rem' }}>
                              ({current.elapsed_minutes}m in room)
                            </span>
                          </>
                        ) : waiting.length > 0 ? (
                          <span style={{ color: '#d97706' }}>Next patient ready to be called</span>
                        ) : (
                          <span style={{ color: '#64748b' }}>No patients in room</span>
                        )}
                      </div>
                    </div>

                    {/* Waiting Tokens List */}
                    <div className="staff-waiting-list">
                      <div className="staff-waiting-head">
                        <span>Upcoming in Queue</span>
                        <span style={{ fontWeight: 800, color: doc.waiting_count > 0 ? '#0284c7' : '#94a3b8' }}>
                          {doc.waiting_count} Waiting
                        </span>
                      </div>

                      {waiting.length === 0 ? (
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          No patients waiting in queue
                        </div>
                      ) : (
                        <div className="staff-waiting-pills">
                          {waiting.map((token) => (
                            <span key={token.id} className="staff-token-pill" title={`${token.patient_name}`}>
                              #{token.position} {token.display_code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Today's Counts */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: '#64748b',
                        paddingTop: '0.4rem',
                      }}
                    >
                      <span>Completed Today: <strong>{doc.completed_count}</strong></span>
                      <span>Total Booked: <strong>{doc.total_today}</strong></span>
                    </div>
                  </div>

                  {/* Launch Actions for this Doctor */}
                  <div className="staff-doc-actions">
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <a
                        href={docRoomUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="staff-action-link"
                        title="Launch this doctor's room TV in Horizontal mode"
                      >
                        🖥️ Horizontal TV
                      </a>

                      <a
                        href={docVertUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="staff-action-link"
                        title="Launch this doctor's room TV in Vertical mode"
                      >
                        📱 Vertical TV
                      </a>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="staff-action-link is-copy"
                        onClick={() => copyToClipboard(docRoomUrl, `doc-${doc.id}`)}
                        title="Copy direct TV URL for this doctor's room"
                      >
                        {copiedId === `doc-${doc.id}` ? '✓ Copied' : '📋 Copy'}
                      </button>

                      <button
                        type="button"
                        className="staff-action-link is-copy"
                        onClick={() => {
                          setPreviewDocId(doc.id)
                          setPreviewMode('horizontal')
                        }}
                        title="Preview this doctor's display screen"
                      >
                        👁️ Preview
                      </button>

                      <Link
                        to={`/receptionist/queue?doctor_id=${doc.id}`}
                        className="staff-action-link"
                        title="Open receptionist queue manager for this doctor"
                      >
                        Queue →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
