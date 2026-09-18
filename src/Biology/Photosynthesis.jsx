import { useState, useEffect, useRef } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import ApparatusSetup from '../components/ApparatusSetup'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  Sun, 
  Thermometer, 
  Leaf, 
  RotateCcw, 
  Activity, 
  Play, 
  CheckCircle2, 
  Layers
} from 'lucide-react'

const steps = [
  { title: 'Setup the Apparatus', description: 'Drag the beaker, plant, funnel, test tube, lamp, and thermometer into position on the bench.' },
  { title: 'Start Light Irradiation', description: 'Power on the lamp and set initial light intensity to initiate photosynthesis.' },
  { title: 'Count Oxygen Bubbles', description: 'Observe O2 bubble evolution rate collected in the inverted test tube.' },
  { title: 'Vary Limiting Factors', description: 'Adjust temperature and CO2 concentration to plot the photochemical saturation curve.' }
]

const observations = [
  'Photosynthesis produces oxygen gas (O₂) as a byproduct',
  'Rate of O₂ production increases with light intensity up to a saturation point',
  'Temperature affects the rate — optimal around 25-35°C, decreases beyond 40°C',
  'CO₂ concentration is also a limiting factor in photosynthesis',
  '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (overall equation)'
]

// Custom SVG Icons for the Apparatus Tray matching the user's photo
const BeakerIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-sky-500 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 6h18M9 6v18a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4V6" />
    <path d="M6 6h2" />
    <line x1="11" y1="12" x2="15" y2="12" stroke="#94a3b8" />
    <line x1="11" y1="16" x2="17" y2="16" stroke="#94a3b8" />
  </svg>
)

const PlantIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-emerald-600 fill-emerald-50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 28V14M16 14c-4-4-9-2-9 4 0 6 7 8 9 8M16 14c4-4 9-2 9 4 0 6-7 8-9 8" />
  </svg>
)

const FunnelIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-teal-600 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="6 8 26 8 18 18 18 26 14 26 14 18 6 8" />
  </svg>
)

const TestTubeIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-sky-500 fill-sky-50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="11" y="5" width="10" height="20" rx="5" />
    <line x1="9" y1="5" x2="23" y2="5" />
  </svg>
)

const LampIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-amber-500 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="16" r="6" fill="#fef08a" />
    <line x1="16" y1="4" x2="16" y2="7" />
    <line x1="16" y1="25" x2="16" y2="28" />
    <line x1="4" y1="16" x2="7" y2="16" />
    <line x1="25" y1="16" x2="28" y2="16" />
    <line x1="7.5" y1="7.5" x2="9.5" y2="9.5" />
    <line x1="22.5" y1="22.5" x2="24.5" y2="24.5" />
    <line x1="7.5" y1="24.5" x2="9.5" y2="22.5" />
    <line x1="22.5" y1="9.5" x2="24.5" y2="7.5" />
  </svg>
)

const ThermometerIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 stroke-rose-500 fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 6a2 2 0 1 1 4 0v13.2a4 4 0 1 1-4 0V6z" />
    <circle cx="16" cy="22" r="2" fill="#ef4444" />
    <line x1="16" y1="12" x2="16" y2="20" stroke="#ef4444" strokeWidth="2" />
  </svg>
)

const APPARATUS_ITEMS = [
  { id: 'beaker', name: 'Beaker', icon: <BeakerIcon /> },
  { id: 'plant', name: 'Plant', icon: <PlantIcon /> },
  { id: 'funnel', name: 'Funnel', icon: <FunnelIcon /> },
  { id: 'testTube', name: 'Test Tube', icon: <TestTubeIcon /> },
  { id: 'lamp', name: 'Lamp', icon: <LampIcon /> },
  { id: 'thermometer', name: 'Thermometer', icon: <ThermometerIcon /> }
]

export default function Photosynthesis() {
  const { t } = useLanguage()
  const [lightIntensity, setLightIntensity] = useState(60)
  const [temperature, setTemperature] = useState(26)
  const [co2, setCo2] = useState(0.04)
  const [isStarted, setIsStarted] = useState(false)
  const [time, setTime] = useState(0)
  const [dataPoints, setDataPoints] = useState([])
  const intervalRef = useRef(null)

  // Drag-and-drop apparatus state
  const [placedItems, setPlacedItems] = useState({})

  // Targets matching the exact layout in the user's photo
  const targets = [
    {
      id: 'target_lamp',
      accepts: 'lamp',
      label: 'lamp',
      x: '24%',
      y: '32%',
      width: '74px',
      height: '74px',
      className: 'border-2 border-dashed border-amber-300 bg-amber-100/50 hover:bg-amber-100/80',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <LampIcon />
          <span className="text-[10px] font-bold text-amber-800 mt-1">Lamp</span>
          {isStarted && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mt-0.5" />}
        </div>
      )
    },
    {
      id: 'target_testTube',
      accepts: 'testTube',
      label: 'testTube',
      x: '50%',
      y: '32%',
      width: '64px',
      height: '92px',
      className: 'border-2 border-dashed border-sky-300 bg-sky-100/50 hover:bg-sky-100/80',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <TestTubeIcon />
          <span className="text-[10px] font-bold text-sky-800 mt-1">Test Tube</span>
          {isStarted && <span className="text-[9px] text-sky-600 font-mono">O2 Collect</span>}
        </div>
      )
    },
    {
      id: 'target_funnel',
      accepts: 'funnel',
      label: 'funnel',
      x: '50%',
      y: '56%',
      width: '88px',
      height: '76px',
      className: 'border-2 border-dashed border-teal-300 bg-teal-100/50 hover:bg-teal-100/80',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <FunnelIcon />
          <span className="text-[10px] font-bold text-teal-800">Funnel</span>
        </div>
      )
    },
    {
      id: 'target_beaker',
      accepts: 'beaker',
      label: 'beaker',
      x: '50%',
      y: '74%',
      width: '120px',
      height: '84px',
      className: 'border-2 border-dashed border-emerald-300 bg-emerald-100/50 hover:bg-emerald-100/80',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <BeakerIcon />
          <span className="text-[10px] font-bold text-emerald-800">Beaker + Hydrilla</span>
        </div>
      )
    },
    {
      id: 'target_plant',
      accepts: 'plant',
      label: 'plant',
      x: '50%',
      y: '82%',
      width: '80px',
      height: '50px',
      className: 'border-2 border-dashed border-green-300 bg-green-100/60 hover:bg-green-100/90',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <PlantIcon />
          <span className="text-[9px] font-bold text-green-800">Hydrilla</span>
        </div>
      )
    },
    {
      id: 'target_thermometer',
      accepts: 'thermometer',
      label: 'thermometer',
      x: '80%',
      y: '60%',
      width: '64px',
      height: '110px',
      className: 'border-2 border-dashed border-orange-300 bg-orange-100/50 hover:bg-orange-100/80',
      renderPlaced: () => (
        <div className="flex flex-col items-center">
          <ThermometerIcon />
          <span className="text-[10px] font-bold text-rose-800 mt-1">{temperature}°C</span>
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
    setDataPoints([])
    setTime(0)
  }

  // Photosynthesis biological rate calculation
  const rate = (() => {
    const lightFactor = lightIntensity / (lightIntensity + 28)
    const tempFactor = temperature < 10 ? 0.05 : temperature > 45 ? 0.05 : Math.exp(-((temperature - 28) ** 2) / 180)
    const co2Factor = co2 / (co2 + 0.02)
    return (lightFactor * tempFactor * co2Factor * 12).toFixed(2)
  })()

  const bubbleCount = Math.floor(parseFloat(rate) * 2.8)

  useEffect(() => {
    if (!isStarted) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setTime(prev => {
        const nextTime = prev + 5
        setDataPoints(pts => [
          ...pts.slice(-25),
          {
            time: nextTime,
            bubbles: bubbleCount,
            rate: parseFloat(rate),
            light: lightIntensity,
            temp: temperature
          }
        ])
        return nextTime
      })
    }, 1200)

    return () => clearInterval(intervalRef.current)
  }, [isStarted, rate, bubbleCount, lightIntensity, temperature])

  const graphW = 380, graphH = 150, pad = 35
  const maxTime = Math.max(60, time)
  const scaleX = (t) => pad + (t / maxTime) * (graphW - 2 * pad)
  const scaleY = (r) => graphH - pad - (r / 12) * (graphH - 2 * pad)

  // Controls Panel
  const controls = (
    <div className="space-y-4">
      {/* Drag and Drop Apparatus Setup Box */}
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
        startLabel="Start Experiment"
        hint="Drag beaker, plant, funnel, test tube, lamp & thermometer onto the bench."
      />

      {/* Environmental Sliders (Active when experiment is running) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
        <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
          <span>Experimental Parameter Controls</span>
          {isStarted && (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Reaction
            </span>
          )}
        </h4>

        <LabeledSlider
          label="Light Intensity (Lux)"
          value={lightIntensity}
          onChange={setLightIntensity}
          min={0}
          max={100}
          step={5}
          unit="%"
          accentColor="#f59e0b"
          disabled={!isStarted}
        />

        <div className="mt-3">
          <LabeledSlider
            label="Water Bath Temperature"
            value={temperature}
            onChange={setTemperature}
            min={5}
            max={50}
            step={1}
            unit="°C"
            accentColor="#ef4444"
            disabled={!isStarted}
          />
        </div>

        <div className="mt-3">
          <LabeledSlider
            label="Dissolved CO₂ Concentration"
            value={co2}
            onChange={setCo2}
            min={0.01}
            max={0.10}
            step={0.005}
            unit="%"
            accentColor="#10b981"
            disabled={!isStarted}
          />
        </div>
      </div>
    </div>
  )

  // Visualization Panel Matching User's Screenshot
  const visualization = (
    <div className="space-y-4">
      {/* Top Card: Live Bubble Count & Cumulative O2 */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm min-h-[140px] flex flex-col justify-center">
        {!isStarted ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-center">
            <Activity size={24} className="mb-2 text-slate-300" />
            <p className="text-sm font-medium">No data to display. Start the experiment to see the graph.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900">Live Reaction Metrics</h4>
              <span className="text-xs font-mono text-slate-500">Elapsed: {time}s</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <span className="text-xs text-emerald-700 font-medium block">O₂ Evolution Rate</span>
                <span className="text-xl font-bold text-emerald-900 font-display">{rate} a.u.</span>
              </div>
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl">
                <span className="text-xs text-sky-700 font-medium block">Bubbles / Minute</span>
                <span className="text-xl font-bold text-sky-900 font-display">{bubbleCount} bpm</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <span className="text-xs text-amber-700 font-medium block">Light Saturation</span>
                <span className="text-xl font-bold text-amber-900 font-display">{lightIntensity}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Middle Card: Production Rate Over Time Graph */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm min-h-[220px]">
        <h4 className="text-base font-bold text-slate-900 mb-3">
          Production Rate Over Time
        </h4>

        {!isStarted || dataPoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
            <p className="text-sm font-medium">No data to display. Start the experiment to see the rate graph.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg viewBox={`0 0 ${graphW} ${graphH}`} className="w-full bg-slate-950 rounded-xl shadow-inner">
              <line x1={pad} y1={graphH - pad} x2={graphW - pad} y2={graphH - pad} stroke="#334155" strokeWidth="1.5" />
              <line x1={pad} y1={pad} x2={pad} y2={graphH - pad} stroke="#334155" strokeWidth="1.5" />

              <text x={graphW - pad} y={graphH - pad + 15} fill="#94a3b8" fontSize="9" textAnchor="end">Time (s)</text>
              <text x={12} y={25} fill="#94a3b8" fontSize="9" transform="rotate(-90 25 25)">O₂ Rate</text>

              {/* Data curve */}
              {dataPoints.length > 1 && (
                <polyline
                  points={dataPoints.map(p => `${scaleX(p.time)},${scaleY(p.rate)}`).join(' ')}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.5"
                />
              )}

              {/* Data points */}
              {dataPoints.map((p, idx) => (
                <circle key={idx} cx={scaleX(p.time)} cy={scaleY(p.rate)} r="3" fill="#10b981" />
              ))}
            </svg>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0s</span>
              <span>Rate: {rate} a.u.</span>
              <span>{maxTime}s</span>
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
      title="Photosynthesis Oxygen Evolution"
      subject="Biology"
      accentColor="emerald"
      gradientFrom="from-emerald-600"
      gradientTo="to-teal-700"
      steps={steps}
      currentStep={0}
      controls={controls}
      visualization={visualization}
      observations={observations}
    />
  )
}
