import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { createPatient, getDoctors, joinQueue, searchPatients } from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import type { Doctor, Patient } from '../../api/types'

export default function ReceptionistPatients() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', gender: '', dob: '' })
  const [message, setMessage] = useState('')

  useEffect(() => { getDoctors().then(({ data }) => setDoctors(data)) }, [])

  const handleSearch = async () => {
    const { data } = await searchPatients(search)
    setResults(data)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createPatient(form)
    setMessage('Patient registered successfully')
    setShowForm(false)
    setForm({ name: '', phone: '', email: '', gender: '', dob: '' })
  }

  const handleWalkIn = async (patientId: number, doctorId: number) => {
    const { data } = await joinQueue(patientId, doctorId)
    setMessage(`Walk-in added: Token ${data.queue_token.display_code}`)
  }

  return (
    <Layout title="Patient Management" subtitle="Search and register patients" nav={receptionistNav}>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card">
        <div className="search-bar">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by phone or patient ID" />
          <button type="button" className="btn btn-primary" onClick={handleSearch}>Search</button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowForm(!showForm)}>+ New Patient</button>
        </div>
        {showForm && (
          <form onSubmit={handleCreate} className="inline-form">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <button type="submit" className="btn btn-primary">Register</button>
          </form>
        )}
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Walk-in</th></tr></thead>
            <tbody>
              {results.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.patient_code}</strong></td>
                  <td>{p.name}</td>
                  <td>{p.phone}</td>
                  <td>
                    {doctors[0] && (
                      <button type="button" className="btn btn-sm btn-primary" onClick={() => handleWalkIn(p.id, doctors[0].id)}>
                        Add to Queue
                      </button>
                    )}
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
