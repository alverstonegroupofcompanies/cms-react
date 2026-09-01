import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { approveDoctor, createDoctor, deactivateDoctor, getDoctors, setDoctorAvailability } from '../../api/client'
import { adminNav } from '../../config/navigation'
import type { Doctor } from '../../api/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', specialization: '', phone: '', email: '', password: 'password123' })

  const load = () => getDoctors().then(({ data }) => setDoctors(data))
  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createDoctor(form)
    setShowForm(false)
    load()
  }

  const handleSetAvailability = async (doctorId: number) => {
    const availability = [1, 2, 3, 4, 5].map((day) => ({
      day_of_week: day,
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 10,
    }))
    await setDoctorAvailability(doctorId, availability)
    load()
  }

  return (
    <Layout title="Doctor Management" subtitle="Approve doctors and set availability" nav={adminNav}>
      <div className="card">
        <div className="card-header">
          <h3>All Doctors</h3>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>+ Add Doctor</button>
        </div>
        {showForm && (
          <form onSubmit={handleCreate} className="inline-form">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        )}
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Specialization</th><th>Status</th><th>Availability</th><th>Actions</th></tr></thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.specialization}</td>
                  <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                  <td>{d.availability?.map((a) => DAYS[a.day_of_week]).join(', ') || 'Not set'}</td>
                  <td className="actions">
                    {d.status === 'pending' && <button type="button" className="btn btn-sm btn-success" onClick={() => approveDoctor(d.id).then(load)}>Approve</button>}
                    {d.status === 'active' && <button type="button" className="btn btn-sm btn-danger" onClick={() => deactivateDoctor(d.id).then(load)}>Deactivate</button>}
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleSetAvailability(d.id)}>Set Mon-Fri</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
