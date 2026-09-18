import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import ExperimentCard from '../components/ExperimentCard'
import Footer from '../components/Footer'

const experiments = [
  { title: "Ohm's Law", description: 'Explore V=IR relationship with variable resistance and voltage', path: '/physics/ohms-law', icon: '⚡', difficulty: 'Easy', duration: '10 min' },
  { title: 'Magnetic Hysteresis', description: 'Plot B-H curves, observe coercivity and retentivity', path: '/physics/hysteresis', icon: '🧲', difficulty: 'Medium', duration: '15 min' },
  { title: 'Clipping & Clamping', description: 'Diode circuits that shape AC waveforms', path: '/physics/clipping-clamping', icon: '📊', difficulty: 'Medium', duration: '12 min' },
  { title: 'Simple Pendulum', description: 'Measure period vs length, verify T=2π√(L/g)', path: '/physics/pendulum', icon: '🔄', difficulty: 'Easy', duration: '10 min' },
  { title: 'Projectile Motion', description: 'Launch angle, velocity — track trajectory in real time', path: '/physics/projectile', icon: '🎯', difficulty: 'Easy', duration: '10 min' },
]

export default function PhysicsHub() {
  const { t } = useLanguage()
  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">⚡ {t('Physics Lab', 'ಭೌತಶಾಸ್ತ್ರ ಲ್ಯಾಬ್')}</h1>
          <p className="text-blue-100">{t('5 interactive experiments exploring fundamental physics', '5 ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗಗಳು')}</p>
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
