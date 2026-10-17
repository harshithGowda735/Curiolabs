/**
 * CurioLabs Live Practical Exam Management Service
 * Supports:
 * - Registering lab practical exam sessions with custom test codes
 * - Inviting students via email or direct code sharing
 * - Real-time cross-tab synchronization via BroadcastChannel & localStorage
 * - Student practical exam output submission and teacher live telemetry
 */

const EXAM_STORAGE_KEY = 'curiolabs_active_exams'
const EXAM_ROSTER_KEY = 'curiolabs_exam_rosters'

// Available practical lab experiments that teachers can assign
export const ASSIGNABLE_LABS = [
  {
    id: 'tdm',
    title: 'Time Division Multiplexing & Demux (IC 4051)',
    subject: 'Electronics',
    route: '/electronics/tdm',
    codePrefix: 'TDM',
    apparatus: 'Dual CD4051BE ICs, DSO Oscilloscope, Function Generators'
  },
  {
    id: 'pam',
    title: 'Pulse Amplitude Modulation & Detection',
    subject: 'Electronics',
    route: '/electronics/pam',
    codePrefix: 'PAM',
    apparatus: 'FET Analog Switch CD4016, Pulse Generator, Butterworth LPF'
  },
  {
    id: 'am_detection',
    title: 'Amplitude Modulation & Diode Detection',
    subject: 'Electronics',
    route: '/electronics/am-detection',
    codePrefix: 'AMD',
    apparatus: '1N4148 Fast Diode, RC Integrator, RF Function Generator'
  },
  {
    id: 'ohms_law',
    title: "Ohm's Law & Circuit Characteristics",
    subject: 'Physics',
    route: '/physics/ohms-law',
    codePrefix: 'OHM',
    apparatus: 'DC Regulated Power Supply, Resistors, Precision Ammeter'
  },
  {
    id: 'diode_clipping',
    title: 'Diode Clipping & Clamping Circuits',
    subject: 'Physics',
    route: '/physics/clipping-clamping',
    codePrefix: 'DIO',
    apparatus: 'PN Junction Diode, Resistor, DC Bias Supply, Oscilloscope'
  },
  {
    id: 'titration',
    title: 'Acid-Base Neutralization Titration',
    subject: 'Chemistry',
    route: '/chemistry/titration',
    codePrefix: 'TIT',
    apparatus: '50mL Burette, Conical Flask, 0.1M HCl & NaOH, pH Probe'
  },
  {
    id: 'photosynthesis',
    title: 'Photosynthesis Oxygen Evolution',
    subject: 'Biology',
    route: '/biology/photosynthesis',
    codePrefix: 'BIO',
    apparatus: 'Water Bath, Hydrilla Plant, Inverted Funnel, Photometer'
  },
  {
    id: 'vernier',
    title: 'Precision Metrology using Vernier Caliper',
    subject: 'Physics',
    route: '/physics/vernier-caliper',
    codePrefix: 'VER',
    apparatus: 'Metric Vernier Caliper (0.02mm LC), Steel Sphere, Copper Pipe, Hex Fastener'
  }
]

// Default initial exam sessions for instant interactive testing
const DEFAULT_EXAMS = [
  {
    code: 'TDM-4051',
    title: 'ECE 302 Practical Exam: Dual-IC TDM Bilateral Multiplexing',
    labId: 'tdm',
    labTitle: 'Time Division Multiplexing & Demux (IC 4051)',
    labRoute: '/electronics/tdm',
    subject: 'Electronics',
    durationMinutes: 45,
    createdAt: new Date().toLocaleDateString(),
    teacherName: 'Prof. R. K. Sharma (ECE)'
  },
  {
    code: 'PAM-8800',
    title: 'ECE 204: Pulse Amplitude Modulation Test',
    labId: 'pam',
    labTitle: 'Pulse Amplitude Modulation & Detection',
    labRoute: '/electronics/pam',
    subject: 'Electronics',
    durationMinutes: 30,
    createdAt: new Date().toLocaleDateString(),
    teacherName: 'Dr. Anita Desai'
  }
]

// Default student rosters for live display
const DEFAULT_ROSTERS = {
  'TDM-4051': [
    {
      id: 'st-1',
      studentName: 'Harshith Gowda',
      email: 'harshith.student@curiolabs.edu',
      rollNo: '1RV21EC045',
      status: 'In Progress', // 'Pending' | 'In Progress' | 'Completed'
      outputVerified: false,
      score: 0,
      startedAt: 'Just now',
      completedAt: null,
      outputDetails: 'Circuit energized, probes active'
    },
    {
      id: 'st-2',
      studentName: 'Aditi Sharma',
      email: 'aditi.sharma@curiolabs.edu',
      rollNo: '1RV21EC012',
      status: 'Completed',
      outputVerified: true,
      score: 100,
      startedAt: '15 mins ago',
      completedAt: '2 mins ago',
      outputDetails: 'Verified 2kHz PAM Interleaved Waveform on DSO'
    },
    {
      id: 'st-3',
      studentName: 'Rahul Verma',
      email: 'rahul.verma@curiolabs.edu',
      rollNo: '1RV21EC089',
      status: 'Pending',
      outputVerified: false,
      score: 0,
      startedAt: 'Not started',
      completedAt: null,
      outputDetails: 'Awaiting student login'
    }
  ]
}

// Broadcast channel for multi-tab live sync
let examBroadcastChannel = null
try {
  if (typeof window !== 'undefined' && window.BroadcastChannel) {
    examBroadcastChannel = new BroadcastChannel('curiolabs_exam_channel')
  }
} catch (e) {
  console.warn('BroadcastChannel not supported:', e)
}

/**
 * Get all registered practical exams
 */
export function getRegisteredExams() {
  try {
    const saved = localStorage.getItem(EXAM_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error(e)
  }
  // Initialize defaults
  try {
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(DEFAULT_EXAMS))
  } catch (e) {}
  return DEFAULT_EXAMS
}

/**
 * Register a new practical exam session
 */
export function registerNewExam({ title, labId, durationMinutes = 45, customCode = '', invitedEmails = [] }) {
  const lab = ASSIGNABLE_LABS.find(l => l.id === labId) || ASSIGNABLE_LABS[0]
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const code = (customCode.trim() || `${lab.codePrefix}-${randomSuffix}`).toUpperCase()

  const newExam = {
    code,
    title: title || `${lab.title} Practical Examination`,
    labId: lab.id,
    labTitle: lab.title,
    labRoute: lab.route,
    subject: lab.subject,
    durationMinutes: Number(durationMinutes) || 45,
    createdAt: new Date().toLocaleDateString(),
    teacherName: 'Faculty Examiner'
  }

  const existing = getRegisteredExams()
  const updatedExams = [newExam, ...existing.filter(e => e.code !== code)]
  try {
    localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(updatedExams))
  } catch (e) {}

  // Initialize student roster for this exam
  const rosters = getAllRosters()
  const initialStudents = invitedEmails.filter(Boolean).map((email, idx) => ({
    id: `inv-${Date.now()}-${idx}`,
    studentName: email.split('@')[0].replace(/[._-]/g, ' '),
    email: email.trim(),
    rollNo: `INV-${100 + idx}`,
    status: 'Pending',
    outputVerified: false,
    score: 0,
    startedAt: 'Invited via email',
    completedAt: null,
    outputDetails: 'Pending student attendance'
  }))

  rosters[code] = initialStudents
  try {
    localStorage.setItem(EXAM_ROSTER_KEY, JSON.stringify(rosters))
  } catch (e) {}

  // Broadcast update
  notifyExamSync({ type: 'NEW_EXAM', exam: newExam })
  return newExam
}

/**
 * Find exam by test code (case-insensitive)
 */
export function getExamByCode(code) {
  if (!code) return null
  const clean = code.trim().toUpperCase()
  const exams = getRegisteredExams()
  return exams.find(e => e.code.toUpperCase() === clean) || null
}

/**
 * Get all rosters from localStorage
 */
function getAllRosters() {
  try {
    const saved = localStorage.getItem(EXAM_ROSTER_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  try {
    localStorage.setItem(EXAM_ROSTER_KEY, JSON.stringify(DEFAULT_ROSTERS))
  } catch (e) {}
  return DEFAULT_ROSTERS
}

/**
 * Get student roster for a specific exam code
 */
export function getExamRoster(examCode) {
  if (!examCode) return []
  const clean = examCode.trim().toUpperCase()
  const rosters = getAllRosters()
  return rosters[clean] || []
}

/**
 * Invite students to an existing exam
 */
export function inviteStudentsToExam(examCode, emails = []) {
  if (!examCode || emails.length === 0) return
  const clean = examCode.trim().toUpperCase()
  const rosters = getAllRosters()
  const currentStudents = rosters[clean] || []

  const newStudents = emails.filter(Boolean).map((email, idx) => ({
    id: `inv-${Date.now()}-${idx}`,
    studentName: email.split('@')[0].replace(/[._-]/g, ' ').toUpperCase(),
    email: email.trim(),
    rollNo: `ROLL-${Math.floor(100 + Math.random() * 900)}`,
    status: 'Pending',
    outputVerified: false,
    score: 0,
    startedAt: 'Invited by teacher',
    completedAt: null,
    outputDetails: 'Invitation sent'
  }))

  rosters[clean] = [...currentStudents, ...newStudents]
  try {
    localStorage.setItem(EXAM_ROSTER_KEY, JSON.stringify(rosters))
  } catch (e) {}

  notifyExamSync({ type: 'ROSTER_UPDATE', examCode: clean })
  return rosters[clean]
}

/**
 * Register student entrance into exam session
 */
export function recordStudentExamStart(examCode, studentName, studentEmail) {
  if (!examCode) return
  const clean = examCode.trim().toUpperCase()
  const rosters = getAllRosters()
  const currentList = rosters[clean] || []

  const existingIdx = currentList.findIndex(
    s => (studentEmail && s.email === studentEmail) || (studentName && s.studentName.toLowerCase() === studentName.toLowerCase())
  )

  if (existingIdx >= 0) {
    if (currentList[existingIdx].status === 'Pending') {
      currentList[existingIdx].status = 'In Progress'
      currentList[existingIdx].startedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  } else {
    // Add student on the fly
    currentList.push({
      id: `st-${Date.now()}`,
      studentName: studentName || 'Candidate Student',
      email: studentEmail || 'student@curiolabs.edu',
      rollNo: `EXAM-${Math.floor(100 + Math.random() * 900)}`,
      status: 'In Progress',
      outputVerified: false,
      score: 0,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completedAt: null,
      outputDetails: 'Active on laboratory testbench'
    })
  }

  rosters[clean] = currentList
  try {
    localStorage.setItem(EXAM_ROSTER_KEY, JSON.stringify(rosters))
  } catch (e) {}

  notifyExamSync({ type: 'STUDENT_START', examCode: clean })
}

/**
 * Submit student practical exam output (Turns student status GREEN DONE in teacher view)
 */
export function submitStudentExamOutput(examCode, studentIdentifier, outputSummary = 'Verified Circuit Output') {
  if (!examCode) return false
  const clean = examCode.trim().toUpperCase()
  const rosters = getAllRosters()
  const currentList = rosters[clean] || []

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  let found = false
  const updatedList = currentList.map(st => {
    const matches = (studentIdentifier && (st.email === studentIdentifier || st.studentName.toLowerCase() === studentIdentifier.toLowerCase())) ||
      currentList.length === 1

    if (matches || !found) {
      found = true
      return {
        ...st,
        status: 'Completed',
        outputVerified: true,
        score: 100,
        completedAt: nowTime,
        outputDetails: outputSummary
      }
    }
    return st
  })

  // If student was not in roster, append them as completed
  if (!found) {
    updatedList.unshift({
      id: `st-${Date.now()}`,
      studentName: studentIdentifier || 'Exam Candidate',
      email: studentIdentifier?.includes('@') ? studentIdentifier : 'candidate@curiolabs.edu',
      rollNo: 'EXAM-VERIFIED',
      status: 'Completed',
      outputVerified: true,
      score: 100,
      startedAt: 'Prior',
      completedAt: nowTime,
      outputDetails: outputSummary
    })
  }

  rosters[clean] = updatedList
  try {
    localStorage.setItem(EXAM_ROSTER_KEY, JSON.stringify(rosters))
  } catch (e) {}

  notifyExamSync({ type: 'OUTPUT_DONE', examCode: clean, student: studentIdentifier })
  return true
}

/**
 * Broadcast event across tabs & windows
 */
function notifyExamSync(payload) {
  try {
    if (examBroadcastChannel) {
      examBroadcastChannel.postMessage(payload)
    }
    // Also trigger window event for same-tab updates
    window.dispatchEvent(new CustomEvent('curiolabs_exam_update', { detail: payload }))
  } catch (e) {
    console.warn('Sync notification note:', e)
  }
}

/**
 * Subscribe to live exam and roster changes
 */
export function subscribeToExamSync(callback) {
  const handler = (e) => {
    if (callback) callback(e?.data || e?.detail)
  }

  if (examBroadcastChannel) {
    examBroadcastChannel.addEventListener('message', handler)
  }
  window.addEventListener('curiolabs_exam_update', handler)
  window.addEventListener('storage', (e) => {
    if (e.key === EXAM_ROSTER_KEY || e.key === EXAM_STORAGE_KEY) {
      if (callback) callback({ type: 'STORAGE_CHANGE' })
    }
  })

  return () => {
    if (examBroadcastChannel) {
      examBroadcastChannel.removeEventListener('message', handler)
    }
    window.removeEventListener('curiolabs_exam_update', handler)
  }
}
