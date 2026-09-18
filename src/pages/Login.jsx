import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, FlaskConical, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')
  const [branch, setBranch] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signInWithGoogle, signInWithEmail, register, signUpWithEmail } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        if (typeof register === 'function') {
          await register({
            name,
            email,
            password,
            role,
            branch,
            academicLevel: role === 'student' ? 'engineering' : '',
            department: role === 'faculty' ? branch : ''
          })
        } else if (typeof signUpWithEmail === 'function') {
          await signUpWithEmail(email, password)
        }
        navigate(role === 'faculty' ? '/faculty' : '/catalog')
      } else {
        await signInWithEmail(email, password)
        navigate('/catalog')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    try {
      await signInWithGoogle()
      navigate('/catalog')
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200'

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="relative flex-1 overflow-hidden bg-tech-dots border-y border-slate-200/60">
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.045] pointer-events-none stroke-current"
          viewBox="0 0 1200 700"
          fill="none"
        >
          <path
            d="M0 145h270v160h310v-180h300v260h320M80 580h250V430h340v110h410"
            strokeWidth="1.5"
            strokeDasharray="8 9"
          />
          <circle cx="580" cy="305" r="6" fill="currentColor" />
          <circle cx="880" cy="125" r="6" fill="currentColor" />
        </svg>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 grid md:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] gap-10 md:gap-12 items-center">
          {/* Left Column: Mission Overview */}
          <section className="max-w-xl">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-950 mb-8 transition-colors"
            >
              <ArrowLeft size={14} /> Back to the lab catalogue
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-600 shadow-2xs">
              <Sparkles size={12} /> CurioLabs access gateway
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-950 leading-[1.05]">
              Enter your{' '}
              <span className="font-normal text-slate-500 underline decoration-slate-200 underline-offset-8">
                laboratory workspace.
              </span>
            </h1>

            <p className="mt-6 text-base leading-relaxed text-slate-600">
              Access interactive simulations, WebAR hardware, and progress analytics built for modern science and engineering education.
            </p>

            <div className="mt-8 space-y-4">
              {[
                [ShieldCheck, 'Secure identity', 'Google and email authentication with persistent sessions.'],
                [FlaskConical, 'One learning environment', 'Your labs, experiment records, and certificates stay in one place.']
              ].map(([Icon, title, description]) => (
                <div key={title} className="flex gap-3">
                  <div className="mt-0.5 h-8 w-8 flex-none rounded-xl bg-slate-950 text-white grid place-items-center">
                    <Icon size={15} />
                  </div>
                  <p className="text-sm text-slate-600">
                    <b className="block text-slate-900">{title}</b>
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Authentication Form */}
          <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-950/[0.06] overflow-hidden">
            <div className="p-6 sm:p-7 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Account access</p>
                  <h2 className="mt-1 text-2xl font-display font-bold text-slate-950">
                    {isSignUp ? 'Create your account' : 'Welcome back'}
                  </h2>
                </div>
                <div className="w-10 h-10 grid place-items-center rounded-2xl bg-slate-950 text-white">
                  <FlaskConical size={19} />
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {isSignUp ? 'Choose your role to create your lab profile.' : 'Sign in to continue your virtual lab journey.'}
              </p>
            </div>

            <div className="p-6 sm:p-7">
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogle}
                type="button"
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-5">
                <span className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-mono text-slate-400">OR EMAIL</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {isSignUp && (
                  <>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className={inputClass}
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={inputClass}
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                      </select>
                      <input
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder={role === 'faculty' ? 'Department' : 'Branch / Major'}
                        className={inputClass}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className={`${inputClass} pl-11`}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={`${inputClass} pl-11 pr-11`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-950 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
                  <ArrowRight size={15} />
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-500">
                {isSignUp ? 'Already registered?' : 'New to CurioLabs?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-semibold text-slate-950 underline underline-offset-4"
                >
                  {isSignUp ? 'Sign in' : 'Create an account'}
                </button>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
