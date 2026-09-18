import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Set Conditions', description: 'Adjust pressure, volume, temperature, or moles' },
  { title: 'Observe Piston', description: 'Watch the piston move as gas conditions change' },
  { title: 'Verify PV=nRT', description: 'Check that the ideal gas equation holds' },
  { title: 'Explore Laws', description: "Test Boyle's, Charles's, and Gay-Lussac's laws" },
]
const observations = [
  'PV = nRT is the ideal gas equation (R = 8.314 J/(mol·K))',
  "Boyle's Law: P₁V₁ = P₂V₂ at constant T and n",
  "Charles's Law: V₁/T₁ = V₂/T₂ at constant P and n",
  "Gay-Lussac's Law: P₁/T₁ = P₂/T₂ at constant V and n",
  'Real gases deviate from ideal behavior at high P and low T',
]

export default function GasLaws() {
  const { t } = useLanguage()
  const [mode, setMode] = useState('P') // which variable to solve for
  const [pressure, setPressure] = useState(1)
  const [volume, setVolume] = useState(22.4)
  const [temp, setTemp] = useState(273)
  const [moles, setMoles] = useState(1)
  const R = 8.314 // J/(mol·K)

  const calculated = useMemo(() => {
    if (mode === 'P') return { value: (moles * R * temp) / (volume / 1000), unit: 'kPa', name: 'Pressure' }
    if (mode === 'V') return { value: (moles * R * temp) / (pressure * 1000) * 1000, unit: 'L', name: 'Volume' }
    if (mode === 'T') return { value: (pressure * 1000 * volume / 1000) / (moles * R), unit: 'K', name: 'Temperature' }
    return { value: (pressure * 1000 * volume / 1000) / (R * temp), unit: 'mol', name: 'Moles' }
  }, [mode, pressure, volume, temp, moles])

  const pistonHeight = Math.max(20, Math.min(150, volume * 2))

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">💨 {t('Gas Controls', 'ಅನಿಲ ನಿಯಂತ್ರಣಗಳು')}</h3>
        <div className="grid grid-cols-4 gap-1 mb-4">
          {['P', 'V', 'T', 'n'].map(m => (
            <button key={m} onClick={() => setMode(m)} className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${mode === m ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              Solve {m}
            </button>
          ))}
        </div>
        {mode !== 'P' && <LabeledSlider label="Pressure (kPa)" value={pressure} onChange={setPressure} min={50} max={500} step={10} unit=" kPa" accentColor="#ef4444" />}
        {mode !== 'V' && <div className="mt-2"><LabeledSlider label="Volume (L)" value={volume} onChange={setVolume} min={1} max={100} step={0.5} unit=" L" accentColor="#3b82f6" /></div>}
        {mode !== 'T' && <div className="mt-2"><LabeledSlider label="Temperature (K)" value={temp} onChange={setTemp} min={100} max={600} step={5} unit=" K" accentColor="#f59e0b" /></div>}
        {mode !== 'n' && <div className="mt-2"><LabeledSlider label="Moles (n)" value={moles} onChange={setMoles} min={0.1} max={5} step={0.1} unit=" mol" accentColor="#8b5cf6" /></div>}
      </div>
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200 p-4 text-center">
        <p className="text-sm text-pink-600 font-medium">{calculated.name} =</p>
        <p className="text-3xl font-display font-bold text-pink-700">{calculated.value.toFixed(2)} <span className="text-sm">{calculated.unit}</span></p>
        <p className="text-xs text-pink-500 mt-1 font-mono">PV = nRT → {pressure.toFixed(0)} × {volume.toFixed(1)} = {moles.toFixed(1)} × R × {temp.toFixed(0)}</p>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Piston-Cylinder', 'ಪಿಸ್ಟನ್-ಸಿಲಿಂಡರ್')}</h3>
      <svg viewBox="0 0 300 280" className="w-full h-auto">
        {/* Cylinder */}
        <rect x={80} y={30} width={140} height={230} rx={4} fill="none" stroke="#64748b" strokeWidth="3" />
        {/* Gas */}
        <rect x={82} y={260 - pistonHeight} width={136} height={pistonHeight} fill={temp > 400 ? '#fecaca' : temp > 250 ? '#fef9c3' : '#bfdbfe'} opacity="0.5" />
        {/* Gas molecules */}
        {Array.from({ length: Math.min(Math.floor(moles * 8), 30) }).map((_, i) => (
          <circle key={i} cx={100 + Math.random() * 100} cy={260 - Math.random() * pistonHeight * 0.9} r={2} fill="#3b82f6" opacity="0.6" />
        ))}
        {/* Piston */}
        <rect x={78} y={260 - pistonHeight - 12} width={144} height={14} rx={3} fill="#475569" />
        <rect x={140} y={260 - pistonHeight - 45} width={20} height={35} rx={3} fill="#64748b" />
        {/* Pressure arrow */}
        <text x={150} y={260 - pistonHeight - 50} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="600">↓ P</text>
        {/* Labels */}
        <text x={150} y={270} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">V = {mode === 'V' ? calculated.value.toFixed(1) : volume.toFixed(1)} L</text>
      </svg>
    </div>
  )

  return (
    <MissionShell title={t('Ideal Gas Laws', 'ಆದರ್ಶ ಅನಿಲ ನಿಯಮಗಳು')} titleEmoji="💨" subject="Chemistry" accentColor="pink" gradientFrom="from-pink-500" gradientTo="to-rose-600" steps={steps} currentStep={2} controls={controls} visualization={visualization} observations={observations} />
  )
}
