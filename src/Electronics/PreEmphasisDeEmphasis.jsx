import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Setup Pre-Emphasis High-Pass Circuit', description: 'Wire R1 (10 kΩ) in parallel with C1 (7.5 nF) in series with R2 for 75 μs time constant' },
  { title: 'Setup De-Emphasis Low-Pass Circuit', description: 'Wire series R (7.5 kΩ) and shunt C (10 nF) for matching 75 μs roll-off' },
  { title: 'Sweep Audio Frequencies (100 Hz - 15 kHz)', description: 'Measure output voltage Vout and calculate gain in decibels: 20·log10(Vout / Vin)' },
  { title: 'Inject High-Frequency Channel Noise', description: 'Observe how de-emphasis suppresses parabolic FM triangular noise' },
  { title: 'Inspect Hardware Breadboard in AR', description: 'View the discrete passive RC pre/de-emphasis networks in 3D WebAR' }
]

const observations = [
  'In FM transmission, noise power spectral density increases quadratically with frequency (parabolic noise)',
  'Pre-emphasis artificially boosts high-frequency audio content (above f1 = 1 / (2πRC) ≈ 2.12 kHz) at +6 dB/octave',
  'De-emphasis at the receiver attenuates the boosted high frequencies by -6 dB/octave, restoring flat frequency response while suppressing noise',
  'The standard time constant is 75 μs in the Americas and 50 μs in Europe and India',
  'The combined pre-emphasis and de-emphasis process significantly enhances output Signal-to-Noise Ratio (SNR) by over 13 dB'
]

export default function PreEmphasisDeEmphasis() {
  const { t } = useLanguage()
  const [standard, setStandard] = useState('75') // '75' or '50' us
  const [freqKHz, setFreqKHz] = useState(3.5) // kHz
  const [noiseLevel, setNoiseLevel] = useState(20) // %
  const [showAR, setShowAR] = useState(false)

  const tauMicroSec = standard === '75' ? 75 : 50
  const f1KHz = 1 / (2 * Math.PI * (tauMicroSec * 1e-6)) / 1000 // Cutoff in kHz (~2.12 kHz for 75us)

  // Calculate pre-emphasis gain, de-emphasis gain, and net gain
  const calcGains = (f) => {
    const ratio = f / f1KHz
    const preGain = Math.sqrt(1 + ratio * ratio)
    const preGainDb = 20 * Math.log10(preGain)

    const deGain = 1 / Math.sqrt(1 + ratio * ratio)
    const deGainDb = 20 * Math.log10(deGain)

    const netGainDb = preGainDb + deGainDb // ideally 0 dB
    return { preGain, preGainDb, deGain, deGainDb, netGainDb }
  }

  const currentGains = useMemo(() => calcGains(freqKHz), [freqKHz, f1KHz])

  // Bode plot points from 0.1 kHz to 15 kHz (logarithmic)
  const bodePoints = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 60; i++) {
      // 0.1 kHz to 15 kHz
      const f = 0.1 * Math.pow(150, i / 60)
      const g = calcGains(f)
      pts.push({ f, ...g, xIdx: i })
    }
    return pts
  }, [f1KHz])

  // Oscilloscope traces
  const { origPoints, prePoints, dePoints } = useMemo(() => {
    const orig = []
    const pre = []
    const de = []
    const numPts = 200

    for (let i = 0; i <= numPts; i++) {
      const timeMs = (i / numPts) * 1.0 // 0 to 1.0 ms
      const cleanSine = Math.sin(2 * Math.PI * freqKHz * timeMs)
      const noise = (Math.random() - 0.5) * (noiseLevel / 50)

      // Pre-emphasized wave (boosted amplitude at high freq)
      const preSine = cleanSine * Math.min(2.5, currentGains.preGain)

      // Channel wave with noise
      const channelWave = preSine + noise

      // De-emphasized wave (restored to original amplitude and filtered noise)
      const filteredNoise = noise * currentGains.deGain
      const deSine = cleanSine + filteredNoise

      orig.push({ x: i, y: cleanSine })
      pre.push({ x: i, y: preSine })
      de.push({ x: i, y: deSine })
    }

    return { origPoints: orig, prePoints: pre, dePoints: de }
  }, [freqKHz, noiseLevel, currentGains])

  const W = 360, H = 140, pad = 35

  const controls = (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-emerald-900 block">Exp 4: Part-A Discrete Hardware Lab</span>
          <span className="text-emerald-700">Duration: 2 Hours • Bloom's Level: L1, L2, L3</span>
        </div>
        <span className="px-2.5 py-1 rounded-md font-mono font-bold bg-emerald-200 text-emerald-800 text-[11px]">
          RC Networks
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">⏱️ {t('Time Constant Standard', 'ಟೈಮ್ ಕಾನ್‌ಸ್ಟಂಟ್')}</h3>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setStandard('75')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              standard === '75' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🇺🇸 75 μs (f₁ = 2.12 kHz)
          </button>
          <button
            onClick={() => setStandard('50')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              standard === '50' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🇮🇳 50 μs (f₁ = 3.18 kHz)
          </button>
        </div>

        <LabeledSlider label="Audio Frequency (f)" value={freqKHz} onChange={setFreqKHz} min={0.2} max={15.0} step={0.2} unit=" kHz" accentColor="#3b82f6" />
        <div className="mt-3">
          <LabeledSlider label="Channel Triangular Noise" value={noiseLevel} onChange={setNoiseLevel} min={0} max={60} step={5} unit=" %" accentColor="#ef4444" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">⚡ {t('Gain Telemetry at {freq} kHz', 'ಗೇನ್ ವಿವರ')}</h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
            <span className="text-blue-700 block font-semibold">Pre-Emphasis</span>
            <span className="font-bold text-blue-900 font-display text-sm">+{currentGains.preGainDb.toFixed(1)} dB</span>
          </div>
          <div className="bg-purple-50 p-2 rounded-lg border border-purple-100">
            <span className="text-purple-700 block font-semibold">De-Emphasis</span>
            <span className="font-bold text-purple-900 font-display text-sm">{currentGains.deGainDb.toFixed(1)} dB</span>
          </div>
          <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
            <span className="text-emerald-700 block font-semibold">Net Audio Gain</span>
            <span className="font-bold text-emerald-900 font-display text-sm">0.0 dB</span>
          </div>
        </div>

        <button
          onClick={() => setShowAR(!showAR)}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
        >
          📱 {showAR ? t('Hide AR Hardware View', 'AR ಮರೆಮಾಡಿ') : t('View Pre/De-Emphasis Board in 3D WebAR', 'AR ನಲ್ಲಿ ಸರ್ಕ್ಯೂಟ್ ನೋಡಿ')}
        </button>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {showAR && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-gray-800">📱 {t('WebAR Pre & De-Emphasis Passive Kit', 'ಹಾರ್ಡ್‌ವೇರ್ ಕಿಟ್')}</h3>
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-medium">Discrete Breadboard</span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-900 min-h-[300px]">
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              alt="Pre-Emphasis Circuit Setup"
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

      {/* Bode Magnitude Frequency Response Curve */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-gray-800">📈 {t('Bode Frequency Response (0.1 kHz - 15 kHz)', 'ಬೋಡೆ ರೆಸ್ಪಾನ್ಸ್')}</h3>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="text-blue-500">■ Pre-Emphasis</span>
            <span className="text-purple-500">■ De-Emphasis</span>
            <span className="text-emerald-500">■ Net Output</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-950 rounded-xl p-1">
          {/* 0 dB Centerline */}
          <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#475569" strokeWidth="1.5" />
          <text x={pad - 5} y={H / 2 + 3} fill="#94a3b8" fontSize="9" textAnchor="end">0 dB</text>
          <text x={pad - 5} y={pad} fill="#94a3b8" fontSize="9" textAnchor="end">+18 dB</text>
          <text x={pad - 5} y={H - pad + 5} fill="#94a3b8" fontSize="9" textAnchor="end">-18 dB</text>

          {/* Cutoff frequency vertical line */}
          {(() => {
            const cx = pad + (Math.log10(f1KHz / 0.1) / Math.log10(150)) * (W - 2 * pad)
            return (
              <g>
                <line x1={cx} y1={pad} x2={cx} y2={H - pad} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
                <text x={cx} y={H - 12} fill="#f59e0b" fontSize="8" textAnchor="middle">f₁ ({f1KHz.toFixed(1)}k)</text>
              </g>
            )
          })()}

          {/* Pre-Emphasis Curve */}
          <polyline
            points={bodePoints.map(p => {
              const x = pad + (p.xIdx / 60) * (W - 2 * pad)
              const y = H / 2 - (p.preGainDb / 20) * (H / 2 - pad)
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />

          {/* De-Emphasis Curve */}
          <polyline
            points={bodePoints.map(p => {
              const x = pad + (p.xIdx / 60) * (W - 2 * pad)
              const y = H / 2 - (p.deGainDb / 20) * (H / 2 - pad)
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#c084fc"
            strokeWidth="2.5"
          />

          {/* Net flat curve */}
          <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#34d399" strokeWidth="2" strokeDasharray="3,3" />

          {/* Current Operating Frequency Marker */}
          {(() => {
            const clampedF = Math.max(0.1, Math.min(15, freqKHz))
            const cx = pad + (Math.log10(clampedF / 0.1) / Math.log10(150)) * (W - 2 * pad)
            return (
              <g transform={`translate(${cx}, ${H / 2})`}>
                <circle cx="0" cy="0" r="4" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="0" y1={-H / 2 + pad} x2="0" y2={H / 2 - pad} stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,2" />
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Real-time Oscilloscope Traces: Before vs After */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">⚡ {t('Noise Attenuation Demonstration (DSO)', 'ಶಬ್ದ ನಿವಾರಣೆ')}</h3>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-blue-500">Transmitted (Pre-Emphasized with Channel Noise)</span>
              <span className="text-gray-400 text-[10px]">Boosted Highs + Noise</span>
            </div>
            <svg viewBox="0 0 360 65" className="w-full bg-slate-950 rounded-xl">
              <polyline
                points={prePoints.map(p => `${pad + (p.x / 200) * (W - 2 * pad)},${32 - p.y * 8}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-emerald-500">Receiver Output (De-Emphasized: Flat Audio & Quieted Noise)</span>
              <span className="text-emerald-400 text-[10px] font-bold">13 dB SNR Improvement</span>
            </div>
            <svg viewBox="0 0 360 65" className="w-full bg-slate-950 rounded-xl">
              <polyline
                points={dePoints.map(p => `${pad + (p.x / 200) * (W - 2 * pad)},${32 - p.y * 12}`).join(' ')}
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Pre-Emphasis & De-Emphasis Circuits', 'ಪ್ರೀ-ಎಂಫಸಿಸ್ ಮತ್ತು ಡಿ-ಎಂಫಸಿಸ್ ಸರ್ಕ್ಯೂಟ್‌ಗಳು')}
      domain="Electronics & Communication"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
