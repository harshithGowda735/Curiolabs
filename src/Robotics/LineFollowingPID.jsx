import { useState, useEffect, useRef } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Tune Proportional (Kp)', description: 'Set immediate response strength to offset errors' },
  { title: 'Add Derivative (Kd)', description: 'Dampen oscillations and prevent overshooting curves' },
  { title: 'Tune Integral (Ki)', description: 'Eliminate steady-state offset on continuous bends' },
  { title: 'Run Track Simulation', description: 'Test robot stability across high-curvature race tracks' }
]

const observations = [
  'Proportional control (Kp) reduces rise time but causes oscillation if set too high',
  'Derivative control (Kd) predicts future error from rate of change and provides critical damping',
  'Integral control (Ki) accumulates past errors to eliminate steady-state offsets on continuous curves',
  'Too much Ki causes integral windup, producing sluggish recovery after sharp turns',
  'The Ziegler-Nichols tuning method provides a systematic approach to finding optimal PID gains'
]

export default function LineFollowingPID() {
  const { t } = useLanguage()
  const [kp, setKp] = useState(2.5)
  const [ki, setKi] = useState(0.05)
  const [kd, setKd] = useState(1.8)
  const [speed, setSpeed] = useState(40)
  const [isRunning, setIsRunning] = useState(false)
  const [errorLog, setErrorLog] = useState([])
  const [stats, setStats] = useState({ error: 0, p: 0, i: 0, d: 0, correction: 0, oscillationCount: 0 })

  const animRef = useRef(null)
  const stateRef = useRef({
    t: 0,
    integral: 0,
    lastError: 0,
    robotX: 60,
    robotY: 125,
    oscillations: 0
  })

  // Track generator: returns target Y for a given X coordinate
  const getTrackY = (x) => {
    return 125 + 45 * Math.sin((x / 350) * 2 * Math.PI) + 20 * Math.sin((x / 350) * 4 * Math.PI)
  }

  useEffect(() => {
    if (!isRunning) return

    let lastTime = performance.now()
    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05)
      lastTime = currentTime

      const st = stateRef.current
      st.t += dt * (speed / 30)

      // Virtual position advancing around track (0 to 350)
      const curX = (st.t * 35) % 350
      const targetY = getTrackY(curX)

      // Cross track error
      const error = targetY - st.robotY

      // Integral with anti-windup clamping
      st.integral = Math.max(-50, Math.min(50, st.integral + error * dt))
      const derivative = (error - st.lastError) / Math.max(dt, 0.001)

      const pTerm = kp * error
      const iTerm = ki * st.integral
      const dTerm = kd * derivative
      const correction = pTerm + iTerm + dTerm

      // Move robot towards target with PID correction
      st.robotY += correction * dt * 4
      st.robotX = curX

      // Count zero crossings (oscillations)
      if ((st.lastError > 0 && error < 0) || (st.lastError < 0 && error > 0)) {
        st.oscillations += 1
      }
      st.lastError = error

      setStats({
        error: error.toFixed(2),
        p: pTerm.toFixed(2),
        i: iTerm.toFixed(2),
        d: dTerm.toFixed(2),
        correction: correction.toFixed(2),
        oscillations: st.oscillations
      })

      setErrorLog(prev => {
        const next = [...prev, Math.abs(error)]
        if (next.length > 50) next.shift()
        return next
      })

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [isRunning, kp, ki, kd, speed])

  const handleReset = () => {
    setIsRunning(false)
    stateRef.current = { t: 0, integral: 0, lastError: 0, robotX: 60, robotY: 125, oscillations: 0 }
    setErrorLog([])
    setStats({ error: 0, p: 0, i: 0, d: 0, correction: 0, oscillations: 0 })
  }

  // Precompute track polyline points
  const trackPoints = []
  for (let x = 0; x <= 350; x += 5) {
    trackPoints.push(`${x},${getTrackY(x)}`)
  }

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🎛️ {t('PID Controller Gains', 'PID ನಿಯಂತ್ರಕ ಗೇನ್‌ಗಳು')}</h3>
        <LabeledSlider label="Proportional (Kp)" value={kp} onChange={setKp} min={0} max={10} step={0.1} unit="" accentColor="#ef4444" />
        <div className="mt-3">
          <LabeledSlider label="Integral (Ki)" value={ki} onChange={setKi} min={0} max={0.5} step={0.01} unit="" accentColor="#3b82f6" />
        </div>
        <div className="mt-3">
          <LabeledSlider label="Derivative (Kd)" value={kd} onChange={setKd} min={0} max={5} step={0.1} unit="" accentColor="#10b981" />
        </div>
        <div className="mt-3">
          <LabeledSlider label="Robot Speed" value={speed} onChange={setSpeed} min={10} max={80} step={5} unit=" mm/s" accentColor="#8b5cf6" />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isRunning ? '⏸️ Pause Robot' : '▶️ Start Following'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">⚡ {t('Real-time PID Components', 'ನೈಜ-ಸಮಯದ PID ಘಟಕಗಳು')}</h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-red-50 p-2 rounded-lg border border-red-100">
            <p className="text-red-600 font-bold">P-Term</p>
            <p className="font-mono text-gray-800 text-sm">{stats.p}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
            <p className="text-blue-600 font-bold">I-Term</p>
            <p className="font-mono text-gray-800 text-sm">{stats.i}</p>
          </div>
          <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
            <p className="text-emerald-600 font-bold">D-Term</p>
            <p className="font-mono text-gray-800 text-sm">{stats.d}</p>
          </div>
        </div>

        <div className="mt-3 bg-gray-50 p-2 rounded-lg flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">Net Steering Correction:</span>
          <span className="font-mono font-bold text-gray-900">{stats.correction}</span>
        </div>
        <div className="mt-1.5 bg-gray-50 p-2 rounded-lg flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">Path Oscillations:</span>
          <span className="font-mono font-bold text-amber-700">{stats.oscillations}</span>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* 2D Race Track with Moving Robot */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-gray-800">🏎️ {t('Robot Track & Sensor Alignment', 'ಟ್ರ್ಯಾಕ್ ಮತ್ತು ಸಂವೇದಕ ಜೋಡಣೆ')}</h3>
          <span className="text-xs font-mono text-gray-500">Cross-Track Error: {stats.error} px</span>
        </div>

        <svg viewBox="0 0 350 250" className="w-full bg-slate-900 rounded-xl overflow-hidden">
          {/* Track Surface */}
          <rect width="350" height="250" fill="#0f172a" />

          {/* Grid lines */}
          <line x1="0" y1="125" x2="350" y2="125" stroke="#1e293b" strokeDasharray="4,4" />

          {/* S-Curve Guide Path */}
          <polyline
            points={trackPoints.join(' ')}
            fill="none"
            stroke="#334155"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <polyline
            points={trackPoints.join(' ')}
            fill="none"
            stroke="#f8fafc"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Robot Model */}
          <g transform={`translate(${stateRef.current.robotX}, ${stateRef.current.robotY})`}>
            {/* Robot Chassis */}
            <rect x="-16" y="-12" width="32" height="24" rx="4" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1.5" />
            
            {/* Left & Right Wheels */}
            <rect x="-14" y="-16" width="10" height="4" rx="1" fill="#1e293b" />
            <rect x="4" y="-16" width="10" height="4" rx="1" fill="#1e293b" />
            <rect x="-14" y="12" width="10" height="4" rx="1" fill="#1e293b" />
            <rect x="4" y="12" width="10" height="4" rx="1" fill="#1e293b" />

            {/* Front IR Sensor Array (5 dots) */}
            <circle cx="16" cy="-8" r="1.5" fill="#ef4444" />
            <circle cx="16" cy="-4" r="1.5" fill="#fbbf24" />
            <circle cx="16" cy="0" r="2" fill="#22c55e" />
            <circle cx="16" cy="4" r="1.5" fill="#fbbf24" />
            <circle cx="16" cy="8" r="1.5" fill="#ef4444" />

            {/* Error vector line */}
            <line
              x1="16"
              y1="0"
              x2="16"
              y2={getTrackY(stateRef.current.robotX) - stateRef.current.robotY}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="2,2"
            />
          </g>

          <text x="12" y="24" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
            Black Line Track Following • Dynamic IR Array Guidance
          </text>
        </svg>
      </div>

      {/* Error Tracking Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📈 {t('Error Convergence History', 'ದೋಷ ಇಳಿಕೆ ಗ್ರಾಫ್')}</h3>
        <div className="h-32 bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-end gap-1 overflow-hidden">
          {errorLog.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              Start simulation to view PID error convergence trace
            </div>
          ) : (
            errorLog.map((val, idx) => {
              const height = Math.min(100, Math.max(4, val * 2.5))
              const color = val < 5 ? '#10b981' : val < 15 ? '#f59e0b' : '#ef4444'
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-t transition-all"
                  style={{ height: `${height}%`, backgroundColor: color }}
                  title={`Error: ${val.toFixed(2)}`}
                />
              )
            })
          )}
        </div>
        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
          <span>Past 50 samples</span>
          <span>Target error: 0.0</span>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Line Following Robot with PID Tuning', 'PID ಟ್ಯೂನಿಂಗ್‌ನೊಂದಿಗೆ ಲೈನ್ ಫಾಲೋಯಿಂಗ್ ರೋಬೋಟ್')}
      domain="Robotics & Automation"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
