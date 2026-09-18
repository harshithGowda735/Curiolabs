import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import ExperimentCard from '../components/ExperimentCard'
import Footer from '../components/Footer'
const experiments = [
  { title: 'Photosynthesis', description: 'Measure O₂ production rate vs light intensity and temperature', path: '/biology/photosynthesis', icon: '🌿', difficulty: 'Medium', duration: '15 min' },
  { title: 'Microscopy Techniques', description: 'Virtual microscope with zoom, focus, and staining options', path: '/biology/microscopy', icon: '🔬', difficulty: 'Easy', duration: '10 min' },
  { title: 'Cell Division (Mitosis)', description: 'Step through mitosis phases with interactive controls', path: '/biology/cell-division', icon: '🧫', difficulty: 'Medium', duration: '12 min' },
  { title: 'DNA Replication', description: 'Watch helicase and polymerase replicate DNA step by step', path: '/biology/dna-replication', icon: '🧬', difficulty: 'Medium', duration: '15 min' },
  { title: 'Enzyme Kinetics', description: 'Explore Michaelis-Menten curve, Vmax and Km', path: '/biology/enzymes', icon: '⚗️', difficulty: 'Hard', duration: '15 min' },
]
export default function BiologyHub() {
  const { t } = useLanguage()
  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">🧬 {t('Biology Lab', 'ಜೀವಶಾಸ್ತ್ರ ಲ್ಯಾಬ್')}</h1>
          <p className="text-green-100">{t('5 interactive experiments in life sciences', '5 ಜೀವ ವಿಜ್ಞಾನ ಪ್ರಯೋಗಗಳು')}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiments.map((exp, i) => <ExperimentCard key={i} {...exp} />)}
        </div>
      </div>
      <Footer />
    </div>
  )
}
