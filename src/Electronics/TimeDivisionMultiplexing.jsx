import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'
import { CheckCircle2, AlertTriangle, XCircle, Zap, RefreshCw, Sparkles, HelpCircle } from 'lucide-react'

const steps = [
  { title: 'Wire Power Supply (+5V & GND)', description: 'Connect DC +5V to Pin 16 (VDD) and GND to Pin 8 (VSS) and Pin 6 (INH) to power the IC.' },
  { title: 'Connect Signal Generators (CH0 & CH1)', description: 'Feed analog signals from function generators to IC 4051 input pins (X0 = Pin 13, X1 = Pin 14).' },
  { title: 'Route Clock to Address Select (A)', description: 'Connect TTL square clock pulse to Pin 11 (Select A) to drive channel switching.' },
  { title: 'Connect TDM Transmission Bus & Demux', description: 'Wire Common I/O (Pin 3) of MUX to DEMUX input, and wire Demux output to Low-Pass Filter.' },
  { title: 'Verify Real-Time Waveforms on DSO', description: 'Check for fault-free TDM interleaved waveform and recovered original analog channels.' }
]

const observations = [
  'Time Division Multiplexing (TDM) interleaves multiple analog signals onto a single transmission medium by sharing time slots',
  'IC 4051 is a single 8-channel analog multiplexer/demultiplexer CMOS chip with low ON-resistance (~80Ω)',
  'Nyquist sampling theorem dictates switching clock frequency f_clk >= 2 * f_max to avoid cross-channel crosstalk',
  'Synchronization between the multiplexer and de-multiplexer address pins is mandatory to prevent channel misallocation',
  'Low-pass reconstruction filters (RC integrator) smooth the discrete de-multiplexed pulses back into clean sinusoidal waves'
]

// Required hardware connections
const REQUIRED_WIRES = [
  { id: 'pwr_vcc', name: 'Power (+5V Rail → Pin 16 VDD)', from: 'P5V', to: 'PIN16', color: '#ef4444', essential: true, desc: 'Powers CMOS logic and transmission gates' },
  { id: 'pwr_gnd', name: 'Ground (GND Rail → Pin 8 VSS)', from: 'GND', to: 'PIN8', color: '#1e293b', essential: true, desc: 'Sets 0V circuit ground reference' },
  { id: 'pwr_inh', name: 'Inhibit Tie-Down (GND Rail → Pin 6 INH)', from: 'GND', to: 'PIN6', color: '#334155', essential: true, desc: 'Grounds Inhibit pin to enable switch matrix' },
  { id: 'sig_ch0', name: 'Signal Gen 1 → Pin 13 (X0 Input)', from: 'SG1', to: 'PIN13', color: '#3b82f6', essential: true, desc: 'Feeds Channel 0 analog sine wave' },
  { id: 'sig_ch1', name: 'Signal Gen 2 → Pin 14 (X1 Input)', from: 'SG2', to: 'PIN14', color: '#10b981', essential: true, desc: 'Feeds Channel 1 analog sine wave' },
  { id: 'clk_sel', name: 'Clock Gen → Pin 11 (Select A)', from: 'CLK', to: 'PIN11', color: '#f59e0b', essential: true, desc: 'Drives binary address switching clock' },
  { id: 'tdm_bus', name: 'Pin 3 (COM Out) → TDM Bus Line', from: 'PIN3', to: 'BUS', color: '#ec4899', essential: true, desc: 'Carries time-sliced multiplexed composite pulse train' },
  { id: 'dso_out', name: 'Demux Filter Out → DSO Channel 1', from: 'DEMUX', to: 'DSO', color: '#8b5cf6', essential: false, desc: 'Demultiplexed and smoothed reconstructed signal probe' }
]

export default function TimeDivisionMultiplexing() {
  const { t } = useLanguage()
  const [f1, setF1] = useState(1.0) // kHz
  const [f2, setF2] = useState(2.5) // kHz
  const [clkFreq, setClkFreq] = useState(15) // kHz switching
  const [dutyCycle, setDutyCycle] = useState(50) // %
  const [showAR, setShowAR] = useState(false)
  const [activeTab, setActiveTab] = useState('breadboard') // 'breadboard' | 'dso' | 'ar'
  
  // Wires connected state (set of wire IDs)
  const [connectedWires, setConnectedWires] = useState(
    new Set(['pwr_vcc', 'pwr_gnd', 'pwr_inh', 'sig_ch0', 'sig_ch1', 'clk_sel', 'tdm_bus', 'dso_out'])
  )

  const toggleWire = (wireId) => {
    setConnectedWires(prev => {
      const next = new Set(prev)
      if (next.has(wireId)) next.delete(wireId)
      else next.add(wireId)
      return next
    })
  }

  const wireAll = () => {
    setConnectedWires(new Set(REQUIRED_WIRES.map(w => w.id)))
  }

  const clearAllWires = () => {
    setConnectedWires(new Set())
  }

  const toggleSingleFault = () => {
    setConnectedWires(prev => {
      const next = new Set(prev)
      if (next.has('pwr_inh')) next.delete('pwr_inh') // Create INH fault
      else if (next.has('clk_sel')) next.delete('clk_sel')
      else next.delete('pwr_vcc')
      return next
    })
  }

  // Diagnostic Engine & Error Suggestions
  const diagnostics = useMemo(() => {
    const errors = []
    const warnings = []

    const hasVcc = connectedWires.has('pwr_vcc')
    const hasGnd = connectedWires.has('pwr_gnd')
    const hasInh = connectedWires.has('pwr_inh')
    const hasCh0 = connectedWires.has('sig_ch0')
    const hasCh1 = connectedWires.has('sig_ch1')
    const hasClk = connectedWires.has('clk_sel')
    const hasBus = connectedWires.has('tdm_bus')
    const hasDso = connectedWires.has('dso_out')

    if (!hasVcc) {
      errors.push({
        id: 'no_vcc',
        title: 'Power Failure: Pin 16 (VDD) Disconnected',
        suggestion: 'Connect red jumper wire from the +5V power rail to Pin 16. The IC 4051 cannot operate without supply voltage.',
        severity: 'critical'
      })
    }
    if (!hasGnd) {
      errors.push({
        id: 'no_gnd',
        title: 'Ground Fault: Pin 8 (VSS) Floating',
        suggestion: 'Connect black jumper wire from the GND rail to Pin 8 to provide circuit ground reference.',
        severity: 'critical'
      })
    }
    if (!hasInh) {
      errors.push({
        id: 'inh_floating',
        title: 'Multiplexer Disabled: Pin 6 (INH) Floating/High',
        suggestion: 'Pin 6 is the INHIBIT pin (active HIGH). Tie Pin 6 to the GND rail with a jumper to enable switch channels.',
        severity: 'high'
      })
    }
    if (!hasClk) {
      errors.push({
        id: 'no_clk',
        title: 'Clock Missing: Pin 11 (Address A) Floating',
        suggestion: 'Connect clock generator output (f_clk) to Pin 11. Without clock pulses, the multiplexer cannot switch time slots.',
        severity: 'high'
      })
    }
    if (!hasBus) {
      errors.push({
        id: 'no_bus',
        title: 'Open Circuit: Common Output (Pin 3) Disconnected',
        suggestion: 'Connect jumper wire from Pin 3 (Common X Out) to the TDM transmission bus line.',
        severity: 'high'
      })
    }
    if (!hasCh0) {
      warnings.push({
        id: 'no_ch0',
        title: 'Channel 0 Unconnected',
        suggestion: 'Connect Signal Generator 1 to Pin 13 (X0) to inject the 1st analog message waveform.'
      })
    }
    if (!hasCh1) {
      warnings.push({
        id: 'no_ch1',
        title: 'Channel 1 Unconnected',
        suggestion: 'Connect Signal Generator 2 to Pin 14 (X1) to inject the 2nd analog message waveform.'
      })
    }
    if (!hasDso) {
      warnings.push({
        id: 'no_dso',
        title: 'DSO Probe Not Connected',
        suggestion: 'Connect oscilloscope probe to Demux output filter to monitor reconstructed analog waveforms.'
      })
    }

    const isOperational = hasVcc && hasGnd && hasInh && hasBus
    const isClocking = isOperational && hasClk

    return { errors, warnings, isOperational, isClocking, hasCh0, hasCh1, hasDso }
  }, [connectedWires])

  // Real-time Waveform points calculation depending on hardware wiring state
  const { ch0Points, ch1Points, tdmPoints, demux0Points } = useMemo(() => {
    const pts0 = []
    const pts1 = []
    const tdm = []
    const demux0 = []

    const numSamples = 200
    for (let i = 0; i <= numSamples; i++) {
      const time = (i / numSamples) * 2 // 0 to 2 ms
      
      // If hardware has no power or INH is high: dead flatline with slight noise floor
      if (!diagnostics.isOperational) {
        pts0.push({ x: i, y: 0.05 * Math.sin(i) })
        pts1.push({ x: i, y: 0.05 * Math.cos(i) })
        tdm.push({ x: i, y: 0 })
        demux0.push({ x: i, y: 0 })
        continue
      }

      // Channel 0: Sine wave 1 (if connected)
      const val0 = diagnostics.hasCh0 ? 2.5 + 1.8 * Math.sin(2 * Math.PI * f1 * time) : 0
      // Channel 1: Sine wave 2 (if connected)
      const val1 = diagnostics.hasCh1 ? 2.5 + 1.6 * Math.sin(2 * Math.PI * f2 * time) : 0

      // Clock switching state
      let isCh0Active = true
      if (diagnostics.isClocking) {
        const clkPhase = (time * clkFreq) % 1
        isCh0Active = clkPhase < (dutyCycle / 100)
      } else {
        // Stuck on CH0 if clock is floating
        isCh0Active = true
      }

      const tdmVal = isCh0Active ? val0 : val1
      pts0.push({ x: i, y: val0 })
      pts1.push({ x: i, y: val1 })
      tdm.push({ x: i, y: tdmVal, active: isCh0Active ? 0 : 1 })

      // Demux output (if probe connected and circuit clocking)
      if (diagnostics.hasDso && diagnostics.isClocking && diagnostics.hasCh0) {
        // Reconstructed smoothed approximation
        const filterLag = 0.85
        const reconstructed = 2.5 + 1.7 * Math.sin(2 * Math.PI * f1 * (time - 0.05))
        demux0.push({ x: i, y: isCh0Active ? val0 : reconstructed })
      } else {
        demux0.push({ x: i, y: 0 })
      }
    }

    return { ch0Points: pts0, ch1Points: pts1, tdmPoints: tdm, demux0Points: demux0 }
  }, [f1, f2, clkFreq, dutyCycle, diagnostics])

  const W = 380, H = 95, pad = 20
  const scaleX = (i) => pad + (i / 200) * (W - 2 * pad)
  const scaleY = (v) => H - pad - ((v / 5) * (H - 2 * pad))

  // Controls Panel
  const controls = (
    <div className="space-y-4">
      {/* Syllabus Badge */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 text-xs block">Part – A: Discrete Hardware Experiment 1</span>
            <span className="text-slate-500 text-[11px]">Time Division Multiplexing & De-multiplexing</span>
          </div>
          <span className="px-2.5 py-1 rounded-md font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
            IC 4051 CMOS
          </span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Duration: 2 Hours</span>
          <span>Bloom's: L1, L2, L3 (Apply)</span>
        </div>
      </div>

      {/* Hardware Connection Action Toolbar */}
      <div className="bg-white rounded-xl shadow-2xs border border-slate-200/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" />
            <span>Hardware Wiring Controls</span>
          </h3>
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {connectedWires.size} / {REQUIRED_WIRES.length} Wires
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={wireAll}
            className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <CheckCircle2 size={13} />
            <span>Wire All (Auto)</span>
          </button>
          <button
            onClick={clearAllWires}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} />
            <span>Remove Wires</span>
          </button>
        </div>

        <button
          onClick={toggleSingleFault}
          className="w-full mt-2 py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <AlertTriangle size={13} />
          <span>Simulate Connection Fault</span>
        </button>
      </div>

      {/* Signal Generator Controls */}
      <div className="bg-white rounded-xl shadow-2xs border border-slate-200/80 p-4">
        <h3 className="font-bold text-slate-900 text-xs mb-3">Dual Function Generators</h3>
        <LabeledSlider
          label="Signal Gen 1 (CH0 Input)"
          value={f1}
          onChange={setF1}
          min={0.5}
          max={3.0}
          step={0.1}
          unit=" kHz"
          accentColor="#3b82f6"
        />
        <div className="mt-3">
          <LabeledSlider
            label="Signal Gen 2 (CH1 Input)"
            value={f2}
            onChange={setF2}
            min={1.0}
            max={5.0}
            step={0.2}
            unit=" kHz"
            accentColor="#10b981"
          />
        </div>
      </div>

      {/* Clock Switching Generator */}
      <div className="bg-white rounded-xl shadow-2xs border border-slate-200/80 p-4">
        <h3 className="font-bold text-slate-900 text-xs mb-3">TTL Clock Generator (f_clk)</h3>
        <LabeledSlider
          label="Clock Frequency (Pin 11)"
          value={clkFreq}
          onChange={setClkFreq}
          min={5}
          max={40}
          step={1}
          unit=" kHz"
          accentColor="#f59e0b"
        />
        <div className="mt-3">
          <LabeledSlider
            label="Switching Duty Cycle"
            value={dutyCycle}
            onChange={setDutyCycle}
            min={20}
            max={80}
            step={5}
            unit=" %"
            accentColor="#8b5cf6"
          />
        </div>
      </div>

      {/* IC 4051 Hardware Pin Reference Card */}
      <div className="bg-white rounded-xl shadow-2xs border border-slate-200/80 p-4 text-xs">
        <h3 className="font-bold text-slate-900 mb-2">IC 4051 CMOS 16-Pin DIP Reference</h3>
        <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div>• Pin 16: VDD (+5V)</div>
          <div>• Pin 8: VSS (GND)</div>
          <div>• Pin 3: Common I/O</div>
          <div>• Pin 6: INH (GND)</div>
          <div>• Pin 13: X0 (CH0)</div>
          <div>• Pin 14: X1 (CH1)</div>
          <div>• Pin 11: Addr A (Clk)</div>
          <div>• Pin 10: Addr B (GND)</div>
        </div>
      </div>
    </div>
  )

  // Right Visualization Panel
  const visualization = (
    <div className="space-y-4">
      {/* Tab Selector: Breadboard Hardware vs DSO Scope vs WebAR */}
      <div className="flex items-center p-1 bg-slate-200/80 rounded-xl max-w-fit shadow-2xs">
        <button
          onClick={() => setActiveTab('breadboard')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'breadboard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Real Breadboard Hardware Setup
        </button>
        <button
          onClick={() => setActiveTab('dso')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'dso' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Oscilloscope Waveforms (DSO)
        </button>
        <button
          onClick={() => setActiveTab('ar')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'ar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3D WebAR Physical Inspection
        </button>
      </div>

      {/* Real-Time Smart Diagnostic & Error Suggestion Box */}
      <div className="bg-white rounded-xl shadow-2xs border border-slate-200/80 p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-500" />
            <span>Real-Time Circuit Verification & Diagnostics</span>
          </h4>
          {diagnostics.errors.length === 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Circuit Operational
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {diagnostics.errors.length} Wiring Fault(s) Detected
            </span>
          )}
        </div>

        {diagnostics.errors.length === 0 && diagnostics.warnings.length === 0 ? (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">All Hardware Connections Verified!</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                IC 4051 VDD, GND, Inhibit, inputs, clock, and output bus are correctly routed. Analog signals are actively interleaving in real time.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {diagnostics.errors.map(err => (
              <div key={err.id} className="p-3 bg-rose-50/80 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start gap-2.5">
                <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-800 block">{err.title}</span>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed font-sans">
                    <span className="font-semibold">Suggestion:</span> {err.suggestion}
                  </p>
                </div>
              </div>
            ))}
            {diagnostics.warnings.map(warn => (
              <div key={warn.id} className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-800 block">{warn.title}</span>
                  <p className="text-[11px] text-amber-700 font-sans">{warn.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: REAL BREADBOARD HARDWARE CONNECTION BENCH */}
      {activeTab === 'breadboard' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Real Hardware Breadboard Connection Setup</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Interactive Tie-Points
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any jumper wire switch in the table to connect/disconnect hardware lines in real-time.
              </p>
            </div>
          </div>

          {/* Interactive SVG Breadboard Simulator */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 relative overflow-hidden shadow-inner text-white">
            {/* Top DC Power Rails */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-rose-400 font-bold">+5V Power Rail</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-sky-400 font-bold">GND Reference Rail</span>
              </div>
            </div>

            {/* Breadboard Visual & IC 4051 Chip */}
            <div className="my-6 py-4 px-6 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-around gap-6">
              {/* Left Apparatus: Power & Function Generators */}
              <div className="space-y-3 w-full md:w-auto">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block font-mono">DC Power Supply</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="font-bold text-white font-mono">+5.0 V DC</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block font-mono">Signal Generator 1 (X0)</span>
                  <span className="font-bold text-sky-400 font-mono">{f1} kHz Sine (CH0)</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block font-mono">Signal Generator 2 (X1)</span>
                  <span className="font-bold text-emerald-400 font-mono">{f2} kHz Sine (CH1)</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block font-mono">Clock Generator (TTL)</span>
                  <span className="font-bold text-amber-400 font-mono">{clkFreq} kHz Sq (f_clk)</span>
                </div>
              </div>

              {/* Central Physical IC 4051 Chip on Breadboard */}
              <div className="flex flex-col items-center">
                <div className="text-[11px] font-mono text-slate-400 mb-2 font-bold tracking-wider">
                  BREADBOARD IC SOCKET (DIP-16)
                </div>
                
                <div className="relative w-40 bg-zinc-900 border-2 border-zinc-700 rounded-lg p-3 shadow-2xl">
                  {/* IC Top Notch */}
                  <div className="w-6 h-3 bg-zinc-950 border-b border-zinc-700 mx-auto rounded-b-full mb-3" />
                  
                  <div className="text-center font-mono font-bold text-zinc-300 text-xs mb-3 tracking-wider">
                    CD4051BE
                  </div>

                  {/* Pins: Left (1-8) & Right (16-9) */}
                  <div className="flex justify-between text-[10px] font-mono">
                    <div className="space-y-2">
                      <div className={`px-1.5 py-0.5 rounded ${connectedWires.has('sig_ch0') ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-zinc-500'}`}>13: X0</div>
                      <div className={`px-1.5 py-0.5 rounded ${connectedWires.has('sig_ch1') ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-500'}`}>14: X1</div>
                      <div className={`px-1.5 py-0.5 rounded ${connectedWires.has('tdm_bus') ? 'bg-pink-500/20 text-pink-300 font-bold' : 'text-zinc-500'}`}>3: COM</div>
                      <div className={`px-1.5 py-0.5 rounded ${connectedWires.has('pwr_inh') ? 'bg-slate-700 text-slate-200 font-bold' : 'text-rose-400 font-bold'}`}>6: INH</div>
                      <div className={`px-1.5 py-0.5 rounded ${connectedWires.has('pwr_gnd') ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-rose-400 font-bold'}`}>8: VSS</div>
                    </div>

                    <div className="space-y-2 text-right">
                      <div className={`px-1.5 py-0.5 rounded ${connectedWires.has('pwr_vcc') ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-rose-400 font-bold'}`}>16: VDD</div>
                      <div className={`px-1.5 py-0.5 rounded ${connectedWires.has('clk_sel') ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-zinc-500'}`}>11: A</div>
                      <div className="text-zinc-500 px-1.5 py-0.5">10: B (0)</div>
                      <div className="text-zinc-500 px-1.5 py-0.5">9: C (0)</div>
                      <div className="text-zinc-500 px-1.5 py-0.5">7: VEE (0)</div>
                    </div>
                  </div>
                </div>

                {/* Live Status LED */}
                <div className="mt-3 flex items-center gap-2 text-xs font-mono">
                  <span className={`w-2.5 h-2.5 rounded-full ${diagnostics.isOperational ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' : 'bg-rose-500'}`} />
                  <span className={diagnostics.isOperational ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                    {diagnostics.isOperational ? 'IC 4051 ACTIVE' : 'NO POWER / INHIBITED'}
                  </span>
                </div>
              </div>

              {/* Right Apparatus: Demultiplexer & DSO Probe */}
              <div className="space-y-3 w-full md:w-auto">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block font-mono">TDM Composite Line</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${connectedWires.has('tdm_bus') ? 'bg-pink-400' : 'bg-slate-600'}`} />
                    <span className="font-bold text-pink-400 font-mono">Pin 3 Common Bus</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block font-mono">Demux IC 4051</span>
                  <span className="font-bold text-violet-400 font-mono">Reconstruction Filter</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                  <span className="text-slate-400 block font-mono">DSO CH1 Probe</span>
                  <span className={`font-bold font-mono ${connectedWires.has('dso_out') ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {connectedWires.has('dso_out') ? 'Live Signal Probed' : 'Probe Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Wire Connections Checklist */}
          <div className="mt-5">
            <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center justify-between">
              <span>Jumper Wire Checklist & Status</span>
              <span className="text-slate-500 font-normal text-[11px]">Toggle any wire to verify real-time fault detection</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REQUIRED_WIRES.map((wire) => {
                const isConnected = connectedWires.has(wire.id)
                return (
                  <button
                    key={wire.id}
                    onClick={() => toggleWire(wire.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isConnected
                        ? 'bg-emerald-50/50 border-emerald-200/80 text-slate-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border"
                        style={{ backgroundColor: isConnected ? wire.color : '#cbd5e1' }}
                      >
                        {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <div>
                        <span className={`text-xs font-semibold block ${isConnected ? 'text-slate-900' : 'text-slate-600'}`}>
                          {wire.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block">{wire.desc}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OSCILLOSCOPE WAVEFORMS (DSO) */}
      {activeTab === 'dso' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Real-Time Digital Storage Oscilloscope (DSO)</h3>
              <p className="text-xs text-slate-500">Live hardware signal output reflecting breadboard wiring state.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-600">Scale: 1V/div • 0.2ms/div</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Input Message Signals */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-sky-600">
                  CH0 (Pin 13): {diagnostics.hasCh0 ? `${f1} kHz Sine` : 'Disconnected'}
                </span>
                <span className="font-semibold text-emerald-600">
                  CH1 (Pin 14): {diagnostics.hasCh1 ? `${f2} kHz Sine` : 'Disconnected'}
                </span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-950 rounded-xl shadow-inner">
                <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="2,2" />
                <polyline
                  points={ch0Points.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  opacity={diagnostics.hasCh0 ? 1 : 0.2}
                />
                <polyline
                  points={ch1Points.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  opacity={diagnostics.hasCh1 ? 1 : 0.2}
                />
              </svg>
            </div>

            {/* TDM Composite Transmission Bus */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-pink-600">
                  TDM Composite Output (Pin 3 Bus): {connectedWires.has('tdm_bus') ? 'Active Interleaved' : 'Open Circuit'}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">f_clk = {clkFreq} kHz</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-950 rounded-xl shadow-inner">
                <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="2,2" />
                <polyline
                  points={tdmPoints.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="2.5"
                />
              </svg>
            </div>

            {/* Demultiplexed Reconstructed Output */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-violet-600">
                  Demultiplexed Channel 0 (Recovered via Low-Pass Filter)
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {diagnostics.hasDso ? 'Lock: Synchronous' : 'Probe Disconnected'}
                </span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-950 rounded-xl shadow-inner">
                <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="2,2" />
                <polyline
                  points={demux0Points.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 3D WEBAR PHYSICAL HARDWARE INSPECTION */}
      {activeTab === 'ar' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">WebAR 3D Circuit Hardware Inspection</h3>
              <p className="text-xs text-slate-500">View physical breadboard layout and wire jumpers in interactive 3D / AR.</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
              WebXR / QuickLook
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-950 min-h-[340px] border border-slate-800">
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              alt="IC 4051 Multiplexer Breadboard Setup"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '340px' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs transition-colors"
              >
                Place Circuit on Table (AR)
              </button>
            </model-viewer>
          </div>
        </div>
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
      steps={steps}
      currentStep={0}
      controls={controls}
      visualization={visualization}
      observations={observations}
    />
  )
}
