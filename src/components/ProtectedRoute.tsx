import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  roles?: string[]
}

export default function ProtectedRoute({ roles }: Props) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  if (
    user.role === 'patient' &&
    user.must_reset_password &&
    location.pathname !== '/patient/reset-password'
  ) {
    return <Navigate to="/patient/reset-password" replace />
  }

  return <Outlet />
}
