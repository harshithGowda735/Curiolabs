import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  FlaskConical, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap, 
  UserCheck,
  KeyRound,
  FileCheck2,
  Zap
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getExamByCode, recordStudentExamStart } from '../services/examService'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialRole = searchParams.get('role') === 'faculty' || searchParams.get('role') === 'teacher' ? 'faculty' : 'student'
  
  const [role, setRole] = useState(initialRole)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [branch, setBranch] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Quick Exam Entrance Code State
  const [examCodeInput, setExamCodeInput] = useState('')
  const [examStudentName, setExamStudentName] = useState('')
  const [examError, setExamError] = useState('')

  const { signInWithGoogle, signInWithEmail, register, signUpWithEmail, loginDemoUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const r = searchParams.get('role')
    if (r === 'faculty' || r === 'teacher') {
      setRole('faculty')
    } else if (r === 'student') {
      setRole('student')
    }
  }, [searchParams])

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setSearchParams({ role: newRole })
  }

  // 1-Click Direct Demo Login (Zero barriers / checking as requested)
  const handleQuickDemoLogin = (targetRole) => {
    setError('')
    setLoading(true)
    try {
      if (targetRole === 'faculty') {
        loginDemoUser('faculty', 'Prof. R. K. Sharma (ECE)', 'prof.sharma@curiolabs.edu')
        navigate('/faculty')
      } else {
        loginDemoUser('student', 'Harshith Gowda (Student)', 'harshith.student@curiolabs.edu')
        navigate('/catalog')
      }
    } catch (err) {
      setError(err.message || 'Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  // Join Practical Exam directly with code
  const handleJoinExam = (e) => {
    e.preventDefault()
    setExamError('')
    if (!examCodeInput.trim()) {
      setExamError('Please enter a valid lab test code (e.g. TDM-4051)')
      return
    }

    const code = examCodeInput.trim().toUpperCase()
    const exam = getExamByCode(code)

    if (!exam) {
      setExamError(`Test code "${code}" not found. Try "TDM-4051" or "PAM-8800"`)
      return
    }

    const candidateName = examStudentName.trim() || 'Harshith Gowda (Candidate)'
    const candidateEmail = email.trim() || 'candidate@curiolabs.edu'

    // Automatically log in candidate and record exam start
    loginDemoUser('student', candidateName, candidateEmail)
    recordStudentExamStart(code, candidateName, candidateEmail)

    // Route student directly to the exam workbench
    navigate(`${exam.labRoute}?exam=${code}&candidate=${encodeURIComponent(candidateName)}`)
  }

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
        navigate(role === 'faculty' ? '/faculty' : '/catalog')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Use One-Click Demo Login below!')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    try {
      await signInWithGoogle()
      navigate(role === 'faculty' ? '/faculty' : '/catalog')
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Use One-Click Demo Login below!')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAF5EB] text-[#221611] flex flex-col justify-between selection:bg-[#221611] selection:text-[#FAF5EB]">
      <Navbar />

      <main className="relative flex-1 overflow-hidden py-8 sm:py-14">
        <div className="relative max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(390px,470px)] gap-10 lg:gap-14 items-start">
          
          {/* ── LEFT COLUMN: LAB MISSION & EXAM CODE PORTAL ── */}
          <section className="space-y-6">
            <div>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#754F40] hover:text-[#221611] px-4 py-1.5 rounded-full bg-white border-2 border-[#221611]/15 hover:border-[#221611] transition-all shadow-2xs"
              >
                <ArrowLeft size={14} /> Back to lab catalogue
              </Link>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-[#221611] uppercase leading-[1.02]">
              {role === 'faculty' ? 'Teacher Command' : 'Student Practical'}{' '}
              <span className="text-[#A4C93B] block sm:inline">
                {role === 'faculty' ? 'Console.' : 'Examination.'}
              </span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-[#6B564A] font-medium max-w-2xl">
              {role === 'faculty'
                ? 'Register practical lab tests, assign live experiment codes to cohorts, send student invites, and monitor real-time circuit output verification.'
                : 'Access assigned practical exam testbenches with your teacher-allotted exam code, or browse all interactive virtual engineering experiments.'}
            </p>

            {/* ── QUICK EXAM JOIN CARD FOR STUDENTS ── */}
            <div className="bg-white rounded-3xl border-2 border-[#221611] p-6 shadow-[4px_4px_0px_#221611] max-w-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-[#221611] text-[#A4C93B] rounded-xl">
                    <KeyRound size={18} />
                  </span>
                  <div>
                    <h3 className="font-display font-black text-sm text-[#221611] uppercase tracking-wide">
                      Have a Teacher Lab Test Code?
                    </h3>
                    <p className="text-xs text-[#221611]/70">Enter code to join the live practical examination</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-black bg-[#A4C93B] text-[#221611] px-2.5 py-1 rounded-full border border-[#221611]">
                  TESTBENCH
                </span>
              </div>

              <form onSubmit={handleJoinExam} className="space-y-3 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={examCodeInput}
                    onChange={(e) => setExamCodeInput(e.target.value.toUpperCase())}
                    placeholder="Exam Code (e.g. TDM-4051)"
                    className="rounded-xl border-2 border-[#221611] bg-[#FAF5EB] px-4 py-2.5 text-xs font-mono font-bold text-[#221611] placeholder:text-[#221611]/40 uppercase outline-none focus:ring-2 focus:ring-[#A4C93B]"
                  />
                  <input
                    type="text"
                    value={examStudentName}
                    onChange={(e) => setExamStudentName(e.target.value)}
                    placeholder="Student Name (e.g. Harshith)"
                    className="rounded-xl border-2 border-[#221611] bg-[#FAF5EB] px-4 py-2.5 text-xs font-bold text-[#221611] placeholder:text-[#221611]/40 outline-none focus:ring-2 focus:ring-[#A4C93B]"
                  />
                </div>

                {examError && (
                  <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                    {examError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#A4C93B] hover:bg-[#93b533] text-[#221611] font-black py-3 rounded-xl border-2 border-[#221611] shadow-[3px_3px_0px_#221611] hover:shadow-[1px_1px_0px_#221611] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 text-xs uppercase cursor-pointer"
                >
                  <FileCheck2 size={16} />
                  <span>Enter Allotted Practical Exam Workbench</span>
                  <ArrowRight size={15} />
                </button>
              </form>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#221611]/70 pt-2 border-t border-[#221611]/15">
                <span>Active Demo Code: <strong className="text-[#221611]">TDM-4051</strong></span>
                <span className="text-[#A4C93B] font-bold">Strict Practical Mode</span>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl">
              <div className="p-4 rounded-2xl bg-white border-2 border-[#221611]/15 shadow-sm">
                <span className="font-display font-black text-xs uppercase text-[#221611] block mb-1">
                  1. Teacher Code Generation
                </span>
                <p className="text-xs text-[#221611]/70 leading-relaxed font-medium">
                  Faculty registers any experiment, sets duration, and shares test codes with student batches.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border-2 border-[#221611]/15 shadow-sm">
                <span className="font-display font-black text-xs uppercase text-[#221611] block mb-1">
                  2. Live Output Telemetry
                </span>
                <p className="text-xs text-[#221611]/70 leading-relaxed font-medium">
                  When students wire and verify valid circuit output, their status turns green <strong className="text-emerald-700">DONE</strong> in real-time.
                </p>
              </div>
            </div>
          </section>

          {/* ── RIGHT COLUMN: AUTHENTICATION CARD & ONE-CLICK DIRECT ACCESS ── */}
          <section className="bg-white rounded-[32px] border-2 border-[#221611] shadow-[5px_5px_0px_#221611] overflow-hidden">
            {/* Top Interactive Role Switcher */}
            <div className="p-4 sm:p-5 bg-[#FAF5EB] border-b-2 border-[#221611]">
              <div className="grid grid-cols-2 p-1 bg-[#221611]/10 rounded-2xl border-2 border-[#221611] gap-1">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer ${
                    role === 'student'
                      ? 'bg-[#221611] text-[#FAF5EB] shadow-sm'
                      : 'text-[#221611] hover:bg-white/50'
                  }`}
                >
                  <GraduationCap size={15} className={role === 'student' ? 'text-[#A4C93B]' : 'text-[#221611]'} />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('faculty')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer ${
                    role === 'faculty'
                      ? 'bg-[#221611] text-[#FAF5EB] shadow-sm'
                      : 'text-[#221611] hover:bg-white/50'
                  }`}
                >
                  <UserCheck size={15} className={role === 'faculty' ? 'text-[#A4C93B]' : 'text-[#221611]'} />
                  <span>Teacher</span>
                </button>
              </div>
            </div>

            {/* Direct 1-Click Demo Login Banner (Requested: without any checking for demo) */}
            <div className="p-5 bg-[#FAF5EB] border-b-2 border-[#221611]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#221611]/70">
                  ⚡ Instant Direct Access (Demo Mode)
                </span>
                <span className="text-[10px] font-mono font-black bg-[#A4C93B] text-[#221611] px-2 py-0.5 rounded-full border border-[#221611]">
                  NO PASSWORD NEEDED
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin(role)}
                className="w-full py-3.5 px-4 bg-[#221611] hover:bg-[#332219] text-[#FAF5EB] rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wide border-2 border-[#221611] shadow-[3px_3px_0px_#A4C93B] hover:shadow-none hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap size={16} className="text-[#A4C93B] fill-[#A4C93B]" />
                <span>
                  {role === 'faculty'
                    ? '1-Click Teacher Console Login'
                    : '1-Click Student Direct Login'}
                </span>
                <ArrowRight size={16} className="text-[#A4C93B]" />
              </button>
            </div>

            {/* Standard Credential Form */}
            <div className="p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-[#221611]/60 font-bold">
                    {role === 'faculty' ? 'Institutional Faculty Portal' : 'Student Credential Portal'}
                  </p>
                  <h2 className="mt-0.5 text-xl font-display font-black text-[#221611] uppercase tracking-tight">
                    {isSignUp 
                      ? (role === 'faculty' ? 'Create Teacher Account' : 'Create Student Account')
                      : (role === 'faculty' ? 'Teacher Sign In' : 'Student Sign In')}
                  </h2>
                </div>
                <div className="w-10 h-10 grid place-items-center rounded-xl bg-[#221611] text-[#A4C93B] shadow-sm shrink-0">
                  {role === 'faculty' ? <UserCheck size={18} /> : <GraduationCap size={18} />}
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border-2 border-red-300 bg-red-50 p-3 text-xs text-red-800 font-bold">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogle}
                type="button"
                className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-[#221611] bg-white py-2.5 text-xs font-black text-[#221611] hover:bg-[#FAF5EB] transition shadow-[2px_2px_0px_#221611] cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 18 18">
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
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 my-4">
                <span className="h-px flex-1 bg-[#221611]/15" />
                <span className="text-[10px] font-mono text-[#221611]/60 uppercase font-bold tracking-wider">OR WITH EMAIL</span>
                <span className="h-px flex-1 bg-[#221611]/15" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {isSignUp && (
                  <>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full rounded-xl border-2 border-[#221611] bg-[#FAF5EB] px-4 py-2.5 text-xs text-[#221611] font-bold outline-none placeholder:text-[#221611]/40 focus:ring-2 focus:ring-[#A4C93B]"
                      required
                    />
                    <input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder={role === 'faculty' ? 'Department (e.g. Electronics, Physics)' : 'Branch / Year (e.g. ECE B.Tech)'}
                      className="w-full rounded-xl border-2 border-[#221611] bg-[#FAF5EB] px-4 py-2.5 text-xs text-[#221611] font-bold outline-none placeholder:text-[#221611]/40 focus:ring-2 focus:ring-[#A4C93B]"
                      required
                    />
                  </>
                )}

                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#221611]/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={role === 'faculty' ? 'Teacher institutional email' : 'Student email address'}
                    className="w-full rounded-xl border-2 border-[#221611] bg-[#FAF5EB] pl-10 pr-4 py-2.5 text-xs text-[#221611] font-bold outline-none placeholder:text-[#221611]/40 focus:ring-2 focus:ring-[#A4C93B]"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#221611]/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-xl border-2 border-[#221611] bg-[#FAF5EB] pl-10 pr-10 py-2.5 text-xs text-[#221611] font-bold outline-none placeholder:text-[#221611]/40 focus:ring-2 focus:ring-[#A4C93B]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#221611]/60 hover:text-[#221611]"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <button
                  disabled={loading}
                  className="w-full rounded-xl py-3 text-xs font-display font-black text-[#221611] uppercase tracking-wider bg-[#A4C93B] hover:bg-[#93b533] border-2 border-[#221611] shadow-[2px_2px_0px_#221611] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? 'Please wait…' : isSignUp 
                    ? (role === 'faculty' ? 'Register Teacher Account' : 'Register Student Account')
                    : (role === 'faculty' ? 'Sign In as Teacher' : 'Sign In as Student')}
                  <ArrowRight size={14} />
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-[#221611]/70 font-medium">
                {isSignUp ? 'Already registered?' : 'Need a new account?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-bold text-[#221611] underline underline-offset-4 hover:text-[#754F40] cursor-pointer"
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
