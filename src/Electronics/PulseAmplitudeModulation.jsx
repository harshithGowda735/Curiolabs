import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'
import { Activity, Radio, Cpu, Sparkles } from 'lucide-react'

const steps = [
  { title: 'Setup Modulating Signal Generator', description: 'Configure analog baseband message frequency fm (1 kHz) and amplitude Am (2V)' },
  { title: 'Generate Sampling Pulse Train', description: 'Apply square pulse train carrier fs with configurable duty cycle (pulse width τ)' },
  { title: 'Toggle Natural vs Flat-Top PAM', description: 'Compare analog tracing (natural sampling) against sample-and-hold (flat-top PAM)' },
  { title: 'Verify Nyquist Rate (fs >= 2fm)', description: 'Reduce sampling frequency below 2fm to induce aliasing spectral overlap' },
  { title: 'Reconstruct via Low-Pass Filter', description: 'Pass PAM pulse train through a 2nd-order active low-pass reconstruction filter' },
  { title: 'Inspect PAM Trainer Kit in AR', description: 'Examine IC 555 pulse generator and analog switch hardware in 3D WebAR' }
]

const apparatusList = [
  { slNo: '1.', particulars: 'Audio Frequency (AF) Signal Generator', range: '100 Hz – 10 kHz Sine', quantity: '01' },
  { slNo: '2.', particulars: 'Pulse Generator / Clock Generator', range: '1 kHz – 50 kHz Square', quantity: '01' },
  { slNo: '3.', particulars: 'PAM Modulator Trainer Kit', range: 'IC CD4016 / CD4066 FET Switch', quantity: '01' },
  { slNo: '4.', particulars: '2nd-Order Low-Pass Filter (LPF)', range: 'fc = 3.4 kHz Butterworth', quantity: '01' },
  { slNo: '5.', particulars: 'Digital Storage Oscilloscope (DSO)', range: '100 MHz Dual Trace', quantity: '01' }
]

const observations = [
  'In Natural PAM, the amplitude of the pulse tops follows the exact contour of the modulating signal m(t).',
  'In Flat-Top PAM, the pulse amplitude remains flat at the sampled instant, introducing an aperture distortion (sinc attenuation).',
  'Nyquist sampling theorem states that the sampling rate must satisfy fs >= 2 · fm_max to avoid aliasing distortion.',
  'Sample and hold circuits typically use an analog FET switch (e.g. CD4016 / CD4066) followed by a low-leakage storage capacitor.',
  'A low-pass reconstruction filter with cutoff fc = fm attenuates high-frequency sampling harmonics, restoring the original baseband wave.'
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
        lastHeldVal = mVal
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
      {/* Hardware Badge */}
      <div className="bg-[#221611] text-[#FAF5EB] rounded-2xl p-4 border-2 border-[#221611] flex items-center justify-between text-xs shadow-[3px_3px_0px_#221611]">
        <div>
          <span className="font-black text-[#A4C93B] block uppercase tracking-wide">
            Exp 3: Analog Bilateral Transmission
          </span>
          <span className="text-[#FAF5EB]/70 font-mono text-[11px]">
            CD4016 / CD4066 Solid-State FET Matrix
          </span>
        </div>
        <span className="px-2.5 py-1 rounded-full font-mono font-bold bg-[#A4C93B] text-[#221611] text-[11px] border border-[#221611]">
          Hardware Lab
        </span>
      </div>

      {/* Baseband Modulating Signal Card */}
      <div className="bg-white rounded-2xl border-2 border-[#221611] p-5 shadow-[3px_3px_0px_#221611]">
        <h3 className="font-display font-black text-[#221611] text-xs uppercase tracking-wider mb-3">
          {t('Baseband Message Parameters', 'ಬೇಸ್‌ಬ್ಯಾಂಡ್ ಸಂದೇಶ')}
        </h3>
        <LabeledSlider label="Message Frequency (fm)" value={fm} onChange={setFm} min={0.5} max={3.0} step={0.1} unit=" kHz" accentColor="#0284c7" />
        <div className="mt-3">
          <LabeledSlider label="Message Amplitude (Am)" value={am} onChange={setAm} min={1.0} max={2.5} step={0.1} unit=" V" accentColor="#dc2626" />
        </div>
      </div>

      {/* Sampling Carrier & Modulation Mode */}
      <div className="bg-white rounded-2xl border-2 border-[#221611] p-5 shadow-[3px_3px_0px_#221611]">
        <h3 className="font-display font-black text-[#221611] text-xs uppercase tracking-wider mb-3">
          {t('Sampling Pulse Carrier (fs)', 'ಮಾದರಿ ಪಲ್ಸ್ ಕ್ಯಾರಿಯರ್')}
        </h3>
        <LabeledSlider label="Sampling Rate (fs)" value={fs} onChange={setFs} min={1.5} max={20.0} step={0.5} unit=" kHz" accentColor="#f59e0b" />
        <div className="mt-3">
          <LabeledSlider label="Pulse Duty Cycle (τ / Ts)" value={dutyCycle} onChange={setDutyCycle} min={10} max={50} step={5} unit=" %" accentColor="#7c3aed" />
        </div>

        {/* Sampling Type Mode Toggle */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setSamplingType('natural')}
            className={`flex-1 py-2.5 text-xs font-black uppercase rounded-xl border-2 border-[#221611] transition-all cursor-pointer ${
              samplingType === 'natural'
                ? 'bg-[#A4C93B] text-[#221611] shadow-[2px_2px_0px_#221611]'
                : 'bg-[#FAF5EB] text-[#221611] hover:bg-white'
            }`}
          >
            Natural PAM
          </button>
          <button
            onClick={() => setSamplingType('flattop')}
            className={`flex-1 py-2.5 text-xs font-black uppercase rounded-xl border-2 border-[#221611] transition-all cursor-pointer ${
              samplingType === 'flattop'
                ? 'bg-[#A4C93B] text-[#221611] shadow-[2px_2px_0px_#221611]'
                : 'bg-[#FAF5EB] text-[#221611] hover:bg-white'
            }`}
          >
            Flat-Top PAM (S&H)
          </button>
        </div>

        {/* Nyquist Criterion Badge */}
        <div className={`mt-4 p-3.5 rounded-xl border-2 text-center text-xs font-mono font-bold ${
          isAliasing
            ? 'bg-rose-50 border-rose-400 text-rose-900'
            : 'bg-[#FAF5EB] border-[#221611] text-[#221611]'
        }`}>
          <span className="font-black block uppercase text-[11px]">Nyquist Criterion Status (fs ≥ 2·fm)</span>
          <span className="text-sm font-black block mt-1">
            fs: {fs} kHz {isAliasing ? '<' : '≥'} Nyquist: {nyquistRate.toFixed(1)} kHz
          </span>
          <span className={`text-[11px] block mt-1 font-bold ${isAliasing ? 'text-rose-600' : 'text-[#A4C93B] bg-[#221611] px-2 py-0.5 rounded-full inline-block mt-1'}`}>
            {isAliasing ? '[ ALIASING DETECTED: SPECTRAL OVERLAP ]' : '[ NYQUIST SATISFIED: ZERO ALIASING ]'}
          </span>
        </div>

        <button
          onClick={() => setShowAR(!showAR)}
          className="w-full mt-4 bg-[#221611] hover:bg-[#332219] text-[#FAF5EB] border-2 border-[#221611] font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_#221611] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
        >
          <Sparkles size={14} className="text-[#A4C93B]" />
          <span>{showAR ? t('Hide AR Hardware View', 'AR ಮರೆಮಾಡಿ') : t('View PAM Trainer Kit in 3D WebAR', 'AR ನಲ್ಲಿ PAM ಕಿಟ್ ನೋಡಿ')}</span>
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
              {t('WebAR PAM Modulation Trainer Hardware', 'PAM ಹಾರ್ಡ್‌ವೇರ್')}
            </h3>
            <span className="text-xs text-[#221611] bg-[#A4C93B] px-2.5 py-0.5 rounded-full font-mono font-bold border border-[#221611]">
              Trainer Bench View
            </span>
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-[#221611] min-h-[300px] border-2 border-[#221611]">
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
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#A4C93B] text-[#221611] font-black px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-xs border-2 border-[#221611]"
              >
                Place PAM Kit on Bench (AR)
              </button>
            </model-viewer>
          </div>
        </div>
      )}

      {/* DSO Oscilloscope Waveforms */}
      <div className="bg-white rounded-2xl border-2 border-[#221611] p-5 shadow-[3px_3px_0px_#221611]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-black text-xs uppercase tracking-wider text-[#221611]">
            {t('PAM Waveforms (Digital Storage Oscilloscope)', 'DSO ತರಂಗಗಳು')}
          </h3>
          <span className="text-[10px] font-mono font-bold bg-[#FAF5EB] text-[#221611] px-2.5 py-0.5 rounded-full border border-[#221611]/20">
            DSO-3000 • RUNNING
          </span>
        </div>

        <div className="space-y-3.5">
          {/* Baseband Modulating Signal */}
          <div className="bg-[#FAF5EB] p-3 rounded-xl border border-[#221611]/15">
            <div className="flex justify-between text-xs font-mono font-bold mb-1.5 text-[#221611]">
              <span className="text-blue-700">1. Analog Message m(t): {fm} kHz Sine</span>
              <span className="text-[#221611]/60">Am = {am} V</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H - 30}`} className="w-full bg-[#10141b] rounded-xl border border-[#221611]/30">
              <line x1={pad} y1={(H - 30) / 2} x2={W - pad} y2={(H - 30) / 2} stroke="#1e293b" strokeDasharray="3,3" />
              <polyline
                points={msgPoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 6) - 15}`).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          {/* Pulse Carrier Train */}
          <div className="bg-[#FAF5EB] p-3 rounded-xl border border-[#221611]/15">
            <div className="flex justify-between text-xs font-mono font-bold mb-1.5 text-[#221611]">
              <span className="text-purple-700">2. Sampling Pulse Train Carrier p(t)</span>
              <span className="text-[#221611]/60">fs = {fs} kHz • Duty = {dutyCycle}%</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H - 35}`} className="w-full bg-[#10141b] rounded-xl border border-[#221611]/30">
              <polyline
                points={carrierPoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 6) - 15}`).join(' ')}
                fill="none"
                stroke="#c084fc"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* PAM Modulated Waveform */}
          <div className="bg-[#FAF5EB] p-3 rounded-xl border border-[#221611]/15">
            <div className="flex justify-between text-xs font-mono font-bold mb-1.5 text-[#221611]">
              <span className="text-amber-700">
                3. {samplingType === 'natural' ? 'Natural PAM Waveform s_PAM(t)' : 'Flat-Top PAM Waveform (Sample & Hold)'}
              </span>
              <span className="text-[#221611]/60">
                {samplingType === 'natural' ? 'Traced Envelope' : 'Aperture Flat'}
              </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-[#10141b] rounded-xl border border-[#221611]/30">
              <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#1e293b" />
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
                    strokeWidth="2.5"
                  />
                )
              })}
            </svg>
          </div>

          {/* Reconstructed Signal */}
          <div className="bg-[#FAF5EB] p-3 rounded-xl border border-[#221611]/15">
            <div className="flex justify-between text-xs font-mono font-bold mb-1.5 text-[#221611]">
              <span className="text-emerald-700">4. Reconstructed Output (Active Low-Pass Filter)</span>
              <span className={`text-[11px] font-bold ${isAliasing ? 'text-rose-600' : 'text-emerald-700'}`}>
                {isAliasing ? '⚠ Aliased Harmonic Distorted' : '✓ Clean Recovered Sine'}
              </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H - 30}`} className="w-full bg-[#10141b] rounded-xl border border-[#221611]/30">
              <line x1={pad} y1={(H - 30) / 2} x2={W - pad} y2={(H - 30) / 2} stroke="#1e293b" strokeDasharray="3,3" />
              <polyline
                points={reconstructedPoints.map(p => `${scaleX(p.x)},${scaleY(p.y, 6) - 15}`).join(' ')}
                fill="none"
                stroke={isAliasing ? '#ef4444' : '#34d399'}
                strokeWidth="2.8"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Hardware Block Diagram */}
      <div className="bg-white rounded-2xl border-2 border-[#221611] p-5 shadow-[3px_3px_0px_#221611] text-xs">
        <h3 className="font-display font-black text-[#221611] uppercase tracking-wider mb-3">
          {t('PAM Generation & Demodulation Topology', 'PAM ವಿನ್ಯಾಸ')}
        </h3>
        <div className="p-3.5 bg-[#221611] rounded-xl text-[#FAF5EB] font-mono text-[11px] flex items-center justify-between border-2 border-[#221611]">
          <div className="p-2 bg-[#332219] rounded-lg border border-[#FAF5EB]/20 text-center">
            <span className="text-[#38bdf8] block font-black">m(t) Baseband</span>
            <span className="text-[10px] text-[#FAF5EB]/60">AF Osc.</span>
          </div>
          <span className="text-[#A4C93B] font-bold">➔ [ FET Switch ] ➔</span>
          <div className="p-2 bg-[#332219] rounded-lg border border-[#A4C93B]/40 text-center">
            <span className="block font-black text-[#A4C93B]">PAM Signal</span>
            <span className="text-[9px] text-[#FAF5EB]/60">S&H Cap</span>
          </div>
          <span className="text-[#A4C93B] font-bold">➔ [ Butterworth LPF ] ➔</span>
          <div className="p-2 bg-[#332219] rounded-lg border border-[#34d399]/40 text-[#34d399] font-black text-center">
            m*(t) Recovered
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Pulse Amplitude Modulation & Demodulation', 'PAM ಮಾಡ್ಯುಲೇಶನ್ ಉತ್ಪಾದನೆ ಮತ್ತು ಪತ್ತೆ')}
      titleEmoji="📡"
      subject="Electronics"
      aim="To study the generation of Pulse Amplitude Modulation (Natural and Flat-Top) and demodulation using an active 2nd-order low-pass filter."
      apparatus={apparatusList}
      steps={steps}
      observations={observations}
      controls={controls}
      visualization={visualization}
    />
  )
}
