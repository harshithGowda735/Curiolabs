import { Link } from 'react-router-dom'
import { Award, BookOpen, TrendingUp, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import DomainCard from '../components/DomainCard'
import Footer from '../components/Footer'

const domains = [
  { emoji: '⚡', title: 'Physics', description: '5 experiments — Ohm\'s law, pendulum, projectile motion & more', path: '/physics', accentColor: 'blue', count: 5 },
  { emoji: '🧪', title: 'Chemistry', description: '5 experiments — Titration, gas laws, electrochemistry & more', path: '/chemistry', accentColor: 'pink', count: 5 },
  { emoji: '🧬', title: 'Biology', description: '5 experiments — Photosynthesis, cell division, DNA & more', path: '/biology', accentColor: 'green', count: 5 },
  { emoji: '📡', title: 'Electronics & Comm', description: '5 experiments + AR circuit views', path: '/electronics', accentColor: 'emerald', count: 5 },
  { emoji: '💻', title: 'Computer Science', description: '5 experiments — Sorting, scheduling, pathfinding', path: '/cs', accentColor: 'violet', count: 5 },
  { emoji: '🤖', title: 'Robotics', description: '5 experiments + AR robotic arm views', path: '/robotics', accentColor: 'amber', count: 5 },
  { emoji: '🛡️', title: 'Cyber Security', description: '5 experiments — Firewall, DDoS, encryption', path: '/cyber', accentColor: 'cyan', count: 5 },
  { emoji: '🚀', title: 'Aerospace', description: '5 experiments — Avionics, thrust, stall recovery', path: '/aerospace', accentColor: 'sky', count: 5 },
]

export default function StudentDashboard() {
  const { currentUser } = useAuth()
  const { t } = useLanguage()
  const name = currentUser?.displayName || 'Student'

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <Navbar />

      {/* Welcome section */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
            {t(`Welcome back, ${name}! 👋`, `ಮರಳಿ ಸ್ವಾಗತ, ${name}! 👋`)}
          </h1>
          <p className="text-teal-100">{t('Continue your lab experiments or start something new.', 'ನಿಮ್ಮ ಲ್ಯಾಬ್ ಪ್ರಯೋಗಗಳನ್ನು ಮುಂದುವರಿಸಿ ಅಥವಾ ಹೊಸದನ್ನು ಪ್ರಾರಂಭಿಸಿ.')}</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: t('Labs Completed', 'ಪೂರ್ಣಗೊಂಡ ಲ್ಯಾಬ್'), value: '12', color: 'text-blue-600 bg-blue-50' },
            { icon: TrendingUp, label: t('Hours Spent', 'ಕಳೆದ ಗಂಟೆಗಳು'), value: '8.5', color: 'text-emerald-600 bg-emerald-50' },
            { icon: Award, label: t('Certificates', 'ಪ್ರಮಾಣಪತ್ರಗಳು'), value: '3', color: 'text-amber-600 bg-amber-50' },
            { icon: Zap, label: t('Streak', 'ಸ್ಟ್ರೀಕ್'), value: '5 days', color: 'text-purple-600 bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                <stat.icon size={16} />
              </div>
              <p className="text-2xl font-display font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Domain grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-display font-bold text-gray-800 mb-4">
          {t('Lab Domains', 'ಲ್ಯಾಬ್ ಡೊಮೇನ್‌ಗಳು')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {domains.map((d, i) => (
            <DomainCard key={i} {...d} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
