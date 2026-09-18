import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const discreteHardwareExperiments = [
  {
    num: 1,
    title: 'Time division multiplexing and de-multiplexing using IC 4051',
    description: 'Hardware clock switching (f_clk), 3-channel analog TDM bus, demux sample-and-hold & low-pass reconstruction with IC 4051 pinout & WebAR 3D circuit board.',
    path: '/electronics/tdm',
    icon: '🔀',
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
    icon: '📻',
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
    icon: '📊',
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
    icon: '⚡',
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
    icon: '💡',
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
    icon: '🔦',
    hours: '2 Hours',
    blooms: 'L1, L2, L3',
    hasAR: true,
    tag: 'Laser & NA Bench'
  }
]

const extendedExperiments = [
  { title: 'RC Active Filter Tuning', description: 'Cutoff frequency, Bode magnitude/phase plots and filtered signals', path: '/electronics/rc-filter', icon: '📡', hasAR: true },
  { title: 'Digital Logic Gates Design', description: 'Breadboard circuits with AND, OR, NOT, NAND, XOR IC packages', path: '/electronics/logic-gates', icon: '🔌', hasAR: true },
  { title: 'Operational Amplifier Gain', description: 'Inverting and non-inverting op-amp closed-loop configurations', path: '/electronics/opamp', icon: '🔊', hasAR: true },
  { title: 'Antenna Radiation Patterns', description: 'Dipole and Yagi polar radiation directivity patterns', path: '/electronics/antenna', icon: '📶', hasAR: false }
]

export default function ElectronicsHub() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('part-a')

  return (
    <div className="min-h-[100dvh] bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/20 px-4 py-12">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Engineering Laboratory</span>
            <span>•</span>
            <span>Hardware & WebAR Enabled</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            📡 {t('Electronics & Communication Engineering Lab', 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಸಂವಹನ ಎಂಜಿನಿಯರಿಂಗ್ ಲ್ಯಾಬ್')}
          </h1>
          <p className="text-base sm:text-lg text-emerald-200/80 max-w-3xl leading-relaxed">
            {t(
              'Hands-on university syllabus laboratory experiments featuring discrete hardware kits, IC pinout references, interactive oscilloscopes, and WebAR 3D circuit board inspection.',
              'ವಿಶ್ವವಿದ್ಯಾಲಯ ಪಠ್ಯಕ್ರಮದ ಹಾರ್ಡ್‌ವೇರ್ ಲ್ಯಾಬ್ ಪ್ರಯೋಗಗಳು, IC ಪಿನ್‌ಔಟ್, ಆಸಿಲ್ಲೋಸ್ಕೋಪ್ ಮತ್ತು WebAR 3D ಸರ್ಕ್ಯೂಟ್ ಮಾದರಿಗಳು.'
            )}
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Part – A: 6 Discrete Experiments</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-emerald-400">⏱️</span>
              <span className="text-slate-300">2 Hours / Experiment</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-teal-400">🎯</span>
              <span className="text-slate-300">Bloom's: L1 (Remember), L2 (Understand), L3 (Apply)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-indigo-400">📱</span>
              <span className="text-slate-300">WebAR 3D Hardware Wiring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('part-a')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'part-a'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Part – A: Discrete Hardware Experiments (6)
          </button>
          <button
            onClick={() => setActiveTab('extended')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'extended'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Supplemental Circuit Simulations (4)
          </button>
        </div>

        {activeTab === 'part-a' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Part – A: Discrete Hardware Experiments</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Syllabus Prescribed
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Perform real-time hardware component testing, signal synthesis, and launch WebAR 3D models to examine physical wire connections.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {discreteHardwareExperiments.map((exp) => (
                <Link
                  key={exp.num}
                  to={exp.path}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800/95 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400">
                          {exp.num}
                        </span>
                        <span className="text-xl">{exp.icon}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700/80 text-slate-300 font-mono">
                          {exp.hours}
                        </span>
                        {exp.hasAR && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                            WebAR 3D
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mb-2 leading-snug">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                      {exp.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-teal-300/90 font-mono">
                      <span>Bloom's:</span>
                      <span className="font-semibold text-emerald-400">{exp.blooms}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Enter Lab &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'extended' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Supplemental Circuit Simulations</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Additional analog, RF, and digital foundation modules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
              {extendedExperiments.map((exp, i) => (
                <Link
                  key={i}
                  to={exp.path}
                  className="group p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/90 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{exp.icon}</span>
                      {exp.hasAR && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                          WebAR 3D
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mb-1">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {exp.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-700/50 flex justify-end">
                    <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Open Simulation &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
