import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer, Download, Volume2, VolumeX, ChevronDown, ChevronUp, Lightbulb, Sparkles } from 'lucide-react'
import { useTTS } from '../hooks/useTTS'
import { useLanguage } from '../contexts/LanguageContext'
import Breadcrumbs from './Breadcrumbs'
import AIEvaluationModal from './AIEvaluationModal'

/**
 * MissionShell — reusable layout for every lab experiment.
 * Matches the screenshot UI: gradient header, two-column body, step instructions, data panel.
 * 
 * Props:
 * - title: string (experiment name)
 * - titleEmoji: string (emoji for header)
 * - subject: string (e.g. "Physics", "Chemistry")
 * - accentColor: string (tailwind color like "emerald", "violet")
 * - gradientFrom/gradientTo: tailwind gradient colors
 * - steps: array of { title, description }
 * - currentStep: number
 * - controls: ReactNode (left panel content — sliders, buttons, apparatus)
 * - visualization: ReactNode (right panel content — charts, data tables)
 * - observations: array of strings (key takeaways)
 * - onPrint: function
 * - onExport: function
 * - studentInfo: { name, class, school }
 * - setupStatus: 'incomplete' | 'complete' | null
 * - setupMessage: string
 */
export default function MissionShell({
  title = 'Experiment',
  titleEmoji = '🔬',
  subject = 'Lab',
  accentColor = 'emerald',
  gradientFrom = 'from-teal-500',
  gradientTo = 'to-blue-600',
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

  const stepText = steps.map((s, i) => `Step ${i + 1}: ${s.title}. ${s.description}`).join('. ')

  const handlePrint = () => {
    if (onPrint) onPrint()
    else window.print()
  }

  const handleExport = () => {
    if (onExport) onExport()
  }

  const breadcrumbItems = [
    { label: 'Catalog', path: '/level-select' },
    { label: subject, path: '/catalog' },
    { label: title }
  ]

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      {/* Gradient Header Bar */}
      <header className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white px-4 py-3 safe-top shadow-xs relative z-20`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title={t('Go back', 'ಹಿಂದೆ ಹೋಗಿ')}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg md:text-xl font-display font-bold flex items-center gap-2">
              <span>{title}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* AI Evaluation Button */}
            <button
              onClick={() => setShowAIEval(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
            >
              <Sparkles size={14} className="text-slate-950" />
              <span>{t('AI Evaluation', 'AI ಮೌಲ್ಯಮಾಪನ')}</span>
            </button>
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1">
              <span className="text-xs font-medium">{t('Language', 'ಭಾಷೆ')}</span>
              <select 
                value={lang} 
                onChange={toggleLanguage}
                className="bg-white text-gray-800 text-sm rounded px-2 py-0.5 font-medium cursor-pointer"
              >
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ</option>
              </select>
            </div>
            {/* Print Button */}
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">{t('Print Report', 'ವರದಿ ಮುದ್ರಿಸಿ')}</span>
            </button>
            {/* Export CSV */}
            <button 
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download size={14} />
              <span className="hidden sm:inline">{t('Export CSV', 'CSV ರಫ್ತು')}</span>
            </button>
          </div>
        </div>
      </header>
      <Breadcrumbs items={breadcrumbItems} />

      {/* Student Info Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{t('Student', 'ವಿದ್ಯಾರ್ಥಿ')}:</span> {studentInfo.name} 
            <span className="mx-2">|</span>
            <span className="font-semibold text-gray-800">{t('Class', 'ತರಗತಿ')}:</span> {studentInfo.class}
            <span className="mx-2">|</span>
            <span className="font-semibold text-gray-800">{t('School', 'ಶಾಲೆ')}:</span> {studentInfo.school}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* LEFT COLUMN — Instructions & Controls */}
          <div className="space-y-4">
            {/* Setup Status Banner */}
            {setupStatus && (
              <div className={`rounded-xl px-4 py-3 flex items-start gap-2 ${
                setupStatus === 'incomplete' 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <span className="text-lg mt-0.5">
                  {setupStatus === 'incomplete' ? '⚠️' : '✅'}
                </span>
                <div>
                  <p className={`font-semibold text-sm ${
                    setupStatus === 'incomplete' ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {t('Setup Status', 'ಸೆಟಪ್ ಸ್ಥಿತಿ')}: {setupStatus === 'incomplete' 
                      ? t('INCOMPLETE', 'ಅಪೂರ್ಣ') 
                      : t('COMPLETE', 'ಪೂರ್ಣ')} 
                    {setupStatus === 'incomplete' ? ' ❌' : ' ✅'}
                  </p>
                  {setupMessage && (
                    <p className={`text-xs mt-0.5 ${
                      setupStatus === 'incomplete' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {setupMessage}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Setup Instructions Card */}
            {steps.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-display font-bold text-gray-800 flex items-center gap-2">
                    <span>📋</span>
                    {t('Setup Instructions', 'ಸೆಟಪ್ ಸೂಚನೆಗಳು')}
                  </h2>
                  <button 
                    onClick={() => toggle(stepText)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isSpeaking 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                    title={isSpeaking ? t('Stop reading', 'ಓದುವುದನ್ನು ನಿಲ್ಲಿಸಿ') : t('Read aloud', 'ಜೋರಾಗಿ ಓದಿ')}
                  >
                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                </div>
                <ol className="space-y-2">
                  {steps.map((step, i) => (
                    <li 
                      key={i} 
                      className={`flex items-start gap-2 text-sm transition-colors ${
                        i === currentStep ? 'text-gray-900 font-medium' : 
                        i < currentStep ? 'text-gray-400 line-through' : 'text-gray-600'
                      }`}
                    >
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                        i === currentStep ? `bg-${accentColor}-100 text-${accentColor}-700` :
                        i < currentStep ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {i + 1}
                      </span>
                      <span>
                        {step.description}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Controls Panel — lab-specific content */}
            {controls}
          </div>

          {/* RIGHT COLUMN — Visualization & Data */}
          <div className="space-y-4">
            {visualization}
          </div>
        </div>

        {/* Additional children content */}
        {children}

        {/* Key Observations / Learning Takeaway */}
        {observations.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-fuchsia-50 rounded-xl border border-purple-100 p-4 md:p-5">
              <button 
                onClick={() => setShowObservations(!showObservations)}
                className="w-full flex items-center justify-between"
              >
                <h2 className="text-lg font-display font-bold text-purple-800 flex items-center gap-2">
                  <span>📝</span>
                  {t('Key Observations', 'ಪ್ರಮುಖ ಅವಲೋಕನಗಳು')}
                </h2>
                {showObservations ? <ChevronUp size={20} className="text-purple-600" /> : <ChevronDown size={20} className="text-purple-600" />}
              </button>
              {showObservations && (
                <ul className="mt-3 space-y-2">
                  {observations.map((obs, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-purple-700">
                      <Lightbulb size={14} className="mt-0.5 shrink-0 text-purple-500" />
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>

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
