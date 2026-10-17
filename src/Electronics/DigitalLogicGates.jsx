import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import { useLanguage } from '../contexts/LanguageContext'
import { Cpu, Zap, Activity } from 'lucide-react'

const gateTypes = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR']
const truthTables = {
  AND: (a, b) => a && b,
  OR: (a, b) => a || b,
  NOT: (a) => !a,
  NAND: (a, b) => !(a && b),
  NOR: (a, b) => !(a || b),
  XOR: (a, b) => a !== b,
  XNOR: (a, b) => a === b,
}

const steps = [
  { title: 'Select Gate', description: 'Choose a digital logic gate IC type from the selection bar' },
  { title: 'Set Inputs', description: 'Toggle binary logic inputs A and B between Logic 0 (0V) and Logic 1 (+5V)' },
  { title: 'Observe Output', description: 'Observe the real-time logic output level and state on the schematic visualizer' },
  { title: 'Verify Truth Table', description: 'Confirm that the measured output matches the active row in the truth table' }
]

const apparatusList = [
  { slNo: '1.', particulars: 'Digital IC Trainer (7408, 7432, 7404, 7400, 7486)', range: 'TTL Dual-In-Line', quantity: '01' },
  { slNo: '2.', particulars: 'Regulated DC Power Supply', range: '+5.0V DC Rail', quantity: '01' },
  { slNo: '3.', particulars: 'Logic Input Toggle Switches (Debounced)', range: '0V (Low) / 5V (High)', quantity: '02' },
  { slNo: '4.', particulars: 'Output Logic State LED Probe', range: 'Active High Red/Green', quantity: '01' },
  { slNo: '5.', particulars: 'Patch Cords & Connecting Jumpers', range: '2mm Banana / Single Strand', quantity: '06' }
]

const observations = [
  'AND gate (7408) outputs Logic 1 (+5V) strictly when ALL inputs are Logic 1.',
  'OR gate (7432) outputs Logic 1 if ANY input is Logic 1.',
  'NOT gate / Inverter (7404) inverts logic state: Logic 0 becomes 1, and Logic 1 becomes 0.',
  'NAND gate (7400) is a universal gate; outputs Logic 0 only when both inputs are Logic 1.',
  'NOR gate (7402) is a universal gate; outputs Logic 1 only when all inputs are Logic 0.',
  'XOR gate (7486) produces Logic 1 when the inputs are non-identical (odd parity detector).'
]

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
      {/* Gate Selection Card */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#221611]/15 p-4 sm:p-5 text-[#221611]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-black text-xs text-[#221611] uppercase tracking-wider flex items-center gap-2">
            <Cpu size={14} className="text-[#A4C93B]" />
            <span>{t('Gate Selection', 'ಗೇಟ್ ಆಯ್ಕೆ')}</span>
          </h3>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5EB] text-[#754F40] border border-[#221611]/15">
            TTL 74-Series
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {gateTypes.map(g => {
            const isActive = gate === g
            return (
              <button
                key={g}
                onClick={() => setGate(g)}
                className={`px-3.5 py-2 rounded-xl text-xs font-display font-black border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#221611] text-[#A4C93B] border-[#221611] shadow-[0_3px_0_#221611]'
                    : 'bg-[#FAF5EB] hover:bg-white text-[#221611] border-[#221611]/20 hover:border-[#221611]/60 active:scale-95'
                }`}
              >
                {g}
              </button>
            )
          })}
        </div>
      </div>

      {/* Logic Inputs Toggle Station */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#221611]/15 p-4 sm:p-5 text-[#221611]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-black text-xs text-[#221611] uppercase tracking-wider flex items-center gap-2">
            <Zap size={14} className="text-[#A4C93B]" />
            <span>{t('Binary Logic Inputs', 'ಇನ್‌ಪುಟ್‌ಗಳು')}</span>
          </h3>
          <span className="text-[10px] font-mono text-[#754F40]">Click to Toggle (0 ⇄ 1)</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setInputA(!inputA)}
            className={`p-3.5 sm:p-4 rounded-xl text-center border-2 transition-all cursor-pointer ${
              inputA
                ? 'bg-[#A4C93B] text-[#221611] border-[#221611] shadow-[0_3px_0_#221611]'
                : 'bg-[#FAF5EB] text-[#754F40] border-[#221611]/20 hover:border-[#221611]/60'
            }`}
          >
            <div className="text-[11px] font-display font-bold uppercase tracking-wider opacity-80">Input A</div>
            <div className="text-2xl font-display font-black mt-1">
              {inputA ? '1' : '0'}
            </div>
            <div className="text-[10px] font-mono mt-0.5">
              {inputA ? '+5.0V (HIGH)' : '0.0V (LOW)'}
            </div>
          </button>

          {gate !== 'NOT' ? (
            <button
              onClick={() => setInputB(!inputB)}
              className={`p-3.5 sm:p-4 rounded-xl text-center border-2 transition-all cursor-pointer ${
                inputB
                  ? 'bg-[#A4C93B] text-[#221611] border-[#221611] shadow-[0_3px_0_#221611]'
                  : 'bg-[#FAF5EB] text-[#754F40] border-[#221611]/20 hover:border-[#221611]/60'
              }`}
            >
              <div className="text-[11px] font-display font-bold uppercase tracking-wider opacity-80">Input B</div>
              <div className="text-2xl font-display font-black mt-1">
                {inputB ? '1' : '0'}
              </div>
              <div className="text-[10px] font-mono mt-0.5">
                {inputB ? '+5.0V (HIGH)' : '0.0V (LOW)'}
              </div>
            </button>
          ) : (
            <div className="p-3.5 sm:p-4 rounded-xl text-center border-2 border-dashed border-[#221611]/20 bg-[#FAF5EB]/50 text-[#754F40]/60 flex flex-col justify-center items-center">
              <div className="text-[11px] font-display font-bold uppercase tracking-wider">Input B</div>
              <div className="text-xs font-mono mt-2 italic">NOT inverts single input A</div>
            </div>
          )}
        </div>

        {/* Live Output Banner */}
        <div className="mt-4 p-4 rounded-xl bg-[#221611] border-2 border-[#3A2820] text-[#FAF5EB] flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FAF5EB]/70 block">
              Measured IC Output (Y)
            </span>
            <div className="font-display font-black text-xl sm:text-2xl flex items-center gap-2 text-[#FAF5EB] mt-0.5">
              <span>Output =</span>
              <span className={`px-2.5 py-0.5 rounded-lg ${output ? 'bg-[#A4C93B] text-[#221611]' : 'bg-rose-500 text-white'}`}>
                {output ? '1 (HIGH)' : '0 (LOW)'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-lg border-2 border-white/20"
               style={{ backgroundColor: output ? '#A4C93B' : '#3A2820', color: output ? '#221611' : '#FAF5EB' }}>
            {output ? '✓' : '✗'}
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* Gate symbol schematic card */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#221611]/15 p-5 text-[#221611]">
        <div className="flex items-center justify-between mb-4 border-b border-[#221611]/10 pb-3">
          <h3 className="font-display font-black text-xs sm:text-sm text-[#221611] uppercase tracking-wider flex items-center gap-2">
            <Activity size={14} className="text-[#A4C93B]" />
            <span>{gate} {t('Gate Logic Symbol & Live Signal Path', 'ಗೇಟ್ ಸಂಕೇತ')}</span>
          </h3>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FAF5EB] text-[#221611] border border-[#221611]/20">
            {gate === 'NOT' ? '1-Input Inverter' : '2-Input Gate'}
          </span>
        </div>

        <div className="bg-[#FAF5EB] rounded-xl p-4 sm:p-6 border-2 border-[#221611]/15 flex items-center justify-center">
          <svg viewBox="0 0 320 160" className="w-full max-w-md h-auto">
            {/* Input A Line */}
            <line x1={30} y1={50} x2={100} y2={50} stroke={inputA ? '#A4C93B' : '#221611'} strokeWidth={inputA ? 3.5 : 2.5} />
            <circle cx={35} cy={50} r={9} fill={inputA ? '#A4C93B' : '#FAF5EB'} stroke="#221611" strokeWidth={2.5} />
            <text x={35} y={54} textAnchor="middle" fill="#221611" fontSize="10" fontWeight="bold">A</text>
            <text x={70} y={42} textAnchor="middle" fill={inputA ? '#365314' : '#754F40'} fontSize="9" fontWeight="bold" fontFamily="monospace">
              {inputA ? '1 (+5V)' : '0 (0V)'}
            </text>

            {/* Input B Line (if not NOT gate) */}
            {gate !== 'NOT' && (
              <>
                <line x1={30} y1={110} x2={100} y2={110} stroke={inputB ? '#A4C93B' : '#221611'} strokeWidth={inputB ? 3.5 : 2.5} />
                <circle cx={35} cy={110} r={9} fill={inputB ? '#A4C93B' : '#FAF5EB'} stroke="#221611" strokeWidth={2.5} />
                <text x={35} y={114} textAnchor="middle" fill="#221611" fontSize="10" fontWeight="bold">B</text>
                <text x={70} y={126} textAnchor="middle" fill={inputB ? '#365314' : '#754F40'} fontSize="9" fontWeight="bold" fontFamily="monospace">
                  {inputB ? '1 (+5V)' : '0 (0V)'}
                </text>
              </>
            )}

            {/* Gate Body Chassis */}
            <rect
              x={100}
              y={25}
              width={100}
              height={110}
              rx={gate.includes('OR') ? 24 : 12}
              fill="#FFFFFF"
              stroke="#221611"
              strokeWidth={2.5}
            />
            <text x={150} y={75} textAnchor="middle" fill="#221611" fontSize="18" fontWeight="900" fontFamily="sans-serif">
              {gate}
            </text>
            <text x={150} y={95} textAnchor="middle" fill="#754F40" fontSize="10" fontWeight="bold" fontFamily="monospace">
              IC 74-LOGIC
            </text>

            {/* Inversion Bubble for NOT, NAND, NOR, XNOR */}
            {(gate === 'NOT' || gate === 'NAND' || gate === 'NOR' || gate === 'XNOR') && (
              <circle cx={207} cy={80} r={7} fill="#FAF5EB" stroke="#221611" strokeWidth={2.5} />
            )}

            {/* Output Line */}
            {(() => {
              const startX = (gate === 'NOT' || gate === 'NAND' || gate === 'NOR' || gate === 'XNOR') ? 214 : 200
              return (
                <>
                  <line x1={startX} y1={80} x2={270} y2={80} stroke={output ? '#A4C93B' : '#221611'} strokeWidth={output ? 3.5 : 2.5} />
                  <circle cx={285} cy={80} r={14} fill={output ? '#A4C93B' : '#221611'} stroke="#221611" strokeWidth={2.5} />
                  <text x={285} y={85} textAnchor="middle" fill={output ? '#221611' : '#FAF5EB'} fontSize="12" fontWeight="900" fontFamily="sans-serif">
                    {output ? '1' : '0'}
                  </text>
                  <text x={250} y={72} textAnchor="middle" fill={output ? '#365314' : '#754F40'} fontSize="9" fontWeight="bold" fontFamily="monospace">
                    OUT (Y)
                  </text>
                </>
              )
            })()}
          </svg>
        </div>
      </div>

      {/* Truth table editorial card */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#221611]/15 p-5 text-[#221611]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-black text-xs sm:text-sm text-[#221611] uppercase tracking-wider flex items-center gap-2">
            <span>{t('Truth Table Verification', 'ಸತ್ಯ ಕೋಷ್ಟಕ ಪರಿಶೀಲನೆ')}</span>
          </h3>
          <span className="text-[10px] font-mono text-[#754F40]">Green row indicates live active state</span>
        </div>

        <div className="overflow-x-auto rounded-xl border-2 border-[#221611]/20">
          <table className="w-full text-xs font-sans border-collapse">
            <thead>
              <tr className="bg-[#221611] text-[#FAF5EB] font-mono font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4 text-center border-b border-[#3A2820]">Input A</th>
                {gate !== 'NOT' && <th className="py-2.5 px-4 text-center border-b border-[#3A2820]">Input B</th>}
                <th className="py-2.5 px-4 text-center border-b border-[#3A2820]">Output (Y)</th>
                <th className="py-2.5 px-4 text-center border-b border-[#3A2820]">Hardware State</th>
              </tr>
            </thead>
            <tbody>
              {fullTruth.map((row, i) => {
                const isActive = gate === 'NOT' ? row[0] === inputA : row[0] === inputA && row[1] === inputB
                const out = gate === 'NOT' ? row[1] : row[2]
                return (
                  <tr
                    key={i}
                    className={`border-b border-[#221611]/10 transition-colors ${
                      isActive ? 'bg-[#A4C93B]/25 font-bold text-[#221611]' : 'hover:bg-[#FAF5EB]/50 text-[#3A2820]'
                    }`}
                  >
                    <td className="py-2.5 px-4 text-center font-mono font-bold">
                      {row[0] ? '1' : '0'}
                    </td>
                    {gate !== 'NOT' && (
                      <td className="py-2.5 px-4 text-center font-mono font-bold">
                        {row[1] ? '1' : '0'}
                      </td>
                    )}
                    <td className="py-2.5 px-4 text-center font-mono font-black">
                      <span className={`px-2 py-0.5 rounded ${out ? 'bg-[#A4C93B] text-[#221611]' : 'bg-[#FAF5EB] text-[#754F40]'}`}>
                        {out ? '1' : '0'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-[11px]">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[#221611] font-display font-black px-2 py-0.5 rounded-full bg-[#A4C93B] border border-[#221611]">
                          ● ACTIVE NOW
                        </span>
                      ) : (
                        <span className="text-[#754F40]/60">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t('Digital Logic Gates', 'ಡಿಜಿಟಲ್ ಲಾಜಿಕ್ ಗೇಟ್‌ಗಳು')}
      titleEmoji="🔌"
      subject="Electronics"
      aim="To study the operation and verify the truth tables of digital logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR) using digital IC switching circuits."
      apparatus={apparatusList}
      accentColor="emerald"
      gradientFrom="from-[#221611]"
      gradientTo="to-[#3A2820]"
      steps={steps}
      currentStep={2}
      controls={controls}
      visualization={visualization}
      observations={observations}
    />
  )
}
