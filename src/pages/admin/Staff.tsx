import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import {
  createStaff,
  deleteStaff,
  getStaff,
  resetStaffPassword,
  updateStaff,
} from '../../api/client'
import { adminNav } from '../../config/navigation'
import type { User } from '../../api/types'

type RoleType = 'all' | 'receptionist' | 'pharmacy' | 'lab' | 'admin'

const ROLE_LABELS: Record<string, string> = {
  receptionist: 'Receptionist',
  pharmacy: 'Pharmacy Staff',
  lab: 'Lab Technician',
  admin: 'Administrator',
}

const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  receptionist: { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  pharmacy: { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
  lab: { bg: '#f0fdfa', color: '#0f766e', border: '#99f6e4' },
  admin: { bg: '#fff1f2', color: '#8b1e2b', border: '#fecdd3' },
}

export default function AdminStaff() {
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<RoleType>('all')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Creation form state
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'receptionist',
    status: 'active',
  })

  // Edit modal state
  const [editingStaff, setEditingStaff] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'receptionist',
    status: 'active',
  })

  // Password reset modal state
  const [resetModalStaff, setResetModalStaff] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => {
    setLoading(true)
    getStaff()
      .then(({ data }) => setStaff(data))
      .catch(() => setError('Failed to load staff list.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const matchRole = selectedRole === 'all' || s.role === selectedRole
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(q) ||
        (s.email ? s.email.toLowerCase().includes(q) : false) ||
        (s.phone ? s.phone.includes(q) : false)
      return matchRole && matchSearch
    })
  }, [staff, selectedRole, search])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setMessage('')
    setError('')
    try {
      await createStaff(form)
      setMessage(`Staff account created successfully for ${form.name} (${ROLE_LABELS[form.role] || form.role}).`)
      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'receptionist',
        status: 'active',
      })
      setIsCreating(false)
      load()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create staff account. Please verify email is unique.')
    } finally {
      setActionLoading(false)
    }
  }

  const openEdit = (s: User) => {
    setEditingStaff(s)
    setEditForm({
      name: s.name,
      email: s.email || '',
      phone: s.phone || '',
      role: s.role || 'receptionist',
      status: s.status || 'active',
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStaff) return
    setActionLoading(true)
    setMessage('')
    setError('')
    try {
      await updateStaff(editingStaff.id, editForm)
      setMessage(`Staff account for ${editForm.name} updated successfully.`)
      setEditingStaff(null)
      load()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update staff account.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetModalStaff || !newPassword) return
    setActionLoading(true)
    setMessage('')
    setError('')
    try {
      await resetStaffPassword(resetModalStaff.id, newPassword)
      setMessage(`Password for ${resetModalStaff.name} (${resetModalStaff.email}) reset to: "${newPassword}".`)
      setResetModalStaff(null)
      setNewPassword('')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reset password.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (s: User) => {
    if (!window.confirm(`Are you sure you want to remove ${s.name} (${s.email}) from staff?`)) return
    setActionLoading(true)
    setMessage('')
    setError('')
    try {
      await deleteStaff(s.id)
      setMessage(`Staff member ${s.name} has been removed.`)
      load()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete staff account.')
    } finally {
      setActionLoading(false)
    }
  }

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#'
    let pass = ''
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setForm((prev) => ({ ...prev, password: pass }))
  }

  return (
    <Layout
      title="Staff Access Control"
      subtitle="Create, configure and manage staff user IDs and passwords for all departments"
      nav={adminNav}
    >
      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', borderRadius: '12px' }}>
          {message}
        </div>
      )}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem', borderRadius: '12px' }}>
          {error}
        </div>
      )}

      {/* Top Controls & Header Strip */}
      <div
        className="card"
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 750, color: '#0f172a' }}>
              Staff Workforce Registry
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.86rem', color: '#64748b' }}>
              Manage login access for Reception, Pharmacy, Laboratory, and System Administrators.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreating(!isCreating)}
            style={{
              borderRadius: '999px',
              padding: '0.65rem 1.35rem',
              fontWeight: 750,
              fontSize: '0.88rem',
              background: '#8b1e2b',
              border: 'none',
              boxShadow: '0 4px 12px rgba(139, 30, 43, 0.25)',
            }}
          >
            {isCreating ? '✕ Cancel Form' : '+ Create New Staff Login'}
          </button>
        </div>

        {/* Creation Form Panel */}
        {isCreating && (
          <div
            style={{
              background: '#fcfbfa',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 750, color: '#2a0b12' }}>
                New Staff Credential Setup
              </h4>
              <button
                type="button"
                onClick={generateRandomPassword}
                style={{
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.78rem',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ⚡ Generate Strong Password
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Name *
                  </label>
                  <input
                    placeholder="e.g. Rachel Thomas"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Login User ID / Email *
                  </label>
                  <input
                    placeholder="e.g. rachel@clinic.com"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Mobile Phone
                  </label>
                  <input
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Department / Role *
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                  >
                    <option value="receptionist">Reception Desk (receptionist)</option>
                    <option value="pharmacy">Pharmacy Staff (pharmacy)</option>
                    <option value="lab">Lab Technician (lab)</option>
                    <option value="admin">System Administrator (admin)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Initial Password *
                  </label>
                  <input
                    placeholder="Minimum 6 characters"
                    type="text"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Account Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                  >
                    <option value="active">Active (Can log in)</option>
                    <option value="inactive">Inactive (Access paused)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreating(false)}
                  style={{ borderRadius: '8px', padding: '0.55rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                  style={{ borderRadius: '8px', padding: '0.55rem 1.5rem', background: '#8b1e2b', border: 'none' }}
                >
                  {actionLoading ? 'Creating…' : 'Save & Issue Login'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Pills & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(['all', 'receptionist', 'pharmacy', 'lab', 'admin'] as RoleType[]).map((r) => {
              const active = selectedRole === r
              const count = staff.filter((s) => r === 'all' || s.role === r).length
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: '999px',
                    border: active ? '1px solid #8b1e2b' : '1px solid #e2e8f0',
                    background: active ? '#8b1e2b' : '#f8fafc',
                    color: active ? '#ffffff' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {r === 'all' ? 'All Roles' : ROLE_LABELS[r] || r} ({count})
                </button>
              )
            })}
          </div>

          <div style={{ minWidth: '240px' }}>
            <input
              placeholder="Search staff by name, email, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.48rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="card" style={{ padding: '0', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <div className="table-wrap">
          <table className="table" style={{ margin: 0 }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '1rem 1.25rem' }}>Staff Member</th>
                <th style={{ padding: '1rem 1.25rem' }}>Role / Department</th>
                <th style={{ padding: '1rem 1.25rem' }}>Phone</th>
                <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    Loading staff records…
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    No staff accounts match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => {
                  const roleStyle = ROLE_COLORS[s.role] || { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' }
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: roleStyle.bg,
                              color: roleStyle.color,
                              border: `1px solid ${roleStyle.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.88rem',
                            }}
                          >
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.92rem' }}>
                              {s.name}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.email}</span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            background: roleStyle.bg,
                            color: roleStyle.color,
                            border: `1px solid ${roleStyle.border}`,
                            fontSize: '0.76rem',
                            fontWeight: 750,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {ROLE_LABELS[s.role] || s.role}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.88rem' }}>
                        {s.phone || '—'}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span
                          className={`badge badge-${s.status === 'active' ? 'active' : 'pending'}`}
                          style={{ textTransform: 'capitalize', fontSize: '0.76rem' }}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.45rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setResetModalStaff(s)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: '#8b1e2b',
                              cursor: 'pointer',
                            }}
                          >
                            Reset Password
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(s)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#334155',
                              cursor: 'pointer',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #fecdd3',
                              background: '#fff1f2',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#e11d48',
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 750, color: '#0f172a' }}>
                Edit Staff Member
              </h3>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Login User ID / Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Mobile Phone
                  </label>
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Department / Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                  >
                    <option value="receptionist">Reception Desk (receptionist)</option>
                    <option value="pharmacy">Pharmacy Staff (pharmacy)</option>
                    <option value="lab">Lab Technician (lab)</option>
                    <option value="admin">System Administrator (admin)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                  >
                    <option value="active">Active (Can log in)</option>
                    <option value="inactive">Inactive (Access paused)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingStaff(null)}
                  style={{ borderRadius: '8px', padding: '0.55rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                  style={{ borderRadius: '8px', padding: '0.55rem 1.5rem', background: '#8b1e2b', border: 'none' }}
                >
                  {actionLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalStaff && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '440px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 750, color: '#0f172a' }}>
                Reset Staff Password
              </h3>
              <button
                type="button"
                onClick={() => setResetModalStaff(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
              Enter a new password for <strong>{resetModalStaff.name}</strong> ({resetModalStaff.email}).
            </p>

            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  New Password *
                </label>
                <input
                  type="text"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setResetModalStaff(null)}
                  style={{ borderRadius: '8px', padding: '0.55rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading || !newPassword}
                  style={{ borderRadius: '8px', padding: '0.55rem 1.5rem', background: '#8b1e2b', border: 'none' }}
                >
                  {actionLoading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
