import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Increase Angle of Attack (AoA)', description: 'Pitch nose up toward critical stall margin (α > 15°)' },
  { title: 'Observe Boundary Layer Separation', description: 'Watch airflow detach from upper wing camber surface' },
  { title: 'Trigger Stick Shaker & Audio Horn', description: 'Recognize tactile stall warning cues at stall threshold' },
  { title: 'Execute Standard Recovery', description: 'Reduce AoA (push yoke forward) and advance to TOGA thrust' }
]

const observations = [
  'An aerodynamic stall is caused by exceeding critical Angle of Attack, regardless of pitch attitude or airspeed',
  'Beyond critical AoA, adverse pressure gradients force upper-surface boundary layers to detach, causing lift collapse',
  'Trailing-edge flaps increase camber and effective camber area, raising C_L_max but lowering stall speed',
  'A standard stall recovery requires reducing AoA first (pitch down), followed by leveling wings and advancing thrust',
  'Secondary stalls occur if pilots pull up abruptly before airspeed has adequately recovered above V_ref'
]

export default function StallRecovery() {
  const { t } = useLanguage()
  const [aoa, setAoa] = useState(8) // degrees
  const [airspeedKts, setAirspeedKts] = useState(160) // kts
  const [flaps, setFlaps] = useState('0') // '0', '15', '30'

  const critAoa = flaps === '0' ? 15.5 : flaps === '15' ? 17.0 : 18.2
  const isStalled = aoa >= critAoa
  const isWarning = aoa >= (critAoa - 2.0) && !isStalled

  const aeroData = useMemo(() => {
    // Lift coefficient Cl calculation
    let cl = 0
    if (aoa < critAoa) {
      cl = 0.2 + (aoa * 0.09) + (flaps === '15' ? 0.4 : flaps === '30' ? 0.75 : 0)
    } else {
      // Post-stall lift collapse
      const postStallDrop = (aoa - critAoa) * 0.12
      cl = Math.max(0.3, (0.2 + (critAoa * 0.09) + (flaps === '15' ? 0.4 : 0.75)) - postStallDrop)
    }

    const wingAreaSqFt = 950
    // Dynamic pressure q = 0.5 * rho * V^2 (kts converted to ft/s)
    const vFtS = airspeedKts * 1.68781
    const q = 0.5 * 0.002377 * vFtS * vFtS
    const liftLbs = cl * q * wingAreaSqFt

    return {
      cl: cl.toFixed(2),
      liftLbs: Math.round(liftLbs),
      sinkRateFtMin: isStalled ? Math.round(1800 + (aoa - critAoa) * 350) : 0
    }
  }, [aoa, critAoa, flaps, airspeedKts, isStalled])

  const executeRecovery = () => {
    setAoa(4)
    setAirspeedKts(210)
  }

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🛩️ {t('Aerodynamic Pitch Controls', 'ಏರೋಡೈನಾಮಿಕ್ ನಿಯಂತ್ರಣ')}</h3>
        <LabeledSlider label="Angle of Attack (AoA)" value={aoa} onChange={setAoa} min={-2} max={24} step={0.5} unit="°" accentColor="#ef4444" />
        <div className="mt-3">
          <LabeledSlider label="Indicated Airspeed (IAS)" value={airspeedKts} onChange={setAirspeedKts} min={95} max={260} step={5} unit=" kts" accentColor="#0284c7" />
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700 block mb-2">High-Lift Flap Setting</label>
          <div className="flex gap-2">
            {['0', '15', '30'].map(f => (
              <button
                key={f}
                onClick={() => setFlaps(f)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  flaps === f ? 'bg-sky-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Flaps {f}°
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${
        isStalled ? 'bg-rose-50 border-rose-300' : isWarning ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 uppercase">Stall Protection Status</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
            isStalled ? 'bg-rose-200 text-rose-800 animate-pulse' :
            isWarning ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'
          }`}>
            {isStalled ? '🚨 AERODYNAMIC STALL' : isWarning ? '⚠️ STALL WARNING' : '✅ ATTACHED FLOW'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
          <div className="bg-white/80 p-2 rounded-lg">
            <span className="text-gray-500 block">Lift Coeff (C_L)</span>
            <span className="text-base font-bold font-display text-gray-800">{aeroData.cl}</span>
          </div>
          <div className="bg-white/80 p-2 rounded-lg">
            <span className="text-gray-500 block">Critical AoA (α_crit)</span>
            <span className="text-base font-bold font-display text-rose-600">{critAoa.toFixed(1)}°</span>
          </div>
        </div>

        {isStalled && (
          <div className="mt-3">
            <button
              onClick={executeRecovery}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors animate-bounce"
            >
              ⚡ PUSH YOKE FORWARD (RECOVER STALL)
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* Airfoil Wind Tunnel Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-gray-800">💨 {t('Cambered Airfoil Streamline Smoke Tunnel', 'ಏರ್‌ಫಾಯಿಲ್ ವಿಂಡ್ ಟನಲ್')}</h3>
          <span className="text-xs font-mono text-gray-500">AoA: {aoa}°</span>
        </div>

        <svg viewBox="0 0 350 200" className="w-full bg-slate-900 rounded-xl overflow-hidden">
          <rect width="350" height="200" fill="#0b1120" />

          {/* Incoming Streamlines */}
          {[40, 70, 100, 130, 160].map((y, idx) => (
            <line key={idx} x1="10" y1={y} x2="90" y2={y} stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" strokeDasharray="3,2" />
          ))}

          {/* Rotated Airfoil Group */}
          <g transform={`translate(175, 100) rotate(${-aoa})`}>
            {/* Cambered Airfoil Shape */}
            <path
              d="M -75 0 C -75 -24 -20 -30 75 0 C -15 -8 -70 12 -75 0 Z"
              fill="#e2e8f0"
              stroke="#64748b"
              strokeWidth="2"
            />
            {/* Chord Line */}
            <line x1="-75" y1="0" x2="75" y2="0" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />

            {/* Separated Flow Vortices when stalled */}
            {isStalled ? (
              <g>
                <circle cx="-10" cy="-40" r="10" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="2,2" />
                <circle cx="25" cy="-45" r="14" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="2,2" />
                <circle cx="60" cy="-48" r="18" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="2,2" />
                <text x="30" y="-70" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">
                  SEPARATED TURBULENT WAKE
                </text>
              </g>
            ) : (
              /* Smooth laminar airflow line */
              <path
                d="M -90 -5 C -75 -35 0 -40 90 -5"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                opacity="0.8"
              />
            )}
          </g>

          <text x="12" y="24" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
            NACA 2412 Section • Alpha: {aoa}° • Flow: {isStalled ? 'Vortex Stall' : 'Attached Laminar'}
          </text>
        </svg>
      </div>

      {/* Lift Coefficient Curve */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📈 {t('Lift Coefficient (C_L) vs Alpha Polar', 'ಲಿಫ್ಟ್ ಕೋಎಫಿಷಿಯೆಂಟ್ ಗ್ರಾಫ್')}</h3>
        <svg viewBox="0 0 350 160" className="w-full bg-slate-900 rounded-xl p-2">
          {/* Axes */}
          <line x1="45" y1="130" x2="330" y2="130" stroke="#475569" strokeWidth="1.5" />
          <line x1="45" y1="20" x2="45" y2="130" stroke="#475569" strokeWidth="1.5" />

          <text x="325" y="145" fill="#94a3b8" fontSize="9" textAnchor="end">Angle of Attack α (°)</text>
          <text x="12" y="30" fill="#94a3b8" fontSize="9" transform="rotate(-90 40 30)">Lift (C_L)</text>

          {/* Lift curve line */}
          <path
            d="M 45 115 L 210 35 Q 240 35 260 70 T 320 100"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />

          {/* Stall Point Vertical Line */}
          <line x1="220" y1="20" x2="220" y2="130" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
          <text x="220" y="15" fill="#f87171" fontSize="9" textAnchor="middle">α_crit ({critAoa}°)</text>

          {/* Operating Point on Curve */}
          {(() => {
            const cx = 45 + ((aoa + 2) / 26) * 275
            const cy = 130 - (parseFloat(aeroData.cl) / 2.2) * 105
            const clampedCx = Math.max(45, Math.min(320, cx))
            const clampedCy = Math.max(25, Math.min(130, cy))

            return (
              <g transform={`translate(${clampedCx}, ${clampedCy})`}>
                <circle cx="0" cy="0" r="6" fill={isStalled ? '#ef4444' : '#10b981'} stroke="#ffffff" strokeWidth="2" />
                <text x="8" y="-4" fill={isStalled ? '#f87171' : '#6ee7b7'} fontSize="9" fontWeight="bold">
                  ({aoa}°, C_L {aeroData.cl})
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
      title={t('Aerodynamic Stall & Recovery Dynamics', 'ಏರೋಡೈನಾಮಿಕ್ ಸ್ಟಾಲ್ ಮತ್ತು ರಿಕವರಿ')}
      domain="Aerospace & Flight Systems"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
