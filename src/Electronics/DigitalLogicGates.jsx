import { useState, useMemo, useCallback } from 'react'
import MissionShell from '../components/MissionShell'
import { useLanguage } from '../contexts/LanguageContext'

const gateTypes = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR']
const truthTables = {
  AND: (a, b) => a && b, OR: (a, b) => a || b, NOT: (a) => !a,
  NAND: (a, b) => !(a && b), NOR: (a, b) => !(a || b),
  XOR: (a, b) => a !== b, XNOR: (a, b) => a === b,
}
const steps = [{ title: 'Select Gate', description: 'Choose a logic gate type' }, { title: 'Set Inputs', description: 'Toggle input A and B values' }, { title: 'View Truth Table', description: 'See all input/output combinations' }, { title: 'Build Circuit', description: 'Chain multiple gates together' }]
const observations = ['AND gate outputs 1 only when ALL inputs are 1', 'OR gate outputs 1 when ANY input is 1', 'NOT gate inverts: 0→1, 1→0', 'NAND is a universal gate — any circuit can be built using only NANDs', 'XOR outputs 1 when inputs DIFFER']

export default function DigitalLogicGates() {
  const { t } = useLanguage()
  const [gate, setGate] = useState('AND')
  const [inputA, setInputA] = useState(false)
  const [inputB, setInputB] = useState(false)

  const output = gate === 'NOT' ? truthTables[gate](inputA) : truthTables[gate](inputA, inputB)

  const fullTruth = useMemo(() => {
    if (gate === 'NOT') return [[false, truthTables[gate](false)], [true, truthTables[gate](true)]]
    return [[false, false], [false, true], [true, false], [true, true]].map(([a, b]) => [a, b, truthTables[gate](a, b)])
  }, [gate])

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🔌 {t('Gate Selection', 'ಗೇಟ್ ಆಯ್ಕೆ')}</h3>
        <div className="flex flex-wrap gap-2">
          {gateTypes.map(g => (
            <button key={g} onClick={() => setGate(g)} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${gate === g ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{g}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🎛️ {t('Inputs', 'ಇನ್‌ಪುಟ್‌ಗಳು')}</h3>
        <div className="flex gap-4">
          <button onClick={() => setInputA(!inputA)} className={`flex-1 py-4 rounded-xl text-lg font-bold transition-all ${inputA ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-200 text-gray-600'}`}>
            A = {inputA ? '1' : '0'}
          </button>
          {gate !== 'NOT' && (
            <button onClick={() => setInputB(!inputB)} className={`flex-1 py-4 rounded-xl text-lg font-bold transition-all ${inputB ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-200 text-gray-600'}`}>
              B = {inputB ? '1' : '0'}
            </button>
          )}
        </div>
        <div className={`mt-4 py-4 rounded-xl text-center text-2xl font-display font-bold transition-all ${output ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          Output = {output ? '1 ✅' : '0 ❌'}
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* Gate symbol */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{gate} {t('Gate Symbol', 'ಗೇಟ್ ಸಂಕೇತ')}</h3>
        <svg viewBox="0 0 300 150" className="w-full h-auto max-w-xs mx-auto">
          {/* Input lines */}
          <line x1={20} y1={50} x2={90} y2={50} stroke="#475569" strokeWidth="2" />
          {gate !== 'NOT' && <line x1={20} y1={100} x2={90} y2={100} stroke="#475569" strokeWidth="2" />}
          <circle cx={25} cy={50} r={6} fill={inputA ? '#22c55e' : '#ef4444'} /><text x={25} y={38} textAnchor="middle" fill="#64748b" fontSize="10">A</text>
          {gate !== 'NOT' && <><circle cx={25} cy={100} r={6} fill={inputB ? '#22c55e' : '#ef4444'} /><text x={25} y={118} textAnchor="middle" fill="#64748b" fontSize="10">B</text></>}
          {/* Gate body */}
          <rect x={90} y={30} width={80} height={90} rx={gate.includes('OR') ? 20 : 8} fill={`${output ? '#dcfce7' : '#fee2e2'}`} stroke="#475569" strokeWidth="2" />
          <text x={130} y={80} textAnchor="middle" fill="#1f2937" fontSize="14" fontWeight="bold">{gate}</text>
          {/* NOT bubble */}
          {(gate === 'NOT' || gate === 'NAND' || gate === 'NOR' || gate === 'XNOR') && <circle cx={175} cy={75} r={5} fill="white" stroke="#475569" strokeWidth="1.5" />}
          {/* Output line */}
          <line x1={gate === 'NOT' || gate === 'NAND' || gate === 'NOR' || gate === 'XNOR' ? 180 : 170} y1={75} x2={270} y2={75} stroke="#475569" strokeWidth="2" />
          <circle cx={270} cy={75} r={8} fill={output ? '#22c55e' : '#ef4444'} stroke="white" strokeWidth="2" />
          <text x={270} y={79} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{output ? '1' : '0'}</text>
        </svg>
      </div>
      {/* Truth table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Truth Table', 'ಸತ್ಯ ಕೋಷ್ಟಕ')}</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200">
            <th className="py-2 px-3 text-gray-500">A</th>
            {gate !== 'NOT' && <th className="py-2 px-3 text-gray-500">B</th>}
            <th className="py-2 px-3 text-gray-500">Output</th>
          </tr></thead>
          <tbody>
            {fullTruth.map((row, i) => {
              const isActive = gate === 'NOT' ? row[0] === inputA : row[0] === inputA && row[1] === inputB
              const out = gate === 'NOT' ? row[1] : row[2]
              return (
                <tr key={i} className={`border-b border-gray-50 ${isActive ? 'bg-emerald-50' : ''}`}>
                  <td className="py-2 px-3 text-center font-bold">{row[0] ? '1' : '0'}</td>
                  {gate !== 'NOT' && <td className="py-2 px-3 text-center font-bold">{row[1] ? '1' : '0'}</td>}
                  <td className={`py-2 px-3 text-center font-bold ${out ? 'text-green-600' : 'text-red-600'}`}>{out ? '1' : '0'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  return <MissionShell title={t('Digital Logic Gates', 'ಡಿಜಿಟಲ್ ಲಾಜಿಕ್ ಗೇಟ್‌ಗಳು')} titleEmoji="🔌" subject="Electronics" accentColor="emerald" gradientFrom="from-emerald-500" gradientTo="to-teal-600" steps={steps} currentStep={2} controls={controls} visualization={visualization} observations={observations} />
}
