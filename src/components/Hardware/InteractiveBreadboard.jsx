import { useState, useCallback, useRef } from 'react'

/* ════════════════════════════════════════════════════════════
   LAYOUT CONSTANTS & GRID
   ════════════════════════════════════════════════════════════ */
const S = 22             // hole spacing (px)
const R = 3.2            // hole radius
const X0 = 150           // first column x offset
const COLS = 30          // 30 columns (full dual-IC breadboard)
const SVG_W = 1040
const SVG_H = 550

const colX = (c) => X0 + (c - 1) * S
const ROWS_TOP = ['A', 'B', 'C', 'D', 'E']
const ROWS_BOT = ['F', 'G', 'H', 'I', 'J']
const ROW_Y = {
  A: 110, B: 132, C: 154, D: 176, E: 198,
  F: 262, G: 284, H: 306, I: 328, J: 350
}
const rowY = (r) => ROW_Y[r]

// Power rails
const RAIL = { tp: 50, tm: 72, bp: 408, bm: 430 }

/* ════════════════════════════════════════════════════════════
   DUAL IC 4051 PIN MAPPINGS
   IC1 (MUX): Columns 7 to 14
   IC2 (DEMUX): Columns 17 to 24
   ════════════════════════════════════════════════════════════ */
const IC1_COL_START = 7
const IC1_COL_END = 14
const IC2_COL_START = 17
const IC2_COL_END = 24

export const IC1_PINS = [
  { pin: 1,  label: 'CH4',  row: 'E', col: 7 },
  { pin: 2,  label: 'CH6',  row: 'E', col: 8 },
  { pin: 3,  label: 'TDM',  row: 'E', col: 9 },  // COM (TDM Output)
  { pin: 4,  label: 'CH7',  row: 'E', col: 10 },
  { pin: 5,  label: 'CH5',  row: 'E', col: 11 },
  { pin: 6,  label: 'INH',  row: 'E', col: 12 }, // Inhibit -> GND
  { pin: 7,  label: 'VEE',  row: 'E', col: 13 }, // Negative supply -> GND
  { pin: 8,  label: 'VSS',  row: 'E', col: 14 }, // Ground -> GND
  { pin: 16, label: 'VDD',  row: 'F', col: 7 },  // +5V Supply
  { pin: 15, label: 'CH2',  row: 'F', col: 8 },
  { pin: 14, label: 'X1',   row: 'F', col: 9 },  // CH1 Input (300Hz Triangle)
  { pin: 13, label: 'X0',   row: 'F', col: 10 }, // CH0 Input (100Hz Sine)
  { pin: 12, label: 'CH3',  row: 'F', col: 11 },
  { pin: 11, label: 'A',    row: 'F', col: 12 }, // Address A (Control Clock)
  { pin: 10, label: 'B',    row: 'F', col: 13 }, // Address B -> GND
  { pin: 9,  label: 'C',    row: 'F', col: 14 }, // Address C -> GND
]

export const IC2_PINS = [
  { pin: 1,  label: 'Y4',   row: 'E', col: 17 },
  { pin: 2,  label: 'Y6',   row: 'E', col: 18 },
  { pin: 3,  label: 'COM',  row: 'E', col: 19 }, // COM In (from Mux Pin 3)
  { pin: 4,  label: 'Y7',   row: 'E', col: 20 },
  { pin: 5,  label: 'Y5',   row: 'E', col: 21 },
  { pin: 6,  label: 'INH',  row: 'E', col: 22 }, // Inhibit -> GND
  { pin: 7,  label: 'VEE',  row: 'E', col: 23 }, // VEE -> GND
  { pin: 8,  label: 'VSS',  row: 'E', col: 24 }, // Ground -> GND
  { pin: 16, label: 'VDD',  row: 'F', col: 17 }, // +5V Supply
  { pin: 15, label: 'Y2',   row: 'F', col: 18 },
  { pin: 14, label: 'Y1',   row: 'F', col: 19 }, // Demux Out 1 (to R2/C2 Filter)
  { pin: 13, label: 'Y0',   row: 'F', col: 20 }, // Demux Out 0 (to R1/C1 Filter)
  { pin: 12, label: 'Y3',   row: 'F', col: 21 },
  { pin: 11, label: 'A',    row: 'F', col: 22 }, // Address A (from Mux Pin 11)
  { pin: 10, label: 'B',    row: 'F', col: 23 }, // Address B -> GND
  { pin: 9,  label: 'C',    row: 'F', col: 24 }, // Address C -> GND
]

const ALL_IC_PINS = [
  ...IC1_PINS.map(p => ({ ...p, ic: 'IC1' })),
  ...IC2_PINS.map(p => ({ ...p, ic: 'IC2' }))
]

const IC_OCCUPIED = new Set(ALL_IC_PINS.map(p => `${p.row}-${p.col}`))

/* ════════════════════════════════════════════════════════════
   BENCH EQUIPMENT TERMINALS (Realistic Hardware Styling)
   ════════════════════════════════════════════════════════════ */
export const TERMINALS = [
  // Left: Power Supply & Signal Generator Terminal Panel
  { id: 'pwr',  label: 'DC +5V Rail',          shortLabel: '+5V',   sub: 'DC 5V Supply',   x: 35, y: 70,  type: 'banana', color: '#ef4444', ring: '#fee2e2' },
  { id: 'gnd',  label: 'Ground (0V)',          shortLabel: 'GND',   sub: 'Circuit Common',  x: 35, y: 130, type: 'banana', color: '#1e293b', ring: '#e2e8f0' },
  { id: 'sig0', label: 'FG1 Sine (100Hz)',     shortLabel: 'CH0',   sub: '1V 100Hz Message', x: 35, y: 195, type: 'bnc',    color: '#ca8a04', ring: '#fef08a' },
  { id: 'sig1', label: 'FG2 Triangle (300Hz)', shortLabel: 'CH1',   sub: '1V 300Hz Message', x: 35, y: 260, type: 'bnc',    color: '#16a34a', ring: '#bbf7d0' },
  { id: 'clk',  label: 'Control Clock (2kHz)', shortLabel: 'CLK',   sub: '5V TTL Square',   x: 35, y: 325, type: 'bnc',    color: '#2563eb', ring: '#bfdbfe' },

  // Right: DSO Oscilloscope Probe Hub
  { id: 'probe_tdm', label: 'DSO Probe: Pin 3 (TDM)',   shortLabel: 'TDM',  sub: 'Composite Bus', x: SVG_W - 80, y: 140, type: 'probe', color: '#9333ea', ring: '#f3e8ff' },
  { id: 'probe_rc0', label: 'DSO Probe: Filtered CH0',  shortLabel: 'REC0', sub: '100Hz Sine Out', x: SVG_W - 80, y: 215, type: 'probe', color: '#0284c7', ring: '#e0f2fe' },
  { id: 'probe_rc1', label: 'DSO Probe: Filtered CH1',  shortLabel: 'REC1', sub: '300Hz Tri Out',  x: SVG_W - 80, y: 290, type: 'probe', color: '#059669', ring: '#d1fae5' },
]

export const termPos = (t) => {
  if (t.x < SVG_W / 2) return { x: t.x + 36, y: t.y }
  return { x: t.x - 36, y: t.y }
}

/* ════════════════════════════════════════════════════════════
   LAB PROCEDURE MAPPED CONNECTIONS
   ════════════════════════════════════════════════════════════ */
export const LAB_CONNECTIONS = [
  // Step 1: Circuit Wiring (Power & Ground & Interconnects)
  { id: 'c_pwr_mux',    step: 1, from: 'pwr',      toCol: 7,  toSec: 'bot', label: '+5V → IC1 Pin 16 (VDD)', wireColor: '#ef4444', desc: 'IC1 VDD Power Supply' },
  { id: 'c_pwr_demux',  step: 1, from: 'pwr',      toCol: 17, toSec: 'bot', label: '+5V → IC2 Pin 16 (VDD)', wireColor: '#dc2626', desc: 'IC2 VDD Power Supply' },
  { id: 'c_gnd_mux',    step: 1, from: 'gnd',      toCol: 14, toSec: 'top', label: 'GND → IC1 Pin 8 (VSS)',  wireColor: '#1e293b', desc: 'IC1 Ground Reference' },
  { id: 'c_gnd_mux_inh',step: 1, from: 'gnd',      toCol: 12, toSec: 'top', label: 'GND → IC1 Pin 6,7',      wireColor: '#475569', desc: 'IC1 Inhibit & VEE Ground' },
  { id: 'c_gnd_demux',  step: 1, from: 'gnd',      toCol: 24, toSec: 'top', label: 'GND → IC2 Pin 8,6',      wireColor: '#334155', desc: 'IC2 Ground & Inhibit' },
  { id: 'c_tdm_bridge', step: 1, from: 'hole-D-9', toCol: 19, toSec: 'top', label: 'TDM Bus: Pin 3 → Pin 3',wireColor: '#9333ea', desc: 'Mux Pin 3 to Demux Pin 3' },

  // Step 3: Message Inputs
  { id: 'c_sig_sine',   step: 3, from: 'sig0',     toCol: 10, toSec: 'bot', label: 'CH0 Sine → IC1 Pin 13',  wireColor: '#ca8a04', desc: '1V, 100Hz Sinusoidal Input' },
  { id: 'c_sig_tri',    step: 3, from: 'sig1',     toCol: 9,  toSec: 'bot', label: 'CH1 Tri → IC1 Pin 14',   wireColor: '#16a34a', desc: '1V, 300Hz Triangular Input' },

  // Step 4: Control Clock
  { id: 'c_clk_mux',    step: 4, from: 'clk',      toCol: 12, toSec: 'bot', label: 'Clock → IC1 Pin 11 (A)', wireColor: '#2563eb', desc: '5V Square Wave Select A' },
  { id: 'c_clk_bridge', step: 4, from: 'hole-G-12',toCol: 22, toSec: 'bot', label: 'Clock: Pin 11 → Pin 11',wireColor: '#3b82f6', desc: 'Clock Synchronous Bridge' },

  // Step 6: Observe TDM Output at Pin 3
  { id: 'c_probe_tdm',  step: 6, from: 'probe_tdm',toCol: 9,  toSec: 'top', label: 'DSO → IC1 Pin 3 (TDM)',  wireColor: '#a855f7', desc: 'TDM Bus Probe Line' },

  // Step 8: Observe Reconstructed Message Signals
  { id: 'c_probe_rc0',  step: 8, from: 'probe_rc0',toCol: 27, toSec: 'bot', label: 'DSO → R1/C1 Filter Out', wireColor: '#0284c7', desc: 'Recovered 100Hz Sine Wave' },
  { id: 'c_probe_rc1',  step: 8, from: 'probe_rc1',toCol: 28, toSec: 'bot', label: 'DSO → R2/C2 Filter Out', wireColor: '#059669', desc: 'Recovered 300Hz Triangle' },
]

function wirePath(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1)
  const dy = Math.abs(y2 - y1)
  const dist = Math.sqrt(dx * dx + dy * dy)
  const lift = Math.min(55, dist * 0.22) + 14
  const midX = (x1 + x2) / 2
  const midY = Math.min(y1, y2) - lift
  return `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`
}

export default function InteractiveBreadboard({
  onConnectionsChange,
  activeProcedureStep = 1,
  isPowerSwitchedOn = true
}) {
  const svgRef = useRef(null)
  const [wires, setWires] = useState([])
  const [activeWire, setActiveWire] = useState(null)
  const [cursorPos, setCursorPos] = useState(null)
  const [snappedTarget, setSnappedTarget] = useState(null)
  const [justConnected, setJustConnected] = useState(null)

  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    pt.y = e.clientY ?? e.touches?.[0]?.clientY ?? 0
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    return pt.matrixTransform(ctm.inverse())
  }, [])

  const findSnapTarget = useCallback((pt, snapRadius = 26) => {
    if (!pt) return null
    let best = null
    let minDist = snapRadius

    // 1. Terminals
    TERMINALS.forEach(t => {
      const p = termPos(t)
      const d = Math.hypot(pt.x - p.x, pt.y - p.y)
      if (d < minDist + 8) {
        minDist = d
        best = { id: `term-${t.id}`, x: p.x, y: p.y, label: t.label }
      }
    })

    // 2. Breadboard Grid
    const c = Math.round((pt.x - X0) / S) + 1
    if (c >= 1 && c <= COLS) {
      const hx = colX(c)
      const rows = { ...ROW_Y, R_TP: RAIL.tp, R_TM: RAIL.tm, R_BP: RAIL.bp, R_BM: RAIL.bm }
      Object.entries(rows).forEach(([rowKey, ry]) => {
        const d = Math.hypot(pt.x - hx, pt.y - ry)
        if (d < minDist) {
          minDist = d
          best = { id: `hole-${rowKey}-${c}`, x: hx, y: ry, label: `Col ${c}, Row ${rowKey}` }
        }
      })
    }

    // 3. IC Pin callouts
    ALL_IC_PINS.forEach(p => {
      const px = colX(p.col)
      const py = p.row === 'E' ? rowY('D') : rowY('G')
      const d = Math.hypot(pt.x - px, pt.y - py)
      if (d < minDist) {
        minDist = d
        best = { id: `hole-${p.row === 'E' ? 'D' : 'G'}-${p.col}`, x: px, y: py, label: `${p.ic} Pin ${p.pin} (${p.label})` }
      }
    })

    return best
  }, [])

  const connectionStatus = LAB_CONNECTIONS.map(req => {
    const isConnected = wires.some(w => {
      const fromMatch = w.fromId === req.from || w.fromId === `term-${req.from}`
      const toMatch = w.toId === req.from || w.toId === `term-${req.from}`
      const targetHoleId = fromMatch ? w.toId : toMatch ? w.fromId : null
      if (!targetHoleId || !targetHoleId.startsWith('hole-')) return false

      const [, row, colStr] = targetHoleId.split('-')
      const col = parseInt(colStr, 10)
      if (col !== req.toCol) return false

      const isTop = 'ABCDE'.includes(row)
      const isBot = 'FGHIJ'.includes(row)
      return req.toSec === 'top' ? isTop : isBot
    })

    return { ...req, connected: isConnected }
  })

  const connectedCount = connectionStatus.filter(c => c.connected).length
  const allConnected = connectionStatus.every(c => c.connected)

  const commitWire = useCallback((from, to) => {
    if (!from || !to || from.id === to.id) {
      setActiveWire(null)
      setSnappedTarget(null)
      return
    }

    if (from.id.startsWith('term-') && to.id.startsWith('term-')) {
      setActiveWire(null)
      setSnappedTarget(null)
      return
    }

    const exists = wires.some(w =>
      (w.fromId === from.id && w.toId === to.id) ||
      (w.fromId === to.id && w.toId === from.id)
    )

    if (!exists) {
      let color = '#3b82f6'
      const termId = from.id.startsWith('term-') ? from.id : to.id.startsWith('term-') ? to.id : null
      if (termId) {
        const raw = termId.replace('term-', '')
        const term = TERMINALS.find(t => t.id === raw)
        if (term) color = term.color
      }

      const newWire = {
        id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        fromId: from.id,
        toId: to.id,
        fromX: from.x,
        fromY: from.y,
        toX: to.x,
        toY: to.y,
        color,
      }

      const nextWires = [...wires, newWire]
      setWires(nextWires)
      if (onConnectionsChange) onConnectionsChange(nextWires)
      setJustConnected(to.label || from.label)
      setTimeout(() => setJustConnected(null), 2500)
    }

    setActiveWire(null)
    setSnappedTarget(null)
  }, [wires, onConnectionsChange])

  const handleStartWire = useCallback((startObj) => {
    if (activeWire) {
      commitWire(activeWire, startObj)
    } else {
      setActiveWire(startObj)
      setCursorPos({ x: startObj.x, y: startObj.y })
    }
  }, [activeWire, commitWire])

  const handleMouseMove = useCallback((e) => {
    const pt = getSVGPoint(e)
    setCursorPos(pt)
    if (activeWire) {
      const snap = findSnapTarget(pt, 30)
      setSnappedTarget(snap && snap.id !== activeWire.id ? snap : null)
    }
  }, [activeWire, getSVGPoint, findSnapTarget])

  const handleMouseUp = useCallback((e) => {
    if (!activeWire) return
    const pt = getSVGPoint(e)
    const snap = findSnapTarget(pt, 32)
    if (snap && snap.id !== activeWire.id) {
      commitWire(activeWire, snap)
    }
  }, [activeWire, getSVGPoint, findSnapTarget, commitWire])

  const wireStep = useCallback((stepNum) => {
    const stepWires = LAB_CONNECTIONS.filter(c => c.step === stepNum)
    const newWiresToAdd = []

    stepWires.forEach((c, idx) => {
      const isAlreadyWired = wires.some(w => {
        const fromMatch = w.fromId === c.from || w.fromId === `term-${c.from}`
        const toMatch = w.toId === c.from || w.toId === `term-${c.from}`
        const target = fromMatch ? w.toId : toMatch ? w.fromId : null
        return target && target.includes(`${c.toCol}`)
      })

      if (!isAlreadyWired) {
        let fromX = 0, fromY = 0
        if (c.from.startsWith('hole-')) {
          const [, row, col] = c.from.split('-')
          fromX = colX(parseInt(col, 10))
          fromY = rowY(row)
        } else {
          const t = TERMINALS.find(term => term.id === c.from)
          const p = termPos(t)
          fromX = p.x
          fromY = p.y
        }

        const toX = colX(c.toCol)
        const toY = c.toSec === 'top' ? rowY('D') : rowY('G')

        newWiresToAdd.push({
          id: `wire-step-${stepNum}-${idx}-${Date.now()}`,
          fromId: c.from.startsWith('hole-') ? c.from : `term-${c.from}`,
          toId: `hole-${c.toSec === 'top' ? 'D' : 'G'}-${c.toCol}`,
          fromX,
          fromY,
          toX,
          toY,
          color: c.wireColor
        })
      }
    })

    if (newWiresToAdd.length > 0) {
      const updated = [...wires, ...newWiresToAdd]
      setWires(updated)
      if (onConnectionsChange) onConnectionsChange(updated)
      setJustConnected(`Step ${stepNum} Wires Connected!`)
      setTimeout(() => setJustConnected(null), 2500)
    }
  }, [wires, onConnectionsChange])

  const autoWireCircuit = useCallback(() => {
    const newWires = LAB_CONNECTIONS.map((c, i) => {
      let fromX = 0, fromY = 0
      if (c.from.startsWith('hole-')) {
        const [, row, col] = c.from.split('-')
        fromX = colX(parseInt(col, 10))
        fromY = rowY(row)
      } else {
        const term = TERMINALS.find(t => t.id === c.from)
        const tPos = termPos(term)
        fromX = tPos.x
        fromY = tPos.y
      }

      const hx = colX(c.toCol)
      const hy = c.toSec === 'top' ? rowY('D') : rowY('G')
      return {
        id: `wire-auto-${i}-${Date.now()}`,
        fromId: c.from.startsWith('hole-') ? c.from : `term-${c.from}`,
        toId: `hole-${c.toSec === 'top' ? 'D' : 'G'}-${c.toCol}`,
        fromX,
        fromY,
        toX: hx,
        toY: hy,
        color: c.wireColor,
      }
    })

    setWires(newWires)
    setActiveWire(null)
    setSnappedTarget(null)
    if (onConnectionsChange) onConnectionsChange(newWires)
  }, [onConnectionsChange])

  const removeWire = useCallback((wireId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const filtered = wires.filter(w => w.id !== wireId)
    setWires(filtered)
    if (onConnectionsChange) onConnectionsChange(filtered)
  }, [wires, onConnectionsChange])

  const resetAll = useCallback(() => {
    setWires([])
    setActiveWire(null)
    setSnappedTarget(null)
    if (onConnectionsChange) onConnectionsChange([])
  }, [onConnectionsChange])

  return (
    <div className="w-full select-none space-y-3">
      {/* ── Top Bar with Status and Quick Actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white p-3 rounded-2xl shadow-md border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
          <div>
            <h3 className="text-xs font-bold font-mono tracking-wide text-slate-100 uppercase">
              Solderless Hardware Breadboard Simulator (CD4051 Dual-IC)
            </h3>
            <p className="text-[11px] text-slate-400">
              {activeWire ? (
                <span className="text-amber-400 font-semibold animate-pulse">
                  ⚡ Selected {activeWire.label} — Click any hole to attach wire!
                </span>
              ) : (
                'Click terminal post to start wire, then click breadboard hole to connect. Right-click wire to remove.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {justConnected && (
            <span className="text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-1 rounded-lg font-mono">
              ✓ {justConnected}
            </span>
          )}
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${allConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
            {connectedCount}/{LAB_CONNECTIONS.length} Wired
          </span>
          <button
            onClick={autoWireCircuit}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl shadow transition-all active:scale-95"
          >
            Auto-Wire (All Wires)
          </button>
          <button
            onClick={resetAll}
            className="text-xs bg-slate-800 hover:bg-slate-700 hover:text-red-400 text-slate-300 font-medium px-2.5 py-1.5 rounded-xl border border-slate-700 transition-colors"
          >
            Clear Board
          </button>
        </div>
      </div>

      {/* ── Realistic Breadboard SVG Workbench ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-300 shadow-2xl bg-gradient-to-b from-[#f2ece2] to-[#e4dbce]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-auto block"
          style={{ cursor: activeWire ? 'crosshair' : 'default' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        >
          <defs>
            {/* Realistic drop shadows */}
            <filter id="shadowHeavy" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.22" />
            </filter>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Plastic and metallic gradients */}
            <linearGradient id="bbWhitePlastic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#faf7f2" />
              <stop offset="50%" stopColor="#f4ede2" />
              <stop offset="100%" stopColor="#e8e0d4" />
            </linearGradient>
            <linearGradient id="icGradHighEnd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2c2d30" />
              <stop offset="40%" stopColor="#1e1f22" />
              <stop offset="100%" stopColor="#121315" />
            </linearGradient>
            <linearGradient id="metalBrass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
            <linearGradient id="nickelSilver" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* ════════ WORKBENCH WOODEN SURFACE BACKGROUND ════════ */}
          <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="#23272e" />
          <line x1="0" y1="0" x2={SVG_W} y2="0" stroke="#333842" strokeWidth="1" />

          {/* ════════ LEFT DOCK: POWER & FUNCTION GENERATORS ════════ */}
          <rect x="15" y="25" width="95" height={SVG_H - 50} rx="12" fill="#181a1f" stroke="#2b313c" strokeWidth="1.5" />
          <text x="62" y="48" textAnchor="middle" fontSize="7.5" fill="#94a3b8" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
            SOURCES DOCK
          </text>
          <line x1="25" y1="54" x2="100" y2="54" stroke="#2b313c" strokeWidth="1" />

          {/* ════════ RIGHT DOCK: OSCILLOSCOPE BNC PROBE HUB ════════ */}
          <rect x={SVG_W - 110} y="25" width="95" height={SVG_H - 50} rx="12" fill="#181a1f" stroke="#2b313c" strokeWidth="1.5" />
          <text x={SVG_W - 62} y="48" textAnchor="middle" fontSize="7.5" fill="#94a3b8" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
            DSO PROBE HUB
          </text>
          <line x1={SVG_W - 100} y1="54" x2={SVG_W - 25} y2="54" stroke="#2b313c" strokeWidth="1" />

          {/* ════════ SOLDERLESS BREADBOARD CHASSIS ════════ */}
          <rect x="125" y="25" width={SVG_W - 250} height={SVG_H - 50} rx="14"
            fill="url(#bbWhitePlastic)" stroke="#b8ab97" strokeWidth="2.5" filter="url(#shadowHeavy)" />

          {/* Beveled Inset Border */}
          <rect x="130" y="30" width={SVG_W - 260} height={SVG_H - 60} rx="10"
            fill="none" stroke="#d5c8b5" strokeWidth="1" />

          {/* ════════ TOP POWER RAILS (+ and -) ════════ */}
          <rect x="135" y={RAIL.tp - 9} width={colX(COLS) - 135 + 15} height="18" rx="4" fill="#fee2e2" stroke="#fca5a5" strokeWidth="0.8" />
          <line x1="138" y1={RAIL.tp - 9} x2={colX(COLS) + 15} y2={RAIL.tp - 9} stroke="#ef4444" strokeWidth="2.5" />
          <text x="142" y={RAIL.tp + 4} fontSize="11" fill="#dc2626" fontWeight="bold">+</text>

          <rect x="135" y={RAIL.tm - 9} width={colX(COLS) - 135 + 15} height="18" rx="4" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.8" />
          <line x1="138" y1={RAIL.tm + 9} x2={colX(COLS) + 15} y2={RAIL.tm + 9} stroke="#3b82f6" strokeWidth="2.5" />
          <text x="142" y={RAIL.tm + 4} fontSize="11" fill="#2563eb" fontWeight="bold">−</text>

          {/* ════════ BOTTOM POWER RAILS (+ and -) ════════ */}
          <rect x="135" y={RAIL.bp - 9} width={colX(COLS) - 135 + 15} height="18" rx="4" fill="#fee2e2" stroke="#fca5a5" strokeWidth="0.8" />
          <line x1="138" y1={RAIL.bp - 9} x2={colX(COLS) + 15} y2={RAIL.bp - 9} stroke="#ef4444" strokeWidth="2.5" />
          <text x="142" y={RAIL.bp + 4} fontSize="11" fill="#dc2626" fontWeight="bold">+</text>

          <rect x="135" y={RAIL.bm - 9} width={colX(COLS) - 135 + 15} height="18" rx="4" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.8" />
          <line x1="138" y1={RAIL.bm + 9} x2={colX(COLS) + 15} y2={RAIL.bm + 9} stroke="#3b82f6" strokeWidth="2.5" />
          <text x="142" y={RAIL.bm + 4} fontSize="11" fill="#2563eb" fontWeight="bold">−</text>

          {/* Power Rail Holes */}
          {[RAIL.tp, RAIL.tm, RAIL.bp, RAIL.bm].map(ry =>
            Array.from({ length: COLS }, (_, i) => i + 1).map(c => (
              <circle
                key={`rail-${ry}-${c}`}
                cx={colX(c)} cy={ry} r={R - 0.3}
                fill="#3f3f46" stroke="#a1a1aa" strokeWidth="0.6"
                className="cursor-pointer hover:fill-amber-400"
                onClick={() => handleStartWire({ id: `hole-${ry}-${c}`, x: colX(c), y: ry, label: `Power Rail Col ${c}` })}
              />
            ))
          )}

          {/* ════════ CENTER NOTCH GROOVE (IC DIP SOCKET SEPARATOR) ════════ */}
          <rect x="135" y="214" width={colX(COLS) - 135 + 15} height="36" rx="4" fill="#cfc2ad" stroke="#baac97" strokeWidth="1.2" />
          <line x1="135" y1="232" x2={colX(COLS) + 15} y2="232" stroke="#b0a28d" strokeWidth="1" strokeDasharray="4,4" />
          <text x={colX(15)} y="235" textAnchor="middle" fontSize="8" fill="#786c5a" fontFamily="monospace" fontWeight="bold" letterSpacing="3">
            BREADBOARD CENTER DIVIDER
          </text>

          {/* Column Numbers */}
          {Array.from({ length: COLS }, (_, i) => i + 1).map(c => (
            <g key={`num-${c}`}>
              <text x={colX(c)} y="95" textAnchor="middle" fontSize="7.5" fill="#716758" fontFamily="monospace">{c}</text>
              <text x={colX(c)} y="386" textAnchor="middle" fontSize="7.5" fill="#716758" fontFamily="monospace">{c}</text>
            </g>
          ))}

          {/* Row Letters (Left & Right) */}
          {[...ROWS_TOP, ...ROWS_BOT].map(row => (
            <g key={`row-${row}`}>
              <text x="142" y={rowY(row) + 3} textAnchor="middle" fontSize="9" fill="#716758" fontWeight="bold" fontFamily="monospace">{row}</text>
              <text x={colX(COLS) + 20} y={rowY(row) + 3} textAnchor="middle" fontSize="9" fill="#716758" fontWeight="bold" fontFamily="monospace">{row}</text>
            </g>
          ))}

          {/* Breadboard Holes Top (A-E) */}
          {ROWS_TOP.map(row =>
            Array.from({ length: COLS }, (_, i) => i + 1).map(col => {
              const hId = `${row}-${col}`
              const isOccupied = IC_OCCUPIED.has(hId)
              const x = colX(col)
              const y = rowY(row)
              const isTargeted = snappedTarget?.id === `hole-${hId}`

              return (
                <circle
                  key={`hole-${hId}`}
                  cx={x} cy={y} r={isTargeted ? R + 2.5 : R}
                  fill={isOccupied ? '#27272a' : isTargeted ? '#fbbf24' : '#52525b'}
                  stroke={isOccupied ? '#18181b' : isTargeted ? '#d97706' : '#a1a1aa'}
                  strokeWidth={isTargeted ? 2.5 : 0.8}
                  className={!isOccupied ? 'cursor-pointer' : ''}
                  onClick={() => !isOccupied && handleStartWire({ id: `hole-${hId}`, x, y, label: `Col ${col}, Row ${row}` })}
                />
              )
            })
          )}

          {/* Breadboard Holes Bottom (F-J) */}
          {ROWS_BOT.map(row =>
            Array.from({ length: COLS }, (_, i) => i + 1).map(col => {
              const hId = `${row}-${col}`
              const isOccupied = IC_OCCUPIED.has(hId)
              const x = colX(col)
              const y = rowY(row)
              const isTargeted = snappedTarget?.id === `hole-${hId}`

              return (
                <circle
                  key={`hole-${hId}`}
                  cx={x} cy={y} r={isTargeted ? R + 2.5 : R}
                  fill={isOccupied ? '#27272a' : isTargeted ? '#fbbf24' : '#52525b'}
                  stroke={isOccupied ? '#18181b' : isTargeted ? '#d97706' : '#a1a1aa'}
                  strokeWidth={isTargeted ? 2.5 : 0.8}
                  className={!isOccupied ? 'cursor-pointer' : ''}
                  onClick={() => !isOccupied && handleStartWire({ id: `hole-${hId}`, x, y, label: `Col ${col}, Row ${row}` })}
                />
              )
            })
          )}

          {/* ════════ IC 1 BODY (CD4051BE MULTIPLEXER) ════════ */}
          {(() => {
            const x1 = colX(IC1_COL_START) - 8
            const x2 = colX(IC1_COL_END) + 8
            const y1 = rowY('E') - 6
            const y2 = rowY('F') + 6
            return (
              <g className="cursor-pointer" onClick={() => handleStartWire({ id: 'hole-D-9', x: colX(9), y: rowY('D'), label: 'IC1 Mux Pin 3 (TDM Out)' })}>
                {/* Silver Lead Pins */}
                {IC1_PINS.filter(p => p.row === 'E').map(p => (
                  <rect key={`pin-top-${p.pin}`} x={colX(p.col) - 1.5} y={y1 - 4} width="3" height="5" fill="url(#nickelSilver)" />
                ))}
                {IC1_PINS.filter(p => p.row === 'F').map(p => (
                  <rect key={`pin-bot-${p.pin}`} x={colX(p.col) - 1.5} y={y2 - 1} width="3" height="5" fill="url(#nickelSilver)" />
                ))}
                {/* Epoxy Plastic Body */}
                <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx="4" fill="url(#icGradHighEnd)" stroke="#09090b" strokeWidth="1.5" filter="url(#shadowHeavy)" />
                {/* Pin 1 Index Notch */}
                <circle cx={x1 + 8} cy={(y1 + y2) / 2} r="3.5" fill="none" stroke="#52525b" strokeWidth="1.2" />
                {/* White Laser Marking */}
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 2} textAnchor="middle" fontSize="9" fill="#f8fafc" fontWeight="bold" fontFamily="monospace">
                  CD4051BE
                </text>
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 8} textAnchor="middle" fontSize="6.5" fill="#38bdf8" fontWeight="bold" fontFamily="monospace">
                  IC1: MULTIPLEXER
                </text>
              </g>
            )
          })()}

          {/* ════════ IC 2 BODY (CD4051BE DEMULTIPLEXER) ════════ */}
          {(() => {
            const x1 = colX(IC2_COL_START) - 8
            const x2 = colX(IC2_COL_END) + 8
            const y1 = rowY('E') - 6
            const y2 = rowY('F') + 6
            return (
              <g className="cursor-pointer" onClick={() => handleStartWire({ id: 'hole-D-19', x: colX(19), y: rowY('D'), label: 'IC2 Demux Pin 3 (COM In)' })}>
                {/* Silver Lead Pins */}
                {IC2_PINS.filter(p => p.row === 'E').map(p => (
                  <rect key={`pin-top-${p.pin}`} x={colX(p.col) - 1.5} y={y1 - 4} width="3" height="5" fill="url(#nickelSilver)" />
                ))}
                {IC2_PINS.filter(p => p.row === 'F').map(p => (
                  <rect key={`pin-bot-${p.pin}`} x={colX(p.col) - 1.5} y={y2 - 1} width="3" height="5" fill="url(#nickelSilver)" />
                ))}
                {/* Epoxy Plastic Body */}
                <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx="4" fill="url(#icGradHighEnd)" stroke="#09090b" strokeWidth="1.5" filter="url(#shadowHeavy)" />
                {/* Pin 1 Index Notch */}
                <circle cx={x1 + 8} cy={(y1 + y2) / 2} r="3.5" fill="none" stroke="#52525b" strokeWidth="1.2" />
                {/* White Laser Marking */}
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 2} textAnchor="middle" fontSize="9" fill="#f8fafc" fontWeight="bold" fontFamily="monospace">
                  CD4051BE
                </text>
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 8} textAnchor="middle" fontSize="6.5" fill="#34d399" fontWeight="bold" fontFamily="monospace">
                  IC2: DEMULTIPLEXER
                </text>
              </g>
            )
          })()}

          {/* IC Pin Function Callouts */}
          {ALL_IC_PINS.map(p => {
            const isTop = p.row === 'E'
            const y = isTop ? rowY('C') + 4 : rowY('H') - 2
            const isHighlighted = p.pin === 16 || p.pin === 8 || p.pin === 3 || p.pin === 11 || p.pin === 13 || p.pin === 14
            return (
              <g key={`pin-callout-${p.ic}-${p.pin}`} className="cursor-pointer"
                onClick={() => handleStartWire({ id: `hole-${isTop ? 'D' : 'G'}-${p.col}`, x: colX(p.col), y: isTop ? rowY('D') : rowY('G'), label: `${p.ic} Pin ${p.pin} (${p.label})` })}
              >
                <text x={colX(p.col)} y={y} textAnchor="middle" fontSize="6.5"
                  fill={isHighlighted ? '#0f172a' : '#64748b'} fontWeight={isHighlighted ? 'bold' : 'normal'} fontFamily="monospace">
                  {p.label}
                </text>
                <text x={colX(p.col)} y={isTop ? y - 9 : y + 9} textAnchor="middle" fontSize="5.5" fill="#94a3b8" fontFamily="monospace">
                  P{p.pin}
                </text>
              </g>
            )
          })}

          {/* ════════ RC RECONSTRUCTION LOW-PASS FILTERS (Cols 26-29) ════════ */}
          <g>
            {/* R1: 5.6k Resistor for CH0 */}
            <rect x={colX(26) - 4} y={rowY('G') - 4} width={S + 8} height="8" rx="3" fill="#e2d4b7" stroke="#8c7853" strokeWidth="1" />
            <line x1={colX(26) + 4} y1={rowY('G') - 4} x2={colX(26) + 4} y2={rowY('G') + 4} stroke="#15803d" strokeWidth="2" />
            <line x1={colX(26) + 9} y1={rowY('G') - 4} x2={colX(26) + 9} y2={rowY('G') + 4} stroke="#2563eb" strokeWidth="2" />
            <line x1={colX(26) + 14} y1={rowY('G') - 4} x2={colX(26) + 14} y2={rowY('G') + 4} stroke="#dc2626" strokeWidth="2" />
            <text x={colX(26) + 11} y={rowY('G') - 7} textAnchor="middle" fontSize="6" fill="#15803d" fontWeight="bold">R1: 5.6k</text>

            {/* C1: 0.1uF Capacitor for CH0 */}
            <circle cx={colX(27)} cy={rowY('I')} r="6" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <text x={colX(27)} y={rowY('I') + 2.5} textAnchor="middle" fontSize="5" fill="#78350f" fontWeight="bold">0.1μ</text>
            <text x={colX(27)} y={rowY('J') + 11} textAnchor="middle" fontSize="6.5" fill="#0284c7" fontWeight="bold">LPF 0</text>

            {/* R2: 5.6k Resistor for CH1 */}
            <rect x={colX(28) - 4} y={rowY('G') - 4} width={S + 8} height="8" rx="3" fill="#e2d4b7" stroke="#8c7853" strokeWidth="1" />
            <line x1={colX(28) + 4} y1={rowY('G') - 4} x2={colX(28) + 4} y2={rowY('G') + 4} stroke="#15803d" strokeWidth="2" />
            <line x1={colX(28) + 9} y1={rowY('G') - 4} x2={colX(28) + 9} y2={rowY('G') + 4} stroke="#2563eb" strokeWidth="2" />
            <line x1={colX(28) + 14} y1={rowY('G') - 4} x2={colX(28) + 14} y2={rowY('G') + 4} stroke="#dc2626" strokeWidth="2" />
            <text x={colX(28) + 11} y={rowY('G') - 7} textAnchor="middle" fontSize="6" fill="#15803d" fontWeight="bold">R2: 5.6k</text>

            {/* C2: 0.1uF Capacitor for CH1 */}
            <circle cx={colX(29)} cy={rowY('I')} r="6" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <text x={colX(29)} y={rowY('I') + 2.5} textAnchor="middle" fontSize="5" fill="#78350f" fontWeight="bold">0.1μ</text>
            <text x={colX(29)} y={rowY('J') + 11} textAnchor="middle" fontSize="6.5" fill="#059669" fontWeight="bold">LPF 1</text>
          </g>

          {/* ════════ REALISTIC HARDWARE BINDING POSTS / BNC TERMINALS ════════ */}
          {TERMINALS.map(t => {
            const p = termPos(t)
            const isLeft = t.x < SVG_W / 2
            const isSelected = activeWire?.id === `term-${t.id}`
            const isTargeted = snappedTarget?.id === `term-${t.id}`

            return (
              <g
                key={`term-${t.id}`}
                className="cursor-pointer group"
                onClick={() => handleStartWire({ id: `term-${t.id}`, x: p.x, y: p.y, label: t.label })}
              >
                {/* Connecting lead trace to dock */}
                <line
                  x1={isLeft ? t.x + 20 : t.x - 20}
                  y1={t.y}
                  x2={p.x}
                  y2={p.y}
                  stroke={t.color}
                  strokeWidth="2"
                  opacity="0.6"
                />

                {/* Outer bezel ring */}
                <circle
                  cx={t.x} cy={t.y} r="16"
                  fill="#111317"
                  stroke={isSelected || isTargeted ? '#fbbf24' : '#333842'}
                  strokeWidth={isSelected || isTargeted ? 2.5 : 1.5}
                />

                {/* Metallic connector core */}
                <circle
                  cx={t.x} cy={t.y} r="11"
                  fill={t.type === 'banana' ? (t.id === 'pwr' ? '#dc2626' : '#1e293b') : 'url(#nickelSilver)'}
                  stroke="#475569" strokeWidth="1"
                />

                {/* Connector jack hole / contact */}
                <circle
                  cx={t.x} cy={t.y} r="4.5"
                  fill="#000000"
                  stroke={t.color} strokeWidth="1.5"
                />

                {/* Label text */}
                <text
                  x={t.x}
                  y={t.y - 20}
                  textAnchor="middle"
                  fontSize="7.5"
                  fill="#f1f5f9"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {t.shortLabel}
                </text>
                <text
                  x={t.x}
                  y={t.y + 24}
                  textAnchor="middle"
                  fontSize="5.5"
                  fill="#94a3b8"
                  fontFamily="sans-serif"
                >
                  {t.sub}
                </text>

                {/* Connecting binding post pin (on breadboard boundary) */}
                <circle
                  cx={p.x} cy={p.y} r="6"
                  fill={t.color}
                  stroke="#ffffff" strokeWidth="2"
                  filter="url(#shadowHeavy)"
                  className="group-hover:scale-125 transition-transform"
                />
              </g>
            )
          })}

          {/* ════════ PLACED WIRES ════════ */}
          {wires.map(w => (
            <g
              key={w.id}
              className="cursor-pointer group"
              onClick={(e) => removeWire(w.id, e)}
              onContextMenu={(e) => removeWire(w.id, e)}
            >
              <path d={wirePath(w.fromX, w.fromY, w.toX, w.toY)} fill="none" stroke="transparent" strokeWidth="18" />
              <path d={wirePath(w.fromX, w.fromY, w.toX, w.toY)} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="5" strokeLinecap="round" />
              <path d={wirePath(w.fromX, w.fromY, w.toX, w.toY)} fill="none" stroke={w.color} strokeWidth="3.8" strokeLinecap="round" />
              <path d={wirePath(w.fromX, w.fromY - 1, w.toX, w.toY - 1)} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx={w.fromX} cy={w.fromY} r="3.5" fill={w.color} stroke="#fff" strokeWidth="1" />
              <circle cx={w.toX} cy={w.toY} r="3.5" fill={w.color} stroke="#fff" strokeWidth="1" />
            </g>
          ))}

          {/* ════════ ACTIVE WIRE PREVIEW ════════ */}
          {activeWire && cursorPos && (
            <g style={{ pointerEvents: 'none' }}>
              {snappedTarget ? (
                <path
                  d={wirePath(activeWire.x, activeWire.y, snappedTarget.x, snappedTarget.y)}
                  fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="6,4" strokeLinecap="round"
                />
              ) : (
                <path
                  d={wirePath(activeWire.x, activeWire.y, cursorPos.x, cursorPos.y)}
                  fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5,4" strokeLinecap="round" opacity="0.85"
                />
              )}
              <circle
                cx={snappedTarget ? snappedTarget.x : cursorPos.x}
                cy={snappedTarget ? snappedTarget.y : cursorPos.y}
                r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.8" opacity="0.9"
              />
            </g>
          )}
        </svg>
      </div>

      {/* ── Modern Sleek Wiring Guide Console ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Procedure Wiring Console</h4>
            <p className="text-xs text-slate-500">Connect jumper wires for each step to unlock live oscilloscope and 3D outputs</p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[1, 3, 4, 6, 8].map(stepNum => {
              const stepWires = connectionStatus.filter(c => c.step === stepNum)
              const isStepDone = stepWires.length > 0 && stepWires.every(c => c.connected)
              return (
                <button
                  key={stepNum}
                  onClick={() => wireStep(stepNum)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all ${
                    isStepDone
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300 active:scale-95'
                  }`}
                  title={`Connect all wires for Step ${stepNum}`}
                >
                  {isStepDone ? '✓' : '+'} Step {stepNum}
                </button>
              )
            })}
          </div>
        </div>

        {/* Clean Modern Connection Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {connectionStatus.map((c) => (
            <div
              key={c.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                c.connected
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: c.connected ? '#10b981' : c.wireColor }} />
                <div className="min-w-0">
                  <div className="font-semibold text-xs truncate text-slate-900">{c.label}</div>
                  <div className="text-[11px] text-slate-500 font-sans truncate">{c.desc}</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                c.connected ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-500'
              }`}>
                {c.connected ? 'CONNECTED' : 'OPEN'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
