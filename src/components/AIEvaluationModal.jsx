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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#221611]/75 backdrop-blur-md animate-fadeIn">
        <div className="bg-[#FAF5EB] rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border-2 border-[#221611] transform transition-all flex flex-col max-h-[92vh]">
          
          {/* ── TOP HEADER BAR: CURIO LABS DEEP ESPRESSO & ELECTRIC LIME ── */}
          <div className="bg-[#221611] text-[#FAF5EB] px-6 py-5 relative shrink-0 border-b-2 border-[#221611]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A4C93B] text-[#221611] text-xs font-extrabold tracking-wide uppercase shadow-sm">
                  <Sparkles size={13} className="text-[#221611]" />
                  <span>Interactive AI Viva Audit</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-[#FAF5EB]/60 uppercase tracking-wider">
                  {domainName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Auto-TTS Toggle */}
                <button
                  onClick={() => setAutoSpeakQuestion(prev => !prev)}
                  className={`p-2 rounded-xl text-xs transition-all border ${
                    autoSpeakQuestion
                      ? 'bg-[#A4C93B]/20 text-[#A4C93B] border-[#A4C93B]/40'
                      : 'bg-[#332219] text-[#FAF5EB]/50 border-[#FAF5EB]/20 hover:text-white'
                  }`}
                  title={autoSpeakQuestion ? 'Voice questions enabled' : 'Voice questions muted'}
                >
                  {autoSpeakQuestion ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="text-[#FAF5EB]/70 hover:text-[#FAF5EB] p-2 rounded-xl bg-[#332219] hover:bg-[#442c20] border border-[#FAF5EB]/20 transition-all"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <h2 className="text-base sm:text-xl font-black mt-2 text-[#FAF5EB] tracking-tight line-clamp-1 uppercase">
              {experimentTitle}
            </h2>

            {/* Stepper Progress Indicator */}
            {stage === 'viva' && (
              <div className="mt-3 flex items-center justify-between text-xs text-[#FAF5EB]/80 font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#A4C93B]">Question {currentQIndex + 1} of 4</span>
                  <span className="text-[#FAF5EB]/40">•</span>
                  <span className="text-[#FAF5EB]/80 font-bold">Oral Viva Voce</span>
                </div>
                {/* 4-segment progress bar */}
                <div className="flex gap-1.5 w-32">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full flex-1 transition-all border border-[#221611] ${
                        idx < currentQIndex
                          ? 'bg-[#A4C93B]'
                          : idx === currentQIndex
                          ? 'bg-[#A4C93B] animate-pulse ring-2 ring-[#A4C93B]/40'
                          : 'bg-[#332219]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── MODAL BODY CONTAINER ── */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col justify-between space-y-4">
            
            {/* ════════ STAGE 1: VIVA QUESTION & VOICE ANSWER ════════ */}
            {stage === 'viva' && (
              <div className="flex flex-col flex-1 justify-between gap-4">
                
                {/* Question Card with Spoken Visualizer */}
                <div className="bg-white border-2 border-[#221611] rounded-2xl p-5 shadow-[3px_3px_0px_#221611]">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-[#A4C93B] bg-[#221611] px-3 py-1 rounded-lg border border-[#221611]">
                      Examiner Question #{currentQIndex + 1}
                    </span>

                    {/* Audio Controls */}
                    <button
                      onClick={handleRepeatQuestion}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-[#221611] transition-all ${
                        isSpeaking
                          ? 'bg-[#A4C93B] text-[#221611] animate-pulse shadow-sm'
                          : 'bg-[#FAF5EB] text-[#221611] hover:bg-[#A4C93B]/30'
                      }`}
                      title="Listen to question"
                    >
                      <Volume2 size={14} className={isSpeaking ? 'text-[#221611]' : 'text-[#221611]'} />
                      <span>{isSpeaking ? 'Speaking...' : 'Repeat Audio'}</span>
                    </button>
                  </div>

                  <p className="text-base sm:text-lg font-extrabold text-[#221611] leading-snug">
                    {activeQuestion.question}
                  </p>

                  {/* Sound Wave Animation if Speaking */}
                  {isSpeaking && (
                    <div className="mt-3.5 flex items-center gap-1.5 bg-[#FAF5EB] p-2.5 rounded-xl border border-[#221611]/20">
                      <span className="w-1.5 h-3 bg-[#A4C93B] rounded-full animate-bounce" />
                      <span className="w-1.5 h-5 bg-[#221611] rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1.5 h-4 bg-[#A4C93B] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-6 bg-[#221611] rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-3 bg-[#A4C93B] rounded-full animate-bounce [animation-delay:0.25s]" />
                      <span className="text-xs text-[#221611] font-mono font-bold ml-2">AI Examiner speaking aloud...</span>
                    </div>
                  )}
                </div>

                {/* ── Real-Time Voice Recording & Transcription Area ── */}
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  
                  {/* Large Voice Microphone Action Card */}
                  <div className="text-center py-2">
                    <button
                      onClick={handleToggleListening}
                      className={`relative group mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all border-4 shadow-xl ${
                        isListening
                          ? 'bg-rose-600 text-white border-rose-300 ring-8 ring-rose-200 scale-105 animate-pulse'
                          : 'bg-[#221611] hover:bg-[#A4C93B] text-[#A4C93B] hover:text-[#221611] border-[#221611] hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff size={32} />
                          <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500" />
                          </span>
                        </>
                      ) : (
                        <Mic size={32} />
                      )}
                    </button>

                    <div className="mt-3">
                      <p className={`text-sm font-black uppercase tracking-wide ${isListening ? 'text-rose-600 animate-pulse' : 'text-[#221611]'}`}>
                        {isListening ? 'Listening to your voice... Speak now!' : 'Tap Microphone to Answer Aloud'}
                      </p>
                      <p className="text-xs text-[#221611]/70 font-medium mt-0.5">
                        {isListening ? 'Tap mic again when finished speaking' : 'State your scientific understanding clearly'}
                      </p>
                    </div>
                  </div>

                  {/* Live Transcribed Speech Output / Manual Text Box */}
                  <div className="relative bg-white border-2 border-[#221611] rounded-2xl p-4 focus-within:ring-4 focus-within:ring-[#A4C93B]/30 transition-all shadow-[2px_2px_0px_#221611]">
                    <div className="flex items-center justify-between mb-2 text-xs font-mono font-bold text-[#221611]">
                      <span className="flex items-center gap-1.5">
                        <Edit3 size={13} className="text-[#221611]" />
                        <span>Your Spoken Response (Live Transcribed):</span>
                      </span>
                      {typedInput && (
                        <button
                          onClick={() => {
                            resetTranscript()
                            setTypedInput('')
                          }}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold uppercase underline"
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
                      className="w-full bg-transparent text-sm text-[#221611] font-medium focus:outline-hidden resize-none leading-relaxed placeholder:text-[#221611]/40"
                    />

                    {sttError && (
                      <p className="text-xs text-amber-700 mt-2 flex items-center gap-1.5 font-bold">
                        <AlertCircle size={14} />
                        <span>{sttError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit / Next Button */}
                <div className="pt-3 border-t-2 border-[#221611]/15 flex items-center justify-between gap-3">
                  <div className="text-xs font-mono font-bold text-[#221611]/70">
                    {typedInput.trim().split(/\s+/).filter(Boolean).length} words recorded
                  </div>

                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!typedInput.trim()}
                    className={`font-black px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all border-2 border-[#221611] flex items-center gap-2 ${
                      typedInput.trim()
                        ? 'bg-[#A4C93B] hover:bg-[#93b533] text-[#221611] shadow-[3px_3px_0px_#221611] hover:shadow-[1px_1px_0px_#221611] hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer'
                        : 'bg-[#FAF5EB] text-[#221611]/40 border-[#221611]/25 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>{currentQIndex === questions.length - 1 ? 'Submit Viva for AI Rating' : 'Confirm & Next Question'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ════════ STAGE 2: EVALUATING TELEMETRY & RUBRIC ════════ */}
            {stage === 'evaluating' && (
              <div className="py-14 text-center space-y-4 my-auto">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-20 h-20 border-4 border-[#221611]/20 border-t-[#A4C93B] rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-[#221611] font-display font-extrabold text-sm">
                    AI
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-black text-[#221611] text-lg uppercase tracking-tight">
                    Evaluating Laboratory Viva Telemetry
                  </h3>
                  <p className="text-xs text-[#221611]/70 font-medium max-w-sm mx-auto mt-1 leading-relaxed">
                    Analyzing spoken answers against mathematical models, operational thresholds, and technical vocabulary...
                  </p>
                </div>
              </div>
            )}

            {/* ════════ STAGE 3: RESULT & SCORE BREAKDOWN ════════ */}
            {stage === 'result' && evaluationResult && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Score Summary Header Card */}
                <div className="p-6 rounded-2xl text-center border-2 border-[#221611] bg-white shadow-[3px_3px_0px_#221611]">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#221611] text-[#A4C93B] font-extrabold font-mono text-xs mb-3">
                    <span>Grade Awarded: {evaluationResult.letterGrade}</span>
                    <span>•</span>
                    <span>{evaluationResult.verdict}</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 my-1">
                    <span className="text-5xl sm:text-6xl font-black text-[#221611] tracking-tight">
                      {evaluationResult.totalScore}
                    </span>
                    <span className="text-xl text-[#221611]/60 font-mono font-bold">/ 100</span>
                  </div>

                  <p className="text-xs font-medium text-[#221611]/80 max-w-md mx-auto leading-relaxed mt-2">
                    {evaluationResult.spokenSummary}
                  </p>
                </div>

                {/* Question-by-Question Rubric Score Breakdown */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {evaluationResult.perQuestionDetails.map((detail, idx) => (
                    <div
                      key={detail.questionId}
                      className="p-4 rounded-2xl border-2 border-[#221611] bg-white text-xs space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#221611]">Q{idx + 1}. {detail.question}</span>
                        <span className="font-mono text-[#221611] bg-[#A4C93B] border border-[#221611] px-2.5 py-0.5 rounded-lg text-xs font-black">
                          {detail.score} / 25 pts
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FAF5EB] border border-[#221611]/20 text-[#221611] text-xs leading-relaxed font-medium">
                        <span className="font-extrabold text-[#221611] block mb-1">Your Spoken Answer:</span>
                        {detail.studentAnswer || <span className="italic text-[#221611]/40">No response recorded</span>}
                      </div>

                      <div className="text-xs text-[#221611] flex items-start gap-1.5 pt-1">
                        <span className="font-extrabold text-[#221611] shrink-0">AI Rubric Feedback:</span>
                        <span className="text-[#221611]/80 font-medium">{detail.feedback}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t-2 border-[#221611]/15 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => setShowCert(true)}
                    className="flex-1 bg-[#A4C93B] hover:bg-[#93b533] text-[#221611] font-black py-3 px-5 rounded-2xl text-xs sm:text-sm border-2 border-[#221611] shadow-[3px_3px_0px_#221611] hover:shadow-[1px_1px_0px_#221611] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Award size={18} />
                    <span>Claim Certificate of Viva Completion</span>
                  </button>

                  <button
                    onClick={handleRetake}
                    className="bg-[#FAF5EB] hover:bg-white text-[#221611] font-extrabold py-3 px-5 rounded-2xl text-xs border-2 border-[#221611] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={15} />
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
