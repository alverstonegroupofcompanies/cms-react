import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getDashboardStats } from '../../api/client'
import { adminNav } from '../../config/navigation'
import type { DashboardStats } from '../../api/types'
import { useAuth } from '../../context/AuthContext'
import {
  IconStethoscope,
  IconShield,
  IconUsers,
  IconUser,
  IconCalendar,
  IconQueue,
  IconPill,
  IconFlask,
  IconTv,
  IconPlus,
  IconRefresh,
  IconClock,
  IconTicket,
  IconCheck,
  IconBuilding,
} from '../../components/Icons'

// Extra crisp mini inline icons for the dashboard
function IconKey({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5-2 2 1.5 1.5L12 11l-2-2-4 4a5 5 0 1 0 7 7l4-4-2-2 2-2 1.5 1.5 2-2-1.5-1.5L21 4l1-1-1-1z" />
    </svg>
  )
}

function IconMail({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function IconArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function IconSparkle({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-3.17-6.83l-2.83 2.83m-8 8l-2.83 2.83m0-13.66l2.83 2.83m8 8l2.83 2.83" />
    </svg>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = () => {
    setRefreshing(true)
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <Layout
      title="Super Admin Dashboard"
      subtitle="Complete hospital-wide operational overview, personnel credentials & system controls"
      nav={adminNav}
    >
      {/* Top Simple Action & Session Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.85rem 1.35rem',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderLeft: '5px solid #8b1e2b',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#16a34a',
                display: 'inline-block',
                boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)',
              }}
            />
            <span style={{ fontSize: '0.88rem', color: '#1e293b' }}>
              Master Session: <strong>{user?.name || 'Super Administrator'}</strong>
            </span>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.74rem',
              fontWeight: 700,
              background: '#f1f5f9',
              color: '#334155',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontFamily: 'monospace',
            }}
          >
            <IconMail size={12} />
            {user?.email || 'superadmin@alverstone.com'}
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: '#fef2f2',
              color: '#8b1e2b',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              border: '1px solid #fecdd3',
            }}
          >
            <IconShield size={12} />
            Super Admin
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            className="btn btn-sm btn-secondary"
            title="Refresh statistics"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <IconRefresh size={14} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Updating…' : 'Refresh Data'}</span>
          </button>

          <Link
            to="/admin/doctors"
            className="btn btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              background: '#fff1f2',
              color: '#8b1e2b',
              border: '1px solid #fecdd3',
              fontWeight: 700,
              fontSize: '0.82rem',
            }}
          >
            <IconPlus size={14} />
            <span>+ Add Doctor</span>
          </Link>

          <Link
            to="/admin/staff"
            className="btn btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
              background: '#8b1e2b',
              color: '#ffffff',
              fontWeight: 750,
              fontSize: '0.82rem',
              boxShadow: '0 2px 6px rgba(139, 30, 43, 0.25)',
            }}
          >
            <IconPlus size={14} />
            <span>+ Add Staff Login</span>
          </Link>
        </div>
      </div>

      {/* Main Complete Vertical Table: System Operations & Resource Pulse */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          overflow: 'hidden',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            padding: '1.1rem 1.35rem',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#8b1e2b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBuilding size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Hospital Operations &amp; Resource Pulse
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Differentiated department overview, live volumes, and direct management shortcuts
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: '#15803d',
                background: '#dcfce7',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
              }}
            >
              <IconSparkle size={12} />
              {loading ? 'Synchronizing…' : 'All 8 Services Live'}
            </span>
          </div>
        </div>

        <div className="table-wrap" style={{ margin: 0 }}>
          <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ width: '30%', padding: '0.85rem 1.35rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <IconBuilding size={14} />
                    <span>Workspace / Department</span>
                  </div>
                </th>
                <th style={{ width: '20%', padding: '0.85rem 1.1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <IconSparkle size={14} />
                    <span>Live Metric</span>
                  </div>
                </th>
                <th style={{ width: '35%', padding: '0.85rem 1.1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <IconCheck size={14} />
                    <span>Operational Scope &amp; Tags</span>
                  </div>
                </th>
                <th style={{ width: '15%', padding: '0.85rem 1.35rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                  <span>Direct Control</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Doctor Faculty (Theme: Crimson Wine #8b1e2b) */}
              <tr style={{ borderLeft: '5px solid #8b1e2b', background: '#ffffff', transition: 'background 0.15s' }}>
                <td style={{ padding: '1rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#fff1f2',
                        border: '1.5px solid #fecdd3',
                        color: '#8b1e2b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(139, 30, 43, 0.08)',
                      }}
                    >
                      <IconStethoscope size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#8b1e2b', fontSize: '0.94rem' }}>
                        Doctor Faculty &amp; Consultants
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <span style={{ color: '#8b1e2b', display: 'inline-flex' }}><IconUser size={13} /></span>
                        Specialists, surgeons &amp; OPD doctors
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <strong style={{ fontSize: '1.35rem', color: '#8b1e2b', fontWeight: 850 }}>
                        {loading ? '…' : (stats?.total_doctors ?? 0)}
                      </strong>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8b1e2b' }}>Doctors</span>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.73rem',
                        color: '#16a34a',
                        fontWeight: 700,
                        background: '#f0fdf4',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid #bbf7d0',
                        width: 'fit-content',
                      }}
                    >
                      <IconCheck size={11} />
                      On Active Duty
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', background: '#fff1f2', color: '#8b1e2b', border: '1px solid #fecdd3', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconBuilding size={12} /> Room Suites
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#fff1f2', color: '#8b1e2b', border: '1px solid #fecdd3', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconClock size={12} /> OPD Schedules
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#fff1f2', color: '#8b1e2b', border: '1px solid #fecdd3', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconTicket size={12} /> Consultation Fees
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Create doctor accounts, set specialty credentials &amp; assign rooms
                  </div>
                </td>
                <td style={{ padding: '1rem 1.35rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/doctors"
                    className="btn btn-sm"
                    style={{
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      background: '#fff1f2',
                      color: '#8b1e2b',
                      border: '1.5px solid #8b1e2b',
                      fontWeight: 750,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <span>Manage Doctors</span>
                    <IconArrowRight size={13} />
                  </Link>
                </td>
              </tr>

              {/* Row 2: Hospital Staff (Theme: Azure Blue #0284c7) */}
              <tr style={{ borderLeft: '5px solid #0284c7', background: '#fafcff', transition: 'background 0.15s' }}>
                <td style={{ padding: '1rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#f0f9ff',
                        border: '1.5px solid #bae6fd',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(2, 132, 199, 0.08)',
                      }}
                    >
                      <IconShield size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0369a1', fontSize: '0.94rem' }}>
                        Staff Accounts &amp; Access Control
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <span style={{ color: '#0284c7', display: 'inline-flex' }}><IconUsers size={13} /></span>
                        Reception, Pharmacy, Lab &amp; Admin workforce
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <strong style={{ fontSize: '1.35rem', color: '#0369a1', fontWeight: 850 }}>
                        {loading ? '…' : (stats?.total_staff ?? 0)}
                      </strong>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1' }}>Personnel</span>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.73rem',
                        color: '#0284c7',
                        fontWeight: 700,
                        background: '#e0f2fe',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid #bae6fd',
                        width: 'fit-content',
                      }}
                    >
                      <IconKey size={11} />
                      Logins Managed
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconUser size={12} /> Reception: {stats?.staff_breakdown?.receptionist ?? 0}
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconPill size={12} /> Pharmacy: {stats?.staff_breakdown?.pharmacy ?? 0}
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconFlask size={12} /> Lab: {stats?.staff_breakdown?.lab ?? 0}
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconShield size={12} /> Admin: {stats?.staff_breakdown?.admin ?? 0}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Create role credentials, reset employee passwords &amp; revoke access
                  </div>
                </td>
                <td style={{ padding: '1rem 1.35rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/staff"
                    className="btn btn-sm"
                    style={{
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      background: '#f0f9ff',
                      color: '#0369a1',
                      border: '1.5px solid #0284c7',
                      fontWeight: 750,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <span>Manage Staff</span>
                    <IconArrowRight size={13} />
                  </Link>
                </td>
              </tr>

              {/* Row 3: Patient Master Registry (Theme: Royal Indigo #4f46e5) */}
              <tr style={{ borderLeft: '5px solid #4f46e5', background: '#ffffff', transition: 'background 0.15s' }}>
                <td style={{ padding: '1rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#eef2ff',
                        border: '1.5px solid #c7d2fe',
                        color: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(79, 70, 229, 0.08)',
                      }}
                    >
                      <IconUsers size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#4338ca', fontSize: '0.94rem' }}>
                        Patient Master Registry
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <span style={{ color: '#4f46e5', display: 'inline-flex' }}><IconUser size={13} /></span>
                        Electronic hospital health records
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <strong style={{ fontSize: '1.35rem', color: '#4338ca', fontWeight: 850 }}>
                        {loading ? '…' : (stats?.total_patients ?? 0)}
                      </strong>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4338ca' }}>Patients</span>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.73rem',
                        color: '#4338ca',
                        fontWeight: 700,
                        background: '#e0e7ff',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid #c7d2fe',
                        width: 'fit-content',
                      }}
                    >
                      <IconCheck size={11} />
                      Verified Records
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconUsers size={12} /> Permanent EHR Files
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconClock size={12} /> Visit Timelines
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconMail size={12} /> Contact Directory
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Patient clinical history, emergency contacts, prescriptions &amp; invoices
                  </div>
                </td>
                <td style={{ padding: '1rem 1.35rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/patients"
                    className="btn btn-sm"
                    style={{
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      background: '#eef2ff',
                      color: '#4338ca',
                      border: '1.5px solid #4f46e5',
                      fontWeight: 750,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <span>View Registry</span>
                    <IconArrowRight size={13} />
                  </Link>
                </td>
              </tr>

              {/* Row 4: Today's Appointments (Theme: Emerald Green #16a34a) */}
              <tr style={{ borderLeft: '5px solid #16a34a', background: '#fafdfa', transition: 'background 0.15s' }}>
                <td style={{ padding: '1rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#f0fdf4',
                        border: '1.5px solid #bbf7d0',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(22, 163, 74, 0.08)',
                      }}
                    >
                      <IconCalendar size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.94rem' }}>
                        Today&rsquo;s OPD Consultations
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <span style={{ color: '#16a34a', display: 'inline-flex' }}><IconClock size={13} /></span>
                        Active scheduled appointments
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <strong style={{ fontSize: '1.35rem', color: '#15803d', fontWeight: 850 }}>
                        {loading ? '…' : (stats?.today_appointments ?? 0)}
                      </strong>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d' }}>Bookings</span>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.73rem',
                        color: '#15803d',
                        fontWeight: 700,
                        background: '#dcfce7',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid #bbf7d0',
                        width: 'fit-content',
                      }}
                    >
                      <IconCheck size={11} />
                      Today&rsquo;s Roster
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconCalendar size={12} /> Confirmed Slots
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconStethoscope size={12} /> Doctor Allocation
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconTicket size={12} /> Shift Timings
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Patient consultation schedule across all board-certified clinical faculty
                  </div>
                </td>
                <td style={{ padding: '1rem 1.35rem', textAlign: 'right' }}>
                  <Link
                    to="/receptionist/appointments"
                    className="btn btn-sm"
                    style={{
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      background: '#f0fdf4',
                      color: '#15803d',
                      border: '1.5px solid #16a34a',
                      fontWeight: 750,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <span>View Schedule</span>
                    <IconArrowRight size={13} />
                  </Link>
                </td>
              </tr>

              {/* Row 5: Live Waiting Queue (Theme: Sunset Amber #d97706) */}
              <tr style={{ borderLeft: '5px solid #d97706', background: '#ffffff', transition: 'background 0.15s' }}>
                <td style={{ padding: '1rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#fffbeb',
                        border: '1.5px solid #fde68a',
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(217, 119, 6, 0.08)',
                      }}
                    >
                      <IconQueue size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#b45309', fontSize: '0.94rem' }}>
                        Live Reception Token Queue
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <span style={{ color: '#d97706', display: 'inline-flex' }}><IconTicket size={13} /></span>
                        Lobby patient flow &amp; room calling
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <strong style={{ fontSize: '1.35rem', color: '#b45309', fontWeight: 850 }}>
                        {loading ? '…' : (stats?.today_queue_length ?? 0)}
                      </strong>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b45309' }}>Tokens</span>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.73rem',
                        color: '#b45309',
                        fontWeight: 700,
                        background: '#fef3c7',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid #fde68a',
                        width: 'fit-content',
                      }}
                    >
                      <IconClock size={11} />
                      Waiting Lobby
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconTicket size={12} /> Token Calling
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconBuilding size={12} /> Room Assignment
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconClock size={12} /> Wait-Time Pacing
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Check-in patients, manage room call chimes &amp; monitor lobby wait times
                  </div>
                </td>
                <td style={{ padding: '1rem 1.35rem', textAlign: 'right' }}>
                  <Link
                    to="/receptionist/queue"
                    className="btn btn-sm"
                    style={{
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      background: '#fffbeb',
                      color: '#b45309',
                      border: '1.5px solid #d97706',
                      fontWeight: 750,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <span>Queue Monitor</span>
                    <IconArrowRight size={13} />
                  </Link>
                </td>
              </tr>

              {/* Row 6: Pharmacy Inventory (Theme: Regal Purple #7c3aed) */}
              <tr style={{ borderLeft: '5px solid #7c3aed', background: '#faf9fe', transition: 'background 0.15s' }}>
                <td style={{ padding: '1rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#faf5ff',
                        border: '1.5px solid #e9d5ff',
                        color: '#7c3aed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(124, 58, 237, 0.08)',
                      }}
                    >
                      <IconPill size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#6d28d9', fontSize: '0.94rem' }}>
                        Pharmacy Formulary &amp; Stock
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <span style={{ color: '#7c3aed', display: 'inline-flex' }}><IconPill size={13} /></span>
                        Drug inventory, dispensing &amp; billing
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <strong style={{ fontSize: '1.35rem', color: '#6d28d9', fontWeight: 850 }}>
                        {loading ? '…' : (stats?.total_medicines ?? 0)}
                      </strong>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6d28d9' }}>Medicines</span>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.73rem',
                        color: '#7c3aed',
                        fontWeight: 700,
                        background: '#f3e8ff',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid #e9d5ff',
                        width: 'fit-content',
                      }}
                    >
                      <IconCheck size={11} />
                      Formulary Active
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', background: '#faf5ff', color: '#6d28d9', border: '1px solid #e9d5ff', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconPill size={12} /> Stock Catalog
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#faf5ff', color: '#6d28d9', border: '1px solid #e9d5ff', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconTicket size={12} /> Unit Pricing
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#faf5ff', color: '#6d28d9', border: '1px solid #e9d5ff', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconCheck size={12} /> Rx Billing
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Medication catalog, batch numbers, dosage units &amp; point-of-sale dispensing
                  </div>
                </td>
                <td style={{ padding: '1rem 1.35rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/medicines"
                    className="btn btn-sm"
                    style={{
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      background: '#faf5ff',
                      color: '#6d28d9',
                      border: '1.5px solid #7c3aed',
                      fontWeight: 750,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <span>Manage Drugs</span>
                    <IconArrowRight size={13} />
                  </Link>
                </td>
              </tr>

              {/* Row 7: Diagnostic Laboratory (Theme: Teal / Cyan #0d9488) */}
              <tr style={{ borderLeft: '5px solid #0d9488', background: '#ffffff', transition: 'background 0.15s' }}>
                <td style={{ padding: '1rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#f0fdfa',
                        border: '1.5px solid #99f6e4',
                        color: '#0d9488',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(13, 148, 136, 0.08)',
                      }}
                    >
                      <IconFlask size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.94rem' }}>
                        Clinical Diagnostics &amp; Pathology
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <span style={{ color: '#0d9488', display: 'inline-flex' }}><IconFlask size={13} /></span>
                        Blood panels, pathology &amp; diagnostic profiles
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <strong style={{ fontSize: '1.35rem', color: '#0f766e', fontWeight: 850 }}>
                        {loading ? '…' : (stats?.today_lab_orders ?? 'Active')}
                      </strong>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f766e' }}>Tests</span>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.73rem',
                        color: '#0f766e',
                        fontWeight: 700,
                        background: '#ccfbf1',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid #99f6e4',
                        width: 'fit-content',
                      }}
                    >
                      <IconCheck size={11} />
                      Pathology Suite
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconFlask size={12} /> Test Panels
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconCheck size={12} /> Reference Ranges
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconTicket size={12} /> Pathology Rates
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Test panel definitions, specimen containers, normal reference boundaries &amp; prices
                  </div>
                </td>
                <td style={{ padding: '1rem 1.35rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/lab"
                    className="btn btn-sm"
                    style={{
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      background: '#f0fdfa',
                      color: '#0f766e',
                      border: '1.5px solid #0d9488',
                      fontWeight: 750,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <span>Manage Tests</span>
                    <IconArrowRight size={13} />
                  </Link>
                </td>
              </tr>

              {/* Row 8: TV Displays (Theme: Ruby Rose #e11d48) */}
              <tr style={{ borderLeft: '5px solid #e11d48', background: '#fffbfc', transition: 'background 0.15s' }}>
                <td style={{ padding: '1rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: '#fff1f2',
                        border: '1.5px solid #fecdd3',
                        color: '#e11d48',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 5px rgba(225, 29, 72, 0.08)',
                      }}
                    >
                      <IconTv size={22} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#be123c', fontSize: '0.94rem' }}>
                        OPD Waiting Lobby TV Screens
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <span style={{ color: '#e11d48', display: 'inline-flex' }}><IconTv size={13} /></span>
                        Digital signage &amp; real-time calling screens
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                      <strong style={{ fontSize: '1.15rem', color: '#be123c', fontWeight: 850 }}>
                        Live Broadcast
                      </strong>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.73rem',
                        color: '#15803d',
                        fontWeight: 700,
                        background: '#dcfce7',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: '1px solid #bbf7d0',
                        width: 'fit-content',
                      }}
                    >
                      <IconCheck size={11} />
                      Connected Lobbies
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconTv size={12} /> Digital Calling
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconSparkle size={12} /> Audio Alerts
                    </span>
                    <span style={{ fontSize: '0.74rem', background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <IconBuilding size={12} /> OPD Department Screens
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Waiting room digital signage with multi-doctor queue boards and chime triggers
                  </div>
                </td>
                <td style={{ padding: '1rem 1.35rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/displays"
                    className="btn btn-sm"
                    style={{
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      background: '#fff1f2',
                      color: '#be123c',
                      border: '1.5px solid #e11d48',
                      fontWeight: 750,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                    }}
                  >
                    <span>Configure TV</span>
                    <IconArrowRight size={13} />
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Complete Vertical Credentials & System Portals (Color Coded per Role) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            padding: '1.1rem 1.35rem',
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconKey size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                System Portals &amp; Master Credentials Reference
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Color-differentiated default logins for testing, departmental portal jumping, and credential resets
              </p>
            </div>
          </div>

          <Link
            to="/admin/staff"
            style={{
              fontSize: '0.82rem',
              fontWeight: 750,
              color: '#8b1e2b',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: '#fff1f2',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #fecdd3',
            }}
          >
            <IconKey size={13} />
            <span>Manage All Passwords &rarr;</span>
          </Link>
        </div>

        <div className="table-wrap" style={{ margin: 0 }}>
          <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                <th style={{ width: '25%', padding: '0.85rem 1.35rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <IconBuilding size={14} />
                    <span>Portal / Role</span>
                  </div>
                </th>
                <th style={{ width: '26%', padding: '0.85rem 1.1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <IconMail size={14} />
                    <span>User ID / Email</span>
                  </div>
                </th>
                <th style={{ width: '18%', padding: '0.85rem 1.1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <IconKey size={14} />
                    <span>Password</span>
                  </div>
                </th>
                <th style={{ width: '18%', padding: '0.85rem 1.1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <IconShield size={14} />
                    <span>Access Level</span>
                  </div>
                </th>
                <th style={{ width: '13%', padding: '0.85rem 1.35rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                  <span>Portal Jump</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Super Admin Credential (Wine Red) */}
              <tr style={{ borderLeft: '5px solid #8b1e2b', background: '#fffbfc' }}>
                <td style={{ padding: '0.95rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        color: '#8b1e2b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconShield size={15} />
                    </span>
                    <div>
                      <span style={{ fontWeight: 800, color: '#8b1e2b', fontSize: '0.9rem' }}>Super Administrator</span>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Master Executive System</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <code style={{ background: '#fef2f2', border: '1px solid #fecdd3', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.82rem', color: '#8b1e2b', fontWeight: 650 }}>
                    superadmin@alverstone.com
                  </code>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <code style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 650 }}>
                    SuperAdmin@2026
                  </code>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#fff1f2',
                      color: '#8b1e2b',
                      border: '1px solid #fecdd3',
                      fontSize: '0.75rem',
                      fontWeight: 750,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                    }}
                  >
                    <IconShield size={11} />
                    Full Master Authority
                  </span>
                </td>
                <td style={{ padding: '0.95rem 1.35rem', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                    Active Session
                  </span>
                </td>
              </tr>

              {/* Reception Desk Credential (Sky Blue) */}
              <tr style={{ borderLeft: '5px solid #0284c7', background: '#fafcff' }}>
                <td style={{ padding: '0.95rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        color: '#0284c7',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconUser size={15} />
                    </span>
                    <div>
                      <span style={{ fontWeight: 800, color: '#0369a1', fontSize: '0.9rem' }}>Reception Desk Portal</span>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Front office check-in</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <code style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.82rem', color: '#0369a1', fontWeight: 650 }}>
                    reception@clinic.com
                  </code>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <code style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 650 }}>
                    password
                  </code>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#f0f9ff',
                      color: '#0284c7',
                      border: '1px solid #bae6fd',
                      fontSize: '0.75rem',
                      fontWeight: 750,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                    }}
                  >
                    <IconTicket size={11} />
                    Queue &amp; Appointments
                  </span>
                </td>
                <td style={{ padding: '0.95rem 1.35rem', textAlign: 'right' }}>
                  <Link
                    to="/receptionist/dashboard"
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 750,
                      color: '#0284c7',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#f0f9ff',
                      padding: '0.35rem 0.7rem',
                      borderRadius: '6px',
                      border: '1px solid #bae6fd',
                    }}
                  >
                    <span>Open Portal</span>
                    <IconArrowRight size={12} />
                  </Link>
                </td>
              </tr>

              {/* Pharmacy Unit Credential (Purple) */}
              <tr style={{ borderLeft: '5px solid #7c3aed', background: '#faf9fe' }}>
                <td style={{ padding: '0.95rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#faf5ff',
                        border: '1px solid #e9d5ff',
                        color: '#7c3aed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconPill size={15} />
                    </span>
                    <div>
                      <span style={{ fontWeight: 800, color: '#6d28d9', fontSize: '0.9rem' }}>Pharmacy Desk Portal</span>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Drug retail &amp; POS billing</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <code style={{ background: '#faf5ff', border: '1px solid #e9d5ff', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.82rem', color: '#6d28d9', fontWeight: 650 }}>
                    pharmacy@clinic.com
                  </code>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <code style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 650 }}>
                    password
                  </code>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#faf5ff',
                      color: '#7c3aed',
                      border: '1px solid #e9d5ff',
                      fontSize: '0.75rem',
                      fontWeight: 750,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                    }}
                  >
                    <IconPill size={11} />
                    Medicine Dispensing
                  </span>
                </td>
                <td style={{ padding: '0.95rem 1.35rem', textAlign: 'right' }}>
                  <Link
                    to="/pharmacy/dashboard"
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 750,
                      color: '#7c3aed',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#faf5ff',
                      padding: '0.35rem 0.7rem',
                      borderRadius: '6px',
                      border: '1px solid #e9d5ff',
                    }}
                  >
                    <span>Open Portal</span>
                    <IconArrowRight size={12} />
                  </Link>
                </td>
              </tr>

              {/* Diagnostics Lab Credential (Teal) */}
              <tr style={{ borderLeft: '5px solid #0d9488', background: '#fafdfd' }}>
                <td style={{ padding: '0.95rem 1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#f0fdfa',
                        border: '1px solid #99f6e4',
                        color: '#0d9488',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconFlask size={15} />
                    </span>
                    <div>
                      <span style={{ fontWeight: 800, color: '#0f766e', fontSize: '0.9rem' }}>Diagnostic Laboratory</span>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Pathology &amp; sample entry</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <code style={{ background: '#f0fdfa', border: '1px solid #99f6e4', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.82rem', color: '#0f766e', fontWeight: 650 }}>
                    lab@clinic.com
                  </code>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <code style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.25rem 0.55rem', borderRadius: '5px', fontSize: '0.82rem', color: '#0f172a', fontWeight: 650 }}>
                    password
                  </code>
                </td>
                <td style={{ padding: '0.95rem 1.1rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#f0fdfa',
                      color: '#0f766e',
                      border: '1px solid #99f6e4',
                      fontSize: '0.75rem',
                      fontWeight: 750,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                    }}
                  >
                    <IconFlask size={11} />
                    Pathology Testing
                  </span>
                </td>
                <td style={{ padding: '0.95rem 1.35rem', textAlign: 'right' }}>
                  <Link
                    to="/lab/dashboard"
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 750,
                      color: '#0f766e',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#f0fdfa',
                      padding: '0.35rem 0.7rem',
                      borderRadius: '6px',
                      border: '1px solid #99f6e4',
                    }}
                  >
                    <span>Open Portal</span>
                    <IconArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
