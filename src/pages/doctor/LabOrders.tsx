import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { createLabOrder, getLabTests, searchPatients } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { doctorNav } from '../../config/navigation'
import type { LabTest, Patient } from '../../api/types'

export default function DoctorLabOrders() {
  const { user } = useAuth()
  const [tests, setTests] = useState<LabTest[]>([])
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientId, setPatientId] = useState('')
  const [selectedTests, setSelectedTests] = useState<number[]>([])
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => { getLabTests().then(({ data }) => setTests(data)) }, [])

  const handleSearch = async () => {
    const { data } = await searchPatients(search)
    setPatients(data)
  }

  const toggleTest = (id: number) => {
    setSelectedTests((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.doctor || !patientId || !selectedTests.length) return
    await createLabOrder({
      patient_id: Number(patientId),
      doctor_id: user.doctor.id,
      test_ids: selectedTests,
      notes,
    })
    setMessage('Lab order created successfully')
    setSelectedTests([])
  }

  return (
    <Layout title="Order Lab Tests" subtitle="Select tests for a patient" nav={doctorNav}>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="search-bar">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient" />
            <button type="button" className="btn btn-primary" onClick={handleSearch}>Search</button>
          </div>
          <div className="form-group">
            <label>Patient</label>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.patient_code})</option>)}
            </select>
          </div>
          <p className="section-title">Select Tests</p>
          <div className="checkbox-grid">
            {tests.map((t) => (
              <label key={t.id} className="checkbox-item">
                <input type="checkbox" checked={selectedTests.includes(t.id)} onChange={() => toggleTest(t.id)} />
                {t.name} ({t.code}) — ₹{t.price}
              </label>
            ))}
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Order Tests</button>
        </form>
      </div>
    </Layout>
  )
}
