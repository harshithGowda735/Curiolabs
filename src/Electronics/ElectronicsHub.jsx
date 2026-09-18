import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { 
  Radio, 
  Layers, 
  Activity, 
  Zap, 
  Network, 
  Crosshair, 
  Sliders, 
  Cpu, 
  Volume2, 
  Wifi, 
  Clock, 
  Target, 
  Smartphone,
  ArrowRight
} from 'lucide-react'

const discreteHardwareExperiments = [
  {
    num: 1,
    title: 'Time division multiplexing and de-multiplexing using IC 4051',
    description: 'Hardware clock switching (f_clk), 3-channel analog TDM bus, demux sample-and-hold & low-pass reconstruction with IC 4051 pinout & WebAR 3D circuit board.',
    path: '/electronics/tdm',
    icon: Layers,
    hours: '2 Hours',
    blooms: 'L1, L2, L3',
    hasAR: true,
    tag: 'IC 4051 MUX/DEMUX'
  },
  {
    num: 2,
    title: 'Generation and detection of standard Amplitude modulation',
    description: 'Analog multiplier standard AM waveform generation, envelope detector (1N4148 diode + RC filter), modulation index μ (0-1.5) & diagonal clipping detection.',
    path: '/electronics/am-detection',
    icon: Radio,
    hours: '2 Hours',
    blooms: 'L1, L2, L3',
    hasAR: true,
    tag: 'Envelope Detector'
  },
  {
    num: 3,
    title: 'Generation and detection of Pulse Amplitude modulation',
    description: 'Flat-top vs Natural PAM switching, Nyquist sampling criteria (fs ≥ 2fm), spectral aliasing analysis and 4th-order Butterworth LPF demodulation.',
    path: '/electronics/pam',
    icon: Activity,
    hours: '2 Hours',
    blooms: 'L1, L2, L3',
    hasAR: true,
    tag: 'PAM Mod/Demod'
  },
  {
    num: 4,
    title: 'Pre-Emphasis and De-Emphasis Circuits',
    description: 'High-frequency noise immunity circuits with 75µs / 50µs time constants, +6 dB/octave lead network boost & -6 dB/octave lag network de-emphasis Bode plot.',
    path: '/electronics/pre-emphasis',
    icon: Zap,
    hours: '2 Hours',
    blooms: 'L1, L2, L3',
    hasAR: true,
    tag: 'Noise Immunity'
  },
  {
    num: 5,
    title: 'Coupling and bending loss in optical fiber communication',
    description: 'Mandrel wrap macro-bending loss vs bend radius R, turn count, axial/angular fiber coupling offset and cladding leakage raytracing with WebAR optical bench.',
    path: '/electronics/fiber-bending-loss',
    icon: Network,
    hours: '2 Hours',
    blooms: 'L1, L2, L3',
    hasAR: true,
    tag: 'Fiber Optics'
  },
  {
    num: 6,
    title: 'Attenuation loss and numerical aperture in optical communication',
    description: 'Light cone divergence angle θ_a, screen distance L vs spot diameter W, acceptance angle NA calculation and cut-back fiber attenuation (dB/km).',
    path: '/electronics/numerical-aperture',
    icon: Crosshair,
    hours: '2 Hours',
    blooms: 'L1, L2, L3',
    hasAR: true,
    tag: 'Laser & NA Bench'
  }
]

const extendedExperiments = [
  { title: 'RC Active Filter Tuning', description: 'Cutoff frequency, Bode magnitude/phase plots and filtered signals', path: '/electronics/rc-filter', icon: Sliders, hasAR: true },
  { title: 'Digital Logic Gates Design', description: 'Breadboard circuits with AND, OR, NOT, NAND, XOR IC packages', path: '/electronics/logic-gates', icon: Cpu, hasAR: true },
  { title: 'Operational Amplifier Gain', description: 'Inverting and non-inverting op-amp closed-loop configurations', path: '/electronics/opamp', icon: Volume2, hasAR: true },
  { title: 'Antenna Radiation Patterns', description: 'Dipole and Yagi polar radiation directivity patterns', path: '/electronics/antenna', icon: Wifi, hasAR: false }
]

export default function ElectronicsHub() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('part-a')

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar />

      {/* Hero Section - Clean Light Apple Style (Zero Emojis) */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200/80 px-4 py-12 lg:py-16 shadow-xs">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/40 via-white to-white pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-4 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Engineering Laboratory</span>
            <span>•</span>
            <span>Hardware & WebAR Enabled</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
            {t('Electronics & Communication Engineering Lab', 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಸಂವಹನ ಎಂಜಿನಿಯರಿಂಗ್ ಲ್ಯಾಬ್')}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl leading-relaxed mb-8">
            {t(
              'Hands-on university syllabus laboratory experiments featuring discrete hardware kits, IC pinout references, interactive oscilloscopes, and WebAR 3D circuit board inspection.',
              'ವಿಶ್ವವಿದ್ಯಾಲಯ ಪಠ್ಯಕ್ರಮದ ಹಾರ್ಡ್‌ವೇರ್ ಲ್ಯಾಬ್ ಪ್ರಯೋಗಗಳು, IC ಪಿನ್‌ಔಟ್, ಆಸಿಲ್ಲೋಸ್ಕೋಪ್ ಮತ್ತು WebAR 3D ಸರ್ಕ್ಯೂಟ್ ಮಾದರಿಗಳು.'
            )}
          </p>

          {/* Quick Metrics Bar - Clean Light Pills with Professional Icons */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-900">Part – A:</span> 6 Discrete Experiments
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
              <Clock size={14} className="text-emerald-600" />
              <span className="font-semibold text-slate-900">Duration:</span> 2 Hours / Lab
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
              <Target size={14} className="text-teal-600" />
              <span className="font-semibold text-slate-900">Bloom's:</span> L1, L2, L3
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-slate-700">
              <Smartphone size={14} className="text-indigo-600" />
              <span className="font-semibold text-slate-900">WebAR 3D:</span> Circuit Wiring
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-10 flex-1 w-full">
        {/* iOS-Style Segmented Control Tabs */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl max-w-fit mb-8 shadow-2xs">
          <button
            onClick={() => setActiveTab('part-a')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'part-a'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Part – A: Discrete Hardware Experiments (6)
          </button>
          <button
            onClick={() => setActiveTab('extended')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'extended'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Supplemental Circuit Simulations (4)
          </button>
        </div>

        {activeTab === 'part-a' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span>Part – A: Discrete Hardware Experiments</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Syllabus Prescribed
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Perform real-time hardware component testing, signal synthesis, and launch WebAR 3D models to inspect physical circuit wiring.
                </p>
              </div>
            </div>

            {/* Grid of Clean White Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {discreteHardwareExperiments.map((exp) => {
                const IconComponent = exp.icon
                return (
                  <Link
                    key={exp.num}
                    to={exp.path}
                    className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Card Top */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center justify-center text-sm shadow-2xs">
                            {exp.num}
                          </span>
                          <span className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-100 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                            <IconComponent size={18} />
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                            {exp.hours}
                          </span>
                          {exp.hasAR && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              WebAR 3D
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 leading-snug">
                        {exp.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-5">
                        {exp.description}
                      </p>
                    </div>

                    {/* Card Bottom */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <span>Bloom's:</span>
                        <span className="font-semibold text-emerald-700">{exp.blooms}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Enter Lab <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'extended' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Supplemental Circuit Simulations</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Additional analog, RF, and digital foundation modules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
              {extendedExperiments.map((exp, i) => {
                const IconComponent = exp.icon
                return (
                  <Link
                    key={i}
                    to={exp.path}
                    className="group p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-100 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                          <IconComponent size={20} />
                        </span>
                        {exp.hasAR && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            WebAR 3D
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
                        {exp.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                        {exp.description}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <span className="text-xs sm:text-sm font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Open Simulation <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
