import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, User, Globe, Search, ArrowRight } from 'lucide-react'
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

  const isTeacher = ['faculty', 'admin', 'teacher'].includes(userRole)

  return (
    <div className="sticky top-0 sm:top-2.5 z-50 px-2 sm:px-6 max-w-7xl mx-auto w-full">
      <nav className="bg-[#221611] text-white rounded-2xl sm:rounded-3xl shadow-xl px-5 sm:px-7 py-3 sm:py-3.5 border-2 border-[#3A2820]">
        <div className="flex items-center justify-between">
          {/* Brand Logo - Theobroma editorial typography style */}
          <Link to="/" className="flex flex-col group select-none">
            <span className="font-display tracking-[0.18em] font-black text-base sm:text-xl uppercase text-white leading-none transition-transform group-hover:scale-[1.01]">
              CURIOLABS
            </span>
            <span className="tracking-[0.38em] text-[8px] sm:text-[9px] uppercase text-[#D2C5B5] font-mono mt-1 opacity-90">
              v i r t u a l &nbsp; l a b s
            </span>
          </Link>

          {/* Desktop Nav Links - Chunky bold uppercase matching reference */}
          <div className="hidden lg:flex items-center gap-6 text-[11px] font-black tracking-wider uppercase text-[#E7DEC8]">
            <Link
              to="/catalog"
              className={`hover:text-white transition-colors pb-0.5 ${
                location.pathname === '/catalog' ? 'text-white border-b-2 border-[#C2DE6B]' : ''
              }`}
            >
              {t('All Labs', 'ಎಲ್ಲಾ ಲ್ಯಾಬ್‌ಗಳು')}
            </Link>

            <Link
              to="/catalog/puc"
              className={`hover:text-white transition-colors pb-0.5 ${
                location.pathname === '/catalog/puc' ? 'text-white border-b-2 border-[#C2DE6B]' : ''
              }`}
            >
              {t('PUC (+2)', 'PUC (+2)')}
            </Link>

            <Link
              to="/catalog/engineering"
              className={`hover:text-white transition-colors pb-0.5 ${
                location.pathname === '/catalog/engineering' ? 'text-white border-b-2 border-[#C2DE6B]' : ''
              }`}
            >
              {t('Engineering', 'ಎಂಜಿನಿಯರಿಂಗ್')}
            </Link>

            {currentUser && isTeacher && (
              <Link
                to="/faculty"
                className={`hover:text-[#C2DE6B] transition-colors pb-0.5 ${
                  location.pathname.startsWith('/faculty') ? 'text-[#C2DE6B] border-b-2 border-[#C2DE6B]' : ''
                }`}
              >
                {t('Faculty Console', 'ಶಿಕ್ಷಕರ ಕನ್ಸೋಲ್')}
              </Link>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle in retro uppercase */}
            <button
              onClick={toggleLanguage}
              className="text-[11px] font-black tracking-widest uppercase text-[#D8CEBC] hover:text-white px-2 py-1 transition-colors"
              title={t('Switch language', 'ಭಾಷೆ ಬದಲಿಸಿ')}
            >
              {lang === 'en' ? 'KN' : 'EN'}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                {isTeacher ? (
                  <Link
                    to="/faculty"
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#3A2820] text-[#C2DE6B] rounded-full text-xs font-black uppercase tracking-wider border border-[#4D362B]"
                  >
                    <span>{currentUser.displayName || 'Teacher'}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#3A2820] text-white rounded-full text-xs font-black uppercase tracking-wider border border-[#4D362B]">
                    <span>{currentUser.displayName || 'Student'}</span>
                  </div>
                )}

                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-[#D8CEBC] hover:text-[#C2DE6B] transition-colors"
                  title={t('Sign out', 'ಸೈನ್ ಔಟ್')}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                {/* Outlined Pill Button (Like CART button in reference) */}
                <Link
                  to="/login?role=student"
                  className="px-3.5 py-1.5 rounded-full border border-white/80 text-white hover:bg-white hover:text-[#221611] text-[11px] font-black tracking-widest uppercase transition-all duration-200"
                >
                  {t('Student Login', 'ವಿದ್ಯಾರ್ಥಿ')}
                </Link>

                {/* Solid Pill Button (Like CART filled button) */}
                <Link
                  to="/login?role=faculty"
                  className="px-3.5 py-1.5 rounded-full bg-[#FAF5EB] text-[#221611] hover:bg-[#C2DE6B] hover:text-[#221611] text-[11px] font-black tracking-widest uppercase transition-all duration-200 shadow-sm"
                >
                  {t('Teacher Login', 'ಶಿಕ್ಷಕ')}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-1.5 text-[#D8CEBC] hover:text-white rounded-lg transition-colors"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[#3A2820] space-y-2 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-black uppercase tracking-wider">
              <Link
                to="/catalog"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 bg-[#2D1D16] hover:bg-[#3A2820] rounded-xl text-center text-[#E7DEC8]"
              >
                {t('All Labs', 'ಎಲ್ಲಾ ಲ್ಯಾಬ್‌ಗಳು')}
              </Link>
              <Link
                to="/catalog/puc"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 bg-[#2D1D16] hover:bg-[#3A2820] rounded-xl text-center text-[#E7DEC8]"
              >
                {t('PUC (+2)', 'PUC (+2)')}
              </Link>
              <Link
                to="/catalog/engineering"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 bg-[#2D1D16] hover:bg-[#3A2820] rounded-xl text-center text-[#E7DEC8]"
              >
                {t('Engineering', 'ಎಂಜಿನಿಯರಿಂಗ್')}
              </Link>
              {currentUser && isTeacher && (
                <Link
                  to="/faculty"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 bg-[#C2DE6B] text-[#221611] rounded-xl text-center font-black"
                >
                  {t('Console', 'ಕನ್ಸೋಲ್')}
                </Link>
              )}
            </div>

            {!currentUser && (
              <div className="pt-2 border-t border-[#3A2820] flex gap-2">
                <Link
                  to="/login?role=student"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 text-center rounded-full border border-white/80 text-white text-[11px] font-black uppercase tracking-wider"
                >
                  {t('Student Login', 'ವಿದ್ಯಾರ್ಥಿ')}
                </Link>
                <Link
                  to="/login?role=faculty"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 text-center rounded-full bg-[#FAF5EB] text-[#221611] text-[11px] font-black uppercase tracking-wider font-bold"
                >
                  {t('Teacher Login', 'ಶಿಕ್ಷಕ')}
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  )
}
