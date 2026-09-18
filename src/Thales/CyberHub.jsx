import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import ExperimentCard from '../components/ExperimentCard'
import Footer from '../components/Footer'

const experiments = [
  { title: 'Stateful Firewall Rules', description: 'Configure port filtering, CIDR blocks, and deep packet inspection', path: '/thales/firewall', icon: '🛡️', difficulty: 'Medium', duration: '12 min' },
  { title: 'DDoS Attack Mitigation', description: 'Rate limiting, SYN flood defense, and scrubbing center load balancing', path: '/thales/ddos', icon: '🌊', difficulty: 'Hard', duration: '15 min' },
  { title: 'Encryption Performance', description: 'Benchmark AES, RSA, and ChaCha20 cipher throughput vs key lengths', path: '/thales/encryption', icon: '🔐', difficulty: 'Medium', duration: '10 min' },
  { title: 'Phishing & Ransomware Simulation', description: 'Simulate payload detonation, quarantine response, and backup recovery', path: '/thales/ransomware', icon: '🦠', difficulty: 'Medium', duration: '12 min' },
  { title: 'Red vs Blue Cyber Battle', description: 'Real-time offensive penetration testing vs SOC defensive containment', path: '/thales/red-blue', icon: '⚔️', difficulty: 'Hard', duration: '18 min' },
]

export default function CyberHub() {
  const { t } = useLanguage()

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-cyan-400/20 text-cyan-200 border border-cyan-300/30 px-2 py-0.5 rounded font-mono font-semibold">THALES SPECIALIZED TRACK</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">🛡️ {t('Cybersecurity & Defense Lab', 'ಸೈಬರ್ ಭದ್ರತೆ ಮತ್ತು ರಕ್ಷಣಾ ಲ್ಯಾಬ್')}</h1>
          <p className="text-cyan-100">{t('Real-world defensive engineering, attack surface mitigation, and crypto algorithms', 'ಸೈಬರ್ ರಕ್ಷಣಾ ಎಂಜಿನಿಯರಿಂಗ್ ಮತ್ತು ಕ್ರಿಪ್ಟೋಗ್ರಫಿ')}</p>
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
