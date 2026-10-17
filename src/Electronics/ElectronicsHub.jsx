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
  ArrowRight,
  CircuitBoard
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
    <div className="min-h-[100dvh] bg-[#FAF5EB] text-[#221611] flex flex-col justify-between selection:bg-[#221611] selection:text-[#FAF5EB]">
      <div>
        <Navbar />

        {/* Clean Editorial Header */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 pt-8 pb-6 border-b border-[#E2D7C5]">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAE0CD] text-[#221611] text-[11px] font-mono font-bold uppercase tracking-wider mb-3">
            <CircuitBoard size={14} className="text-[#754F40]" />
            <span>Undergraduate Engineering (B.Tech)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase text-[#221611] tracking-tight">
            {t('Electronics & Communication Lab', 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಸಂವಹನ ಲ್ಯಾಬ್')}
          </h1>
          <p className="text-[#6B564A] text-xs sm:text-base mt-2 max-w-2xl font-medium leading-relaxed">
            {t(
              'Perform real-time discrete hardware testing, signal modulation synthesis, and launch WebAR 3D models to inspect physical circuit wiring.',
              'ನೈಜ-ಸಮಯದ ಹಾರ್ಡ್‌ವೇರ್ ಪರೀಕ್ಷೆ ಮತ್ತು WebAR 3D ಸರ್ಕ್ಯೂಟ್ ಸಿಮ್ಯುಲೇಶನ್.'
            )}
          </p>

          {/* Editorial Pill Tabs */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setActiveTab('part-a')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-display font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'part-a'
                  ? 'bg-[#221611] text-[#FAF5EB] shadow-md scale-105'
                  : 'bg-white text-[#221611] border-2 border-[#221611]/15 hover:border-[#221611]'
              }`}
            >
              Part – A: Discrete Hardware ({discreteHardwareExperiments.length})
            </button>
            <button
              onClick={() => setActiveTab('extended')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-display font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'extended'
                  ? 'bg-[#221611] text-[#FAF5EB] shadow-md scale-105'
                  : 'bg-white text-[#221611] border-2 border-[#221611]/15 hover:border-[#221611]'
              }`}
            >
              Supplemental Circuit Simulations ({extendedExperiments.length})
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 py-8">
          {activeTab === 'part-a' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {discreteHardwareExperiments.map((exp) => {
                const IconComponent = exp.icon
                return (
                  <Link
                    key={exp.num}
                    to={exp.path}
                    className="group bg-white rounded-[28px] border-2 border-[#221611]/12 hover:border-[#221611] p-6 sm:p-7 hover:shadow-[0_16px_32px_rgba(34,22,17,0.14)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-9 h-9 rounded-xl bg-[#221611] text-[#FAF5EB] font-display font-black flex items-center justify-center text-sm shadow-xs">
                            {exp.num}
                          </span>
                          <span className="w-9 h-9 rounded-xl bg-[#FAF5EB] border border-[#221611]/15 flex items-center justify-center text-[#221611] group-hover:scale-105 transition-transform">
                            <IconComponent size={18} />
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF5EB] text-[#754F40] font-mono font-bold border border-[#221611]/10">
                            {exp.hours}
                          </span>
                          {exp.hasAR && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-[#A4C93B] text-[#221611] shadow-2xs">
                              WebAR 3D
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-display font-black text-lg sm:text-xl text-[#221611] group-hover:text-[#754F40] transition-colors leading-snug mb-2 uppercase tracking-tight">
                        {exp.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6B564A] leading-relaxed line-clamp-3 mb-5 font-medium">
                        {exp.description}
                      </p>
                    </div>

                    {/* Bottom Metadata & CTA */}
                    <div className="pt-4 border-t border-[#E8DFC8] flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#754F40]">
                        <span>Bloom's:</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF5EB] border border-[#221611]/10 text-[#221611]">
                          {exp.blooms}
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#221611] text-[#FAF5EB] group-hover:bg-[#A4C93B] group-hover:text-[#221611] flex items-center justify-center transition-all shadow-xs shrink-0">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {activeTab === 'extended' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-7">
              {extendedExperiments.map((exp, i) => {
                const IconComponent = exp.icon
                return (
                  <Link
                    key={i}
                    to={exp.path}
                    className="group bg-white rounded-[28px] border-2 border-[#221611]/12 hover:border-[#221611] p-6 sm:p-7 hover:shadow-[0_16px_32px_rgba(34,22,17,0.14)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF5EB] border border-[#221611]/15 flex items-center justify-center text-[#221611] group-hover:scale-105 transition-transform">
                          <IconComponent size={20} />
                        </div>
                        {exp.hasAR && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-[#A4C93B] text-[#221611] shadow-2xs">
                            WebAR 3D
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-black text-lg sm:text-xl text-[#221611] group-hover:text-[#754F40] transition-colors leading-snug mb-2 uppercase tracking-tight">
                        {exp.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6B564A] leading-relaxed mb-5 font-medium">
                        {exp.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E8DFC8] flex items-center justify-between mt-auto">
                      <span className="text-xs font-mono font-bold text-[#754F40]">Supplemental</span>
                      <div className="w-8 h-8 rounded-full bg-[#221611] text-[#FAF5EB] group-hover:bg-[#A4C93B] group-hover:text-[#221611] flex items-center justify-center transition-all shadow-xs shrink-0">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
