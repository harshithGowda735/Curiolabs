import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  X,
  HelpCircle,
  Send,
  Edit3,
  Check,
  ChevronRight
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTTS } from '../hooks/useTTS'
import { useSTT } from '../hooks/useSTT'
import { useAuth } from '../contexts/AuthContext'
import { getVivaQuestions, evaluateVivaSession } from '../utils/vivaQuestions'
import { saveLabRecord } from '../services/labService'
import CourseCertificateModal from './CourseCertificateModal'

export default function AIEvaluationModal({
  isOpen,
  onClose,
  experimentTitle = 'Virtual Laboratory Experiment',
  domainName = 'Engineering Lab',
  studentData = {},
  observations = [],
  steps = []
}) {
  const { t } = useLanguage()
  const { user, profile } = useAuth()
  const { speak, stop: stopTTS, isSpeaking } = useTTS()
  const {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript,
    isSupported: isSTTSupported,
    error: sttError,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  } = useSTT()

  // Stages: 'intro' | 'viva' | 'evaluating' | 'result'
  const [stage, setStage] = useState('viva')
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [evaluationResult, setEvaluationResult] = useState(null)
  const [showCert, setShowCert] = useState(false)
  const [autoSpeakQuestion, setAutoSpeakQuestion] = useState(true)
  const [isManualEditing, setIsManualEditing] = useState(false)
  const [typedInput, setTypedInput] = useState('')

  // Load 4 curated or dynamically synthesized questions
  const questions = useMemo(() => {
    return getVivaQuestions(experimentTitle, domainName, observations, steps)
  }, [experimentTitle, domainName, observations, steps])

  const activeQuestion = questions[currentQIndex] || questions[0]

  // Synchronize speech-to-text transcript with manual text area input
  useEffect(() => {
    if (fullTranscript) {
      setTypedInput(fullTranscript)
    }
  }, [fullTranscript])

  // Automatically speak question aloud when switching questions
  useEffect(() => {
    if (isOpen && stage === 'viva' && activeQuestion && autoSpeakQuestion) {
      const qSpeech = `Question ${currentQIndex + 1} of 4: ${activeQuestion.question}`
      const timer = setTimeout(() => {
        speak(qSpeech)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen, stage, currentQIndex, activeQuestion, autoSpeakQuestion, speak])

  // Stop all audio on modal close
  useEffect(() => {
    if (!isOpen) {
      stopTTS()
      stopListening()
      resetTranscript()
      setTypedInput('')
      setCurrentQIndex(0)
      setAnswers({})
      setStage('viva')
      setEvaluationResult(null)
    }
  }, [isOpen, stopTTS, stopListening, resetTranscript])

  if (!isOpen) return null

  // ── Voice & Audio Handlers ──
  const handleToggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      stopTTS() // stop speech synthesis before listening
      startListening()
    }
  }

  const handleRepeatQuestion = () => {
    if (activeQuestion) {
      stopListening()
      speak(`Question ${currentQIndex + 1}: ${activeQuestion.question}`)
    }
  }

  // ── Submit Current Answer and advance to Next ──
  const handleSubmitAnswer = () => {
    stopListening()
    stopTTS()

    const finalAns = (typedInput || fullTranscript || '').trim()
    const updatedAnswers = {
      ...answers,
      [activeQuestion.id]: finalAns
    }
    setAnswers(updatedAnswers)

    // Reset voice input states
    resetTranscript()
    setTypedInput('')
    setIsManualEditing(false)

    if (currentQIndex < questions.length - 1) {
      // Move to next question
      setCurrentQIndex(prev => prev + 1)
    } else {
      // All 4 questions completed -> Evaluate
      triggerEvaluation(updatedAnswers)
    }
  }

  // ── Trigger Rubric Evaluation ──
  const triggerEvaluation = (finalAnswers) => {
    setStage('evaluating')
    stopTTS()
    stopListening()

    setTimeout(async () => {
      const result = evaluateVivaSession(questions, finalAnswers)
      setEvaluationResult(result)
      setStage('result')

      // Speak verdict summary aloud
      if (autoSpeakQuestion) {
        speak(result.spokenSummary)
      }

      // Save lab record to Firestore if user authenticated
      if (user?.uid) {
        try {
          await saveLabRecord({
            studentId: user.uid,
            experimentId: experimentTitle,
            score: result.totalScore,
            vivaMarks: result.totalScore,
            completionStatus: 'completed'
          })
        } catch (err) {
          console.warn('Could not save lab record to Firebase:', err)
        }
      }
    }, 1800)
  }

  const handleRetake = () => {
    stopTTS()
    stopListening()
    resetTranscript()
    setTypedInput('')
    setAnswers({})
    setCurrentQIndex(0)
    setEvaluationResult(null)
    setStage('viva')
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 transform transition-all flex flex-col max-h-[92vh]">
          
          {/* ── TOP HEADER BAR ── */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-5 py-4 relative shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Interactive AI Viva Audit</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {domainName}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Auto-TTS Toggle */}
                <button
                  onClick={() => setAutoSpeakQuestion(prev => !prev)}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    autoSpeakQuestion ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400 hover:text-white'
                  }`}
                  title={autoSpeakQuestion ? 'Voice questions enabled' : 'Voice questions muted'}
                >
                  {autoSpeakQuestion ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-display font-bold mt-1 text-white tracking-tight line-clamp-1">
              {experimentTitle}
            </h2>

            {/* Stepper Progress Indicator (Active in Viva stage) */}
            {stage === 'viva' && (
              <div className="mt-3 flex items-center justify-between text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">Question {currentQIndex + 1} of 4</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-indigo-300">Oral Viva Voce</span>
                </div>
                {/* 4-segment progress bar */}
                <div className="flex gap-1.5 w-28">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full flex-1 transition-all ${
                        idx < currentQIndex
                          ? 'bg-emerald-400'
                          : idx === currentQIndex
                          ? 'bg-indigo-400 animate-pulse'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── MODAL BODY CONTAINER ── */}
          <div className="p-5 overflow-y-auto flex-1 flex flex-col justify-between">
            
            {/* ════════ STAGE 1: VIVA QUESTION & VOICE ANSWER ════════ */}
            {stage === 'viva' && (
              <div className="flex flex-col flex-1 justify-between gap-4">
                
                {/* Question Card with Spoken Visualizer */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                      Examiner Question #{currentQIndex + 1}
                    </span>

                    {/* Audio Controls */}
                    <button
                      onClick={handleRepeatQuestion}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                        isSpeaking
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                      title="Listen to question"
                    >
                      <Volume2 size={13} className={isSpeaking ? 'text-amber-600' : 'text-slate-500'} />
                      <span>{isSpeaking ? 'Speaking...' : 'Repeat Audio'}</span>
                    </button>
                  </div>

                  <p className="text-sm sm:text-base font-medium text-slate-900 leading-snug">
                    {activeQuestion.question}
                  </p>

                  {/* Sound Wave Animation if Speaking */}
                  {isSpeaking && (
                    <div className="mt-3 flex items-center gap-1">
                      <span className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce" />
                      <span className="w-1 h-5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1 h-4 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-6 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.25s]" />
                      <span className="text-[11px] text-indigo-600 font-mono ml-2">AI Examiner speaking...</span>
                    </div>
                  )}
                </div>

                {/* ── Real-Time Voice Recording & Transcription Area ── */}
                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  
                  {/* Large Voice Microphone Action Card */}
                  <div className="text-center py-2">
                    <button
                      onClick={handleToggleListening}
                      className={`relative group mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        isListening
                          ? 'bg-rose-600 text-white ring-4 ring-rose-300 scale-105 animate-pulse'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95 shadow-indigo-500/25'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff size={28} />
                          <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500" />
                          </span>
                        </>
                      ) : (
                        <Mic size={28} />
                      )}
                    </button>

                    <div className="mt-2.5">
                      <p className={`text-xs font-bold ${isListening ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
                        {isListening ? 'Listening to your voice... Speak now!' : 'Tap Microphone to Answer Aloud'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isListening ? 'Tap mic again when finished speaking' : 'State your scientific understanding clearly'}
                      </p>
                    </div>
                  </div>

                  {/* Live Transcribed Speech Output / Manual Text Box */}
                  <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-3.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Edit3 size={11} />
                        <span>Your Spoken Response (Live Transcribed):</span>
                      </span>
                      {typedInput && (
                        <button
                          onClick={() => {
                            resetTranscript()
                            setTypedInput('')
                          }}
                          className="text-rose-500 hover:text-rose-700 text-[10px] font-semibold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={3}
                      value={typedInput}
                      onChange={(e) => setTypedInput(e.target.value)}
                      placeholder={
                        isListening
                          ? 'Transcribing your voice in real-time...'
                          : 'Speak through your microphone or type your answer here...'
                      }
                      className="w-full bg-transparent text-xs sm:text-sm text-slate-800 focus:outline-hidden resize-none leading-relaxed"
                    />

                    {sttError && (
                      <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} />
                        <span>{sttError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit / Next Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-400">
                    {typedInput.trim().split(/\s+/).filter(Boolean).length} words recorded
                  </div>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!typedInput.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>{currentQIndex === questions.length - 1 ? 'Submit Viva for AI Rating' : 'Confirm & Next Question'}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ════════ STAGE 2: EVALUATING TELEMETRY & RUBRIC ════════ */}
            {stage === 'evaluating' && (
              <div className="py-14 text-center space-y-4 my-auto">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-display font-bold text-xs">
                    AI
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base">
                    Evaluating Laboratory Viva Telemetry
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    Analyzing spoken answers against mathematical models, operational thresholds, and technical vocabulary...
                  </p>
                </div>
              </div>
            )}

            {/* ════════ STAGE 3: RESULT & SCORE BREAKDOWN ════════ */}
            {stage === 'result' && evaluationResult && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Score Summary Header Card */}
                <div className={`p-5 rounded-2xl text-center border transition-all ${
                  evaluationResult.totalScore >= 80
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : evaluationResult.totalScore >= 65
                    ? 'bg-blue-50 border-blue-200 text-blue-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 font-bold font-mono text-xs mb-2 shadow-2xs">
                    <span>Grade Awarded: {evaluationResult.letterGrade}</span>
                    <span>•</span>
                    <span>{evaluationResult.verdict}</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 my-1">
                    <span className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight">
                      {evaluationResult.totalScore}
                    </span>
                    <span className="text-lg text-slate-500 font-mono">/ 100</span>
                  </div>

                  <p className="text-xs max-w-md mx-auto leading-relaxed mt-1 opacity-90">
                    {evaluationResult.spokenSummary}
                  </p>
                </div>

                {/* Question-by-Question Rubric Score Breakdown */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {evaluationResult.perQuestionDetails.map((detail, idx) => (
                    <div
                      key={detail.questionId}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-900">Q{idx + 1}. {detail.question}</span>
                        <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md text-[11px]">
                          {detail.score} / 25 pts
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-slate-100 text-slate-700 text-[11px] leading-relaxed">
                        <span className="font-bold text-slate-900 block mb-0.5">Your Spoken Answer:</span>
                        {detail.studentAnswer || <span className="italic text-slate-400">No response recorded</span>}
                      </div>

                      <div className="text-[11px] text-slate-600 flex items-start gap-1.5 pt-1">
                        <span className="font-bold text-indigo-600 shrink-0">AI Rubric Feedback:</span>
                        <span>{detail.feedback}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setShowCert(true)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Award size={16} />
                    <span>Claim Certificate of Viva Completion</span>
                  </button>

                  <button
                    onClick={handleRetake}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>Retake Viva</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── COURSE CERTIFICATE MODAL ── */}
      {showCert && (
        <CourseCertificateModal
          isOpen={showCert}
          onClose={() => {
            setShowCert(false)
            onClose()
          }}
          courseName={experimentTitle}
          domainName={domainName}
          studentName={profile?.name || user?.displayName || studentData?.name || 'Verified Student'}
        />
      )}
    </>
  )
}
