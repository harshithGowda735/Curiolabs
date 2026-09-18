import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Configure Carrier & Modulating Sources', description: 'Set carrier frequency fc (50 kHz) and baseband message frequency fm (2 kHz)' },
  { title: 'Adjust Modulation Index (μ = Am / Ac)', description: 'Observe envelope behavior across under-modulation (μ < 1), 100% (μ = 1), and over-modulation (μ > 1)' },
  { title: 'Pass Through 1N4148 Diode Envelope Detector', description: 'Rectify the high-frequency modulated waveform and filter through RC low-pass integrator' },
  { title: 'Detect Diagonal Peak Clipping Distortion', description: 'Observe RC time constant threshold where capacitor discharge fails to trace audio envelope' },
  { title: 'Inspect Hardware Demodulator in AR', description: 'Examine the discrete diode-resistor-capacitor detector hardware kit in 3D WebAR' }
]

const observations = [
  'Standard Amplitude Modulation equation: s(t) = A_c · [1 + μ · cos(2π·f_m·t)] · cos(2π·f_c·t)',
  'Modulation index μ = A_m / A_c; when μ > 1 (over-modulation), envelope crosses zero and diode detector causes severe harmonic distortion',
  'The diode envelope detector rectifies positive half-cycles while the shunt capacitor filters out high-frequency RF carrier ripples',
  'To prevent diagonal peak clipping, the RC time constant must satisfy: RC <= sqrt(1 - μ²) / (2π·f_m·μ)',
  'Total transmitted power P_total = P_carrier · (1 + μ² / 2); at 100% modulation, sidebands carry 33.3% of total power'
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

      // Envelope detection (rectification + RC smoothing)
      let detectedVal = Math.max(0, envelope)
      if (isDiagonalClipping) {
        // simulate sluggish RC discharge curve
        detectedVal = Math.max(0, envelope * 0.7 + (Math.sin(timeMs * 3) * 0.5))
      }

      msg.push({ x: i, y: mVal })
      amWave.push({ x: i, y: amVal, envTop: Math.max(0, envelope), envBot: -Math.max(0, envelope) })
      det.push({ x: i, y: detectedVal - ac }) // remove DC offset for audio recovery
    }

    return { messagePoints: msg, amPoints: amWave, detectedPoints: det }
  }, [ac, am, fm, fc, isDiagonalClipping])

  const W = 360, H = 110, pad = 25
  const scaleX = (i) => pad + (i / 300) * (W - 2 * pad)
  const scaleY = (v, maxV = 8) => H / 2 - (v / maxV) * (H / 2 - pad)

  const controls = (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-emerald-900 block">Exp 2: Part-A Discrete Hardware Lab</span>
          <span className="text-emerald-700">Duration: 2 Hours • Bloom's Level: L1, L2, L3</span>
        </div>
        <span className="px-2.5 py-1 rounded-md font-mono font-bold bg-emerald-200 text-emerald-800 text-[11px]">
          1N4148 Diode
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Modulation Parameters', 'ಮಾಡ್ಯುಲೇಶನ್ ನಿಯತಾಂಕಗಳು')}</h3>
        <LabeledSlider label="Carrier Amplitude (Ac)" value={ac} onChange={setAc} min={2.0} max={6.0} step={0.2} unit=" V" accentColor="#3b82f6" />
        <div className="mt-3">
          <LabeledSlider label="Message Amplitude (Am)" value={am} onChange={setAm} min={0.5} max={6.0} step={0.1} unit=" V" accentColor="#ef4444" />
        </div>
        <div className="mt-3">
          <LabeledSlider label="Modulating Frequency (fm)" value={fm} onChange={setFm} min={1.0} max={4.0} step={0.2} unit=" kHz" accentColor="#10b981" />
        </div>

        {/* Modulation Index Gauge */}
        <div className={`mt-4 p-3 rounded-xl border text-center ${
          isOverModulated ? 'bg-rose-50 border-rose-200 text-rose-800' :
          mu >= 0.95 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <span className="text-xs font-semibold block">Modulation Index (μ = Am / Ac)</span>
          <span className="text-2xl font-display font-bold">{(mu * 100).toFixed(1)}% ({mu.toFixed(2)})</span>
          <span className="text-[11px] block mt-0.5 font-medium">
            {isOverModulated ? '[OVER-MODULATION: Distortion]' : mu >= 0.95 ? '[100% CRITICAL MODULATION]' : '[UNDER-MODULATION]'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Envelope Detector RC Values', 'ಡಿಟೆಕ್ಟರ್ RC ಘಟಕಗಳು')}</h3>
        <LabeledSlider label="Filter Resistance (R)" value={resistorK} onChange={setResistorK} min={2} max={50} step={2} unit=" kΩ" accentColor="#f59e0b" />
        <div className="mt-3">
          <LabeledSlider label="Filter Capacitance (C)" value={capMicroF} onChange={setCapMicroF} min={1} max={50} step={1} unit=" nF" accentColor="#8b5cf6" />
        </div>

        {isDiagonalClipping && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 font-medium">
            Diagonal Clipping Warning: RC discharge time ({tauMs.toFixed(2)} ms) exceeds maximum limit ({maxTauMs.toFixed(2)} ms).
          </div>
        )}

        <button
          onClick={() => setShowAR(!showAR)}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
        >
          {showAR ? t('Hide AR Hardware View', 'AR ಮರೆಮಾಡಿ') : t('View Diode Detector in 3D WebAR', 'AR ನಲ್ಲಿ ಡಿಟೆಕ್ಟರ್ ನೋಡಿ')}
        </button>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {showAR && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-gray-800">{t('WebAR AM Modulator & Detector Hardware Kit', 'AM ಹಾರ್ಡ್‌ವೇರ್ ಕಿಟ್')}</h3>
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-medium">Discrete Breadboard</span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-900 min-h-[300px]">
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
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs"
              >
                Place Detector on Bench (AR)
              </button>
            </model-viewer>
          </div>
        </div>
      )}

      {/* DSO Waveforms */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">{t('AM Waveforms & Envelope Recovery (DSO)', 'DSO ತರಂಗಗಳು')}</h3>

        <div className="space-y-3">
          {/* Baseband Modulating Signal */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-red-500">Modulating Message m(t): {fm} kHz</span>
              <span className="font-mono text-gray-400 text-[11px]">Am = {am} V</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H - 25}`} className="w-full bg-slate-950 rounded-xl">
              <line x1={pad} y1={(H - 25) / 2} x2={W - pad} y2={(H - 25) / 2} stroke="#334155" strokeDasharray="2,2" />
              <polyline
                points={messagePoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 6) - 12}`).join(' ')}
                fill="none"
                stroke="#f87171"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Standard AM Modulated Waveform with Envelopes */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-amber-500">Standard AM Output s(t) with RF Envelope</span>
              <span className="font-mono text-gray-400 text-[11px]">fc = {fc} kHz • μ = {mu.toFixed(2)}</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-950 rounded-xl">
              <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#334155" strokeDasharray="2,2" />
              {/* Upper envelope outline */}
              <polyline
                points={amPoints.map(p => `${scaleX(p.x)},${scaleY(p.envTop, 10)}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3,2"
                opacity="0.7"
              />
              {/* High frequency AM carrier */}
              <polyline
                points={amPoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 10)}`).join(' ')}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
              />
              {/* Lower envelope outline */}
              <polyline
                points={amPoints.map(p => `${scaleX(p.x)},${scaleY(p.envBot, 10)}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3,2"
                opacity="0.7"
              />
            </svg>
          </div>

          {/* Demodulated Recovered Output */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-emerald-500">Demodulated Message (Diode + RC Low-Pass Filter)</span>
              <span className="font-mono text-gray-400 text-[11px]">τ = {tauMs.toFixed(2)} ms</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H - 25}`} className="w-full bg-slate-950 rounded-xl">
              <line x1={pad} y1={(H - 25) / 2} x2={W - pad} y2={(H - 25) / 2} stroke="#334155" strokeDasharray="2,2" />
              <polyline
                points={detectedPoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 6) - 12}`).join(' ')}
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Discrete Envelope Detector Circuit Schematic */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-xs">
        <h3 className="font-display font-bold text-gray-800 mb-2">{t('Envelope Detector Hardware Circuit', 'ಡಿಟೆಕ್ಟರ್ ಸರ್ಕ್ಯೂಟ್')}</h3>
        <div className="p-3 bg-slate-900 rounded-xl text-slate-300 font-mono text-[11px] flex items-center justify-between">
          <div className="p-2 bg-slate-800 rounded border border-slate-700">
            <span className="text-amber-400 block font-bold">AM Input</span>
            <span>s(t) Signal</span>
          </div>
          <span className="text-gray-500">➔ [ 1N4148 Diode ] ➔</span>
          <div className="p-2 bg-slate-800 rounded border border-slate-700 text-center">
            <span className="text-purple-300 block font-bold">R // C Shunt</span>
            <span>R={resistorK}kΩ, C={capMicroF}nF</span>
          </div>
          <span className="text-gray-500">➔</span>
          <div className="p-2 bg-slate-800 rounded border border-slate-700 text-emerald-400 font-bold">
            Audio Output m(t)
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Generation & Detection of Standard AM', 'AM ಮಾಡ್ಯುಲೇಶನ್ ಉತ್ಪಾದನೆ ಮತ್ತು ಪತ್ತೆ')}
      domain="Electronics & Communication"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
