import { useState, useEffect, useRef } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Set Length', description: 'Adjust the pendulum length using the slider' },
  { title: 'Set Angle', description: 'Pull the pendulum to an initial angle' },
  { title: 'Release', description: 'Click Start to release the pendulum and begin oscillation' },
  { title: 'Measure', description: 'Observe the period and compare with T = 2π√(L/g)' },
]

const observations = [
  'Period T = 2π√(L/g) for small angles — independent of mass and amplitude',
  'Longer pendulums have longer periods',
  'At large angles, the small-angle approximation breaks down',
  'g = 4π²L/T² — this experiment can measure gravitational acceleration',
]

export default function Pendulum() {
  const { t } = useLanguage()
  const [length, setLength] = useState(1.0)
  const [initAngle, setInitAngle] = useState(30)
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [angle, setAngle] = useState(30)
  const animRef = useRef(null)
  const startTimeRef = useRef(0)

  const g = 9.81
  const period = 2 * Math.PI * Math.sqrt(length / g)
  const omega = Math.sqrt(g / length)

  useEffect(() => {
    if (!running) return
    startTimeRef.current = performance.now()
    const animate = (now) => {
      const elapsed = (now - startTimeRef.current) / 1000
      setTime(elapsed)
      const theta = initAngle * Math.cos(omega * elapsed) * Math.exp(-0.01 * elapsed)
      setAngle(theta)
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [running, omega, initAngle])

  const toggleRun = () => {
    if (running) {
      setRunning(false)
      cancelAnimationFrame(animRef.current)
    } else {
      setAngle(initAngle)
      setTime(0)
      setRunning(true)
    }
  }

  const pivotX = 200, pivotY = 30
  const scale = 150
  const bobX = pivotX + scale * length * Math.sin((angle * Math.PI) / 180)
  const bobY = pivotY + scale * length * Math.cos((angle * Math.PI) / 180)

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🔄 {t('Pendulum Setup', 'ಪೆಂಡುಲಮ್ ಸೆಟಪ್')}</h3>
        <LabeledSlider label={t('Length (m)', 'ಉದ್ದ (m)')} value={length} onChange={(v) => { setLength(v); if (!running) setAngle(initAngle) }} min={0.2} max={2.0} step={0.1} unit="m" accentColor="#3b82f6" disabled={running} />
        <div className="mt-3">
          <LabeledSlider label={t('Initial Angle (°)', 'ಆರಂಭಿಕ ಕೋನ (°)')} value={initAngle} onChange={(v) => { setInitAngle(v); if (!running) setAngle(v) }} min={5} max={60} step={1} unit="°" accentColor="#f59e0b" disabled={running} />
        </div>
        <button onClick={toggleRun} className={`w-full mt-4 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${running ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/20'}`}>
          {running ? `⏹ ${t('Stop', 'ನಿಲ್ಲಿಸಿ')}` : `▶ ${t('Start Experiment', 'ಪ್ರಯೋಗ ಪ್ರಾರಂಭಿಸಿ')}`}
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📊 {t('Measurements', 'ಅಳತೆಗಳು')}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">{t('Period (T)', 'ಅವಧಿ (T)')}</p>
            <p className="text-xl font-bold text-blue-700">{period.toFixed(3)}<span className="text-xs">s</span></p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-amber-600 font-medium">{t('Time', 'ಸಮಯ')}</p>
            <p className="text-xl font-bold text-amber-700">{time.toFixed(1)}<span className="text-xs">s</span></p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600 font-medium">{t('Angle', 'ಕೋನ')}</p>
            <p className="text-xl font-bold text-green-700">{angle.toFixed(1)}<span className="text-xs">°</span></p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-purple-600 font-medium">{t('Frequency', 'ಆವರ್ತನ')}</p>
            <p className="text-xl font-bold text-purple-700">{(1 / period).toFixed(2)}<span className="text-xs">Hz</span></p>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Pendulum Animation', 'ಪೆಂಡುಲಮ್ ಅನಿಮೇಶನ್')}</h3>
      <svg viewBox="0 0 400 300" className="w-full h-auto bg-gradient-to-b from-sky-50 to-white rounded-lg">
        {/* Pivot */}
        <rect x={pivotX - 30} y={pivotY - 5} width={60} height={8} rx={4} fill="#64748b" />
        {/* String */}
        <line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY} stroke="#475569" strokeWidth="2" />
        {/* Bob */}
        <circle cx={bobX} cy={bobY} r={14} fill="url(#bobGrad)" stroke="#1e40af" strokeWidth="2" />
        {/* Angle arc */}
        <line x1={pivotX} y1={pivotY} x2={pivotX} y2={pivotY + 50} stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="3 2" />
        <defs>
          <radialGradient id="bobGrad"><stop offset="30%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#2563eb" /></radialGradient>
        </defs>
        {/* Formula */}
        <text x={200} y={280} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">T = 2π√(L/g) = {period.toFixed(3)}s</text>
      </svg>
    </div>
  )

  return (
    <MissionShell title={t('Simple Pendulum', 'ಸರಳ ಪೆಂಡುಲಮ್')} titleEmoji="🔄" subject="Physics" accentColor="blue" gradientFrom="from-blue-500" gradientTo="to-indigo-600" steps={steps} currentStep={running ? 3 : 1} controls={controls} visualization={visualization} observations={observations} />
  )
}
