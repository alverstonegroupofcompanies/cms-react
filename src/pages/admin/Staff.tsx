import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { createReceptionist, getStaff } from '../../api/client'
import { adminNav } from '../../config/navigation'
import type { User } from '../../api/types'

export default function AdminStaff() {
  const [staff, setStaff] = useState<User[]>([])
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [message, setMessage] = useState('')

  const load = () => getStaff().then(({ data }) => setStaff(data))
  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createReceptionist(form)
    setMessage('Receptionist created')
    setForm({ name: '', email: '', phone: '', password: '' })
    load()
  }

  return (
    <Layout title="Staff Management" subtitle="Manage receptionist accounts" nav={adminNav}>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card">
        <div className="card-header"><h3>Add Receptionist</h3></div>
        <form onSubmit={handleCreate} className="inline-form">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.email}</td>
                  <td><span className="badge badge-booked">{s.role}</span></td>
                  <td><span className={`badge badge-${s.status === 'active' ? 'active' : 'pending'}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
