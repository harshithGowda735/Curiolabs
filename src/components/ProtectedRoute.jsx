import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute — gates routes by auth state, role, and profile completion.
 * Props:
 * - requiredRole: 'student' | 'teacher' | null (any role)
 * - requireProfile: boolean
 */
export default function ProtectedRoute({ children, requiredRole = null, requireProfile = false }) {
  const { currentUser, userRole, profileComplete, loading } = useAuth()

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
    return <Navigate to="/login" replace />
  }

  if (!userRole) {
    return <Navigate to="/catalog" replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'teacher' ? '/teacher' : '/student'} replace />
  }

  if (requireProfile && !profileComplete) {
    return <Navigate to="/complete-profile" replace />
  }

  return children
}
