import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-3 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/kirish" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/panel" replace />

  return children
}
