import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import ExperimentCard from '../components/ExperimentCard'
import Footer from '../components/Footer'
import { Zap, Compass, Activity, Clock, Target, Sun, Ruler, Atom } from 'lucide-react'

const experiments = [
  { 
    title: "Ohm's Law", 
    description: 'Explore V=IR relationship with variable resistance and real-time voltage sweep', 
    path: '/physics/ohms-law', 
    icon: <Zap size={22} className="text-[#221611]" />, 
    difficulty: 'Easy', 
    duration: '10 min' 
  },
  { 
    title: 'Magnetic Hysteresis', 
    description: 'Plot magnetic B-H hysteresis loops, observe coercivity and retentivity curves', 
    path: '/physics/hysteresis', 
    icon: <Compass size={22} className="text-[#221611]" />, 
    difficulty: 'Medium', 
    duration: '15 min' 
  },
  { 
    title: 'Clipping & Clamping', 
    description: 'Diode circuits that shape AC waveforms with dynamic bias control', 
    path: '/physics/clipping-clamping', 
    icon: <Activity size={22} className="text-[#221611]" />, 
    difficulty: 'Medium', 
    duration: '12 min' 
  },
  { 
    title: 'Simple Pendulum', 
    description: 'Measure oscillation period vs string length to verify acceleration due to gravity (g)', 
    path: '/physics/pendulum', 
    icon: <Clock size={22} className="text-[#221611]" />, 
    difficulty: 'Easy', 
    duration: '10 min' 
  },
  { 
    title: 'Projectile Motion', 
    description: 'Adjust launch angle and muzzle velocity to compute kinematic parabolic trajectories', 
    path: '/physics/projectile', 
    icon: <Target size={22} className="text-[#221611]" />, 
    difficulty: 'Easy', 
    duration: '10 min' 
  },
  { 
    title: "Young's Double Slit", 
    description: 'Align a monochromatic optical bench and measure live wave interference fringes', 
    path: '/physics/double-slit', 
    icon: <Sun size={22} className="text-[#221611]" />, 
    difficulty: 'Medium', 
    duration: '15 min' 
  },
  { 
    title: 'Vernier Caliper', 
    description: 'Measure precision objects, record vernier trials, and determine instrument zero error', 
    path: '/physics/vernier-caliper', 
    icon: <Ruler size={22} className="text-[#221611]" />, 
    difficulty: 'Medium', 
    duration: '15 min' 
  },
]

export default function PhysicsHub() {
  const { t } = useLanguage()

  return (
    <div className="min-h-[100dvh] bg-[#FAF5EB] text-[#221611] flex flex-col justify-between selection:bg-[#221611] selection:text-[#FAF5EB]">
      <div>
        <Navbar />

        {/* Clean Editorial Header (replaces garish blue banner) */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 pt-8 pb-6 border-b border-[#E2D7C5]">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAE0CD] text-[#221611] text-[11px] font-mono font-bold uppercase tracking-wider mb-3">
            <Atom size={14} className="text-[#754F40]" />
            <span>PUC Sciences (+2)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase text-[#221611] tracking-tight">
            {t('Physics Virtual Laboratory', 'ಭೌತಶಾಸ್ತ್ರ ವರ್ಚುವಲ್ ಲ್ಯಾಬ್')}
          </h1>
          <p className="text-[#6B564A] text-xs sm:text-base mt-2 max-w-2xl font-medium leading-relaxed">
            {t(
              'Interactive experiments exploring electromagnetism, wave interference, kinematics, and semiconductor dynamics.',
              'ವಿದ್ಯುತ್ಕಾಂತೀಯತೆ ಮತ್ತು ಅರೆವಾಹಕಗಳ ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗಗಳು.'
            )}
          </p>
        </div>

        {/* Experiments Grid */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {experiments.map((exp, i) => (
              <ExperimentCard key={i} {...exp} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
