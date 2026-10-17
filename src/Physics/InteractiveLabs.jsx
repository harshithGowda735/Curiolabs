import { useEffect, useMemo, useRef, useState } from 'react'
import MissionShell from '../components/MissionShell'
import { Sparkles, Play, RotateCcw, Activity } from 'lucide-react'

const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
const path = (points, sx, sy) => points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')

function Bench({ kind }) {
  const colors = { ohm: '#f97316', pendulum: '#0284c7', projectile: '#e11d48', hysteresis: '#7c3aed', diode: '#16a34a', slit: '#ca8a04' }
  const accent = colors[kind] || '#A4C93B'
  return (
    <div className="h-44 overflow-hidden rounded-2xl border-2 border-[#221611] bg-[#221611] p-4 flex flex-col justify-between relative shadow-[3px_3px_0px_#221611]">
      <div className="flex justify-between items-center z-10">
        <span className="text-[11px] font-mono tracking-widest text-[#FAF5EB]/70 uppercase font-black">
          University Physics Bench • Calibrated
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#221611] bg-[#A4C93B] px-2.5 py-0.5 rounded-full border border-[#221611]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#221611] animate-ping"></span> ONLINE
        </span>
      </div>
      <div className="relative flex-1 flex items-center justify-center">
        <svg viewBox="0 0 360 90" className="w-full h-full max-w-md drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
          <polygon points="180,10 330,35 180,60 30,35" fill="#2d1e17" stroke="#3A2820" strokeWidth="1.5" />
          <polygon points="30,35 180,60 180,72 30,47" fill="#1b120e" />
          <polygon points="180,60 330,35 330,47 180,72" fill="#2d1e17" />
          
          <polygon points="180,22 230,31 180,40 130,31" fill={accent} opacity="0.9" />
          <polygon points="130,31 180,40 180,48 130,39" fill={accent} opacity="0.7" />
          <polygon points="180,40 230,31 230,39 180,48" fill={accent} opacity="0.6" />
          
          <g>
            <ellipse cx="90" cy="30" rx="10" ry="5" fill="#64748b" />
            <rect x="80" y="24" width="20" height="6" fill="#475569" />
            <ellipse cx="90" cy="24" rx="10" ry="5" fill="#94a3b8" />
          </g>
          
          <circle cx="270" cy="33" r="8" fill="#A4C93B" opacity="0.9" />
          <circle cx="270" cy="33" r="12" fill="none" stroke="#A4C93B" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        </svg>
      </div>
      <div className="text-[10px] text-[#FAF5EB]/50 font-mono flex justify-between z-10 font-bold">
        <span>ISO-9001 TESTBENCH</span>
        <span className="text-[#A4C93B]">PRECISION SENSORS READY</span>
      </div>
    </div>
  )
}

function SvgGraph({ title, series, yLabel = 'value', colors = ['#0284c7', '#ea580c'] }) {
  const W = 520, H = 190, P = 30
  const all = series.flatMap(s => s.points)
  const xmax = Math.max(1, ...all.map(p => p.x))
  const ymin = Math.min(0, ...all.map(p => p.y))
  const ymax = Math.max(1, ...all.map(p => p.y))
  const sx = x => P + x / xmax * (W - P * 2)
  const sy = y => H - P - (y - ymin) / Math.max(1e-6, ymax - ymin) * (H - P * 2)
  return (
    <div className="rounded-2xl border-2 border-[#221611] bg-white p-4 shadow-[3px_3px_0px_#221611]">
      <div className="mb-2 flex justify-between text-xs font-black uppercase text-[#221611]">
        <span>{title}</span>
        <span className="font-mono text-[11px] text-[#221611]/70">{yLabel}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-[#FAF5EB] rounded-xl p-2 border border-[#221611]/15" role="img" aria-label={title}>
        <path d={`M${P} ${P}V${H-P}H${W-P}`} fill="none" stroke="#221611" strokeWidth="2" />
        {[.25,.5,.75].map(n => <line key={n} x1={P} x2={W-P} y1={P+n*(H-2*P)} y2={P+n*(H-2*P)} stroke="#221611" strokeOpacity="0.12" strokeDasharray="3 3" />)}
        {series.map((s, i) => <polyline key={s.name} points={path(s.points, sx, sy)} fill="none" stroke={colors[i]} strokeWidth="3" />)}
        {series.map((s, i) => <text key={s.name} x={W - P - i * 82} y={16} fill={colors[i]} fontSize="11" fontWeight="bold">{s.name}</text>)}
      </svg>
    </div>
  )
}

function Palette({ items, placed, setPlaced }) {
  const drop = e => {
    e.preventDefault()
    const item = e.dataTransfer.getData('text/plain')
    if (item && !placed.includes(item)) setPlaced([...placed, item])
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="rounded-2xl bg-[#221611] p-4 text-[#FAF5EB] border-2 border-[#221611] shadow-[2px_2px_0px_#221611]">
        <p className="mb-2.5 text-xs font-black uppercase tracking-wider text-[#A4C93B]">
          Apparatus Tray — Drag Items
        </p>
        <div className="flex flex-wrap gap-2">
          {items.map(x => (
            <button
              draggable
              onDragStart={e => e.dataTransfer.setData('text/plain', x)}
              key={x}
              className="cursor-grab rounded-xl border-2 border-[#221611] bg-[#FAF5EB] px-3 py-1.5 text-xs font-bold text-[#221611] hover:bg-[#A4C93B] active:cursor-grabbing shadow-xs transition-colors"
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      <div
        onDrop={drop}
        onDragOver={e => e.preventDefault()}
        className="min-h-24 rounded-2xl border-2 border-dashed border-[#221611] bg-[#FAF5EB] p-4 flex flex-col justify-between"
      >
        <p className="text-xs font-black uppercase text-[#221611]">
          Work Surface — Drop Apparatus Here
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {placed.map(x => (
            <span key={x} className="rounded-xl border-2 border-[#221611] bg-white px-2.5 py-1 text-xs font-extrabold text-[#221611] shadow-xs flex items-center gap-1">
              {x} <span className="text-[#A4C93B]">✓</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Frame({ title, emoji, kind, steps, controls, visualization, observations, ready, tutor, records, onRecord }) {
  const mistakes = ready ? [] : ['Setup incomplete: drag the required apparatus onto the work surface before recording readings.']
  return (
    <MissionShell
      title={title}
      titleEmoji={emoji}
      subject="Physics"
      accentColor="blue"
      gradientFrom="from-slate-800"
      gradientTo="to-cyan-700"
      steps={steps}
      currentStep={ready ? 3 : 0}
      observations={observations}
      controls={
        <div className="space-y-4">
          <Bench kind={kind} />
          {controls}
          <div className="rounded-2xl border-2 border-[#221611] bg-white p-4 text-xs text-[#221611] shadow-[2px_2px_0px_#221611]">
            <b className="font-black uppercase text-[#221611] block mb-1">AI Laboratory Tutor:</b>
            <p className="leading-relaxed font-medium text-[#221611]/80">{tutor}</p>
          </div>
          {mistakes.map(m => (
            <div key={m} className="rounded-xl bg-amber-50 border-2 border-amber-300 p-3 text-xs font-bold text-amber-900">
              ⚠ {m}
            </div>
          ))}
        </div>
      }
      visualization={
        <div className="space-y-4">
          {visualization}
          <div className="rounded-2xl border-2 border-[#221611] bg-white p-4 shadow-[3px_3px_0px_#221611]">
            <div className="mb-3 flex items-center justify-between">
              <b className="text-xs font-black uppercase text-[#221611]">Live Data Collection Table</b>
              <button
                onClick={onRecord}
                disabled={!ready}
                className="rounded-xl bg-[#A4C93B] hover:bg-[#93b533] text-[#221611] border-2 border-[#221611] px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_#221611] active:translate-x-[1px] active:translate-y-[1px] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Record Reading
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border-2 border-[#221611]/15">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#221611] text-[#FAF5EB] font-mono text-[11px] font-bold uppercase">
                  <tr>
                    <th className="px-3 py-2">Trial</th>
                    <th className="px-4 py-2">Measurement</th>
                    <th className="px-4 py-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length ? (
                    records.map((r, i) => (
                      <tr key={i} className="border-t border-[#221611]/10 hover:bg-[#FAF5EB]/60">
                        <td className="px-3 py-2 font-bold text-[#221611]">{i + 1}</td>
                        <td className="px-4 py-2 font-mono text-[#221611]">{r.a}</td>
                        <td className="px-4 py-2 font-mono font-bold text-[#221611]">{r.b}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-5 text-center text-[#221611]/50 font-medium">
                        Record a live measurement to build your results table.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    />
  )
}

export function OhmsLab() {
  const [placed, setPlaced] = useState([])
  const [voltage, setVoltage] = useState(6)
  const [resistance, setResistance] = useState(120)
  const [records, setRecords] = useState([])
  const ready = ['Battery', 'Resistor', 'Ammeter', 'Voltmeter', 'Wire'].every(x => placed.includes(x))
  const current = voltage / resistance
  const power = voltage * current
  const pts = Array.from({ length: 13 }, (_, i) => ({ x: i * 1.5, y: (i * 1.5 / resistance) * 1000 }))
  return (
    <Frame
      title="Ohm’s Law • circuit bench"
      emoji="⚡"
      kind="ohm"
      ready={ready}
      records={records}
      onRecord={() => setRecords([...records, { a: `${voltage.toFixed(1)} V × ${resistance} Ω`, b: `${(current * 1000).toFixed(2)} mA · ${(power * 1000).toFixed(1)} mW` }])}
      steps={[
        { title: 'Place Apparatus', description: 'Drag all circuit components from tray to bench' },
        { title: 'Wire Terminals', description: 'Verify closed series circuit loop' },
        { title: 'Energize Bench', description: 'Adjust DC voltage supply dial' },
        { title: 'Record V-I', description: 'Record readings to verify linear V = I · R slope' }
      ]}
      observations={[
        'Electron drift current is strictly proportional to applied potential difference (Ohmic regime).',
        'Joule heating power follows P = I²R, accelerating dissipated thermal field at higher currents.'
      ]}
      tutor="Place every instrument on the workbench, then sweep the DC voltage supply and resistor dials to observe the linear V–I characteristic."
      controls={
        <div className="space-y-3">
          <Palette items={['Battery', 'Resistor', 'Ammeter', 'Voltmeter', 'Wire']} placed={placed} setPlaced={setPlaced} />
          <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border-2 border-[#221611] shadow-[2px_2px_0px_#221611]">
            <label className="text-xs font-black uppercase text-[#221611]">
              Battery Supply: {voltage} V
              <input className="w-full mt-1.5 accent-[#221611]" type="range" min="1" max="18" value={voltage} onChange={e => setVoltage(+e.target.value)} />
            </label>
            <label className="text-xs font-black uppercase text-[#221611]">
              Resistor: {resistance} Ω
              <input className="w-full mt-1.5 accent-[#221611]" type="range" min="20" max="500" value={resistance} onChange={e => setResistance(+e.target.value)} />
            </label>
          </div>
          <div className="rounded-xl border-2 border-[#221611] bg-[#FAF5EB] p-3 text-xs font-mono font-bold text-[#221611]">
            ⚡ {ready ? 'CIRCUIT ENERGIZED' : 'OPEN CIRCUIT'} · I = {(current * 1000).toFixed(1)} mA · <span className={power > 0.35 ? 'text-red-600 font-black' : ''}>P = {(power * 1000).toFixed(1)} mW</span>
          </div>
        </div>
      }
      visualization={
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-[#221611] bg-[#221611] p-4 shadow-[3px_3px_0px_#221611]">
            <div className="h-3 rounded-full bg-[#1b120e] border border-[#3A2820] overflow-hidden">
              <div className="h-full rounded-full bg-[#A4C93B] transition-all" style={{ width: `${clamp(current * 10000, 2, 100)}%` }} />
            </div>
            <p className="mt-2 text-xs font-mono font-bold text-[#FAF5EB]/80 text-center">
              ELECTRONS DRIFT RATE → → → RESISTOR THERMAL DISSIPATION: {(power * 1000).toFixed(1)} mW
            </p>
          </div>
          <SvgGraph title="Live V–I Characteristic (Ohm's Slope)" yLabel="Current (mA)" series={[{ name: 'V–I Line', points: pts }, { name: 'Reading Point', points: [{ x: voltage, y: current * 1000 }] }]} />
        </div>
      }
    />
  )
}

export function PendulumLab() {
  const [placed, setPlaced] = useState([])
  const [L, setL] = useState(1)
  const [theta, setTheta] = useState(25)
  const [run, setRun] = useState(false)
  const [t, setT] = useState(0)
  const [records, setRecords] = useState([])
  const raf = useRef()
  const ready = placed.includes('Bob') && placed.includes('String')
  const period = 2 * Math.PI * Math.sqrt(L / 9.81)

  useEffect(() => {
    if (!run) return
    const start = performance.now() - t * 1000
    const f = n => {
      setT((n - start) / 1000)
      raf.current = requestAnimationFrame(f)
    }
    raf.current = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf.current)
  }, [run])

  const a = run ? theta * Math.cos(2 * Math.PI * t / period) * Math.exp(-0.015 * t) : theta
  const bx = 200 + 125 * L * Math.sin(a * Math.PI / 180)
  const by = 28 + 125 * L * Math.cos(a * Math.PI / 180)
  const graph = Array.from({ length: 8 }, (_, i) => ({ x: 0.3 + i * 0.2, y: (2 * Math.PI * Math.sqrt((0.3 + i * 0.2) / 9.81)) ** 2 }))

  return (
    <Frame
      title="Simple Pendulum • measurement rig"
      emoji="◉"
      kind="pendulum"
      ready={ready}
      records={records}
      onRecord={() => setRecords([...records, { a: `L = ${L.toFixed(2)} m`, b: `T = ${period.toFixed(3)} s` }])}
      steps={[
        { title: 'Rig Apparatus', description: 'Mount string and brass bob to the retort clamp' },
        { title: 'Set Length L', description: 'Adjust pendulum suspension length' },
        { title: 'Release Angle θ', description: 'Displace bob horizontally (< 15° for SHM)' },
        { title: 'Calculate g', description: 'Measure period T and compute local gravitational acceleration' }
      ]}
      observations={[
        'Pendulum period T is independent of bob mass (Galilean principle of equivalence).',
        'The gradient of the T² vs L line equals 4π²/g, yielding g ≈ 9.81 m/s².'
      ]}
      tutor="Displace the bob sideways to set amplitude, then start the precision optical timer to measure periodic oscillations."
      controls={
        <div className="space-y-3">
          <Palette items={['Tripod', 'String', 'Bob', 'Photogate']} placed={placed} setPlaced={setPlaced} />
          <button
            onClick={() => setRun(!run)}
            className="w-full rounded-2xl bg-[#A4C93B] hover:bg-[#93b533] py-3 text-xs font-black uppercase text-[#221611] border-2 border-[#221611] shadow-[3px_3px_0px_#221611] transition-all cursor-pointer"
          >
            {run ? 'Stop Precision Timer' : 'Release Bob & Start Timer'}
          </button>
          <div className="p-3 bg-white rounded-xl border-2 border-[#221611] text-xs font-mono font-bold text-[#221611]">
            Length L = {L.toFixed(2)} m · Timer = {t.toFixed(2)} s · Period T = {period.toFixed(3)} s
          </div>
        </div>
      }
      visualization={
        <div className="space-y-4">
          <svg
            viewBox="0 0 400 260"
            className="w-full rounded-2xl bg-[#FAF5EB] border-2 border-[#221611] shadow-[3px_3px_0px_#221611]"
            onPointerMove={e => {
              if (!run && e.buttons) {
                const r = e.currentTarget.getBoundingClientRect()
                setL(clamp((e.clientY - r.top) / r.height * 1.6, 0.25, 1.8))
                setTheta(clamp((e.clientX - r.left) / r.width * 100 - 50, -45, 45))
              }
            }}
          >
            <rect x="150" y="16" width="100" height="12" rx="4" fill="#221611" />
            <line x1="200" y1="28" x2={bx} y2={by} stroke="#221611" strokeWidth="2.5" />
            <circle cx={bx} cy={by} r="18" fill="#A4C93B" stroke="#221611" strokeWidth="2.5" />
            <text x="20" y="240" fontSize="11" fontWeight="bold" fill="#221611" fontFamily="monospace">
              INTERACTIVE: DRAG BOB TO SET LENGTH & RELEASE ANGLE
            </text>
          </svg>
          <SvgGraph title="Automatic T² vs L Verification" yLabel="T² (s²)" series={[{ name: 'T²', points: graph }]} />
        </div>
      }
    />
  )
}

export function ProjectileLab() {
  const [placed, setPlaced] = useState([])
  const [angle, setAngle] = useState(45)
  const [v, setV] = useState(28)
  const [g, setG] = useState(9.81)
  const [run, setRun] = useState(false)
  const [clock, setClock] = useState(0)
  const [records, setRecords] = useState([])
  const ref = useRef()
  const rad = angle * Math.PI / 180
  const vx = v * Math.cos(rad)
  const vy = v * Math.sin(rad)
  const T = 2 * vy / g
  const R = vx * T
  const H = vy * vy / (2 * g)
  const ready = placed.includes('Cannon') && placed.includes('Projectile')

  useEffect(() => {
    if (!run) return
    const start = performance.now()
    const f = n => {
      const z = (n - start) / 700
      if (z >= T) {
        setClock(T)
        setRun(false)
        return
      }
      setClock(z)
      ref.current = requestAnimationFrame(f)
    }
    ref.current = requestAnimationFrame(f)
    return () => cancelAnimationFrame(ref.current)
  }, [run, T])

  const pts = Array.from({ length: 80 }, (_, i) => {
    const q = i / 79 * T
    return { x: vx * q, y: Math.max(0, vy * q - 0.5 * g * q * q) }
  })
  const ball = { x: vx * clock, y: Math.max(0, vy * clock - 0.5 * g * clock * clock) }

  return (
    <Frame
      title="Projectile Motion • launch range"
      emoji="◢"
      kind="projectile"
      ready={ready}
      records={records}
      onRecord={() => setRecords([...records, { a: `${v} m/s @ ${angle}°`, b: `R = ${R.toFixed(1)} m · H = ${H.toFixed(1)} m` }])}
      steps={[
        { title: 'Mount Cannon', description: 'Position projectile barrel on the test ground' },
        { title: 'Aim Launch Angle', description: 'Rotate angle dial (45° maximizes horizontal range)' },
        { title: 'Launch Ball', description: 'Fire projectile and track kinematic trajectory' },
        { title: 'Analyze Range', description: 'Verify Range R = (v² sin 2θ) / g' }
      ]}
      observations={[
        'Maximum horizontal range occurs at launch angle θ = 45° in vacuum conditions.',
        'Horizontal velocity vx remains constant, while vertical velocity vy accelerates under gravity g.'
      ]}
      tutor="Adjust barrel elevation angle and muzzle velocity to chart parabolic kinematic trajectory."
      controls={
        <div className="space-y-3">
          <Palette items={['Cannon', 'Projectile', 'Range sensor']} placed={placed} setPlaced={setPlaced} />
          <button
            onClick={() => { setClock(0); setRun(true) }}
            className="w-full rounded-2xl bg-[#A4C93B] hover:bg-[#93b533] py-3 text-xs font-black uppercase text-[#221611] border-2 border-[#221611] shadow-[3px_3px_0px_#221611] transition-all cursor-pointer"
          >
            Launch Projectile
          </button>
          <div className="grid grid-cols-3 text-xs font-mono font-bold bg-white p-3 rounded-xl border-2 border-[#221611] text-[#221611]">
            <span>Angle: {angle}°</span>
            <span>Velocity: {v} m/s</span>
            <span>g: {g.toFixed(1)}</span>
          </div>
          <label className="block text-xs font-black uppercase text-[#221611]">
            Gravity Control (g): {g.toFixed(1)} m/s²
            <input className="w-full mt-1.5 accent-[#221611]" type="range" min="3" max="15" step="0.1" value={g} onChange={e => setG(+e.target.value)} />
          </label>
        </div>
      }
      visualization={
        <div className="space-y-4">
          <svg
            viewBox="0 0 520 230"
            className="w-full rounded-2xl bg-[#FAF5EB] border-2 border-[#221611] shadow-[3px_3px_0px_#221611]"
            onPointerMove={e => {
              if (!run && e.buttons) {
                const r = e.currentTarget.getBoundingClientRect()
                setAngle(clamp((r.bottom - e.clientY) / r.height * 85, 10, 80))
                setV(clamp((e.clientX - r.left) / r.width * 55, 8, 60))
              }
            }}
          >
            <line x1="20" y1="205" x2="500" y2="205" stroke="#221611" strokeWidth="3" />
            {pts.map((p, i) => (
              <circle key={i} cx={20 + p.x / R * 460} cy={205 - p.y / Math.max(H, 1) * 160} r="1.5" fill="#221611" opacity="0.3" />
            ))}
            <circle cx={20 + ball.x / R * 460} cy={205 - ball.y / Math.max(H, 1) * 160} r="8" fill="#A4C93B" stroke="#221611" strokeWidth="2" />
            <text x="22" y="26" fontSize="11" fontWeight="bold" fill="#221611" fontFamily="monospace">
              CLICK & DRAG TO AIM BARREL AND CHARGE MUZZLE SPEED
            </text>
          </svg>
          <SvgGraph title="Position & Velocity Kinematic Curves" yLabel="m, m/s" series={[{ name: 'Position', points: pts.map((p, i) => ({ x: i / 79 * T, y: p.y })) }, { name: 'Velocity', points: pts.map((p, i) => ({ x: i / 79 * T, y: vy - g * i / 79 * T })) }]} />
        </div>
      }
    />
  )
}

export function HysteresisLab() {
  const [field, setField] = useState(0)
  const [records, setRecords] = useState([])
  const pts = Array.from({ length: 100 }, (_, i) => {
    const h = -3 + i * 6 / 99
    return { x: h, y: Math.tanh((h - field * 0.3) * 1.4) + (h > 0 ? 0.13 : -0.13) }
  })
  return (
    <Frame
      title="Magnetic Hysteresis • material analyser"
      emoji="🧲"
      kind="hysteresis"
      ready
      records={records}
      onRecord={() => setRecords([...records, { a: `H = ${field.toFixed(2)} A/m`, b: `B = ${Math.tanh(field).toFixed(3)} T` }])}
      steps={[
        { title: 'Mount Specimen', description: 'Insert ferromagnetic core inside solenoid' },
        { title: 'Sweep Magnetizing Field H', description: 'Vary alternating current magnetizing intensity' },
        { title: 'Observe Magnetic Domains', description: 'Monitor Weiss domain dipole alignment' },
        { title: 'Measure Retentivity', description: 'Determine remanence Br and coercive force Hc' }
      ]}
      observations={[
        'Retentivity Br is the residual magnetic flux density remaining when H drops to zero.',
        'Coercivity Hc is the reverse field required to reduce residual magnetization to zero.'
      ]}
      tutor="Sweep the external magnetic field H across forward and reverse cycles to trace the characteristic B–H hysteresis loop."
      controls={
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase text-[#221611]">
            Magnetic Field H = {field.toFixed(2)} A/m
            <input className="w-full mt-1.5 accent-[#221611]" type="range" min="-3" max="3" step="0.05" value={field} onChange={e => setField(+e.target.value)} />
          </label>
          <div className="grid grid-cols-8 gap-1.5 p-3 rounded-2xl bg-white border-2 border-[#221611]">
            {Array.from({ length: 24 }, (_, i) => (
              <span
                key={i}
                className="h-6 rounded bg-[#221611] transition-transform"
                style={{ transform: `rotate(${field * 28 + (i % 3) * 8}deg)`, opacity: 0.5 + Math.abs(field) / 5 }}
              />
            ))}
          </div>
          <div className="p-3 bg-[#FAF5EB] rounded-xl border-2 border-[#221611] text-xs font-mono font-bold text-[#221611]">
            Retentivity Br ≈ 0.13 T · Coercivity Hc ≈ 0.18 A/m
          </div>
        </div>
      }
      visualization={<SvgGraph title="Real-time Ferromagnetic B–H Loop" yLabel="Flux B (T)" series={[{ name: 'B(H)', points: pts }]} />}
    />
  )
}

export function DiodeLab() {
  const [placed, setPlaced] = useState([])
  const [level, setLevel] = useState(2)
  const [mode, setMode] = useState('clip')
  const [records, setRecords] = useState([])
  const ready = ['Diode', 'Resistor', 'Source', 'Wire'].every(x => placed.includes(x))
  const points = Array.from({ length: 120 }, (_, i) => {
    const x = i / 119 * 4 * Math.PI
    const vin = 5 * Math.sin(x)
    return { x: i, y: mode === 'clip' ? Math.min(vin, level + 0.7) : vin + level + 5 }
  })
  const input = Array.from({ length: 120 }, (_, i) => ({ x: i, y: 5 * Math.sin(i / 119 * 4 * Math.PI) }))

  return (
    <Frame
      title="Diode Clipping & Clamping • breadboard"
      emoji="∿"
      kind="diode"
      ready={ready}
      records={records}
      onRecord={() => setRecords([...records, { a: `${mode} at ${level} V`, b: `Vout peak = ${Math.max(...points.map(p => p.y)).toFixed(1)} V` }])}
      steps={[
        { title: 'Populate Breadboard', description: 'Connect PN junction diode, load resistor, and bias' },
        { title: 'Select Circuit Mode', description: 'Toggle between positive clipper and DC restorer clamper' },
        { title: 'Adjust Clipping Level', description: 'Set DC reference bias threshold voltage' },
        { title: 'Measure Output', description: 'Compare input and clipped waveforms on DSO' }
      ]}
      observations={[
        'Clipper circuits clip off portions of signal voltage above or below reference level.',
        'Clamper circuits shift the DC baseline of the waveform without altering its peak-to-peak shape.'
      ]}
      tutor="Connect the diode and resistor in series/shunt orientation to switch between clipping wave slices and level shifting."
      controls={
        <div className="space-y-3">
          <Palette items={['Source', 'Resistor', 'Diode', 'Capacitor', 'Wire', 'Oscilloscope']} placed={placed} setPlaced={setPlaced} />
          <div className="flex gap-2">
            <button
              onClick={() => setMode('clip')}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border-2 border-[#221611] transition-all ${mode === 'clip' ? 'bg-[#A4C93B] text-[#221611] shadow-[2px_2px_0px_#221611]' : 'bg-[#FAF5EB] text-[#221611]'}`}
            >
              Clipper Mode
            </button>
            <button
              onClick={() => setMode('clamp')}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border-2 border-[#221611] transition-all ${mode === 'clamp' ? 'bg-[#A4C93B] text-[#221611] shadow-[2px_2px_0px_#221611]' : 'bg-[#FAF5EB] text-[#221611]'}`}
            >
              Clamper Mode
            </button>
          </div>
          <label className="block text-xs font-black uppercase text-[#221611]">
            Reference Bias Level: {level} V
            <input className="w-full mt-1.5 accent-[#221611]" type="range" min="0" max="5" step="0.1" value={level} onChange={e => setLevel(+e.target.value)} />
          </label>
        </div>
      }
      visualization={<SvgGraph title="Dual-Trace Oscilloscope — Input vs Output" yLabel="Voltage (V)" series={[{ name: 'Input Vin', points: input }, { name: 'Output Vout', points }]} />}
    />
  )
}

export function DoubleSlitLab() {
  const [slit, setSlit] = useState(0.25)
  const [distance, setDistance] = useState(1.5)
  const [records, setRecords] = useState([])
  const lambda = 550e-9
  const fringe = lambda * distance / (slit * 1e-3) * 1000
  const intensity = Array.from({ length: 180 }, (_, i) => {
    const x = (i - 90) / 18
    const beta = Math.PI * 0.15 * x
    return { x: i, y: (Math.cos(beta) ** 2) * (Math.sin(beta * 0.45) / (beta * 0.45 || 1)) ** 2 }
  })

  return (
    <Frame
      title="Young’s Double Slit • optical bench"
      emoji="☀"
      kind="slit"
      ready
      records={records}
      onRecord={() => setRecords([...records, { a: `D = ${distance.toFixed(2)} m · d = ${slit.toFixed(2)} mm`, b: `Fringe β = ${fringe.toFixed(2)} mm` }])}
      steps={[
        { title: 'Align Monochromatic Laser', description: 'Aim 550nm green light source through double slits' },
        { title: 'Adjust Slit Separation d', description: 'Vary aperture spacing between diffraction slits' },
        { title: 'Position Screen Distance D', description: 'Move projection screen along calibrated rail' },
        { title: 'Measure Fringe Width β', description: 'Measure distance between adjacent constructive fringes' }
      ]}
      observations={[
        'Constructive interference fringes occur where optical path difference equals m · λ.',
        'Fringe width β is inversely proportional to slit separation d (β = λ·D / d).'
      ]}
      tutor="Adjust slit separation and projection screen distance to observe how the interference fringe width expands or contracts."
      controls={
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase text-[#221611]">
            Slit Separation (d): {slit.toFixed(2)} mm
            <input className="w-full mt-1.5 accent-[#221611]" type="range" min="0.08" max="0.8" step="0.01" value={slit} onChange={e => setSlit(+e.target.value)} />
          </label>
          <label className="block text-xs font-black uppercase text-[#221611]">
            Screen Distance (D): {distance.toFixed(2)} m
            <input className="w-full mt-1.5 accent-[#221611]" type="range" min="0.5" max="3" step="0.05" value={distance} onChange={e => setDistance(+e.target.value)} />
          </label>
          <div className="p-3 bg-white rounded-xl border-2 border-[#221611] text-xs font-mono font-bold text-[#221611]">
            Ruler Measurement: Fringe Width β = {fringe.toFixed(2)} mm
          </div>
        </div>
      }
      visualization={
        <div className="space-y-4">
          <div className="flex h-24 items-stretch overflow-hidden rounded-2xl border-2 border-[#221611] bg-[#221611]">
            {intensity.map((p, i) => (
              <span key={i} className="flex-1" style={{ background: `rgba(164, 201, 59, ${clamp(p.y, 0, 1)})` }} />
            ))}
          </div>
          <SvgGraph title="Fringe Optical Intensity Distribution" yLabel="Relative Intensity" series={[{ name: 'I(x)', points: intensity }]} />
        </div>
      }
    />
  )
}
