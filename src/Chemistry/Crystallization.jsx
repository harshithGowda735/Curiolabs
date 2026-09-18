import { useState } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Heat Solution', description: 'Increase temperature to dissolve more solute' },
  { title: 'Saturate', description: 'Add solute until no more dissolves at current temperature' },
  { title: 'Cool Down', description: 'Slowly decrease temperature to create supersaturation' },
  { title: 'Observe Crystals', description: 'Watch crystals form as solubility decreases' },
]
const observations = [
  'Solubility generally increases with temperature for most solid solutes',
  'Crystals form when the solution becomes supersaturated (cooled below saturation temperature)',
  'Slow cooling produces larger, more well-formed crystals',
  'The shape of crystals depends on the solute\'s molecular structure (cubic, hexagonal, etc.)',
]

export default function Crystallization() {
  const { t } = useLanguage()
  const [temperature, setTemperature] = useState(80)
  const [soluteAmount, setSoluteAmount] = useState(60)
  // Solubility curve: roughly modeled after KNO3
  const solubility = 13.3 + 0.62 * temperature + 0.005 * temperature * temperature
  const isSaturated = soluteAmount > solubility
  const crystalAmount = isSaturated ? Math.max(0, soluteAmount - solubility) : 0
  const numCrystals = Math.floor(crystalAmount / 3)

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">💎 {t('Crystallization Controls', 'ಸ್ಫಟಿಕೀಕರಣ ನಿಯಂತ್ರಣಗಳು')}</h3>
        <LabeledSlider label={t('Temperature', 'ತಾಪಮಾನ')} value={temperature} onChange={setTemperature} min={10} max={100} step={1} unit="°C" accentColor="#ec4899" />
        <div className="mt-3">
          <LabeledSlider label={t('Solute Added', 'ಸೇರಿಸಿದ ದ್ರಾವ್ಯ')} value={soluteAmount} onChange={setSoluteAmount} min={0} max={150} step={1} unit=" g" accentColor="#a855f7" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-pink-50 rounded-lg p-3 text-center">
            <p className="text-xs text-pink-600 font-medium">{t('Solubility at T', 'T ನಲ್ಲಿ ಕರಗುವಿಕೆ')}</p>
            <p className="text-lg font-bold text-pink-700">{solubility.toFixed(1)}<span className="text-xs"> g/100mL</span></p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-xs text-purple-600 font-medium">{t('Crystal Mass', 'ಸ್ಫಟಿಕ ದ್ರವ್ಯರಾಶಿ')}</p>
            <p className="text-lg font-bold text-purple-700">{crystalAmount.toFixed(1)}<span className="text-xs"> g</span></p>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* Beaker visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Crystal Formation', 'ಸ್ಫಟಿಕ ರಚನೆ')}</h3>
        <svg viewBox="0 0 300 250" className="w-full h-auto">
          {/* Beaker */}
          <rect x={80} y={40} width={140} height={180} rx={8} fill="none" stroke="#94a3b8" strokeWidth="2" />
          {/* Solution */}
          <rect x={82} y={80} width={136} height={138} rx={6} fill={temperature > 60 ? '#fecdd3' : temperature > 30 ? '#fce7f3' : '#f0f9ff'} opacity="0.8" />
          {/* Crystals */}
          {Array.from({ length: Math.min(numCrystals, 20) }).map((_, i) => {
            const cx = 100 + (i % 5) * 25 + Math.random() * 10
            const cy = 190 + Math.floor(i / 5) * 12
            const size = 4 + Math.random() * 6
            return <polygon key={i} points={`${cx},${cy - size} ${cx + size * 0.87},${cy + size * 0.5} ${cx - size * 0.87},${cy + size * 0.5}`} fill="#a855f7" opacity="0.7" stroke="#7c3aed" strokeWidth="0.5" />
          })}
          {/* Thermometer */}
          <rect x={235} y={60} width={8} height={140} rx={4} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
          <rect x={237} y={200 - temperature * 1.2} width={4} height={temperature * 1.2} rx={2} fill="#ef4444" />
          <text x={250} y={100} fill="#64748b" fontSize="10">{temperature}°C</text>
          {/* Status */}
          <text x={150} y={30} textAnchor="middle" fill={isSaturated ? '#a855f7' : '#22c55e'} fontSize="11" fontWeight="600">
            {isSaturated ? 'Supersaturated — Crystals forming!' : 'Unsaturated'}
          </text>
        </svg>
      </div>
      {/* Solubility curve */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Solubility Curve (KNO₃)', 'ಕರಗುವಿಕೆ ಕರ್ವ್')}</h3>
        <svg viewBox="0 0 400 200" className="w-full h-auto">
          {/* Curve */}
          <polyline points={Array.from({ length: 91 }, (_, i) => {
            const temp = 10 + i
            const sol = 13.3 + 0.62 * temp + 0.005 * temp * temp
            return `${40 + (temp - 10) / 90 * 320},${180 - sol / 150 * 150}`
          }).join(' ')} fill="none" stroke="#ec4899" strokeWidth="2" />
          {/* Current point */}
          <circle cx={40 + (temperature - 10) / 90 * 320} cy={180 - solubility / 150 * 150} r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
          {/* Axes */}
          <line x1={40} y1={180} x2={370} y2={180} stroke="#cbd5e1" strokeWidth="1" />
          <line x1={40} y1={20} x2={40} y2={180} stroke="#cbd5e1" strokeWidth="1" />
          <text x={200} y={198} textAnchor="middle" fill="#64748b" fontSize="9">Temperature (°C)</text>
        </svg>
      </div>
    </div>
  )

  return (
    <MissionShell title={t('Crystallization Process', 'ಸ್ಫಟಿಕೀಕರಣ ಪ್ರಕ್ರಿಯೆ')} titleEmoji="💎" subject="Chemistry" accentColor="pink" gradientFrom="from-pink-500" gradientTo="to-rose-600" steps={steps} currentStep={isSaturated ? 3 : temperature < 50 ? 2 : 0} controls={controls} visualization={visualization} observations={observations} />
  )
}
