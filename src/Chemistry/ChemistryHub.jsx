import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { 
  FlaskConical, 
  Sparkles, 
  BatteryCharging, 
  Scale, 
  Wind, 
  Clock, 
  Target, 
  Layers,
  ArrowRight,
  TestTube2
} from 'lucide-react'

const chemistryExperiments = [
  {
    num: 1,
    title: 'Acid-Base Neutralization Titration',
    description: 'Assemble titration glassware apparatus (burette, conical flask, white tile, indicator), titrate 0.1M NaOH against HCl, and track pH titration curves.',
    path: '/chemistry/titration',
    icon: FlaskConical,
    difficulty: 'Medium',
    duration: '15 min',
    hasApparatus: true,
    tag: 'Volumetric Analysis'
  },
  {
    num: 2,
    title: 'Fractional Crystallization Rate',
    description: 'Cool supersaturated salt solutions, monitor seed crystal nucleation kinetics, and analyze solubility curve dynamics.',
    path: '/chemistry/crystallization',
    icon: Sparkles,
    difficulty: 'Easy',
    duration: '10 min',
    hasApparatus: true,
    tag: 'Physical Chemistry'
  },
  {
    num: 3,
    title: 'Galvanic Cell & Nernst Electrochemistry',
    description: 'Construct half-cells with Zinc & Copper electrodes, porous salt bridge, and calculate electromotive force (EMF) via the Nernst equation.',
    path: '/chemistry/electrochemistry',
    icon: BatteryCharging,
    difficulty: 'Medium',
    duration: '12 min',
    hasApparatus: true,
    tag: 'Electrochemistry'
  },
  {
    num: 4,
    title: "Chemical Equilibrium & Le Chatelier's",
    description: 'Shift equilibrium position of N2O4 ⇌ 2NO2 and Fe3+ + SCN- complexes by perturbing temperature, pressure, and reactant concentrations.',
    path: '/chemistry/equilibrium',
    icon: Scale,
    difficulty: 'Medium',
    duration: '12 min',
    hasApparatus: true,
    tag: 'Equilibrium Kinetics'
  },
  {
    num: 5,
    title: 'Ideal Gas Laws (Boyle & Charles)',
    description: 'Simulate thermodynamic gas state transformations (P·V = n·R·T) inside a piston chamber with variable temperature and pressure.',
    path: '/chemistry/gas-laws',
    icon: Wind,
    difficulty: 'Easy',
    duration: '10 min',
    hasApparatus: false,
    tag: 'Thermodynamics'
  }
]

export default function ChemistryHub() {
  const { t } = useLanguage()

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      <Navbar />

      {/* Hero Section - Clean Light Apple Style */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200/80 px-4 py-12 lg:py-16 shadow-xs">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50/40 via-white to-white pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-100/50 rounded-full blur-3xl pointer-events-none -z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Interactive Virtual Laboratory</span>
            <span>•</span>
            <span>Drag & Drop Apparatus Enabled</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
            {t('Chemistry Virtual Laboratory', 'ರಸಾಯನಶಾಸ್ತ್ರ ವರ್ಚುವಲ್ ಲ್ಯಾಬ್')}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed mb-8">
            {t(
              'Conduct interactive volumetric titrations, electrochemistry cells, and chemical equilibrium experiments with realistic drag-and-drop apparatus setup and real-time quantitative analysis.',
              'ನೈಜ ಡ್ರ್ಯಾಗ್ ಮತ್ತು ಡ್ರಾಪ್ ಉಪಕರಣ ಸೆಟಪ್ ಮತ್ತು ಲೈವ್ ಡೇಟಾ ವಿಶ್ಲೇಷಣೆಯೊಂದಿಗೆ ರಸಾಯನಶಾಸ್ತ್ರ ಪ್ರಯೋಗಗಳನ್ನು ನಡೆಸಿ.'
            )}
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="font-semibold text-slate-900">Experiments:</span> 5 Core Labs
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
              <Clock size={14} className="text-rose-600" />
              <span className="font-semibold text-slate-900">Duration:</span> 10–15 min each
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
              <Layers size={14} className="text-pink-600" />
              <span className="font-semibold text-slate-900">Apparatus:</span> Drag & Drop Setup
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
              <Target size={14} className="text-amber-600" />
              <span className="font-semibold text-slate-900">Curriculum:</span> PUC & Foundation
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>Laboratory Experiments</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Interactive Modules
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Assemble glass apparatus on the virtual laboratory bench, adjust concentrations and temperatures, and observe real-time reaction kinetics.
            </p>
          </div>
        </div>

        {/* Grid of Clean White Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {chemistryExperiments.map((exp) => {
            const IconComponent = exp.icon
            return (
              <Link
                key={exp.num}
                to={exp.path}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card Top */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center justify-center text-sm shadow-2xs">
                        {exp.num}
                      </span>
                      <span className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-100 group-hover:text-rose-600 group-hover:bg-rose-50 transition-colors">
                        <IconComponent size={18} />
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {exp.duration}
                      </span>
                      {exp.hasApparatus && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Apparatus
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors mb-2 leading-snug">
                    {exp.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-5">
                    {exp.description}
                  </p>
                </div>

                {/* Card Bottom */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <span>Level:</span>
                    <span className="font-semibold text-rose-700">{exp.difficulty}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-rose-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Enter Lab <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <Footer />
    </div>
  )
}
