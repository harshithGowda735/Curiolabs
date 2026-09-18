import { useState } from 'react'
import MissionShell from '../components/MissionShell'
import LabeledSlider from '../components/LabeledSlider'
import { useLanguage } from '../contexts/LanguageContext'
const steps = [{ title: 'Select Specimen', description: 'Choose a specimen to view under the microscope' }, { title: 'Adjust Magnification', description: 'Change objective lens magnification' }, { title: 'Focus', description: 'Use the fine focus slider for sharp image' }, { title: 'Apply Stain', description: 'Choose a staining technique to highlight structures' }]
const observations = ['Higher magnification reveals finer structures but reduces field of view', 'Gram staining differentiates bacteria into Gram-positive (purple) and Gram-negative (pink)', 'Proper focusing requires both coarse and fine adjustment', 'Different stains highlight different cellular components']
const specimens = [
  { name: 'Onion Epidermis', structures: ['Cell Wall', 'Nucleus', 'Cytoplasm', 'Vacuole'], color: '#bbf7d0' },
  { name: 'Cheek Cells', structures: ['Cell Membrane', 'Nucleus', 'Cytoplasm'], color: '#fecdd3' },
  { name: 'Blood Smear', structures: ['RBC', 'WBC', 'Platelets'], color: '#fca5a5' },
  { name: 'Leaf Cross-Section', structures: ['Epidermis', 'Palisade', 'Spongy Mesophyll', 'Vascular Bundle'], color: '#a7f3d0' },
]
const stains = ['None', 'Iodine', 'Methylene Blue', 'Gram Stain', 'H&E']

export default function MicroscopyTechniques() {
  const { t } = useLanguage()
  const [specimenIdx, setSpecimenIdx] = useState(0)
  const [magnification, setMagnification] = useState(10)
  const [focus, setFocus] = useState(50)
  const [stainIdx, setStainIdx] = useState(0)
  const specimen = specimens[specimenIdx]
  const blurAmount = Math.abs(focus - 50) / 10
  const stainColors = { 'None': 'transparent', 'Iodine': '#92400e33', 'Methylene Blue': '#1e40af33', 'Gram Stain': '#6b21a833', 'H&E': '#be123c33' }

  const controls = (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">🔬 {t('Microscope Controls', 'ಸೂಕ್ಷ್ಮದರ್ಶಕ ನಿಯಂತ್ರಣಗಳು')}</h3>
        <p className="text-sm font-medium text-gray-600 mb-2">{t('Specimen', 'ಮಾದರಿ')}</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {specimens.map((s, i) => (
            <button key={i} onClick={() => setSpecimenIdx(i)} className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${specimenIdx === i ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{s.name}</button>
          ))}
        </div>
        <LabeledSlider label={t('Magnification', 'ವರ್ಧನೆ')} value={magnification} onChange={setMagnification} min={4} max={100} step={1} unit="x" accentColor="#22c55e" />
        <div className="mt-3"><LabeledSlider label={t('Fine Focus', 'ಸೂಕ್ಷ್ಮ ಫೋಕಸ್')} value={focus} onChange={setFocus} min={0} max={100} step={1} unit="" accentColor="#3b82f6" /></div>
        <p className="text-sm font-medium text-gray-600 mt-3 mb-2">{t('Staining', 'ಬಣ್ಣ')}</p>
        <div className="flex flex-wrap gap-2">
          {stains.map((s, i) => (
            <button key={i} onClick={() => setStainIdx(i)} className={`py-1 px-3 rounded-lg text-xs font-semibold transition-colors ${stainIdx === i ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-display font-bold text-gray-800 mb-2">📋 {t('Visible Structures', 'ಗೋಚರ ರಚನೆಗಳು')}</h3>
        <div className="flex flex-wrap gap-2">
          {specimen.structures.map((s, i) => (
            <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${magnification > (i + 1) * 10 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {magnification > (i + 1) * 10 ? '✓' : '?'} {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  const visualization = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-display font-bold text-gray-800 mb-3">{t('Microscope View', 'ಸೂಕ್ಷ್ಮದರ್ಶಕ ನೋಟ')}: {magnification}x</h3>
      <div className="relative aspect-square max-w-md mx-auto rounded-full overflow-hidden border-4 border-gray-800" style={{ filter: `blur(${blurAmount}px)` }}>
        <svg viewBox="0 0 300 300" className="w-full h-full" style={{ background: specimen.color }}>
          {/* Stain overlay */}
          <rect width="300" height="300" fill={stainColors[stains[stainIdx]]} />
          {/* Cells */}
          {Array.from({ length: Math.min(magnification * 2, 60) }).map((_, i) => {
            const cx = 30 + (i % 8) * 35 + (Math.floor(i / 8) % 2) * 17
            const cy = 20 + Math.floor(i / 8) * 38
            const size = magnification > 40 ? 18 : magnification > 20 ? 14 : 10
            return (
              <g key={i}>
                <ellipse cx={cx} cy={cy} rx={size} ry={size * 0.85} fill={specimen.color} stroke="#059669" strokeWidth="0.8" opacity="0.8" />
                {magnification > 20 && <circle cx={cx} cy={cy} r={size * 0.3} fill="#1e40af" opacity="0.6" />}
                {magnification > 60 && <circle cx={cx + 2} cy={cy - 2} r={size * 0.1} fill="#7c3aed" opacity="0.5" />}
              </g>
            )
          })}
        </svg>
      </div>
      <p className="text-xs text-center text-gray-400 mt-2">{t('Adjust fine focus to 50 for sharpest image', 'ತೀಕ್ಷ್ಣ ಚಿತ್ರಕ್ಕಾಗಿ ಫೋಕಸ್ ಅನ್ನು 50 ಕ್ಕೆ ಹೊಂದಿಸಿ')}</p>
    </div>
  )

  return <MissionShell title={t('Microscopy Techniques', 'ಸೂಕ್ಷ್ಮದರ್ಶಕ ತಂತ್ರಗಳು')} titleEmoji="🔬" subject="Biology" accentColor="green" gradientFrom="from-green-500" gradientTo="to-emerald-600" steps={steps} currentStep={stainIdx > 0 ? 3 : magnification > 10 ? 1 : 0} controls={controls} visualization={visualization} observations={observations} />
}
