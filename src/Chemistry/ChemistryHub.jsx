import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import ExperimentCard from '../components/ExperimentCard'
import Footer from '../components/Footer'

const experiments = [
  { title: 'Acid-Base Titration', description: 'Titrate NaOH against HCl, track pH curve and equivalence point', path: '/chemistry/titration', icon: '🧪', difficulty: 'Medium', duration: '15 min' },
  { title: 'Crystallization', description: 'Cool a supersaturated solution and grow crystals', path: '/chemistry/crystallization', icon: '💎', difficulty: 'Easy', duration: '10 min' },
  { title: 'Electrochemistry', description: 'Build a galvanic cell and measure EMF', path: '/chemistry/electrochemistry', icon: '🔋', difficulty: 'Medium', duration: '12 min' },
  { title: 'Chemical Equilibrium', description: "Explore Le Chatelier's principle with concentration and temperature", path: '/chemistry/equilibrium', icon: '⚖️', difficulty: 'Medium', duration: '12 min' },
  { title: 'Gas Laws', description: 'PV=nRT — animate a piston with pressure, volume, and temperature', path: '/chemistry/gas-laws', icon: '💨', difficulty: 'Easy', duration: '10 min' },
]

export default function ChemistryHub() {
  const { t } = useLanguage()
  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">🧪 {t('Chemistry Lab', 'ರಸಾಯನಶಾಸ್ತ್ರ ಲ್ಯಾಬ್')}</h1>
          <p className="text-pink-100">{t('5 interactive experiments exploring chemical reactions and properties', '5 ಸಂವಾದಾತ್ಮಕ ರಾಸಾಯನಿಕ ಪ್ರಯೋಗಗಳು')}</p>
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
