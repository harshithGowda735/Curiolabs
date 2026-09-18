import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Smartphone, 
  Zap, 
  Activity, 
  Users, 
  CheckCircle2, 
  Layers, 
  ChevronRight,
  Compass,
  Sparkles,
  Sliders,
  Terminal,
  Cpu
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { DOMAIN_REGISTRY } from '../data/domainRegistry'

export default function Landing() {
  const { t } = useLanguage()
  const [activeCategory, setActiveCategory] = useState('engineering') // 'puc' | 'engineering'

  // Filter active domains based on active category
  const activeDomains = DOMAIN_REGISTRY.filter(d => d.level === activeCategory)

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900 flex flex-col justify-between selection:bg-slate-950 selection:text-white font-sans antialiased">
      <div>
        <Navbar />

        {/* --- HERO SECTION: Pure White Minimalist Product Launch --- */}
        <section className="relative pt-16 pb-16 md:pt-24 md:pb-28 px-4 sm:px-6 overflow-hidden bg-tech-dots border-b border-slate-200/60">
          {/* Engineering Schematics Overlay */}
          <svg 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-[0.04] pointer-events-none stroke-slate-900" 
            fill="none" 
            viewBox="0 0 1200 800"
          >
            <path d="M100 120 H450 V280 H850 V480 H1100" strokeWidth="1.5" strokeDasharray="8 8" />
            <path d="M150 580 H650 V380 H1050" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="450" cy="280" r="5" fill="currentColor" />
            <circle cx="850" cy="480" r="5" fill="currentColor" />
            <circle cx="650" cy="380" r="5" fill="currentColor" />
          </svg>

          <div className="max-w-5xl mx-auto text-center relative z-10">

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.06]">
              {t('The Future of Science &', 'ವಿಜ್ಞಾನ ಮತ್ತು ಎಂಜಿನಿಯರಿಂಗ್‌')}{' '}
              <span className="text-slate-500 font-normal underline decoration-slate-200 underline-offset-8 decoration-1">
                {t('Engineering Education', 'ಭವಿಷ್ಯದ ವರ್ಚುವಲ್ ಲ್ಯಾಬ್‌ಗಳು')}
              </span>
            </h1>

            {/* Subhead */}
            <p className="text-base sm:text-lg text-slate-600 mt-6 max-w-2xl mx-auto font-normal leading-relaxed">
              {t(
                'Interactive WebAR hardware projection, real-time mathematical simulation engines, and automated AI viva evaluation.',
                'ನೈಜ-ಸಮಯದ ಸಿಮ್ಯುಲೇಶನ್, WebAR ಹಾರ್ಡ್‌ವೇರ್ ಪ್ರೊಜೆಕ್ಷನ್ ಮತ್ತು AI ಮೌಲ್ಯಮಾಪನ.'
              )}
            </p>

            {/* --- PRIMARY ACTION: BRANCH-FIRST CATEGORY SELECTOR --- */}
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-3.5 flex items-center justify-center gap-2">
                <Compass size={13} className="text-slate-600" />
                <span className="font-semibold">{t('Step 1: Select Your Academic Category', 'ಹಂತ 1: ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ')}</span>
              </div>

              {/* High-Contrast Major Decision Segment Control */}
              <div className="p-2 bg-slate-100/90 backdrop-blur-md rounded-2xl border border-slate-200/90 flex items-center gap-2 shadow-xs">
                <button
                  onClick={() => setActiveCategory('puc')}
                  className={`flex-1 py-3.5 px-6 rounded-xl text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group ${
                    activeCategory === 'puc'
                      ? 'bg-slate-950 text-white shadow-md border border-slate-800 font-bold scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/60 font-medium'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-base transition-colors ${
                    activeCategory === 'puc' ? 'bg-white/10 border border-white/15' : 'bg-slate-200/70'
                  }`}>
                    🏫
                  </span>

                  <span className="tracking-tight">PUC Science (+2)</span>

                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full transition-colors ${
                    activeCategory === 'puc'
                      ? 'bg-white/15 text-slate-200 border border-white/20 font-semibold'
                      : 'bg-slate-200/80 text-slate-600 border border-slate-300/50'
                  }`}>
                    4 Branches
                  </span>
                </button>

                <button
                  onClick={() => setActiveCategory('engineering')}
                  className={`flex-1 py-3.5 px-6 rounded-xl text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group ${
                    activeCategory === 'engineering'
                      ? 'bg-slate-950 text-white shadow-md border border-slate-800 font-bold scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/60 font-medium'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-base transition-colors ${
                    activeCategory === 'engineering' ? 'bg-white/10 border border-white/15' : 'bg-slate-200/70'
                  }`}>
                    ⚡
                  </span>

                  <span className="tracking-tight">Engineering (B.Tech)</span>

                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full transition-colors ${
                    activeCategory === 'engineering'
                      ? 'bg-white/15 text-slate-200 border border-white/20 font-semibold'
                      : 'bg-slate-200/80 text-slate-600 border border-slate-300/50'
                  }`}>
                    7 Branches
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- BRANCH-FIRST SPECIALIZATION EXPLORER --- */}
        <section className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-100">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                <Layers size={13} className="text-slate-500" />
                <span>{t('Step 2: Select Specialization Branch', 'ಹಂತ 2: ನಿಮ್ಮ ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950 tracking-tight">
                {activeCategory === 'puc' ? 'PUC Foundational Sciences' : 'Undergraduate Engineering Specializations'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 md:mt-0 font-mono">
              Showing {activeDomains.length} active branches • Zero-install WebAR ready
            </p>
          </div>

          {/* Bento Grid of Engineering Specialization Branches */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDomains.map((domain) => (
              <div
                key={domain.id}
                className="apple-card rounded-3xl p-6 relative flex flex-col justify-between group transition-all duration-300"
              >
                {/* Micro Circuit Trace Decorative SVG */}
                <svg className="absolute top-5 right-5 w-10 h-10 opacity-[0.05] group-hover:opacity-[0.12] transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                  <path d="M12 2v7m0 6v7M2 12h7m6 0h7" strokeWidth="1.5" strokeDasharray="2 2" />
                </svg>

                <div>
                  {/* Top Icon & Tech Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-12 h-12 rounded-2xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      {domain.icon}
                    </span>

                    <div className="flex items-center gap-2">
                      {domain.hasAR && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
                          <Smartphone size={10} />
                          WebAR 3D
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200/60">
                        {domain.experimentsCount} Labs
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg sm:text-xl font-display font-bold text-slate-950 group-hover:text-slate-800 transition-colors flex items-center justify-between">
                    <span>{t(domain.title, domain.titleKn || domain.title)}</span>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-950 group-hover:translate-x-1 transition-all" />
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed font-normal line-clamp-2">
                    {domain.description}
                  </p>

                  {/* Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {(domain.tags || []).map((tg, idx) => (
                      <span key={idx} className="text-[10px] font-mono text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-md">
                        {tg}
                      </span>
                    ))}
                  </div>

                  {/* Included Experiments Preview */}
                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-1.5">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                      Included Experiments:
                    </div>
                    {(domain.experiments || []).slice(0, 3).map((exp, idx) => (
                      <Link
                        key={idx}
                        to={exp.path}
                        className="group/item flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/70 border border-transparent hover:border-slate-200/80 text-xs text-slate-700 font-medium transition-all"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-xs">{exp.icon || '🔬'}</span>
                          <span className="truncate">{exp.title}</span>
                        </span>
                        <ArrowRight size={12} className="text-slate-300 group-hover/item:text-slate-950 group-hover/item:translate-x-0.5 transition-all flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Primary Launch Button */}
                <div className="mt-6 pt-2">
                  <Link
                    to={domain.path}
                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs"
                  >
                    <span>Launch {domain.title} Hub</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- NARRATIVE: Traditional vs CurioLabs Simulation Engine --- */}
        <section className="py-20 px-4 sm:px-6 bg-slate-50/60 border-y border-slate-200/60">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                Engineering Paradigm Shift
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-950 mt-4 tracking-tight">
                Built for deep mathematical mastery, not rote step-following.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Traditional Virtual Labs */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-mono text-xs font-bold">
                      ✕
                    </div>
                    <h3 className="font-display font-bold text-slate-500 text-base">Traditional Virtual Labs</h3>
                  </div>

                  <ul className="space-y-4 text-xs sm:text-sm text-slate-500 font-normal">
                    <li className="flex items-start gap-3">
                      <span className="text-slate-300 font-bold mt-0.5">—</span>
                      <span>Pre-recorded video clips with zero interactive parameter tuning.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-slate-300 font-bold mt-0.5">—</span>
                      <span>No 3D spatial hardware projection or real-world component testing.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-slate-300 font-bold mt-0.5">—</span>
                      <span>Manual viva voce scoring causing weeks of grading overhead.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-slate-300 font-bold mt-0.5">—</span>
                      <span>Heavy cloud server latency requiring constant high-bandwidth internet.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                  Legacy Architecture
                </div>
              </div>

              {/* CurioLabs Engine */}
              <div className="bg-white rounded-3xl p-8 border border-slate-950 shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-slate-950 text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-bl-xl">
                  CurioLabs Advantage
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-mono text-xs font-bold">
                      ✓
                    </div>
                    <h3 className="font-display font-bold text-slate-950 text-base">CurioLabs Simulation OS</h3>
                  </div>

                  <ul className="space-y-4 text-xs sm:text-sm text-slate-700 font-medium">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Mathematical Physics Engine:</strong> Computes real equations (Nernst, PID, Maxwell) in real time.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>WebAR Hardware Projection:</strong> Projects 3D breadboards & robotic arms directly onto your desk.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Automated AI Viva Evaluation:</strong> Instant conceptual rubric assessment & feedback.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Offline PWA Engine:</strong> Runs 100% client-side with zero network dependency.</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] font-mono text-emerald-600 font-medium flex items-center justify-between">
                  <span>Engineered for Deep Learning</span>
                  <span>v2.0 Client-Side</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- TECHNICAL ARCHITECTURE BENTO --- */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Technical Foundation</span>
            <h2 className="text-3xl font-display font-bold text-slate-950 mt-2 tracking-tight">
              Engineering quality in every layer.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="apple-card rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-950 mb-4">
                  <Activity size={20} />
                </div>
                <h3 className="font-display font-bold text-slate-950 text-lg mb-2">Real-Time Waveforms</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Interactive HTML5 Canvas telemetry rendering mathematical differential equations with sub-millisecond precision.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                <span>Canvas2D Math</span>
                <span>60 FPS</span>
              </div>
            </div>

            <div className="apple-card rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-950 mb-4">
                  <Smartphone size={20} />
                </div>
                <h3 className="font-display font-bold text-slate-950 text-lg mb-2">WebAR Hardware</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Zero-app-install 3D spatial hardware projection powered by WebXR & Google ModelViewer.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                <span>WebXR API</span>
                <span>Android & iOS</span>
              </div>
            </div>

            <div className="apple-card rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-950 mb-4">
                  <Zap size={20} />
                </div>
                <h3 className="font-display font-bold text-slate-950 text-lg mb-2">Offline PWA OS</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Cache-first service worker architecture ensuring 100% lab availability even in rural connectivity zones.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                <span>ServiceWorker</span>
                <span>Offline First</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- DISCRETE FACULTY & INSTITUTIONAL GATEWAY --- */}
        <section className="py-16 px-4 sm:px-6 bg-slate-950 text-white">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[11px] font-mono text-slate-300 mb-3 border border-white/10">
                <Users size={12} />
                <span>Faculty & Institutional Governance</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white">
                Faculty Command Console & Accreditation Telemetry
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl font-normal leading-relaxed">
                Monitor live student cohort progress, author custom lab parameters, and generate automated ABET & NAAC outcome attainment reports.
              </p>
            </div>

            <Link
              to="/faculty"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-2xl text-xs flex items-center gap-2 transition-all flex-shrink-0 shadow-sm"
            >
              <span>{t('Launch Faculty Console', 'ಶಿಕ್ಷಕರ ಕನ್ಸೋಲ್ ತೆರೆಯಿರಿ')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
