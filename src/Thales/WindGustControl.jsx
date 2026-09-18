import { useState, useEffect, useRef } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Inject Turbulent Wind Gusts', description: 'Simulate crosswind shears and convective updrafts up to 60 knots' },
  { title: 'Tune Fly-By-Wire Dampers', description: 'Adjust pitch & roll rate feedback gains (K_pitch, K_roll)' },
  { title: 'Switch Flight Control Law', description: 'Compare open-loop Direct Law against closed-loop Normal Law' },
  { title: 'Evaluate Passenger G-Load', description: 'Minimize ride quality vibration while maintaining flight path angle' }
]

const observations = [
  'Wind shear introduces sudden changes in wind speed or direction that destabilize aircraft pitch attitude',
  'Pitch rate dampers (q-damping) use gyroscopic rate sensors to deflect elevators opposite to rotational gust acceleration',
  'Normal Law fly-by-wire flight control computers provide positive static stability and flight envelope protection',
  'Under Direct Law (degraded flight computer mode), control surface deflection is directly mapped to pilot sidestick without automatic gust damping',
  'Dutch roll oscillations combine yaw and roll motions that must be actively attenuated by automatic yaw dampers'
]

export default function WindGustControl() {
  const { t } = useLanguage()
  const [gustSpeed, setGustSpeed] = useState(35) // kts
  const [kPitch, setKPitch] = useState(3.2)
  const [kRoll, setKRoll] = useState(2.5)
  const [controlLaw, setControlLaw] = useState('normal') // 'normal' or 'direct'
  const [isRunning, setIsRunning] = useState(false)

  const [pitchHistory, setPitchHistory] = useState([])
  const [liveState, setLiveState] = useState({ pitch: 0, roll: 0, elevator: 0, gLoad: 1.0 })

  const animRef = useRef(null)
  const stateRef = useRef({ pitch: 0, roll: 0, pitchRate: 0, rollRate: 0 })

  useEffect(() => {
    if (!isRunning) return

    let lastTime = performance.now()
    const loop = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time

      const st = stateRef.current

      // Stochastic gust perturbation
      const gustPitchTorque = (Math.sin(time * 0.003) * 2.5 + (Math.random() - 0.5) * 4) * (gustSpeed / 30)
      const gustRollTorque = (Math.cos(time * 0.004) * 2.0 + (Math.random() - 0.5) * 3) * (gustSpeed / 30)

      let elevatorCorrection = 0
      let aileronCorrection = 0

      if (controlLaw === 'normal') {
        elevatorCorrection = -(kPitch * st.pitchRate + 1.2 * st.pitch)
        aileronCorrection = -(kRoll * st.rollRate + 1.0 * st.roll)
      }

      // Aircraft equations of motion
      const netPitchTorque = gustPitchTorque + elevatorCorrection
      const netRollTorque = gustRollTorque + aileronCorrection

      st.pitchRate += netPitchTorque * dt * 8
      st.pitch += st.pitchRate * dt
      st.pitchRate *= 0.94 // Aerodynamic natural damping

      st.rollRate += netRollTorque * dt * 8
      st.roll += st.rollRate * dt
      st.rollRate *= 0.94

      const gLoad = 1.0 + (st.pitchRate * 0.08)

      setLiveState({
        pitch: st.pitch,
        roll: st.roll,
        elevator: elevatorCorrection,
        gLoad
      })

      setPitchHistory(prev => {
        const next = [...prev, st.pitch]
        if (next.length > 60) next.shift()
        return next
      })

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [isRunning, gustSpeed, kPitch, kRoll, controlLaw])

  const handleReset = () => {
    setIsRunning(false)
    stateRef.current = { pitch: 0, roll: 0, pitchRate: 0, rollRate: 0 }
    setPitchHistory([])
    setLiveState({ pitch: 0, roll: 0, elevator: 0, gLoad: 1.0 })
  }

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">💨 {t('Atmospheric Turbulence Environment', 'ವಾತಾವರಣದ ಪ್ರಕ್ಷುಬ್ಧತೆ')}</h3>
        <LabeledSlider label="Wind Gust Velocity" value={gustSpeed} onChange={setGustSpeed} min={0} max={60} step={5} unit=" kts" accentColor="#0284c7" />

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700 block mb-2">Flight Control Computer Law</label>
          <div className="flex gap-2">
            <button
              onClick={() => setControlLaw('normal')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                controlLaw === 'normal' ? 'bg-sky-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🛡️ Normal Law (Closed-Loop)
            </button>
            <button
              onClick={() => setControlLaw('direct')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                controlLaw === 'direct' ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ⚠️ Direct Law (Unassisted)
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🎛️ {t('Fly-By-Wire Rate Damper Gains', 'FBW ಡ್ಯಾಂಪರ್ ಗೇನ್‌ಗಳು')}</h3>
        <LabeledSlider label="Pitch Damper (K_pitch)" value={kPitch} onChange={setKPitch} min={0} max={8} step={0.2} unit="" accentColor="#10b981" />
        <div className="mt-3">
          <LabeledSlider label="Roll Damper (K_roll)" value={kRoll} onChange={setKRoll} min={0} max={8} step={0.2} unit="" accentColor="#3b82f6" />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            {isRunning ? '⏸️ Pause Turbulence' : '▶️ Fly in Turbulence'}
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
        <h3 className="font-display font-bold text-gray-800 mb-2">⚡ {t('Aircraft Ride Telemetry', 'ಫ್ಲೈಟ್ ಟೆಲಿಮೆಟ್ರಿ')}</h3>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-sky-50 p-2 rounded-lg border">
            <span className="text-gray-500 block">Pitch Deviation</span>
            <span className="text-base font-bold text-sky-800 font-display">{liveState.pitch.toFixed(1)}°</span>
          </div>
          <div className="bg-sky-50 p-2 rounded-lg border">
            <span className="text-gray-500 block">Roll Deviation</span>
            <span className="text-base font-bold text-sky-800 font-display">{liveState.roll.toFixed(1)}°</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg border">
            <span className="text-gray-500 block">Elevator Trim</span>
            <span className="text-base font-bold text-gray-800 font-display">{liveState.elevator.toFixed(1)}°</span>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg border">
            <span className="text-gray-500 block">Vertical G-Load</span>
            <span className="text-base font-bold text-purple-700 font-display">{liveState.gLoad.toFixed(2)} G</span>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* 2D Aircraft Attitude Simulator */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-gray-800">✈️ {t('Aircraft Airframe Stability Visualization', 'ಏರ್‌ಫ್ರೇಮ್ ಸ್ಥಿರತೆ')}</h3>
          <span className="text-xs font-mono text-gray-500">Law: {controlLaw.toUpperCase()}</span>
        </div>

        <svg viewBox="0 0 350 200" className="w-full bg-slate-900 rounded-xl overflow-hidden">
          <rect width="350" height="200" fill="#0f172a" />

          {/* Artificial Horizon Lines */}
          <line x1="0" y1="100" x2="350" y2="100" stroke="#334155" strokeDasharray="4,4" />

          {/* Animated Aircraft Fuselage Symbol */}
          <g
            transform={`translate(175, 100) rotate(${liveState.roll}) translate(0, ${-liveState.pitch * 3})`}
            style={{ transition: 'transform 0.05s ease-out' }}
          >
            {/* Main Wing Bar */}
            <rect x="-85" y="-3" width="170" height="6" rx="3" fill="#38bdf8" />
            
            {/* Wingtips */}
            <circle cx="-85" cy="0" r="4" fill="#ef4444" />
            <circle cx="85" cy="0" r="4" fill="#10b981" />

            {/* Fuselage Circle */}
            <circle cx="0" cy="0" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            {/* Vertical Fin */}
            <rect x="-2" y="-24" width="4" height="24" rx="2" fill="#38bdf8" />
          </g>

          {/* Wind shear vector arrows */}
          {isRunning && gustSpeed > 0 && (
            <g opacity="0.6">
              <path d="M 20 40 Q 60 25 100 40" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
              <path d="M 230 160 Q 270 145 320 160" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
            </g>
          )}

          <text x="12" y="24" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
            Active Gust Velocity: {gustSpeed} kts | Fly-By-Wire Damped
          </text>
        </svg>
      </div>

      {/* Pitch Oscillation History Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📈 {t('Pitch Attitude Oscillation Convergence', 'ಪಿಚ್ ಆಸಿಲೇಶನ್ ಗ್ರಾಫ್')}</h3>
        <div className="h-32 bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center gap-1 overflow-hidden relative">
          <div className="absolute top-1/2 left-0 right-0 border-b border-gray-300 pointer-events-none" />
          {pitchHistory.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              Start simulation to observe pitch attitude damping trace
            </div>
          ) : (
            pitchHistory.map((deg, idx) => {
              const clamped = Math.max(-20, Math.min(20, deg))
              const height = Math.abs(clamped) * 2.5
              const isUp = clamped > 0

              return (
                <div key={idx} className="flex-1 flex flex-col justify-center h-full">
                  <div
                    className={`w-full rounded-sm ${isUp ? 'bg-sky-500 self-start' : 'bg-amber-500 self-end'}`}
                    style={{ height: `${Math.max(2, height)}px` }}
                  />
                </div>
              )
            })
          )}
        </div>
        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
          <span>T - 60 updates</span>
          <span>Centerline: 0.0° Level Flight</span>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Wind Gust & Flight Control Law Stability', 'ಗಾಳಿಯ ಪ್ರಕ್ಷುಬ್ಧತೆ ಮತ್ತು ಫ್ಲೈಟ್ ಕಂಟ್ರೋಲ್ ಸ್ಟೆಬಿಲಿಟಿ')}
      domain="Aerospace & Flight Systems"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
