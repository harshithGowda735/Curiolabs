import { useState } from 'react'
import MissionShell from '../components/MissionShell'
import { useLanguage } from '../contexts/LanguageContext'
const phases = [
  { name: 'Interphase', desc: 'DNA replicates, cell grows. Chromatin is loose.', color: '#dbeafe' },
  { name: 'Prophase', desc: 'Chromatin condenses into chromosomes. Spindle fibers form.', color: '#c7d2fe' },
  { name: 'Metaphase', desc: 'Chromosomes align at the cell equator (metaphase plate).', color: '#a5b4fc' },
  { name: 'Anaphase', desc: 'Sister chromatids separate and move to opposite poles.', color: '#818cf8' },
  { name: 'Telophase', desc: 'Nuclear envelopes reform. Chromosomes decondense.', color: '#6366f1' },
  { name: 'Cytokinesis', desc: 'Cytoplasm divides, producing two daughter cells.', color: '#4f46e5' },
]
const steps = phases.map(p => ({ title: p.name, description: p.desc }))
const observations = ['Mitosis produces two genetically identical daughter cells', 'The cell cycle includes interphase (G1, S, G2) and mitotic phase (M)', 'Chromosomes are most visible during metaphase', 'The spindle apparatus is essential for chromosome separation', 'Cytokinesis differs in plant cells (cell plate) vs animal cells (cleavage furrow)']

export default function CellDivision() {
  const { t } = useLanguage()
  const [phaseIdx, setPhaseIdx] = useState(0)
  const phase = phases[phaseIdx]

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🧫 {t('Mitosis Phase', 'ಮೈಟೋಸಿಸ್ ಹಂತ')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {phases.map((p, i) => (
            <button key={i} onClick={() => setPhaseIdx(i)} className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${phaseIdx === i ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} style={phaseIdx === i ? { backgroundColor: p.color } : {}}>
              {i + 1}. {p.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setPhaseIdx(Math.max(0, phaseIdx - 1))} disabled={phaseIdx === 0} className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-semibold py-2 rounded-lg text-sm">← {t('Previous', 'ಹಿಂದಿನ')}</button>
          <button onClick={() => setPhaseIdx(Math.min(5, phaseIdx + 1))} disabled={phaseIdx === 5} className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm">{t('Next', 'ಮುಂದಿನ')} →</button>
        </div>
      </div>
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4">
        <h3 className="font-display font-bold text-indigo-800 text-lg">{phase.name}</h3>
        <p className="text-sm text-indigo-600 mt-1">{phase.desc}</p>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Cell Visualization', 'ಕೋಶ ದೃಶ್ಯೀಕರಣ')}: {phase.name}</h3>
      <svg viewBox="0 0 300 300" className="w-full h-auto max-w-sm mx-auto">
        {/* Cell membrane */}
        <ellipse cx={150} cy={150} rx={phaseIdx === 5 ? 60 : 120} ry={120} fill={phase.color} stroke="#4338ca" strokeWidth="2" opacity="0.3" />
        {phaseIdx === 5 && <ellipse cx={240} cy={150} rx={60} ry={120} fill={phase.color} stroke="#4338ca" strokeWidth="2" opacity="0.3" />}
        {/* Nuclear envelope */}
        {(phaseIdx === 0 || phaseIdx === 4 || phaseIdx === 5) && (
          <>
            <ellipse cx={phaseIdx === 5 ? 85 : 150} cy={150} rx={phaseIdx === 5 ? 35 : 50} ry={45} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray={phaseIdx === 4 ? '4 2' : 'none'} />
            {phaseIdx === 5 && <ellipse cx={215} cy={150} rx={35} ry={45} fill="none" stroke="#6366f1" strokeWidth="1.5" />}
          </>
        )}
        {/* Chromosomes */}
        {phaseIdx === 0 && Array.from({ length: 8 }).map((_, i) => <line key={i} x1={130 + Math.random() * 40} y1={120 + Math.random() * 60} x2={130 + Math.random() * 40} y2={120 + Math.random() * 60 + 15} stroke="#1e40af" strokeWidth="1.5" opacity="0.5" />)}
        {phaseIdx === 1 && Array.from({ length: 4 }).map((_, i) => <text key={i} x={120 + i * 20} y={140 + (i % 2) * 20} fontSize="16" fill="#1e40af" fontWeight="bold">X</text>)}
        {phaseIdx === 2 && Array.from({ length: 4 }).map((_, i) => <text key={i} x={130 + i * 15} y={153} fontSize="16" fill="#1e40af" fontWeight="bold">X</text>)}
        {phaseIdx === 3 && (<>{Array.from({ length: 4 }).map((_, i) => <text key={i} x={80 + i * 12} y={130} fontSize="14" fill="#1e40af" fontWeight="bold">|</text>)}{Array.from({ length: 4 }).map((_, i) => <text key={`b${i}`} x={190 + i * 12} y={170} fontSize="14" fill="#1e40af" fontWeight="bold">|</text>)}</>)}
        {(phaseIdx === 4 || phaseIdx === 5) && (<>{Array.from({ length: 4 }).map((_, i) => <line key={i} x1={phaseIdx === 5 ? 70 + i * 10 : 110 + i * 10} y1={135} x2={phaseIdx === 5 ? 70 + i * 10 : 110 + i * 10} y2={165} stroke="#1e40af" strokeWidth="1" opacity="0.4" />)}{Array.from({ length: 4 }).map((_, i) => <line key={`b${i}`} x1={phaseIdx === 5 ? 200 + i * 10 : 180 + i * 10} y1={135} x2={phaseIdx === 5 ? 200 + i * 10 : 180 + i * 10} y2={165} stroke="#1e40af" strokeWidth="1" opacity="0.4" />)}</>)}
        {/* Spindle fibers */}
        {(phaseIdx === 1 || phaseIdx === 2 || phaseIdx === 3) && <>
          <line x1={150} y1={30} x2={150} y2={270} stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="3" />
          {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={phaseIdx === 3 ? (i < 3 ? 50 : 250) : 150} y1={i < 3 ? 40 : 260} x2={120 + i * 10} y2={150} stroke="#a5b4fc" strokeWidth="0.5" />)}
        </>}
        <text x={150} y={290} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">{phase.name}</text>
      </svg>
    </div>
  )

  return <MissionShell title={t('Cell Division (Mitosis)', 'ಕೋಶ ವಿಭಜನೆ (ಮೈಟೋಸಿಸ್)')} titleEmoji="🧫" subject="Biology" accentColor="green" gradientFrom="from-green-500" gradientTo="to-emerald-600" steps={steps} currentStep={phaseIdx} controls={controls} visualization={visualization} observations={observations} />
}
