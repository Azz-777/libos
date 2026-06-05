import { createContext, useContext, useEffect, useState } from 'react'
import { Auth } from '../api/index.js'
import { getToken, setToken, clearToken } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    Auth.me()
      .then(({ user }) => setUser(user))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { token, user } = await Auth.login(email, password)
    setToken(token)
    setUser(user)
    return user
  }

  const logout = async () => {
    try { await Auth.logout() } catch {}
    clearToken()
    setUser(null)
  }

  const can = (...roles) => user && roles.includes(user.role)

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
