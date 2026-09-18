import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Set Concentrations', description: 'Adjust reactant and product concentrations' },
  { title: 'Change Conditions', description: 'Modify temperature or add/remove species' },
  { title: 'Observe Shift', description: "Watch how the equilibrium shifts per Le Chatelier's principle" },
  { title: 'Calculate Q', description: 'Compare reaction quotient Q with equilibrium constant Keq' },
]
const observations = [
  "Le Chatelier's principle: system shifts to counteract applied changes",
  'Increasing reactant concentration shifts equilibrium toward products',
  'Increasing temperature shifts equilibrium in the endothermic direction',
  'Keq changes only with temperature, not concentration or pressure changes',
  'When Q < Keq, the reaction proceeds forward; when Q > Keq, it reverses',
]

export default function ChemicalEquilibrium() {
  const { t } = useLanguage()
  const [concA, setConcA] = useState(1.0)
  const [concB, setConcB] = useState(1.0)
  const [concC, setConcC] = useState(0.5)
  const [concD, setConcD] = useState(0.5)
  const [temperature, setTemperature] = useState(300)

  // A + B ⇌ C + D, Keq depends on temperature
  const Keq = useMemo(() => 0.25 * Math.exp(-2000 * (1 / temperature - 1 / 300)), [temperature])
  const Q = (concC * concD) / (concA * concB || 0.001)
  const direction = Q < Keq * 0.95 ? 'forward' : Q > Keq * 1.05 ? 'reverse' : 'at equilibrium'

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">⚖️ {t('Concentrations (mol/L)', 'ಸಾಂದ್ರತೆಗಳು')}</h3>
        <p className="text-sm text-gray-500 mb-3 font-mono">A + B ⇌ C + D</p>
        <LabeledSlider label="[A] Reactant" value={concA} onChange={setConcA} min={0.1} max={3} step={0.1} unit=" M" accentColor="#ef4444" />
        <div className="mt-2"><LabeledSlider label="[B] Reactant" value={concB} onChange={setConcB} min={0.1} max={3} step={0.1} unit=" M" accentColor="#f97316" /></div>
        <div className="mt-2"><LabeledSlider label="[C] Product" value={concC} onChange={setConcC} min={0.1} max={3} step={0.1} unit=" M" accentColor="#3b82f6" /></div>
        <div className="mt-2"><LabeledSlider label="[D] Product" value={concD} onChange={setConcD} min={0.1} max={3} step={0.1} unit=" M" accentColor="#8b5cf6" /></div>
        <div className="mt-3"><LabeledSlider label={t('Temperature', 'ತಾಪಮಾನ')} value={temperature} onChange={setTemperature} min={200} max={500} step={10} unit=" K" accentColor="#ec4899" /></div>
      </div>
      <div className={`bg-white rounded-xl shadow-sm border p-4 ${direction === 'at equilibrium' ? 'border-green-200' : 'border-amber-200'}`}>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="text-xs text-gray-500">Q</p><p className="text-lg font-bold text-amber-600">{Q.toFixed(3)}</p></div>
          <div><p className="text-xs text-gray-500">vs</p><p className="text-lg">⇌</p></div>
          <div><p className="text-xs text-gray-500">Keq</p><p className="text-lg font-bold text-blue-600">{Keq.toFixed(3)}</p></div>
        </div>
        <p className={`text-center text-sm font-bold mt-2 ${direction === 'forward' ? 'text-green-600' : direction === 'reverse' ? 'text-red-600' : 'text-blue-600'}`}>
          {direction === 'forward' ? '→ Shifts FORWARD (more products)' : direction === 'reverse' ? '← Shifts REVERSE (more reactants)' : '⚖️ AT EQUILIBRIUM'}
        </p>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Equilibrium Balance', 'ಸಮತೋಲನ ಸಮತೋಲನ')}</h3>
      <svg viewBox="0 0 400 250" className="w-full h-auto">
        {/* Balance beam */}
        <circle cx={200} cy={100} r={5} fill="#64748b" />
        {(() => {
          const angle = Math.max(-20, Math.min(20, (Q / Keq - 1) * 15)) * Math.PI / 180
          const leftX = 200 - 120 * Math.cos(angle)
          const leftY = 100 + 120 * Math.sin(angle)
          const rightX = 200 + 120 * Math.cos(angle)
          const rightY = 100 - 120 * Math.sin(angle)
          return (
            <>
              <line x1={leftX} y1={leftY} x2={rightX} y2={rightY} stroke="#475569" strokeWidth="3" />
              {/* Left pan - Reactants */}
              <rect x={leftX - 40} y={leftY} width={80} height={8} rx={4} fill="#ef4444" />
              <text x={leftX} y={leftY + 25} textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="600">Reactants</text>
              <text x={leftX} y={leftY + 40} textAnchor="middle" fill="#64748b" fontSize="9">[A]×[B] = {(concA * concB).toFixed(2)}</text>
              {/* Right pan - Products */}
              <rect x={rightX - 40} y={rightY} width={80} height={8} rx={4} fill="#3b82f6" />
              <text x={rightX} y={rightY + 25} textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="600">Products</text>
              <text x={rightX} y={rightY + 40} textAnchor="middle" fill="#64748b" fontSize="9">[C]×[D] = {(concC * concD).toFixed(2)}</text>
            </>
          )
        })()}
        {/* Direction arrow */}
        <text x={200} y={220} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="600">
          {direction === 'forward' ? '⟹ Reaction shifts RIGHT' : direction === 'reverse' ? '⟸ Reaction shifts LEFT' : '⚖️ Balanced'}
        </text>
      </svg>
    </div>
  )

  return (
    <MissionShell title={t('Chemical Equilibrium', 'ರಾಸಾಯನಿಕ ಸಮತೋಲನ')} titleEmoji="⚖️" subject="Chemistry" accentColor="pink" gradientFrom="from-pink-500" gradientTo="to-rose-600" steps={steps} currentStep={2} controls={controls} visualization={visualization} observations={observations} />
  )
}
