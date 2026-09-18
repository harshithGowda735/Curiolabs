import { useState } from 'react'
import MissionShell from '../components/MissionShell'
import { useLanguage } from '../contexts/LanguageContext'
const dnaSteps = [
  { name: 'Origin Recognition', desc: 'Origin Recognition Complex (ORC) binds to the origin of replication', emoji: '🎯' },
  { name: 'Helicase Unwinding', desc: 'Helicase enzyme unwinds the double helix, creating a replication fork', emoji: '🔓' },
  { name: 'Primer Synthesis', desc: 'Primase synthesizes RNA primers on both template strands', emoji: '📌' },
  { name: 'Leading Strand', desc: 'DNA Polymerase III adds nucleotides continuously (5\' → 3\') on the leading strand', emoji: '➡️' },
  { name: 'Lagging Strand', desc: 'DNA Pol III synthesizes Okazaki fragments on the lagging strand', emoji: '⬅️' },
  { name: 'Primer Replacement', desc: 'DNA Pol I replaces RNA primers with DNA. Ligase seals the gaps.', emoji: '🔗' },
]
const steps = dnaSteps.map(s => ({ title: s.name, description: s.desc }))
const observations = ['DNA replication is semi-conservative — each new molecule has one old and one new strand', 'The leading strand is synthesized continuously, lagging strand in Okazaki fragments', 'DNA polymerase can only add nucleotides in the 5\' → 3\' direction', 'Helicase, primase, DNA pol III, DNA pol I, and ligase are key enzymes', 'Replication occurs during S phase of the cell cycle']

export default function DNAReplication() {
  const { t } = useLanguage()
  const [stepIdx, setStepIdx] = useState(0)
  const step = dnaSteps[stepIdx]
  const bases = ['A', 'T', 'G', 'C', 'T', 'A', 'C', 'G', 'A', 'T']
  const complements = { A: 'T', T: 'A', G: 'C', C: 'G' }

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🧬 {t('Replication Steps', 'ನಕಲು ಹಂತಗಳು')}</h3>
        <div className="space-y-2">
          {dnaSteps.map((s, i) => (
            <button key={i} onClick={() => setStepIdx(i)} className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2 ${stepIdx === i ? 'bg-green-500 text-white font-semibold' : i < stepIdx ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
              <span>{s.emoji}</span> {s.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg text-sm disabled:opacity-50">← Back</button>
          <button onClick={() => setStepIdx(Math.min(5, stepIdx + 1))} disabled={stepIdx === 5} className="flex-1 bg-green-500 text-white font-semibold py-2 rounded-lg text-sm disabled:opacity-50">Next →</button>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{step.emoji} {step.name}</h3>
      <svg viewBox="0 0 400 300" className="w-full h-auto bg-gradient-to-b from-blue-50 to-white rounded-lg">
        {/* DNA strands */}
        {bases.map((b, i) => {
          const x = 40 + i * 35
          const unwound = stepIdx >= 1 && i < stepIdx * 2
          const y1 = unwound ? 80 : 130
          const y2 = unwound ? 220 : 170
          const bColor = { A: '#ef4444', T: '#3b82f6', G: '#22c55e', C: '#f59e0b' }
          return (
            <g key={i}>
              {/* Template strand */}
              <rect x={x - 8} y={y1 - 10} width={16} height={20} rx={3} fill={bColor[b]} opacity={0.8} />
              <text x={x} y={y1 + 5} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{b}</text>
              {/* Complement strand / new strand */}
              {(stepIdx < 1 || (stepIdx >= 3 && i < (stepIdx - 2) * 3)) && (
                <>
                  <rect x={x - 8} y={y2 - 10} width={16} height={20} rx={3} fill={bColor[complements[b]]} opacity={stepIdx >= 3 ? 0.5 : 0.8} />
                  <text x={x} y={y2 + 5} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{complements[b]}</text>
                  {!unwound && <line x1={x} y1={y1 + 10} x2={x} y2={y2 - 10} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2" />}
                </>
              )}
              {/* Hydrogen bonds */}
              {unwound && stepIdx >= 3 && i < (stepIdx - 2) * 3 && (
                <line x1={x} y1={y1 + 10} x2={x} y2={y2 - 10} stroke="#22c55e" strokeWidth="1" strokeDasharray="3 2" />
              )}
            </g>
          )
        })}
        {/* Helicase */}
        {stepIdx >= 1 && <circle cx={40 + stepIdx * 35} cy={150} r={12} fill="#8b5cf6" stroke="white" strokeWidth="2" />}
        {stepIdx >= 1 && <text x={40 + stepIdx * 35} y={154} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">H</text>}
        {/* Labels */}
        <text x={200} y={25} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">5' ────────── 3' (Template)</text>
        <text x={200} y={285} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600">3' ────────── 5' (Complement)</text>
      </svg>
      <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-3 rounded-lg">{step.desc}</p>
    </div>
  )

  return <MissionShell title={t('DNA Replication', 'DNA ನಕಲು')} titleEmoji="🧬" subject="Biology" accentColor="green" gradientFrom="from-green-500" gradientTo="to-emerald-600" steps={steps} currentStep={stepIdx} controls={controls} visualization={visualization} observations={observations} />
}
