import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackgroundPrintedIcons from '../components/BackgroundPrintedIcons'
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
  TestTube2,
  Atom
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
    tag: 'Thermodynamics'
  },
  {
    num: 5,
    title: 'Boyle & Charles Gas State Law',
    description: 'Compress closed gas cylinders, measure isothermal P-V hyperbolas and isobaric V-T linear thermal expansion relations.',
    path: '/chemistry/gas-laws',
    icon: Wind,
    difficulty: 'Easy',
    duration: '10 min',
    hasApparatus: true,
    tag: 'Kinetic Theory'
  }
]

export default function ChemistryHub() {
  const { t } = useLanguage()

  return (
    <div className="relative min-h-[100dvh] bg-[#FAF5EB] text-[#221611] flex flex-col justify-between selection:bg-[#221611] selection:text-[#FAF5EB] font-sans antialiased">
      {/* Printed Scientific Background Icons */}
      <BackgroundPrintedIcons variant="dark" />

      <div className="relative z-10">
        <Navbar />

        {/* Clean Editorial Header */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 pt-8 pb-6 border-b-2 border-[#221611]">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#221611] text-[#A4C93B] text-[11px] font-mono font-bold uppercase tracking-wider mb-3 shadow-[2px_2px_0px_#A4C93B]">
            <Atom size={14} className="text-[#A4C93B]" />
            <span>PUC & College Sciences (+2)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase text-[#221611] tracking-tight">
            {t('Chemistry Virtual Laboratory', 'ರಸಾಯನಶಾಸ್ತ್ರ ವರ್ಚುವಲ್ ಲ್ಯಾಬ್')}
          </h1>
          <p className="text-[#57534e] text-xs sm:text-base mt-2 max-w-2xl font-medium leading-relaxed">
            {t(
              'Conduct interactive volumetric titrations, electrochemistry cells, and chemical equilibrium experiments with realistic drag-and-drop apparatus setup and real-time quantitative analysis.',
              'ನೈಜ ಡ್ರ್ಯಾಗ್ ಮತ್ತು ಡ್ರಾಪ್ ಉಪಕರಣ ಸೆಟಪ್ ಮತ್ತು ಲೈವ್ ಡೇಟಾ ವಿಶ್ಲೇಷಣೆಯೊಂದಿಗೆ ರಸಾಯನಶಾಸ್ತ್ರ ಪ್ರಯೋಗಗಳನ್ನು ನಡೆಸಿ.'
            )}
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm mt-6">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#221611] shadow-[2px_2px_0px_#221611] text-[#221611]">
              <span className="w-2 h-2 rounded-full bg-[#A4C93B]" />
              <span className="font-black text-[#221611]">Experiments:</span> 5 Core Labs
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#221611] shadow-[2px_2px_0px_#221611] text-[#221611]">
              <Clock size={14} className="text-[#221611]" />
              <span className="font-black text-[#221611]">Duration:</span> 10–15 min each
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#221611] shadow-[2px_2px_0px_#221611] text-[#221611]">
              <Layers size={14} className="text-[#221611]" />
              <span className="font-black text-[#221611]">Apparatus:</span> Drag & Drop Bench
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border-2 border-[#221611] shadow-[2px_2px_0px_#221611] text-[#221611]">
              <Target size={14} className="text-[#221611]" />
              <span className="font-black text-[#221611]">Curriculum:</span> CBSE / State Board
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 py-8 lg:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#221611] flex items-center gap-2 uppercase tracking-wide">
                <span>Laboratory Modules</span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#A4C93B] text-[#221611] border border-[#221611]">
                  Interactive
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#57534e] mt-1 font-medium">
                Assemble glassware on the virtual laboratory bench, adjust concentrations and temperatures, and observe real-time reaction kinetics.
              </p>
            </div>
          </div>

          {/* Grid of CurioLabs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chemistryExperiments.map((exp) => {
              const IconComponent = exp.icon
              return (
                <Link
                  key={exp.num}
                  to={exp.path}
                  className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border-2 border-[#221611] shadow-[4px_4px_0px_#221611] hover:shadow-[6px_6px_0px_#221611] hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Card Top */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-[#221611] text-[#A4C93B] font-black flex items-center justify-center text-xs shadow-sm">
                          0{exp.num}
                        </span>
                        <span className="p-2 rounded-xl bg-[#FAF5EB] text-[#221611] border border-[#221611] group-hover:bg-[#A4C93B] transition-colors">
                          <IconComponent size={18} />
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF5EB] border border-[#221611] text-[#221611] font-mono font-bold">
                          {exp.duration}
                        </span>
                        {exp.hasApparatus && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#A4C93B]/20 text-[#221611] font-bold border border-[#A4C93B] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A4C93B]" />
                            Apparatus
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-[#221611] group-hover:text-[#b45309] transition-colors mb-2 leading-snug">
                      {exp.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed line-clamp-3 mb-5 font-medium">
                      {exp.description}
                    </p>
                  </div>

                  {/* Card Bottom */}
                  <div className="pt-4 border-t-2 border-[#221611]/10 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-[#57534e] font-mono">
                      <span>Level:</span>
                      <span className="font-black text-[#221611]">{exp.difficulty}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-[#221611] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Enter Lab <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
