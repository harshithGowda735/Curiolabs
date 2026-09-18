import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import ApparatusSetup from '../components/ApparatusSetup'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  FlaskConical, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  Droplet
} from 'lucide-react'

const steps = [
  { title: 'Assemble Titration Apparatus', description: 'Position the retort stand, white tile, conical flask, burette, indicator dropper, and pH probe.' },
  { title: 'Fill Burette with Titrant', description: 'Load 50 mL of standardized 0.1 M NaOH solution into the burette.' },
  { title: 'Add Analyte & Indicator', description: 'Pipette 50 mL of 0.1 M HCl into the conical flask with 2-3 drops of phenolphthalein.' },
  { title: 'Perform Titration', description: 'Turn the burette stopcock to add NaOH incrementally while observing pH and color changes.' },
  { title: 'Identify Equivalence Point', description: 'Detect the sharp inflection on the titration S-curve where moles of acid equal moles of base.' }
]

const observations = [
  'At equivalence point, moles of acid = moles of base (50 mL of 0.1M NaOH neutralizes 50 mL of 0.1M HCl)',
  'The pH curve shows a steep sigmoid S-shape near equivalence (inflection from pH 3 to 11)',
  'Phenolphthalein indicator transitions from colorless to persistent faint pink between pH 8.2 and 10.0',
  'Strong acid (HCl) + strong base (NaOH) neutralizes completely with stoichiometric equivalence at pH 7.0',
  'Buffer capacity is lowest at the equivalence point, causing a drastic pH jump with a single drop'
]

// Custom Glassware Icons for the Apparatus Tray
const StandIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-slate-700 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="28" x2="26" y2="28" strokeWidth="3" />
    <line x1="10" y1="28" x2="10" y2="4" />
    <line x1="10" y1="10" x2="20" y2="10" />
    <circle cx="20" cy="10" r="2" fill="#475569" />
  </svg>
)

const TileIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-slate-400 fill-slate-100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="20" width="20" height="8" rx="2" />
  </svg>
)

const FlaskIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-pink-500 fill-pink-50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 5h6M14 5v6L7 24a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3L18 11V5" />
    <line x1="10" y1="20" x2="22" y2="20" stroke="#f472b6" />
  </svg>
)

const BuretteIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-sky-600 fill-sky-50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="13" y="4" width="6" height="20" rx="1" />
    <polygon points="13 24 19 24 16 28" fill="#0284c7" />
    <line x1="10" y1="23" x2="22" y2="23" stroke="#475569" strokeWidth="2" />
  </svg>
)

const DropperIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-rose-600 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6c0-2 2-3 4-3s4 1 4 3v4h-8V6z" fill="#f43f5e" />
    <path d="M13 10v12l3 6 3-6V10" />
    <circle cx="16" cy="30" r="1.5" fill="#f43f5e" />
  </svg>
)

const ProbeIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-emerald-600 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="14" y="4" width="4" height="20" rx="1" fill="#10b981" />
    <circle cx="16" cy="26" r="3" fill="#059669" />
    <path d="M16 4V2M14 2h4" />
  </svg>
)

const APPARATUS_ITEMS = [
  { id: 'stand', name: 'Burette Stand', icon: <StandIcon /> },
  { id: 'tile', name: 'White Tile', icon: <TileIcon /> },
  { id: 'flask', name: 'Conical Flask', icon: <FlaskIcon /> },
  { id: 'burette', name: '50mL Burette', icon: <BuretteIcon /> },
  { id: 'dropper', name: 'Indicator Dropper', icon: <DropperIcon /> },
  { id: 'probe', name: 'pH Probe', icon: <ProbeIcon /> }
]

export default function AcidBaseTitration() {
  const { t } = useLanguage()
  const [volumeNaOH, setVolumeNaOH] = useState(0) // mL added
  const [dataPoints, setDataPoints] = useState([])
  const [isStarted, setIsStarted] = useState(false)
  const [placedItems, setPlacedItems] = useState({})

  // Target slots on virtual laboratory bench
  const targets = [
    {
      id: 'target_stand',
      accepts: 'stand',
      label: 'retort stand',
      x: '30%',
      y: '50%',
      width: '70px',
      height: '180px',
      className: 'border-2 border-dashed border-slate-300 bg-slate-100/50 hover:bg-slate-100/80',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <StandIcon />
          <span className="text-[10px] font-bold text-slate-800 mt-1">Retort Stand</span>
        </div>
      )
    },
    {
      id: 'target_burette',
      accepts: 'burette',
      label: 'burette clamp',
      x: '52%',
      y: '30%',
      width: '60px',
      height: '120px',
      className: 'border-2 border-dashed border-sky-300 bg-sky-100/50 hover:bg-sky-100/80',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <BuretteIcon />
          <span className="text-[10px] font-bold text-sky-800">50mL Burette</span>
          {isStarted && <span className="text-[9px] text-sky-600 font-mono">{(50 - volumeNaOH).toFixed(1)} mL</span>}
        </div>
      )
    },
    {
      id: 'target_tile',
      accepts: 'tile',
      label: 'white tile',
      x: '52%',
      y: '85%',
      width: '90px',
      height: '42px',
      className: 'border-2 border-dashed border-slate-300 bg-white/70 hover:bg-white',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <TileIcon />
          <span className="text-[9px] font-bold text-slate-600">Base Tile</span>
        </div>
      )
    },
    {
      id: 'target_flask',
      accepts: 'flask',
      label: 'conical flask',
      x: '52%',
      y: '65%',
      width: '84px',
      height: '84px',
      className: 'border-2 border-dashed border-pink-300 bg-pink-100/50 hover:bg-pink-100/80',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <FlaskIcon />
          <span className="text-[10px] font-bold text-pink-800">HCl Analyte</span>
          {isStarted && (
            <span
              className="w-3 h-3 rounded-full mt-0.5 border"
              style={{ backgroundColor: indicatorColor }}
              title="Solution color"
            />
          )}
        </div>
      )
    },
    {
      id: 'target_dropper',
      accepts: 'dropper',
      label: 'indicator',
      x: '78%',
      y: '42%',
      width: '68px',
      height: '76px',
      className: 'border-2 border-dashed border-rose-300 bg-rose-100/50 hover:bg-rose-100/80',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <DropperIcon />
          <span className="text-[10px] font-bold text-rose-800">Phenolphthalein</span>
        </div>
      )
    },
    {
      id: 'target_probe',
      accepts: 'probe',
      label: 'pH probe',
      x: '78%',
      y: '70%',
      width: '64px',
      height: '88px',
      className: 'border-2 border-dashed border-emerald-300 bg-emerald-100/50 hover:bg-emerald-100/80',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <ProbeIcon />
          <span className="text-[10px] font-bold text-emerald-800">pH {pH.toFixed(2)}</span>
        </div>
      )
    }
  ]

  const handlePlace = (targetId, itemId) => {
    setPlacedItems(prev => ({ ...prev, [targetId]: itemId }))
  }

  const handleRemove = (targetId) => {
    setPlacedItems(prev => {
      const next = { ...prev }
      delete next[targetId]
      return next
    })
    setIsStarted(false)
  }

  const handleReset = () => {
    setPlacedItems({})
    setIsStarted(false)
    setVolumeNaOH(0)
    setDataPoints([])
  }

  // Titration chemical equilibrium calculation
  const cHCl = 0.1, vHCl = 50, cNaOH = 0.1
  const totalVol = vHCl + volumeNaOH

  const pH = useMemo(() => {
    const molesHCl = (cHCl * vHCl) / 1000
    const molesNaOH = (cNaOH * volumeNaOH) / 1000
    const excess = molesHCl - molesNaOH
    const totalL = totalVol / 1000

    if (excess > 0.0001) {
      const concH = excess / totalL
      return Math.max(1.0, -Math.log10(concH))
    } else if (excess < -0.0001) {
      const concOH = Math.abs(excess) / totalL
      const pOH = -Math.log10(concOH)
      return Math.min(13.0, 14 - pOH)
    } else {
      return 7.0 // Equivalence
    }
  }, [volumeNaOH, totalVol])

  const indicatorColor = pH < 8.2 ? '#f8fafc' : pH < 10 ? `rgba(244, 63, 94, ${(pH - 8.2) / 1.8})` : '#f43f5e'
  const isEquivalence = Math.abs(volumeNaOH - 50) < 1.0

  const addReading = () => {
    setDataPoints(prev => [...prev, { vol: volumeNaOH, ph: parseFloat(pH.toFixed(2)) }])
  }

  const graphW = 380, graphH = 200, pad = 35
  const sx = (v) => pad + (v / 80) * (graphW - 2 * pad)
  const sy = (p) => graphH - pad - (p / 14) * (graphH - 2 * pad)

  // Theoretical pH curve
  const theoryCurve = useMemo(() => {
    const pts = []
    for (let v = 0; v <= 80; v += 1) {
      const molesH = (cHCl * vHCl) / 1000 - (cNaOH * v) / 1000
      const totL = (vHCl + v) / 1000
      let p
      if (molesH > 0.0001) p = -Math.log10(molesH / totL)
      else if (molesH < -0.0001) p = 14 + Math.log10(Math.abs(molesH) / totL)
      else p = 7.0
      pts.push({ v, p: Math.max(1, Math.min(13, p)) })
    }
    return pts
  }, [])

  // Controls Panel
  const controls = (
    <div className="space-y-4">
      {/* Drag & Drop Apparatus Setup */}
      <ApparatusSetup
        title="Setup Your Apparatus"
        apparatusList={APPARATUS_ITEMS}
        targets={targets}
        placedItems={placedItems}
        onPlace={handlePlace}
        onRemove={handleRemove}
        onReset={handleReset}
        onStart={() => setIsStarted(!isStarted)}
        isStarted={isStarted}
        startLabel="Start Titration"
        hint="Drag burette stand, white tile, flask, burette, dropper & pH probe into place."
      />

      {/* Titration Stopcock Controls (Active when experiment is started) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Droplet size={15} className="text-pink-500" />
            <span>Burette Stopcock Dispenser (0.1M NaOH)</span>
          </h4>
          {isStarted && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              isEquivalence 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {isEquivalence ? 'Equivalence Reached!' : `${volumeNaOH} mL Added`}
            </span>
          )}
        </div>

        <LabeledSlider
          label="Volume of 0.1 M NaOH Added"
          value={volumeNaOH}
          onChange={setVolumeNaOH}
          min={0}
          max={80}
          step={0.5}
          unit=" mL"
          accentColor="#ec4899"
          disabled={!isStarted}
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={addReading}
            disabled={!isStarted}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isStarted
                ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-sm cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Record Data Point</span>
          </button>
          <button
            onClick={() => setVolumeNaOH(50)}
            disabled={!isStarted}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            title="Snap to 50mL Equivalence"
          >
            Jump to 50mL
          </button>
        </div>
      </div>
    </div>
  )

  // Visualization Panel Matching Clean Screenshot Design
  const visualization = (
    <div className="space-y-4">
      {/* Top Card: Live Solution & pH Telemetry */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm min-h-[140px] flex flex-col justify-center">
        {!isStarted ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-center">
            <Activity size={24} className="mb-2 text-slate-300" />
            <p className="text-sm font-medium">No data to display. Start the experiment to see the graph.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900">Analyte Solution State</h4>
              <span className="text-xs font-mono text-slate-500">Total Volume: {totalVol.toFixed(1)} mL</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl">
                <span className="text-xs text-pink-700 font-medium block">Measured pH</span>
                <span className="text-2xl font-bold text-pink-900 font-display">{pH.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs text-slate-600 font-medium block">Indicator Hue</span>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                    style={{ backgroundColor: indicatorColor }}
                  />
                  <span className="text-xs font-bold text-slate-800">
                    {pH < 8.2 ? 'Colorless' : pH < 10 ? 'Pale Pink' : 'Vivid Pink'}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-xs text-emerald-700 font-medium block">Reaction Stage</span>
                <span className="text-xs font-bold text-emerald-900 block mt-1">
                  {volumeNaOH < 48 ? 'Excess Acid (HCl)' : isEquivalence ? 'Neutral (NaCl)' : 'Excess Base (NaOH)'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Middle Card: Titration S-Curve Graph */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm min-h-[260px]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              pH Titration Curve (0.1M HCl vs 0.1M NaOH)
            </h4>
            <p className="text-xs text-slate-500">Real-time S-shaped inflection curve vs added volume of titrant.</p>
          </div>
          {isStarted && (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Ve = 50.0 mL
            </span>
          )}
        </div>

        {!isStarted ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400 text-center">
            <p className="text-sm font-medium">No data to display. Start the experiment to see the rate graph.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg viewBox={`0 0 ${graphW} ${graphH}`} className="w-full bg-slate-950 rounded-xl shadow-inner p-1">
              {/* Axes */}
              <line x1={pad} y1={graphH - pad} x2={graphW - pad} y2={graphH - pad} stroke="#334155" strokeWidth="1.5" />
              <line x1={pad} y1={pad} x2={pad} y2={graphH - pad} stroke="#334155" strokeWidth="1.5" />

              {/* Equivalence Guideline (50mL) */}
              <line x1={sx(50)} y1={pad} x2={sx(50)} y2={graphH - pad} stroke="#f43f5e" strokeDasharray="3,3" strokeWidth="1" />
              {/* Neutral pH 7 Guideline */}
              <line x1={pad} y1={sy(7)} x2={graphW - pad} y2={sy(7)} stroke="#10b981" strokeDasharray="3,3" strokeWidth="1" />

              <text x={graphW - pad} y={graphH - pad + 15} fill="#94a3b8" fontSize="9" textAnchor="end">NaOH Volume (mL)</text>
              <text x={12} y={25} fill="#94a3b8" fontSize="9" transform="rotate(-90 25 25)">pH Scale</text>

              {/* Theoretical Titration S-Curve */}
              <polyline
                points={theoryCurve.map(pt => `${sx(pt.v)},${sy(pt.p)}`).join(' ')}
                fill="none"
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />

              {/* Active Titration Trace */}
              {(() => {
                const activePts = theoryCurve.filter(pt => pt.v <= volumeNaOH)
                if (activePts.length < 2) return null
                return (
                  <polyline
                    points={activePts.map(pt => `${sx(pt.v)},${sy(pt.p)}`).join(' ')}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2.5"
                  />
                )
              })()}

              {/* Current Operating Point */}
              <circle cx={sx(volumeNaOH)} cy={sy(pH)} r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />

              {/* Recorded Data Points */}
              {dataPoints.map((pt, i) => (
                <circle key={i} cx={sx(pt.vol)} cy={sy(pt.ph)} r="3" fill="#38bdf8" />
              ))}
            </svg>

            <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-1">
              <span>0 mL (pH 1.0)</span>
              <span className="text-emerald-600 font-bold">Equivalence: 50.0 mL (pH 7.0)</span>
              <span>80 mL (pH 12.5)</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Card: Key Observations */}
      <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-5 shadow-sm">
        <h4 className="text-base font-bold text-purple-900 mb-2.5 flex items-center gap-2">
          <span>Key Observations</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-purple-950/80 list-disc list-inside leading-relaxed">
          {observations.map((obs, i) => (
            <li key={i}>{obs}</li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Acid-Base Neutralization Titration', 'ಆಮ್ಲ-ಪ್ರತ್ಯಾಮ್ಲ ಟೈಟ್ರೇಶನ್')}
      subject="Chemistry"
      accentColor="pink"
      gradientFrom="from-rose-600"
      gradientTo="to-pink-700"
      steps={steps}
      currentStep={0}
      controls={controls}
      visualization={visualization}
      observations={observations}
    />
  )
}
