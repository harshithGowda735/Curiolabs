import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import ExperimentCard from '../components/ExperimentCard'
import Footer from '../components/Footer'
import { ShieldCheck, Waves, Lock, Bug, Swords } from 'lucide-react'

const experiments = [
  { 
    title: 'Stateful Firewall Rules', 
    description: 'Configure port filtering, CIDR blocks, and deep packet inspection', 
    path: '/cyber/firewall', 
    icon: <ShieldCheck size={22} className="text-[#221611]" />, 
    difficulty: 'Medium', 
    duration: '12 min' 
  },
  { 
    title: 'DDoS Attack Mitigation', 
    description: 'Rate limiting, SYN flood defense, and scrubbing center load balancing', 
    path: '/cyber/ddos', 
    icon: <Waves size={22} className="text-[#221611]" />, 
    difficulty: 'Hard', 
    duration: '15 min' 
  },
  { 
    title: 'Encryption Performance', 
    description: 'Benchmark AES, RSA, and ChaCha20 cipher throughput vs key lengths', 
    path: '/cyber/encryption', 
    icon: <Lock size={22} className="text-[#221611]" />, 
    difficulty: 'Medium', 
    duration: '10 min' 
  },
  { 
    title: 'Phishing & Ransomware Simulation', 
    description: 'Simulate payload detonation, quarantine response, and backup recovery', 
    path: '/cyber/ransomware', 
    icon: <Bug size={22} className="text-[#221611]" />, 
    difficulty: 'Medium', 
    duration: '12 min' 
  },
  { 
    title: 'Red vs Blue Cyber Battle', 
    description: 'Real-time offensive penetration testing vs SOC defensive containment', 
    path: '/cyber/red-blue', 
    icon: <Swords size={22} className="text-[#221611]" />, 
    difficulty: 'Hard', 
    duration: '18 min' 
  },
]

export default function CyberHub() {
  const { t } = useLanguage()

  return (
    <div className="min-h-[100dvh] bg-[#FAF5EB] text-[#221611] flex flex-col justify-between selection:bg-[#221611] selection:text-[#FAF5EB]">
      <div>
        <Navbar />

        {/* Clean Editorial Header */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 pt-8 pb-6 border-b border-[#E2D7C5]">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAE0CD] text-[#221611] text-[11px] font-mono font-bold uppercase tracking-wider mb-3">
            <ShieldCheck size={14} className="text-[#754F40]" />
            <span>Undergraduate Engineering (B.Tech)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase text-[#221611] tracking-tight">
            {t('Cybersecurity & Defense Lab', 'ಸೈಬರ್ ಭದ್ರತೆ ಮತ್ತು ರಕ್ಷಣಾ ಲ್ಯಾಬ್')}
          </h1>
          <p className="text-[#6B564A] text-xs sm:text-base mt-2 max-w-2xl font-medium leading-relaxed">
            {t(
              'Real-world defensive engineering, attack surface mitigation, stateful firewalling, and cryptographic benchmarking.',
              'ಸೈಬರ್ ರಕ್ಷಣಾ ಎಂಜಿನಿಯರಿಂಗ್ ಮತ್ತು ಕ್ರಿಪ್ಟೋಗ್ರಫಿ.'
            )}
          </p>
        </div>

        {/* Experiments Grid */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {experiments.map((e, i) => (
              <ExperimentCard key={i} {...e} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
