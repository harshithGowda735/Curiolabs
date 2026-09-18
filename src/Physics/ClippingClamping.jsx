import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Set Input', description: 'Choose input signal amplitude and frequency' },
  { title: 'Set Clipping Level', description: 'Adjust the reference voltage for clipping/clamping' },
  { title: 'Select Circuit', description: 'Toggle between clipping and clamping circuits' },
  { title: 'Observe Output', description: 'See how the diode circuit transforms the waveform' },
]

const observations = [
  'Clipping circuits remove portions of the waveform above or below a reference level',
  'Clamping circuits shift the entire waveform up or down without changing its shape',
  'Diode forward voltage drop (≈0.7V for Si) affects the actual clipping/clamping level',
  'Positive clipper removes the positive half, negative clipper removes the negative half',
]

export default function ClippingClamping() {
  const { t } = useLanguage()
  const [amplitude, setAmplitude] = useState(5)
  const [refVoltage, setRefVoltage] = useState(2)
  const [mode, setMode] = useState('clip-pos') // clip-pos, clip-neg, clamp-pos, clamp-neg
  const Vd = 0.7 // Diode forward voltage

  const graphW = 400, graphH = 250, pad = 40
  const points = 200

  const waveformData = useMemo(() => {
    const data = []
    for (let i = 0; i < points; i++) {
      const t = (i / points) * 4 * Math.PI
      const vin = amplitude * Math.sin(t)
      let vout = vin
      if (mode === 'clip-pos') vout = Math.min(vin, refVoltage + Vd)
      else if (mode === 'clip-neg') vout = Math.max(vin, -(refVoltage + Vd))
      else if (mode === 'clamp-pos') vout = vin + (refVoltage + amplitude)
      else if (mode === 'clamp-neg') vout = vin - (refVoltage + amplitude)
      data.push({ t, vin, vout })
    }
    return data
  }, [amplitude, refVoltage, mode])

  const maxY = mode.startsWith('clamp') ? amplitude * 3 : amplitude + 1
  const sx = (i) => pad + (i / points) * (graphW - 2 * pad)
  const sy = (v) => graphH / 2 - (v / maxY) * (graphH / 2 - pad)

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📊 {t('Circuit Config', 'ಸರ್ಕ್ಯೂಟ್ ಸಂರಚನೆ')}</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { id: 'clip-pos', label: '✂️ Positive Clip' },
            { id: 'clip-neg', label: '✂️ Negative Clip' },
            { id: 'clamp-pos', label: '📌 Positive Clamp' },
            { id: 'clamp-neg', label: '📌 Negative Clamp' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${mode === m.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {m.label}
            </button>
          ))}
        </div>
        <LabeledSlider label={t('Input Amplitude', 'ಇನ್‌ಪುಟ್ ಆಂಪ್ಲಿಟ್ಯೂಡ್')} value={amplitude} onChange={setAmplitude} min={1} max={10} step={0.5} unit="V" accentColor="#3b82f6" />
        <div className="mt-3">
          <LabeledSlider label={t('Reference Voltage', 'ಉಲ್ಲೇಖ ವೋಲ್ಟೇಜ್')} value={refVoltage} onChange={setRefVoltage} min={0} max={8} step={0.5} unit="V" accentColor="#f59e0b" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📋 {t('Diode Parameters', 'ಡಯೋಡ್ ಪ್ಯಾರಾಮೀಟರ್‌ಗಳು')}</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Forward Voltage (V<sub>d</sub>): <span className="font-bold text-blue-600">0.7V</span> (Silicon)</p>
          <p>Effective {mode.startsWith('clip') ? 'clip' : 'clamp'} level: <span className="font-bold text-amber-600">{(refVoltage + Vd).toFixed(1)}V</span></p>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Waveform Output', 'ವೇವ್‌ಫಾರ್ಮ್ ಔಟ್‌ಪುಟ್')}</h3>
      <svg viewBox={`0 0 ${graphW} ${graphH}`} className="w-full h-auto">
        <line x1={pad} y1={graphH / 2} x2={graphW - pad} y2={graphH / 2} stroke="#e2e8f0" strokeWidth="1" />
        {/* Input waveform */}
        <polyline points={waveformData.map((d, i) => `${sx(i)},${sy(d.vin)}`).join(' ')} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
        {/* Output waveform */}
        <polyline points={waveformData.map((d, i) => `${sx(i)},${sy(d.vout)}`).join(' ')} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
        {/* Reference line */}
        {mode.startsWith('clip') && (
          <line x1={pad} y1={sy(mode === 'clip-pos' ? refVoltage + Vd : -(refVoltage + Vd))} x2={graphW - pad} y2={sy(mode === 'clip-pos' ? refVoltage + Vd : -(refVoltage + Vd))} stroke="#ef4444" strokeWidth="1" strokeDasharray="6 3" />
        )}
      </svg>
      <div className="flex items-center gap-4 justify-center mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-gray-400 inline-block" style={{ borderTop: '2px dashed #94a3b8' }}></span> Input</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block"></span> Output</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block" style={{ borderTop: '2px dashed #ef4444' }}></span> Ref Level</span>
      </div>
    </div>
  )

  return (
    <MissionShell title={t('Clipping & Clamping Circuits', 'ಕ್ಲಿಪ್ಪಿಂಗ್ ಮತ್ತು ಕ್ಲಾಂಪಿಂಗ್')} titleEmoji="📊" subject="Physics" accentColor="blue" gradientFrom="from-blue-500" gradientTo="to-indigo-600" steps={steps} currentStep={2} controls={controls} visualization={visualization} observations={observations} />
  )
}
