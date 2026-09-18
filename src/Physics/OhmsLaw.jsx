import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Set Voltage', description: 'Adjust the voltage source (V) using the slider' },
  { title: 'Set Resistance', description: 'Adjust the resistance (Ω) to observe current changes' },
  { title: 'Observe Current', description: 'Read the ammeter to see I = V/R in action' },
  { title: 'Record Data', description: 'Note down voltage, resistance, and current values' },
  { title: 'Plot Graph', description: 'See the V-I characteristic graph update in real time' },
]

const observations = [
  'Current is directly proportional to voltage when resistance is constant (Ohm\'s Law: V = IR)',
  'Increasing resistance decreases current for the same voltage',
  'Power dissipated P = V × I = I²R = V²/R',
  'The V-I graph is a straight line through the origin for ohmic conductors',
]

export default function OhmsLaw() {
  const { t } = useLanguage()
  const [voltage, setVoltage] = useState(5)
  const [resistance, setResistance] = useState(100)
  const [dataPoints, setDataPoints] = useState([])

  const current = useMemo(() => (resistance > 0 ? voltage / resistance : 0), [voltage, resistance])
  const power = useMemo(() => voltage * current, [voltage, current])

  const addDataPoint = () => {
    setDataPoints(prev => [...prev, { v: voltage, r: resistance, i: current, p: power }])
  }

  const clearData = () => setDataPoints([])

  // SVG V-I Graph
  const graphWidth = 400, graphHeight = 200, padding = 40
  const maxV = 20, maxI = 0.5
  const scaleX = (v) => padding + (v / maxV) * (graphWidth - 2 * padding)
  const scaleY = (i) => graphHeight - padding - (i / maxI) * (graphHeight - 2 * padding)

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-gray-800">⚡ {t('Circuit Controls', 'ಸರ್ಕ್ಯೂಟ್ ನಿಯಂತ್ರಣಗಳು')}</h3>
          <button onClick={clearData} className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
            🔄 {t('Reset', 'ಮರುಹೊಂದಿಸಿ')}
          </button>
        </div>
        <div className="space-y-4">
          <LabeledSlider label={t('Voltage (V)', 'ವೋಲ್ಟೇಜ್ (V)')} value={voltage} onChange={setVoltage} min={0} max={20} step={0.5} unit="V" accentColor="#3b82f6" />
          <LabeledSlider label={t('Resistance (Ω)', 'ಪ್ರತಿರೋಧ (Ω)')} value={resistance} onChange={setResistance} min={10} max={1000} step={10} unit="Ω" accentColor="#f59e0b" />
        </div>
        <button onClick={addDataPoint} className="w-full mt-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
          🔬 {t('Record Reading', 'ರೀಡಿಂಗ್ ರೆಕಾರ್ಡ್ ಮಾಡಿ')}
        </button>
      </div>

      {/* Live Readings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">📊 {t('Live Readings', 'ಲೈವ್ ರೀಡಿಂಗ್‌ಗಳು')}</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">{t('Voltage', 'ವೋಲ್ಟೇಜ್')}</p>
            <p className="text-xl font-bold text-blue-700">{voltage}<span className="text-sm">V</span></p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-amber-600 font-medium">{t('Current', 'ಕರೆಂಟ್')}</p>
            <p className="text-xl font-bold text-amber-700">{(current * 1000).toFixed(1)}<span className="text-sm">mA</span></p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-red-600 font-medium">{t('Power', 'ಶಕ್ತಿ')}</p>
            <p className="text-xl font-bold text-red-700">{(power * 1000).toFixed(1)}<span className="text-sm">mW</span></p>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-gray-800">{t('Experimental Data', 'ಪ್ರಾಯೋಗಿಕ ಡೇಟಾ')}</h3>
          <button onClick={clearData} className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-semibold transition-colors">
            {t('Clear Data', 'ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 px-3 text-left text-gray-500 font-semibold">V (V)</th>
                <th className="py-2 px-3 text-left text-gray-500 font-semibold">R (Ω)</th>
                <th className="py-2 px-3 text-left text-gray-500 font-semibold">I (mA)</th>
                <th className="py-2 px-3 text-left text-gray-500 font-semibold">P (mW)</th>
              </tr>
            </thead>
            <tbody>
              {dataPoints.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">{t('No data collected yet. Start the experiment to collect data.', 'ಇನ್ನೂ ಯಾವುದೇ ಡೇಟಾ ಸಂಗ್ರಹಿಸಿಲ್ಲ.')}</td></tr>
              ) : (
                dataPoints.map((d, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3">{d.v.toFixed(1)}</td>
                    <td className="py-2 px-3">{d.r}</td>
                    <td className="py-2 px-3">{(d.i * 1000).toFixed(2)}</td>
                    <td className="py-2 px-3">{(d.p * 1000).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* V-I Graph */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('V-I Characteristic Graph', 'V-I ಲಕ್ಷಣ ಗ್ರಾಫ್')}</h3>
        <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map(i => (
            <g key={i}>
              <line x1={padding} y1={scaleY(i)} x2={graphWidth - padding} y2={scaleY(i)} stroke="#e2e8f0" strokeWidth="0.5" />
              <text x={padding - 5} y={scaleY(i) + 4} textAnchor="end" fill="#94a3b8" fontSize="8">{(i * 1000).toFixed(0)}</text>
            </g>
          ))}
          {[0, 5, 10, 15, 20].map(v => (
            <g key={v}>
              <line x1={scaleX(v)} y1={padding} x2={scaleX(v)} y2={graphHeight - padding} stroke="#e2e8f0" strokeWidth="0.5" />
              <text x={scaleX(v)} y={graphHeight - padding + 15} textAnchor="middle" fill="#94a3b8" fontSize="8">{v}</text>
            </g>
          ))}
          {/* Axes labels */}
          <text x={graphWidth / 2} y={graphHeight - 5} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">Voltage (V)</text>
          <text x={10} y={graphHeight / 2} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600" transform={`rotate(-90, 10, ${graphHeight / 2})`}>Current (mA)</text>
          {/* Theoretical line for current resistance */}
          <line x1={scaleX(0)} y1={scaleY(0)} x2={scaleX(maxV)} y2={scaleY(maxV / resistance)} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.5" />
          {/* Data points */}
          {dataPoints.map((d, i) => (
            <circle key={i} cx={scaleX(d.v)} cy={scaleY(d.i)} r="4" fill="#3b82f6" stroke="white" strokeWidth="1.5" />
          ))}
          {/* Current position indicator */}
          <circle cx={scaleX(voltage)} cy={scaleY(current)} r="6" fill="#ef4444" stroke="white" strokeWidth="2" className="animate-pulse" />
        </svg>
      </div>
    </div>
  )

  return (
    <MissionShell
      title={t("Ohm's Law Experiment", "ಓಮ್‌ನ ನಿಯಮ ಪ್ರಯೋಗ")}
      titleEmoji="⚡"
      subject="Physics"
      accentColor="blue"
      gradientFrom="from-blue-500"
      gradientTo="to-indigo-600"
      steps={steps}
      currentStep={dataPoints.length > 0 ? 4 : voltage > 0 && resistance > 0 ? 2 : 0}
      controls={controls}
      visualization={visualization}
      observations={observations}
    />
  )
}
