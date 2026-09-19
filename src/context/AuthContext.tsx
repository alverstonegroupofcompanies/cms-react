import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { getMe, logout as apiLogout } from '../api/client'
import type { User } from '../api/types'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  setAuth: (token: string, user: User) => void
  updateUser: (user: User) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function readStoredUser(): User | null {
  try {
    const stored = localStorage.getItem('user')
    return stored ? (JSON.parse(stored) as User) : null
  } catch {
    return null
  }
}

function readStoredToken(): string | null {
  return localStorage.getItem('token')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser())
  const [token, setToken] = useState<string | null>(() => readStoredToken())
  const [loading, setLoading] = useState(() => Boolean(readStoredToken()))
  const bootstrapped = useRef(false)
  const hydrating = useRef(false)

  const applySession = useCallback((nextToken: string | null, nextUser: User | null) => {
    if (nextToken) localStorage.setItem('token', nextToken)
    else localStorage.removeItem('token')
    if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser))
    else localStorage.removeItem('user')
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const hydrateFromApi = useCallback(async (activeToken: string) => {
    if (hydrating.current) return
    hydrating.current = true
    try {
      const { data } = await getMe()
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
      // Keep token in sync with whatever is currently stored (other tabs may change it).
      const latest = readStoredToken()
      if (latest && latest !== activeToken) {
        setToken(latest)
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      }
    } finally {
      hydrating.current = false
      bootstrapped.current = true
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const onSessionCleared = () => {
      setToken(null)
      setUser(null)
      setLoading(false)
    }
    window.addEventListener('auth:session-cleared', onSessionCleared)
    return () => window.removeEventListener('auth:session-cleared', onSessionCleared)
  }, [])

  // Keep React auth state aligned when another tab logs in/out.
  useEffect(() => {
    const syncFromStorage = () => {
      const nextToken = readStoredToken()
      const nextUser = readStoredUser()
      setToken(nextToken)
      setUser(nextUser)
      if (!nextToken) setLoading(false)
    }
    window.addEventListener('storage', syncFromStorage)
    return () => window.removeEventListener('storage', syncFromStorage)
  }, [])

  // Returning to this tab: re-read token and refresh /auth/me so role never drifts.
  useEffect(() => {
    const refresh = () => {
      const latest = readStoredToken()
      if (latest !== token) {
        setToken(latest)
        setUser(readStoredUser())
        if (!latest) {
          setLoading(false)
          return
        }
      }
      if (latest) void hydrateFromApi(latest)
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [token, hydrateFromApi])

  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      if (!token) {
        bootstrapped.current = true
        if (!cancelled) setLoading(false)
        return
      }
      if (!cancelled) await hydrateFromApi(token)
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [token, hydrateFromApi])

  const setAuth = (newToken: string, newUser: User) => {
    bootstrapped.current = true
    setLoading(false)
    applySession(newToken, newUser)
  }

  const updateUser = (newUser: User) => {
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      /* ignore */
    }
    applySession(null, null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, setAuth, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
