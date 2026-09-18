import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Set PWM Duty Cycle', description: 'Vary the pulse-width modulation percentage to adjust average input voltage' },
  { title: 'Apply Load Torque', description: 'Simulate mechanical friction and resistance on the output shaft' },
  { title: 'Observe Motor Curves', description: 'Analyze torque-speed tradeoff, current draw, and electrical efficiency' },
  { title: 'Inspect Hardware in AR', description: 'Examine the DC geared motor dynamometer test rig in 3D AR' }
]

const observations = [
  'DC motor speed is directly proportional to armature back-EMF, which scales with effective PWM voltage',
  'Operating torque is proportional to armature current: τ = K_t · I',
  'Stall condition occurs when mechanical load equals maximum stall torque (RPM drops to 0, current reaches peak)',
  'Maximum mechanical power occurs at exactly half of the no-load speed (50% w₀)',
  'Peak efficiency occurs at low-to-medium torque where I²R copper losses are minimized'
]

export default function MotorPWMTorque() {
  const { t } = useLanguage()
  const [pwm, setPwm] = useState(75) // %
  const [supplyVoltage, setSupplyVoltage] = useState(12) // V
  const [loadTorque, setLoadTorque] = useState(15) // mN·m
  const [showAR, setShowAR] = useState(false)

  // Motor electrical & mechanical constants
  const motorR = 1.8 // Ohms
  const kt = 0.025 // N·m/A (torque constant)
  const kv = 380 // RPM/V

  const motorData = useMemo(() => {
    const vEff = supplyVoltage * (pwm / 100)
    const noLoadRpm = vEff * kv
    const stallTorqueMnm = (kt * (vEff / motorR)) * 1000 // mN·m

    let rpm = 0
    let current = 0
    let stalled = false

    if (loadTorque >= stallTorqueMnm || vEff < 0.2) {
      stalled = true
      rpm = 0
      current = vEff / motorR
    } else {
      const dropRatio = loadTorque / Math.max(stallTorqueMnm, 0.001)
      rpm = Math.max(0, noLoadRpm * (1 - dropRatio))
      // Back EMF: Eb = rpm / kv
      const eb = rpm / kv
      current = Math.max(0, (vEff - eb) / motorR)
    }

    const radSec = (rpm * 2 * Math.PI) / 60
    const torqueNm = loadTorque / 1000
    const pMech = torqueNm * radSec
    const pElec = vEff * current
    const efficiency = pElec > 0.05 ? Math.min(95, Math.max(0, (pMech / pElec) * 100)) : 0

    return {
      vEff,
      noLoadRpm,
      stallTorqueMnm,
      rpm,
      current,
      stalled,
      pMech,
      pElec,
      efficiency
    }
  }, [pwm, supplyVoltage, loadTorque])

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">⚡ {t('Electrical Power Input', 'ವಿದ್ಯುತ್ ಇನ್‌ಪುಟ್')}</h3>
        <LabeledSlider label="PWM Duty Cycle" value={pwm} onChange={setPwm} min={5} max={100} step={1} unit=" %" accentColor="#3b82f6" />
        <div className="mt-3">
          <LabeledSlider label="Supply Voltage" value={supplyVoltage} onChange={setSupplyVoltage} min={3} max={24} step={1} unit=" V" accentColor="#10b981" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🏋️ {t('Mechanical Shaft Load', 'ಶಾಫ್ಟ್ ಲೋಡ್')}</h3>
        <LabeledSlider label="Applied Load Torque" value={loadTorque} onChange={setLoadTorque} min={0} max={60} step={1} unit=" mN·m" accentColor="#f59e0b" />

        <button
          onClick={() => setShowAR(!showAR)}
          className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          📱 {showAR ? t('Hide AR Motor Rig', 'AR ಮರೆಮಾಡಿ') : t('View 3D Motor Rig in AR', 'AR ನಲ್ಲಿ 3D ಮೋಟಾರ್ ರಿಗ್ ವೀಕ್ಷಿಸಿ')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">⚙️ {t('Telemetry Readouts', 'ಟೆಲಿಮೆಟ್ರಿ')}</h3>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-blue-50 p-2.5 rounded-lg">
            <span className="text-gray-500 block">Shaft Velocity</span>
            <span className="text-base font-bold text-blue-700 font-display">{Math.round(motorData.rpm)} RPM</span>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-lg">
            <span className="text-gray-500 block">Armature Current</span>
            <span className="text-base font-bold text-amber-700 font-display">{motorData.current.toFixed(2)} A</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-lg">
            <span className="text-gray-500 block">Mech. Output</span>
            <span className="text-base font-bold text-emerald-700 font-display">{motorData.pMech.toFixed(2)} W</span>
          </div>
          <div className="bg-purple-50 p-2.5 rounded-lg">
            <span className="text-gray-500 block">Efficiency</span>
            <span className="text-base font-bold text-purple-700 font-display">{motorData.efficiency.toFixed(1)} %</span>
          </div>
        </div>

        {motorData.stalled && (
          <div className="mt-3 p-2 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg text-center animate-pulse">
            ⚠️ MOTOR STALLED — Excess Load Torque
          </div>
        )}
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {showAR && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-gray-800">📱 {t('WebAR DC Motor Actuator', 'WebAR DC ಮೋಟಾರ್')}</h3>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md font-medium">3D Hardware Model</span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-900 min-h-[300px]">
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/DamagedHelmet/glTF/DamagedHelmet.gltf"
              alt="Electric Motor Rig 3D Model"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '300px' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm"
              >
                <span>📱</span> View Rig in AR
              </button>
            </model-viewer>
          </div>
        </div>
      )}

      {/* Spinning Rotor and Dynamo Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">🔄 {t('Shaft Rotation & Dynamometer Rig', 'ಶಾಫ್ಟ್ ತಿರುಗುವಿಕೆ')}</h3>
        <div className="bg-slate-900 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <svg viewBox="0 0 200 200" className="w-44 h-44">
            {/* Stator Ring */}
            <circle cx="100" cy="100" r="85" fill="none" stroke="#334155" strokeWidth="12" />
            <circle cx="100" cy="100" r="72" fill="#1e293b" />

            {/* Electromagnetic Poles */}
            <rect x="92" y="18" width="16" height="14" rx="2" fill="#ef4444" />
            <rect x="92" y="168" width="16" height="14" rx="2" fill="#3b82f6" />
            <text x="100" y="29" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">N</text>
            <text x="100" y="179" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">S</text>

            {/* Rotating Rotor */}
            <g
              transform={`rotate(${(Date.now() / 10) * (motorData.rpm / 600) % 360} 100 100)`}
              style={{
                transition: 'transform 0.1s linear',
                transformOrigin: '100px 100px'
              }}
            >
              {/* Rotor Cross Arm */}
              <rect x="40" y="93" width="120" height="14" rx="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
              <rect x="93" y="40" width="14" height="120" rx="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
              {/* Central Shaft */}
              <circle cx="100" cy="100" r="16" fill="#64748b" stroke="#ffffff" strokeWidth="2" />
              <circle cx="100" cy="100" r="5" fill="#38bdf8" />
              <line x1="100" y1="84" x2="100" y2="116" stroke="#ffffff" strokeWidth="2" />
            </g>
          </svg>

          <div className="mt-3 text-center">
            <span className="text-xs text-slate-400 font-mono">
              V_eff: {motorData.vEff.toFixed(2)} V • Torque: {loadTorque} mN·m
            </span>
          </div>
        </div>
      </div>

      {/* Torque-Speed Curve */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📉 {t('Torque-Speed Characteristic Curve', 'ಟಾರ್ಕ್-ವೇಗ ಕರ್ವ್')}</h3>
        <svg viewBox="0 0 350 160" className="w-full bg-slate-900 rounded-xl p-2">
          {/* Axis */}
          <line x1="45" y1="125" x2="330" y2="125" stroke="#475569" strokeWidth="1.5" />
          <line x1="45" y1="20" x2="45" y2="125" stroke="#475569" strokeWidth="1.5" />

          {/* Labels */}
          <text x="325" y="140" fill="#94a3b8" fontSize="9" textAnchor="end">Torque τ (mN·m)</text>
          <text x="10" y="25" fill="#94a3b8" fontSize="9" transform="rotate(-90 40 30)">Speed (RPM)</text>

          {/* Characteristic Line: from (0, noLoadRpm) to (stallTorque, 0) */}
          <line
            x1="45"
            y1="30"
            x2="290"
            y2="125"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="4,2"
          />

          {/* Operating Point Dot */}
          {motorData.stallTorqueMnm > 0 && (
            <g
              transform={`translate(${
                45 + Math.min(1, loadTorque / motorData.stallTorqueMnm) * (290 - 45)
              }, ${
                125 - (motorData.rpm / Math.max(1, motorData.noLoadRpm)) * (125 - 30)
              })`}
            >
              <circle cx="0" cy="0" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              <text x="8" y="-4" fill="#fbbf24" fontSize="9" fontWeight="bold">
                ({loadTorque} mN·m, {Math.round(motorData.rpm)} RPM)
              </text>
            </g>
          )}

          <text x="50" y="25" fill="#38bdf8" fontSize="9">
            w₀: {Math.round(motorData.noLoadRpm)} RPM
          </text>
          <text x="280" y="140" fill="#f87171" fontSize="9" textAnchor="middle">
            τ_stall: {Math.round(motorData.stallTorqueMnm)}
          </text>
        </svg>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('DC Motor PWM Speed & Torque Characteristics', 'DC ಮೋಟಾರ್ PWM ವೇಗ ಮತ್ತು ಟಾರ್ಕ್ ಗುಣಲಕ್ಷಣಗಳು')}
      domain="Robotics & Automation"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
