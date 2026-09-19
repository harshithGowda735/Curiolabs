import { useMemo, useRef, useState } from 'react'
import { Download, FileText, MoveHorizontal, RotateCcw, Save } from 'lucide-react'
import { Link } from 'react-router-dom'

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
  const svgRef = useRef(null); const [dragging, setDragging] = useState(false)
  const left = 125; const pxPerMm = 9.4; const x = left + opening * pxPerMm
  const drag = event => { if (!dragging) return; const bounds = svgRef.current.getBoundingClientRect(); onOpening(clamp((event.clientX - bounds.left - left) / (bounds.width / 820) / pxPerMm, 0, 52)) }
  const tick = i => <g key={i}><line x1={left + i * pxPerMm} x2={left + i * pxPerMm} y1="100" y2={i % 10 === 0 ? 72 : i % 5 === 0 ? 82 : 89} stroke="#1e293b" strokeWidth="1" />{i % 10 === 0 && <text x={left + i * pxPerMm} y="66" textAnchor="middle" fontSize="10" fill="#334155">{i}</text>}</g>
  const vernier = Array.from({ length: 51 }, (_, i) => <line key={i} x1={x + i * 3.76} x2={x + i * 3.76} y1="134" y2={i % 10 === 0 ? 160 : 151} stroke="#0f172a" strokeWidth="1" />)
  const sizePx = Math.max(12, specimen.size * pxPerMm)
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3 shadow-sm">
    <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-700">Direct manipulation instrument</span><span className={dragging ? 'font-semibold text-cyan-700' : 'text-slate-500'}>{dragging ? 'Moving jaw…' : 'Drag the blue slider/jaw'}</span></div>
    <svg ref={svgRef} viewBox="0 0 820 270" className="w-full touch-none select-none" onPointerMove={drag} onPointerUp={() => setDragging(false)} onPointerLeave={() => setDragging(false)} role="img" aria-label="Draggable two-dimensional Vernier caliper">
      <defs><linearGradient id="steel" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#f8fafc"/><stop offset=".48" stopColor="#b7c2cb"/><stop offset="1" stopColor="#64748b"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity=".18"/></filter></defs>
      <rect x="34" y="100" width="745" height="28" rx="3" fill="url(#steel)" filter="url(#shadow)"/><rect x="34" y="128" width="745" height="13" fill="#94a3b8" opacity=".55"/>
      {Array.from({ length: 66 }, (_, i) => tick(i))}
      <g><path d="M90 38 H122 V192 H83 V66 H90Z" fill="url(#steel)" stroke="#64748b"/><path d="M83 76 H138 V102 H83Z" fill="url(#steel)" stroke="#64748b"/><path d="M90 180 H120 V232 H108 V194 H90Z" fill="#64748b"/></g>
      <g transform={`translate(${x - left},0)`} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); setDragging(true) }} className="cursor-ew-resize"><path d="M130 42 H160 V188 H121 V67 H130Z" fill="#0e7490" stroke="#164e63"/><path d="M120 76 H176 V102 H120Z" fill="#38bdf8" stroke="#164e63"/><rect x="112" y="126" width="205" height="45" rx="5" fill="#e0f2fe" stroke="#0891b2"/>{vernier}<rect x="188" y="174" width="54" height="22" rx="11" fill="#0f766e"/><circle cx="215" cy="185" r="8" fill="#fef3c7" stroke="#a16207"/></g>
      <g transform={`translate(${left + (opening - specimen.size) * pxPerMm},0)`}><rect x="0" y="172" width={sizePx} height="9" rx="4" fill="#cbd5e1"/><circle cx={sizePx / 2} cy="180" r={Math.min(45, Math.max(8, sizePx / 2))} fill={specimen.color} stroke="#334155" strokeWidth="2" opacity=".94"/>{specimen.id === 'pipe' && <circle cx={sizePx / 2} cy="180" r={Math.max(4, sizePx / 5)} fill="#f8fafc" stroke="#334155" strokeWidth="2"/>}</g>
      <line x1="58" y1="238" x2="760" y2="238" stroke="#cbd5e1"/><text x="58" y="258" fontSize="11" fill="#64748b">0 mm</text><text x="716" y="258" fontSize="11" fill="#64748b">50 mm</text>
    </svg>
  </div>
}

function Metric({ label, value, unit = 'mm' }) { return <div className="border-l border-slate-200 px-3"><p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 font-mono text-lg font-bold text-slate-900">{value}<span className="ml-1 text-xs font-normal text-slate-400">{unit}</span></p></div> }

export default function VernierCaliper() {
  const [specimenId, setSpecimenId] = useState('sphere'), [opening, setOpening] = useState(25), [zeroError, setZeroError] = useState(0), [history, setHistory] = useState([]), [labMode, setLabMode] = useState('practice')
  const specimen = specimens.find(item => item.id === specimenId)
  const raw = Math.round(opening / LC) * LC; const msr = Math.floor(raw); const vsd = Math.round((raw - msr) / LC) % 50; const reading = raw - zeroError; const error = reading - specimen.size; const accuracy = Math.max(0, 100 - Math.abs(error / specimen.size) * 100); const aligned = Math.abs(error) <= .05
  const assistant = specimen.type !== 'external' ? `Use ${specimen.type} jaws for ${specimen.name}. The visual jaw is currently configured for external measurement, so this trial should be treated as a setup check.` : aligned ? 'Excellent contact: both jaw faces are tangent to the specimen. Record this observation.' : error > 0 ? 'The movable jaw has passed the contact surface. Drag it gently left until it just touches the specimen.' : 'The jaws are not in contact yet. Drag the movable jaw right until it meets the specimen without squeezing.'
  const selectSpecimen = id => { const next = specimens.find(item => item.id === id); setSpecimenId(id); setOpening(next.size); }
  const record = () => setHistory(old => [...old, { trial: old.length + 1, reading: +reading.toFixed(2), error: +error.toFixed(2), accuracy: +accuracy.toFixed(1), object: specimen.name }])
  const csv = () => { const body = ['Trial,Object,Corrected reading (mm),Error (mm),Accuracy (%)', ...history.map(r => `${r.trial},${r.object},${r.reading},${r.error},${r.accuracy}`)].join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' })); a.download = 'vernier-observations.csv'; a.click(); URL.revokeObjectURL(a.href) }
  const pdf = () => {
    const printWin = window.open('', '_blank')
    if (!printWin) return
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CurioLabs Vernier Caliper Lab Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #0f172a; }
            h1 { font-size: 22px; margin-bottom: 4px; color: #0f766e; }
            .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; font-size: 13px; }
            th { background: #f8fafc; font-weight: 600; color: #334155; }
            tr:nth-child(even) { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>CurioLabs Vernier Caliper Lab Report</h1>
          <div class="meta">Specimen: <strong>${specimen.name}</strong> (${specimen.size} mm) &bull; Date: ${new Date().toLocaleDateString()}</div>
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
  const readout = useMemo(() => `MSR ${msr} mm + VSR ${vsd} × ${LC} mm − zero error ${zeroError.toFixed(2)} mm`, [msr, vsd, zeroError])
  return <div className="min-h-[100dvh] bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4"><div><Link to="/physics" className="text-xs font-semibold text-cyan-700">← Physics Lab</Link><h1 className="font-display text-lg font-bold">Virtual Vernier Caliper Laboratory</h1></div><div className="flex gap-2">{['practice','guided','exam'].map(m => <button key={m} onClick={() => setLabMode(m)} className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${labMode === m ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}>{m}</button>)}</div></div></header>
    <main className="mx-auto max-w-7xl p-4 md:p-6"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-700">Precision measurement workstation</p><p className="mt-1 text-sm text-slate-500">Grab the blue moving jaw directly. The scales and contact assessment update continuously.</p></div><div className="grid gap-5 xl:grid-cols-[230px_minmax(0,1fr)_270px]">
      <aside className="space-y-4"><section className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="text-sm font-bold">Specimen tray</h2><div className="mt-3 grid grid-cols-2 gap-2">{specimens.map(s => <button key={s.id} onClick={() => selectSpecimen(s.id)} className={`rounded-lg border p-2 text-left text-xs ${s.id === specimenId ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200 hover:border-slate-300'}`}><span className="block font-bold">{s.name}</span><span className="text-slate-500">{s.type}</span></button>)}</div></section><section className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="text-sm font-bold">Calibration</h2><label className="mt-3 block text-xs text-slate-600">Zero error: {zeroError.toFixed(2)} mm<input className="mt-2 w-full accent-cyan-700" type="range" min="-.10" max=".10" step=".02" value={zeroError} onChange={e => setZeroError(+e.target.value)}/></label><button onClick={() => setZeroError(0)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700"><RotateCcw size={13}/>Reset zero</button></section></aside>
      <section className="min-w-0 space-y-5"><CaliperDrawing opening={opening} specimen={specimen} onOpening={setOpening}/><div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2 text-sm font-bold"><MoveHorizontal size={17} className="text-cyan-700"/>Physical scale readout</div><div className="mt-4 grid grid-cols-2 gap-y-4 md:grid-cols-5"><Metric label="MSR" value={msr}/><Metric label="VSR" value={vsd} unit="division"/><Metric label="Least count" value={LC.toFixed(2)}/><Metric label="Zero error" value={zeroError.toFixed(2)}/><Metric label="Corrected" value={reading.toFixed(2)}/></div><p className="mt-4 border-t pt-3 font-mono text-xs text-slate-500">{readout}</p></div><div className="grid gap-5 lg:grid-cols-3"><Chart title="Measurement reading" data={history} dataKey="reading" color="#0891b2"/><Chart title="Error analysis" data={history} dataKey="error" color="#ea580c"/><Chart title="Accuracy trend" data={history} dataKey="accuracy" color="#16a34a" domain={[0,100]}/></div></section>
      <aside className="space-y-4"><section className="rounded-xl border border-cyan-100 bg-cyan-50 p-4"><h2 className="text-sm font-bold text-cyan-950">AI lab assistant</h2><p className="mt-2 text-sm leading-relaxed text-cyan-900">{assistant}</p><p className="mt-3 border-t border-cyan-200 pt-3 text-xs text-cyan-800">Viva: How does zero error change the corrected reading?</p></section><section className="rounded-xl border border-slate-200 bg-white p-4"><h2 className="text-sm font-bold">Observation table</h2><p className="mt-1 text-xs text-slate-500">Performance: {history.length ? Math.round(history.reduce((a,b) => a + b.accuracy, 0) / history.length) : 0}%</p><button onClick={record} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-700 py-2 text-xs font-bold text-white"><Save size={14}/>Record reading</button><div className="mt-3 max-h-32 overflow-auto text-xs">{history.length ? history.map(r => <div key={r.trial} className="grid grid-cols-3 border-b py-2"><span>#{r.trial}</span><span>{r.reading} mm</span><span className={Math.abs(r.error) <= .05 ? 'text-emerald-700' : 'text-orange-700'}>{r.accuracy}%</span></div>) : <p className="text-slate-400">No readings recorded.</p>}</div><div className="mt-3 flex gap-2"><button onClick={csv} disabled={!history.length} className="flex-1 rounded border py-2 text-xs disabled:opacity-40"><Download size={13} className="mr-1 inline"/>CSV</button><button onClick={pdf} disabled={!history.length} className="flex-1 rounded bg-slate-900 py-2 text-xs text-white disabled:opacity-40"><FileText size={13} className="mr-1 inline"/>PDF</button></div></section></aside>
    </div></main></div>
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
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs font-bold text-slate-700">{title}</p>
      <div className="h-36 flex items-center justify-center">
        {data.length === 0 ? (
          <p className="text-xs text-slate-400">Record readings to plot chart</p>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            <line x1={padX} y1={padY} x2={width - 12} y2={padY} stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1={padX} y1={padY + plotH / 2} x2={width - 12} y2={padY + plotH / 2} stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1={padX} y1={padY + plotH} x2={width - 12} y2={padY + plotH} stroke="#cbd5e1" />
            
            <text x={padX - 4} y={padY + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{maxVal.toFixed(1)}</text>
            <text x={padX - 4} y={padY + plotH} textAnchor="end" fontSize="9" fill="#94a3b8">{minVal.toFixed(1)}</text>

            {points.length > 1 && (
              <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polylineStr} />
            )}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke={color} strokeWidth="2" />
                <text x={p.x} y={padY + plotH + 13} textAnchor="middle" fontSize="8" fill="#64748b">#{p.trial}</text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}
