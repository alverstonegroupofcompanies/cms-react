import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import ActionTile from '../../components/ActionTile'
import { getDashboardStats } from '../../api/client'
import { adminNav } from '../../config/navigation'
import type { DashboardStats } from '../../api/types'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout
      title="Executive Command Center"
      subtitle="Complete system administration, access control & hospital overview"
      nav={adminNav}
    >
      {/* Super Admin Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2a0b12 0%, #50101b 50%, #6e131e 100%)',
          color: '#ffffff',
          padding: '1.75rem 2rem',
          borderRadius: '18px',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(42, 11, 18, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#fbcfe8',
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              Master Access • Super Admin
            </span>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Logged in as {user?.email || 'superadmin@alverstone.com'}
            </span>
          </div>
          <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            Alverstone Medcity Operations Overview
          </h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.92rem', color: 'rgba(255, 255, 255, 0.85)' }}>
            Full system governance: create &amp; manage doctor credentials, assign staff logins, track live queues, and review hospital analytics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/admin/doctors"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '999px',
              background: '#ffffff',
              color: '#8b1e2b',
              fontWeight: 750,
              fontSize: '0.86rem',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            + Create Doctor Login
          </Link>
          <Link
            to="/admin/staff"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontWeight: 700,
              fontSize: '0.86rem',
              textDecoration: 'none',
            }}
          >
            + Create Staff Login
          </Link>
        </div>
      </div>

      {/* Primary Hospital Pulse Counters */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <span>Active Doctors</span>
          <strong style={{ color: '#8b1e2b' }}>{loading ? '…' : (stats?.total_doctors ?? '—')}</strong>
          <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Board-certified faculty
          </small>
        </div>

        <div className="stat-card">
          <span>Total Staff Members</span>
          <strong style={{ color: '#0369a1' }}>{loading ? '…' : (stats?.total_staff ?? '—')}</strong>
          <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Reception, Pharmacy, Lab, Admin
          </small>
        </div>

        <div className="stat-card">
          <span>Registered Patients</span>
          <strong style={{ color: '#0f172a' }}>{loading ? '…' : (stats?.total_patients ?? '—')}</strong>
          <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Permanent hospital records
          </small>
        </div>

        <div className="stat-card">
          <span>Today&rsquo;s Appointments</span>
          <strong style={{ color: '#15803d' }}>{loading ? '…' : (stats?.today_appointments ?? '—')}</strong>
          <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Active consultations scheduled
          </small>
        </div>

        <div className="stat-card">
          <span>Queue Waiting</span>
          <strong style={{ color: '#b45309' }}>{loading ? '…' : (stats?.today_queue_length ?? '—')}</strong>
          <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Live tokens in reception lobby
          </small>
        </div>

        <div className="stat-card">
          <span>Pharmacy Catalog</span>
          <strong style={{ color: '#7c3aed' }}>{loading ? '…' : (stats?.total_medicines ?? '—')}</strong>
          <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.25rem' }}>
            Formulary medications
          </small>
        </div>
      </div>

      {/* Staff Breakdown Strip */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          marginBottom: '2.5rem',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 750, color: '#0f172a' }}>
              Staff Roles &amp; Workforce Distribution
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Active personnel authorized across hospital care departments
            </p>
          </div>
          <Link
            to="/admin/staff"
            style={{
              fontSize: '0.84rem',
              fontWeight: 750,
              color: '#8b1e2b',
              textDecoration: 'none',
            }}
          >
            Manage All Staff Logins &rarr;
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#f0f9ff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #bae6fd' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 750, textTransform: 'uppercase', color: '#0369a1' }}>Reception Desk</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0c4a6e', margin: '0.3rem 0' }}>
              {stats?.staff_breakdown?.receptionist ?? 0}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#0284c7' }}>Patient check-in &amp; token queue</span>
          </div>

          <div style={{ background: '#faf5ff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e9d5ff' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 750, textTransform: 'uppercase', color: '#7e22ce' }}>Pharmacy Unit</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#581c87', margin: '0.3rem 0' }}>
              {stats?.staff_breakdown?.pharmacy ?? 0}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#9333ea' }}>Dispensing &amp; prescription billing</span>
          </div>

          <div style={{ background: '#f0fdfa', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #99f6e4' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 750, textTransform: 'uppercase', color: '#0f766e' }}>Clinical Laboratory</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#134e4a', margin: '0.3rem 0' }}>
              {stats?.staff_breakdown?.lab ?? 0}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#0d9488' }}>Diagnostic test processing</span>
          </div>

          <div style={{ background: '#fff1f2', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #fecdd3' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 750, textTransform: 'uppercase', color: '#be123c' }}>System Administrators</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#881337', margin: '0.3rem 0' }}>
              {stats?.staff_breakdown?.admin ?? 0}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#e11d48' }}>Governance &amp; system access</span>
          </div>
        </div>
      </div>

      {/* Super Admin Quick Control Grid */}
      <p className="section-title" style={{ fontSize: '1.05rem', fontWeight: 750, color: '#0f172a', marginBottom: '1rem' }}>
        Hospital Systems &amp; Workspaces
      </p>
      <div className="action-grid" style={{ marginBottom: '2.5rem' }}>
        <ActionTile
          to="/admin/doctors"
          icon="stethoscope"
          title="Doctor Accounts &amp; Logins"
          description="Create doctor user IDs, set passwords, assign departments &amp; consultation hours"
        />
        <ActionTile
          to="/admin/staff"
          icon="shield"
          title="Staff Logins &amp; Access"
          description="Create and reset credentials for Reception, Pharmacy, Lab, and Admins"
        />
        <ActionTile
          to="/admin/patients"
          icon="users"
          title="Patient Master Registry"
          description="View patient health files, contact details, and past visit histories"
        />
        <ActionTile
          to="/admin/medicines"
          icon="pill"
          title="Pharmacy Formulary"
          description="Manage drug catalogs, stock quantities, and clinical pricing"
        />
        <ActionTile
          to="/admin/lab"
          icon="flask"
          title="Diagnostic Lab Tests"
          description="Define test panels, pathology pricing, and laboratory order tracking"
        />
        <ActionTile
          to="/admin/displays"
          icon="tv"
          title="OPD Queue TV Displays"
          description="Configure waiting room screens and real-time consultation token monitors"
        />
      </div>

      {/* Master Credentials Reference Box */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '16px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'inline-block',
            }}
          />
          <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 750, color: '#0f172a' }}>
            System Access &amp; Administrative Credentials
          </h4>
        </div>
        <p style={{ margin: '0 0 1rem', fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
          You have full authority to create, edit, or reset logins for any medical staff. Use the credentials below to log into the Super Admin console or share workspace logins with your team.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', fontSize: '0.84rem' }}>
          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <strong style={{ display: 'block', color: '#8b1e2b', marginBottom: '0.2rem' }}>Super Admin (Master Login)</strong>
            <div>Email / User ID: <code>superadmin@alverstone.com</code></div>
            <div>Password: <code>SuperAdmin@2026</code></div>
          </div>
          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <strong style={{ display: 'block', color: '#0284c7', marginBottom: '0.2rem' }}>Reception Desk Portal</strong>
            <div>Email: <code>reception@clinic.com</code></div>
            <div>Password: <code>password</code></div>
          </div>
          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <strong style={{ display: 'block', color: '#7c3aed', marginBottom: '0.2rem' }}>Pharmacy Workspace</strong>
            <div>Email: <code>pharmacy@clinic.com</code></div>
            <div>Password: <code>password</code></div>
          </div>
          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <strong style={{ display: 'block', color: '#0f766e', marginBottom: '0.2rem' }}>Pathology Lab Workspace</strong>
            <div>Email: <code>lab@clinic.com</code></div>
            <div>Password: <code>password</code></div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
