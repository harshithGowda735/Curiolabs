import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import ExperimentCard from '../components/ExperimentCard'
import Footer from '../components/Footer'

const experiments = [
  { title: 'Flight Avionics Failure', description: 'Simulate pitot-tube icing, dual-sensor disagreement, and backup attitude indicators', path: '/thales/avionics', icon: '✈️', difficulty: 'Hard', duration: '15 min' },
  { title: 'Aircraft Weight & Balance', description: 'Compute Center of Gravity (CG) envelope limits, passenger fuel trim, and longitudinal stability', path: '/thales/weight-balance', icon: '⚖️', difficulty: 'Medium', duration: '12 min' },
  { title: 'Wind Gust Autopilot Control', description: 'Tune fly-by-wire PID dampers against severe turbulent crosswinds and wind shears', path: '/thales/wind-gust', icon: '💨', difficulty: 'Hard', duration: '15 min' },
  { title: 'Jet Thrust vs Altitude', description: 'Model turbofan density altitude thrust lapse, Mach number, and specific fuel consumption', path: '/thales/thrust-altitude', icon: '🚀', difficulty: 'Medium', duration: '12 min' },
  { title: 'Aerodynamic Stall & Recovery', description: 'Angle of Attack (AoA) airflow separation, stick-shaker alerts, and push-forward recovery', path: '/thales/stall-recovery', icon: '🛩️', difficulty: 'Medium', duration: '14 min' },
]

export default function AerospaceHub() {
  const { t } = useLanguage()

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-r from-sky-600 to-indigo-700 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-sky-400/20 text-sky-200 border border-sky-300/30 px-2 py-0.5 rounded font-mono font-semibold">THALES SPECIALIZED TRACK</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">✈️ {t('Aerospace & Flight Systems Lab', 'ಏರೋಸ್ಪೇಸ್ ಮತ್ತು ಫ್ಲೈಟ್ ಸಿಸ್ಟಮ್ಸ್ ಲ್ಯಾಬ್')}</h1>
          <p className="text-sky-100">{t('Avionics redundancy, flight dynamics, jet propulsion, and envelope protection', 'ಫ್ಲೈಟ್ ಡೈನಾಮಿಕ್ಸ್, ಏವಿಯಾನಿಕ್ಸ್ ಮತ್ತು ಎಂಜಿನ್ ಪ್ರೊಪಲ್ಷನ್')}</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {experiments.map((e, i) => (
            <ExperimentCard key={i} {...e} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
