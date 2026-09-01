import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getMe, logout as apiLogout } from '../api/client'
import type { User } from '../api/types'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  setAuth: (token: string, user: User) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
      if (token) {
        try {
          const { data } = await getMe()
          setUser(data)
          localStorage.setItem('user', JSON.stringify(data))
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [token])

  const setAuth = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = async () => {
    try { await apiLogout() } catch { /* ignore */ }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
