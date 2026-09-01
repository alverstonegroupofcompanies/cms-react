import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { getPatients } from '../../api/client'
import { adminNav } from '../../config/navigation'
import type { Patient } from '../../api/types'

export default function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')

  const load = (s?: string) => getPatients(s).then(({ data }) => setPatients(data.data || data))
  useEffect(() => { load() }, [])

  return (
    <Layout title="Patients" subtitle="All registered patients" nav={adminNav}>
      <div className="card">
        <div className="search-bar">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients" />
          <button type="button" className="btn btn-primary" onClick={() => load(search)}>Search</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Gender</th><th>DOB</th></tr></thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.patient_code}</strong></td>
                  <td>{p.name}</td>
                  <td>{p.phone}</td>
                  <td>{p.gender || '—'}</td>
                  <td>{p.dob || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
