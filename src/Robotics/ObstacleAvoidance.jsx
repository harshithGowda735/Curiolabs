import { useState, useEffect, useRef } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Set Detection Range', description: 'Adjust ultrasonic & LiDAR sensor threshold distances' },
  { title: 'Configure Potential Field', description: 'Balance attractive goal forces vs repulsive obstacle fields' },
  { title: 'Test Navigation', description: 'Navigate through obstacle maze to reach target coordinates' },
  { title: 'Analyze Avoidance Paths', description: 'Inspect local minima avoidance and reactive steering' }
]

const observations = [
  'Artificial Potential Fields (APF) model goals as attractive wells and obstacles as repulsive peaks',
  'Local minima traps occur when attractive and repulsive vectors cancel each other out (net force = 0)',
  'Ultrasonic sensors have wide beam divergence (15°-30°), whereas LiDAR offers millimeter point-cloud precision',
  'Safe deceleration distance is calculated as d_safe = v² / (2 · a_max) + d_margin',
  'Dynamic window approaches (DWA) account for velocity limits and robot inertia when choosing paths'
]

export default function ObstacleAvoidance() {
  const { t } = useLanguage()
  const [sensorRange, setSensorRange] = useState(65)
  const [repulsionGain, setRepulsionGain] = useState(4.0)
  const [attractionGain, setAttractionGain] = useState(2.0)
  const [isRunning, setIsRunning] = useState(false)
  const [reachedGoal, setReachedGoal] = useState(false)

  const [obstacles, setObstacles] = useState([
    { x: 120, y: 90, r: 18 },
    { x: 190, y: 150, r: 22 },
    { x: 230, y: 80, r: 16 }
  ])

  const [robotState, setRobotState] = useState({
    x: 40,
    y: 200,
    theta: -0.8,
    speed: 0,
    minDist: 100,
    path: [{ x: 40, y: 200 }]
  })

  const goal = { x: 310, y: 50, r: 12 }
  const animRef = useRef(null)
  const stateRef = useRef({
    x: 40,
    y: 200,
    theta: -0.8,
    path: [{ x: 40, y: 200 }]
  })

  useEffect(() => {
    if (!isRunning) return

    let lastTime = performance.now()
    const loop = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time

      const st = stateRef.current

      // Distance to goal
      const dxGoal = goal.x - st.x
      const dyGoal = goal.y - st.y
      const distGoal = Math.sqrt(dxGoal * dxGoal + dyGoal * dyGoal)

      if (distGoal < 15) {
        setIsRunning(false)
        setReachedGoal(true)
        return
      }

      // Attractive force towards goal
      let fx = attractionGain * (dxGoal / distGoal)
      let fy = attractionGain * (dyGoal / distGoal)

      // Repulsive forces from obstacles
      let nearestDist = 999
      obstacles.forEach(obs => {
        const dx = st.x - obs.x
        const dy = st.y - obs.y
        const dist = Math.sqrt(dx * dx + dy * dy) - obs.r
        if (dist < nearestDist) nearestDist = dist

        if (dist > 0 && dist < sensorRange) {
          const repForce = repulsionGain * ((1 / dist) - (1 / sensorRange)) * (1 / (dist * dist))
          fx += repForce * (dx / (dist + obs.r)) * 120
          fy += repForce * (dy / (dist + obs.r)) * 120
        }
      })

      // Update heading towards net force
      const targetTheta = Math.atan2(fy, fx)
      let diffTheta = targetTheta - st.theta
      while (diffTheta > Math.PI) diffTheta -= 2 * Math.PI
      while (diffTheta < -Math.PI) diffTheta += 2 * Math.PI

      st.theta += diffTheta * Math.min(1, dt * 6)
      const currentSpeed = 45

      st.x += Math.cos(st.theta) * currentSpeed * dt
      st.y += Math.sin(st.theta) * currentSpeed * dt

      // Clamp bounds
      st.x = Math.max(15, Math.min(335, st.x))
      st.y = Math.max(15, Math.min(235, st.y))

      if (Math.hypot(st.x - st.path[st.path.length - 1].x, st.y - st.path[st.path.length - 1].y) > 4) {
        st.path.push({ x: st.x, y: st.y })
        if (st.path.length > 200) st.path.shift()
      }

      setRobotState({
        x: st.x,
        y: st.y,
        theta: st.theta,
        speed: currentSpeed,
        minDist: Math.max(0, nearestDist),
        path: [...st.path]
      })

      animRef.current = requestAnimationFrame(loop)
    }

    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [isRunning, obstacles, sensorRange, repulsionGain, attractionGain])

  const handleReset = () => {
    setIsRunning(false)
    setReachedGoal(false)
    stateRef.current = { x: 40, y: 200, theta: -0.8, path: [{ x: 40, y: 200 }] }
    setRobotState({ x: 40, y: 200, theta: -0.8, speed: 0, minDist: 100, path: [{ x: 40, y: 200 }] })
  }

  const randomizeObstacles = () => {
    handleReset()
    setObstacles([
      { x: 100 + Math.floor(Math.random() * 60), y: 70 + Math.floor(Math.random() * 60), r: 16 + Math.floor(Math.random() * 8) },
      { x: 170 + Math.floor(Math.random() * 60), y: 130 + Math.floor(Math.random() * 60), r: 18 + Math.floor(Math.random() * 8) },
      { x: 230 + Math.floor(Math.random() * 50), y: 60 + Math.floor(Math.random() * 70), r: 15 + Math.floor(Math.random() * 10) }
    ])
  }

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📡 {t('Sensor & Potential Field Parameters', 'ಸಂವೇದಕ ನಿಯತಾಂಕಗಳು')}</h3>
        <LabeledSlider label="LiDAR / Ultrasonic Range" value={sensorRange} onChange={setSensorRange} min={30} max={120} step={5} unit=" cm" accentColor="#3b82f6" />
        <div className="mt-3">
          <LabeledSlider label="Repulsion Gain (K_rep)" value={repulsionGain} onChange={setRepulsionGain} min={1} max={10} step={0.5} unit="" accentColor="#ef4444" />
        </div>
        <div className="mt-3">
          <LabeledSlider label="Attraction Gain (K_att)" value={attractionGain} onChange={setAttractionGain} min={0.5} max={5} step={0.5} unit="" accentColor="#10b981" />
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isRunning ? '⏸️ Pause Mission' : '▶️ Launch Robot'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm"
          >
            🔄 Reset
          </button>
        </div>

        <button
          onClick={randomizeObstacles}
          className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
        >
          🎲 Randomize Arena Obstacles
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">🚨 {t('Obstacle Proximity Radar', 'ಅಡಚಣೆ ಸಾಮೀಪ್ಯ')}</h3>
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
          <div>
            <p className="text-xs text-gray-500">Nearest Obstacle Distance</p>
            <p className="text-xl font-display font-bold text-gray-800">{robotState.minDist.toFixed(1)} cm</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            robotState.minDist < 25 ? 'bg-rose-100 text-rose-700 animate-pulse' :
            robotState.minDist < sensorRange ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {robotState.minDist < 25 ? '⚠️ CRITICAL' : robotState.minDist < sensorRange ? '⚡ AVOIDING' : '✅ CLEAR'}
          </span>
        </div>

        {reachedGoal && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <span>🎉</span> Target Goal Reached without Collision!
          </div>
        )}
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-gray-800">🧭 {t('Autonomous Field Navigation Arena', 'ಸ್ವಾಯತ್ತ ಕ್ಷೇತ್ರ ನ್ಯಾವಿಗೇಷನ್')}</h3>
          <span className="text-xs text-gray-500 font-mono">Arena: 350 × 250 cm</span>
        </div>

        <svg viewBox="0 0 350 250" className="w-full bg-slate-900 rounded-xl overflow-hidden shadow-inner">
          <rect width="350" height="250" fill="#0b1329" />

          {/* Grid lines */}
          <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
          <rect width="350" height="250" fill="url(#grid)" />

          {/* Trajectory Breadcrumbs */}
          {robotState.path.length > 1 && (
            <polyline
              points={robotState.path.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="3,3"
              opacity="0.8"
            />
          )}

          {/* Target Goal */}
          <g transform={`translate(${goal.x}, ${goal.y})`}>
            <circle cx="0" cy="0" r={goal.r * 1.8} fill="#10b981" opacity="0.2" className="animate-ping" />
            <circle cx="0" cy="0" r={goal.r} fill="#10b981" stroke="#34d399" strokeWidth="2" />
            <text x="0" y="4" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">★</text>
            <text x="0" y="24" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">GOAL</text>
          </g>

          {/* Obstacles */}
          {obstacles.map((obs, idx) => (
            <g key={idx} transform={`translate(${obs.x}, ${obs.y})`}>
              {/* Repulsive field gradient */}
              <circle cx="0" cy="0" r={obs.r + sensorRange * 0.4} fill="#ef4444" opacity="0.08" />
              <circle cx="0" cy="0" r={obs.r} fill="#475569" stroke="#ef4444" strokeWidth="2" />
              <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">OBS {idx + 1}</text>
            </g>
          ))}

          {/* Robot with Sensor Scan Arc */}
          <g transform={`translate(${robotState.x}, ${robotState.y}) rotate(${robotState.theta * 180 / Math.PI})`}>
            {/* Ultrasonic/LiDAR Cone */}
            <path
              d={`M 0 0 L ${sensorRange} ${-sensorRange * 0.4} A ${sensorRange} ${sensorRange} 0 0 1 ${sensorRange} ${sensorRange * 0.4} Z`}
              fill="#38bdf8"
              opacity="0.2"
              stroke="#38bdf8"
              strokeWidth="1"
            />

            {/* Robot Chassis */}
            <rect x="-12" y="-9" width="24" height="18" rx="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="6" cy="0" r="3" fill="#1e293b" />
            {/* Wheels */}
            <rect x="-8" y="-12" width="16" height="3" rx="1" fill="#475569" />
            <rect x="-8" y="9" width="16" height="3" rx="1" fill="#475569" />
          </g>
        </svg>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📋 {t('Key Algorithm Details', 'ಅಲ್ಗಾರಿದಮ್ ವಿವರಗಳು')}</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          The Artificial Potential Field algorithm continuously calculates repulsive vectors from obstacles proportional to <span className="font-mono text-rose-600">K_rep · (1/d - 1/d₀)</span> and attractive vector to the goal proportional to <span className="font-mono text-emerald-600">K_att · Δpos</span>. The robot updates its steering heading toward the net resultant vector.
        </p>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Autonomous Obstacle Avoidance', 'ಸ್ವಾಯತ್ತ ಅಡಚಣೆ ತಪ್ಪಿಸುವಿಕೆ')}
      domain="Robotics & Automation"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
