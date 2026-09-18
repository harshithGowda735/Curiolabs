import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'
const steps = [{ title: 'Set Elements', description: 'Choose number of antenna elements' }, { title: 'Set Spacing', description: 'Adjust element spacing (in wavelengths)' }, { title: 'Observe Pattern', description: 'View the polar radiation pattern' }, { title: 'Measure', description: 'Note beamwidth and directivity' }]
const observations = ['More elements create narrower main beam (higher directivity)', 'Element spacing affects grating lobes — typically λ/2 spacing', 'Directivity D ≈ N for a uniform linear array with λ/2 spacing', 'Beamwidth decreases as N increases: θ ≈ 2/N radians', 'Side lobes carry wasted power — array weighting can reduce them']

export default function AntennaRadiation() {
  const { t } = useLanguage()
  const [elements, setElements] = useState(4)
  const [spacing, setSpacing] = useState(0.5) // wavelengths

  const gSize = 300, center = gSize / 2, radius = 100

  const pattern = useMemo(() => {
    const pts = []
    for (let deg = 0; deg < 360; deg += 1) {
      const theta = (deg * Math.PI) / 180
      const psi = 2 * Math.PI * spacing * Math.cos(theta)
      const af = Math.abs(elements > 1 ? Math.sin(elements * psi / 2) / (elements * Math.sin(psi / 2 + 0.0001)) : 1)
      pts.push({ deg, r: af })
    }
    return pts
  }, [elements, spacing])

  const beamwidth = (2 / elements * 180 / Math.PI).toFixed(1)
  const directivity = (10 * Math.log10(elements)).toFixed(1)

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📶 {t('Array Config', 'ಅರೇ ಸಂರಚನೆ')}</h3>
        <LabeledSlider label={t('Number of Elements', 'ಅಂಶಗಳ ಸಂಖ್ಯೆ')} value={elements} onChange={(v) => setElements(Math.round(v))} min={1} max={16} step={1} unit="" accentColor="#10b981" />
        <div className="mt-3"><LabeledSlider label={t('Spacing (λ)', 'ಅಂತರ (λ)')} value={spacing} onChange={setSpacing} min={0.1} max={1.5} step={0.05} unit="λ" accentColor="#f59e0b" /></div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <p className="text-xs text-emerald-600 font-medium">Beamwidth</p>
            <p className="text-lg font-bold text-emerald-700">{beamwidth}°</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">Directivity</p>
            <p className="text-lg font-bold text-blue-700">{directivity} dBi</p>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Polar Radiation Pattern', 'ಧ್ರುವೀಯ ವಿಕಿರಣ ಮಾದರಿ')}</h3>
      <svg viewBox={`0 0 ${gSize} ${gSize}`} className="w-full h-auto max-w-sm mx-auto">
        {/* Circles */}
        {[0.25, 0.5, 0.75, 1].map(r => <circle key={r} cx={center} cy={center} r={radius * r} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />)}
        {/* Axes */}
        <line x1={center} y1={center - radius - 10} x2={center} y2={center + radius + 10} stroke="#cbd5e1" strokeWidth="0.5" />
        <line x1={center - radius - 10} y1={center} x2={center + radius + 10} y2={center} stroke="#cbd5e1" strokeWidth="0.5" />
        {/* Pattern */}
        <polygon points={pattern.map(p => {
          const r = p.r * radius
          const x = center + r * Math.cos((p.deg - 90) * Math.PI / 180)
          const y = center + r * Math.sin((p.deg - 90) * Math.PI / 180)
          return `${x},${y}`
        }).join(' ')} fill="#10b98130" stroke="#10b981" strokeWidth="2" />
        {/* Labels */}
        <text x={center} y={15} textAnchor="middle" fill="#64748b" fontSize="9">0°</text>
        <text x={gSize - 10} y={center + 4} textAnchor="end" fill="#64748b" fontSize="9">90°</text>
        <text x={center} y={gSize - 5} textAnchor="middle" fill="#64748b" fontSize="9">180°</text>
        <text x={15} y={center + 4} fill="#64748b" fontSize="9">270°</text>
      </svg>
    </div>
  )

  return <MissionShell title={t('Antenna Radiation Pattern', 'ಆಂಟೆನಾ ವಿಕಿರಣ ಮಾದರಿ')} titleEmoji="📶" subject="Electronics" accentColor="emerald" gradientFrom="from-emerald-500" gradientTo="to-teal-600" steps={steps} currentStep={2} controls={controls} visualization={visualization} observations={observations} />
}
