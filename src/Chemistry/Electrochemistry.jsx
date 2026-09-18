import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const electrodes = [
  { name: 'Zinc (Zn)', E: -0.76, color: '#94a3b8' },
  { name: 'Iron (Fe)', E: -0.44, color: '#78716c' },
  { name: 'Copper (Cu)', E: 0.34, color: '#f59e0b' },
  { name: 'Silver (Ag)', E: 0.80, color: '#e2e8f0' },
]

const steps = [
  { title: 'Choose Anode', description: 'Select the anode (oxidation electrode) metal' },
  { title: 'Choose Cathode', description: 'Select the cathode (reduction electrode) metal' },
  { title: 'Observe EMF', description: 'Calculate cell potential: E°cell = E°cathode - E°anode' },
  { title: 'Analyze', description: 'Determine if the cell reaction is spontaneous (E°cell > 0)' },
]
const observations = [
  'Cell EMF = E°(cathode) - E°(anode) from standard reduction potentials',
  'A positive E°cell means the reaction is spontaneous (ΔG < 0)',
  'The more reactive metal (lower E°) is always the anode (oxidized)',
  'Electrons flow from anode to cathode through the external circuit',
]

export default function Electrochemistry() {
  const { t } = useLanguage()
  const [anodeIdx, setAnodeIdx] = useState(0) // Zinc
  const [cathodeIdx, setCathodeIdx] = useState(2) // Copper

  const anode = electrodes[anodeIdx]
  const cathode = electrodes[cathodeIdx]
  const emf = cathode.E - anode.E
  const spontaneous = emf > 0

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🔋 {t('Electrode Selection', 'ವಿದ್ಯುದ್ವಾರ ಆಯ್ಕೆ')}</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-red-600 mb-1">⊖ {t('Anode (Oxidation)', 'ಅನೋಡ್ (ಆಕ್ಸಿಡೀಕರಣ)')}</p>
            <div className="grid grid-cols-2 gap-2">
              {electrodes.map((e, i) => (
                <button key={i} onClick={() => setAnodeIdx(i)} className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${anodeIdx === i ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {e.name} (E°={e.E}V)
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">⊕ {t('Cathode (Reduction)', 'ಕ್ಯಾಥೋಡ್ (ರಿಡಕ್ಷನ್)')}</p>
            <div className="grid grid-cols-2 gap-2">
              {electrodes.map((e, i) => (
                <button key={i} onClick={() => setCathodeIdx(i)} className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${cathodeIdx === i ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {e.name} (E°={e.E}V)
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={`mt-4 p-3 rounded-lg ${spontaneous ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className="text-lg font-display font-bold text-center" style={{ color: spontaneous ? '#059669' : '#dc2626' }}>
            E°cell = {emf.toFixed(2)} V {spontaneous ? '✅ Spontaneous' : '❌ Non-spontaneous'}
          </p>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Galvanic Cell Diagram', 'ಗಾಲ್ವನಿಕ್ ಸೆಲ್ ರೇಖಾಚಿತ್ರ')}</h3>
      <svg viewBox="0 0 400 280" className="w-full h-auto">
        {/* Beakers */}
        <rect x={30} y={100} width={120} height={140} rx={8} fill="none" stroke="#94a3b8" strokeWidth="2" />
        <rect x={250} y={100} width={120} height={140} rx={8} fill="none" stroke="#94a3b8" strokeWidth="2" />
        {/* Solutions */}
        <rect x={32} y={130} width={116} height={108} rx={6} fill="#fef2f2" opacity="0.5" />
        <rect x={252} y={130} width={116} height={108} rx={6} fill="#eff6ff" opacity="0.5" />
        {/* Electrodes */}
        <rect x={75} y={90} width={20} height={130} rx={3} fill={anode.color} stroke="#475569" strokeWidth="1" />
        <rect x={295} y={90} width={20} height={130} rx={3} fill={cathode.color} stroke="#475569" strokeWidth="1" />
        {/* Wire */}
        <path d="M 95 90 Q 95 50 200 50 Q 305 50 305 90" fill="none" stroke="#475569" strokeWidth="2" />
        {/* Voltmeter */}
        <circle cx={200} cy={50} r={20} fill="white" stroke="#475569" strokeWidth="2" />
        <text x={200} y={54} textAnchor="middle" fill={spontaneous ? '#059669' : '#dc2626'} fontSize="10" fontWeight="bold">{emf.toFixed(2)}V</text>
        {/* Salt bridge */}
        <path d="M 150 150 Q 200 120 250 150" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
        <text x={200} y={115} textAnchor="middle" fill="#92400e" fontSize="8">Salt Bridge</text>
        {/* Electron flow arrow */}
        {spontaneous && <text x={200} y={75} textAnchor="middle" fill="#475569" fontSize="9">e⁻ →→→</text>}
        {/* Labels */}
        <text x={90} y={260} textAnchor="middle" fill="#dc2626" fontSize="10" fontWeight="600">Anode (-)</text>
        <text x={90} y={275} textAnchor="middle" fill="#64748b" fontSize="9">{anode.name}</text>
        <text x={310} y={260} textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="600">Cathode (+)</text>
        <text x={310} y={275} textAnchor="middle" fill="#64748b" fontSize="9">{cathode.name}</text>
      </svg>
    </div>
  )

  return (
    <MissionShell title={t('Electrochemistry', 'ವಿದ್ಯುತ್ ರಸಾಯನಶಾಸ್ತ್ರ')} titleEmoji="🔋" subject="Chemistry" accentColor="pink" gradientFrom="from-pink-500" gradientTo="to-rose-600" steps={steps} currentStep={2} controls={controls} visualization={visualization} observations={observations} />
  )
}
