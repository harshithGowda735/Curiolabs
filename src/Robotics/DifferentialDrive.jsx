import { useState, useEffect, useRef } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Set Wheel Velocities', description: 'Configure individual left (v_L) and right (v_R) wheel speeds' },
  { title: 'Adjust Track Width', description: 'Modify distance between wheels (axle length L)' },
  { title: 'Observe Trajectory & ICC', description: 'See Instantaneous Center of Curvature and turning arc' },
  { title: 'Test Drive Modes', description: 'Switch between spin-in-place, pivot turns, and straight drives' }
]

const observations = [
  'Forward linear velocity is the average of both wheels: v = (v_R + v_L) / 2',
  'Angular yaw rate is the difference divided by wheel track: ω = (v_R - v_L) / L',
  'When v_L = -v_R, linear velocity is zero and the robot spins in place around its own geometric center',
  'When one wheel is stopped (e.g. v_L = 0), the robot pivots directly around the stationary wheel contact patch',
  'Turning radius R = (L / 2) · (v_R + v_L) / (v_R - v_L); approaches infinity when both wheel speeds match'
]

export default function DifferentialDrive() {
  const { t } = useLanguage()
  const [vl, setVl] = useState(30) // mm/s
  const [vr, setVr] = useState(45) // mm/s
  const [wheelbase, setWheelbase] = useState(40) // mm
  const [isRunning, setIsRunning] = useState(false)

  const [robotPose, setRobotPose] = useState({
    x: 175,
    y: 150,
    theta: -Math.PI / 2,
    path: [{ x: 175, y: 150 }]
  })

  const animRef = useRef(null)
  const stateRef = useRef({
    x: 175,
    y: 150,
    theta: -Math.PI / 2,
    path: [{ x: 175, y: 150 }]
  })

  // Kinematic calculations
  const v = (vr + vl) / 2
  const omega = (vr - vl) / wheelbase
  const turnRadius = Math.abs(vr - vl) > 0.01 ? ((wheelbase / 2) * (vr + vl)) / (vr - vl) : Infinity

  useEffect(() => {
    if (!isRunning) return

    let lastTime = performance.now()
    const loop = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time

      const st = stateRef.current
      st.theta += omega * dt
      st.x += v * Math.cos(st.theta) * dt
      st.y += v * Math.sin(st.theta) * dt

      // Wrap-around screen bounds
      if (st.x < 15) st.x = 335
      if (st.x > 335) st.x = 15
      if (st.y < 15) st.y = 235
      if (st.y > 235) st.y = 15

      const lastPt = st.path[st.path.length - 1]
      if (Math.hypot(st.x - lastPt.x, st.y - lastPt.y) > 3) {
        st.path.push({ x: st.x, y: st.y })
        if (st.path.length > 250) st.path.shift()
      }

      setRobotPose({
        x: st.x,
        y: st.y,
        theta: st.theta,
        path: [...st.path]
      })

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [isRunning, v, omega])

  const handleReset = () => {
    setIsRunning(false)
    stateRef.current = { x: 175, y: 150, theta: -Math.PI / 2, path: [{ x: 175, y: 150 }] }
    setRobotPose({ x: 175, y: 150, theta: -Math.PI / 2, path: [{ x: 175, y: 150 }] })
  }

  const setPreset = (type) => {
    if (type === 'straight') {
      setVl(40)
      setVr(40)
    } else if (type === 'spin') {
      setVl(-30)
      setVr(30)
    } else if (type === 'pivot') {
      setVl(0)
      setVr(45)
    } else if (type === 'curve') {
      setVl(25)
      setVr(50)
    }
  }

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🕹️ {t('Wheel Speed Actuation', 'ಚಕ್ರದ ವೇಗ')}</h3>
        <LabeledSlider label="Left Wheel (v_L)" value={vl} onChange={setVl} min={-60} max={60} step={2} unit=" mm/s" accentColor="#ef4444" />
        <div className="mt-3">
          <LabeledSlider label="Right Wheel (v_R)" value={vr} onChange={setVr} min={-60} max={60} step={2} unit=" mm/s" accentColor="#3b82f6" />
        </div>
        <div className="mt-3">
          <LabeledSlider label="Wheelbase Width (L)" value={wheelbase} onChange={setWheelbase} min={25} max={60} step={1} unit=" mm" accentColor="#10b981" />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={() => setPreset('straight')} className="p-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">
            ⬆️ Straight (v_L=v_R)
          </button>
          <button onClick={() => setPreset('spin')} className="p-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">
            🔄 Spin in Place
          </button>
          <button onClick={() => setPreset('pivot')} className="p-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">
            ↩️ Pivot Turn (v_L=0)
          </button>
          <button onClick={() => setPreset('curve')} className="p-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">
            ↪️ Arc Trajectory
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isRunning ? '⏸️ Stop Motion' : '▶️ Drive Mobile Robot'}
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
        <h3 className="font-display font-bold text-gray-800 mb-2">🧭 {t('Kinematic State & Metrics', 'ಕಿನಮ್ಯಾಟಿಕ್ ಮಾಪನ')}</h3>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-gray-50 p-2.5 rounded-lg border">
            <span className="text-gray-500 block">Linear Velocity (v)</span>
            <span className="text-base font-bold text-gray-800 font-display">{v.toFixed(1)} mm/s</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg border">
            <span className="text-gray-500 block">Angular Velocity (ω)</span>
            <span className="text-base font-bold text-amber-600 font-display">{(omega * 180 / Math.PI).toFixed(1)}°/s</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg border">
            <span className="text-gray-500 block">Turning Radius (R)</span>
            <span className="text-base font-bold text-blue-600 font-display">
              {Number.isFinite(turnRadius) ? `${turnRadius.toFixed(0)} mm` : '∞ (Straight)'}
            </span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg border">
            <span className="text-gray-500 block">Heading (θ)</span>
            <span className="text-base font-bold text-purple-600 font-display">
              {(((robotPose.theta * 180 / Math.PI) % 360 + 360) % 360).toFixed(0)}°
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-gray-800">🏎️ {t('Planar Motion & Odometry Space', 'ಪ್ಲಾನರ್ ಚಲನೆ')}</h3>
          <span className="text-xs text-gray-500 font-mono">Arena: 350 × 250 mm</span>
        </div>

        <svg viewBox="0 0 350 250" className="w-full bg-slate-900 rounded-xl overflow-hidden shadow-inner">
          <rect width="350" height="250" fill="#090d16" />

          {/* Grid lines */}
          <line x1="175" y1="0" x2="175" y2="250" stroke="#1e293b" strokeDasharray="3,3" />
          <line x1="0" y1="125" x2="350" y2="125" stroke="#1e293b" strokeDasharray="3,3" />

          {/* Path History Breadcrumbs */}
          {robotPose.path.length > 1 && (
            <polyline
              points={robotPose.path.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="2,2"
              opacity="0.75"
            />
          )}

          {/* Robot Chassis */}
          <g transform={`translate(${robotPose.x}, ${robotPose.y}) rotate(${robotPose.theta * 180 / Math.PI})`}>
            {/* Robot Main Body */}
            <rect x="-14" y="-12" width="28" height="24" rx="4" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" />
            
            {/* Left Wheel */}
            <rect x="-10" y={-wheelbase / 2 - 3} width="20" height="5" rx="1.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.5" />
            
            {/* Right Wheel */}
            <rect x="-10" y={wheelbase / 2 - 2} width="20" height="5" rx="1.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="0.5" />

            {/* Front Caster Wheel */}
            <circle cx="10" cy="0" r="3" fill="#cbd5e1" />
            
            {/* Forward Orientation Heading Arrow */}
            <line x1="0" y1="0" x2="18" y2="0" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="18,-3 23,0 18,3" fill="#f59e0b" />
          </g>

          <text x="12" y="24" fill="#64748b" fontSize="10" fontFamily="sans-serif">
            L: {wheelbase}mm | v_L: {vl} mm/s | v_R: {vr} mm/s
          </text>
        </svg>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📐 {t('Instantaneous Center of Curvature (ICC)', 'ICC ಗಣಿತ')}</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          At every instant, a differential drive robot rotates about a single point along its wheel axis called the <span className="font-semibold text-gray-800">Instantaneous Center of Curvature (ICC)</span>. The distance from the center of the robot to ICC is the turning radius <span className="font-mono text-amber-600">R = (L/2)·(v_R+v_L)/(v_R-v_L)</span>.
        </p>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Differential Drive Robot Kinematics', 'ಡಿಫರೆನ್ಷಿಯಲ್ ಡ್ರೈವ್ ರೋಬೋಟ್ ಕಿನಮ್ಯಾಟಿಕ್ಸ್')}
      domain="Robotics & Automation"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
