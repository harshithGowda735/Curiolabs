import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Setup IC 4051 Mux/Demux Pins', description: 'Power VDD (+5V), VSS (GND), and wire channel inputs CH0 & CH1 to IC 4051' },
  { title: 'Configure Clock Switching Frequency', description: 'Generate clock pulse train to drive binary address pins (A, B, C)' },
  { title: 'Observe Multiplexed Composite Bus', description: 'Analyze interleaved time-sliced PAM samples on the shared single wire line' },
  { title: 'Demultiplex and Low-Pass Filter', description: 'Route demultiplexed pulses to capacitor hold circuits to reconstruct original signals' },
  { title: 'Inspect IC 4051 Hardware in AR', description: 'View the 16-pin CMOS IC on breadboard with jumper connections in 3D WebAR' }
]

const observations = [
  'Time Division Multiplexing (TDM) interleaves multiple analog signals onto a single transmission medium by sharing time slots',
  'IC 4051 is a single 8-channel analog multiplexer/demultiplexer CMOS chip with low ON-resistance (~80Ω)',
  'Nyquist sampling theorem dictates switching clock frequency f_clk >= 2 * f_max to avoid cross-channel crosstalk',
  'Synchronization between the multiplexer and de-multiplexer address pins is mandatory to prevent channel misallocation',
  'Low-pass reconstruction filters (RC integrator) smooth the discrete de-multiplexed pulses back into clean sinusoidal waves'
]

export default function TimeDivisionMultiplexing() {
  const { t } = useLanguage()
  const [f1, setF1] = useState(1.0) // kHz
  const [f2, setF2] = useState(2.5) // kHz
  const [clkFreq, setClkFreq] = useState(15) // kHz switching
  const [dutyCycle, setDutyCycle] = useState(50) // %
  const [showAR, setShowAR] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState('both') // 'ch0', 'ch1', 'both'

  // Waveform points calculation
  const { ch0Points, ch1Points, tdmPoints, demux0Points, demux1Points } = useMemo(() => {
    const pts0 = []
    const pts1 = []
    const tdm = []
    const demux0 = []
    const demux1 = []

    const numSamples = 200
    for (let i = 0; i <= numSamples; i++) {
      const time = (i / numSamples) * 2 // 0 to 2 ms
      // Channel 0: Sine wave 1
      const val0 = 2.5 + 1.8 * Math.sin(2 * Math.PI * f1 * time)
      // Channel 1: Sine wave 2
      const val1 = 2.5 + 1.6 * Math.sin(2 * Math.PI * f2 * time)

      // Clock state: 0 or 1
      const clkPhase = (time * clkFreq) % 1
      const isCh0Active = clkPhase < (dutyCycle / 100)

      const tdmVal = isCh0Active ? val0 : val1
      pts0.push({ x: i, y: val0 })
      pts1.push({ x: i, y: val1 })
      tdm.push({ x: i, y: tdmVal, active: isCh0Active ? 0 : 1 })

      // Demultiplexed holding values
      demux0.push({ x: i, y: isCh0Active ? val0 : null })
      demux1.push({ x: i, y: !isCh0Active ? val1 : null })
    }

    return { ch0Points: pts0, ch1Points: pts1, tdmPoints: tdm, demux0Points: demux0, demux1Points: demux1 }
  }, [f1, f2, clkFreq, dutyCycle])

  const W = 360, H = 100, pad = 25
  const scaleX = (i) => pad + (i / 200) * (W - 2 * pad)
  const scaleY = (v) => H - pad - ((v / 5) * (H - 2 * pad))

  const controls = (
    <div className="space-y-4">
      {/* Bloom's Taxonomy Badge */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-emerald-900 block">Exp 1: Part-A Discrete Hardware Lab</span>
          <span className="text-emerald-700">Duration: 2 Hours • Bloom's Level: L1, L2, L3 (Analyze)</span>
        </div>
        <span className="px-2.5 py-1 rounded-md font-mono font-bold bg-emerald-200 text-emerald-800 text-[11px]">
          IC 4051 CMOS
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🎛️ {t('Analog Channel Frequencies', 'ಚಾನಲ್ ಆವರ್ತನಗಳು')}</h3>
        <LabeledSlider label="Channel 0 Input Signal (f₁)" value={f1} onChange={setF1} min={0.5} max={3.0} step={0.1} unit=" kHz" accentColor="#3b82f6" />
        <div className="mt-3">
          <LabeledSlider label="Channel 1 Input Signal (f₂)" value={f2} onChange={setF2} min={1.0} max={5.0} step={0.2} unit=" kHz" accentColor="#10b981" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">⚡ {t('IC 4051 Switching Clock', 'IC 4051 ಸ್ವಿಚಿಂಗ್ ಕ್ಲಾಕ್')}</h3>
        <LabeledSlider label="Sampling Clock Frequency (f_clk)" value={clkFreq} onChange={setClkFreq} min={5} max={40} step={1} unit=" kHz" accentColor="#f59e0b" />
        <div className="mt-3">
          <LabeledSlider label="Clock Duty Cycle" value={dutyCycle} onChange={setDutyCycle} min={20} max={80} step={5} unit=" %" accentColor="#8b5cf6" />
        </div>

        <div className="mt-4 flex gap-2">
          {['both', 'ch0', 'ch1'].map(ch => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedChannel === ch ? 'bg-slate-900 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {ch === 'both' ? 'All Channels' : ch === 'ch0' ? 'CH0 Solo' : 'CH1 Solo'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAR(!showAR)}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
        >
          📱 {showAR ? t('Hide AR Hardware View', 'AR ಮರೆಮಾಡಿ') : t('View IC 4051 Circuit in 3D WebAR', 'AR ನಲ್ಲಿ IC 4051 ನೋಡಿ')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-xs">
        <h3 className="font-display font-bold text-gray-800 mb-2">📋 {t('IC 4051 Pinout Specification', 'IC 4051 ಪಿನ್‌ಔಟ್')}</h3>
        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-lg border">
          <div>• Pin 16: VDD (+5V)</div>
          <div>• Pin 8: VSS (GND)</div>
          <div>• Pin 3: Common I/O</div>
          <div>• Pin 6: Inhibit (GND)</div>
          <div>• Pin 13: CH0 Input</div>
          <div>• Pin 14: CH1 Input</div>
          <div>• Pin 11: Address A (Clk)</div>
          <div>• Pin 10: Address B (GND)</div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {showAR && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-gray-800">📱 {t('WebAR CMOS IC 4051 Hardware View', 'IC 4051 ಹಾರ್ಡ್‌ವೇರ್')}</h3>
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-medium">3D Breadboard Wiring</span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-900 min-h-[300px]">
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              alt="IC 4051 Multiplexer Breadboard Setup"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '300px' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs"
              >
                <span>📱</span> Place Circuit on Table (AR)
              </button>
            </model-viewer>
          </div>
        </div>
      )}

      {/* Oscilloscope Traces */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📊 {t('Oscilloscope Waveforms (DSO)', 'ಆಸಿಲ್ಲೋಸ್ಕೋಪ್ ತರಂಗಗಳು')}</h3>

        {/* Channel 0 & Channel 1 Inputs */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-blue-600">CH0 Input: {f1} kHz Sine</span>
              <span className="font-semibold text-emerald-600">CH1 Input: {f2} kHz Sine</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-950 rounded-xl">
              <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="2,2" />
              {/* CH0 trace */}
              <polyline
                points={ch0Points.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                opacity={selectedChannel === 'ch1' ? 0.2 : 1}
              />
              {/* CH1 trace */}
              <polyline
                points={ch1Points.map(p => `${scaleX(p.x)},${scaleY(p.y)}`).join(' ')}
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                opacity={selectedChannel === 'ch0' ? 0.2 : 1}
              />
            </svg>
          </div>

          {/* Multiplexed TDM Composite Bus */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-amber-500">TDM Composite Bus Output (Pin 3)</span>
              <span className="font-mono text-gray-400 text-[11px]">f_clk = {clkFreq} kHz</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-950 rounded-xl">
              <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="2,2" />
              {tdmPoints.map((p, idx) => {
                if (idx === 0) return null
                const prev = tdmPoints[idx - 1]
                const color = p.active === 0 ? '#38bdf8' : '#34d399'
                return (
                  <line
                    key={idx}
                    x1={scaleX(prev.x)}
                    y1={scaleY(prev.y)}
                    x2={scaleX(p.x)}
                    y2={scaleY(p.y)}
                    stroke={color}
                    strokeWidth="2"
                  />
                )
              })}
            </svg>
          </div>

          {/* Demultiplexed Reconstructed Output */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-purple-600">Demux Reconstructed Signals (Post-RC Filter)</span>
              <span className="text-gray-400 text-[11px]">Recovered Channels</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-950 rounded-xl">
              <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="2,2" />
              {/* CH0 recovered */}
              <polyline
                points={ch0Points.map(p => `${scaleX(p.x)},${scaleY(p.y + 0.1)}`).join(' ')}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
              {/* CH1 recovered */}
              <polyline
                points={ch1Points.map(p => `${scaleX(p.x)},${scaleY(p.y - 0.1)}`).join(' ')}
                fill="none"
                stroke="#4ade80"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Hardware Connection Breadboard Schematic */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-xs">
        <h3 className="font-display font-bold text-gray-800 mb-2">🔌 {t('IC 4051 Hardware Wiring Topology', 'ಸರ್ಕ್ಯೂಟ್ ವಿನ್ಯಾಸ')}</h3>
        <div className="p-3 bg-slate-900 rounded-xl text-slate-300 font-mono text-[11px] flex items-center justify-between">
          <div className="p-2 bg-slate-800 rounded border border-slate-700">
            <span className="text-blue-400 block font-bold">Function Gen 1</span>
            <span>CH0 (Pin 13)</span>
          </div>
          <span className="text-gray-500">➔</span>
          <div className="p-2 bg-indigo-950 rounded border border-indigo-700 text-indigo-200 text-center">
            <span className="block font-bold">MUX IC 4051</span>
            <span className="text-[9px]">Time Slicing</span>
          </div>
          <span className="text-gray-500">➔ TDM Line ➔</span>
          <div className="p-2 bg-indigo-950 rounded border border-indigo-700 text-indigo-200 text-center">
            <span className="block font-bold">DEMUX IC 4051</span>
            <span className="text-[9px]">Routing</span>
          </div>
          <span className="text-gray-500">➔</span>
          <div className="p-2 bg-slate-800 rounded border border-slate-700">
            <span className="text-emerald-400 block font-bold">DSO Scope</span>
            <span>Reconstructed</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('TDM & Demultiplexing using IC 4051', 'IC 4051 ಬಳಸಿ TDM ಮತ್ತು ಡಿ-ಮಲ್ಟಿಪ್ಲೆಕ್ಸಿಂಗ್')}
      domain="Electronics & Communication"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
