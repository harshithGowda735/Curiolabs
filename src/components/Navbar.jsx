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
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 safe-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-black text-slate-950 tracking-tight text-base group">
            <div className="w-7 h-7 rounded-lg bg-slate-950 text-white flex items-center justify-center transition-transform group-hover:scale-105">
              <FlaskConical size={15} />
            </div>
            <span className="text-slate-950 font-bold tracking-tight text-sm">
              CurioLabs <span className="text-[10px] font-mono font-normal text-slate-400 ml-1">OS</span>
            </span>
          </Link>

          {/* Desktop Nav - Clean Apple-style navigation */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/60 p-1 rounded-full border border-slate-200/60 text-xs font-medium">
            <Link
              to="/level-select"
              className={`px-3.5 py-1 rounded-full transition-all ${
                location.pathname.startsWith('/catalog') || location.pathname === '/level-select'
                  ? 'bg-white text-slate-950 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>{t('Academic Tracks', 'ಶೈಕ್ಷಣಿಕ ಹಂತಗಳು')}</span>
            </Link>

            {currentUser && (
              <Link
                to={dashboardPath}
                className={`px-3.5 py-1 rounded-full transition-all ${
                  location.pathname === dashboardPath
                    ? 'bg-white text-slate-950 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span>{userRole === 'teacher' ? t('Faculty Console', 'ಶಿಕ್ಷಕರ ಕನ್ಸೋಲ್') : t('Student Dashboard', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್')}</span>
              </Link>
            )}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors border border-slate-200/60"
              title={t('Switch language', 'ಭಾಷೆ ಬದಲಿಸಿ')}
            >
              <Globe size={13} className="text-slate-400" />
              <span>{lang === 'en' ? 'KN' : 'EN'}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to={dashboardPath}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-full transition-colors text-xs font-mono text-slate-700"
                >
                  <User size={12} className="text-slate-500" />
                  <span className="max-w-[100px] truncate">{currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-slate-400 hover:text-slate-950 rounded-full hover:bg-slate-100 transition-colors"
                  title={t('Sign out', 'ಸೈನ್ ಔಟ್')}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-all shadow-2xs"
                >
                  {t('Sign In', 'ಸೈನ್ ಇನ್')}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 space-y-1">
            <Link
              to="/level-select"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              🎓 {t('Academic Tracks (PUC & Engineering)', 'ಶೈಕ್ಷಣಿಕ ಹಂತಗಳು')}
            </Link>
            {currentUser ? (
              <Link
                to={dashboardPath}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-slate-100"
              >
                📊 {userRole === 'teacher' ? 'Faculty Console' : 'Student Dashboard'}
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
