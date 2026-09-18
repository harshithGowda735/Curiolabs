import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'

const steps = [
  { title: 'Fill Burette', description: 'The burette is filled with NaOH (0.1 M) titrant' },
  { title: 'Add Acid', description: 'The flask contains HCl (0.1 M, 50 mL) with phenolphthalein indicator' },
  { title: 'Titrate', description: 'Slowly add NaOH using the volume slider and observe pH changes' },
  { title: 'Find Equivalence', description: 'Locate the equivalence point where pH changes rapidly' },
  { title: 'Record', description: 'Note the volume at equivalence and the sharp indicator color change' },
]

const observations = [
  'At equivalence point, moles of acid = moles of base (50 mL of NaOH for 50 mL of HCl at equal concentrations)',
  'The pH curve shows a sharp S-shape near the equivalence point',
  'Phenolphthalein turns pink above pH 8.2, colorless below',
  'Strong acid + strong base titration has equivalence at pH 7',
  'The buffer region shows slow pH change away from equivalence',
]

export default function AcidBaseTitration() {
  const { t } = useLanguage()
  const [volumeNaOH, setVolumeNaOH] = useState(0) // mL added
  const [dataPoints, setDataPoints] = useState([])

  const cHCl = 0.1, vHCl = 50, cNaOH = 0.1 // concentrations (M) and initial HCl volume (mL)
  const totalVol = vHCl + volumeNaOH // mL

  const pH = useMemo(() => {
    const molesHCl = cHCl * vHCl / 1000
    const molesNaOH = cNaOH * volumeNaOH / 1000
    const excess = molesHCl - molesNaOH
    const totalL = totalVol / 1000

    if (excess > 0.0001) {
      // Excess acid
      const concH = excess / totalL
      return -Math.log10(concH)
    } else if (excess < -0.0001) {
      // Excess base
      const concOH = Math.abs(excess) / totalL
      const pOH = -Math.log10(concOH)
      return 14 - pOH
    } else {
      return 7.0 // Equivalence point
    }
  }, [volumeNaOH, totalVol])

  const indicatorColor = pH < 8.2 ? 'transparent' : pH < 10 ? `rgba(236, 72, 153, ${(pH - 8.2) / 1.8})` : '#ec4899'
  const solutionColor = pH < 3 ? '#fca5a5' : pH < 5 ? '#fde68a' : pH < 8 ? '#bbf7d0' : pH < 10 ? '#fbcfe8' : '#f9a8d4'

  const addReading = () => {
    setDataPoints(prev => [...prev, { vol: volumeNaOH, ph: pH }])
  }

  const graphW = 400, graphH = 250, pad = 45
  const sx = (v) => pad + (v / 100) * (graphW - 2 * pad)
  const sy = (p) => graphH - pad - (p / 14) * (graphH - 2 * pad)

  // Theoretical pH curve
  const theoryCurve = useMemo(() => {
    const pts = []
    for (let v = 0; v <= 100; v += 0.5) {
      const molesH = cHCl * vHCl / 1000 - cNaOH * v / 1000
      const totL = (vHCl + v) / 1000
      let p
      if (molesH > 0.0001) p = -Math.log10(molesH / totL)
      else if (molesH < -0.0001) p = 14 + Math.log10(Math.abs(molesH) / totL)
      else p = 7
      pts.push({ v, p: Math.max(0, Math.min(14, p)) })
    }
    return pts
  }, [])

  const controls = (
    <div className="space-y-4">
      {/* Setup status */}
      <div className={`rounded-xl px-4 py-3 flex items-center gap-2 ${Math.abs(volumeNaOH - 50) < 2 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
        <span>{Math.abs(volumeNaOH - 50) < 2 ? '✅' : '⚠️'}</span>
        <p className={`font-semibold text-sm ${Math.abs(volumeNaOH - 50) < 2 ? 'text-green-700' : 'text-amber-700'}`}>
          {Math.abs(volumeNaOH - 50) < 2 ? t('Near Equivalence Point!', 'ಸಮಾನ ಬಿಂದುವಿನ ಬಳಿ!') : t('Add NaOH to find equivalence point', 'ಸಮಾನ ಬಿಂದುವನ್ನು ಕಂಡುಹಿಡಿಯಲು NaOH ಸೇರಿಸಿ')}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🧪 {t('Titration Controls', 'ಟೈಟ್ರೇಶನ್ ನಿಯಂತ್ರಣಗಳು')}</h3>
        <LabeledSlider label={t('NaOH Volume Added', 'ಸೇರಿಸಿದ NaOH ಪರಿಮಾಣ')} value={volumeNaOH} onChange={setVolumeNaOH} min={0} max={100} step={0.5} unit=" mL" accentColor="#ec4899" />
        <button onClick={addReading} className="w-full mt-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-pink-500/20">
          📝 {t('Record pH Reading', 'pH ರೀಡಿಂಗ್ ರೆಕಾರ್ಡ್ ಮಾಡಿ')}
        </button>
      </div>

      {/* Live beaker visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🔬 {t('Solution', 'ದ್ರಾವಣ')}</h3>
        <div className="flex items-end justify-center gap-4">
          {/* Beaker */}
          <div className="relative w-24 h-32 border-2 border-gray-300 rounded-b-xl overflow-hidden" style={{ borderTop: 'none' }}>
            <div className="absolute bottom-0 w-full transition-all duration-300" style={{ height: `${Math.min(95, 40 + volumeNaOH * 0.5)}%`, backgroundColor: solutionColor }}>
              {indicatorColor !== 'transparent' && (
                <div className="absolute inset-0" style={{ backgroundColor: indicatorColor, mixBlendMode: 'multiply' }}></div>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-display font-bold" style={{ color: pH < 7 ? '#ef4444' : pH > 7 ? '#3b82f6' : '#22c55e' }}>
              pH {pH.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">{pH < 7 ? '🔴 Acidic' : pH > 7 ? '🔵 Basic' : '🟢 Neutral'}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('pH Titration Curve', 'pH ಟೈಟ್ರೇಶನ್ ಕರ್ವ್')}</h3>
        <svg viewBox={`0 0 ${graphW} ${graphH}`} className="w-full h-auto">
          {/* Grid */}
          {[0, 2, 4, 6, 7, 8, 10, 12, 14].map(p => (
            <g key={p}>
              <line x1={pad} y1={sy(p)} x2={graphW - pad} y2={sy(p)} stroke={p === 7 ? '#22c55e' : '#f1f5f9'} strokeWidth={p === 7 ? '1' : '0.5'} />
              <text x={pad - 5} y={sy(p) + 4} textAnchor="end" fill="#94a3b8" fontSize="8">{p}</text>
            </g>
          ))}
          {[0, 25, 50, 75, 100].map(v => (
            <g key={v}>
              <line x1={sx(v)} y1={pad} x2={sx(v)} y2={graphH - pad} stroke="#f1f5f9" strokeWidth="0.5" />
              <text x={sx(v)} y={graphH - pad + 14} textAnchor="middle" fill="#94a3b8" fontSize="8">{v}</text>
            </g>
          ))}
          <text x={graphW / 2} y={graphH - 5} textAnchor="middle" fill="#64748b" fontSize="9">NaOH Volume (mL)</text>
          <text x={8} y={graphH / 2} textAnchor="middle" fill="#64748b" fontSize="9" transform={`rotate(-90, 8, ${graphH / 2})`}>pH</text>
          {/* Theoretical curve */}
          <polyline points={theoryCurve.map(p => `${sx(p.v)},${sy(p.p)}`).join(' ')} fill="none" stroke="#f9a8d4" strokeWidth="2" />
          {/* Data points */}
          {dataPoints.map((d, i) => (
            <circle key={i} cx={sx(d.vol)} cy={sy(d.ph)} r="4" fill="#ec4899" stroke="white" strokeWidth="1.5" />
          ))}
          {/* Current position */}
          <circle cx={sx(volumeNaOH)} cy={sy(pH)} r="6" fill="#ef4444" stroke="white" strokeWidth="2" className="animate-pulse" />
          {/* Equivalence point marker */}
          <line x1={sx(50)} y1={pad} x2={sx(50)} y2={graphH - pad} stroke="#22c55e" strokeWidth="1" strokeDasharray="4 2" />
          <text x={sx(50) + 3} y={pad + 12} fill="#22c55e" fontSize="8" fontWeight="600">Eq. Point</text>
        </svg>
      </div>
      {/* Data table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">{t('Experimental Data', 'ಪ್ರಾಯೋಗಿಕ ಡೇಟಾ')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">
              <th className="py-2 px-3 text-left text-gray-500">NaOH (mL)</th>
              <th className="py-2 px-3 text-left text-gray-500">pH</th>
              <th className="py-2 px-3 text-left text-gray-500">Nature</th>
            </tr></thead>
            <tbody>
              {dataPoints.length === 0 ? (
                <tr><td colSpan={3} className="py-6 text-center text-gray-400">{t('No data yet. Record pH readings.', 'ಇನ್ನೂ ಡೇಟಾ ಇಲ್ಲ.')}</td></tr>
              ) : dataPoints.map((d, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 px-3">{d.vol.toFixed(1)}</td>
                  <td className="py-2 px-3 font-bold" style={{ color: d.ph < 7 ? '#ef4444' : d.ph > 7 ? '#3b82f6' : '#22c55e' }}>{d.ph.toFixed(2)}</td>
                  <td className="py-2 px-3">{d.ph < 6.5 ? 'Acidic' : d.ph > 7.5 ? 'Basic' : 'Neutral'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <MissionShell title={t('Acid-Base Titration', 'ಆಮ್ಲ-ಕ್ಷಾರ ಟೈಟ್ರೇಶನ್')} titleEmoji="🧪" subject="Chemistry" accentColor="pink" gradientFrom="from-pink-500" gradientTo="to-rose-600" steps={steps} currentStep={volumeNaOH > 45 ? 3 : volumeNaOH > 0 ? 2 : 0} controls={controls} visualization={visualization} observations={observations} />
  )
}
