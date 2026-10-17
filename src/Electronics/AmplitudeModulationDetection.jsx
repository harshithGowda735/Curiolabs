import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'
import { Sparkles, Radio, Activity } from 'lucide-react'

const steps = [
  { title: 'Configure Carrier & Modulating Sources', description: 'Set carrier frequency fc (50 kHz) and baseband message frequency fm (2 kHz)' },
  { title: 'Adjust Modulation Index (μ = Am / Ac)', description: 'Observe envelope behavior across under-modulation (μ < 1), 100% (μ = 1), and over-modulation (μ > 1)' },
  { title: 'Pass Through 1N4148 Diode Envelope Detector', description: 'Rectify the high-frequency modulated waveform and filter through RC low-pass integrator' },
  { title: 'Detect Diagonal Peak Clipping Distortion', description: 'Observe RC time constant threshold where capacitor discharge fails to trace audio envelope' },
  { title: 'Inspect Hardware Demodulator in AR', description: 'Examine the discrete diode-resistor-capacitor detector hardware kit in 3D WebAR' }
]

const apparatusList = [
  { slNo: '1.', particulars: 'Dual Audio / RF Signal Generator', range: '100 Hz – 1 MHz Sine', quantity: '02' },
  { slNo: '2.', particulars: 'High-Speed Silicon Diode', range: '1N4148 / 1N914', quantity: '01' },
  { slNo: '3.', particulars: 'Precision Decade Resistance Box', range: '1 kΩ – 100 kΩ', quantity: '01' },
  { slNo: '4.', particulars: 'Decade Capacitance Box', range: '1 nF – 100 nF Ceramic', quantity: '01' },
  { slNo: '5.', particulars: 'Digital Storage Oscilloscope (DSO)', range: '100 MHz Dual Trace', quantity: '01' }
]

const observations = [
  'Standard Amplitude Modulation equation: s(t) = A_c · [1 + μ · cos(2π·f_m·t)] · cos(2π·f_c·t).',
  'Modulation index μ = A_m / A_c; when μ > 1 (over-modulation), envelope crosses zero and diode detector causes severe harmonic distortion.',
  'The diode envelope detector rectifies positive half-cycles while the shunt capacitor filters out high-frequency RF carrier ripples.',
  'To prevent diagonal peak clipping, the RC time constant must satisfy: RC <= sqrt(1 - μ²) / (2π·f_m·μ).',
  'Total transmitted power P_total = P_carrier · (1 + μ² / 2); at 100% modulation, sidebands carry 33.3% of total power.'
]

export default function AmplitudeModulationDetection() {
  const { t } = useLanguage()
  const [ac, setAc] = useState(4.0) // V
  const [am, setAm] = useState(2.8) // V
  const [fm, setFm] = useState(2.0) // kHz
  const [fc, setFc] = useState(30.0) // kHz
  const [capMicroF, setCapMicroF] = useState(10) // nF
  const [resistorK, setResistorK] = useState(10) // kΩ
  const [showAR, setShowAR] = useState(false)

  // Modulation index
  const mu = am / Math.max(0.1, ac)
  const isOverModulated = mu > 1.0

  // RC time constant (ms)
  const tauMs = (resistorK * 1e3 * capMicroF * 1e-9) * 1000
  // Diagonal clipping threshold
  const maxTauMs = (1 / (2 * Math.PI * fm)) * 1000
  const isDiagonalClipping = tauMs > maxTauMs

  // Waveform sample points
  const { messagePoints, amPoints, detectedPoints } = useMemo(() => {
    const msg = []
    const amWave = []
    const det = []

    const numSamples = 300
    for (let i = 0; i <= numSamples; i++) {
      const timeMs = (i / numSamples) * 1.5 // 0 to 1.5 ms
      const mVal = am * Math.cos(2 * Math.PI * fm * timeMs)
      const envelope = ac + mVal

      // Carrier
      const carrier = Math.cos(2 * Math.PI * fc * timeMs)
      const amVal = envelope * carrier

      // Envelope detection
      let detectedVal = Math.max(0, envelope)
      if (isDiagonalClipping) {
        detectedVal = Math.max(0, envelope * 0.7 + (Math.sin(timeMs * 3) * 0.5))
      }

      msg.push({ x: i, y: mVal })
      amWave.push({ x: i, y: amVal, envTop: Math.max(0, envelope), envBot: -Math.max(0, envelope) })
      det.push({ x: i, y: detectedVal - ac })
    }

    return { messagePoints: msg, amPoints: amWave, detectedPoints: det }
  }, [ac, am, fm, fc, isDiagonalClipping])

  const W = 360, H = 110, pad = 25
  const scaleX = (i) => pad + (i / 300) * (W - 2 * pad)
  const scaleY = (v, maxV = 8) => H / 2 - (v / maxV) * (H / 2 - pad)

  const controls = (
    <div className="space-y-4">
      {/* Hardware Lab Badge */}
      <div className="bg-[#221611] text-[#FAF5EB] rounded-2xl p-4 border-2 border-[#221611] flex items-center justify-between text-xs shadow-[3px_3px_0px_#221611]">
        <div>
          <span className="font-black text-[#A4C93B] block uppercase tracking-wide">
            Exp 2: Non-Linear Diode Demodulator
          </span>
          <span className="text-[#FAF5EB]/70 font-mono text-[11px]">
            1N4148 Fast Recovery Switch • RC Integrator
          </span>
        </div>
        <span className="px-2.5 py-1 rounded-full font-mono font-bold bg-[#A4C93B] text-[#221611] text-[11px] border border-[#221611]">
          Discrete Lab
        </span>
      </div>

      {/* Modulation Parameters */}
      <div className="bg-white rounded-2xl border-2 border-[#221611] p-5 shadow-[3px_3px_0px_#221611]">
        <h3 className="font-display font-black text-[#221611] text-xs uppercase tracking-wider mb-3">
          {t('Modulation Parameters', 'ಮಾಡ್ಯುಲೇಶನ್ ನಿಯತಾಂಕಗಳು')}
        </h3>
        <LabeledSlider label="Carrier Amplitude (Ac)" value={ac} onChange={setAc} min={2.0} max={6.0} step={0.2} unit=" V" accentColor="#0284c7" />
        <div className="mt-3">
          <LabeledSlider label="Message Amplitude (Am)" value={am} onChange={setAm} min={0.5} max={6.0} step={0.1} unit=" V" accentColor="#dc2626" />
        </div>
        <div className="mt-3">
          <LabeledSlider label="Modulating Frequency (fm)" value={fm} onChange={setFm} min={1.0} max={4.0} step={0.2} unit=" kHz" accentColor="#16a34a" />
        </div>

        {/* Modulation Index Gauge */}
        <div className={`mt-4 p-4 rounded-xl border-2 text-center font-mono ${
          isOverModulated
            ? 'bg-rose-50 border-rose-400 text-rose-950'
            : mu >= 0.95
            ? 'bg-[#FAF5EB] border-[#221611] text-[#221611]'
            : 'bg-[#FAF5EB] border-[#221611] text-[#221611]'
        }`}>
          <span className="text-xs font-black uppercase block tracking-wider">Modulation Index (μ = Am / Ac)</span>
          <span className="text-3xl font-black block mt-1 tracking-tight">{(mu * 100).toFixed(1)}% ({mu.toFixed(2)})</span>
          <span className={`text-[11px] font-bold block mt-1 ${isOverModulated ? 'text-rose-600' : 'text-[#221611]'}`}>
            {isOverModulated ? '[ OVER-MODULATION: ENVELOPE DISTORTION ]' : mu >= 0.95 ? '[ 100% CRITICAL MODULATION ]' : '[ UNDER-MODULATION: LINEAR REGIME ]'}
          </span>
        </div>
      </div>

      {/* Envelope Detector RC Values */}
      <div className="bg-white rounded-2xl border-2 border-[#221611] p-5 shadow-[3px_3px_0px_#221611]">
        <h3 className="font-display font-black text-[#221611] text-xs uppercase tracking-wider mb-3">
          {t('Envelope Detector RC Values', 'ಡಿಟೆಕ್ಟರ್ RC ಘಟಕಗಳು')}
        </h3>
        <LabeledSlider label="Filter Resistance (R)" value={resistorK} onChange={setResistorK} min={2} max={50} step={2} unit=" kΩ" accentColor="#f59e0b" />
        <div className="mt-3">
          <LabeledSlider label="Filter Capacitance (C)" value={capMicroF} onChange={setCapMicroF} min={1} max={50} step={1} unit=" nF" accentColor="#7c3aed" />
        </div>

        {isDiagonalClipping && (
          <div className="mt-3 p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-900 font-bold">
            ⚠ Diagonal Clipping Warning: RC discharge time ({tauMs.toFixed(2)} ms) exceeds maximum limit ({maxTauMs.toFixed(2)} ms).
          </div>
        )}

        <button
          onClick={() => setShowAR(!showAR)}
          className="w-full mt-4 bg-[#221611] hover:bg-[#332219] text-[#FAF5EB] border-2 border-[#221611] font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_#221611] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
        >
          <Sparkles size={14} className="text-[#A4C93B]" />
          <span>{showAR ? t('Hide AR Hardware View', 'AR ಮರೆಮಾಡಿ') : t('View Diode Detector in 3D WebAR', 'AR ನಲ್ಲಿ ಡಿಟೆಕ್ಟರ್ ನೋಡಿ')}</span>
        </button>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {showAR && (
        <div className="bg-white rounded-2xl border-2 border-[#221611] p-5 shadow-[3px_3px_0px_#221611]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-[#221611]">
              {t('WebAR AM Modulator & Detector Hardware Kit', 'AM ಹಾರ್ಡ್‌ವೇರ್ ಕಿಟ್')}
            </h3>
            <span className="text-xs text-[#221611] bg-[#A4C93B] px-2.5 py-0.5 rounded-full font-mono font-bold border border-[#221611]">
              Discrete Breadboard
            </span>
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-[#221611] min-h-[300px] border-2 border-[#221611]">
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              alt="AM Detector Breadboard Setup"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '300px' }}
            >
              <button
                slot="ar-button"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#A4C93B] text-[#221611] font-black px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs border-2 border-[#221611]"
              >
                Place Detector on Bench (AR)
              </button>
            </model-viewer>
          </div>
        </div>
      )}

      {/* DSO Waveforms */}
      <div className="bg-white rounded-2xl border-2 border-[#221611] p-5 shadow-[3px_3px_0px_#221611]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-black text-xs uppercase tracking-wider text-[#221611]">
            {t('AM Waveforms & Envelope Recovery (DSO)', 'DSO ತರಂಗಗಳು')}
          </h3>
          <span className="text-[10px] font-mono font-bold bg-[#FAF5EB] text-[#221611] px-2.5 py-0.5 rounded-full border border-[#221611]/20">
            DSO-3000 • RUNNING
          </span>
        </div>

        <div className="space-y-3.5">
          {/* Baseband Modulating Signal */}
          <div className="bg-[#FAF5EB] p-3 rounded-xl border border-[#221611]/15">
            <div className="flex justify-between text-xs font-mono font-bold mb-1.5 text-[#221611]">
              <span className="text-red-700">1. Modulating Message m(t): {fm} kHz</span>
              <span className="text-[#221611]/60">Am = {am} V</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H - 25}`} className="w-full bg-[#10141b] rounded-xl border border-[#221611]/30">
              <line x1={pad} y1={(H - 25) / 2} x2={W - pad} y2={(H - 25) / 2} stroke="#1e293b" strokeDasharray="3,3" />
              <polyline
                points={messagePoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 6) - 12}`).join(' ')}
                fill="none"
                stroke="#f87171"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          {/* Standard AM Modulated Waveform with Envelopes */}
          <div className="bg-[#FAF5EB] p-3 rounded-xl border border-[#221611]/15">
            <div className="flex justify-between text-xs font-mono font-bold mb-1.5 text-[#221611]">
              <span className="text-amber-700">2. Standard AM Output s(t) with RF Envelope</span>
              <span className="text-[#221611]/60">fc = {fc} kHz • μ = {mu.toFixed(2)}</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-[#10141b] rounded-xl border border-[#221611]/30">
              <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#1e293b" strokeDasharray="3,3" />
              <polyline
                points={amPoints.map(p => `${scaleX(p.x)},${scaleY(p.envTop, 10)}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeDasharray="4,3"
                opacity="0.8"
              />
              <polyline
                points={amPoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 10)}`).join(' ')}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.8"
              />
              <polyline
                points={amPoints.map(p => `${scaleX(p.x)},${scaleY(p.envBot, 10)}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeDasharray="4,3"
                opacity="0.8"
              />
            </svg>
          </div>

          {/* Demodulated Recovered Output */}
          <div className="bg-[#FAF5EB] p-3 rounded-xl border border-[#221611]/15">
            <div className="flex justify-between text-xs font-mono font-bold mb-1.5 text-[#221611]">
              <span className="text-emerald-700">3. Demodulated Message (Diode + RC Low-Pass Filter)</span>
              <span className="text-[#221611]/60">τ = {tauMs.toFixed(2)} ms</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H - 25}`} className="w-full bg-[#10141b] rounded-xl border border-[#221611]/30">
              <line x1={pad} y1={(H - 25) / 2} x2={W - pad} y2={(H - 25) / 2} stroke="#1e293b" strokeDasharray="3,3" />
              <polyline
                points={detectedPoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 6) - 12}`).join(' ')}
                fill="none"
                stroke="#34d399"
                strokeWidth="2.8"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Discrete Envelope Detector Circuit Schematic */}
      <div className="bg-white rounded-2xl border-2 border-[#221611] p-5 shadow-[3px_3px_0px_#221611] text-xs">
        <h3 className="font-display font-black text-[#221611] uppercase tracking-wider mb-3">
          {t('Envelope Detector Hardware Circuit', 'ಡಿಟೆಕ್ಟರ್ ಸರ್ಕ್ಯೂಟ್')}
        </h3>
        <div className="p-3.5 bg-[#221611] rounded-xl text-[#FAF5EB] font-mono text-[11px] flex items-center justify-between border-2 border-[#221611]">
          <div className="p-2 bg-[#332219] rounded-lg border border-[#FAF5EB]/20 text-center">
            <span className="text-[#fbbf24] block font-black">AM Input</span>
            <span className="text-[10px] text-[#FAF5EB]/60">s(t) Carrier</span>
          </div>
          <span className="text-[#A4C93B] font-bold">➔ [ 1N4148 Diode ] ➔</span>
          <div className="p-2 bg-[#332219] rounded-lg border border-[#A4C93B]/40 text-center">
            <span className="text-[#A4C93B] block font-black">R // C Shunt</span>
            <span className="text-[10px] text-[#FAF5EB]/60">R={resistorK}kΩ, C={capMicroF}nF</span>
          </div>
          <span className="text-[#A4C93B] font-bold">➔</span>
          <div className="p-2 bg-[#332219] rounded-lg border border-[#34d399]/40 text-[#34d399] font-black text-center">
            Audio m(t)
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Amplitude Modulation & Diode Detection', 'AM ಮಾಡ್ಯುಲೇಶನ್ ಉತ್ಪಾದನೆ ಮತ್ತು ಪತ್ತೆ')}
      titleEmoji="📻"
      subject="Electronics"
      aim="To generate an Amplitude Modulated (AM) waveform with configurable modulation index and recover the baseband signal using a discrete diode envelope detector."
      apparatus={apparatusList}
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
