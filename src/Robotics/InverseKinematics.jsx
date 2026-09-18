import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Set Target Coordinates', description: 'Adjust target X and Y positions within reachable workspace' },
  { title: 'Compute Joint Angles', description: 'Solve analytical inverse kinematics for θ₁ and θ₂' },
  { title: 'Evaluate Reachability', description: 'Observe arm posture (elbow-up vs elbow-down configurations)' },
  { title: 'Inspect in 3D AR', description: 'Project the articulated arm into your space via WebAR' }
]

const observations = [
  'Workspace boundary is defined by radius R_max = L₁ + L₂ and inner blind spot R_min = |L₁ - L₂|',
  'For reachable points, two solutions exist: Elbow-Up and Elbow-Down configurations',
  'Singularities occur at full extension (θ₂ = 0) where Cartesian velocity drops in the radial direction',
  'Inverse kinematics uses the law of cosines to find joint angles from end-effector Cartesian coordinates',
  'Real-world industrial manipulators use inverse kinematics solvers running at 1kHz control loops'
]

export default function InverseKinematics() {
  const { t } = useLanguage()
  const [targetX, setTargetX] = useState(140)
  const [targetY, setTargetY] = useState(120)
  const [l1, setL1] = useState(110)
  const [l2, setL2] = useState(90)
  const [elbowConfig, setElbowConfig] = useState('up') // 'up' or 'down'
  const [showAR, setShowAR] = useState(false)
  const [history, setHistory] = useState([
    { x: 140, y: 120, th1: '28.4°', th2: '63.1°', status: 'Reachable' }
  ])

  // Inverse Kinematics math
  const ikResult = useMemo(() => {
    const distSq = targetX * targetX + targetY * targetY
    const dist = Math.sqrt(distSq)
    const maxReach = l1 + l2
    const minReach = Math.abs(l1 - l2)

    if (dist > maxReach || dist < minReach) {
      return { reachable: false, theta1: 0, theta2: 0, elbowX: 0, elbowY: 0, actualX: 0, actualY: 0 }
    }

    // Law of cosines for theta2
    const cosTheta2 = (distSq - l1 * l1 - l2 * l2) / (2 * l1 * l2)
    const clampedCos = Math.max(-1, Math.min(1, cosTheta2))
    
    // sign based on elbow up/down
    const sign = elbowConfig === 'up' ? 1 : -1
    const theta2 = sign * Math.acos(clampedCos)

    // Theta 1
    const alpha = Math.atan2(targetY, targetX)
    const beta = Math.atan2(l2 * Math.sin(theta2), l1 + l2 * Math.cos(theta2))
    const theta1 = alpha - beta

    // Joint 1 -> Joint 2 position
    const elbowX = l1 * Math.cos(theta1)
    const elbowY = l1 * Math.sin(theta1)

    // End effector position (forward check)
    const actualX = elbowX + l2 * Math.cos(theta1 + theta2)
    const actualY = elbowY + l2 * Math.sin(theta1 + theta2)

    return {
      reachable: true,
      theta1: (theta1 * 180 / Math.PI),
      theta2: (theta2 * 180 / Math.PI),
      elbowX,
      elbowY,
      actualX,
      actualY
    }
  }, [targetX, targetY, l1, l2, elbowConfig])

  const handleRecord = () => {
    setHistory(prev => [
      {
        x: targetX,
        y: targetY,
        th1: ikResult.reachable ? `${ikResult.theta1.toFixed(1)}°` : 'N/A',
        th2: ikResult.reachable ? `${ikResult.theta2.toFixed(1)}°` : 'N/A',
        status: ikResult.reachable ? 'Reachable' : 'Out of Reach'
      },
      ...prev.slice(0, 7)
    ])
  }

  // SVG scaling & origins
  const originX = 175
  const originY = 220
  const scale = 0.85

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🎯 {t('Target Position (mm)', 'ಗುರಿ ಸ್ಥಾನ')}</h3>
        <LabeledSlider label="Target X" value={targetX} onChange={setTargetX} min={-180} max={180} step={2} unit=" mm" accentColor="#f59e0b" />
        <div className="mt-3">
          <LabeledSlider label="Target Y" value={targetY} onChange={setTargetY} min={10} max={190} step={2} unit=" mm" accentColor="#3b82f6" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📐 {t('Link Lengths & Posture', 'ಲಿಂಕ್ ಉದ್ದ ಮತ್ತು ಭಂಗಿ')}</h3>
        <LabeledSlider label="Link 1 (Base)" value={l1} onChange={setL1} min={60} max={140} step={5} unit=" mm" accentColor="#10b981" />
        <div className="mt-3">
          <LabeledSlider label="Link 2 (Forearm)" value={l2} onChange={setL2} min={50} max={120} step={5} unit=" mm" accentColor="#8b5cf6" />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setElbowConfig('up')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              elbowConfig === 'up' ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⬆️ Elbow-Up
          </button>
          <button
            onClick={() => setElbowConfig('down')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              elbowConfig === 'down' ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⬇️ Elbow-Down
          </button>
        </div>

        <button
          onClick={handleRecord}
          className="w-full mt-4 bg-gray-900 text-white font-medium py-2 rounded-lg text-sm hover:bg-black transition-colors"
        >
          📝 {t('Log Data Point', 'ಡೇಟಾ ದಾಖಲಿಸಿ')}
        </button>

        <button
          onClick={() => setShowAR(!showAR)}
          className="w-full mt-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          📱 {showAR ? t('Hide AR 3D Arm', 'AR ಮರೆಮಾಡಿ') : t('View 3D Arm in AR', 'AR ನಲ್ಲಿ 3D ಆರ್ಮ್ ವೀಕ್ಷಿಸಿ')}
        </button>
      </div>

      <div className={`p-4 rounded-xl border ${ikResult.reachable ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600">{t('Kinematics Solution', 'ಕಿನಮ್ಯಾಟಿಕ್ಸ್ ಪರಿಹಾರ')}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ikResult.reachable ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
            {ikResult.reachable ? 'SOLVED' : 'OUT OF REACH'}
          </span>
        </div>
        {ikResult.reachable ? (
          <div className="grid grid-cols-2 gap-2 mt-2 text-center">
            <div className="bg-white/80 p-2 rounded-lg">
              <p className="text-[11px] text-gray-500 font-medium">Joint 1 (θ₁)</p>
              <p className="text-base font-display font-bold text-amber-600">{ikResult.theta1.toFixed(1)}°</p>
            </div>
            <div className="bg-white/80 p-2 rounded-lg">
              <p className="text-[11px] text-gray-500 font-medium">Joint 2 (θ₂)</p>
              <p className="text-base font-display font-bold text-orange-600">{ikResult.theta2.toFixed(1)}°</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-rose-600 mt-2 font-medium">
            Target distance exceeds maximum reach ({l1 + l2} mm) or is within inner radius ({Math.abs(l1 - l2)} mm).
          </p>
        )}
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {showAR && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-gray-800">📱 {t('WebAR Robotic Arm 3D Model', 'WebAR ರೋಬೋಟಿಕ್ ಆರ್ಮ್')}</h3>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md font-medium">Interactive WebGL / AR</span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-900 min-h-[320px]">
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"
              alt="Robotic Manipulator Arm 3D Model"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '320px' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm"
              >
                <span>📱</span> Place in Room (AR)
              </button>
            </model-viewer>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Rotate with touch/mouse. On Android Chrome or iOS Safari, tap "Place in Room" to anchor to flat surfaces.
          </p>
        </div>
      )}

      {/* 2D Kinematic Canvas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">🦾 {t('Planar 2-DOF Workspace Simulation', 'ಪ್ಲಾನರ್ 2-DOF ವರ್ಕ್‌ಸ್ಪೇಸ್')}</h3>
        <svg viewBox="0 0 350 250" className="w-full bg-slate-900 rounded-xl">
          <defs>
            <radialGradient id="grid-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
          </defs>
          <rect width="350" height="250" fill="url(#grid-glow)" />

          {/* Grid lines */}
          <line x1={originX} y1="0" x2={originX} y2="250" stroke="#334155" strokeDasharray="3,3" />
          <line x1="0" y1={originY} x2="350" y2={originY} stroke="#334155" />

          {/* Maximum workspace envelope */}
          <circle
            cx={originX}
            cy={originY}
            r={(l1 + l2) * scale}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity="0.35"
          />
          {/* Minimum workspace limit */}
          {l1 !== l2 && (
            <circle
              cx={originX}
              cy={originY}
              r={Math.abs(l1 - l2) * scale}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity="0.3"
            />
          )}

          {/* Ground Base */}
          <path d={`M ${originX - 25} ${originY} L ${originX + 25} ${originY} L ${originX + 15} ${originY + 12} L ${originX - 15} ${originY + 12} Z`} fill="#64748b" />
          <circle cx={originX} cy={originY} r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />

          {/* Links when reachable */}
          {ikResult.reachable && (
            <>
              {/* Link 1 */}
              <line
                x1={originX}
                y1={originY}
                x2={originX + ikResult.elbowX * scale}
                y2={originY - ikResult.elbowY * scale}
                stroke="#f59e0b"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Elbow joint */}
              <circle
                cx={originX + ikResult.elbowX * scale}
                cy={originY - ikResult.elbowY * scale}
                r="6"
                fill="#fbbf24"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Link 2 */}
              <line
                x1={originX + ikResult.elbowX * scale}
                y1={originY - ikResult.elbowY * scale}
                x2={originX + ikResult.actualX * scale}
                y2={originY - ikResult.actualY * scale}
                stroke="#38bdf8"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* End Effector Gripper */}
              <circle
                cx={originX + ikResult.actualX * scale}
                cy={originY - ikResult.actualY * scale}
                r="5"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </>
          )}

          {/* Target Marker */}
          <g transform={`translate(${originX + targetX * scale}, ${originY - targetY * scale})`}>
            <circle cx="0" cy="0" r="8" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-ping opacity-60" />
            <circle cx="0" cy="0" r="4" fill="#ef4444" />
            <line x1="-8" y1="0" x2="8" y2="0" stroke="#ef4444" strokeWidth="1.5" />
            <line x1="0" y1="-8" x2="0" y2="8" stroke="#ef4444" strokeWidth="1.5" />
            <text x="10" y="-8" fill="#f87171" fontSize="10" fontWeight="bold">
              Target ({targetX}, {targetY})
            </text>
          </g>

          <text x="12" y="24" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
            L₁: {l1}mm | L₂: {l2}mm | Reach: {l1 + l2}mm
          </text>
        </svg>
      </div>

      {/* History Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📊 {t('Trajectory & Solution History', 'ಪರಿಹಾರ ಇತಿಹಾಸ')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b">
              <tr>
                <th className="py-2 px-3">Target (X, Y)</th>
                <th className="py-2 px-3">Joint 1 θ₁</th>
                <th className="py-2 px-3">Joint 2 θ₂</th>
                <th className="py-2 px-3">Workspace Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="py-2 px-3 font-mono text-gray-700">({row.x}, {row.y})</td>
                  <td className="py-2 px-3 text-amber-600 font-semibold">{row.th1}</td>
                  <td className="py-2 px-3 text-orange-600 font-semibold">{row.th2}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.status === 'Reachable' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('2-DOF Robotic Arm Inverse Kinematics', '2-DOF ರೋಬೋಟಿಕ್ ಆರ್ಮ್ ಇನ್ವರ್ಸ್ ಕಿನಮ್ಯಾಟಿಕ್ಸ್')}
      domain="Robotics & Automation"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
