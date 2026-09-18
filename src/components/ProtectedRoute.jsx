import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute — gates routes by auth state and role permissions.
 */
export default function ProtectedRoute({ children, allowedRoles = [], requiredRole = null }) {
  const { currentUser, userRole, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!userRole) {
    return <Navigate to="/catalog" replace />
  }

  const effectiveAllowed = allowedRoles.length > 0 
    ? allowedRoles 
    : requiredRole 
      ? [requiredRole] 
      : []

  if (effectiveAllowed.length > 0 && !effectiveAllowed.includes(userRole)) {
    return <Navigate to={['faculty', 'admin', 'teacher'].includes(userRole) ? '/faculty' : '/catalog'} replace />
  }

  return children
}
