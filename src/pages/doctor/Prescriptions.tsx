import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { createPrescription, getMedicines, searchPatients } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { doctorNav } from '../../config/navigation'
import type { Medicine, Patient } from '../../api/types'

interface Item { medicine_id: number; dosage: string; frequency: string; duration_days: number; quantity: number }

export default function DoctorPrescriptions() {
  const { user } = useAuth()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientId, setPatientId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<Item[]>([{ medicine_id: 0, dosage: '1 tablet', frequency: 'Twice daily', duration_days: 5, quantity: 10 }])
  const [message, setMessage] = useState('')

  useEffect(() => { getMedicines().then(({ data }) => setMedicines(data)) }, [])

  const handleSearch = async () => {
    const { data } = await searchPatients(search)
    setPatients(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.doctor || !patientId) return
    await createPrescription({
      patient_id: Number(patientId),
      doctor_id: user.doctor.id,
      notes,
      items: items.filter((i) => i.medicine_id),
    })
    setMessage('Prescription created successfully')
  }

  return (
    <Layout title="Write Prescription" subtitle="Create a new prescription" nav={doctorNav}>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="search-bar">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient by phone" />
            <button type="button" className="btn btn-primary" onClick={handleSearch}>Search</button>
          </div>
          <div className="form-group">
            <label>Patient</label>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.patient_code})</option>)}
            </select>
          </div>
          <p className="section-title">Medicines</p>
          {items.map((item, idx) => (
            <div key={idx} className="form-row">
              <select value={item.medicine_id} onChange={(e) => {
                const copy = [...items]
                copy[idx].medicine_id = Number(e.target.value)
                setItems(copy)
              }}>
                <option value={0}>Select medicine</option>
                {medicines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input placeholder="Dosage" value={item.dosage} onChange={(e) => { const c = [...items]; c[idx].dosage = e.target.value; setItems(c) }} />
              <input placeholder="Frequency" value={item.frequency} onChange={(e) => { const c = [...items]; c[idx].frequency = e.target.value; setItems(c) }} />
              <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => { const c = [...items]; c[idx].quantity = Number(e.target.value); setItems(c) }} />
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={() => setItems([...items, { medicine_id: 0, dosage: '1 tablet', frequency: 'Twice daily', duration_days: 5, quantity: 10 }])}>+ Add Medicine</button>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Create Prescription</button>
        </form>
      </div>
    </Layout>
  )
}
