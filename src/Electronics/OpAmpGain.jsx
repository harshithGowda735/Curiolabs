import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'
const steps = [{ title: 'Choose Config', description: 'Select inverting or non-inverting configuration' }, { title: 'Set Resistors', description: 'Adjust Rf and Rin values' }, { title: 'Observe Gain', description: 'See the amplifier gain and output waveform' }, { title: 'Test Limits', description: 'Observe clipping when output exceeds supply voltage' }]
const observations = ['Inverting: Gain = -Rf/Rin, output is 180° out of phase', 'Non-inverting: Gain = 1 + Rf/Rin, output is in phase', 'Unity gain buffer: Rf=0, Rin=∞, Gain=1', 'Output clips at supply voltage (±Vcc)', 'Bandwidth decreases as gain increases (gain-bandwidth product is constant)']

export default function OpAmpGain() {
  const { t } = useLanguage()
  const [config, setConfig] = useState('noninverting')
  const [rf, setRf] = useState(10000)
  const [rin, setRin] = useState(1000)
  const [vinAmp, setVinAmp] = useState(0.5)
  const [vcc, setVcc] = useState(12)
  const gain = config === 'inverting' ? -(rf / rin) : 1 + rf / rin
  const vout = vinAmp * Math.abs(gain)
  const isClipping = vout > vcc

  const gW = 400, gH = 150, gPad = 30, pts = 200
  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🔊 {t('Op-Amp Config', 'ಆಪ್-ಆಂಪ್ ಸಂರಚನೆ')}</h3>
        <div className="flex gap-2 mb-4">
          {[['inverting', '⊖ Inverting'], ['noninverting', '⊕ Non-Inverting']].map(([id, label]) => (
            <button key={id} onClick={() => setConfig(id)} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${config === id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{label}</button>
          ))}
        </div>
        <LabeledSlider label="Rf (Feedback)" value={rf} onChange={setRf} min={1000} max={100000} step={1000} unit=" Ω" accentColor="#10b981" />
        <div className="mt-2"><LabeledSlider label="Rin (Input)" value={rin} onChange={setRin} min={100} max={10000} step={100} unit=" Ω" accentColor="#f59e0b" /></div>
        <div className="mt-2"><LabeledSlider label="Vin Amplitude" value={vinAmp} onChange={setVinAmp} min={0.1} max={5} step={0.1} unit=" V" accentColor="#3b82f6" /></div>
        <div className="mt-2"><LabeledSlider label="Supply ±Vcc" value={vcc} onChange={setVcc} min={5} max={15} step={1} unit=" V" accentColor="#ef4444" /></div>
      </div>
      <div className={`rounded-xl p-4 text-center ${isClipping ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
        <p className="text-sm text-gray-600 font-mono">{config === 'inverting' ? 'A = -Rf/Rin' : 'A = 1 + Rf/Rin'}</p>
        <p className="text-3xl font-display font-bold mt-1" style={{ color: isClipping ? '#dc2626' : '#059669' }}>Gain = {gain.toFixed(1)}</p>
        {isClipping && <p className="text-xs text-red-600 mt-1">⚠️ Output clipping at ±{vcc}V!</p>}
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Input vs Output', 'ಇನ್‌ಪುಟ್ vs ಔಟ್‌ಪುಟ್')}</h3>
        <svg viewBox={`0 0 ${gW} ${gH}`} className="w-full h-auto">
          <line x1={gPad} y1={gH / 2} x2={gW - gPad} y2={gH / 2} stroke="#e2e8f0" strokeWidth="0.5" />
          {/* Input */}
          <polyline points={Array.from({ length: pts }, (_, i) => {
            const t = (i / pts) * 4 * Math.PI
            const y = vinAmp * Math.sin(t)
            return `${gPad + (i / pts) * (gW - 2 * gPad)},${gH / 2 - (y / (vcc + 1)) * (gH / 2 - gPad)}`
          }).join(' ')} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Output */}
          <polyline points={Array.from({ length: pts }, (_, i) => {
            const t = (i / pts) * 4 * Math.PI
            let y = gain * vinAmp * Math.sin(t)
            y = Math.max(-vcc, Math.min(vcc, y))
            return `${gPad + (i / pts) * (gW - 2 * gPad)},${gH / 2 - (y / (vcc + 1)) * (gH / 2 - gPad)}`
          }).join(' ')} fill="none" stroke="#10b981" strokeWidth="2" />
        </svg>
        <div className="flex gap-4 justify-center text-xs text-gray-500 mt-1">
          <span>--- Input</span><span className="text-emerald-600">— Output</span>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Op-Amp Symbol', 'ಆಪ್-ಆಂಪ್ ಸಂಕೇತ')}</h3>
        <svg viewBox="0 0 300 150" className="w-full h-auto max-w-xs mx-auto">
          <polygon points="80,20 80,130 220,75" fill="#f0fdf4" stroke="#10b981" strokeWidth="2" />
          <text x={100} y={55} fill="#dc2626" fontSize="16" fontWeight="bold">−</text>
          <text x={100} y={105} fill="#22c55e" fontSize="16" fontWeight="bold">+</text>
          <line x1={40} y1={50} x2={80} y2={50} stroke="#475569" strokeWidth="2" /><text x={30} y={54} fill="#64748b" fontSize="9">Vin</text>
          <line x1={220} y1={75} x2={270} y2={75} stroke="#475569" strokeWidth="2" /><text x={275} y={79} fill="#64748b" fontSize="9">Vout</text>
          {/* Rf */}
          <line x1={100} y1={20} x2={200} y2={20} stroke="#10b981" strokeWidth="1.5" />
          <line x1={100} y1={20} x2={100} y2={50} stroke="#10b981" strokeWidth="1" strokeDasharray="2" />
          <line x1={200} y1={20} x2={230} y2={75} stroke="#10b981" strokeWidth="1" strokeDasharray="2" />
          <text x={150} y={15} textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">Rf={rf}Ω</text>
        </svg>
      </div>
    </div>
  )

  return <MissionShell title={t('Op-Amp Gain Configurator', 'ಆಪ್-ಆಂಪ್ ಗೇನ್')} titleEmoji="🔊" subject="Electronics" accentColor="emerald" gradientFrom="from-emerald-500" gradientTo="to-teal-600" steps={steps} currentStep={2} controls={controls} visualization={visualization} observations={observations} />
}
