import { useState, useEffect } from 'react'
import { 
  Users, Award, BarChart3, Search, Plus, Radio, CheckCircle2, 
  FileText, Download, Eye, Sparkles, Filter, ChevronRight, Inbox,
  AlertCircle, KeyRound, Copy, Check, Send, Play, RefreshCw, Mail,
  Zap, Clock, ShieldCheck
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import CourseCertificateModal from '../components/CourseCertificateModal'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { 
  ASSIGNABLE_LABS, 
  getRegisteredExams, 
  registerNewExam, 
  getExamRoster, 
  inviteStudentsToExam,
  submitStudentExamOutput,
  subscribeToExamSync 
} from '../services/examService'

export default function TeacherDashboard() {
  const { currentUser, profile } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('exam_manager') // 'exam_manager' | 'monitor' | 'create' | 'reports'
  const [search, setSearch] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [inviteEmailInput, setInviteEmailInput] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  // Active Exams & Selected Exam Code
  const [exams, setExams] = useState(() => getRegisteredExams())
  const [selectedExamCode, setSelectedExamCode] = useState(() => {
    const list = getRegisteredExams()
    return list[0]?.code || 'TDM-4051'
  })

  // Live Student Roster for Selected Exam
  const [examRoster, setExamRoster] = useState(() => getExamRoster(selectedExamCode))

  // New Exam Registration Form State
  const [newExamLabId, setNewExamLabId] = useState('tdm')
  const [newExamTitle, setNewExamTitle] = useState('ECE 302: TDM & Demultiplexing Practical Exam')
  const [newExamDuration, setNewExamDuration] = useState('45')
  const [newExamCustomCode, setNewExamCustomCode] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Live real-time subscription across tabs/windows
  useEffect(() => {
    const refreshData = () => {
      const currentExams = getRegisteredExams()
      setExams(currentExams)
      setExamRoster(getExamRoster(selectedExamCode))
    }

    refreshData()
    const unsubscribe = subscribeToExamSync(() => {
      refreshData()
    })
    return () => unsubscribe()
  }, [selectedExamCode])

  const selectedExam = exams.find(e => e.code === selectedExamCode) || exams[0]

  // Copy code to clipboard
  const handleCopyCode = () => {
    const fullLink = `${window.location.origin}${selectedExam?.labRoute || '/electronics/tdm'}?exam=${selectedExamCode}`
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(`${selectedExamCode} (Link: ${fullLink})`)
    }
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Handle Inviting Students via Email
  const handleSendInvites = (e) => {
    e.preventDefault()
    if (!inviteEmailInput.trim()) return

    const emails = inviteEmailInput.split(/[,;\s]+/).filter(Boolean)
    const updated = inviteStudentsToExam(selectedExamCode, emails)
    if (updated) {
      setExamRoster(updated)
      setInviteEmailInput('')
      setInviteSuccess(`Successfully invited ${emails.length} student(s) to ${selectedExamCode}`)
      setTimeout(() => setInviteSuccess(''), 3000)
    }
  }

  // Handle Creating a New Exam Session
  const handleRegisterExam = (e) => {
    e.preventDefault()
    const lab = ASSIGNABLE_LABS.find(l => l.id === newExamLabId)
    const created = registerNewExam({
      title: newExamTitle || `${lab?.title} Practical Exam`,
      labId: newExamLabId,
      durationMinutes: newExamDuration,
      customCode: newExamCustomCode
    })

    const allExams = getRegisteredExams()
    setExams(allExams)
    setSelectedExamCode(created.code)
    setExamRoster(getExamRoster(created.code))
    setShowCreateModal(false)
    setNewExamCustomCode('')
  }

  // Instant simulator to verify that students turn GREEN DONE in real time
  const handleSimulateDone = (studentEmail) => {
    submitStudentExamOutput(selectedExamCode, studentEmail, 'Circuit Output Verified: 2kHz TDM Multiplexed Waveform')
    setExamRoster(getExamRoster(selectedExamCode))
  }

  // Filtered roster for search
  const filteredRoster = examRoster.filter(s =>
    s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(search.toLowerCase())
  )

  const completedCount = examRoster.filter(s => s.status === 'Completed').length
  const inProgressCount = examRoster.filter(s => s.status === 'In Progress').length
  const pendingCount = examRoster.filter(s => s.status === 'Pending').length

  return (
    <div className="min-h-[100dvh] bg-[#FAF5EB] text-[#221611] flex flex-col justify-between selection:bg-[#221611] selection:text-[#FAF5EB]">
      <div>
        <Navbar />

        {/* ── FACULTY COMMAND HEADER ── */}
        <div className="bg-[#221611] text-[#FAF5EB] px-4 sm:px-8 py-8 border-b-2 border-[#221611] shadow-md">
          <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A4C93B] text-[#221611] text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
                <ShieldCheck size={14} className="text-[#221611]" />
                <span>Verified Faculty Console • Practical Examination Authority</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-[#FAF5EB]">
                Teacher Command & Exam Management Console
              </h1>
              <p className="text-xs sm:text-sm text-[#FAF5EB]/70 font-medium mt-1">
                Register practical lab tests, generate student test codes, invite cohort email rosters, and monitor live circuit output verification.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#A4C93B] hover:bg-[#93b533] text-[#221611] font-black text-xs uppercase px-4 py-3 rounded-2xl border-2 border-[#221611] shadow-[3px_3px_0px_#FAF5EB] hover:shadow-[1px_1px_0px_#FAF5EB] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Register New Lab Exam</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN WORKSPACE ── */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 py-8 space-y-6">
          
          {/* Top Quick Status Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border-2 border-[#221611] shadow-[3px_3px_0px_#221611]">
              <span className="text-xs font-mono font-bold text-[#221611]/60 uppercase block">Active Test Session</span>
              <span className="text-xl sm:text-2xl font-black text-[#221611] block mt-1 font-mono">
                {selectedExamCode}
              </span>
              <span className="text-[11px] text-[#A4C93B] bg-[#221611] px-2 py-0.5 rounded-full inline-block mt-2 font-bold">
                ● BROADCAST ACTIVE
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-[#221611] shadow-[3px_3px_0px_#221611]">
              <span className="text-xs font-mono font-bold text-[#221611]/60 uppercase block">Outputs Verified (Done)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-emerald-600">{completedCount}</span>
                <span className="text-xs font-mono text-[#221611]/60 font-bold">/ {examRoster.length} Candidates</span>
              </div>
              <span className="text-[11px] text-emerald-800 font-bold block mt-2">
                Green Done Status Verified
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-[#221611] shadow-[3px_3px_0px_#221611]">
              <span className="text-xs font-mono font-bold text-[#221611]/60 uppercase block">In Progress at Testbench</span>
              <span className="text-3xl font-black text-amber-600 block mt-1">{inProgressCount}</span>
              <span className="text-[11px] text-amber-800 font-bold block mt-2">
                Circuit Wires Active
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-[#221611] shadow-[3px_3px_0px_#221611]">
              <span className="text-xs font-mono font-bold text-[#221611]/60 uppercase block">Awaiting Student Login</span>
              <span className="text-3xl font-black text-slate-500 block mt-1">{pendingCount}</span>
              <span className="text-[11px] text-slate-600 font-bold block mt-2">
                Invited Candidates
              </span>
            </div>
          </div>

          {/* ── ACTIVE EXAM CONTROL BAR & SHAREABLE CODE ── */}
          <div className="bg-white rounded-3xl border-2 border-[#221611] p-6 shadow-[4px_4px_0px_#221611] space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-[#221611]/15 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-black uppercase text-[#221611] bg-[#A4C93B] px-3 py-0.5 rounded-full border border-[#221611]">
                    Allotted Practical Lab
                  </span>
                  <span className="text-xs font-mono font-bold text-[#221611]/60">
                    Duration: {selectedExam?.durationMinutes || 45} mins
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#221611] uppercase tracking-tight">
                  {selectedExam?.title}
                </h2>
                <p className="text-xs font-mono font-bold text-[#221611]/70 mt-1">
                  Lab Workbench: <strong className="text-[#221611]">{selectedExam?.labTitle}</strong> ({selectedExam?.labRoute})
                </p>
              </div>

              {/* Shareable Exam Code Pill */}
              <div className="flex flex-wrap items-center gap-3 bg-[#FAF5EB] p-3 rounded-2xl border-2 border-[#221611]">
                <div className="text-left">
                  <span className="text-[10px] font-mono font-bold text-[#221611]/60 uppercase block">
                    Share Code to Students
                  </span>
                  <span className="text-2xl font-mono font-black text-[#221611] tracking-wider">
                    {selectedExamCode}
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="bg-[#221611] hover:bg-[#332219] text-[#FAF5EB] px-4 py-2.5 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  {copiedCode ? <Check size={14} className="text-[#A4C93B]" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Code Copied!' : 'Copy Code & Link'}</span>
                </button>

                {/* Direct Launch Preview for Teacher */}
                <a
                  href={`${selectedExam?.labRoute}?exam=${selectedExamCode}&candidate=Instructor+Preview`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white hover:bg-[#FAF5EB] text-[#221611] border-2 border-[#221611] px-3.5 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 transition-all"
                  title="Test Exam View as Student (Blind mode: no instructions, no AI)"
                >
                  <Eye size={14} />
                  <span>Test Student View</span>
                </a>
              </div>
            </div>

            {/* Email Invitation Bar */}
            <form onSubmit={handleSendInvites} className="flex flex-col sm:flex-row gap-2.5 items-center">
              <div className="relative flex-1 w-full">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#221611]/50" />
                <input
                  type="text"
                  value={inviteEmailInput}
                  onChange={(e) => setInviteEmailInput(e.target.value)}
                  placeholder="Invite students by email IDs (e.g. harshith@college.edu, aditi@college.edu)"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EB] border-2 border-[#221611] rounded-xl text-xs font-bold text-[#221611] placeholder:text-[#221611]/40 outline-none focus:ring-2 focus:ring-[#A4C93B]"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-[#221611] hover:bg-[#332219] text-[#FAF5EB] font-black px-5 py-2.5 rounded-xl text-xs uppercase flex items-center justify-center gap-2 border-2 border-[#221611] shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Send size={13} className="text-[#A4C93B]" />
                <span>Invite Students to Exam</span>
              </button>
            </form>

            {inviteSuccess && (
              <p className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 p-2 rounded-lg">
                ✓ {inviteSuccess}
              </p>
            )}
          </div>

          {/* ── LIVE STUDENT TELEMETRY ROSTER (Requested: Student shows GREEN DONE when output completed) ── */}
          <div className="bg-white rounded-3xl border-2 border-[#221611] shadow-[4px_4px_0px_#221611] overflow-hidden">
            <div className="p-5 border-b-2 border-[#221611] flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#FAF5EB]">
              <div>
                <h3 className="font-display font-black text-sm text-[#221611] uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Student Test Roster ({filteredRoster.length} Candidates Enrolled)</span>
                </h3>
                <p className="text-xs text-[#221611]/70 font-medium">
                  Status automatically changes to <strong className="text-emerald-700">GREEN DONE</strong> when student verifies circuit output.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#221611]/40" />
                <input
                  type="text"
                  placeholder="Search student name or roll..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border-2 border-[#221611] rounded-xl text-xs font-bold text-[#221611] placeholder:text-[#221611]/40 outline-none focus:ring-2 focus:ring-[#A4C93B]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#221611] text-[#FAF5EB] font-mono font-bold uppercase text-[11px] border-b-2 border-[#221611]">
                  <tr>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Roll / Email</th>
                    <th className="py-3 px-4">Allotted Lab</th>
                    <th className="py-3 px-4">Examination Status</th>
                    <th className="py-3 px-4">Output Telemetry</th>
                    <th className="py-3 px-4 text-center">Score / Grade</th>
                    <th className="py-3 px-4 text-center">Simulate Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#221611]/10 font-sans">
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-[#221611]/50">
                        <Inbox className="w-8 h-8 text-[#221611]/30 mx-auto mb-2" />
                        <span className="font-bold text-sm block">No students found for this test code</span>
                        <span className="text-xs">Invite candidates above or share code <strong>{selectedExamCode}</strong>.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map(st => {
                      const isDone = st.status === 'Completed' || st.outputVerified
                      const isInProgress = st.status === 'In Progress'

                      return (
                        <tr
                          key={st.id}
                          className={`transition-colors ${
                            isDone ? 'bg-emerald-50/70 hover:bg-emerald-100/50' : 'hover:bg-[#FAF5EB]/50'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-sm text-[#221611]">
                            {st.studentName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#221611]/70">
                            <div>{st.rollNo}</div>
                            <div className="text-[11px] opacity-70">{st.email}</div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#221611]">
                            {selectedExam?.labTitle}
                          </td>

                          {/* ── REAL-TIME STATUS BADGE (GREEN DONE AS REQUESTED) ── */}
                          <td className="py-3.5 px-4">
                            {isDone ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-black font-mono text-[11px] border-2 border-emerald-700 shadow-xs">
                                <CheckCircle2 size={13} className="text-white fill-emerald-800" />
                                <span>DONE / OUTPUT VERIFIED</span>
                              </span>
                            ) : isInProgress ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold font-mono text-[11px] border border-amber-300">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                <span>IN PROGRESS</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold font-mono text-[11px] border border-slate-300">
                                <span>○ PENDING LOGIN</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-xs font-mono font-medium text-[#221611]">
                            {isDone ? (
                              <div className="text-emerald-900 font-bold">
                                <div>✓ {st.outputDetails}</div>
                                <div className="text-[10px] text-[#221611]/60">Verified at: {st.completedAt || 'Just now'}</div>
                              </div>
                            ) : isInProgress ? (
                              <span className="text-amber-800">Wiring breadboard & tuning frequency</span>
                            ) : (
                              <span className="text-slate-400">Waiting for candidate</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono font-black text-sm">
                            {isDone ? (
                              <span className="text-emerald-700 bg-white border-2 border-emerald-600 px-2.5 py-0.5 rounded-lg">
                                100 / 100 (A+)
                              </span>
                            ) : (
                              <span className="text-[#221611]/40">-</span>
                            )}
                          </td>

                          {/* Quick Teacher Simulation Button */}
                          <td className="py-3.5 px-4 text-center">
                            {!isDone ? (
                              <button
                                onClick={() => handleSimulateDone(st.email)}
                                className="px-2.5 py-1 rounded-lg bg-[#FAF5EB] hover:bg-[#A4C93B] text-[#221611] font-bold text-[10px] uppercase border border-[#221611] transition-all cursor-pointer"
                                title="Click to test marking this student as DONE in real-time"
                              >
                                Mark Done
                              </button>
                            ) : (
                              <span className="text-emerald-600 text-xs font-black font-mono">
                                ✓ RECORDED
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: REGISTER NEW LAB EXAM SESSION ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#221611]/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#FAF5EB] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-[#221611] p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#221611] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#221611] text-[#A4C93B] rounded-xl">
                  <Plus size={18} />
                </span>
                <h3 className="text-lg font-display font-black text-[#221611] uppercase tracking-tight">
                  Register Practical Lab Exam
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-bold bg-white text-[#221611] border-2 border-[#221611] px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterExam} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black uppercase text-[#221611] mb-1">
                  Select Lab Experiment to Allot:
                </label>
                <select
                  value={newExamLabId}
                  onChange={(e) => {
                    setNewExamLabId(e.target.value)
                    const chosen = ASSIGNABLE_LABS.find(l => l.id === e.target.value)
                    if (chosen) setNewExamTitle(`${chosen.title} Practical Examination`)
                  }}
                  className="w-full bg-white border-2 border-[#221611] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#221611] outline-none"
                >
                  {ASSIGNABLE_LABS.map(lab => (
                    <option key={lab.id} value={lab.id}>
                      [{lab.subject.toUpperCase()}] {lab.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#221611] mb-1">
                  Examination Title / Heading:
                </label>
                <input
                  type="text"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  placeholder="e.g. ECE 302 Mid-Term Practical Exam"
                  className="w-full bg-white border-2 border-[#221611] rounded-xl px-3.5 py-2 text-xs font-bold text-[#221611] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-[#221611] mb-1">
                    Duration (Minutes):
                  </label>
                  <input
                    type="number"
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(e.target.value)}
                    min="15"
                    max="180"
                    className="w-full bg-white border-2 border-[#221611] rounded-xl px-3.5 py-2 text-xs font-bold text-[#221611] outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-[#221611] mb-1">
                    Custom Code (Optional):
                  </label>
                  <input
                    type="text"
                    value={newExamCustomCode}
                    onChange={(e) => setNewExamCustomCode(e.target.value.toUpperCase())}
                    placeholder="Auto (e.g. TDM-8401)"
                    className="w-full bg-white border-2 border-[#221611] rounded-xl px-3.5 py-2 text-xs font-bold text-[#221611] outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#221611]/20 text-[11px] text-[#221611]/70 leading-relaxed font-medium">
                🔒 <strong>Strict Exam Mode Note:</strong> When candidates enter this practical exam with the allotted code, all step-by-step instructions and AI evaluations are automatically concealed. Only the hardware circuit board and measurement probes are active.
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white text-[#221611] border-2 border-[#221611] font-bold py-2.5 rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#A4C93B] hover:bg-[#93b533] text-[#221611] border-2 border-[#221611] font-black py-2.5 rounded-xl text-xs uppercase shadow-[2px_2px_0px_#221611] cursor-pointer"
                >
                  Register & Generate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
