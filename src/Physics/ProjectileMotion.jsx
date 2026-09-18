import { useState, useEffect, useRef, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Set Velocity', description: 'Adjust the initial launch velocity' },
  { title: 'Set Angle', description: 'Set the launch angle from horizontal' },
  { title: 'Launch', description: 'Click Launch to fire the projectile and track its path' },
  { title: 'Analyze', description: 'Observe range, max height, and flight time' },
]

const observations = [
  'Maximum range occurs at 45° launch angle (without air resistance)',
  'Range R = v²sin(2θ)/g and max height H = v²sin²(θ)/(2g)',
  'Flight time T = 2v·sin(θ)/g',
  'The trajectory is a parabola: y = x·tan(θ) - g·x²/(2v²cos²θ)',
  'Complementary angles (e.g. 30° and 60°) give the same range',
]

export default function ProjectileMotion() {
  const { t } = useLanguage()
  const [velocity, setVelocity] = useState(30)
  const [launchAngle, setLaunchAngle] = useState(45)
  const [running, setRunning] = useState(false)
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState([])
  const animRef = useRef(null)
  const startRef = useRef(0)

  const g = 9.81
  const rad = (launchAngle * Math.PI) / 180
  const vx = velocity * Math.cos(rad)
  const vy = velocity * Math.sin(rad)
  const flightTime = (2 * vy) / g
  const range = (velocity * velocity * Math.sin(2 * rad)) / g
  const maxHeight = (vy * vy) / (2 * g)

  const launch = () => {
    setTrail([])
    setCurrentPos({ x: 0, y: 0 })
    setRunning(true)
    startRef.current = performance.now()
  }

  useEffect(() => {
    if (!running) return
    const animate = (now) => {
      const t = (now - startRef.current) / 1000 * 2 // Speed up 2x
      if (t > flightTime) {
        setRunning(false)
        return
      }
      const x = vx * t
      const y = vy * t - 0.5 * g * t * t
      setCurrentPos({ x, y: Math.max(0, y) })
      setTrail(prev => [...prev, { x, y: Math.max(0, y) }])
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [running, vx, vy, flightTime, g])

  const svgW = 500, svgH = 250, pad = 40
  const maxR = Math.max(range, 50)
  const maxH = Math.max(maxHeight, 20)
  const sx = (x) => pad + (x / maxR) * (svgW - 2 * pad)
  const sy = (y) => svgH - pad - (y / maxH) * (svgH - 2 * pad) * 0.8

  // Theoretical curve
  const theoryPoints = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * flightTime
      const x = vx * t
      const y = vy * t - 0.5 * g * t * t
      if (y >= 0) pts.push({ x, y })
    }
    return pts
  }, [vx, vy, flightTime, g])

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🎯 {t('Launch Settings', 'ಲಾಂಚ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು')}</h3>
        <LabeledSlider label={t('Initial Velocity', 'ಆರಂಭಿಕ ವೇಗ')} value={velocity} onChange={setVelocity} min={5} max={60} step={1} unit=" m/s" accentColor="#3b82f6" disabled={running} />
        <div className="mt-3">
          <LabeledSlider label={t('Launch Angle', 'ಲಾಂಚ್ ಕೋನ')} value={launchAngle} onChange={setLaunchAngle} min={5} max={85} step={1} unit="°" accentColor="#f59e0b" disabled={running} />
        </div>
        <button onClick={launch} disabled={running} className="w-full mt-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
          🚀 {running ? t('Launching...', 'ಉಡಾಯಿಸಲಾಗುತ್ತಿದೆ...') : t('Launch', 'ಉಡಾಯಿಸಿ')}
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📊 {t('Predicted Values', 'ಊಹಿತ ಮೌಲ್ಯಗಳು')}</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">{t('Range', 'ವ್ಯಾಪ್ತಿ')}</p>
            <p className="text-lg font-bold text-blue-700">{range.toFixed(1)}<span className="text-xs">m</span></p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-amber-600 font-medium">{t('Max Height', 'ಗರಿಷ್ಠ ಎತ್ತರ')}</p>
            <p className="text-lg font-bold text-amber-700">{maxHeight.toFixed(1)}<span className="text-xs">m</span></p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600 font-medium">{t('Flight Time', 'ಹಾರಾಟ ಸಮಯ')}</p>
            <p className="text-lg font-bold text-green-700">{flightTime.toFixed(2)}<span className="text-xs">s</span></p>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Trajectory', 'ಪಥ')}</h3>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto bg-gradient-to-b from-sky-50 to-green-50 rounded-lg">
        {/* Ground */}
        <rect x={0} y={svgH - pad} width={svgW} height={pad} fill="#86efac" opacity="0.3" />
        <line x1={pad} y1={svgH - pad} x2={svgW - pad} y2={svgH - pad} stroke="#22c55e" strokeWidth="2" />
        {/* Theoretical curve */}
        <polyline points={theoryPoints.map(p => `${sx(p.x)},${sy(p.y)}`).join(' ')} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 2" />
        {/* Trail */}
        {trail.length > 1 && (
          <polyline points={trail.map(p => `${sx(p.x)},${sy(p.y)}`).join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {/* Current position */}
        <circle cx={sx(currentPos.x)} cy={sy(currentPos.y)} r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
        {/* Launcher */}
        <line x1={sx(0)} y1={sy(0)} x2={sx(0) + 25 * Math.cos(rad)} y2={sy(0) - 25 * Math.sin(rad)} stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        {/* Range marker */}
        {!running && trail.length > 0 && (
          <text x={sx(range)} y={svgH - pad + 15} textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="600">R = {range.toFixed(1)}m</text>
        )}
      </svg>
    </div>
  )

  return (
    <MissionShell title={t('Projectile Motion', 'ಪ್ರಕ್ಷೇಪಕ ಚಲನೆ')} titleEmoji="🎯" subject="Physics" accentColor="blue" gradientFrom="from-blue-500" gradientTo="to-indigo-600" steps={steps} currentStep={running ? 2 : trail.length > 0 ? 3 : 0} controls={controls} visualization={visualization} observations={observations} />
  )
}
