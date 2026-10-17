import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import ExperimentCard from '../components/ExperimentCard'
import Footer from '../components/Footer'
import { Plane, Scale, Wind, Rocket, Compass } from 'lucide-react'

const experiments = [
  { 
    title: 'Flight Avionics Failure', 
    description: 'Simulate pitot-tube icing, dual-sensor disagreement, and backup attitude indicators', 
    path: '/thales/avionics', 
    icon: <Plane size={22} className="text-[#221611]" />, 
    difficulty: 'Hard', 
    duration: '15 min' 
  },
  { 
    title: 'Aircraft Weight & Balance', 
    description: 'Compute Center of Gravity (CG) envelope limits, passenger fuel trim, and longitudinal stability', 
    path: '/thales/weight-balance', 
    icon: <Scale size={22} className="text-[#221611]" />, 
    difficulty: 'Medium', 
    duration: '12 min' 
  },
  { 
    title: 'Wind Gust Autopilot Control', 
    description: 'Tune fly-by-wire PID dampers against severe turbulent crosswinds and wind shears', 
    path: '/thales/wind-gust', 
    icon: <Wind size={22} className="text-[#221611]" />, 
    difficulty: 'Hard', 
    duration: '15 min' 
  },
  { 
    title: 'Jet Thrust vs Altitude', 
    description: 'Model turbofan density altitude thrust lapse, Mach number, and specific fuel consumption', 
    path: '/thales/thrust-altitude', 
    icon: <Rocket size={22} className="text-[#221611]" />, 
    difficulty: 'Medium', 
    duration: '12 min' 
  },
  { 
    title: 'Aerodynamic Stall & Recovery', 
    description: 'Angle of Attack (AoA) airflow separation, stick-shaker alerts, and push-forward recovery', 
    path: '/thales/stall-recovery', 
    icon: <Compass size={22} className="text-[#221611]" />, 
    difficulty: 'Medium', 
    duration: '14 min' 
  },
]

export default function AerospaceHub() {
  const { t } = useLanguage()

  return (
    <div className="min-h-[100dvh] bg-[#FAF5EB] text-[#221611] flex flex-col justify-between selection:bg-[#221611] selection:text-[#FAF5EB]">
      <div>
        <Navbar />

        {/* Clean Editorial Header */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 pt-8 pb-6 border-b border-[#E2D7C5]">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAE0CD] text-[#221611] text-[11px] font-mono font-bold uppercase tracking-wider mb-3">
            <Plane size={14} className="text-[#754F40]" />
            <span>Undergraduate Engineering (B.Tech)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase text-[#221611] tracking-tight">
            {t('Aerospace & Flight Systems Lab', 'ಏರೋಸ್ಪೇಸ್ ಮತ್ತು ಫ್ಲೈಟ್ ಸಿಸ್ಟಮ್ಸ್ ಲ್ಯಾಬ್')}
          </h1>
          <p className="text-[#6B564A] text-xs sm:text-base mt-2 max-w-2xl font-medium leading-relaxed">
            {t(
              'Avionics redundancy, flight dynamics, jet propulsion, and aerodynamic stall envelope protection.',
              'ಫ್ಲೈಟ್ ಡೈನಾಮಿಕ್ಸ್, ಏವಿಯಾನಿಕ್ಸ್ ಮತ್ತು ಎಂಜಿನ್ ಪ್ರೊಪಲ್ಷನ್.'
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
