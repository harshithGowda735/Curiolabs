import { useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Zap, Activity, Info, Sparkles, HelpCircle, ArrowRight, Eye } from 'lucide-react'

/**
 * Expected vs Observed Output Component for TDM & Demultiplexing Lab
 * Compares theoretical textbook waveforms against the student's live circuit output
 * and provides real-time verification diagnostic feedback.
 */
export default function TDMExpectedVsObserved({
  circuitState = {},
  isPowerOn = true,
  f1 = 100,
  f2 = 300,
  amp1 = 1.0,
  amp2 = 1.0,
  clkFreq = 2.0,
  dutyCycle = 50,
  ch0Pts = [],
  ch1Pts = [],
  clkPts = [],
  tdmPts = [],
  recon0Pts = [],
  recon1Pts = []
}) {
  const [selectedWaveform, setSelectedWaveform] = useState('tdm') // 'tdm' | 'recon' | 'inputs'

  // Generate Ideal Theoretical Waveforms (What students SHOULD see as per textbook)
  const theoreticalWaveforms = useMemo(() => {
    const numPoints = 250
    const tSpan = 0.02 // 20 ms
    const tdmIdeal = []
    const clkIdeal = []
    const recon0Ideal = []
    const recon1Ideal = []

    const fClockHz = clkFreq * 1000

    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * tSpan

      // Ideal Message 1: 100 Hz Sine
      const y1 = amp1 * Math.sin(2 * Math.PI * f1 * t)

      // Ideal Message 2: 300 Hz Triangle
      const triPhase = (t * f2) % 1
      const y2 = amp2 * (triPhase < 0.5 ? 4 * triPhase - 1 : 3 - 4 * triPhase)

      // Ideal Clock: 2kHz Square
      const clkPhase = (t * fClockHz) % 1
      const isHigh = clkPhase < (dutyCycle / 100)
      const yClk = isHigh ? 5 : 0

      // Ideal TDM: Interleaved pulse train
      const yTdm = isHigh ? y2 : y1

      // Ideal Reconstructed Signals
      const yRec0 = amp1 * 0.96 * Math.sin(2 * Math.PI * f1 * (t - 0.0003))
      const yRec1 = amp2 * 0.90 * (triPhase < 0.5 ? 4 * triPhase - 1 : 3 - 4 * triPhase)

      tdmIdeal.push({ x: i, y: yTdm })
      clkIdeal.push({ x: i, y: yClk })
      recon0Ideal.push({ x: i, y: yRec0 })
      recon1Ideal.push({ x: i, y: yRec1 })
    }

    return { tdmIdeal, clkIdeal, recon0Ideal, recon1Ideal }
  }, [f1, f2, amp1, amp2, clkFreq, dutyCycle])

  // Diagnostic Match Score & Verification
  const verification = useMemo(() => {
    const checks = [
      {
        id: 'pwr',
        label: 'DC Power Rail (+5V VDD & GND)',
        passed: circuitState.isEnergized,
        errorMsg: !isPowerOn ? '5V DC Power Supply switch is OFF' : 'Pin 16 VDD is unpowered'
      },
      {
        id: 'ch0',
        label: 'Channel 0 Input (100Hz Sine -> Pin 13)',
        passed: circuitState.hasCh0,
        errorMsg: 'FG1 Sine is not connected to Pin 13'
      },
      {
        id: 'ch1',
        label: 'Channel 1 Input (300Hz Triangle -> Pin 14)',
        passed: circuitState.hasCh1,
        errorMsg: 'FG2 Triangle is not connected to Pin 14'
      },
      {
        id: 'clk',
        label: 'Clock Synchronization (Pin 11 Select A)',
        passed: circuitState.hasClkMux && circuitState.hasClkDemux,
        errorMsg: !circuitState.hasClkMux ? 'Clock not connected to IC1 Pin 11' : 'Clock sync bridge to IC2 is open'
      },
      {
        id: 'tdm_bus',
        label: 'TDM Composite Bus Bridge (Pin 3 -> Pin 3)',
        passed: circuitState.hasTdmBridge,
        errorMsg: 'TDM Bus between MUX Pin 3 and DEMUX Pin 3 is open'
      },
      {
        id: 'recon_probes',
        label: 'Low-Pass Filter Probes (RC0 & RC1)',
        passed: circuitState.hasRc0Probe && circuitState.hasRc1Probe,
        errorMsg: 'DSO probes not attached to LPF filter outputs'
      }
    ]

    const passedCount = checks.filter(c => c.passed).length
    const score = Math.round((passedCount / checks.length) * 100)
    const isPerfect = score === 100

    return { checks, score, isPerfect }
  }, [circuitState, isPowerOn])

  // SVG dimensions
  const W = 480
  const H = 130
  const pad = 16
  const scaleX = (i) => pad + (i / 250) * (W - 2 * pad)
  const scaleY = (v, min = -1.5, max = 1.5) => H - pad - ((v - min) / (max - min)) * (H - 2 * pad)

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm space-y-5">
      {/* Header & Match Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="font-display font-bold text-slate-900 text-sm sm:text-base">
              Expected Output vs. Real Observed Output
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare textbook theoretical waveforms with your live physical breadboard measurement to verify if you are doing it correctly.
          </p>
        </div>

        {/* Verification Badge */}
        <div className="flex items-center gap-2">
          {verification.isPerfect ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% Circuit Match — Perfect Output!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{verification.score}% Match — Wiring Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* Waveform Selector Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setSelectedWaveform('tdm')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            selectedWaveform === 'tdm'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Step 6: TDM Interleaved Output (Pin 3)
        </button>
        <button
          onClick={() => setSelectedWaveform('recon')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            selectedWaveform === 'recon'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Step 8: Reconstructed Filter Output (RC Junction)
        </button>
      </div>

      {/* Side-by-Side Oscilloscope Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* --- LEFT: THEORETICAL EXPECTED OUTPUT --- */}
        <div className="rounded-xl border border-indigo-200 bg-slate-950 p-3.5 flex flex-col justify-between shadow-inner">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-indigo-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>THEORETICAL EXPECTED (What you should get)</span>
              </span>
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
                Reference Lab Manual
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              {selectedWaveform === 'tdm'
                ? 'Ideal 2-channel interleaved PAM pulses alternating between 100Hz Sine and 300Hz Triangle.'
                : 'Ideal smooth analog sine and triangle waveforms after carrier harmonic attenuation.'}
            </p>
          </div>

          {/* Theoretical SVG Screen */}
          <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
              {/* Graticule lines */}
              <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="3,3" />
              <line x1={W / 2} y1={pad} x2={W / 2} y2={H - pad} stroke="#1e293b" strokeDasharray="2,2" />

              {selectedWaveform === 'tdm' ? (
                <polyline
                  points={theoreticalWaveforms.tdmIdeal.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="2.2"
                />
              ) : (
                <>
                  <polyline
                    points={theoreticalWaveforms.recon0Ideal.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />
                  <polyline
                    points={theoreticalWaveforms.recon1Ideal.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>
            <div className="absolute bottom-1 right-2 text-[10px] font-mono text-slate-400">
              Ideal 20ms Window
            </div>
          </div>

          <div className="mt-2 text-[11px] text-indigo-300 font-mono flex justify-between">
            <span>● Status: Reference Model Active</span>
            <span>Target fc = 284 Hz</span>
          </div>
        </div>

        {/* --- RIGHT: REAL OBSERVED CIRCUIT OUTPUT --- */}
        <div className={`rounded-xl p-3.5 flex flex-col justify-between shadow-inner border ${
          verification.isPerfect
            ? 'border-emerald-500/40 bg-slate-950'
            : 'border-amber-500/40 bg-slate-950'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${verification.isPerfect ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>REAL OBSERVED (From your breadboard)</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                verification.isPerfect
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border-amber-700'
              }`}>
                {verification.isPerfect ? 'CIRCUIT ENERGIZED' : 'WIRING INCOMPLETE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              {!circuitState.isEnergized
                ? 'Power switch is OFF or VDD is disconnected — output is a 0.0V flatline.'
                : verification.isPerfect
                ? 'All wires verified! Signal generator inputs are properly multiplexed and reconstructed.'
                : 'Output reflects current wiring state. Connect missing jumper wires to match theoretical waveform.'}
            </p>
          </div>

          {/* Real Live Circuit SVG Screen */}
          <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
              <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="3,3" />
              <line x1={W / 2} y1={pad} x2={W / 2} y2={H - pad} stroke="#1e293b" strokeDasharray="2,2" />

              {selectedWaveform === 'tdm' ? (
                <polyline
                  points={(tdmPts || []).map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="2.2"
                  opacity={circuitState.isEnergized && circuitState.hasTdmProbe ? 1 : 0.25}
                />
              ) : (
                <>
                  <polyline
                    points={(recon0Pts || []).map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    opacity={circuitState.isEnergized && circuitState.hasRc0Probe ? 1 : 0.25}
                  />
                  <polyline
                    points={(recon1Pts || []).map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2"
                    opacity={circuitState.isEnergized && circuitState.hasRc1Probe ? 1 : 0.25}
                  />
                </>
              )}
            </svg>
            <div className="absolute bottom-1 right-2 text-[10px] font-mono text-slate-400">
              {circuitState.isEnergized ? 'Probe Channel Active' : '0V Ground Level'}
            </div>
          </div>

          <div className="mt-2 text-[11px] font-mono flex justify-between">
            <span className={verification.isPerfect ? 'text-emerald-400' : 'text-amber-400'}>
              {verification.isPerfect ? '● 100% Waveform Coincidence' : '● Deviations Present'}
            </span>
            <span className="text-slate-400 font-mono">
              Live f1={f1}Hz, f2={f2}Hz
            </span>
          </div>
        </div>
      </div>

      {/* Diagnostic Checklist: Shows exactly which connections are correct vs missing */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>Diagnostic Checklist (Are you doing it correctly?)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {verification.checks.map(chk => (
            <div
              key={chk.id}
              className={`p-2 rounded-lg border flex items-start gap-2 ${
                chk.passed
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/60 border-amber-200 text-amber-900'
              }`}
            >
              {chk.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block text-[11px]">{chk.label}</span>
                <span className="text-[10px] text-slate-500">
                  {chk.passed ? '✓ Correctly Connected' : `⚠ ${chk.errorMsg}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Observation Table & Student Takeaway Guide */}
      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4 rounded-xl border border-blue-200 text-xs text-slate-700 space-y-2">
        <h4 className="font-bold text-blue-950 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-700" />
          <span>What You Should Observe in Your Lab Record:</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 text-[11px] leading-relaxed">
          <li>
            <strong>Time-Interleaving:</strong> The composite signal at Pin 3 interleaves Channel 0 (100Hz Sine) during clock LOW, and Channel 1 (300Hz Triangle) during clock HIGH.
          </li>
          <li>
            <strong>Nyquist Condition:</strong> Sampling frequency <code className="bg-white px-1 rounded border border-blue-200">f_clk = {clkFreq} kHz</code> satisfies <code className="bg-white px-1 rounded border border-blue-200">fs &ge; 2 &times; 300Hz = 600Hz</code>, successfully preventing aliasing.
          </li>
          <li>
            <strong>Filter Reconstruction:</strong> The RC low-pass filter suppresses the 2 kHz pulse harmonics and reproduces the continuous analog messages with &lt; 5% total harmonic distortion.
          </li>
        </ul>
      </div>
    </div>
  )
}
