import { useState } from 'react'
import { 
  Users, Award, BarChart3, Search, Plus, Radio, CheckCircle, 
  FileText, Download, Eye, Sparkles, Filter, ChevronRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import CourseCertificateModal from '../components/CourseCertificateModal'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { DOMAIN_REGISTRY } from '../data/domainRegistry'

const initialStudents = [
  { id: 1, name: 'Aditi Sharma', class: 'ECE-301 (Engg)', lab: '2-DOF Robotic Arm (IK)', progress: 95, score: 96, status: 'Active In Lab', lastActive: '2 min ago' },
  { id: 2, name: 'Rahul Kumar', class: 'PUC-12A', lab: 'Acid-Base Titration', progress: 80, score: 88, status: 'Active In Lab', lastActive: '5 min ago' },
  { id: 3, name: 'Priya Deshpande', class: 'ECE-301 (Engg)', lab: 'RC Filter Tuning (+AR)', progress: 100, score: 98, status: 'Submitted', lastActive: '12 min ago' },
  { id: 4, name: 'Arun Hegde', class: 'CSE-402 (Engg)', lab: 'DDoS Attack Mitigation', progress: 45, score: 72, status: 'Needs Guidance', lastActive: '15 min ago' },
  { id: 5, name: 'Kavya Reddy', class: 'PUC-11B', lab: "Ohm's Law & Resistance", progress: 100, score: 94, status: 'Submitted', lastActive: '1 hour ago' },
]

export default function TeacherDashboard() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('monitor') // 'monitor' | 'create' | 'assign' | 'evaluate' | 'reports'
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showCert, setShowCert] = useState(false)
  const [students, setStudents] = useState(initialStudents)

  // Lab creator form state
  const [newLab, setNewLab] = useState({
    title: '',
    domain: 'robotics',
    level: 'engineering',
    instructions: '',
    minTolerance: '2.5%'
  })
  const [createdLabs, setCreatedLabs] = useState([
    { title: 'Custom RC Filter Bandwidth Test', domain: 'Electronics', assignedTo: 'ECE-301', due: 'Sep 25, 2026' },
    { title: 'Acid-Base Indicator Calibration', domain: 'Chemistry', assignedTo: 'PUC-12A', due: 'Sep 28, 2026' }
  ])

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase()) ||
    s.lab.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateLab = (e) => {
    e.preventDefault()
    if (!newLab.title) return
    setCreatedLabs(prev => [
      { title: newLab.title, domain: newLab.domain, assignedTo: 'Pending Assignment', due: 'Oct 02, 2026' },
      ...prev
    ])
    setNewLab({ title: '', domain: 'robotics', level: 'engineering', instructions: '', minTolerance: '2.5%' })
    setActiveTab('assign')
  }

  const handleExportAccreditation = () => {
    alert('Generating NAAC / ABET Outcome Assessment Report (PDF)...')
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar />
        <Breadcrumbs items={[{ label: 'Faculty Console' }, { label: 'Command Dashboard' }]} />

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-8 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-400/30">
                <Sparkles size={12} />
                <span>Faculty Virtual Engineering Hub</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                {t('Faculty Command Console', 'ಶಿಕ್ಷಕರ ಕಮಾಂಡ್ ಕನ್ಸೋಲ್')}
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Monitor live student simulation telemetry, configure custom lab rubrics & audit AI evaluations.
              </p>
            </div>

            {/* Top Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('create')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus size={15} />
                <span>Create Lab</span>
              </button>
              <button
                onClick={handleExportAccreditation}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all border border-white/10 flex items-center gap-1.5"
              >
                <Download size={15} />
                <span>ABET / NAAC Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Navigation Tabs (Apple Style Segmented Control) */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl mb-6 overflow-x-auto">
            {[
              { id: 'monitor', label: 'Live Student Monitor', icon: Radio },
              { id: 'create', label: 'Create New Lab', icon: Plus },
              { id: 'assign', label: 'Assign Experiments', icon: FileText },
              { id: 'evaluate', label: 'AI Evaluation Audit', icon: CheckCircle },
              { id: 'reports', label: 'Accreditation Reports', icon: BarChart3 },
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                    isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-indigo-600' : ''} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* TAB 1: LIVE MONITOR */}
          {activeTab === 'monitor' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active Students in Lab', val: '24', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Completed Today', val: '38', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Average AI Viva Score', val: '89.4%', icon: Award, color: 'text-indigo-600 bg-indigo-50' },
                  { label: 'Flagged for Assistance', val: '2', icon: Radio, color: 'text-amber-600 bg-amber-50' },
                ].map((st, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 font-medium">{st.label}</span>
                      <div className={`p-2 rounded-lg ${st.color}`}>
                        <st.icon size={14} />
                      </div>
                    </div>
                    <p className="text-2xl font-display font-bold text-slate-900">{st.val}</p>
                  </div>
                ))}
              </div>

              {/* Live Session Roster */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <h3 className="font-display font-bold text-slate-900 text-sm">
                    Active Student Telemetry Stream ({filtered.length})
                  </h3>
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student, class, lab..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Class / Cohort</th>
                        <th className="py-3 px-4">Experiment</th>
                        <th className="py-3 px-4">Progress</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(st => (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">{st.name}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{st.class}</td>
                          <td className="py-3 px-4 text-slate-800 font-medium">{st.lab}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${st.progress}%` }} />
                              </div>
                              <span className="font-mono text-[10px] text-slate-500">{st.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.status === 'Submitted' ? 'bg-emerald-100 text-emerald-800' :
                              st.status === 'Active In Lab' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {st.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                setSelectedStudent(st)
                                setShowCert(true)
                              }}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50 flex items-center gap-1"
                            >
                              <Eye size={13} />
                              <span>Audit</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE LAB WIZARD */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 text-lg mb-1">
                Virtual Laboratory Authoring Wizard
              </h3>
              <p className="text-slate-500 text-xs mb-6">
                Configure experiment parameters, tolerance bounds, and customized apparatus checklists for your course syllabus.
              </p>

              <form onSubmit={handleCreateLab} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Experiment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Higher-Order Butterworth Filter Tuning"
                    value={newLab.title}
                    onChange={e => setNewLab({ ...newLab, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Academic Tier</label>
                    <select
                      value={newLab.level}
                      onChange={e => setNewLab({ ...newLab, level: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="engineering">Undergraduate Engineering</option>
                      <option value="puc">PUC Foundation (+2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Engineering Domain</label>
                    <select
                      value={newLab.domain}
                      onChange={e => setNewLab({ ...newLab, domain: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {DOMAIN_REGISTRY.map(d => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pass / Error Tolerance Threshold</label>
                  <input
                    type="text"
                    value={newLab.minTolerance}
                    onChange={e => setNewLab({ ...newLab, minTolerance: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
                >
                  Publish Lab to Department Registry
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ASSIGN EXPERIMENTS */}
          {activeTab === 'assign' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="font-display font-bold text-slate-900 text-sm mb-4">
                  Active Department Lab Assignments
                </h3>
                <div className="space-y-3">
                  {createdLabs.map((lab, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{lab.title}</span>
                        <span className="text-slate-500">{lab.domain} • Assigned Cohort: <span className="font-mono text-indigo-600 font-semibold">{lab.assignedTo}</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">Due: {lab.due}</span>
                        <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-colors">
                          Modify Rubric
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI EVALUATION AUDIT */}
          {activeTab === 'evaluate' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-slate-900 text-sm">
                AI Evaluation Auditing & Grade Overrides
              </h3>
              <p className="text-xs text-slate-500">
                Review automated student viva scores, accuracy curves, and telemetry logs before final institutional credential issuance.
              </p>
              <div className="space-y-2 text-xs">
                {students.map(st => (
                  <div key={st.id} className="p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block">{st.name} ({st.class})</span>
                      <span className="text-slate-500">{st.lab}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-600 text-sm font-display">Score: {st.score}/100</span>
                      <button
                        onClick={() => {
                          setSelectedStudent(st)
                          setShowCert(true)
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                      >
                        Review Viva Telemetry
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ACCREDITATION REPORTS */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm max-w-2xl mx-auto space-y-5 text-xs">
              <h3 className="font-display font-bold text-slate-900 text-base">
                ABET & NAAC Accreditation Compliance Reports
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Automated generation of Course Outcomes (CO) and Program Outcomes (PO) attainment matrices directly from virtual lab student telemetry.
              </p>
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex justify-between font-semibold text-indigo-950">
                  <span>CO1: Application of Engineering Physics Fundamentals</span>
                  <span>94.2% Attainment</span>
                </div>
                <div className="flex justify-between font-semibold text-indigo-950">
                  <span>CO2: Modern Tool Usage (WebAR Circuitry & Simulators)</span>
                  <span>91.8% Attainment</span>
                </div>
                <div className="flex justify-between font-semibold text-indigo-950">
                  <span>CO3: Conduct Experiments & Synthesize Valid Conclusions</span>
                  <span>88.5% Attainment</span>
                </div>
              </div>
              <button
                onClick={handleExportAccreditation}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Download size={15} />
                <span>Export Accreditation Data (CSV + Signed PDF)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showCert && selectedStudent && (
        <CourseCertificateModal
          isOpen={showCert}
          onClose={() => setShowCert(false)}
          courseName={selectedStudent.lab}
          domainName={selectedStudent.class}
          studentName={selectedStudent.name}
        />
      )}

      <Footer />
    </div>
  )
}
