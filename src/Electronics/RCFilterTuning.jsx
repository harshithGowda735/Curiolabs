import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [{ title: 'Set R', description: 'Adjust resistance value' }, { title: 'Set C', description: 'Adjust capacitance value' }, { title: 'Observe Cutoff', description: 'See the cutoff frequency fc = 1/(2πRC)' }, { title: 'View Bode', description: 'Examine the frequency response (Bode plot)' }]
const observations = ['Cutoff frequency fc = 1/(2πRC) — where output drops to -3dB', 'Low-pass filter passes frequencies below fc, attenuates above', 'High-pass filter passes frequencies above fc, attenuates below', 'At cutoff, output voltage is 1/√2 ≈ 0.707 of input voltage', 'Steeper rolloff can be achieved by cascading multiple RC stages']

export default function RCFilterTuning() {
  const { t } = useLanguage()
  const [resistance, setResistance] = useState(1000)
  const [capacitance, setCapacitance] = useState(100) // nF
  const [filterType, setFilterType] = useState('lowpass')
  const [showAR, setShowAR] = useState(false)

  const fc = useMemo(() => 1 / (2 * Math.PI * resistance * capacitance * 1e-9), [resistance, capacitance])

  const gW = 400, gH = 200, gPad = 50
  const bodePoints = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 100; i++) {
      const f = Math.pow(10, 1 + i * 4 / 100) // 10Hz to 100kHz
      const ratio = f / fc
      const gain = filterType === 'lowpass'
        ? -10 * Math.log10(1 + ratio * ratio)
        : -10 * Math.log10(1 + 1 / (ratio * ratio))
      pts.push({ f, gain: Math.max(-40, gain) })
    }
    return pts
  }, [fc, filterType])

  const sx = (i) => gPad + (i / 100) * (gW - 2 * gPad)
  const sy = (g) => gPad + ((-g) / 40) * (gH - 2 * gPad)

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📡 {t('Filter Configuration', 'ಫಿಲ್ಟರ್ ಸಂರಚನೆ')}</h3>
        <div className="flex gap-2 mb-4">
          {['lowpass', 'highpass'].map(f => (
            <button key={f} onClick={() => setFilterType(f)} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${filterType === f ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {f === 'lowpass' ? '🔽 Low-Pass' : '🔼 High-Pass'}
            </button>
          ))}
        </div>
        <LabeledSlider label={t('Resistance R', 'ಪ್ರತಿರೋಧ R')} value={resistance} onChange={setResistance} min={100} max={10000} step={100} unit=" Ω" accentColor="#10b981" />
        <div className="mt-3"><LabeledSlider label={t('Capacitance C', 'ಕೆಪಾಸಿಟೆನ್ಸ್ C')} value={capacitance} onChange={setCapacitance} min={1} max={1000} step={1} unit=" nF" accentColor="#f59e0b" /></div>
        <div className="mt-4 bg-emerald-50 rounded-lg p-3 text-center">
          <p className="text-xs text-emerald-600 font-medium">{t('Cutoff Frequency', 'ಕಟಾಫ್ ಆವರ್ತನ')}</p>
          <p className="text-2xl font-display font-bold text-emerald-700">{fc > 1000 ? (fc / 1000).toFixed(2) + ' kHz' : fc.toFixed(1) + ' Hz'}</p>
        </div>
        <button onClick={() => setShowAR(!showAR)} className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2">
          📱 {showAR ? t('Hide AR View', 'AR ವ್ಯೂ ಮರೆಮಾಡಿ') : t('View Circuit in AR', 'AR ನಲ್ಲಿ ಸರ್ಕ್ಯೂಟ್ ನೋಡಿ')}
        </button>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {showAR && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-display font-bold text-gray-800 mb-3">📱 {t('AR Circuit View', 'AR ಸರ್ಕ್ಯೂಟ್ ವ್ಯೂ')}</h3>
          <div className="relative rounded-xl overflow-hidden bg-gray-100 min-h-[300px]">
            {/* TODO: REPLACE_MODEL — Use a .glb model of an RC circuit breadboard */}
            <model-viewer
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              alt="RC Circuit 3D Model"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: '100%', height: '300px' }}
            >
              <button slot="ar-button" className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg">
                📱 Place in AR
              </button>
            </model-viewer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">{t('Tap "Place in AR" on mobile to view the circuit on your desk', 'ಮೊಬೈಲ್‌ನಲ್ಲಿ ಸರ್ಕ್ಯೂಟ್ ನೋಡಲು "Place in AR" ಟ್ಯಾಪ್ ಮಾಡಿ')}</p>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Bode Plot (Magnitude)', 'ಬೋಡ್ ಪ್ಲಾಟ್')}</h3>
        <svg viewBox={`0 0 ${gW} ${gH}`} className="w-full h-auto">
          {[-3, -10, -20, -30, -40].map(g => (
            <g key={g}><line x1={gPad} y1={sy(g)} x2={gW - gPad} y2={sy(g)} stroke="#f1f5f9" strokeWidth="0.5" /><text x={gPad - 5} y={sy(g) + 4} textAnchor="end" fill="#94a3b8" fontSize="7">{g}dB</text></g>
          ))}
          <line x1={gPad} y1={sy(0)} x2={gW - gPad} y2={sy(0)} stroke="#e2e8f0" strokeWidth="1" />
          <polyline points={bodePoints.map((p, i) => `${sx(i)},${sy(p.gain)}`).join(' ')} fill="none" stroke="#10b981" strokeWidth="2.5" />
          {/* -3dB line */}
          <line x1={gPad} y1={sy(-3)} x2={gW - gPad} y2={sy(-3)} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />
          <text x={gW - gPad + 3} y={sy(-3) + 4} fill="#ef4444" fontSize="7">-3dB</text>
          <text x={gW / 2} y={gH - 5} textAnchor="middle" fill="#64748b" fontSize="9">Frequency (log scale)</text>
        </svg>
      </div>
      {/* Circuit diagram */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Circuit Diagram', 'ಸರ್ಕ್ಯೂಟ್ ರೇಖಾಚಿತ್ರ')}</h3>
        <svg viewBox="0 0 300 120" className="w-full h-auto">
          <text x={10} y={45} fill="#64748b" fontSize="10">Vin</text>
          <line x1={35} y1={40} x2={80} y2={40} stroke="#475569" strokeWidth="2" />
          {/* Resistor */}
          <rect x={80} y={30} width={60} height={20} rx={3} fill="none" stroke="#10b981" strokeWidth="2" />
          <text x={110} y={44} textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">R</text>
          <line x1={140} y1={40} x2={200} y2={40} stroke="#475569" strokeWidth="2" />
          {/* Capacitor */}
          {filterType === 'lowpass' ? (
            <><line x1={200} y1={40} x2={200} y2={55} stroke="#475569" strokeWidth="2" /><line x1={185} y1={55} x2={215} y2={55} stroke="#f59e0b" strokeWidth="2" /><line x1={185} y1={62} x2={215} y2={62} stroke="#f59e0b" strokeWidth="2" /><line x1={200} y1={62} x2={200} y2={80} stroke="#475569" strokeWidth="2" /><text x={225} y={62} fill="#f59e0b" fontSize="9" fontWeight="bold">C</text></>
          ) : (
            <><line x1={80} y1={40} x2={80} y2={55} stroke="#475569" strokeWidth="2" /><line x1={65} y1={55} x2={95} y2={55} stroke="#f59e0b" strokeWidth="2" /><line x1={65} y1={62} x2={95} y2={62} stroke="#f59e0b" strokeWidth="2" /><line x1={80} y1={62} x2={80} y2={80} stroke="#475569" strokeWidth="2" /><text x={100} y={62} fill="#f59e0b" fontSize="9" fontWeight="bold">C</text></>
          )}
          <text x={220} y={45} fill="#64748b" fontSize="10">Vout</text>
          {/* Ground */}
          <line x1={35} y1={80} x2={200} y2={80} stroke="#475569" strokeWidth="1" />
          <line x1={110} y1={80} x2={110} y2={90} stroke="#475569" strokeWidth="1" />
          <line x1={100} y1={90} x2={120} y2={90} stroke="#475569" strokeWidth="1.5" />
          <line x1={103} y1={94} x2={117} y2={94} stroke="#475569" strokeWidth="1" />
          <line x1={106} y1={98} x2={114} y2={98} stroke="#475569" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  )

  return <MissionShell title={t('RC Filter Tuning', 'RC ಫಿಲ್ಟರ್ ಟ್ಯೂನಿಂಗ್')} titleEmoji="📡" subject="Electronics" accentColor="emerald" gradientFrom="from-emerald-500" gradientTo="to-teal-600" steps={steps} currentStep={2} controls={controls} visualization={visualization} observations={observations} />
}
