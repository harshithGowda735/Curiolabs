import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import ExperimentCard from '../components/ExperimentCard'
import Footer from '../components/Footer'
const experiments = [
  { title: 'RC Filter Tuning', description: 'Tune cutoff frequency, view Bode plot and filtered signals', path: '/electronics/rc-filter', icon: '📡', difficulty: 'Medium', duration: '12 min', hasAR: true },
  { title: 'Digital Logic Gates', description: 'Build circuits with AND, OR, NOT, NAND, XOR gates', path: '/electronics/logic-gates', icon: '🔌', difficulty: 'Easy', duration: '15 min', hasAR: true },
  { title: 'AM/FM Modulation', description: 'Visualize amplitude and frequency modulation waveforms', path: '/electronics/modulation', icon: '📻', difficulty: 'Medium', duration: '12 min' },
  { title: 'Op-Amp Gain', description: 'Configure inverting/non-inverting amplifier gain', path: '/electronics/opamp', icon: '🔊', difficulty: 'Medium', duration: '12 min', hasAR: true },
  { title: 'Antenna Radiation', description: 'Plot polar radiation patterns with directivity control', path: '/electronics/antenna', icon: '📶', difficulty: 'Hard', duration: '15 min' },
]
export default function ElectronicsHub() {
  const { t } = useLanguage()
  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">📡 {t('Electronics & Communication Lab', 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಲ್ಯಾಬ್')}</h1>
          <p className="text-emerald-100">{t('5 experiments with AR circuit views on supported devices', '5 ಪ್ರಯೋಗಗಳು + AR ಸರ್ಕ್ಯೂಟ್ ವ್ಯೂಗಳು')}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{experiments.map((e, i) => <ExperimentCard key={i} {...e} />)}</div>
      </div>
      <Footer />
    </div>
  )
}
