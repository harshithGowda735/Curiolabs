import { useState, useCallback, useRef } from 'react'
import { AlertTriangle, Sparkles, X, Undo2, HelpCircle, Check, Info } from 'lucide-react'
import { validateTdmConnection, getNextPendingStepConnection } from '../../utils/tdmWireValidator'

/* ════════════════════════════════════════════════════════════
   LAYOUT CONSTANTS & GRID
   ════════════════════════════════════════════════════════════ */
const S = 22             // hole spacing (px)
const R = 3.6            // hole radius (larger & easier to click)
const X0 = 226           // centered first column x offset
const COLS = 30          // 30 columns (full dual-IC breadboard)
const SVG_W = 1080
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
   BENCH EQUIPMENT TERMINALS (High-Visibility Hardware Buttons)
   ════════════════════════════════════════════════════════════ */
export const TERMINALS = [
  // Left: Power Supply & Signal Generator Terminal Panel
  { id: 'pwr',  label: 'DC +5V Rail',          shortLabel: '+5V SUPPLY',    sub: 'Pin 16 (VDD)',     x: 52, y: 88,  type: 'banana', color: '#ef4444', ring: '#fee2e2' },
  { id: 'gnd',  label: 'Ground (0V)',          shortLabel: 'GROUND (0V)',   sub: 'Pin 8, 6, 7 (GND)',x: 52, y: 168, type: 'banana', color: '#1e293b', ring: '#e2e8f0' },
  { id: 'sig0', label: 'FG1 Sine (100Hz)',     shortLabel: 'CH0 SINE (FG1)',sub: '1V 100Hz ➔ Pin 13',x: 52, y: 248, type: 'bnc',    color: '#ca8a04', ring: '#fef08a' },
  { id: 'sig1', label: 'FG2 Triangle (300Hz)', shortLabel: 'CH1 TRI (FG2)', sub: '1V 300Hz ➔ Pin 14',x: 52, y: 328, type: 'bnc',    color: '#16a34a', ring: '#bbf7d0' },
  { id: 'clk',  label: 'Control Clock (2kHz)', shortLabel: 'CLOCK (2kHz)',  sub: '5V Square ➔ Pin 11',x: 52, y: 408, type: 'bnc',    color: '#2563eb', ring: '#bfdbfe' },

  // Right: DSO Oscilloscope Probe Hub
  { id: 'probe_tdm', label: 'DSO Probe: Pin 3 (TDM)',   shortLabel: 'TDM BUS PROBE',  sub: 'Clip to Pin 3',    x: SVG_W - 52, y: 140, type: 'probe', color: '#9333ea', ring: '#f3e8ff' },
  { id: 'probe_rc0', label: 'DSO Probe: Filtered CH0',  shortLabel: 'REC0 LPF PROBE', sub: '100Hz Sine Out',   x: SVG_W - 52, y: 250, type: 'probe', color: '#0284c7', ring: '#e0f2fe' },
  { id: 'probe_rc1', label: 'DSO Probe: Filtered CH1',  shortLabel: 'REC1 LPF PROBE', sub: '300Hz Tri Out',    x: SVG_W - 52, y: 360, type: 'probe', color: '#059669', ring: '#d1fae5' },
]

export const termPos = (t) => {
  if (t.x < SVG_W / 2) return { x: 154, y: t.y }
  return { x: 926, y: t.y }
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
  const [wiringError, setWiringError] = useState(null)
  const [guidedHoleId, setGuidedHoleId] = useState(null)

  const getGuidedHoleCoords = useCallback((hId) => {
    if (!hId) return null
    if (hId.startsWith('hole-')) {
      const parts = hId.replace('hole-', '').split('-')
      if (parts.length >= 2) {
        const row = parts[0]
        const col = parseInt(parts[1], 10)
        const gx = colX(col)
        let gy = rowY(row)
        if (!gy) {
          if (row === 'R_TP' || row === 'tp') gy = RAIL.tp
          else if (row === 'R_TM' || row === 'tm') gy = RAIL.tm
          else if (row === 'R_BP' || row === 'bp') gy = RAIL.bp
          else if (row === 'R_BM' || row === 'bm') gy = RAIL.bm
          else gy = 'ABCDE'.includes(row) ? rowY('D') : rowY('G')
        }
        return { x: gx, y: gy }
      }
    }
    return null
  }, [])

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

    // 1. Terminals (High snap tolerance across button card)
    TERMINALS.forEach(t => {
      const p = termPos(t)
      const isLeft = t.x < SVG_W / 2
      const cardX = isLeft ? 12 : 920
      const cardY = t.y - 35
      const dPost = Math.hypot(pt.x - p.x, pt.y - p.y)
      const insideCard = pt.x >= cardX && pt.x <= cardX + 144 && pt.y >= cardY && pt.y <= cardY + 70
      if (dPost < minDist + 16 || insideCard) {
        minDist = Math.min(minDist, dPost)
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

    // ── Check intelligent validation for correct wiring ──
    const validation = validateTdmConnection(from, to, wires)
    if (!validation.isValid) {
      if (validation.error) {
        setWiringError(validation.error)
      }
      setActiveWire(null)
      setSnappedTarget(null)
      return
    }

    // Valid wire: clear errors & guide beacons
    setWiringError(null)
    if (guidedHoleId && (guidedHoleId === to.id || guidedHoleId === from.id)) {
      setGuidedHoleId(null)
    }

    const exists = wires.some(w =>
      (w.fromId === from.id && w.toId === to.id) ||
      (w.fromId === to.id && w.toId === from.id)
    )

    if (!exists) {
      let color = validation.connection?.wireColor || '#3b82f6'
      const termId = from.id.startsWith('term-') ? from.id : to.id.startsWith('term-') ? to.id : null
      if (termId && !validation.connection?.wireColor) {
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
      setJustConnected(validation.connection?.label || to.label || from.label)
      setTimeout(() => setJustConnected(null), 3000)
    }

    setActiveWire(null)
    setSnappedTarget(null)
  }, [wires, guidedHoleId, onConnectionsChange])

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

  const undoLastWire = useCallback(() => {
    if (wires.length === 0) return
    const updated = wires.slice(0, -1)
    setWires(updated)
    if (onConnectionsChange) onConnectionsChange(updated)
    setWiringError(null)
    setJustConnected('Undid last wire')
    setTimeout(() => setJustConnected(null), 2000)
  }, [wires, onConnectionsChange])

  const guideNextPending = useCallback(() => {
    const nextPending = getNextPendingStepConnection(connectionStatus)
    if (!nextPending) {
      setJustConnected('All circuit wires are already connected!')
      setTimeout(() => setJustConnected(null), 2500)
      return
    }
    const targetHole = `hole-${nextPending.toSec === 'top' ? 'D' : 'G'}-${nextPending.toCol}`
    setGuidedHoleId(targetHole)
    setJustConnected(`Target Pin Highlighted: ${nextPending.label}`)
    setTimeout(() => setJustConnected(null), 3500)
  }, [connectionStatus])

  const resetAll = useCallback(() => {
    setWires([])
    setActiveWire(null)
    setSnappedTarget(null)
    setWiringError(null)
    setGuidedHoleId(null)
    if (onConnectionsChange) onConnectionsChange([])
  }, [onConnectionsChange])

  return (
    <div className="w-full select-none space-y-3">
      {/* ── Top Bar with Status and Quick Actions (Modern Clean Lab Theme) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white text-slate-800 p-3.5 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
          <div>
            <h3 className="text-xs font-display font-bold tracking-tight text-slate-900 uppercase">
              Solderless Hardware Breadboard Simulator (CD4051 Dual-IC)
            </h3>
            <p className="text-[11px] text-slate-500">
              {activeWire ? (
                <span className="text-amber-600 font-semibold animate-pulse">
                  ⚡ Selected {activeWire.label} — Click any hole to attach wire!
                </span>
              ) : (
                'Click terminal post to start wire, then click breadboard hole to connect. Right-click wire to remove.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {justConnected && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-mono font-semibold">
              ✓ {justConnected}
            </span>
          )}
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${allConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
            {connectedCount}/{LAB_CONNECTIONS.length} Wired
          </span>
          <button
            onClick={guideNextPending}
            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
            title="Highlight the next required connection pin on the breadboard"
          >
            <Sparkles size={12} className="text-amber-600" />
            <span>Guide Next Wire</span>
          </button>
          <button
            onClick={undoLastWire}
            disabled={wires.length === 0}
            className={`text-xs font-medium px-2.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1 ${
              wires.length === 0
                ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 active:scale-95'
            }`}
            title="Undo last connected wire"
          >
            <Undo2 size={12} />
            <span>Undo</span>
          </button>
          <button
            onClick={autoWireCircuit}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
          >
            Auto-Wire (All)
          </button>
          <button
            onClick={resetAll}
            className="text-xs bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            Clear Board
          </button>
        </div>
      </div>

      {/* ── REAL-TIME CONNECTION ERROR DIAGNOSTIC CARD (Educational Feedback) ── */}
      {wiringError && (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50/40 to-amber-50 border-2 border-rose-300 rounded-2xl p-4 shadow-md text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5 border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-display font-bold text-rose-950 text-sm">
                    {wiringError.title}
                  </h4>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 rounded-md font-semibold">
                    Connection Error Intercepted
                  </span>
                </div>
                
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-slate-900 bg-white/70 px-2 py-1 rounded border border-rose-100">
                    <span className="text-slate-500 font-normal">Where it got caught:</span>{' '}
                    <span className="font-mono text-rose-700 font-bold">{wiringError.where}</span>
                  </div>
                  
                  <p className="text-slate-700 leading-relaxed text-[11px] pt-1">
                    <strong className="text-rose-950">Why this is incorrect:</strong> {wiringError.why}
                  </p>
                  
                  <div className="text-emerald-900 font-medium bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-300 text-[11px] flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-950 block">How to make it correct:</strong>
                      <span>{wiringError.fix}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setWiringError(null)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-white/80 transition-colors shrink-0"
              title="Dismiss error message"
            >
              <X size={16} />
            </button>
          </div>

          {wiringError.targetHoleId && (
            <div className="mt-3 pt-2.5 border-t border-rose-200/60 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-slate-600 font-medium">
                Need guidance finding the exact target hole on the breadboard?
              </span>
              <button
                onClick={() => {
                  setGuidedHoleId(wiringError.targetHoleId)
                  setWiringError(null)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <Sparkles size={13} />
                <span>🎯 Highlight Target Pin ({wiringError.targetLabel || 'Target'})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Realistic Breadboard SVG Workbench (Light Laboratory Chassis) ── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-300/80 shadow-md bg-slate-100">
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
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.12" />
            </filter>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Plastic and metallic gradients */}
            <linearGradient id="chassisCleanBench" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="dockCardGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
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

          {/* ════════ WORKBENCH ANODIZED CASING SURFACE ════════ */}
          <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#chassisCleanBench)" />
          <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="none" stroke="#cbd5e1" strokeWidth="2" />

          {/* ════════ LEFT DOCK: POWER & FUNCTION GENERATORS (Tactile Panel) ════════ */}
          <rect x="12" y="25" width="148" height={SVG_H - 50} rx="14" fill="url(#dockCardGrad)" stroke="#cbd5e1" strokeWidth="1.5" filter="url(#shadowHeavy)" />
          <text x="86" y="48" textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="bold" fontFamily="monospace" letterSpacing="1.5">
            SOURCES DOCK
          </text>
          <line x1="22" y1="56" x2="150" y2="56" stroke="#e2e8f0" strokeWidth="1.2" />

          {/* ════════ RIGHT DOCK: OSCILLOSCOPE BNC PROBE HUB (Tactile Panel) ════════ */}
          <rect x={SVG_W - 160} y="25" width="148" height={SVG_H - 50} rx="14" fill="url(#dockCardGrad)" stroke="#cbd5e1" strokeWidth="1.5" filter="url(#shadowHeavy)" />
          <text x={SVG_W - 86} y="48" textAnchor="middle" fontSize="9" fill="#1e293b" fontWeight="bold" fontFamily="monospace" letterSpacing="1.5">
            DSO PROBE HUB
          </text>
          <line x1={SVG_W - 150} y1="56" x2={SVG_W - 22} y2="56" stroke="#e2e8f0" strokeWidth="1.2" />

          {/* ════════ SOLDERLESS BREADBOARD CHASSIS ════════ */}
          <rect x="170" y="25" width={740} height={SVG_H - 50} rx="14"
            fill="url(#bbWhitePlastic)" stroke="#cbd5e1" strokeWidth="2" filter="url(#shadowHeavy)" />
          <rect x="175" y="30" width={730} height={SVG_H - 60} rx="10"
            fill="none" stroke="#d5c8b5" strokeWidth="1" />

          {/* ════════ TOP POWER RAILS (+ and -) ════════ */}
          <rect x="180" y={RAIL.tp - 9} width={720} height="18" rx="4" fill="#fee2e2" stroke="#fca5a5" strokeWidth="0.8" />
          <line x1="182" y1={RAIL.tp - 9} x2={898} y2={RAIL.tp - 9} stroke="#ef4444" strokeWidth="2.5" />
          <text x="195" y={RAIL.tp + 4} fontSize="13" fill="#dc2626" fontWeight="bold">+</text>

          <rect x="180" y={RAIL.tm - 9} width={720} height="18" rx="4" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.8" />
          <line x1="182" y1={RAIL.tm + 9} x2={898} y2={RAIL.tm + 9} stroke="#3b82f6" strokeWidth="2.5" />
          <text x="195" y={RAIL.tm + 4} fontSize="13" fill="#2563eb" fontWeight="bold">−</text>

          {/* ════════ BOTTOM POWER RAILS (+ and -) ════════ */}
          <rect x="180" y={RAIL.bp - 9} width={720} height="18" rx="4" fill="#fee2e2" stroke="#fca5a5" strokeWidth="0.8" />
          <line x1="182" y1={RAIL.bp - 9} x2={898} y2={RAIL.bp - 9} stroke="#ef4444" strokeWidth="2.5" />
          <text x="195" y={RAIL.bp + 4} fontSize="13" fill="#dc2626" fontWeight="bold">+</text>

          <rect x="180" y={RAIL.bm - 9} width={720} height="18" rx="4" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.8" />
          <line x1="182" y1={RAIL.bm + 9} x2={898} y2={RAIL.bm + 9} stroke="#3b82f6" strokeWidth="2.5" />
          <text x="195" y={RAIL.bm + 4} fontSize="13" fill="#2563eb" fontWeight="bold">−</text>

          {/* Power Rail Holes */}
          {[RAIL.tp, RAIL.tm, RAIL.bp, RAIL.bm].map(ry =>
            Array.from({ length: COLS }, (_, i) => i + 1).map(c => (
              <circle
                key={`rail-${ry}-${c}`}
                cx={colX(c)} cy={ry} r={R}
                fill="#3f3f46" stroke="#a1a1aa" strokeWidth="0.6"
                className="cursor-pointer hover:fill-amber-400"
                onClick={() => handleStartWire({ id: `hole-${ry}-${c}`, x: colX(c), y: ry, label: `Power Rail Col ${c}` })}
              />
            ))
          )}

          {/* ════════ CENTER NOTCH GROOVE (IC DIP SOCKET SEPARATOR) ════════ */}
          <rect x="180" y="214" width={720} height="36" rx="4" fill="#cfc2ad" stroke="#baac97" strokeWidth="1.2" />
          <line x1="180" y1="232" x2={900} y2="232" stroke="#b0a28d" strokeWidth="1" strokeDasharray="4,4" />
          <text x={colX(15)} y="235" textAnchor="middle" fontSize="9" fill="#786c5a" fontFamily="monospace" fontWeight="bold" letterSpacing="3">
            BREADBOARD CENTER DIVIDER
          </text>

          {/* Column Numbers */}
          {Array.from({ length: COLS }, (_, i) => i + 1).map(c => (
            <g key={`num-${c}`}>
              <text x={colX(c)} y="94" textAnchor="middle" fontSize="8" fill="#716758" fontFamily="monospace">{c}</text>
              <text x={colX(c)} y="388" textAnchor="middle" fontSize="8" fill="#716758" fontFamily="monospace">{c}</text>
            </g>
          ))}

          {/* Row Letters (Left & Right) */}
          {[...ROWS_TOP, ...ROWS_BOT].map(row => (
            <g key={`row-${row}`}>
              <text x="195" y={rowY(row) + 4} textAnchor="middle" fontSize="10.5" fill="#716758" fontWeight="bold" fontFamily="monospace">{row}</text>
              <text x="886" y={rowY(row) + 4} textAnchor="middle" fontSize="10.5" fill="#716758" fontWeight="bold" fontFamily="monospace">{row}</text>
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
            const x1 = colX(IC1_COL_START) - 9
            const x2 = colX(IC1_COL_END) + 9
            const y1 = rowY('E') - 8
            const y2 = rowY('F') + 8
            return (
              <g className="cursor-pointer" onClick={() => handleStartWire({ id: 'hole-D-9', x: colX(9), y: rowY('D'), label: 'IC1 Mux Pin 3 (TDM Out)' })}>
                {/* Silver Lead Pins */}
                {IC1_PINS.filter(p => p.row === 'E').map(p => (
                  <rect key={`pin-top-${p.pin}`} x={colX(p.col) - 1.8} y={y1 - 5} width="3.6" height="6" fill="url(#nickelSilver)" />
                ))}
                {IC1_PINS.filter(p => p.row === 'F').map(p => (
                  <rect key={`pin-bot-${p.pin}`} x={colX(p.col) - 1.8} y={y2 - 1} width="3.6" height="6" fill="url(#nickelSilver)" />
                ))}
                {/* Epoxy Plastic Body */}
                <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx="5" fill="url(#icGradHighEnd)" stroke="#09090b" strokeWidth="1.5" filter="url(#shadowHeavy)" />
                {/* Pin 1 Index Notch */}
                <circle cx={x1 + 8} cy={(y1 + y2) / 2} r="4.5" fill="none" stroke="#71717a" strokeWidth="1.5" />
                {/* White Laser Marking */}
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 3} textAnchor="middle" fontSize="11" fill="#f8fafc" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
                  CD4051BE
                </text>
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 9} textAnchor="middle" fontSize="8" fill="#38bdf8" fontWeight="bold" fontFamily="monospace">
                  IC1: MULTIPLEXER
                </text>
              </g>
            )
          })()}

          {/* ════════ IC 2 BODY (CD4051BE DEMULTIPLEXER) ════════ */}
          {(() => {
            const x1 = colX(IC2_COL_START) - 9
            const x2 = colX(IC2_COL_END) + 9
            const y1 = rowY('E') - 8
            const y2 = rowY('F') + 8
            return (
              <g className="cursor-pointer" onClick={() => handleStartWire({ id: 'hole-D-19', x: colX(19), y: rowY('D'), label: 'IC2 Demux Pin 3 (COM In)' })}>
                {/* Silver Lead Pins */}
                {IC2_PINS.filter(p => p.row === 'E').map(p => (
                  <rect key={`pin-top-${p.pin}`} x={colX(p.col) - 1.8} y={y1 - 5} width="3.6" height="6" fill="url(#nickelSilver)" />
                ))}
                {IC2_PINS.filter(p => p.row === 'F').map(p => (
                  <rect key={`pin-bot-${p.pin}`} x={colX(p.col) - 1.8} y={y2 - 1} width="3.6" height="6" fill="url(#nickelSilver)" />
                ))}
                {/* Epoxy Plastic Body */}
                <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx="5" fill="url(#icGradHighEnd)" stroke="#09090b" strokeWidth="1.5" filter="url(#shadowHeavy)" />
                {/* Pin 1 Index Notch */}
                <circle cx={x1 + 8} cy={(y1 + y2) / 2} r="4.5" fill="none" stroke="#71717a" strokeWidth="1.5" />
                {/* White Laser Marking */}
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 3} textAnchor="middle" fontSize="11" fill="#f8fafc" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
                  CD4051BE
                </text>
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 9} textAnchor="middle" fontSize="8" fill="#34d399" fontWeight="bold" fontFamily="monospace">
                  IC2: DEMULTIPLEXER
                </text>
              </g>
            )
          })()}

          {/* IC Pin Function Callouts */}
          {ALL_IC_PINS.map(p => {
            const isTop = p.row === 'E'
            const x = colX(p.col)
            const yBadge = isTop ? rowY('C') + 2 : rowY('H') - 4
            let badgeFill = '#f8fafc'
            let badgeStroke = '#cbd5e1'
            let textFill = '#334155'
            if (p.pin === 16) { badgeFill = '#fee2e2'; badgeStroke = '#f87171'; textFill = '#dc2626'; }
            else if (p.pin === 8) { badgeFill = '#e2e8f0'; badgeStroke = '#94a3b8'; textFill = '#0f172a'; }
            else if (p.pin === 3) { badgeFill = '#f3e8ff'; badgeStroke = '#c084fc'; textFill = '#7e22ce'; }
            else if (p.pin === 13) { badgeFill = '#e0f2fe'; badgeStroke = '#7dd3fc'; textFill = '#0369a1'; }
            else if (p.pin === 14) { badgeFill = '#dcfce7'; badgeStroke = '#86efac'; textFill = '#15803d'; }
            else if (p.pin === 11) { badgeFill = '#dbeafe'; badgeStroke = '#93c5fd'; textFill = '#1d4ed8'; }
            else if (p.pin === 9 || p.pin === 10) { badgeFill = '#fef3c7'; badgeStroke = '#fcd34d'; textFill = '#b45309'; }

            return (
              <g
                key={`pin-callout-${p.ic}-${p.pin}`}
                className="cursor-pointer group"
                onClick={() => handleStartWire({ id: `hole-${isTop ? 'D' : 'G'}-${p.col}`, x: colX(p.col), y: isTop ? rowY('D') : rowY('G'), label: `${p.ic} Pin ${p.pin} (${p.label})` })}
              >
                {/* Pin Callout Badge */}
                <rect
                  x={x - 10}
                  y={yBadge - 8}
                  width="20"
                  height="15"
                  rx="3.5"
                  fill={badgeFill}
                  stroke={badgeStroke}
                  strokeWidth="1"
                  filter="url(#shadowHeavy)"
                />
                <text
                  x={x}
                  y={yBadge + 2.5}
                  textAnchor="middle"
                  fontSize="7.5"
                  fill={textFill}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {p.label}
                </text>
                <text
                  x={x}
                  y={isTop ? yBadge - 10 : yBadge + 16}
                  textAnchor="middle"
                  fontSize="6.5"
                  fill="#64748b"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  P{p.pin}
                </text>
              </g>
            )
          })}

          {/* ════════ RC RECONSTRUCTION LOW-PASS FILTERS (Cols 26-29) ════════ */}
          <g>
            {/* R1: 5.6k Resistor for CH0 */}
            <g className="cursor-pointer" onClick={() => handleStartWire({ id: `hole-G-27`, x: colX(27), y: rowY('G'), label: 'R1 5.6k Filter Junction' })}>
              <rect x={colX(26) - 5} y={rowY('G') - 6} width={S + 10} height="12" rx="3.5" fill="#f5ebe0" stroke="#b08968" strokeWidth="1" />
              <line x1={colX(26) + 4} y1={rowY('G') - 6} x2={colX(26) + 4} y2={rowY('G') + 6} stroke="#15803d" strokeWidth="2.5" />
              <line x1={colX(26) + 11} y1={rowY('G') - 6} x2={colX(26) + 11} y2={rowY('G') + 6} stroke="#2563eb" strokeWidth="2.5" />
              <line x1={colX(26) + 18} y1={rowY('G') - 6} x2={colX(26) + 18} y2={rowY('G') + 6} stroke="#dc2626" strokeWidth="2.5" />
              <text x={colX(26) + 11} y={rowY('G') - 9} textAnchor="middle" fontSize="7" fill="#15803d" fontWeight="bold">R1: 5.6k</text>
            </g>

            {/* C1: 0.1uF Capacitor for CH0 */}
            <g className="cursor-pointer" onClick={() => handleStartWire({ id: `hole-I-27`, x: colX(27), y: rowY('I'), label: 'C1 0.1uF Filter Junction' })}>
              <circle cx={colX(27)} cy={rowY('I')} r="8" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" filter="url(#shadowHeavy)" />
              <text x={colX(27)} y={rowY('I') + 3} textAnchor="middle" fontSize="6.5" fill="#78350f" fontWeight="bold">0.1μ</text>
              <text x={colX(27)} y={rowY('J') + 13} textAnchor="middle" fontSize="7.5" fill="#0284c7" fontWeight="bold">LPF 0</text>
            </g>

            {/* R2: 5.6k Resistor for CH1 */}
            <g className="cursor-pointer" onClick={() => handleStartWire({ id: `hole-G-28`, x: colX(28), y: rowY('G'), label: 'R2 5.6k Filter Junction' })}>
              <rect x={colX(28) - 5} y={rowY('G') - 6} width={S + 10} height="12" rx="3.5" fill="#f5ebe0" stroke="#b08968" strokeWidth="1" />
              <line x1={colX(28) + 4} y1={rowY('G') - 6} x2={colX(28) + 4} y2={rowY('G') + 6} stroke="#15803d" strokeWidth="2.5" />
              <line x1={colX(28) + 11} y1={rowY('G') - 6} x2={colX(28) + 11} y2={rowY('G') + 6} stroke="#2563eb" strokeWidth="2.5" />
              <line x1={colX(28) + 18} y1={rowY('G') - 6} x2={colX(28) + 18} y2={rowY('G') + 6} stroke="#dc2626" strokeWidth="2.5" />
              <text x={colX(28) + 11} y={rowY('G') - 9} textAnchor="middle" fontSize="7" fill="#15803d" fontWeight="bold">R2: 5.6k</text>
            </g>

            {/* C2: 0.1uF Capacitor for CH1 */}
            <g className="cursor-pointer" onClick={() => handleStartWire({ id: `hole-I-29`, x: colX(29), y: rowY('I'), label: 'C2 0.1uF Filter Junction' })}>
              <circle cx={colX(29)} cy={rowY('I')} r="8" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" filter="url(#shadowHeavy)" />
              <text x={colX(29)} y={rowY('I') + 3} textAnchor="middle" fontSize="6.5" fill="#78350f" fontWeight="bold">0.1μ</text>
              <text x={colX(29)} y={rowY('J') + 13} textAnchor="middle" fontSize="7.5" fill="#059669" fontWeight="bold">LPF 1</text>
            </g>
          </g>

          {/* ════════ REALISTIC HARDWARE BINDING POSTS / BNC TERMINALS ════════ */}
          {TERMINALS.map(t => {
            const p = termPos(t)
            const isLeft = t.x < SVG_W / 2
            const isSelected = activeWire?.id === `term-${t.id}`
            const isTargeted = snappedTarget?.id === `term-${t.id}`
            const cardX = isLeft ? 18 : SVG_W - 154
            const cardY = t.y - 33
            const cardW = 136
            const cardH = 66
            const jackX = isLeft ? 46 : SVG_W - 46

            return (
              <g
                key={`term-${t.id}`}
                className="cursor-pointer group"
                onClick={() => handleStartWire({ id: `term-${t.id}`, x: p.x, y: p.y, label: t.label })}
              >
                {/* Button-like tactile background card */}
                <rect
                  x={cardX}
                  y={cardY}
                  width={cardW}
                  height={cardH}
                  rx="10"
                  fill={isSelected ? '#fef3c7' : isTargeted ? '#fef9c3' : '#ffffff'}
                  stroke={isSelected ? '#d97706' : isTargeted ? '#f59e0b' : '#cbd5e1'}
                  strokeWidth={isSelected || isTargeted ? 2.5 : 1.2}
                  filter="url(#shadowHeavy)"
                  className="transition-all group-hover:stroke-slate-400"
                />

                {/* Connecting lead trace to dock post */}
                <line
                  x1={isLeft ? 68 : SVG_W - 68}
                  y1={t.y}
                  x2={p.x}
                  y2={p.y}
                  stroke={t.color}
                  strokeWidth="2.5"
                  opacity="0.8"
                />

                {/* Outer bezel ring (Clean Light Bezel) */}
                <circle
                  cx={jackX} cy={t.y} r="18"
                  fill="#ffffff"
                  stroke={isSelected || isTargeted ? '#f59e0b' : '#cbd5e1'}
                  strokeWidth={isSelected || isTargeted ? 2.5 : 1.5}
                />

                {/* Metallic connector core */}
                <circle
                  cx={jackX} cy={t.y} r="12.5"
                  fill={t.type === 'banana' ? (t.id === 'pwr' ? '#dc2626' : '#1e293b') : 'url(#nickelSilver)'}
                  stroke="#94a3b8" strokeWidth="1"
                />

                {/* Connector jack hole / contact */}
                <circle
                  cx={jackX} cy={t.y} r="5.5"
                  fill={t.type === 'banana' ? '#0f172a' : '#1e293b'}
                  stroke={t.color} strokeWidth="1.8"
                />

                {/* High-Contrast Clear Typography */}
                {isLeft ? (
                  <g transform={`translate(72, ${t.y})`}>
                    <text
                      x="0"
                      y="-4"
                      fontSize="9.5"
                      fill="#0f172a"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {t.shortLabel}
                    </text>
                    <text
                      x="0"
                      y="10"
                      fontSize="7.5"
                      fill="#64748b"
                      fontWeight="semibold"
                      fontFamily="sans-serif"
                    >
                      {t.sub}
                    </text>
                  </g>
                ) : (
                  <g transform={`translate(${SVG_W - 72}, ${t.y})`}>
                    <text
                      x="0"
                      y="-4"
                      textAnchor="end"
                      fontSize="9.5"
                      fill="#0f172a"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {t.shortLabel}
                    </text>
                    <text
                      x="0"
                      y="10"
                      textAnchor="end"
                      fontSize="7.5"
                      fill="#64748b"
                      fontWeight="semibold"
                      fontFamily="sans-serif"
                    >
                      {t.sub}
                    </text>
                  </g>
                )}

                {/* Connecting binding post pin (on breadboard boundary) */}
                <circle
                  cx={p.x} cy={p.y} r="7"
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

          {/* ════════ GUIDED TARGET BEACON ════════ */}
          {guidedHoleId && (() => {
            const gCoord = getGuidedHoleCoords(guidedHoleId)
            if (!gCoord) return null
            return (
              <g style={{ pointerEvents: 'none' }}>
                <circle
                  cx={gCoord.x} cy={gCoord.y} r="20"
                  fill="none" stroke="#f59e0b" strokeWidth="3"
                  className="animate-ping" opacity="0.8"
                />
                <circle
                  cx={gCoord.x} cy={gCoord.y} r="10"
                  fill="#fef3c7" fillOpacity="0.6" stroke="#d97706" strokeWidth="2.5"
                />
                <g transform={`translate(${gCoord.x}, ${gCoord.y - 20})`}>
                  <rect x="-44" y="-14" width="88" height="16" rx="4" fill="#d97706" />
                  <text x="0" y="-3" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
                    CONNECT HERE
                  </text>
                </g>
              </g>
            )
          })()}
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
