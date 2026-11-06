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
  IconCalendar,
  IconQueue,
  IconPill,
  IconFlask,
  IconTv,
  IconPlus,
  IconRefresh,
} from '../../components/Icons'

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
      subtitle="Hospital-wide operational overview, personnel credentials & system controls"
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
          padding: '0.85rem 1.25rem',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: '#16a34a',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '0.88rem', color: '#334155' }}>
            Logged in as <strong>{user?.name || 'Super Administrator'}</strong> ({user?.email || 'superadmin@alverstone.com'})
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: '#fef2f2',
              color: '#8b1e2b',
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
              border: '1px solid #fecdd3',
            }}
          >
            Super Admin
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            className="btn btn-sm btn-secondary"
            title="Refresh statistics"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <IconRefresh size={14} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Updating…' : 'Refresh'}</span>
          </button>
          <Link
            to="/admin/doctors"
            className="btn btn-sm btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
          >
            <IconPlus size={14} />
            <span>Add Doctor</span>
          </Link>
          <Link
            to="/admin/staff"
            className="btn btn-sm btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              textDecoration: 'none',
              background: '#8b1e2b',
              borderColor: '#8b1e2b',
            }}
          >
            <IconPlus size={14} />
            <span>Add Staff Login</span>
          </Link>
        </div>
      </div>

      {/* Main Complete Vertical Table: System Operations & Live Status */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            background: '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Hospital Operations &amp; Resource Pulse
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Real-time resource counts, duty allocations, and direct department controls
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {loading ? 'Fetching live numbers…' : 'Live synced'}
          </span>
        </div>

        <div className="table-wrap" style={{ margin: 0 }}>
          <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ width: '32%', padding: '0.75rem 1.25rem', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Workspace / Department
                </th>
                <th style={{ width: '18%', padding: '0.75rem 1rem', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Live Metric
                </th>
                <th style={{ width: '35%', padding: '0.75rem 1rem', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Operational Scope &amp; Breakdown
                </th>
                <th style={{ width: '15%', padding: '0.75rem 1.25rem', textAlign: 'right', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Doctors */}
              <tr>
                <td style={{ padding: '0.95rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#fef2f2',
                        color: '#8b1e2b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconStethoscope size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>Doctor Faculty</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Specialists, surgeons &amp; OPD consultants</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>
                      {loading ? '…' : (stats?.total_doctors ?? 0)}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>Active</span>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem', fontSize: '0.84rem', color: '#334155' }}>
                  Manage user IDs, assign passwords, set OPD room numbers, and consultation fees
                </td>
                <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/doctors"
                    className="btn btn-sm btn-secondary"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    Manage Doctors &rarr;
                  </Link>
                </td>
              </tr>

              {/* Row 2: Staff Accounts */}
              <tr>
                <td style={{ padding: '0.95rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#f0f9ff',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconShield size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>Staff Accounts &amp; Access</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Reception, Pharmacy, Lab &amp; Admin workforce</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>
                      {loading ? '…' : (stats?.total_staff ?? 0)}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Personnel</span>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem', fontSize: '0.84rem', color: '#334155' }}>
                  <span style={{ color: '#0369a1', fontWeight: 600 }}>
                    Reception: {stats?.staff_breakdown?.receptionist ?? 0}
                  </span>
                  {' • '}
                  <span style={{ color: '#7e22ce', fontWeight: 600 }}>
                    Pharmacy: {stats?.staff_breakdown?.pharmacy ?? 0}
                  </span>
                  {' • '}
                  <span style={{ color: '#0f766e', fontWeight: 600 }}>
                    Lab: {stats?.staff_breakdown?.lab ?? 0}
                  </span>
                  {' • '}
                  <span style={{ color: '#be123c', fontWeight: 600 }}>
                    Admin: {stats?.staff_breakdown?.admin ?? 0}
                  </span>
                </td>
                <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/staff"
                    className="btn btn-sm btn-secondary"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    Manage Staff &rarr;
                  </Link>
                </td>
              </tr>

              {/* Row 3: Patients Registry */}
              <tr>
                <td style={{ padding: '0.95rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <IconUsers size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>Patient Master Registry</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Hospital electronic health records</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>
                      {loading ? '…' : (stats?.total_patients ?? 0)}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Patients</span>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem', fontSize: '0.84rem', color: '#334155' }}>
                  Permanent medical histories, contact records, visit summaries, and billing ledgers
                </td>
                <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/patients"
                    className="btn btn-sm btn-secondary"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    View Registry &rarr;
                  </Link>
                </td>
              </tr>

              {/* Row 4: Today's Appointments */}
              <tr>
                <td style={{ padding: '0.95rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#f0fdf4',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconCalendar size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>Today&rsquo;s Appointments</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Scheduled outpatient consultations</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <strong style={{ fontSize: '1.15rem', color: '#15803d' }}>
                      {loading ? '…' : (stats?.today_appointments ?? 0)}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Bookings</span>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem', fontSize: '0.84rem', color: '#334155' }}>
                  Active patient consultations booked with doctors for current OPD clinical shifts
                </td>
                <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    to="/receptionist/appointments"
                    className="btn btn-sm btn-secondary"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    View Schedule &rarr;
                  </Link>
                </td>
              </tr>

              {/* Row 5: Live Waiting Queue */}
              <tr>
                <td style={{ padding: '0.95rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#fffbeb',
                        color: '#d97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconQueue size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>Live Waiting Queue</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Reception lobby tokens in sequence</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <strong style={{ fontSize: '1.15rem', color: '#b45309' }}>
                      {loading ? '…' : (stats?.today_queue_length ?? 0)}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Tokens</span>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem', fontSize: '0.84rem', color: '#334155' }}>
                  Patients checked-in, waiting in lobby seating, and called into consultation rooms
                </td>
                <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    to="/receptionist/queue"
                    className="btn btn-sm btn-secondary"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    Queue Monitor &rarr;
                  </Link>
                </td>
              </tr>

              {/* Row 6: Pharmacy Formulary */}
              <tr>
                <td style={{ padding: '0.95rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#faf5ff',
                        color: '#7e22ce',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconPill size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>Pharmacy Inventory</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Formulary drugs, stock &amp; dispensing</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <strong style={{ fontSize: '1.15rem', color: '#7c3aed' }}>
                      {loading ? '…' : (stats?.total_medicines ?? 0)}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Medicines</span>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem', fontSize: '0.84rem', color: '#334155' }}>
                  Hospital medication catalog, available stock units, dosages, and retail rates
                </td>
                <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/medicines"
                    className="btn btn-sm btn-secondary"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    Manage Drugs &rarr;
                  </Link>
                </td>
              </tr>

              {/* Row 7: Diagnostic Laboratory */}
              <tr>
                <td style={{ padding: '0.95rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#f0fdfa',
                        color: '#0f766e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconFlask size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>Diagnostic Laboratory</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Pathology panels, blood work &amp; orders</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <strong style={{ fontSize: '1.15rem', color: '#0f766e' }}>
                      {loading ? '…' : (stats?.today_lab_orders ?? 'Active')}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Panels</span>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem', fontSize: '0.84rem', color: '#334155' }}>
                  Pathology test definitions, specimen types, normal reference ranges, and test fees
                </td>
                <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/lab"
                    className="btn btn-sm btn-secondary"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    Manage Tests &rarr;
                  </Link>
                </td>
              </tr>

              {/* Row 8: TV Displays */}
              <tr>
                <td style={{ padding: '0.95rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#f1f5f9',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconTv size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>OPD TV Displays</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Waiting lobby digital signage &amp; screens</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.95rem 1rem' }}>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                    }}
                  >
                    Live Broadcast
                  </span>
                </td>
                <td style={{ padding: '0.95rem 1rem', fontSize: '0.84rem', color: '#334155' }}>
                  Real-time audio chime, visual token alerts, and department room queue displays
                </td>
                <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    to="/admin/displays"
                    className="btn btn-sm btn-secondary"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    Configure Screens &rarr;
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Complete Vertical Credentials & System Portals */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            background: '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              System Portals &amp; Master Credentials Reference
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Reference logins for testing, departmental portal jumping, and credential resets
            </p>
          </div>
          <Link
            to="/admin/staff"
            style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8b1e2b', textDecoration: 'none' }}
          >
            Create / Reset Staff Passwords &rarr;
          </Link>
        </div>

        <div className="table-wrap" style={{ margin: 0 }}>
          <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ width: '25%', padding: '0.75rem 1.25rem', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Portal / Role
                </th>
                <th style={{ width: '26%', padding: '0.75rem 1rem', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  User ID / Email
                </th>
                <th style={{ width: '18%', padding: '0.75rem 1rem', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Password
                </th>
                <th style={{ width: '18%', padding: '0.75rem 1rem', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Access Level
                </th>
                <th style={{ width: '13%', padding: '0.75rem 1.25rem', textAlign: 'right', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Direct Access
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Super Admin */}
              <tr>
                <td style={{ padding: '0.9rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ color: '#8b1e2b', display: 'inline-flex' }}><IconShield size={16} /></span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>Super Administrator</span>
                  </div>
                </td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <code style={{ background: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '4px', fontSize: '0.82rem', color: '#0f172a' }}>
                    superadmin@alverstone.com
                  </code>
                </td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <code style={{ background: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '4px', fontSize: '0.82rem', color: '#0f172a' }}>
                    SuperAdmin@2026
                  </code>
                </td>
                <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                  <span style={{ color: '#8b1e2b', fontWeight: 700 }}>Full Master Access</span>
                </td>
                <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>Active Now</span>
                </td>
              </tr>

              {/* Reception Desk */}
              <tr>
                <td style={{ padding: '0.9rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ color: '#0284c7', display: 'inline-flex' }}><IconUsers size={16} /></span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Reception Desk</span>
                  </div>
                </td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <code style={{ background: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '4px', fontSize: '0.82rem', color: '#0f172a' }}>
                    reception@clinic.com
                  </code>
                </td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <code style={{ background: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '4px', fontSize: '0.82rem', color: '#0f172a' }}>
                    password
                  </code>
                </td>
                <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                  Patient check-in &amp; queue
                </td>
                <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    to="/receptionist/dashboard"
                    style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}
                  >
                    Open Portal &rarr;
                  </Link>
                </td>
              </tr>

              {/* Pharmacy Unit */}
              <tr>
                <td style={{ padding: '0.9rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ color: '#7e22ce', display: 'inline-flex' }}><IconPill size={16} /></span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Pharmacy Desk</span>
                  </div>
                </td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <code style={{ background: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '4px', fontSize: '0.82rem', color: '#0f172a' }}>
                    pharmacy@clinic.com
                  </code>
                </td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <code style={{ background: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '4px', fontSize: '0.82rem', color: '#0f172a' }}>
                    password
                  </code>
                </td>
                <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                  Drug billing &amp; dispensing
                </td>
                <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    to="/pharmacy/dashboard"
                    style={{ fontSize: '0.82rem', fontWeight: 700, color: '#7e22ce', textDecoration: 'none' }}
                  >
                    Open Portal &rarr;
                  </Link>
                </td>
              </tr>

              {/* Diagnostics Lab */}
              <tr>
                <td style={{ padding: '0.9rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ color: '#0f766e', display: 'inline-flex' }}><IconFlask size={16} /></span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>Diagnostic Laboratory</span>
                  </div>
                </td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <code style={{ background: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '4px', fontSize: '0.82rem', color: '#0f172a' }}>
                    lab@clinic.com
                  </code>
                </td>
                <td style={{ padding: '0.9rem 1rem' }}>
                  <code style={{ background: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '4px', fontSize: '0.82rem', color: '#0f172a' }}>
                    password
                  </code>
                </td>
                <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                  Diagnostic tests &amp; pathology
                </td>
                <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                  <Link
                    to="/lab/dashboard"
                    style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f766e', textDecoration: 'none' }}
                  >
                    Open Portal &rarr;
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
