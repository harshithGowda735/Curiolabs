import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Climb Through Flight Levels', description: 'Scale altitude from sea level up to FL430 cruise flight ceiling' },
  { title: 'Set Aircraft Mach Number', description: 'Vary flight speed from high-lift climb (0.35M) to high-speed cruise (0.82M)' },
  { title: 'Adjust Throttle Setting (N1)', description: 'Modulate turbofan spool speed and core turbine temperatures' },
  { title: 'Analyze Thrust Lapse & SFC', description: 'Observe the thermodynamic efficiency sweet-spot at high altitudes' }
]

const observations = [
  'Air density decreases exponentially with altitude, reducing mass flow rate through the engine core and bypass duct',
  'Turbofan net thrust lapses according to density ratio: F_n ≈ F_sea · (ρ / ρ₀)^0.8',
  'Thrust Specific Fuel Consumption (TSFC) improves at high altitudes due to lower ambient intake temperatures (T₀ = -56.5°C at tropopause)',
  'Ram pressure recovery at high Mach numbers partially compensates for thinner air density at cruising altitudes',
  'High bypass ratio turbofans (BPR > 8:1) achieve superior propulsive efficiency for long-haul subsonic airliners'
]

export default function ThrustAltitude() {
  const { t } = useLanguage()
  const [altitudeFt, setAltitudeFt] = useState(32000) // ft
  const [mach, setMach] = useState(0.78)
  const [n1Throttle, setN1Throttle] = useState(90) // %

  const aeroMath = useMemo(() => {
    // ISA Standard Atmosphere Model
    let tempK = 288.15 - 0.0019812 * altitudeFt
    if (altitudeFt > 36089) tempK = 216.65 // Tropopause isothermal layer

    const tempC = tempK - 273.15
    const pressurePa = 101325 * Math.pow(Math.max(0.1, 1 - 0.0000068756 * Math.min(36089, altitudeFt)), 5.2559)
    const rho = pressurePa / (287.05 * tempK) // kg/m3
    const rhoRatio = rho / 1.225

    // Speed of sound
    const speedOfSoundKts = Math.sqrt(1.4 * 287.05 * tempK) * 1.94384
    const tasKts = mach * speedOfSoundKts

    // Sea-level max rated thrust (CFM LEAP class ~ 30,000 lbf)
    const baseThrustLbf = 31000
    const throttleFactor = Math.pow(n1Throttle / 100, 2.2)

    // Ram effect compensation factor
    const ramFactor = 1 + 0.3 * Math.pow(mach, 2)
    const netThrustLbf = baseThrustLbf * Math.pow(rhoRatio, 0.8) * ramFactor * throttleFactor

    // TSFC (Thrust Specific Fuel Consumption in lb/lbf-hr)
    const tsfc = (0.52 + 0.12 * mach) * Math.sqrt(tempK / 288.15)
    const fuelFlowLbsHr = netThrustLbf * tsfc

    return {
      tempC: tempC.toFixed(1),
      rho: rho.toFixed(3),
      rhoRatio: (rhoRatio * 100).toFixed(1),
      tasKts: Math.round(tasKts),
      netThrustLbf: Math.round(netThrustLbf),
      tsfc: tsfc.toFixed(3),
      fuelFlowLbsHr: Math.round(fuelFlowLbsHr)
    }
  }, [altitudeFt, mach, n1Throttle])

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🏔️ {t('Flight Envelope Environment', 'ಹಾರಾಟದ ಎತ್ತರ')}</h3>
        <LabeledSlider label="Cruising Altitude" value={altitudeFt} onChange={setAltitudeFt} min={0} max={43000} step={1000} unit=" ft" accentColor="#0284c7" />
        <div className="mt-3">
          <LabeledSlider label="Aircraft Mach Number" value={mach} onChange={setMach} min={0.25} max={0.86} step={0.01} unit=" M" accentColor="#3b82f6" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🔥 {t('Turbofan Engine Throttle', 'ಎಂಜಿನ್ ಥ್ರೊಟಲ್')}</h3>
        <LabeledSlider label="N1 Fan Spool Speed" value={n1Throttle} onChange={setN1Throttle} min={50} max={100} step={1} unit=" %" accentColor="#f59e0b" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">⚡ {t('Propulsion Performance Readout', 'ಪ್ರೊಪಲ್ಷನ್ ಕಾರ್ಯಕ್ಷಮತೆ')}</h3>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-sky-50 p-2.5 rounded-lg border border-sky-100">
            <span className="text-gray-500 block">Net Available Thrust</span>
            <span className="text-base font-bold text-sky-800 font-display">{aeroMath.netThrustLbf.toLocaleString()} lbf</span>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
            <span className="text-gray-500 block">Total Fuel Flow</span>
            <span className="text-base font-bold text-amber-800 font-display">{aeroMath.fuelFlowLbsHr.toLocaleString()} lb/hr</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg border">
            <span className="text-gray-500 block">Air Density (ρ)</span>
            <span className="text-sm font-bold text-gray-800 font-display">{aeroMath.rho} kg/m³ ({aeroMath.rhoRatio}%)</span>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg border">
            <span className="text-gray-500 block">Ambient Temp</span>
            <span className="text-sm font-bold text-cyan-700 font-display">{aeroMath.tempC}°C</span>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* Turbofan Schematic SVG */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">🚀 {t('High-Bypass Turbofan Cutaway', 'ಟರ್ಬೋಫ್ಯಾನ್ ಕಟವೇ')}</h3>
        <svg viewBox="0 0 350 160" className="w-full bg-slate-900 rounded-xl p-2">
          {/* Engine Nacelle Cowling */}
          <path d="M 30 35 Q 120 20 280 35 L 290 55 L 140 55 L 140 105 L 290 105 L 280 125 Q 120 140 30 125 Z" fill="#334155" stroke="#64748b" strokeWidth="2" />
          
          {/* Core Engine Body */}
          <path d="M 90 60 L 260 65 L 320 75 L 320 85 L 260 95 L 90 100 Z" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />

          {/* Large Front Fan Blades */}
          <g transform="translate(60, 80)">
            <ellipse cx="0" cy="0" rx="8" ry="42" fill="#38bdf8" />
            <ellipse cx="0" cy="0" rx="4" ry="28" fill="#bae6fd" />
            {/* Spinning hub spinner cone */}
            <polygon points="-8,0 12,-8 12,8" fill="#ffffff" />
          </g>

          {/* Core Combustion Glow */}
          <ellipse cx="180" cy="80" rx="28" ry="12" fill="#ef4444" opacity={n1Throttle / 120} />
          <ellipse cx="180" cy="80" rx="16" ry="7" fill="#fbbf24" opacity={n1Throttle / 100} />

          {/* Jet Exhaust Plume */}
          <polygon
            points={`320,75 ${320 + (n1Throttle * 0.4)},70 ${320 + (n1Throttle * 0.4)},90 320,85`}
            fill="url(#exhaustGlow)"
            opacity="0.85"
          />

          <defs>
            <linearGradient id="exhaustGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
          </defs>

          <text x="60" y="148" fill="#94a3b8" fontSize="9" textAnchor="middle">Fan Stage</text>
          <text x="180" y="148" fill="#94a3b8" fontSize="9" textAnchor="middle">Combustion Core</text>
          <text x="310" y="148" fill="#94a3b8" fontSize="9" textAnchor="middle">Exhaust Nozzle</text>
        </svg>
      </div>

      {/* Thrust Lapse Curve with Altitude */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📉 {t('Thrust Lapse vs Altitude Profile', 'ಥ್ರಸ್ಟ್ ಲ್ಯಾಪ್ಸ್ ಪ್ರೊಫೈಲ್')}</h3>
        <svg viewBox="0 0 350 160" className="w-full bg-slate-900 rounded-xl p-2">
          {/* Axis */}
          <line x1="45" y1="125" x2="330" y2="125" stroke="#475569" strokeWidth="1.5" />
          <line x1="45" y1="20" x2="45" y2="125" stroke="#475569" strokeWidth="1.5" />

          <text x="325" y="140" fill="#94a3b8" fontSize="9" textAnchor="end">Altitude (ft)</text>
          <text x="12" y="30" fill="#94a3b8" fontSize="9" transform="rotate(-90 40 30)">Thrust (lbf)</text>

          {/* Thrust Curve from 0 to 45,000 ft */}
          <path
            d="M 45 35 Q 120 70 200 95 T 320 115"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />

          {/* Operating Point */}
          {(() => {
            const cx = 45 + (altitudeFt / 45000) * 275
            const cy = 35 + (altitudeFt / 45000) * 80
            return (
              <g transform={`translate(${cx}, ${cy})`}>
                <circle cx="0" cy="0" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x="8" y="-4" fill="#fbbf24" fontSize="9" fontWeight="bold">
                  FL{Math.round(altitudeFt / 100)} ({aeroMath.netThrustLbf} lbf)
                </text>
              </g>
            )
          })()}

          <text x="50" y="30" fill="#38bdf8" fontSize="9">Sea-Level: ~28,000 lbf</text>
          <text x="315" y="110" fill="#94a3b8" fontSize="9" textAnchor="end">FL430: ~6,500 lbf</text>
        </svg>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Turbofan Thrust Lapse vs Altitude', 'ಟರ್ಬೋಫ್ಯಾನ್ ಥ್ರಸ್ಟ್ ಮತ್ತು ಎತ್ತರ ಸಂಬಂಧ')}
      domain="Aerospace & Flight Systems"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
