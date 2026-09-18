import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, userRole, loading } = useAuth(); const location = useLocation()
  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-500">Loading secure workspace…</div>
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!userRole) return <Navigate to="/role-selection" replace />
  if (allowedRoles.length && !allowedRoles.includes(userRole)) return <Navigate to={['faculty', 'admin'].includes(userRole) ? '/faculty' : '/student'} replace />
  return children
}
