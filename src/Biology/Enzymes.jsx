import { useState, useMemo } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'
const steps = [{ title: 'Set Substrate', description: 'Adjust substrate concentration [S]' }, { title: 'Set Enzyme', description: 'Adjust enzyme properties (Vmax, Km)' }, { title: 'Observe Rate', description: 'Watch the Michaelis-Menten curve build' }, { title: 'Add Inhibitor', description: 'See how competitive/non-competitive inhibitors affect the curve' }]
const observations = ['V = Vmax·[S]/(Km + [S]) is the Michaelis-Menten equation', 'Km is the substrate concentration at half-Vmax (measure of enzyme affinity)', 'Competitive inhibitors increase apparent Km but don\'t change Vmax', 'Non-competitive inhibitors decrease Vmax but don\'t change Km', 'At very high [S], V approaches Vmax (saturation kinetics)']

export default function Enzymes() {
  const { t } = useLanguage()
  const [substrate, setSubstrate] = useState(5)
  const [vmax, setVmax] = useState(10)
  const [km, setKm] = useState(5)
  const [inhibitor, setInhibitor] = useState('none')

  const adjKm = inhibitor === 'competitive' ? km * 2.5 : km
  const adjVmax = inhibitor === 'noncompetitive' ? vmax * 0.4 : vmax
  const rate = (adjVmax * substrate) / (adjKm + substrate)

  const gW = 400, gH = 220, gPad = 45
  const curve = useMemo(() => {
    const pts = []
    for (let s = 0; s <= 30; s += 0.5) {
      pts.push({ s, v: (adjVmax * s) / (adjKm + s) })
    }
    return pts
  }, [adjVmax, adjKm])

  const normalCurve = useMemo(() => {
    const pts = []
    for (let s = 0; s <= 30; s += 0.5) pts.push({ s, v: (vmax * s) / (km + s) })
    return pts
  }, [vmax, km])

  const sx = (s) => gPad + (s / 30) * (gW - 2 * gPad)
  const sy = (v) => gH - gPad - (v / (vmax * 1.2)) * (gH - 2 * gPad)

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">⚗️ {t('Enzyme Controls', 'ಕಿಣ್ವ ನಿಯಂತ್ರಣಗಳು')}</h3>
        <LabeledSlider label="[S] Substrate (mM)" value={substrate} onChange={setSubstrate} min={0} max={30} step={0.5} unit=" mM" accentColor="#22c55e" />
        <div className="mt-3"><LabeledSlider label="Vmax" value={vmax} onChange={setVmax} min={1} max={20} step={0.5} unit="" accentColor="#3b82f6" /></div>
        <div className="mt-3"><LabeledSlider label="Km" value={km} onChange={setKm} min={1} max={20} step={0.5} unit=" mM" accentColor="#f59e0b" /></div>
        <p className="text-sm font-medium text-gray-600 mt-3 mb-2">{t('Inhibitor Type', 'ಪ್ರತಿರೋಧಕ ಪ್ರಕಾರ')}</p>
        <div className="grid grid-cols-3 gap-2">
          {[['none', 'None'], ['competitive', 'Competitive'], ['noncompetitive', 'Non-competitive']].map(([id, label]) => (
            <button key={id} onClick={() => setInhibitor(id)} className={`py-2 rounded-lg text-xs font-semibold ${inhibitor === id ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{label}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600 font-medium">V (rate)</p>
            <p className="text-xl font-bold text-green-700">{rate.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">Vmax</p>
            <p className="text-xl font-bold text-blue-700">{adjVmax.toFixed(1)}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-xs text-amber-600 font-medium">Km</p>
            <p className="text-xl font-bold text-amber-700">{adjKm.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Michaelis-Menten Curve', 'ಮೈಕೆಲಿಸ್-ಮೆಂಟೆನ್ ಕರ್ವ್')}</h3>
      <svg viewBox={`0 0 ${gW} ${gH}`} className="w-full h-auto">
        {/* Grid */}
        <line x1={gPad} y1={gH - gPad} x2={gW - gPad} y2={gH - gPad} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={gPad} y1={gPad} x2={gPad} y2={gH - gPad} stroke="#e2e8f0" strokeWidth="1" />
        {/* Vmax line */}
        <line x1={gPad} y1={sy(adjVmax)} x2={gW - gPad} y2={sy(adjVmax)} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 2" />
        <text x={gW - gPad + 5} y={sy(adjVmax) + 4} fill="#3b82f6" fontSize="8">Vmax</text>
        {/* Km line */}
        <line x1={sx(adjKm)} y1={gH - gPad} x2={sx(adjKm)} y2={sy(adjVmax / 2)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" />
        <text x={sx(adjKm)} y={gH - gPad + 14} textAnchor="middle" fill="#f59e0b" fontSize="8">Km</text>
        {/* Normal curve (when inhibitor active) */}
        {inhibitor !== 'none' && <polyline points={normalCurve.map(p => `${sx(p.s)},${sy(p.v)}`).join(' ')} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />}
        {/* Active curve */}
        <polyline points={curve.map(p => `${sx(p.s)},${sy(p.v)}`).join(' ')} fill="none" stroke="#22c55e" strokeWidth="2.5" />
        {/* Current point */}
        <circle cx={sx(substrate)} cy={sy(rate)} r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
        <text x={gW / 2} y={gH - 5} textAnchor="middle" fill="#64748b" fontSize="9">[S] (mM)</text>
        <text x={10} y={gH / 2} fill="#64748b" fontSize="9" transform={`rotate(-90, 10, ${gH / 2})`}>V (rate)</text>
      </svg>
    </div>
  )

  return <MissionShell title={t('Enzyme Kinetics', 'ಕಿಣ್ವ ಚಲನಶಾಸ್ತ್ರ')} titleEmoji="⚗️" subject="Biology" accentColor="green" gradientFrom="from-green-500" gradientTo="to-emerald-600" steps={steps} currentStep={inhibitor !== 'none' ? 3 : 2} controls={controls} visualization={visualization} observations={observations} />
}
