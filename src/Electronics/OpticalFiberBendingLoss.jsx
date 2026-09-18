import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Connect Optical Power Source (1310/1550 nm)', description: 'Launch 0 dBm (1.0 mW) laser into fiber patch cable connected to Optical Power Meter' },
  { title: 'Wind Fiber Around Mandrel Cylinder', description: 'Vary bend radius (5 mm - 35 mm) to observe total internal reflection breakdown' },
  { title: 'Measure Macro-Bending Attenuation', description: 'Log optical loss (dB) as a function of mandrel diameter and turn count' },
  { title: 'Evaluate Source Coupling Misalignment', description: 'Induce lateral gap and angular tilt between laser emitter and fiber core' },
  { title: 'Inspect Fiber Optic Kit in AR', description: 'Examine optical transmitter, mandrel winding, and photodiode detector in 3D WebAR' }
]

const observations = [
  'Macro-bending loss occurs when fiber bend radius approaches critical threshold, causing guided core rays to exceed the critical angle and radiate into the cladding',
  'Bending loss increases exponentially as the bend radius R decreases: α_bend ≈ C1 · exp(-C2 · R)',
  'Multi-mode fibers experience higher bending loss than single-mode fibers because higher-order modes propagate closer to the cladding boundary',
  'Coupling losses arise from lateral offset, longitudinal end separation, and angular misalignment between fiber connectors',
  'ITU-T G.657 standard specifies bend-insensitive optical fibers designed specifically for tight curvature in Fiber-To-The-Home (FTTH) installations'
]

export default function OpticalFiberBendingLoss() {
  const { t } = useLanguage()
  const [bendRadiusMm, setBendRadiusMm] = useState(15) // mm
  const [numTurns, setNumTurns] = useState(3)
  const [fiberType, setFiberType] = useState('multimode') // 'singlemode' or 'multimode'
  const [lateralOffsetUm, setLateralOffsetUm] = useState(5) // um
  const [showAR, setShowAR] = useState(false)

  // Calculations
  const metrics = useMemo(() => {
    const inputPowerDbm = 0 // 1 mW
    // Critical radius constant
    const rc = fiberType === 'multimode' ? 18 : 12

    // Macro-bending loss (dB)
    let singleTurnLossDb = 0
    if (bendRadiusMm <= rc) {
      singleTurnLossDb = 0.15 * Math.exp((rc - bendRadiusMm) * 0.35)
    } else {
      singleTurnLossDb = 0.05 * Math.exp(-(bendRadiusMm - rc) * 0.1)
    }
    const totalBendLossDb = singleTurnLossDb * numTurns

    // Coupling loss (dB) due to lateral misalignment
    const coreRadius = fiberType === 'multimode' ? 25 : 4.5 // um
    const offsetRatio = lateralOffsetUm / coreRadius
    const couplingLossDb = 4.34 * (2 / Math.PI) * (offsetRatio + 0.15 * Math.pow(offsetRatio, 2))

    // Total loss
    const totalLossDb = totalBendLossDb + couplingLossDb
    const outputPowerDbm = inputPowerDbm - totalLossDb
    const outputPowerMicroW = Math.pow(10, outputPowerDbm / 10) * 1000

    return {
      totalBendLossDb: totalBendLossDb.toFixed(2),
      couplingLossDb: couplingLossDb.toFixed(2),
      totalLossDb: totalLossDb.toFixed(2),
      outputPowerDbm: outputPowerDbm.toFixed(2),
      outputPowerMicroW: outputPowerMicroW.toFixed(1)
    }
  }, [bendRadiusMm, numTurns, fiberType, lateralOffsetUm])

  // Generate bending curve points
  const curvePoints = useMemo(() => {
    const pts = []
    const rc = fiberType === 'multimode' ? 18 : 12
    for (let r = 5; r <= 35; r += 1) {
      let loss = 0
      if (r <= rc) {
        loss = 0.15 * Math.exp((rc - r) * 0.35) * numTurns
      } else {
        loss = 0.05 * Math.exp(-(r - rc) * 0.1) * numTurns
      }
      pts.push({ r, loss: Math.min(18, loss) })
    }
    return pts
  }, [fiberType, numTurns])

  const W = 360, H = 130, pad = 30

  const controls = (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-emerald-900 block">Exp 5: Part-A Discrete Hardware Lab</span>
          <span className="text-emerald-700">Duration: 2 Hours • Bloom's Level: L1, L2, L3</span>
        </div>
        <span className="px-2.5 py-1 rounded-md font-mono font-bold bg-emerald-200 text-emerald-800 text-[11px]">
          Fiber Trainer Kit
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Fiber Optic Specification', 'ಫೈಬರ್ ವಿವರಣೆ')}</h3>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFiberType('multimode')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              fiberType === 'multimode' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Multi-Mode (50/125 μm)
          </button>
          <button
            onClick={() => setFiberType('singlemode')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              fiberType === 'singlemode' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Single-Mode (9/125 μm)
          </button>
        </div>

        <LabeledSlider label="Mandrel Bend Radius (R)" value={bendRadiusMm} onChange={setBendRadiusMm} min={5} max={35} step={1} unit=" mm" accentColor="#ef4444" />
        <div className="mt-3">
          <LabeledSlider label="Number of Mandrel Turns" value={numTurns} onChange={setNumTurns} min={1} max={8} step={1} unit=" turns" accentColor="#f59e0b" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Connector Coupling Alignment', 'ಕಪ್ಲಿಂಗ್ ಜೋಡಣೆ')}</h3>
        <LabeledSlider label="Lateral Core Offset (d)" value={lateralOffsetUm} onChange={setLateralOffsetUm} min={0} max={25} step={1} unit=" μm" accentColor="#3b82f6" />

        {/* Optical Telemetry Gauge */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg">
            <span className="text-gray-500 block">Bending Loss</span>
            <span className="text-base font-bold text-rose-700 font-display">{metrics.totalBendLossDb} dB</span>
          </div>
          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg">
            <span className="text-gray-500 block">Coupling Loss</span>
            <span className="text-base font-bold text-blue-700 font-display">{metrics.couplingLossDb} dB</span>
          </div>
          <div className="p-2.5 bg-gray-50 border rounded-lg">
            <span className="text-gray-500 block">Total Insertion Loss</span>
            <span className="text-base font-bold text-gray-800 font-display">{metrics.totalLossDb} dB</span>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
            <span className="text-gray-500 block">Received Power</span>
            <span className="text-base font-bold text-emerald-700 font-display">{metrics.outputPowerMicroW} μW</span>
          </div>
        </div>

        <button
          onClick={() => setShowAR(!showAR)}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
        >
          {showAR ? t('Hide AR Hardware View', 'AR ಮರೆಮಾಡಿ') : t('View Fiber Test Kit in 3D WebAR', 'AR ನಲ್ಲಿ ಆಪ್ಟಿಕಲ್ ಕಿಟ್ ನೋಡಿ')}
        </button>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {showAR && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-gray-800">{t('WebAR Fiber Optic Trainer Kit', 'ಆಪ್ಟಿಕಲ್ ಫೈಬರ್ ಕಿಟ್')}</h3>
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-medium">Optical Bench</span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-900 min-h-[300px]">
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              alt="Optical Fiber Trainer Setup"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '300px' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs"
              >
                Place Optical Bench (AR)
              </button>
            </model-viewer>
          </div>
        </div>
      )}

      {/* Optical Mandrel & Radiation Leakage Raytrace */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">{t('Fiber Curvature & Cladding Radiation Leakage', 'ಬಾಗುವಿಕೆ ವಿಕಿರಣ ಸೋರಿಕೆ')}</h3>
        <svg viewBox="0 0 360 170" className="w-full bg-slate-950 rounded-xl">
          {/* Mandrel Cylinder */}
          <circle cx="180" cy="85" r={bendRadiusMm * 1.8} fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <text x="180" y="89" fill="#94a3b8" fontSize="10" textAnchor="middle">Mandrel R={bendRadiusMm}mm</text>

          {/* Fiber cladding boundary */}
          <path
            d={`M 30 50 L 120 50 A ${bendRadiusMm * 2.2} ${bendRadiusMm * 2.2} 0 0 1 240 50 L 330 50`}
            fill="none"
            stroke="#475569"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Fiber core with red laser ray */}
          <path
            d={`M 30 50 L 120 50 A ${bendRadiusMm * 2.2} ${bendRadiusMm * 2.2} 0 0 1 240 50 L 330 50`}
            fill="none"
            stroke="#ef4444"
            strokeWidth="5"
            strokeLinecap="round"
            className="animate-pulse"
          />

          {/* Radiation leakage modes (escaping arrows) if bend radius is sharp */}
          {bendRadiusMm < 20 && (
            <g opacity={Math.min(1, (20 - bendRadiusMm) / 10)}>
              <line x1="180" y1="50 - bendRadiusMm" x2="180" y2="15" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3,2" />
              <line x1="165" y1="52 - bendRadiusMm" x2="150" y2="18" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3,2" />
              <line x1="195" y1="52 - bendRadiusMm" x2="210" y2="18" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3,2" />
              <text x="180" y="12" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">
                Cladding Mode Radiation Leakage
              </text>
            </g>
          )}

          <text x="35" y="75" fill="#38bdf8" fontSize="9">Pin = 0 dBm</text>
          <text x="325" y="75" fill="#34d399" fontSize="9" textAnchor="end">Pout = {metrics.outputPowerDbm} dBm</text>
        </svg>
      </div>

      {/* Bending Loss Curve Graph */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">{t('Macro-Bending Loss vs Bend Radius', 'ನಷ್ಟದ ಗ್ರಾಫ್')}</h3>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-950 rounded-xl p-1">
          {/* Axes */}
          <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#475569" strokeWidth="1.5" />
          <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#475569" strokeWidth="1.5" />

          <text x={W - pad} y={H - pad + 18} fill="#94a3b8" fontSize="9" textAnchor="end">Bend Radius R (mm)</text>
          <text x={12} y={35} fill="#94a3b8" fontSize="9" transform="rotate(-90 40 35)">Loss (dB)</text>

          {/* Loss Curve */}
          <polyline
            points={curvePoints.map(p => {
              const x = pad + ((p.r - 5) / 30) * (W - 2 * pad)
              const y = H - pad - (p.loss / 18) * (H - 2 * pad)
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#f87171"
            strokeWidth="2.5"
          />

          {/* Operating Point */}
          {(() => {
            const cx = pad + ((bendRadiusMm - 5) / 30) * (W - 2 * pad)
            const cy = H - pad - (Math.min(18, parseFloat(metrics.totalBendLossDb)) / 18) * (H - 2 * pad)
            return (
              <g transform={`translate(${cx}, ${cy})`}>
                <circle cx="0" cy="0" r="5" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
                <text x="8" y="-4" fill="#fbbf24" fontSize="9" fontWeight="bold">
                  ({bendRadiusMm} mm, {metrics.totalBendLossDb} dB)
                </text>
              </g>
            )
          })()}
        </svg>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Coupling & Bending Loss in Optical Fiber', 'ಆಪ್ಟಿಕಲ್ ಫೈಬರ್‌ನಲ್ಲಿ ಕಪ್ಲಿಂಗ್ ಮತ್ತು ಬೆಂಡಿಂಗ್ ನಷ್ಟ')}
      domain="Electronics & Communication"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
