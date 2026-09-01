import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import ActionTile from '../../components/ActionTile'
import { getDashboardStats } from '../../api/client'
import { adminNav } from '../../config/navigation'
import type { DashboardStats } from '../../api/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => { getDashboardStats().then(({ data }) => setStats(data)) }, [])

  return (
    <Layout title="Admin Dashboard" subtitle="Clinic overview and management" nav={adminNav}>
      <div className="stats-grid">
        <div className="stat-card"><span>Total Patients</span><strong>{stats?.total_patients ?? '—'}</strong></div>
        <div className="stat-card"><span>Active Doctors</span><strong>{stats?.total_doctors ?? '—'}</strong></div>
        <div className="stat-card"><span>Today's Appointments</span><strong>{stats?.today_appointments ?? '—'}</strong></div>
        <div className="stat-card"><span>Queue Waiting</span><strong>{stats?.today_queue_length ?? '—'}</strong></div>
      </div>
      <p className="section-title">Quick Links</p>
      <div className="action-grid">
        <ActionTile to="/admin/doctors" icon="stethoscope" title="Manage Doctors" description="Approve, set availability" />
        <ActionTile to="/admin/patients" icon="users" title="Patients" description="View all patients" />
        <ActionTile to="/admin/medicines" icon="pill" title="Medicines" description="Manage medicine catalog" />
        <ActionTile to="/admin/lab" icon="flask" title="Lab Tests" description="Upload reports, manage tests" />
      </div>
    </Layout>
  )
}
