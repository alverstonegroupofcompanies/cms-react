import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  roles?: string[]
}

export default function ProtectedRoute({ roles }: Props) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="loading">Loading...</div>
  if (!user) {
    if (location.pathname.startsWith('/patient')) {
      const next = `${location.pathname}${location.search || ''}`
      return (
        <Navigate
          to={`/patient/login?next=${encodeURIComponent(next)}`}
          replace
          state={{ from: location.pathname }}
        />
      )
    }
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }
  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === 'patient' ? '/patient/dashboard' : '/'
    return <Navigate to={fallback} replace />
  }

  if (
    user.role === 'patient' &&
    user.must_reset_password &&
    location.pathname !== '/patient/reset-password'
  ) {
    return <Navigate to="/patient/reset-password" replace />
  }

  return <Outlet />
}
