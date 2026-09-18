import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, demoSignIn } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
      navigate('/role-selection')
    } catch (err) {
      setError(err.message || 'Authentication failed')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError('')
    try {
      await signInWithGoogle()
      navigate('/role-selection')
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
    }
  }

  const handleDemo = (role, level = null) => {
    demoSignIn(role)
    if (role === 'teacher') {
      navigate('/faculty')
    } else if (level) {
      navigate(`/catalog/${level}`)
    } else {
      navigate('/level-select')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-15 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FlaskConical size={28} />
            <h1 className="text-2xl font-display font-bold">CurioLabs</h1>
          </div>
          <p className="text-teal-100 text-sm">{t('Virtual & AR Lab Platform', 'ವರ್ಚುವಲ್ ಮತ್ತು AR ಲ್ಯಾಬ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್')}</p>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/></svg>
            {t('Continue with Google', 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಸಿ')}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium">{t('OR', 'ಅಥವಾ')}</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Email address', 'ಇಮೇಲ್ ವಿಳಾಸ')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('Password', 'ಪಾಸ್‌ವರ್ಡ್')}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20"
            >
              {loading ? '...' : isSignUp ? t('Create Account', 'ಖಾತೆ ರಚಿಸಿ') : t('Sign In', 'ಸೈನ್ ಇನ್')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-3">
            {isSignUp ? t('Already have an account?', 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?') : t("Don't have an account?", 'ಖಾತೆ ಇಲ್ಲವೇ?')}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-teal-600 font-semibold hover:underline">
              {isSignUp ? t('Sign In', 'ಸೈನ್ ಇನ್') : t('Sign Up', 'ಸೈನ್ ಅಪ್')}
            </button>
          </p>

          {/* Demo mode */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => handleDemo('student', 'puc')} 
                className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold rounded-xl text-xs transition-colors text-center"
              >
                <span className="block text-sm mb-0.5">🏫</span>
                <span>PUC Student</span>
              </button>
              <button 
                type="button"
                onClick={() => handleDemo('student', 'engineering')} 
                className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold rounded-xl text-xs transition-colors text-center"
              >
                <span className="block text-sm mb-0.5">⚡</span>
                <span>Engg Student</span>
              </button>
              <button 
                type="button"
                onClick={() => handleDemo('teacher')} 
                className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold rounded-xl text-xs transition-colors text-center"
              >
                <span className="block text-sm mb-0.5">👩‍🏫</span>
                <span>Faculty</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
