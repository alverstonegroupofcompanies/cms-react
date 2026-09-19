import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resetPassword } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import PatientAuthLayout from '../../components/PatientAuthLayout'
import PasswordInput from '../../components/PasswordInput'

export default function PatientResetPassword() {
  const [password, setPassword] = useState('')
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
    setLoading(true)
    setError('')
    try {
      const { data } = await resetPassword(password)
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
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </div>
        <button type="submit" className="ph-btn ph-btn-primary ph-btn-block" disabled={loading}>
          {loading ? 'Saving...' : 'Save Password'}
        </button>
      </form>
    </PatientAuthLayout>
  )
}
