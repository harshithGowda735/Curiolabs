import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Setup Modulating Signal Generator', description: 'Configure analog baseband message frequency fm (1 kHz) and amplitude Am (2V)' },
  { title: 'Generate Sampling Pulse Train', description: 'Apply square pulse train carrier fs with configurable duty cycle (pulse width τ)' },
  { title: 'Toggle Natural vs Flat-Top PAM', description: 'Compare analog tracing (natural sampling) against sample-and-hold (flat-top PAM)' },
  { title: 'Verify Nyquist Rate (fs >= 2fm)', description: 'Reduce sampling frequency below 2fm to induce aliasing spectral overlap' },
  { title: 'Reconstruct via Low-Pass Filter', description: 'Pass PAM pulse train through a 2nd-order active low-pass reconstruction filter' },
  { title: 'Inspect PAM Trainer Kit in AR', description: 'Examine IC 555 pulse generator and analog switch hardware in 3D WebAR' }
]

const observations = [
  'In Natural PAM, the amplitude of the pulse tops follows the exact contour of the modulating signal m(t)',
  'In Flat-Top PAM, the pulse amplitude remains flat at the sampled instant, introducing an aperture distortion (sinc attenuation)',
  'Nyquist sampling theorem states that the sampling rate must satisfy fs >= 2 · fm_max to avoid aliasing distortion',
  'Sample and hold circuits typically use an analog FET switch (e.g. CD4016 / CD4066) followed by a low-leakage storage capacitor',
  'A low-pass reconstruction filter with cutoff fc = fm attenuates high-frequency sampling harmonics, restoring the original baseband wave'
]

export default function PulseAmplitudeModulation() {
  const { t } = useLanguage()
  const [fm, setFm] = useState(1.0) // kHz
  const [am, setAm] = useState(2.5) // V
  const [fs, setFs] = useState(10.0) // kHz
  const [dutyCycle, setDutyCycle] = useState(25) // %
  const [samplingType, setSamplingType] = useState('natural') // 'natural' or 'flattop'
  const [showAR, setShowAR] = useState(false)

  // Nyquist condition
  const nyquistRate = 2 * fm
  const isAliasing = fs < nyquistRate

  // Waveform sample points
  const { msgPoints, carrierPoints, pamPoints, reconstructedPoints } = useMemo(() => {
    const msg = []
    const carrier = []
    const pam = []
    const rec = []

    const numSamples = 250
    let lastHeldVal = 0

    for (let i = 0; i <= numSamples; i++) {
      const timeMs = (i / numSamples) * 2.0 // 0 to 2.0 ms
      const mVal = 2.5 + am * Math.sin(2 * Math.PI * fm * timeMs)

      // Sampling carrier pulse
      const phase = (timeMs * fs) % 1
      const isPulseHigh = phase < (dutyCycle / 100)

      if (phase < (1 / numSamples) * fs) {
        lastHeldVal = mVal // Sample instant for flat-top
      }

      const pulseVal = isPulseHigh ? 5 : 0
      const pamVal = isPulseHigh
        ? (samplingType === 'natural' ? mVal : lastHeldVal)
        : 0

      // Reconstructed signal with simulated aliasing if fs < 2fm
      const aliasFreq = isAliasing ? Math.abs(fs - fm) : fm
      const recVal = isAliasing
        ? 2.5 + am * 0.7 * Math.sin(2 * Math.PI * aliasFreq * timeMs) + 0.3 * Math.sin(timeMs * 20)
        : mVal

      msg.push({ x: i, y: mVal })
      carrier.push({ x: i, y: pulseVal })
      pam.push({ x: i, y: pamVal, active: isPulseHigh })
      rec.push({ x: i, y: recVal })
    }

    return { msgPoints: msg, carrierPoints: carrier, pamPoints: pam, reconstructedPoints: rec }
  }, [fm, am, fs, dutyCycle, samplingType, isAliasing])

  const W = 360, H = 105, pad = 25
  const scaleX = (i) => pad + (i / 250) * (W - 2 * pad)
  const scaleY = (v, maxV = 6) => H - pad - (v / maxV) * (H - 2 * pad)

  const controls = (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-emerald-900 block">Exp 3: Part-A Discrete Hardware Lab</span>
          <span className="text-emerald-700">Duration: 2 Hours • Bloom's Level: L1, L2, L3</span>
        </div>
        <span className="px-2.5 py-1 rounded-md font-mono font-bold bg-emerald-200 text-emerald-800 text-[11px]">
          FET Analog Switch
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Baseband Message Parameters', 'ಬೇಸ್‌ಬ್ಯಾಂಡ್ ಸಂದೇಶ')}</h3>
        <LabeledSlider label="Message Frequency (fm)" value={fm} onChange={setFm} min={0.5} max={3.0} step={0.1} unit=" kHz" accentColor="#3b82f6" />
        <div className="mt-3">
          <LabeledSlider label="Message Amplitude (Am)" value={am} onChange={setAm} min={1.0} max={2.5} step={0.1} unit=" V" accentColor="#ef4444" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Sampling Pulse Carrier (fs)', 'ಮಾದರಿ ಪಲ್ಸ್ ಕ್ಯಾರಿಯರ್')}</h3>
        <LabeledSlider label="Sampling Rate (fs)" value={fs} onChange={setFs} min={1.5} max={20.0} step={0.5} unit=" kHz" accentColor="#f59e0b" />
        <div className="mt-3">
          <LabeledSlider label="Pulse Duty Cycle (τ / Ts)" value={dutyCycle} onChange={setDutyCycle} min={10} max={50} step={5} unit=" %" accentColor="#8b5cf6" />
        </div>

        {/* Sampling Type Mode Toggle */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setSamplingType('natural')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              samplingType === 'natural' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Natural PAM
          </button>
          <button
            onClick={() => setSamplingType('flattop')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              samplingType === 'flattop' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Flat-Top PAM (S&H)
          </button>
        </div>

        {/* Nyquist Criterion Badge */}
        <div className={`mt-4 p-3 rounded-xl border text-center text-xs ${
          isAliasing ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <span className="font-semibold block">Nyquist Criterion Status (fs ≥ 2·fm)</span>
          <span className="font-mono text-sm font-bold block mt-0.5">
            fs: {fs} kHz {isAliasing ? '<' : '≥'} Nyquist: {nyquistRate.toFixed(1)} kHz
          </span>
          <span className="text-[11px] block mt-0.5">
            {isAliasing ? '[ALIASING DETECTED: Spectral Foldover Distortion]' : '[NYQUIST SATISFIED: Error-free Recovery]'}
          </span>
        </div>

        <button
          onClick={() => setShowAR(!showAR)}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
        >
          {showAR ? t('Hide AR Hardware View', 'AR ಮರೆಮಾಡಿ') : t('View PAM Trainer Kit in 3D WebAR', 'AR ನಲ್ಲಿ PAM ಕಿಟ್ ನೋಡಿ')}
        </button>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {showAR && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-gray-800">{t('WebAR PAM Modulation Trainer Hardware', 'PAM ಹಾರ್ಡ್‌ವೇರ್')}</h3>
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-medium">Trainer Bench View</span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-900 min-h-[300px]">
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              alt="PAM Trainer Kit Setup"
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
                Place PAM Kit on Bench (AR)
              </button>
            </model-viewer>
          </div>
        </div>
      )}

      {/* DSO Oscilloscope Waveforms */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">{t('PAM Waveforms (Digital Oscilloscope)', 'DSO ತರಂಗಗಳು')}</h3>

        <div className="space-y-3">
          {/* Baseband Modulating Signal */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-blue-500">Analog Message m(t): {fm} kHz Sine</span>
              <span className="font-mono text-gray-400 text-[11px]">Am = {am} V</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H - 30}`} className="w-full bg-slate-950 rounded-xl">
              <line x1={pad} y1={(H - 30) / 2} x2={W - pad} y2={(H - 30) / 2} stroke="#334155" strokeDasharray="2,2" />
              <polyline
                points={msgPoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 6) - 15}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Pulse Carrier Train */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-purple-400">Sampling Pulse Train Carrier p(t)</span>
              <span className="font-mono text-gray-400 text-[11px]">fs = {fs} kHz • Duty = {dutyCycle}%</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H - 35}`} className="w-full bg-slate-950 rounded-xl">
              <polyline
                points={carrierPoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 6) - 15}`).join(' ')}
                fill="none"
                stroke="#c084fc"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* PAM Modulated Waveform */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-amber-500">
                {samplingType === 'natural' ? 'Natural PAM Waveform s_PAM(t)' : 'Flat-Top PAM Waveform (Sample & Hold)'}
              </span>
              <span className="font-mono text-gray-400 text-[11px]">
                {samplingType === 'natural' ? 'Traced Top' : 'Aperture Flat'}
              </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-slate-950 rounded-xl">
              <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#334155" />
              {/* Natural/Flat top pulses */}
              {pamPoints.map((p, idx) => {
                if (!p.active) return null
                return (
                  <line
                    key={idx}
                    x1={scaleX(p.x)}
                    y1={scaleY(0, 6)}
                    x2={scaleX(p.x)}
                    y2={scaleY(p.y, 6)}
                    stroke="#fbbf24"
                    strokeWidth="2"
                  />
                )
              })}
            </svg>
          </div>

          {/* Reconstructed Signal */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-emerald-500">Reconstructed Output (Active Low-Pass Filter)</span>
              <span className={`text-[11px] font-bold ${isAliasing ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isAliasing ? 'Aliased Waveform' : 'Clean Recovered Sine'}
              </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H - 30}`} className="w-full bg-slate-950 rounded-xl">
              <line x1={pad} y1={(H - 30) / 2} x2={W - pad} y2={(H - 30) / 2} stroke="#334155" strokeDasharray="2,2" />
              <polyline
                points={reconstructedPoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 6) - 15}`).join(' ')}
                fill="none"
                stroke={isAliasing ? '#ef4444' : '#34d399'}
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Hardware Block Diagram */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-xs">
        <h3 className="font-display font-bold text-gray-800 mb-2">{t('PAM Generation & Demodulation Topology', 'PAM ವಿನ್ಯಾಸ')}</h3>
        <div className="p-3 bg-slate-900 rounded-xl text-slate-300 font-mono text-[11px] flex items-center justify-between">
          <div className="p-2 bg-slate-800 rounded border border-slate-700">
            <span className="text-blue-400 block font-bold">m(t) Baseband</span>
            <span>AF Osc.</span>
          </div>
          <span className="text-gray-500">➔ [ FET Switch ] ➔</span>
          <div className="p-2 bg-indigo-950 rounded border border-indigo-700 text-indigo-200 text-center">
            <span className="block font-bold">PAM Signal</span>
            <span className="text-[9px]">S&H Capacitor</span>
          </div>
          <span className="text-gray-500">➔ [ Butterworth LPF ] ➔</span>
          <div className="p-2 bg-slate-800 rounded border border-slate-700 text-emerald-400 font-bold">
            m*(t) Recovered
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Generation & Detection of Pulse Amplitude Modulation', 'PAM ಮಾಡ್ಯುಲೇಶನ್ ಉತ್ಪಾದನೆ ಮತ್ತು ಪತ್ತೆ')}
      domain="Electronics & Communication"
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
