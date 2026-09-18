import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Set Field', description: 'Adjust the magnetic field intensity H' },
  { title: 'Observe B', description: 'Watch flux density B respond to H changes' },
  { title: 'Trace Curve', description: 'Sweep H from negative to positive to trace the hysteresis loop' },
  { title: 'Identify Points', description: 'Find retentivity (Br) and coercivity (Hc) on the curve' },
]

const observations = [
  'The B-H curve forms a hysteresis loop — B lags behind H',
  'Retentivity (Br) is the residual flux density when H returns to zero',
  'Coercivity (Hc) is the reverse field needed to demagnetize the material',
  'Loop area represents energy loss per magnetization cycle',
  'Hard magnetic materials have wider loops than soft materials',
]

export default function MagneticHysteresis() {
  const { t } = useLanguage()
  const [fieldH, setFieldH] = useState(0)
  const [material, setMaterial] = useState('soft') // soft or hard
  const [tracePoints, setTracePoints] = useState([])

  const params = material === 'hard' 
    ? { Bs: 1.5, Br: 1.2, Hc: 5000, a: 0.0003 }
    : { Bs: 0.8, Br: 0.3, Hc: 200, a: 0.005 }

  // Simplified Langevin-like hysteresis approximation
  const B = useMemo(() => {
    const { Bs, a } = params
    const x = fieldH * a
    return Bs * (1 / Math.tanh(x || 0.001) - 1 / (x || 0.001))
  }, [fieldH, params])

  const addTrace = () => {
    setTracePoints(prev => [...prev.slice(-100), { h: fieldH, b: B }])
  }

  // Auto-trace on slider change
  const handleFieldChange = (v) => {
    setFieldH(v)
    setTracePoints(prev => [...prev.slice(-150), { h: v, b: params.Bs * (1 / Math.tanh(v * params.a || 0.001) - 1 / (v * params.a || 0.001)) }])
  }

  const graphW = 400, graphH = 300, pad = 50
  const maxH = material === 'hard' ? 10000 : 1000
  const maxB = material === 'hard' ? 2 : 1
  const sx = (h) => pad + ((h + maxH) / (2 * maxH)) * (graphW - 2 * pad)
  const sy = (b) => graphH - pad - ((b + maxB) / (2 * maxB)) * (graphH - 2 * pad)

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🧲 {t('Magnetization Controls', 'ಕಾಂತೀಕರಣ ನಿಯಂತ್ರಣಗಳು')}</h3>
        <div className="flex gap-2 mb-4">
          {['soft', 'hard'].map(m => (
            <button key={m} onClick={() => { setMaterial(m); setTracePoints([]) }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${material === m ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {m === 'soft' ? t('Soft Iron', 'ಮೃದು ಕಬ್ಬಿಣ') : t('Hard Steel', 'ಗಟ್ಟಿ ಉಕ್ಕು')}
            </button>
          ))}
        </div>
        <LabeledSlider label={t('Magnetic Field H (A/m)', 'ಕಾಂತಕ್ಷೇತ್ರ H')} value={fieldH} onChange={handleFieldChange} min={-maxH} max={maxH} step={maxH / 100} unit=" A/m" accentColor="#3b82f6" />
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">H</p>
            <p className="text-lg font-bold text-blue-700">{fieldH.toFixed(0)}<span className="text-xs"> A/m</span></p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <p className="text-xs text-indigo-600 font-medium">B</p>
            <p className="text-lg font-bold text-indigo-700">{B.toFixed(3)}<span className="text-xs"> T</span></p>
          </div>
        </div>
        <button onClick={() => setTracePoints([])} className="w-full mt-3 bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-2 rounded-lg text-sm transition-colors">
          🔄 {t('Clear Trace', 'ಟ್ರೇಸ್ ತೆರವುಗೊಳಿಸಿ')}
        </button>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('B-H Hysteresis Curve', 'B-H ಹಿಸ್ಟರೆಸಿಸ್ ಕರ್ವ್')}</h3>
      <svg viewBox={`0 0 ${graphW} ${graphH}`} className="w-full h-auto">
        {/* Axes */}
        <line x1={pad} y1={graphH / 2} x2={graphW - pad} y2={graphH / 2} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={graphW / 2} y1={pad} x2={graphW / 2} y2={graphH - pad} stroke="#cbd5e1" strokeWidth="1" />
        <text x={graphW - pad + 5} y={graphH / 2 + 4} fill="#64748b" fontSize="10">H</text>
        <text x={graphW / 2 + 5} y={pad - 5} fill="#64748b" fontSize="10">B</text>
        {/* Trace */}
        {tracePoints.length > 1 && (
          <polyline
            points={tracePoints.map(p => `${sx(p.h)},${sy(p.b)}`).join(' ')}
            fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"
          />
        )}
        {/* Current point */}
        <circle cx={sx(fieldH)} cy={sy(B)} r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
        {/* Labels */}
        <text x={sx(0) + 5} y={sy(params.Br) - 5} fill="#059669" fontSize="9" fontWeight="600">Br</text>
        <text x={sx(-params.Hc) - 5} y={sy(0) - 8} fill="#dc2626" fontSize="9" fontWeight="600" textAnchor="end">-Hc</text>
      </svg>
      <p className="text-xs text-gray-400 text-center mt-2">{t('Sweep the H slider from max to min and back to trace the full loop', 'ಪೂರ್ಣ ಲೂಪ್ ಅನ್ನು ಟ್ರೇಸ್ ಮಾಡಲು H ಸ್ಲೈಡರ್ ಅನ್ನು ಸ್ವೀಪ್ ಮಾಡಿ')}</p>
    </div>
  )

  return (
    <MissionShell title={t('Magnetic Hysteresis', 'ಕಾಂತ ಹಿಸ್ಟರೆಸಿಸ್')} titleEmoji="🧲" subject="Physics" accentColor="blue" gradientFrom="from-blue-500" gradientTo="to-indigo-600" steps={steps} currentStep={tracePoints.length > 10 ? 3 : fieldH !== 0 ? 1 : 0} controls={controls} visualization={visualization} observations={observations} />
  )
}
