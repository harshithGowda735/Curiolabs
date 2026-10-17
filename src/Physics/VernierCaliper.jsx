import { useMemo, useRef, useState } from 'react'
import { Download, FileText, MoveHorizontal, RotateCcw, Save, Sparkles } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { submitStudentExamOutput } from '../services/examService'

const LC = 0.02

const specimens = [
  { id: 'sphere', name: 'Steel sphere', size: 25.00, type: 'external', color: '#77a8df' },
  { id: 'cube', name: 'Calibration cube', size: 30.00, type: 'external', color: '#c79455' },
  { id: 'pipe', name: 'Copper pipe', size: 18.36, type: 'internal', color: '#c77645' },
  { id: 'wire', name: 'Copper wire', size: 3.18, type: 'external', color: '#c77645' },
  { id: 'coin', name: 'Laboratory coin', size: 22.50, type: 'external', color: '#d5b651' },
  { id: 'bolt', name: 'Hex bolt', size: 12.00, type: 'external', color: '#8793a0' },
  { id: 'pcb', name: 'PCB step', size: 8.75, type: 'step', color: '#438d72' },
]

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

function CaliperDrawing({ opening, specimen, onOpening }) {
  const svgRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const left = 125
  const pxPerMm = 9.4
  const x = left + opening * pxPerMm

  const drag = event => {
    if (!dragging || !svgRef.current) return
    const bounds = svgRef.current.getBoundingClientRect()
    onOpening(clamp((event.clientX - bounds.left - left) / (bounds.width / 820) / pxPerMm, 0, 52))
  }

  // Main scale markings on beam
  const tick = i => (
    <g key={i}>
      <line 
        x1={left + i * pxPerMm} 
        x2={left + i * pxPerMm} 
        y1="100" 
        y2={i % 10 === 0 ? 70 : i % 5 === 0 ? 80 : 88} 
        stroke="#221611" 
        strokeWidth={i % 10 === 0 ? "1.5" : "1"} 
      />
      {i % 10 === 0 && (
        <text 
          x={left + i * pxPerMm} 
          y="62" 
          textAnchor="middle" 
          fontSize="11" 
          fontFamily="monospace"
          fontWeight="900" 
          fill="#221611"
        >
          {i}
        </text>
      )}
    </g>
  )

  // Vernier scale markings inside the sliding plate
  const vernier = Array.from({ length: 51 }, (_, i) => (
    <line 
      key={i} 
      x1={120 + i * 3.76} 
      x2={120 + i * 3.76} 
      y1="132" 
      y2={i % 10 === 0 ? 160 : 150} 
      stroke="#221611" 
      strokeWidth={i % 10 === 0 ? "1.6" : "1"} 
    />
  ))

  const sizePx = Math.max(12, specimen.size * pxPerMm)

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[#221611] bg-white p-4 shadow-[4px_4px_0px_#221611]">
      <div className="mb-3 flex items-center justify-between border-b-2 border-[#221611]/10 pb-2 text-xs">
        <span className="font-black uppercase tracking-wider text-[#221611]">
          Direct Manipulation Instrument
        </span>
        <span className={`font-mono text-xs font-black ${dragging ? 'text-[#0284c7]' : 'text-[#221611]/60'}`}>
          {dragging ? '● Moving jaw…' : 'Drag the slider / movable jaw'}
        </span>
      </div>

      <svg 
        ref={svgRef} 
        viewBox="0 0 820 270" 
        className="w-full touch-none select-none" 
        onPointerMove={drag} 
        onPointerUp={() => setDragging(false)} 
        onPointerLeave={() => setDragging(false)} 
        role="img" 
        aria-label="Draggable two-dimensional Vernier caliper"
      >
        <defs>
          <linearGradient id="steel" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="48%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodOpacity=".18" floodColor="#221611" />
          </filter>
        </defs>

        {/* Main steel beam */}
        <rect x="34" y="100" width="745" height="28" rx="3" fill="url(#steel)" stroke="#221611" strokeWidth="1.5" filter="url(#shadow)" />
        <rect x="34" y="128" width="745" height="13" fill="#cbd5e1" stroke="#221611" strokeWidth="1" opacity=".7" />

        {/* Main scale ticks */}
        {Array.from({ length: 66 }, (_, i) => tick(i))}

        {/* Fixed Jaw (Left) */}
        <g>
          <path d="M90 38 H122 V192 H83 V66 H90Z" fill="url(#steel)" stroke="#221611" strokeWidth="1.5" />
          <path d="M83 76 H138 V102 H83Z" fill="url(#steel)" stroke="#221611" strokeWidth="1.5" />
          <path d="M90 180 H120 V232 H108 V194 H90Z" fill="#64748b" stroke="#221611" strokeWidth="1.5" />
        </g>

        {/* Movable Jaw & Vernier Slider (Right) */}
        <g 
          transform={`translate(${x - left},0)`} 
          onPointerDown={e => { 
            e.currentTarget.setPointerCapture(e.pointerId) 
            setDragging(true) 
          }} 
          className="cursor-ew-resize"
        >
          {/* Upper slider jaw */}
          <path d="M130 42 H160 V188 H121 V67 H130Z" fill="#221611" stroke="#221611" strokeWidth="1.5" />
          <path d="M120 76 H176 V102 H120Z" fill="#334155" stroke="#221611" strokeWidth="1.5" />
          
          {/* Vernier scale plate */}
          <rect x="112" y="125" width="205" height="46" rx="4" fill="#FAF5EB" stroke="#221611" strokeWidth="1.8" />
          {vernier}

          {/* Lower thumb clamp & brass knurl */}
          <rect x="188" y="174" width="54" height="22" rx="11" fill="#221611" stroke="#221611" strokeWidth="1" />
          <circle cx="215" cy="185" r="7" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
        </g>

        {/* Specimen placed between jaws */}
        <g transform={`translate(${left},0)`}>
          <rect x="0" y="172" width={sizePx} height="9" rx="4" fill="#cbd5e1" stroke="#221611" strokeWidth="1" />
          <circle 
            cx={sizePx / 2} 
            cy="180" 
            r={Math.min(45, Math.max(8, sizePx / 2))} 
            fill={specimen.color} 
            stroke="#221611" 
            strokeWidth="2" 
            opacity=".95" 
          />
          {specimen.id === 'pipe' && (
            <circle 
              cx={sizePx / 2} 
              cy="180" 
              r={Math.max(4, sizePx / 5)} 
              fill="#FAF5EB" 
              stroke="#221611" 
              strokeWidth="2" 
            />
          )}
        </g>

        {/* Scale limits */}
        <line x1="58" y1="238" x2="760" y2="238" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="58" y="258" fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#221611">0 mm</text>
        <text x="716" y="258" fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#221611">50 mm</text>
      </svg>
    </div>
  )
}

function Metric({ label, value, unit = 'mm', highlight = false }) {
  return (
    <div className={`rounded-xl border-2 border-[#221611] p-3 shadow-[2px_2px_0px_#221611] ${
      highlight ? 'bg-[#A4C93B]/20' : 'bg-white'
    }`}>
      <p className="text-[10px] font-black uppercase tracking-wider text-[#221611]/70">{label}</p>
      <p className="mt-1 font-mono text-lg font-black text-[#221611]">
        {value}
        <span className="ml-1 text-xs font-bold text-[#221611]/50">{unit}</span>
      </p>
    </div>
  )
}

function Chart({ title, data, dataKey, color, domain }) {
  const vals = (data || []).map(d => d[dataKey] ?? 0)
  const minVal = domain ? domain[0] : (vals.length > 0 ? Math.min(...vals, 0) : 0)
  const maxVal = domain ? domain[1] : (vals.length > 0 ? Math.max(...vals, 1) : 1)
  const range = maxVal - minVal || 1

  const width = 280
  const height = 120
  const padX = 32
  const padY = 16
  const plotW = width - padX - 12
  const plotH = height - padY - 24

  const points = (data || []).map((d, i) => {
    const x = data.length > 1 ? padX + (i / (data.length - 1)) * plotW : padX + plotW / 2
    const y = padY + plotH - ((d[dataKey] - minVal) / range) * plotH
    return { x, y, val: d[dataKey], trial: d.trial }
  })

  const polylineStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <div className="rounded-2xl border-2 border-[#221611] bg-white p-3.5 shadow-[3px_3px_0px_#221611]">
      <p className="text-xs font-black uppercase tracking-wider text-[#221611]">{title}</p>
      <div className="mt-2 h-32 flex items-center justify-center">
        {data.length === 0 ? (
          <p className="text-xs font-bold text-[#221611]/40">Record readings to plot chart</p>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            <line x1={padX} y1={padY} x2={width - 12} y2={padY} stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1={padX} y1={padY + plotH / 2} x2={width - 12} y2={padY + plotH / 2} stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1={padX} y1={padY + plotH} x2={width - 12} y2={padY + plotH} stroke="#221611" strokeWidth="1.5" />
            
            <text x={padX - 4} y={padY + 4} textAnchor="end" fontSize="9" fontFamily="monospace" fontWeight="bold" fill="#64748b">
              {maxVal.toFixed(1)}
            </text>
            <text x={padX - 4} y={padY + plotH} textAnchor="end" fontSize="9" fontFamily="monospace" fontWeight="bold" fill="#64748b">
              {minVal.toFixed(1)}
            </text>

            {points.length > 1 && (
              <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polylineStr} />
            )}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke={color} strokeWidth="2.5" />
                <text x={p.x} y={padY + plotH + 13} textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#221611">
                  #{p.trial}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}

export default function VernierCaliper() {
  const [searchParams] = useSearchParams()
  const examCode = searchParams.get('exam')
  const candidateName = searchParams.get('candidate') || 'Harshith Gowda (Student)'
  const isExamMode = Boolean(examCode)

  const [specimenId, setSpecimenId] = useState('sphere')
  const [opening, setOpening] = useState(25)
  const [zeroError, setZeroError] = useState(0)
  const [history, setHistory] = useState([])
  const [labMode, setLabMode] = useState(isExamMode ? 'exam' : 'practice')
  const [examSubmitted, setExamSubmitted] = useState(false)

  const specimen = specimens.find(item => item.id === specimenId) || specimens[0]

  const raw = Math.round(opening / LC) * LC
  const msr = Math.floor(raw)
  const vsd = Math.round((raw - msr) / LC) % 50
  const reading = +(raw - zeroError).toFixed(2)
  const error = +(reading - specimen.size).toFixed(2)
  const accuracy = Math.max(0, +(100 - Math.abs(error / specimen.size) * 100).toFixed(1))
  const aligned = Math.abs(error) <= 0.05

  const assistant = specimen.type !== 'external' 
    ? `Use ${specimen.type} jaws for ${specimen.name}. The visual jaw is currently configured for external measurement, so this trial should be treated as a setup check.` 
    : aligned 
      ? 'Excellent contact: both jaw faces are tangent to the specimen. Record this observation.' 
      : error > 0 
        ? 'The movable jaw has passed the contact surface. Drag it gently left until it just touches the specimen.' 
        : 'The jaws are not in contact yet. Drag the movable jaw right until it meets the specimen without squeezing.'

  const selectSpecimen = id => {
    const next = specimens.find(item => item.id === id)
    setSpecimenId(id)
    setOpening(next.size)
  }

  const record = () => {
    setHistory(old => [
      ...old, 
      { 
        trial: old.length + 1, 
        reading: +reading.toFixed(2), 
        error: +error.toFixed(2), 
        accuracy: +accuracy.toFixed(1), 
        object: specimen.name 
      }
    ])
  }

  const csv = () => {
    const body = ['Trial,Object,Corrected reading (mm),Error (mm),Accuracy (%)', ...history.map(r => `${r.trial},${r.object},${r.reading},${r.error},${r.accuracy}`)].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' }))
    a.download = 'vernier-observations.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const pdf = () => {
    const printWin = window.open('', '_blank')
    if (!printWin) return
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CurioLabs Vernier Caliper Lab Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 36px; color: #221611; }
            h1 { font-size: 22px; margin-bottom: 4px; color: #221611; font-weight: 800; }
            .meta { color: #57534e; font-size: 13px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1.5px solid #221611; padding: 10px 14px; text-align: left; font-size: 13px; }
            th { background: #A4C93B; font-weight: 800; color: #221611; }
            tr:nth-child(even) { background: #faf5eb; }
          </style>
        </head>
        <body>
          <h1>CurioLabs Vernier Caliper Lab Report</h1>
          <div class="meta">Specimen: <strong>${specimen.name}</strong> (${specimen.size} mm) &bull; Date: ${new Date().toLocaleDateString()} &bull; Candidate: ${candidateName}</div>
          <table>
            <thead>
              <tr>
                <th>Trial #</th>
                <th>Specimen</th>
                <th>Corrected Reading (mm)</th>
                <th>Error (mm)</th>
                <th>Accuracy (%)</th>
              </tr>
            </thead>
            <tbody>
              ${history.map(r => `<tr><td>#${r.trial}</td><td>${r.object}</td><td>${r.reading} mm</td><td>${r.error} mm</td><td>${r.accuracy}%</td></tr>`).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `)
    printWin.document.close()
  }

  const handleExamSubmit = () => {
    if (!examCode) return
    submitStudentExamOutput(examCode, candidateName, {
      experiment: 'Vernier Caliper',
      specimen: specimen.name,
      observedReading: reading,
      error,
      accuracy,
      trialsRecorded: history.length
    })
    setExamSubmitted(true)
  }

  const readout = useMemo(
    () => `MSR ${msr} mm + VSR ${vsd} × ${LC} mm − zero error ${zeroError.toFixed(2)} mm`, 
    [msr, vsd, zeroError]
  )

  return (
    <div className="min-h-[100dvh] bg-[#FAF5EB] text-[#221611] font-sans antialiased selection:bg-[#221611] selection:text-[#FAF5EB]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b-2 border-[#221611] bg-white shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link 
              to="/physics" 
              className="flex items-center gap-1.5 rounded-lg border-2 border-[#221611] bg-[#FAF5EB] px-3 py-1.5 text-xs font-black text-[#221611] transition-transform active:translate-y-0.5 shadow-[2px_2px_0px_#221611]"
            >
              ← Physics Hub
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-[#221611]">
                Virtual Vernier Caliper Laboratory
              </h1>
              <p className="hidden sm:block text-[11px] font-bold text-[#221611]/60">
                Precision measurement workstation • 0.02 mm Least Count
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isExamMode ? (
              <span className="rounded-xl border-2 border-[#221611] bg-[#A4C93B] px-3.5 py-1 text-xs font-black text-[#221611] shadow-[2px_2px_0px_#221611]">
                EXAM SESSION: {examCode}
              </span>
            ) : (
              <div className="flex gap-1.5 rounded-xl border-2 border-[#221611] bg-[#FAF5EB] p-1">
                {['practice', 'guided', 'exam'].map(m => (
                  <button 
                    key={m} 
                    onClick={() => setLabMode(m)} 
                    className={`rounded-lg px-3 py-1 text-xs font-black capitalize transition-all ${
                      labMode === m 
                        ? 'border-2 border-[#221611] bg-[#221611] text-[#FAF5EB] shadow-[2px_2px_0px_#A4C93B]' 
                        : 'text-[#221611] hover:bg-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        {/* Exam Banner */}
        {isExamMode && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#221611] bg-[#A4C93B]/20 p-4 shadow-[4px_4px_0px_#221611]">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-[#221611]">
                Practical Examination Mode &bull; Candidate: {candidateName}
              </p>
              <p className="text-xs font-bold text-[#221611]/80">
                Measure specimen dimensions and submit lab output directly to teacher telemetry.
              </p>
            </div>
            <button
              onClick={handleExamSubmit}
              disabled={examSubmitted}
              className={`rounded-xl border-2 border-[#221611] px-5 py-2 text-xs font-black transition-transform active:translate-y-0.5 shadow-[3px_3px_0px_#221611] ${
                examSubmitted ? 'bg-emerald-600 text-white' : 'bg-[#221611] text-[#A4C93B] hover:bg-black'
              }`}
            >
              {examSubmitted ? '✓ Output Submitted' : 'Submit Lab Output'}
            </button>
          </div>
        )}

        {/* Section Headline */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#221611] text-[#A4C93B] text-[10px] font-mono font-black uppercase tracking-wider mb-1.5">
            Precision Metrology Bench
          </div>
          <p className="text-sm font-bold text-[#221611]/70">
            Grab the sliding jaw directly. The scales and contact assessment update continuously.
          </p>
        </div>

        {/* Main 3-Column Responsive Grid */}
        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_300px] items-start">
          
          {/* Left Column: Specimen Tray & Calibration */}
          <aside className="space-y-4">
            <section className="rounded-2xl border-2 border-[#221611] bg-white p-4 shadow-[4px_4px_0px_#221611]">
              <div className="flex items-center justify-between border-b-2 border-[#221611]/10 pb-2 mb-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#221611]">
                  Specimen Tray
                </h2>
                <span className="text-[10px] font-mono font-bold text-[#221611]/60">
                  {specimens.length} Objects
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {specimens.map(s => {
                  const isSelected = s.id === specimenId
                  return (
                    <button 
                      key={s.id} 
                      onClick={() => selectSpecimen(s.id)} 
                      className={`rounded-xl border-2 p-2.5 text-left text-xs transition-all ${
                        isSelected 
                          ? 'border-[#221611] bg-[#A4C93B] text-[#221611] shadow-[2px_2px_0px_#221611]' 
                          : 'border-[#221611]/15 bg-white text-[#221611] hover:border-[#221611]'
                      }`}
                    >
                      <span className="block font-black leading-tight truncate">{s.name}</span>
                      <span className="text-[10px] font-bold text-[#221611]/70 capitalize">{s.type}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-2xl border-2 border-[#221611] bg-white p-4 shadow-[4px_4px_0px_#221611]">
              <div className="flex items-center justify-between border-b-2 border-[#221611]/10 pb-2 mb-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#221611]">
                  Calibration
                </h2>
                <span className="font-mono text-xs font-black text-[#221611]">
                  {zeroError.toFixed(2)} mm
                </span>
              </div>

              <label className="block text-xs font-bold text-[#221611]/70">
                Zero Error Adjustment:
                <input 
                  className="mt-2 w-full accent-[#221611] cursor-pointer" 
                  type="range" 
                  min="-0.10" 
                  max="0.10" 
                  step="0.02" 
                  value={zeroError} 
                  onChange={e => setZeroError(+e.target.value)} 
                />
              </label>

              <button 
                onClick={() => setZeroError(0)} 
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-[#221611] bg-[#FAF5EB] py-1.5 text-xs font-black text-[#221611] transition-transform active:translate-y-0.5 shadow-[2px_2px_0px_#221611]"
              >
                <RotateCcw size={13} /> Reset Zero Error
              </button>
            </section>
          </aside>

          {/* Center Column: Caliper Apparatus, Scale Readout & 3 Trend Charts */}
          <section className="min-w-0 space-y-5">
            <CaliperDrawing 
              opening={opening} 
              specimen={specimen} 
              onOpening={setOpening} 
            />

            <div className="rounded-2xl border-2 border-[#221611] bg-white p-4 shadow-[4px_4px_0px_#221611]">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#221611] border-b-2 border-[#221611]/10 pb-2.5">
                <MoveHorizontal size={17} className="text-[#221611]" />
                Physical Scale Readout
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                <Metric label="MSR" value={msr} />
                <Metric label="VSR" value={vsd} unit="division" />
                <Metric label="Least count" value={LC.toFixed(2)} />
                <Metric label="Zero error" value={zeroError.toFixed(2)} />
                <Metric label="Corrected" value={reading.toFixed(2)} highlight={true} />
              </div>

              <div className="mt-3 rounded-xl border-2 border-[#221611]/10 bg-[#FAF5EB] p-2.5 font-mono text-xs font-black text-[#221611]">
                Formula: {readout}
              </div>
            </div>

            {/* 3 Visual History Charts */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Chart title="Measurement Reading" data={history} dataKey="reading" color="#0284c7" />
              <Chart title="Error Analysis" data={history} dataKey="error" color="#ea580c" />
              <Chart title="Accuracy Trend" data={history} dataKey="accuracy" color="#16a34a" domain={[0, 100]} />
            </div>
          </section>

          {/* Right Column: AI Lab Assistant & Observation Table */}
          <aside className="space-y-4">
            <section className="rounded-2xl border-2 border-[#221611] bg-white p-4 shadow-[4px_4px_0px_#221611]">
              <div className="flex items-center justify-between border-b-2 border-[#221611]/10 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#A4C93B]" />
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#221611]">
                    AI Lab Assistant
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#A4C93B] text-[#221611] text-[10px] font-black uppercase">
                  Active
                </span>
              </div>

              <p className="text-xs leading-relaxed font-bold text-[#221611]">
                {assistant}
              </p>

              <div className="mt-3 rounded-xl border border-[#221611]/15 bg-[#FAF5EB] p-2.5 text-xs text-[#221611]">
                <p className="font-black text-[10px] uppercase tracking-wider text-[#221611]/60">Viva Query:</p>
                <p className="mt-0.5 font-bold">How does zero error change the corrected reading?</p>
              </div>
            </section>

            <section className="rounded-2xl border-2 border-[#221611] bg-white p-4 shadow-[4px_4px_0px_#221611]">
              <div className="flex items-center justify-between border-b-2 border-[#221611]/10 pb-2 mb-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-[#221611]">
                  Observation Table
                </h2>
                <span className="font-mono text-xs font-black text-[#221611]">
                  Trials: {history.length}
                </span>
              </div>

              <p className="text-xs font-bold text-[#221611]/70 mb-3">
                Performance Score: <strong className="font-mono text-[#221611]">{history.length ? Math.round(history.reduce((a, b) => a + b.accuracy, 0) / history.length) : 0}%</strong>
              </p>

              <button 
                onClick={record} 
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#221611] bg-[#221611] py-2.5 text-xs font-black text-[#FAF5EB] hover:bg-[#35231B] transition-transform active:translate-y-0.5 shadow-[2px_2px_0px_#A4C93B]"
              >
                <Save size={14} /> Record Reading
              </button>

              <div className="mt-3 max-h-40 overflow-auto text-xs pr-1">
                {history.length ? (
                  history.map(r => (
                    <div key={r.trial} className="grid grid-cols-3 border-b border-[#221611]/10 py-2">
                      <span className="font-black text-[#221611]">#{r.trial}</span>
                      <span className="font-mono font-bold text-[#221611]">{r.reading} mm</span>
                      <span className={`text-right font-black ${Math.abs(r.error) <= 0.05 ? 'text-emerald-700' : 'text-orange-700'}`}>
                        {r.accuracy}%
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-xs font-bold text-[#221611]/40">
                    No readings recorded.
                  </p>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t-2 border-[#221611]/10 pt-3">
                <button 
                  onClick={csv} 
                  disabled={!history.length} 
                  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#221611] bg-white py-1.5 text-xs font-black text-[#221611] transition-transform active:translate-y-0.5 disabled:opacity-40 shadow-[2px_2px_0px_#221611]"
                >
                  <Download size={13} /> CSV
                </button>
                <button 
                  onClick={pdf} 
                  disabled={!history.length} 
                  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#221611] bg-[#221611] py-1.5 text-xs font-black text-[#FAF5EB] transition-transform active:translate-y-0.5 disabled:opacity-40 shadow-[2px_2px_0px_#A4C93B]"
                >
                  <FileText size={13} /> PDF
                </button>
              </div>
            </section>
          </aside>

        </div>
      </main>
    </div>
  )
}
