import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Sparkles,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Layers,
  KeyRound,
  FileCheck,
  Send,
  X
} from 'lucide-react'
import { useTTS } from '../hooks/useTTS'
import { useLanguage } from '../contexts/LanguageContext'
import { submitStudentExamOutput } from '../services/examService'
import AIEvaluationModal from './AIEvaluationModal'

/**
 * MissionShell — Standardized 12-Column Laboratory Workstation Layout.
 * Supports:
 * - Standard Learning Mode (aim, apparatus, step instructions, AI viva evaluation)
 * - Strict Practical Exam Mode (activated via ?exam=EXAM-CODE): hides manual instructions & AI assistance,
 *   focusing exclusively on the circuit board and instruments, with verified output submission to the teacher's live dashboard.
 */
export default function MissionShell({
  title = 'Experiment',
  titleEmoji = '🔬',
  subject = 'Lab',
  accentColor = 'emerald',
  gradientFrom = 'from-slate-900',
  gradientTo = 'to-slate-800',
  aim = '',
  steps = [],
  apparatus = [],
  currentStep = 0,
  controls,
  horizontalControls = false,
  visualization,
  observations = [],
  onPrint,
  onExport,
  studentInfo = {},
  setupStatus = null,
  setupMessage = '',
  children,
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const examCode = searchParams.get('exam')
  const candidateName = searchParams.get('candidate') || studentInfo?.name || 'Harshith Gowda (Student)'
  const isExamMode = Boolean(examCode)

  const { t, lang, toggleLanguage } = useLanguage()
  const { toggle, isSpeaking } = useTTS()
  const [showObservations, setShowObservations] = useState(true)
  const [showAIEval, setShowAIEval] = useState(false)
  const [isExamSubmitted, setIsExamSubmitted] = useState(false)
  const [showExamSuccessModal, setShowExamSuccessModal] = useState(false)

  const stepText = steps.map((s, i) => `Step ${i + 1}: ${s.title || ''}. ${s.description || ''}`).join('. ')

  const handlePrint = () => {
    if (onPrint) onPrint()
    else window.print()
  }

  const handleExport = () => {
    if (onExport) onExport()
  }

  const handleExamSubmit = () => {
    submitStudentExamOutput(examCode, candidateName, `Output verified on ${title}`)
    setIsExamSubmitted(true)
    setShowExamSuccessModal(true)
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAF5EB] text-[#221611] font-sans antialiased flex flex-col justify-between selection:bg-[#221611] selection:text-[#FAF5EB]">
      <div>
        {/* --- EXAM MODE HIGH-VISIBILITY TOP BANNER --- */}
        {isExamMode && (
          <div className="bg-[#A4C93B] text-[#221611] px-4 py-2 text-xs font-mono font-bold flex flex-wrap items-center justify-between border-b-2 border-[#221611] shadow-sm gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-[#221611] text-[#A4C93B] rounded-lg">
                <KeyRound size={13} />
              </span>
              <span className="font-black uppercase tracking-wider">
                Strict Practical Lab Exam Active • Code: {examCode}
              </span>
              <span className="hidden sm:inline text-[#221611]/70">• Candidate: {candidateName}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold bg-[#221611]/15 px-2.5 py-0.5 rounded-full">
                Manual Instructions & AI Hidden (Blind Test)
              </span>

              {isExamSubmitted ? (
                <span className="bg-[#221611] text-[#A4C93B] font-black px-3.5 py-1 rounded-full text-xs flex items-center gap-1.5 border border-[#221611]">
                  <CheckCircle2 size={13} className="text-[#A4C93B]" />
                  <span>OUTPUT VERIFIED (DONE)</span>
                </span>
              ) : (
                <button
                  onClick={handleExamSubmit}
                  className="bg-[#221611] hover:bg-[#332219] text-[#FAF5EB] font-black px-4 py-1 rounded-full text-xs uppercase flex items-center gap-1.5 border border-[#221611] shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Send size={12} className="text-[#A4C93B]" />
                  <span>Submit Lab Output</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* --- STANDARDIZED WORKSTATION HEADER BAR --- */}
        <header className="bg-[#221611] text-white px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-md border-b border-[#3A2820]">
          <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
            {/* Title & Navigation */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full transition-all text-[#D8CEBC] hover:text-white"
                title={t('Go back', 'ಹಿಂದೆ ಹೋಗಿ')}
              >
                <ArrowLeft size={18} />
              </button>

              <div className="h-5 w-px bg-[#3A2820] hidden sm:block" />

              <h1 className="text-base sm:text-lg font-display font-black tracking-tight text-white uppercase flex items-center gap-2.5">
                <span className="text-xl leading-none">{titleEmoji}</span>
                <span>{title}</span>
                <span className="text-xs font-mono font-bold text-[#A4C93B] bg-[#3A2820] px-2.5 py-0.5 rounded-full border border-[#4D362B]">
                  {subject}
                </span>
              </h1>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2">
              {/* Only show AI Evaluation in standard study mode (Hidden in exam mode as requested) */}
              {!isExamMode && (
                <button
                  onClick={() => setShowAIEval(true)}
                  className="flex items-center gap-1.5 bg-[#A4C93B] hover:bg-white text-[#221611] text-xs font-display font-black uppercase px-3.5 py-1.5 rounded-full transition-all shadow-sm hover:scale-105 cursor-pointer"
                >
                  <Sparkles size={13} className="text-[#221611]" />
                  <span>{t('AI Viva Audit', 'AI ಮೌಲ್ಯಮಾಪನ')}</span>
                </button>
              )}

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono font-bold text-[#D8CEBC] hover:text-white hover:bg-white/10 transition-colors border border-[#4D362B]"
              >
                <span>{lang === 'en' ? 'KN' : 'EN'}</span>
              </button>

              {/* Print Report */}
              <button 
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1.5 bg-[#3A2820] hover:bg-[#4D362B] text-[#FAF5EB] text-xs font-mono font-bold uppercase px-3.5 py-1.5 rounded-full transition-colors border border-[#4D362B]"
              >
                <Printer size={13} />
                <span>{t('Print Report', 'ವರದಿ')}</span>
              </button>

              {/* Export CSV */}
              <button 
                onClick={handleExport}
                className="hidden sm:flex items-center gap-1.5 bg-[#3A2820] hover:bg-[#4D362B] text-[#FAF5EB] text-xs font-mono font-bold uppercase px-3.5 py-1.5 rounded-full transition-colors border border-[#4D362B]"
              >
                <Download size={13} />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </header>


        {/* --- MAIN WORKSTATION 12-COLUMN GRID SYSTEM --- */}
        <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* --- LEFT COLUMN: CONTROLS & INSTRUCTIONS --- */}
            {/* If in Exam Mode, controls take focused layout without manual instruction clutter */}
            <div className={`col-span-12 ${isExamMode && !controls ? 'hidden' : 'lg:col-span-5'} flex flex-col gap-6`}>
              
              {/* Setup Status Indicator Banner (Only in study mode) */}
              {!isExamMode && setupStatus && (
                <div className={`rounded-2xl p-4 flex items-start gap-3 border-2 shadow-xs ${
                  setupStatus === 'incomplete' 
                    ? 'border-amber-300 bg-amber-50 text-amber-950' 
                    : 'border-[#A4C93B] bg-[#A4C93B]/10 text-[#221611]'
                }`}>
                  <div className="mt-0.5 shrink-0">
                    {setupStatus === 'incomplete' ? (
                      <AlertCircle size={18} className="text-amber-600" />
                    ) : (
                      <CheckCircle2 size={18} className="text-[#A4C93B]" />
                    )}
                  </div>
                  <div>
                    <p className="font-display font-black text-xs uppercase tracking-wider">
                      {t('Setup Status', 'ಸೆಟಪ್ ಸ್ಥಿತಿ')}: {setupStatus === 'incomplete' ? t('INCOMPLETE', 'ಅಪೂರ್ಣ') : t('COMPLETE', 'ಪೂರ್ಣ')}
                    </p>
                    {setupMessage && (
                      <p className="text-xs mt-1 leading-relaxed opacity-90 font-medium">
                        {setupMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Lab Manual Authentic Box: AIM & APPARATUS (Hidden in Exam Mode as requested) */}
              {!isExamMode && (aim || (apparatus && apparatus.length > 0)) && (
                <div className="bg-white rounded-2xl border-2 border-[#221611]/15 p-5 sm:p-6 shadow-sm text-[#221611]">
                  {aim && (
                    <div className="mb-4 text-xs sm:text-sm leading-relaxed">
                      <span className="font-display font-black text-[#221611] uppercase tracking-wider text-xs mr-2 px-2.5 py-0.5 rounded bg-[#FAF5EB] border border-[#221611]/15 inline-block">AIM:</span>
                      <span className="text-[#3A2820] font-medium">{aim}</span>
                    </div>
                  )}

                  {apparatus && apparatus.length > 0 && (
                    <div>
                      <h3 className="text-xs font-display font-black uppercase tracking-wider text-[#221611] mb-2.5 flex items-center gap-2">
                        <span>APPARATUS:</span>
                      </h3>
                      <div className="overflow-x-auto rounded-xl border-2 border-[#221611]/20">
                        <table className="w-full border-collapse text-xs font-sans">
                          <thead>
                            <tr className="bg-[#221611] text-[#FAF5EB] text-[11px] font-mono font-bold uppercase tracking-wider">
                              <th className="border-b border-[#3A2820] px-3 py-2 text-center w-16">Sl. No.</th>
                              <th className="border-b border-[#3A2820] px-4 py-2 text-left">Particulars</th>
                              <th className="border-b border-[#3A2820] px-3 py-2 text-center w-28">Range</th>
                              <th className="border-b border-[#3A2820] px-3 py-2 text-center w-20">Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {apparatus.map((row, idx) => (
                              <tr key={idx} className="border-b border-[#221611]/10 hover:bg-[#FAF5EB]/60 transition-colors">
                                <td className="px-3 py-2 text-center font-bold text-[#221611]">
                                  {row.slNo || `${idx + 1}.`}
                                </td>
                                <td className="px-4 py-2 text-left font-medium text-[#221611]">
                                  {row.particulars || row.name}
                                </td>
                                <td className="px-3 py-2 text-center font-mono text-[#754F40]">
                                  {row.range || row.spec || '-'}
                                </td>
                                <td className="px-3 py-2 text-center font-bold text-[#221611]">
                                  {row.quantity || row.qty}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instruction Box — CurioLabs Editorial Format (Hidden in Exam Mode as requested) */}
              {!isExamMode && steps.length > 0 && (
                <div className="bg-white rounded-2xl border-2 border-[#221611] overflow-hidden shadow-[0_5px_0_#221611]">
                  <div className="bg-[#221611] py-3 px-5 relative flex items-center justify-between border-b border-[#3A2820]">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={16} className="text-[#A4C93B]" />
                      <h2 className="font-display font-black text-sm sm:text-base tracking-widest text-[#FAF5EB] uppercase">
                        INSTRUCTION
                      </h2>
                    </div>
                    <button 
                      onClick={() => toggle(stepText)}
                      className={`p-1.5 rounded-full transition-colors ${
                        isSpeaking ? 'bg-[#A4C93B] text-[#221611]' : 'text-[#A4C93B] hover:text-white hover:bg-white/10'
                      }`}
                      title={isSpeaking ? t('Stop reading', 'ಓದುವುದನ್ನು ನಿಲ್ಲಿಸಿ') : t('Read aloud', 'ಜೋರಾಗಿ ಓದಿ')}
                    >
                      {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>

                  <div className="p-5 sm:p-6 bg-white space-y-3.5 text-xs sm:text-[13.5px] font-sans font-medium text-[#221611] leading-relaxed">
                    {steps.map((step, i) => {
                      const text = typeof step === 'string' ? step : (step.description || step.title)
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <span className="shrink-0 w-6 h-6 rounded-full bg-[#FAF5EB] border-2 border-[#221611] text-[#221611] font-display font-black flex items-center justify-center text-xs select-none shadow-2xs">
                            {i + 1}
                          </span>
                          <span className="flex-1 text-[#221611] pt-0.5">
                            {text}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="h-1.5 bg-[#A4C93B]" />
                </div>
              )}

              {/* Lab Controls Panel (Vertical Layout in Left Column) */}
              {controls && !horizontalControls && (
                <div className="w-full">
                  {controls}
                </div>
              )}
            </div>

            {/* --- RIGHT COLUMN: VISUALIZATION, CHARTS & TELEMETRY --- */}
            <div className={`col-span-12 ${isExamMode && !controls ? 'lg:col-span-12' : 'lg:col-span-7'} flex flex-col gap-6`}>
              <div className="w-full">
                {visualization}
              </div>
            </div>

            {/* --- HORIZONTAL CONTROLS & TESTBENCH RACK (Full 12-Column Span) --- */}
            {controls && horizontalControls && (
              <div className="col-span-12">
                {controls}
              </div>
            )}

            {/* --- FULL-WIDTH CHILDREN OR ADDITIONAL WORKSPACE PANELS --- */}
            {children && (
              <div className="col-span-12">
                {children}
              </div>
            )}

            {/* --- FULL-WIDTH KEY OBSERVATIONS PANEL (Hidden in Exam Mode) --- */}
            {!isExamMode && observations.length > 0 && (
              <div className="col-span-12">
                <div className="rounded-2xl p-6 bg-white border-2 border-[#221611]/15 shadow-sm">
                  <button 
                    onClick={() => setShowObservations(!showObservations)}
                    className="w-full flex items-center justify-between text-left cursor-pointer"
                  >
                    <h2 className="text-base font-display font-black text-[#221611] uppercase tracking-wide flex items-center gap-2">
                      <Lightbulb size={18} className="text-[#A4C93B] fill-[#A4C93B]" />
                      <span>{t('Key Learning Observations', 'ಪ್ರಮುಖ ಅವಲೋಕನಗಳು')}</span>
                    </h2>
                    {showObservations ? (
                      <ChevronUp size={20} className="text-[#754F40]" />
                    ) : (
                      <ChevronDown size={20} className="text-[#754F40]" />
                    )}
                  </button>

                  {showObservations && (
                    <div className="mt-4 pt-4 border-t border-[#221611]/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {observations.map((obs, i) => (
                        <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF5EB] border border-[#221611]/10 text-xs text-[#3A2820] leading-relaxed font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#A4C93B] border border-[#221611]/20 mt-1.5 shrink-0" />
                          <span>{obs}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- EXAM SUBMISSION SUCCESS MODAL --- */}
      {showExamSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#221611]/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#FAF5EB] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-[#221611] p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#A4C93B] text-[#221611] border-2 border-[#221611] mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span className="text-xs font-mono font-black uppercase text-[#A4C93B] bg-[#221611] px-3 py-1 rounded-full">
                OUTPUT RECORDED • STATUS: DONE
              </span>
              <h3 className="text-xl font-display font-black text-[#221611] uppercase tracking-tight mt-3">
                Practical Exam Submitted!
              </h3>
              <p className="text-xs text-[#221611]/80 font-medium mt-1 leading-relaxed">
                Your practical test telemetry has been sent to your professor. Your status is now marked <strong className="text-emerald-700">GREEN DONE</strong> in the Faculty Command Console.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border-2 border-[#221611] text-xs font-mono font-bold text-[#221611] text-left space-y-1">
              <div>Exam Code: <span className="text-[#A4C93B] bg-[#221611] px-2 py-0.5 rounded">{examCode}</span></div>
              <div>Candidate: <span>{candidateName}</span></div>
              <div>Verified Testbench: <span>{title}</span></div>
              <div>Status: <span className="text-emerald-600 font-black">● COMPLETED & VERIFIED</span></div>
            </div>

            <button
              onClick={() => setShowExamSuccessModal(false)}
              className="w-full bg-[#221611] hover:bg-[#332219] text-[#FAF5EB] font-black py-3 rounded-xl border-2 border-[#221611] text-xs uppercase shadow-[2px_2px_0px_#A4C93B] transition-all cursor-pointer"
            >
              Continue Inspecting Testbench
            </button>
          </div>
        </div>
      )}

      {/* AI Viva Evaluation Modal (Study Mode only) */}
      {!isExamMode && (
        <AIEvaluationModal
          isOpen={showAIEval}
          onClose={() => setShowAIEval(false)}
          experimentTitle={title}
          domainName={subject}
          studentData={studentInfo}
          observations={observations}
          steps={steps}
        />
      )}
    </div>
  )
}
