import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resetPassword } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import PatientAuthLayout from '../../components/PatientAuthLayout'

export default function PatientResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { updateUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await resetPassword(password, confirm)
      updateUser(data.user)
      navigate('/patient/dashboard')
    } catch {
      setError('Failed to update password')
    }
    setLoading(false)
  }

  return (
    <PatientAuthLayout title="Set a new password" subtitle="Update your temporary password to continue into the patient portal">
      {error && <div className="ph-alert ph-alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="ph-auth-form">
        <div className="ph-form-group">
          <label className="ph-label-form">New Password</label>
          <input className="ph-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </div>
        <div className="ph-form-group">
          <label className="ph-label-form">Confirm Password</label>
          <input className="ph-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
        </div>
        <button type="submit" className="ph-btn ph-btn-primary ph-btn-block" disabled={loading}>
          {loading ? 'Saving...' : 'Save Password'}
        </button>
      </form>
    </PatientAuthLayout>
  )
}
