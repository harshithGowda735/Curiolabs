import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import InteractiveBreadboard, { LAB_CONNECTIONS } from '../components/Hardware/InteractiveBreadboard'
import TDMVirtualLab3D from './TDMVirtualLab3D'
import DeskCameraAR from './DeskCameraAR'
import { useLanguage } from '../contexts/LanguageContext'
import { CheckCircle2, AlertTriangle, XCircle, Zap, RefreshCw, Sparkles, Box, Activity, Layers, Power, ArrowRight, Camera, Smartphone } from 'lucide-react'

/* ════════════════════════════════════════════════════════════
   AIM & APPARATUS (EXACT LAB MANUAL STANDARD)
   ════════════════════════════════════════════════════════════ */
const tdmAim = 'To study the performance of multiplexing and demultiplexing of two band limited signals.'

const tdmApparatus = [
  { slNo: '1.', particulars: 'IC', range: '4051', quantity: '02' },
  { slNo: '2.', particulars: 'Resistor', range: '5.6KΩ', quantity: '02' },
  { slNo: '3.', particulars: 'Capacitor', range: '0.1μF', quantity: '02' },
  { slNo: '4.', particulars: 'Dc Power supplies', range: '-', quantity: '01' },
  { slNo: '5.', particulars: 'Oscilloscopes', range: '-', quantity: '01' },
  { slNo: '6.', particulars: 'Function Generator', range: '-', quantity: '02' },
]

/* ════════════════════════════════════════════════════════════
   EASILY UNDERSTANDABLE STEP-BY-STEP LAB INSTRUCTIONS
   ════════════════════════════════════════════════════════════ */
const steps = [
  {
    title: '1. Wire Power, Ground & TDM Bus',
    description: 'Place two CD4051 ICs on breadboard. Connect +5V (Red) to Pin 16 (VDD) on both ICs. Connect GND (Black) to Pin 8 (VSS), Pin 6 (INH), and Pin 7 (VEE) on both ICs. Bridge MUX Pin 3 (TDM Bus) to DEMUX Pin 3 (COM In) with a jumper wire.'
  },
  {
    title: '2. Configure 2-Channel Mode (Ground B & C)',
    description: 'Ground Address Select Pins B (Pin 10) and C (Pin 9) on both ICs. This locks the 8-channel ICs to toggle strictly between Channel 0 and Channel 1.'
  },
  {
    title: '3. Connect Message Inputs (FG1 & FG2)',
    description: 'Connect Function Generator 1 (1V, 100Hz Sine) into IC1 Pin 13 (Channel 0 / X0). Connect Function Generator 2 (1V, 300Hz Triangle) into IC1 Pin 14 (Channel 1 / X1).'
  },
  {
    title: '4. Connect Control Clock (<10 kHz)',
    description: 'Connect the 2kHz 5V Square Wave Clock to IC1 Pin 11 (Address Select A), and bridge it to IC2 Pin 11 to keep multiplexer and demultiplexer switching in exact synchrony.'
  },
  {
    title: '5. Energize DC Power Supply (5V)',
    description: 'Turn ON the +5V DC regulated power supply (Pin 16 VDD) in the left control panel to energize the internal CMOS analog bilateral transmission gates.'
  },
  {
    title: '6. Probe TDM Output at Pin 3 (Oscilloscope)',
    description: 'Attach the DSO oscilloscope probe to Pin 3 to observe the time-division multiplexed interleaved PAM pulse train carrying samples of both message signals.'
  },
  {
    title: '7. Install Demux Low-Pass Reconstruction Filters (5.6kΩ + 0.1μF)',
    description: 'Connect two 5.6kΩ resistors (R1, R2) to Demux output pins 13 (Y0) and 14 (Y1). Connect two 0.1μF capacitors (C1, C2) from the resistor outputs to Ground. This builds 1st-order RC low-pass filters (fc = 1/(2πRC) ≈ 284 Hz) to reconstruct continuous analog waveforms from the discrete PAM pulse train.'
  },
  {
    title: '8. Observe Reconstructed Analog Signals via DSO Probes',
    description: 'Clip DSO Channel 1 probe across C1 (0.1μF) to observe the smooth recovered 100Hz Sine wave, and Channel 2 probe across C2 (0.1μF) to observe the recovered 300Hz Triangle wave without carrier switching noise.'
  }
]

const observations = [
  'Time Division Multiplexing (TDM) is a technique that combines multiple analog message streams into a single communication medium by dividing channel transmission time into smaller discrete slots.',
  'IC 4051 is a single 8-channel analog multiplexer/demultiplexer CMOS chip with low ON-resistance (~80Ω) allowing bidirectional analog signal flow.',
  'According to Nyquist criterion, the switching control frequency f_clk must be >= 2 × f_max to prevent aliasing and crosstalk during channel reconstruction.',
  'Demultiplexing reverses the TDM process by sampling the incoming composite signal synchronously with the transmitter clock to route pulses to their original lines.',
  'The RC low-pass filter with cutoff fc = 1 / (2π × 5.6kΩ × 0.1μF) ≈ 284 Hz suppresses the high-frequency sampling carrier and smoothly reproduces the original 100Hz Sine and 300Hz Triangle waveforms.'
]

// Helper Component: Live SVG Sparkline for parameter card feedback
function WaveSparkline({ type = 'sine', freq = 100, amp = 1.0, color = '#38bdf8', duty = 50 }) {
  const points = useMemo(() => {
    const pts = []
    const count = 70
    // Dynamic cycle scaling
    const cycles = Math.max(1, Math.min(8, type === 'clock' ? (freq / 1.5) : (freq / 65)))
    for (let i = 0; i <= count; i++) {
      const x = (i / count) * 160
      const t = (i / count) * cycles
      let yNorm = 0
      if (type === 'sine') {
        yNorm = Math.sin(2 * Math.PI * t)
      } else if (type === 'triangle') {
        const ph = t % 1
        yNorm = ph < 0.5 ? 4 * ph - 1 : 3 - 4 * ph
      } else if (type === 'clock') {
        const ph = t % 1
        yNorm = ph < (duty / 100) ? 0.85 : -0.85
      }
      const y = 17 - yNorm * 11 * Math.min(1.3, Math.max(0.35, amp / (type === 'clock' ? 5 : 1.0)))
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
    }
    return pts.join(' ')
  }, [type, freq, amp, duty])

  return (
    <div className="mt-3 p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between overflow-hidden">
      <div className="flex flex-col text-[10px] font-mono text-slate-400 pl-1 leading-tight shrink-0">
        <span className="text-white font-bold">{freq} {type === 'clock' ? 'kHz' : 'Hz'}</span>
        <span>{amp} V</span>
      </div>
      <svg viewBox="0 0 160 34" className="w-36 h-7 shrink-0">
        <line x1="0" y1="17" x2="160" y2="17" stroke="#334155" strokeWidth="0.75" strokeDasharray="2,2" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function TimeDivisionMultiplexing() {
  const { t } = useLanguage()

  // Lab Manual Signal Parameters
  const [f1, setF1] = useState(100)        // 100 Hz Sine
  const [f2, setF2] = useState(300)        // 300 Hz Triangle
  const [amp1, setAmp1] = useState(1.0)    // 1 V
  const [amp2, setAmp2] = useState(1.0)    // 1 V
  const [clkFreq, setClkFreq] = useState(2.0) // 2.0 kHz (<10kHz)
  const [dutyCycle, setDutyCycle] = useState(50)
  const [isPowerOn, setIsPowerOn] = useState(true) // Procedure Step 5: Power switch 5V

  const [activeTab, setActiveTab] = useState('breadboard') // 'breadboard' | 'dso' | '3d'
  const [dsoChannel, setDsoChannel] = useState('all')     // 'all' | 'tdm' | 'recon' | 'inputs'
  const [currentStep, setCurrentStep] = useState(0)
  const [showDirectDeskAR, setShowDirectDeskAR] = useState(false)

  // Wires connected on breadboard
  const [placedWires, setPlacedWires] = useState([])

  // Circuit connectivity analysis directly verifying procedure steps
  const circuitState = useMemo(() => {
    const hasWire = (fromTerm, toCol, toSec) => {
      return placedWires.some(w => {
        const fromMatch = w.fromId === fromTerm || w.fromId === `term-${fromTerm}`
        const toMatch = w.toId === fromTerm || w.toId === `term-${fromTerm}`
        const hId = fromMatch ? w.toId : toMatch ? w.fromId : null
        if (!hId || !hId.startsWith('hole-')) return false
        const [, row, colStr] = hId.split('-')
        const col = parseInt(colStr, 10)
        if (col !== toCol) return false
        const isTop = 'ABCDE'.includes(row)
        const isBot = 'FGHIJ'.includes(row)
        return toSec === 'top' ? isTop : isBot
      })
    }

    // Step 1 Check: Power & Ground & Interconnects
    const hasPwrMux = hasWire('pwr', 7, 'bot')
    const hasPwrDemux = hasWire('pwr', 17, 'bot')
    const hasGndMux = hasWire('gnd', 14, 'top')
    const hasGndMuxInh = hasWire('gnd', 12, 'top') || hasWire('gnd', 13, 'top')
    const hasGndDemux = hasWire('gnd', 24, 'top')
    const hasTdmBridge = placedWires.some(w =>
      (w.fromId?.includes('9') && w.toId?.includes('19')) ||
      (w.fromId?.includes('19') && w.toId?.includes('9'))
    )
    const step1Complete = hasPwrMux && hasPwrDemux && hasGndMux && hasGndMuxInh && hasGndDemux

    // Step 3 Check: Inputs (100Hz Sine to Pin 13, 300Hz Triangle to Pin 14)
    const hasCh0 = hasWire('sig0', 10, 'bot')
    const hasCh1 = hasWire('sig1', 9, 'bot')
    const step3Complete = hasCh0 && hasCh1

    // Step 4 Check: Control Signal (<10kHz) to Pin 11
    const hasClkMux = hasWire('clk', 12, 'bot')
    const hasClkDemux = hasWire('clk', 22, 'bot') || placedWires.some(w =>
      (w.fromId?.includes('12') && w.toId?.includes('22')) ||
      (w.fromId?.includes('22') && w.toId?.includes('12'))
    )
    const step4Complete = hasClkMux && hasClkDemux

    // Step 5 Check: Power supply 5V switched ON and energized
    const step5Complete = step1Complete && isPowerOn

    // Step 6 Check: DSO Probe connected to Pin 3
    const hasTdmProbe = hasWire('probe_tdm', 9, 'top')
    const step6Complete = hasTdmProbe

    // Step 8 Check: Probes connected to RC Filter junction
    const hasRc0Probe = hasWire('probe_rc0', 27, 'bot')
    const hasRc1Probe = hasWire('probe_rc1', 28, 'bot')
    const step8Complete = hasRc0Probe && hasRc1Probe

    // Determine current active procedure step
    let calculatedStep = 0
    if (!step1Complete) calculatedStep = 0
    else if (!step3Complete) calculatedStep = 2
    else if (!step4Complete) calculatedStep = 3
    else if (!step5Complete) calculatedStep = 4
    else if (!step6Complete) calculatedStep = 5
    else if (!hasTdmBridge) calculatedStep = 6
    else if (!step8Complete) calculatedStep = 7
    else calculatedStep = 7

    return {
      hasPwrMux,
      hasPwrDemux,
      hasGndMux,
      hasGndMuxInh,
      hasGndDemux,
      hasTdmBridge,
      hasCh0,
      hasCh1,
      hasClkMux,
      hasClkDemux,
      isEnergized: step1Complete && isPowerOn,
      hasTdmProbe,
      hasRc0Probe,
      hasRc1Probe,
      step1Complete,
      step3Complete,
      step4Complete,
      step5Complete,
      step6Complete,
      step8Complete,
      allReady: step1Complete && step3Complete && step4Complete && step5Complete && hasTdmBridge && step6Complete && step8Complete,
      calculatedStep
    }
  }, [placedWires, isPowerOn])

  // Sync currentStep with circuit wiring state
  const activeStep = circuitState.calculatedStep

  // Real-Time Waveform Math Engine strictly bound to actual physical wiring!
  const { ch0Pts, ch1Pts, clkPts, tdmPts, demux0Pts, demux1Pts, recon0Pts, recon1Pts, rawCh0Pts, rawCh1Pts, rawClkPts } = useMemo(() => {
    const numPoints = 250
    const tSpan = 0.02 // 20 ms window to clearly see full 100Hz (10ms) and 300Hz cycles

    const pCh0 = []
    const pCh1 = []
    const pClk = []
    const pTdm = []
    const pDemux0 = []
    const pDemux1 = []
    const pRec0 = []
    const pRec1 = []
    const pRawCh0 = []
    const pRawCh1 = []
    const pRawClk = []

    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * tSpan

      // ── Step 3: Message Signal 1 (1V, 100Hz Sinusoidal Wave at Pin 13) ──
      const rawY1 = amp1 * Math.sin(2 * Math.PI * f1 * t)
      const y1 = circuitState.hasCh0 ? rawY1 : 0

      // ── Step 3: Message Signal 2 (1V, 300Hz Triangular Wave at Pin 14) ──
      const triPhase = (t * f2) % 1
      const rawY2 = amp2 * (triPhase < 0.5 ? 4 * triPhase - 1 : 3 - 4 * triPhase)
      const y2 = circuitState.hasCh1 ? rawY2 : 0

      // ── Step 4: Control Signal (5V Square Wave at Pin 11) ──
      const fClockHz = clkFreq * 1000
      const clkPhase = (t * fClockHz) % 1
      const isHigh = clkPhase < (dutyCycle / 100)
      const rawYClk = isHigh ? 5 : 0
      const yClk = circuitState.hasClkMux ? rawYClk : 0

      // ── Step 5 & 6: TDM Output at Pin 3 (Composite Pulse Train) ──
      let yTdm = 0
      if (circuitState.isEnergized && circuitState.hasTdmProbe) {
        if (circuitState.hasClkMux) {
          // Channel 0 (Sine) when Select A = 0; Channel 1 (Triangle) when Select A = 1
          yTdm = isHigh ? y2 : y1
        } else {
          // Floating clock: stuck on Channel 0
          yTdm = y1
        }
      }

      // ── Step 7: Demultiplexer PAM Outputs at Demux Pin 13 & 14 ──
      let yDemux0 = 0
      let yDemux1 = 0
      if (circuitState.isEnergized && circuitState.hasTdmBridge && circuitState.hasClkDemux) {
        yDemux0 = !isHigh ? yTdm : 0
        yDemux1 = isHigh ? yTdm : 0
      }

      // ── Step 8: Reconstructed Signals at RC Low-Pass Filter Junction ──
      let yRec0 = 0
      let yRec1 = 0
      if (circuitState.isEnergized && circuitState.hasTdmBridge && circuitState.hasClkDemux) {
        if (circuitState.hasRc0Probe && circuitState.hasCh0) {
          // Filtered smooth sine
          yRec0 = amp1 * 0.94 * Math.sin(2 * Math.PI * f1 * (t - 0.0003))
        }
        if (circuitState.hasRc1Probe && circuitState.hasCh1) {
          // Filtered smooth triangle
          yRec1 = amp2 * 0.88 * (triPhase < 0.5 ? 4 * triPhase - 1 : 3 - 4 * triPhase)
        }
      }

      pCh0.push({ x: i, y: y1 })
      pCh1.push({ x: i, y: y2 })
      pClk.push({ x: i, y: yClk })
      pTdm.push({ x: i, y: yTdm })
      pDemux0.push({ x: i, y: yDemux0 })
      pDemux1.push({ x: i, y: yDemux1 })
      pRec0.push({ x: i, y: yRec0 })
      pRec1.push({ x: i, y: yRec1 })

      pRawCh0.push({ x: i, y: rawY1 })
      pRawCh1.push({ x: i, y: rawY2 })
      pRawClk.push({ x: i, y: rawYClk })
    }

    return {
      ch0Pts: pCh0,
      ch1Pts: pCh1,
      clkPts: pClk,
      tdmPts: pTdm,
      demux0Pts: pDemux0,
      demux1Pts: pDemux1,
      recon0Pts: pRec0,
      recon1Pts: pRec1,
      rawCh0Pts: pRawCh0,
      rawCh1Pts: pRawCh1,
      rawClkPts: pRawClk
    }
  }, [f1, f2, amp1, amp2, clkFreq, dutyCycle, circuitState])

  // Oscilloscope screen dimensions
  const W = 460, H = 100, pad = 16
  const scaleX = (i) => pad + (i / 250) * (W - 2 * pad)
  const scaleY = (v, min = -1.5, max = 1.5) => H - pad - ((v - min) / (max - min)) * (H - 2 * pad)
  const scaleYClock = (v) => H - pad - (v / 6) * (H - 2 * pad)

  // Controls Panel
  const controls = (
    <div className="space-y-4">
      {/* Procedure Step 5: Master Power Supply Control */}
      <div className="bg-white border-2 border-emerald-500/30 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 text-xs block">Procedure Step 5: DC Power Supply</span>
            <span className="text-slate-500 text-[11px] font-mono">5.00 V DC Rail (Pin 16 VDD)</span>
          </div>
          <button
            onClick={() => setIsPowerOn(p => !p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isPowerOn
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-100 hover:bg-rose-200 text-rose-700 border border-rose-300'
            }`}
          >
            <Power size={13} className={isPowerOn ? 'animate-pulse' : ''} />
            <span>{isPowerOn ? '5V SUPPLY ON' : 'POWER OFF'}</span>
          </button>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
          <span>Supply: {isPowerOn ? '5.00 V Active' : '0.00 V (Standby)'}</span>
          <span className={circuitState.isEnergized ? 'text-emerald-600 font-bold' : 'text-amber-600 font-semibold'}>
            {circuitState.isEnergized ? 'IC Energized' : 'IC Unpowered'}
          </span>
        </div>
      </div>

      {/* Function Generator 1: Sinusoidal Message Waveform (Step 3) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${circuitState.hasCh0 ? 'bg-sky-500' : 'bg-slate-300'}`} />
            <span>FG 1: CH0 Input (Pin 13)</span>
          </h3>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
            circuitState.hasCh0 ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-400'
          }`}>
            {circuitState.hasCh0 ? '1V, 100Hz Sine' : 'OPEN WIRE'}
          </span>
        </div>
        <LabeledSlider
          label="Sine Frequency (f1)"
          value={f1}
          onChange={setF1}
          min={50}
          max={500}
          step={10}
          unit=" Hz"
          accentColor="#0284c7"
        />
        <div className="mt-3">
          <LabeledSlider
            label="Sine Amplitude"
            value={amp1}
            onChange={setAmp1}
            min={0.2}
            max={2.0}
            step={0.1}
            unit=" V"
            accentColor="#0284c7"
          />
        </div>
        <WaveSparkline type="sine" freq={f1} amp={amp1} color="#38bdf8" />
      </div>

      {/* Function Generator 2: Triangular Message Waveform (Step 3) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${circuitState.hasCh1 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span>FG 2: CH1 Input (Pin 14)</span>
          </h3>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
            circuitState.hasCh1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
          }`}>
            {circuitState.hasCh1 ? '1V, 300Hz Triangle' : 'OPEN WIRE'}
          </span>
        </div>
        <LabeledSlider
          label="Triangle Frequency (f2)"
          value={f2}
          onChange={setF2}
          min={100}
          max={800}
          step={20}
          unit=" Hz"
          accentColor="#059669"
        />
        <div className="mt-3">
          <LabeledSlider
            label="Triangle Amplitude"
            value={amp2}
            onChange={setAmp2}
            min={0.2}
            max={2.0}
            step={0.1}
            unit=" V"
            accentColor="#059669"
          />
        </div>
        <WaveSparkline type="triangle" freq={f2} amp={amp2} color="#34d399" />
      </div>

      {/* Control Switching Clock (Step 4) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${circuitState.hasClkMux ? 'bg-blue-600' : 'bg-slate-300'}`} />
            <span>Control Clock: Pin 11 (Select A)</span>
          </h3>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
            circuitState.hasClkMux ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'
          }`}>
            {circuitState.hasClkMux ? '5V Square' : 'OPEN WIRE'}
          </span>
        </div>
        <LabeledSlider
          label="Clock Frequency (f_clk)"
          value={clkFreq}
          onChange={setClkFreq}
          min={1.0}
          max={10.0}
          step={0.5}
          unit=" kHz"
          accentColor="#2563eb"
        />
        <div className="mt-3">
          <LabeledSlider
            label="Clock Duty Cycle"
            value={dutyCycle}
            onChange={setDutyCycle}
            min={20}
            max={80}
            step={5}
            unit=" %"
            accentColor="#2563eb"
          />
        </div>
        <WaveSparkline type="clock" freq={clkFreq} amp={5.0} duty={dutyCycle} color="#60a5fa" />
      </div>
    </div>
  )

  // Visualization Main View
  const visualization = (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl shadow-xs">
          <button
            onClick={() => setActiveTab('breadboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'breadboard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={13} className="text-amber-600" />
            <span>Interactive Breadboard</span>
          </button>
          <button
            onClick={() => setActiveTab('dso')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'dso' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity size={13} className="text-sky-600" />
            <span>Lab Waveforms (DSO)</span>
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === '3d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box size={13} className="text-emerald-600" />
            <span>3D Virtual Lab Bench</span>
          </button>
          <button
            onClick={() => setShowDirectDeskAR(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xs transition-all active:scale-95"
            title="Open camera to project circuit on your physical desk"
          >
            <Camera size={13} />
            <span>Desk AR (Camera)</span>
          </button>
        </div>

        {/* Live Status Pill (Only shows completion badge when ready) */}
        {circuitState.allReady && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Procedure Complete • Real Outputs Active
            </span>
          </div>
        )}
      </div>

      {/* ── TAB 1: INTERACTIVE BREADBOARD WIRING ── */}
      {activeTab === 'breadboard' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <InteractiveBreadboard
            activeProcedureStep={activeStep + 1}
            isPowerSwitchedOn={isPowerOn}
            onConnectionsChange={(wires) => setPlacedWires(wires)}
          />
        </div>
      )}

      {/* ── TAB 2: DIGITAL STORAGE OSCILLOSCOPE (DSO) REAL HARDWARE SIGNALS ── */}
      {activeTab === 'dso' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Real Oscilloscope Outputs (Procedure Verification)</h3>
              <p className="text-xs text-slate-500">Waveforms dynamically respond to breadboard jumper connections</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setDsoChannel('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${dsoChannel === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                All Channels
              </button>
              <button
                onClick={() => setDsoChannel('inputs')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${dsoChannel === 'inputs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Step 3 Inputs
              </button>
              <button
                onClick={() => setDsoChannel('tdm')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${dsoChannel === 'tdm' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'}`}
              >
                Step 6 Pin 3
              </button>
              <button
                onClick={() => setDsoChannel('recon')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${dsoChannel === 'recon' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600'}`}
              >
                Step 8 Reconstructed
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {/* Step 3: Message Signal 1 (Pin 13 Sinusoidal Wave) */}
            {(dsoChannel === 'all' || dsoChannel === 'inputs') && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-sky-400 font-mono flex items-center gap-2">
                    <span>x₁(t) — Procedure Step 3: {amp1}V, {f1}Hz Sinusoidal Wave (Pin 13 X0)</span>
                    {!circuitState.hasCh0 ? (
                      <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-700 font-bold">
                        FG OUTPUT (Connect wire to Pin 13)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-bold">
                        INJECTED TO IC
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">CH1 • 1.0 V/div</span>
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24 bg-slate-900 rounded-lg">
                  <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="3,3" />
                  <polyline
                    points={((circuitState.hasCh0 ? ch0Pts : rawCh0Pts) || []).map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                    fill="none" stroke="#38bdf8" strokeWidth="2"
                    strokeDasharray={circuitState.hasCh0 ? 'none' : '4,3'}
                    opacity={circuitState.hasCh0 ? 1 : 0.75}
                  />
                </svg>
              </div>
            )}

            {/* Step 3: Message Signal 2 (Pin 14 Triangular Wave) */}
            {(dsoChannel === 'all' || dsoChannel === 'inputs') && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-emerald-400 font-mono flex items-center gap-2">
                    <span>x₂(t) — Procedure Step 3: {amp2}V, {f2}Hz Triangular Wave (Pin 14 X1)</span>
                    {!circuitState.hasCh1 ? (
                      <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-700 font-bold">
                        FG OUTPUT (Connect wire to Pin 14)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-bold">
                        INJECTED TO IC
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">CH2 • 1.0 V/div</span>
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24 bg-slate-900 rounded-lg">
                  <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="3,3" />
                  <polyline
                    points={((circuitState.hasCh1 ? ch1Pts : rawCh1Pts) || []).map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                    fill="none" stroke="#34d399" strokeWidth="2"
                    strokeDasharray={circuitState.hasCh1 ? 'none' : '4,3'}
                    opacity={circuitState.hasCh1 ? 1 : 0.75}
                  />
                </svg>
              </div>
            )}

            {/* Step 4: Control Clock Signal (Pin 11 Select A) */}
            {(dsoChannel === 'all' || dsoChannel === 'tdm') && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-blue-400 font-mono flex items-center gap-2">
                    <span>x₃(t) — Procedure Step 4: 5V, {clkFreq}kHz Square Wave (Pin 11 Select A)</span>
                    {!circuitState.hasClkMux ? (
                      <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-700 font-bold">
                        CLOCK ACTIVE (Connect wire to Pin 11)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 font-bold">
                        CLOCK COUPLED
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">CLK • 2.5 V/div</span>
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24 bg-slate-900 rounded-lg">
                  <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="3,3" />
                  <polyline
                    points={((circuitState.hasClkMux ? clkPts : rawClkPts) || []).map(p => `${scaleX(p.x)},${scaleYClock(p.y)}`).join(' ')}
                    fill="none" stroke="#60a5fa" strokeWidth="2"
                    strokeDasharray={circuitState.hasClkMux ? 'none' : '4,3'}
                    opacity={circuitState.hasClkMux ? 1 : 0.75}
                  />
                </svg>
              </div>
            )}

            {/* Step 6: TDM Output (Pin 3 Composite PAM Waveform) */}
            {(dsoChannel === 'all' || dsoChannel === 'tdm') && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-purple-400 font-mono flex items-center gap-2">
                    <span>TDM Output (Pin 3) — Procedure Step 6: Interleaved Composite PAM</span>
                    {!circuitState.isEnergized ? (
                      <span className="text-[10px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-800 font-bold">
                        IC POWER OFF (0.0V)
                      </span>
                    ) : !circuitState.hasTdmProbe ? (
                      <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800 font-bold">
                        PROBE OPEN (Connect Pin 3)
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[11px] font-mono text-purple-300">Composite PAM Bus</span>
                </div>
                <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-28 bg-slate-900 rounded-lg">
                  <line x1={pad} y1={(H + 20) / 2} x2={W - pad} y2={(H + 20) / 2} stroke="#334155" strokeDasharray="3,3" />
                  <polyline
                    points={tdmPts.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                    fill="none" stroke="#c084fc" strokeWidth="2.5"
                    opacity={circuitState.isEnergized && circuitState.hasTdmProbe ? 1 : 0.2}
                  />
                </svg>
              </div>
            )}

            {/* Step 8: Reconstructed Message Signals after Low-Pass Filter */}
            {(dsoChannel === 'all' || dsoChannel === 'recon') && (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-teal-400 font-mono flex items-center gap-2">
                    <span>Reconstructed Signals — Procedure Step 8 (Junction of R1/C1 and R2/C2)</span>
                    {!circuitState.isEnergized ? (
                      <span className="text-[10px] bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-800 font-bold">
                        IC UNPOWERED
                      </span>
                    ) : !circuitState.hasTdmBridge ? (
                      <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800 font-bold">
                        DEMUX BUS OPEN (Bridge Pin 3)
                      </span>
                    ) : (!circuitState.hasRc0Probe || !circuitState.hasRc1Probe) ? (
                      <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800 font-bold">
                        CONNECT RC PROBES
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[11px] font-mono text-teal-300">fc ≈ 284 Hz</span>
                </div>
                <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-28 bg-slate-900 rounded-lg">
                  <line x1={pad} y1={(H + 20) / 2} x2={W - pad} y2={(H + 20) / 2} stroke="#334155" strokeDasharray="3,3" />
                  {/* Reconstructed CH0 Sine */}
                  <polyline
                    points={recon0Pts.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                    fill="none" stroke="#38bdf8" strokeWidth="2"
                    opacity={circuitState.hasRc0Probe && circuitState.isEnergized ? 1 : 0.2}
                  />
                  {/* Reconstructed CH1 Triangle */}
                  <polyline
                    points={recon1Pts.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                    fill="none" stroke="#34d399" strokeWidth="2"
                    opacity={circuitState.hasRc1Probe && circuitState.isEnergized ? 1 : 0.2}
                  />
                </svg>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1 font-mono">
                  <span className="text-sky-400">● Blue: Recovered 100Hz Sine (R1 = 5.6kΩ, C1 = 0.1μF)</span>
                  <span className="text-emerald-400">● Green: Recovered 300Hz Triangle (R2 = 5.6kΩ, C2 = 0.1μF)</span>
                  <span>Harmonic Attenuation &gt; 38dB</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: 3D INTERACTIVE VIRTUAL LAB BENCH ── */}
      {activeTab === '3d' && (
        <TDMVirtualLab3D
          clkFreq={clkFreq}
          isCircuitPowered={circuitState.isEnergized}
        />
      )}

      {/* ── FULLSCREEN CAMERA DESK AR MODAL ── */}
      {showDirectDeskAR && (
        <DeskCameraAR
          onClose={() => setShowDirectDeskAR(false)}
          clkFreq={clkFreq}
          isCircuitPowered={circuitState.isEnergized}
        />
      )}
    </div>
  )

  return (
    <MissionShell
      title={t('TDM & Demultiplexing using IC 4051', 'IC 4051 ಬಳಸಿ TDM ಮತ್ತು ಡಿ-ಮಲ್ಟಿಪ್ಲೆಕ್ಸಿಂಗ್')}
      subject="Electronics"
      accentColor="emerald"
      gradientFrom="from-emerald-600"
      gradientTo="to-teal-700"
      aim={tdmAim}
      apparatus={tdmApparatus}
      steps={steps}
      currentStep={activeStep}
      controls={controls}
      visualization={visualization}
      observations={observations}
    />
  )
}
