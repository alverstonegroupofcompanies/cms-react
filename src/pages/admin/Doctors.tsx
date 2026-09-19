import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import DoctorManageForm from '../../components/DoctorManageForm'
import DoctorAvatar from '../../components/DoctorAvatar'
import { approveDoctor, deactivateDoctor, getDoctors } from '../../api/client'
import { adminNav } from '../../config/navigation'
import type { Doctor } from '../../api/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function isAvailableToday(availability?: Doctor['availability']): boolean {
  if (!availability?.length) return false
  const today = new Date().getDay()
  return availability.some((a) => a.day_of_week === today)
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [message, setMessage] = useState('')

  const load = () => getDoctors().then(({ data }) => setDoctors(data))
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setMode('create')
    setMessage('')
  }

  const openEdit = (doctor: Doctor) => {
    setEditing(doctor)
    setMode('edit')
    setMessage('')
  }

  const handleDone = (msg: string) => {
    setMessage(msg)
    setMode('list')
    setEditing(null)
    load()
  }

  return (
    <Layout title="Doctor Management" subtitle="Create doctor logins, profiles, and availability" nav={adminNav}>
      {message && <div className="alert alert-success">{message}</div>}

      {mode !== 'list' ? (
        <div className="card">
          <DoctorManageForm
            doctor={mode === 'edit' ? editing : null}
            onDone={handleDone}
            onCancel={() => { setMode('list'); setEditing(null) }}
          />
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3>All Doctors</h3>
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>+ Add Doctor</button>
          </div>
          {doctors.length === 0 ? (
            <p className="muted">No doctors yet. Add one to get started.</p>
          ) : (
            <div className="staff-doctor-cards">
              {doctors.map((d) => {
                const onToday = isAvailableToday(d.availability)
                return (
                <article
                  key={d.id}
                  role="button"
                  tabIndex={0}
                  className={`staff-doctor-card is-clickable${onToday ? '' : ' is-off-today'}`}
                  onClick={() => openEdit(d)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openEdit(d)
                    }
                  }}
                >
                  <div className="staff-doctor-card-photo-wrap">
                    <DoctorAvatar
                      doctorId={d.id}
                      name={d.name}
                      photoUrl={d.photo_url}
                      className="staff-doctor-card-photo"
                    />
                    <span className={`staff-doctor-today-badge${onToday ? ' is-on' : ' is-off'}`}>
                      {onToday ? 'Available today' : 'Off today'}
                    </span>
                  </div>
                  <div className="staff-doctor-card-body">
                    <div className="staff-doctor-card-title-row">
                      <h4 className="staff-doctor-card-name">{d.name}</h4>
                      <span className={`badge badge-${d.status}`}>{d.status}</span>
                    </div>
                    <p className="staff-doctor-card-spec">{d.specialization}</p>
                    <p className="staff-doctor-card-meta">{d.email}</p>
                    <p className="staff-doctor-card-meta">
                      {d.phone}
                      {d.phone_secondary ? ` · ${d.phone_secondary}` : ''}
                    </p>
                    <p className="staff-doctor-card-meta">
                      {d.availability?.map((a) => DAYS[a.day_of_week]).join(', ') || 'Not set'}
                    </p>
                    <div className="staff-doctor-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="btn btn-sm btn-secondary" onClick={() => openEdit(d)}>Edit</button>
                      {d.status === 'pending' && (
                        <button type="button" className="btn btn-sm btn-success" onClick={() => approveDoctor(d.id).then(load)}>Approve</button>
                      )}
                      {d.status === 'active' && (
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => deactivateDoctor(d.id).then(load)}>Deactivate</button>
                      )}
                    </div>
                  </div>
                </article>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
