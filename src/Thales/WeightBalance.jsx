import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Load Passenger Cabins', description: 'Distribute passenger headcount between forward and aft seating zones' },
  { title: 'Fill Cargo Holds', description: 'Allocate baggage between forward and aft lower cargo compartments' },
  { title: 'Adjust Fuel Uplift', description: 'Set wing fuel load for planned flight sector' },
  { title: 'Verify CG Envelope', description: 'Ensure gross weight and CG % MAC reside strictly inside safety margins' }
]

const observations = [
  'Center of Gravity (CG) is calculated as: CG = Total Moment / Gross Weight',
  'Exceeding the aft CG limit reduces elevator authority, leading to pitch instability and unrecoverable stalls',
  'Exceeding the forward CG limit requires excessive nose-up elevator trim, increasing drag and preventing rotation',
  '% MAC (Mean Aerodynamic Chord) normalizes CG position relative to the wing chord: % MAC = (CG - LEMAC) / MAC',
  'Fuel burn during cruise shifts CG dynamically, requiring fuel transfer trim systems in modern airliners'
]

export default function WeightBalance() {
  const { t } = useLanguage()
  const [fwdPax, setFwdPax] = useState(25) // count
  const [aftPax, setAftPax] = useState(30) // count
  const [fwdCargo, setFwdCargo] = useState(1500) // lbs
  const [aftCargo, setAftCargo] = useState(1800) // lbs
  const [fuelLbs, setFuelLbs] = useState(10000) // lbs

  // Aircraft station geometry constants (Regional Jet)
  const emptyWeight = 38000 // lbs
  const emptyArm = 540 // inches from datum
  const paxWeight = 180 // lbs/person avg
  const fwdPaxArm = 440
  const aftPaxArm = 660
  const fwdCargoArm = 380
  const aftCargoArm = 720
  const fuelArm = 550

  const lemac = 510 // Leading Edge Mean Aerodynamic Chord
  const macLength = 120 // Chord length

  const wbResult = useMemo(() => {
    const wFwdPax = fwdPax * paxWeight
    const wAftPax = aftPax * paxWeight

    const grossWeight = emptyWeight + wFwdPax + wAftPax + fwdCargo + aftCargo + fuelLbs
    const totalMoment = (
      (emptyWeight * emptyArm) +
      (wFwdPax * fwdPaxArm) +
      (wAftPax * aftPaxArm) +
      (fwdCargo * fwdCargoArm) +
      (aftCargo * aftCargoArm) +
      (fuelLbs * fuelArm)
    )

    const cgArm = totalMoment / grossWeight
    const pctMac = ((cgArm - lemac) / macLength) * 100

    // Envelope boundaries
    const maxGrossWeight = 62000 // lbs
    const fwdLimitPct = 16 // % MAC
    const aftLimitPct = 34 // % MAC

    const isWeightOk = grossWeight <= maxGrossWeight
    const isCgOk = pctMac >= fwdLimitPct && pctMac <= aftLimitPct
    const isSafe = isWeightOk && isCgOk

    return {
      grossWeight,
      cgArm,
      pctMac,
      isWeightOk,
      isCgOk,
      isSafe
    }
  }, [fwdPax, aftPax, fwdCargo, aftCargo, fuelLbs])

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">👥 {t('Passenger Loading (180 lbs/pax)', 'ಪ್ರಯಾಣಿಕರ ಲೋಡಿಂಗ್')}</h3>
        <LabeledSlider label="Forward Cabin Pax" value={fwdPax} onChange={setFwdPax} min={0} max={45} step={1} unit=" pax" accentColor="#0284c7" />
        <div className="mt-3">
          <LabeledSlider label="Aft Cabin Pax" value={aftPax} onChange={setAftPax} min={0} max={45} step={1} unit=" pax" accentColor="#0284c7" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📦 {t('Cargo Compartments', 'ಕಾರ್ಗೋ ವಿಭಾಗಗಳು')}</h3>
        <LabeledSlider label="Forward Cargo Bay" value={fwdCargo} onChange={setFwdCargo} min={0} max={3000} step={100} unit=" lbs" accentColor="#10b981" />
        <div className="mt-3">
          <LabeledSlider label="Aft Cargo Bay" value={aftCargo} onChange={setAftCargo} min={0} max={3000} step={100} unit=" lbs" accentColor="#10b981" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">⛽ {t('Fuel Tank Uplift', 'ಇಂಧನ ಲೋಡ್')}</h3>
        <LabeledSlider label="Wing Tanks Fuel" value={fuelLbs} onChange={setFuelLbs} min={2000} max={16000} step={500} unit=" lbs" accentColor="#f59e0b" />
      </div>

      <div className={`p-4 rounded-xl border ${wbResult.isSafe ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-300'}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 uppercase">Trim Sheet Status</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${wbResult.isSafe ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800 animate-pulse'}`}>
            {wbResult.isSafe ? 'CLEAR FOR TAKEOFF' : 'OUT OF ENVELOPE'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
          <div className="bg-white/80 p-2 rounded-lg">
            <span className="text-gray-500 block">Gross Weight</span>
            <span className={`text-base font-bold font-display ${wbResult.isWeightOk ? 'text-gray-800' : 'text-rose-600'}`}>
              {wbResult.grossWeight.toLocaleString()} lbs
            </span>
          </div>
          <div className="bg-white/80 p-2 rounded-lg">
            <span className="text-gray-500 block">CG Position</span>
            <span className={`text-base font-bold font-display ${wbResult.isCgOk ? 'text-sky-700' : 'text-rose-600'}`}>
              {wbResult.pctMac.toFixed(1)}% MAC
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* Center of Gravity Envelope Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-gray-800">📊 {t('Certified Flight CG Envelope Polygon', 'CG ಎನ್ವೆಲಪ್ ಪಾಲಿಗಾನ್')}</h3>
          <span className="text-xs text-gray-500 font-mono">Limits: 16% - 34% MAC | MTOW: 62,000 lbs</span>
        </div>

        <svg viewBox="0 0 350 220" className="w-full bg-slate-900 rounded-xl p-2">
          {/* Axis grid */}
          <line x1="50" y1="180" x2="330" y2="180" stroke="#334155" strokeWidth="1.5" />
          <line x1="50" y1="20" x2="50" y2="180" stroke="#334155" strokeWidth="1.5" />

          {/* Labels */}
          <text x="190" y="205" fill="#94a3b8" fontSize="9" textAnchor="middle">Center of Gravity (% MAC)</text>
          <text x="12" y="100" fill="#94a3b8" fontSize="9" transform="rotate(-90 40 100)">Weight (lbs)</text>

          {/* Grid lines */}
          <line x1="120" y1="20" x2="120" y2="180" stroke="#1e293b" strokeDasharray="3,3" />
          <line x1="260" y1="20" x2="260" y2="180" stroke="#1e293b" strokeDasharray="3,3" />
          <text x="120" y="193" fill="#64748b" fontSize="8" textAnchor="middle">16%</text>
          <text x="260" y="193" fill="#64748b" fontSize="8" textAnchor="middle">34%</text>

          {/* Safe CG Polygon (16% to 34% MAC, 38,000 to 62,000 lbs) */}
          <polygon
            points="120,170 120,50 260,50 260,170"
            fill="#0284c7"
            fillOpacity="0.15"
            stroke="#38bdf8"
            strokeWidth="2"
          />

          {/* MTOW line */}
          <line x1="50" y1="50" x2="330" y2="50" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" />
          <text x="325" y="45" fill="#f87171" fontSize="8" textAnchor="end">MTOW 62k lbs</text>

          {/* Current Operating Dot */}
          {/* Map %MAC (10% to 40%) -> (50 to 330) */}
          {/* Map Weight (35k to 65k) -> (180 to 20) */}
          {(() => {
            const cx = 50 + ((wbResult.pctMac - 10) / 30) * 280
            const cy = 180 - ((wbResult.grossWeight - 35000) / 30000) * 160
            const clampedCx = Math.max(50, Math.min(330, cx))
            const clampedCy = Math.max(20, Math.min(180, cy))

            return (
              <g transform={`translate(${clampedCx}, ${clampedCy})`}>
                <circle cx="0" cy="0" r="7" fill={wbResult.isSafe ? '#10b981' : '#ef4444'} stroke="#ffffff" strokeWidth="2" />
                <text x="10" y="4" fill="#ffffff" fontSize="9" fontWeight="bold">
                  {wbResult.pctMac.toFixed(1)}% ({Math.round(wbResult.grossWeight / 1000)}k)
                </text>
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Aircraft Fuselage Loading Diagram */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">✈️ {t('Station Arm Distribution Breakdown', 'ವಿಮಾನ ನಿಲ್ದಾಣ ವಿತರಣೆ')}</h3>
        <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300">
          <div className="flex justify-between border-b border-slate-800 pb-1.5 mb-1.5 text-[11px] font-semibold text-sky-400">
            <span>Station Component</span>
            <span>Arm (in)</span>
            <span>Weight (lbs)</span>
          </div>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between"><span>Empty Airframe</span><span>540"</span><span>38,000</span></div>
            <div className="flex justify-between"><span>Fwd Passengers</span><span>440"</span><span>{fwdPax * paxWeight}</span></div>
            <div className="flex justify-between"><span>Aft Passengers</span><span>660"</span><span>{aftPax * paxWeight}</span></div>
            <div className="flex justify-between"><span>Fwd Cargo Hold</span><span>380"</span><span>{fwdCargo}</span></div>
            <div className="flex justify-between"><span>Aft Cargo Hold</span><span>720"</span><span>{aftCargo}</span></div>
            <div className="flex justify-between"><span>Wing Fuel Uplift</span><span>550"</span><span>{fuelLbs}</span></div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Aircraft Weight, Balance & CG Envelope', 'ವಿಮಾನ ತೂಕ ಮತ್ತು ಸಮತೋಲನ (CG ಎನ್ವೆಲಪ್)')}
      domain="Aerospace & Flight Systems"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
