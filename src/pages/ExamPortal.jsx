import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { KeyRound, ArrowRight, ArrowLeft, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react'
import { getExamByCode, recordStudentExamStart } from '../services/examService'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ExamPortal() {
  const { examCode } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginDemoUser, currentUser, profile } = useAuth()

  const [code, setCode] = useState(examCode || searchParams.get('code') || '')
  const [studentName, setStudentName] = useState(profile?.name || currentUser?.displayName || 'Harshith Gowda (Student)')
  const [studentEmail, setStudentEmail] = useState(profile?.email || currentUser?.email || 'harshith.student@curiolabs.edu')
  const [error, setError] = useState('')

  const activeExam = getExamByCode(code)

  const handleStartExam = (e) => {
    e.preventDefault()
    setError('')
    if (!code.trim()) {
      setError('Please enter a valid examination test code.')
      return
    }

    const exam = getExamByCode(code)
    if (!exam) {
      setError(`Exam code "${code}" was not found. Please verify with your professor.`)
      return
    }

    const candidate = studentName.trim() || 'Candidate Student'
    const email = studentEmail.trim() || 'candidate@curiolabs.edu'

    // Direct student login without checking as requested for demo
    loginDemoUser('student', candidate, email)
    recordStudentExamStart(exam.code, candidate, email)

    navigate(`${exam.labRoute}?exam=${exam.code}&candidate=${encodeURIComponent(candidate)}`)
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAF5EB] text-[#221611] flex flex-col justify-between selection:bg-[#221611] selection:text-[#FAF5EB]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12 flex-1 flex flex-col justify-center">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#221611]/70 hover:text-[#221611] px-4 py-1.5 rounded-full bg-white border-2 border-[#221611]/15 hover:border-[#221611] transition-all"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>

        <div className="bg-white rounded-3xl border-2 border-[#221611] shadow-[5px_5px_0px_#221611] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-[#221611] text-[#A4C93B] rounded-2xl">
              <KeyRound size={24} />
            </span>
            <div>
              <span className="text-xs font-mono font-black uppercase text-[#221611] bg-[#A4C93B] px-2.5 py-0.5 rounded-full border border-[#221611]">
                Candidate Portal
              </span>
              <h1 className="text-2xl font-display font-black uppercase text-[#221611] tracking-tight mt-1">
                Practical Examination Gateway
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#221611]/70 leading-relaxed font-medium">
            Enter your teacher-assigned practical examination code to enter the allotted laboratory workbench. In strict examination mode, manual instructions and AI hints are deactivated.
          </p>

          {activeExam && (
            <div className="p-4 rounded-2xl bg-[#FAF5EB] border-2 border-[#221611] space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold uppercase text-[#221611]/60">Allotted Testbench:</span>
                <span className="text-xs font-mono font-black bg-[#221611] text-[#A4C93B] px-2.5 py-0.5 rounded-full">
                  CODE: {activeExam.code}
                </span>
              </div>
              <h4 className="text-base font-black text-[#221611] uppercase">{activeExam.title}</h4>
              <p className="text-xs font-bold text-[#221611]/70">{activeExam.labTitle} ({activeExam.durationMinutes} mins)</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-xs font-bold text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleStartExam} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-[#221611] mb-1">
                Examination Code:
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. TDM-4051"
                className="w-full bg-[#FAF5EB] border-2 border-[#221611] rounded-xl px-4 py-3 text-sm font-mono font-black uppercase text-[#221611] outline-none focus:ring-2 focus:ring-[#A4C93B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#221611] mb-1">
                Candidate Full Name:
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Candidate Full Name (e.g. Harshith Gowda)"
                className="w-full bg-[#FAF5EB] border-2 border-[#221611] rounded-xl px-4 py-3 text-sm font-bold text-[#221611] outline-none focus:ring-2 focus:ring-[#A4C93B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#221611] mb-1">
                Institutional Email ID:
              </label>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="Email ID (e.g. harshith@college.edu)"
                className="w-full bg-[#FAF5EB] border-2 border-[#221611] rounded-xl px-4 py-3 text-sm font-bold text-[#221611] outline-none focus:ring-2 focus:ring-[#A4C93B]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#A4C93B] hover:bg-[#93b533] text-[#221611] font-black py-4 rounded-2xl text-xs sm:text-sm uppercase tracking-wider border-2 border-[#221611] shadow-[3px_3px_0px_#221611] hover:shadow-[1px_1px_0px_#221611] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <FileCheck size={18} />
              <span>Launch Allotted Practical Exam Workbench</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="pt-2 border-t border-[#221611]/15 text-center text-[11px] font-mono text-[#221611]/60">
            Available Demo Codes: <strong className="text-[#221611]">TDM-4051</strong> or <strong className="text-[#221611]">PAM-8800</strong>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
