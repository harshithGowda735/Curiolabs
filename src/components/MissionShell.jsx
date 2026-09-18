import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  User,
  GraduationCap,
  Building2
} from 'lucide-react'
import { useTTS } from '../hooks/useTTS'
import { useLanguage } from '../contexts/LanguageContext'
import Breadcrumbs from './Breadcrumbs'
import AIEvaluationModal from './AIEvaluationModal'

/**
 * MissionShell — Standardized 12-Column Laboratory Workstation Layout.
 * Ensures consistent alignment, 12-column grid hierarchy, standardized card spacing, and precision headers.
 */
export default function MissionShell({
  title = 'Experiment',
  titleEmoji = '🔬',
  subject = 'Lab',
  accentColor = 'emerald',
  gradientFrom = 'from-slate-900',
  gradientTo = 'to-slate-800',
  steps = [],
  currentStep = 0,
  controls,
  visualization,
  observations = [],
  onPrint,
  onExport,
  studentInfo = { name: 'Student', class: '11th Grade', school: 'Science Academy' },
  setupStatus = null,
  setupMessage = '',
  children,
}) {
  const navigate = useNavigate()
  const { t, lang, toggleLanguage } = useLanguage()
  const { toggle, isSpeaking } = useTTS()
  const [showObservations, setShowObservations] = useState(true)
  const [showAIEval, setShowAIEval] = useState(false)

  const stepText = steps.map((s, i) => `Step ${i + 1}: ${s.title || ''}. ${s.description || ''}`).join('. ')

  const handlePrint = () => {
    if (onPrint) onPrint()
    else window.print()
  }

  const handleExport = () => {
    if (onExport) onExport()
  }

  const breadcrumbItems = [
    { label: t('Catalog', 'ಕ್ಯಾಟಲಾಗ್'), path: '/level-select' },
    { label: subject, path: '/catalog' },
    { label: title }
  ]

  return (
    <div className="min-h-[100dvh] bg-slate-50/60 text-slate-900 font-sans antialiased flex flex-col justify-between selection:bg-slate-950 selection:text-white">
      <div>
        <Breadcrumbs items={breadcrumbItems} />

        {/* --- STANDARDIZED WORKSTATION HEADER BAR --- */}
        <header className="bg-slate-950 text-white px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Title & Navigation */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white"
                title={t('Go back', 'ಹಿಂದೆ ಹೋಗಿ')}
              >
                <ArrowLeft size={18} />
              </button>

              <div className="h-4 w-px bg-slate-800 hidden sm:block" />

              <h1 className="text-base sm:text-lg font-display font-bold tracking-tight text-white flex items-center gap-2.5">
                <span className="text-xl leading-none">{titleEmoji}</span>
                <span>{title}</span>
                <span className="text-xs font-mono font-normal text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                  {subject}
                </span>
              </h1>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2">
              {/* AI Evaluation Button */}
              <button
                onClick={() => setShowAIEval(true)}
                className="flex items-center gap-1.5 bg-white text-slate-950 hover:bg-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-2xs"
              >
                <Sparkles size={13} className="text-amber-500 fill-amber-400" />
                <span>{t('AI Viva Audit', 'AI ಮೌಲ್ಯಮಾಪನ')}</span>
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-slate-800"
              >
                <span>{lang === 'en' ? 'KN' : 'EN'}</span>
              </button>

              {/* Print Report */}
              <button 
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors border border-slate-700/60"
              >
                <Printer size={13} />
                <span>{t('Print Report', 'ವರದಿ')}</span>
              </button>

              {/* Export CSV */}
              <button 
                onClick={handleExport}
                className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors border border-slate-700/60"
              >
                <Download size={13} />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </header>

        {/* --- STANDARDIZED TELEMETRY & USER METADATA BAR --- */}
        <div className="bg-white border-b border-slate-200/60 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono text-slate-500">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-slate-700">
                <User size={12} className="text-slate-400" />
                <span className="font-semibold text-slate-900">{studentInfo.name}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <GraduationCap size={12} className="text-slate-400" />
                <span>{studentInfo.class}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Building2 size={12} className="text-slate-400" />
                <span>{studentInfo.school}</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Engine Active
              </span>
            </div>
          </div>
        </div>

        {/* --- MAIN WORKSTATION 12-COLUMN GRID SYSTEM --- */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-12 gap-6 items-start">
            
            {/* --- LEFT COLUMN: CONTROLS & INSTRUCTIONS (Span 5 of 12) --- */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
              
              {/* Setup Status Indicator Banner */}
              {setupStatus && (
                <div className={`apple-card rounded-2xl p-4 flex items-start gap-3 ${
                  setupStatus === 'incomplete' 
                    ? 'border-amber-200 bg-amber-50/50 text-amber-900' 
                    : 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                }`}>
                  <div className="mt-0.5 shrink-0">
                    {setupStatus === 'incomplete' ? (
                      <AlertCircle size={18} className="text-amber-600" />
                    ) : (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-display font-bold text-xs uppercase tracking-wider">
                      {t('Setup Status', 'ಸೆಟಪ್ ಸ್ಥಿತಿ')}: {setupStatus === 'incomplete' ? t('INCOMPLETE', 'ಅಪೂರ್ಣ') : t('COMPLETE', 'ಪೂರ್ಣ')}
                    </p>
                    {setupMessage && (
                      <p className="text-xs mt-1 leading-relaxed opacity-90">
                        {setupMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Setup Instructions Standardized Card */}
              {steps.length > 0 && (
                <div className="apple-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h2 className="text-base font-display font-bold text-slate-950 flex items-center gap-2">
                      <ClipboardList size={16} className="text-slate-600" />
                      <span>{t('Lab Instructions', 'ಸೆಟಪ್ ಸೂಚನೆಗಳು')}</span>
                    </h2>

                    <button 
                      onClick={() => toggle(stepText)}
                      className={`p-1.5 rounded-xl transition-colors ${
                        isSpeaking 
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title={isSpeaking ? t('Stop reading', 'ಓದುವುದನ್ನು ನಿಲ್ಲಿಸಿ') : t('Read aloud', 'ಜೋರಾಗಿ ಓದಿ')}
                    >
                      {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                  </div>

                  <ol className="space-y-3">
                    {steps.map((step, i) => {
                      const isActive = i === currentStep
                      const isDone = i < currentStep

                      return (
                        <li 
                          key={i} 
                          className={`flex items-start gap-3 text-xs transition-colors p-2.5 rounded-xl ${
                            isActive 
                              ? 'bg-slate-100 text-slate-950 font-semibold border border-slate-200/80 shadow-2xs' 
                              : isDone 
                                ? 'text-slate-400 line-through' 
                                : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-lg text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                            isActive 
                              ? 'bg-slate-950 text-white' 
                              : isDone 
                                ? 'bg-slate-200 text-slate-500' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">
                            {step.description || step.title}
                          </span>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              )}

              {/* Lab Controls Panel */}
              <div className="w-full">
                {controls}
              </div>
            </div>

            {/* --- RIGHT COLUMN: VISUALIZATION, CHARTS & TELEMETRY (Span 7 of 12) --- */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
              <div className="w-full">
                {visualization}
              </div>
            </div>

            {/* --- FULL-WIDTH CHILDREN OR ADDITIONAL WORKSPACE PANELS --- */}
            {children && (
              <div className="col-span-12">
                {children}
              </div>
            )}

            {/* --- FULL-WIDTH KEY OBSERVATIONS & TAKEAWAY PANEL --- */}
            {observations.length > 0 && (
              <div className="col-span-12">
                <div className="apple-card rounded-2xl p-6 bg-white border border-slate-200/80">
                  <button 
                    onClick={() => setShowObservations(!showObservations)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h2 className="text-base font-display font-bold text-slate-950 flex items-center gap-2">
                      <Lightbulb size={16} className="text-amber-500 fill-amber-400" />
                      <span>{t('Key Learning Observations', 'ಪ್ರಮುಖ ಅವಲೋಕನಗಳು')}</span>
                    </h2>
                    {showObservations ? (
                      <ChevronUp size={18} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </button>

                  {showObservations && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {observations.map((obs, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 mt-1.5 shrink-0" />
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

      {/* AI Viva Evaluation Modal */}
      <AIEvaluationModal
        isOpen={showAIEval}
        onClose={() => setShowAIEval(false)}
        experimentTitle={title}
        domainName={subject}
        studentData={studentInfo}
      />
    </div>
  )
}
