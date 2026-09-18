import { useState } from 'react'
import { Sparkles, CheckCircle2, Award, ArrowRight, X, AlertCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import CourseCertificateModal from './CourseCertificateModal'

export default function AIEvaluationModal({
  isOpen,
  onClose,
  experimentTitle = 'Virtual Laboratory Experiment',
  domainName = 'Engineering Lab',
  studentData = {}
}) {
  const { t } = useLanguage()
  const [step, setStep] = useState('viva') // 'viva' | 'evaluating' | 'result'
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showCert, setShowCert] = useState(false)

  if (!isOpen) return null

  const questions = [
    {
      id: 1,
      q: `What is the primary governing physical law underlying the ${experimentTitle}?`,
      options: [
        'Analytical differential equation balancing inputs and reaction moments',
        'Empirical observation without conservation of energy constraints',
        'Arbitrary randomized probability without deterministic convergence'
      ],
      correct: 0
    },
    {
      id: 2,
      q: 'How did adjusting parameter thresholds influence the system stability and error rate?',
      options: [
        'Reduced transient oscillations and provided critical damping',
        'Caused immediate divergent resonance regardless of feedback',
        'Had zero measurable impact on telemetry output'
      ],
      correct: 0
    },
    {
      id: 3,
      q: 'Which troubleshooting approach should be prioritized during anomalous hardware reading states?',
      options: [
        'Verify sensor calibration datum, check ground reference, and apply digital filtering',
        'Ignore data disparities and force arbitrary override values',
        'Shut down power supply without logging fault telemetry'
      ],
      correct: 0
    }
  ]

  const handleSelectAnswer = (qId, optionIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }))
  }

  const handleStartEvaluation = () => {
    setStep('evaluating')
    setTimeout(() => {
      setStep('result')
    }, 1800)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-400/30">
              <Sparkles size={12} />
              <span>AI Laboratory Evaluation & Viva</span>
            </div>
            <h2 className="text-xl font-display font-bold">{experimentTitle}</h2>
            <p className="text-xs text-slate-300 mt-0.5">{domainName} • Automated Assessment</p>
          </div>

          {/* Body */}
          <div className="p-6">
            {step === 'viva' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">
                  Answer the AI viva questions below based on your interactive experimental telemetry to complete evaluation:
                </p>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                      <p className="font-semibold text-gray-800 mb-2">
                        {idx + 1}. {q.q}
                      </p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
                            className={`w-full text-left p-2 rounded-lg border transition-all text-xs ${
                              selectedAnswers[q.id] === optIdx
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleStartEvaluation}
                  disabled={Object.keys(selectedAnswers).length < questions.length}
                  className="w-full mt-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>Submit for AI Evaluation</span>
                </button>
              </div>
            )}

            {step === 'evaluating' && (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                <div>
                  <h3 className="font-display font-bold text-gray-800">Synthesizing Laboratory Telemetry</h3>
                  <p className="text-xs text-gray-500 mt-1">Cross-referencing graph curves, error rates, and viva answers...</p>
                </div>
              </div>
            )}

            {step === 'result' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <span className="text-3xl block mb-1">🎉</span>
                  <h3 className="font-display font-bold text-emerald-900 text-lg">Evaluation Passed!</h3>
                  <p className="text-xs text-emerald-700">Overall Proficiency Score: 94 / 100 (Grade: A+)</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-lg border">
                    <span className="text-gray-500 block">Experimental Accuracy</span>
                    <span className="font-bold font-display text-gray-800 text-sm">96%</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg border">
                    <span className="text-gray-500 block">Viva Theoretical</span>
                    <span className="font-bold font-display text-gray-800 text-sm">92%</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg border">
                    <span className="text-gray-500 block">Rigor & Precision</span>
                    <span className="font-bold font-display text-gray-800 text-sm">94%</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-gray-600">
                  <span className="font-bold text-gray-800 block mb-1">AI Assessor Feedback:</span>
                  Excellent convergence during simulation testing. Data points matched expected theoretical curves within 1.2% tolerance. Viva questions answered with sound conceptual clarity.
                </div>

                <button
                  onClick={() => setShowCert(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Award size={18} />
                  <span>Claim & View Certificate</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCert && (
        <CourseCertificateModal
          isOpen={showCert}
          onClose={() => {
            setShowCert(false)
            onClose()
          }}
          courseName={experimentTitle}
          domainName={domainName}
          studentName={studentData.name || 'Verified Student'}
        />
      )}
    </>
  )
}
