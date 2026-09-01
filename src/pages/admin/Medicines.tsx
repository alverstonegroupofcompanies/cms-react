import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { createMedicine, getMedicines } from '../../api/client'
import { adminNav } from '../../config/navigation'
import type { Medicine } from '../../api/types'

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [form, setForm] = useState({ name: '', generic_name: '', unit: 'tablet', stock_quantity: 100, unit_price: 0 })

  const load = () => getMedicines().then(({ data }) => setMedicines(data))
  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMedicine(form)
    setForm({ name: '', generic_name: '', unit: 'tablet', stock_quantity: 100, unit_price: 0 })
    load()
  }

  return (
    <Layout title="Medicine Catalog" subtitle="Manage pharmacy inventory" nav={adminNav}>
      <div className="card">
        <div className="card-header"><h3>Add Medicine</h3></div>
        <form onSubmit={handleCreate} className="inline-form">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Generic name" value={form.generic_name} onChange={(e) => setForm({ ...form, generic_name: e.target.value })} />
          <input type="number" placeholder="Stock" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
          <input type="number" placeholder="Price" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: Number(e.target.value) })} />
          <button type="submit" className="btn btn-primary">Add Medicine</button>
        </form>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Generic</th><th>Stock</th><th>Price</th></tr></thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.generic_name}</td>
                  <td>{m.stock_quantity} {m.unit}</td>
                  <td>₹{m.unit_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
