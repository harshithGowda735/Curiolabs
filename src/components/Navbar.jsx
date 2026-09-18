import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, User, Globe, FlaskConical, GraduationCap, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentUser, userRole, signOut } = useAuth()
  const { t, lang, toggleLanguage } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const dashboardPath = userRole === 'teacher' ? '/faculty' : '/student'

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40 safe-top">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
            <FlaskConical size={24} className="text-teal-500" />
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              CurioLabs
            </span>
          </Link>

          {/* Desktop Nav - Clean Apple-style navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/level-select"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/catalog') || location.pathname === '/level-select'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <GraduationCap size={15} />
              <span>{t('Academic Tracks', 'ಶೈಕ್ಷಣಿಕ ಹಂತಗಳು')}</span>
            </Link>

            {currentUser && (
              <Link
                to={dashboardPath}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  location.pathname === dashboardPath
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard size={14} />
                <span>{userRole === 'teacher' ? t('Faculty Console', 'ಶಿಕ್ಷಕರ ಕನ್ಸೋಲ್') : t('Student Dashboard', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್')}</span>
              </Link>
            )}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              title={t('Switch language', 'ಭಾಷೆ ಬದಲಿಸಿ')}
            >
              <Globe size={15} />
              <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to={dashboardPath}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs font-medium text-gray-700"
                >
                  <User size={13} className="text-gray-500" />
                  <span className="max-w-[100px] truncate">{currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title={t('Sign out', 'ಸೈನ್ ಔಟ್')}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                >
                  {t('Sign In', 'ಸೈನ್ ಇನ್')}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
            <Link
              to="/level-select"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              🎓 {t('Academic Tracks (PUC & Engineering)', 'ಶೈಕ್ಷಣಿಕ ಹಂತಗಳು')}
            </Link>
            {currentUser ? (
              <Link
                to={dashboardPath}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50"
              >
                📊 {userRole === 'teacher' ? 'Faculty Console' : 'Student Dashboard'}
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                🔐 {t('Sign In / Register', 'ಸೈನ್ ಇನ್')}
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
