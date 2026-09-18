import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  FlaskConical, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  Layers, 
  Globe, 
  ChevronRight,
  Compass,
  Code,
  Radio,
  Plane,
  Bot,
  Brain,
  Wifi
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { DOMAIN_REGISTRY } from '../data/domainRegistry'

export default function Landing() {
  const { t } = useLanguage()
  const [activeCategory, setActiveCategory] = useState('engineering') // 'puc' | 'engineering'
  const [activeBranchId, setActiveBranchId] = useState(null)

  // Filter branches based on active category
  const activeDomains = DOMAIN_REGISTRY.filter(d => d.level === activeCategory)

  return (
    <div className="min-h-[100dvh] bg-white text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white font-sans">
      <div>
        <Navbar />

        {/* --- HERO SECTION: Pure White, Minimalist Technical Aesthetic --- */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 overflow-hidden bg-tech-dots border-b border-slate-100">
          {/* Subtle Background SVG Circuit Trace */}
          <svg 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-[0.03] pointer-events-none stroke-slate-900" 
            fill="none" 
            viewBox="0 0 1200 800"
          >
            <path d="M100 100 H400 V300 H800 V500 H1100" strokeWidth="2" strokeDasharray="6 6" />
            <path d="M200 600 H600 V400 H1000" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="400" cy="300" r="6" fill="currentColor" />
            <circle cx="800" cy="500" r="6" fill="currentColor" />
            <circle cx="600" cy="400" r="6" fill="currentColor" />
          </svg>

          <div className="max-w-6xl mx-auto text-center relative z-10">
            {/* Top Minimal Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-700 mb-8 shadow-2xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[11px] tracking-wider uppercase">CurioLabs v2.0 Engine</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{t('Next-Gen Engineering & Science OS', 'ಮುಂದಿನ ಪೀಳಿಗೆಯ ಸೈನ್ಸ್ ಲ್ಯಾಬ್ಸ್')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.08]">
              {t('The Future of Science &', 'ವಿಜ್ಞಾನ ಮತ್ತು ಎಂಜಿನಿಯರಿಂಗ್‌')}{' '}
              <span className="text-slate-500 font-normal underline decoration-slate-200 underline-offset-8 decoration-1">
                {t('Engineering Education', 'ಭವಿಷ್ಯದ ವರ್ಚುವಲ್ ಲ್ಯಾಬ್‌ಗಳು')}
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 mt-6 max-w-2xl mx-auto font-normal leading-relaxed">
              {t(
                'Interactive WebAR hardware projection, real-time mathematical simulation engines, and automated AI viva evaluation.',
                'ನೈಜ-ಸಮಯದ ಸಿಮ್ಯುಲೇಶನ್, WebAR ಹಾರ್ಡ್‌ವೇರ್ ಪ್ರೊಜೆಕ್ಷನ್ ಮತ್ತು AI ಮೌಲ್ಯಮಾಪನ.'
              )}
            </p>

            {/* --- PRIMARY ACTION: BRANCH-FIRST CATEGORY SELECTION --- */}
            <div className="mt-12 max-w-xl mx-auto">
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center justify-center gap-2">
                <Compass size={14} className="text-slate-500" />
                <span>{t('Step 1: Select Your Academic Category', 'ಹಂತ 1: ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ')}</span>
              </div>

              {/* Segmented Control Pill */}
              <div className="p-1.5 bg-slate-100/80 backdrop-blur rounded-2xl border border-slate-200/90 flex items-center gap-1.5 shadow-inner">
                <button
                  onClick={() => {
                    setActiveCategory('puc')
                    setActiveBranchId(null)
                  }}
                  className={`flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 ${
                    activeCategory === 'puc'
                      ? 'bg-white text-slate-950 shadow-sm border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
                  }`}
                >
                  <span className="text-base">🏫</span>
                  <span>PUC Science (+2)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    4 Branches
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveCategory('engineering')
                    setActiveBranchId(null)
                  }}
                  className={`flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 ${
                    activeCategory === 'engineering'
                      ? 'bg-white text-slate-950 shadow-sm border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-white/50'
                  }`}
                >
                  <span className="text-base">⚡</span>
                  <span>Engineering (B.Tech)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    7 Branches
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- BRANCH-FIRST DOMAIN CATALOG & LAB EXPLORER --- */}
        <section className="py-16 md:py-24 px-4 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5">
                <Layers size={13} className="text-slate-600" />
                <span>{t('Step 2: Choose Your Specialization Branch', 'ಹಂತ 2: ನಿಮ್ಮ ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
                {activeCategory === 'puc' ? 'PUC Foundational Sciences' : 'Undergraduate Engineering Domains'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 md:mt-0 font-normal">
              Showing {activeDomains.length} active specialization branches with zero-install WebAR labs
            </p>
          </div>

          {/* Bento Grid of Engineering Branches */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDomains.map((domain) => {
              const isSelected = activeBranchId === domain.id

              return (
                <div
                  key={domain.id}
                  onClick={() => setActiveBranchId(isSelected ? null : domain.id)}
                  className={`apple-card rounded-3xl p-6 relative flex flex-col justify-between cursor-pointer group transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-slate-950 border-transparent shadow-lg' : ''
                  }`}
                >
                  {/* Subtle Corner Circuit Pattern SVG */}
                  <svg className="absolute top-4 right-4 w-12 h-12 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                    <path d="M12 2v7m0 6v7M2 12h7m6 0h7" strokeWidth="1.5" strokeDasharray="2 2" />
                  </svg>

                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                        {domain.icon}
                      </span>

                      <div className="flex items-center gap-2">
                        {domain.hasAR && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <Smartphone size={10} />
                            WebAR 3D
                          </span>
                        )}
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {domain.experimentsCount} Labs
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-display font-bold text-slate-950 group-hover:text-slate-700 transition-colors flex items-center justify-between">
                      <span>{t(domain.title, domain.titleKn || domain.title)}</span>
                      <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </h3>

                    <p className="text-xs text-slate-500 mt-2 leading-relaxed font-normal line-clamp-2">
                      {domain.description}
                    </p>

                    {/* Tag Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {(domain.tags || []).map((tg, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md">
                          {tg}
                        </span>
                      ))}
                    </div>

                    {/* Interactive Experiments Module Preview */}
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                        Included Labs:
                      </div>
                      {(domain.experiments || []).slice(0, 3).map((exp, idx) => (
                        <Link
                          key={idx}
                          to={exp.path}
                          onClick={(e) => e.stopPropagation()}
                          className="group/item flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 text-xs text-slate-700 font-medium transition-all"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="text-xs">{exp.icon || '🔬'}</span>
                            <span className="truncate">{exp.title}</span>
                          </span>
                          <ArrowRight size={12} className="text-slate-400 group-hover/item:text-slate-950 group-hover/item:translate-x-0.5 transition-all flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Primary CTA button for the branch */}
                  <div className="mt-6 pt-2">
                    <Link
                      to={domain.path}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs"
                    >
                      <span>Launch {domain.title} Labs</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* --- NARRATIVE COMPARISON: Traditional vs CurioLabs --- */}
        <section className="py-20 px-4 bg-slate-50/70 border-y border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                Engineering Paradigm Shift
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-950 mt-4 tracking-tight">
                Built for deep conceptual mastery, not rote step-following.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Traditional Labs Column */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-mono text-xs font-bold">
                    ✕
                  </div>
                  <h3 className="font-display font-bold text-slate-500 text-base">Traditional Virtual Labs</h3>
                </div>

                <ul className="space-y-4 text-xs sm:text-sm text-slate-500">
                  <li className="flex items-start gap-3">
                    <span className="text-slate-300 font-bold mt-0.5">—</span>
                    <span>Pre-recorded video demonstrations with zero parameter flexibility.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-slate-300 font-bold mt-0.5">—</span>
                    <span>No physical 3D interaction or real-world hardware context.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-slate-300 font-bold mt-0.5">—</span>
                    <span>Manual viva voce grading causing weeks of evaluation delay.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-slate-300 font-bold mt-0.5">—</span>
                    <span>Heavy server dependencies requiring high-bandwidth internet.</span>
                  </li>
                </ul>
              </div>

              {/* CurioLabs Engine Column */}
              <div className="bg-white rounded-3xl p-8 border border-slate-950 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-slate-950 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                  CurioLabs Advantage
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-mono text-xs font-bold">
                    ✓
                  </div>
                  <h3 className="font-display font-bold text-slate-950 text-base">CurioLabs Simulation Engine</h3>
                </div>

                <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Mathematical Physics Engine:</strong> Compute real equations (Nernst, PID, Maxwell) live.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>WebAR Hardware Projection:</strong> Project 3D oscilloscopes & robotic arms on your desk.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Automated AI Viva Evaluation:</strong> Instant conceptual feedback with rubric scoring.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>PWA Offline Architecture:</strong> Runs completely client-side without active internet.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* --- TECHNICAL ARCHITECTURE BENTO GRID --- */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Technical Foundation</span>
            <h2 className="text-3xl font-display font-bold text-slate-950 mt-2">
              Engineering quality in every layer.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1 */}
            <div className="apple-card rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                  <Activity size={20} />
                </div>
                <h3 className="font-display font-bold text-slate-950 text-lg mb-2">Real-Time Waveforms</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Interactive HTML5 Canvas telemetry rendering real mathematical equations with sub-millisecond precision.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                <span>Vite + Canvas2D</span>
                <span>60 FPS</span>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="apple-card rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                  <Smartphone size={20} />
                </div>
                <h3 className="font-display font-bold text-slate-950 text-lg mb-2">WebAR Hardware</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Zero-app-install 3D augmented reality projection powered by Google WebAR ModelViewer.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 font-mono text-[10px] text-slate-400 flex items-center justify-between">
                <span>WebXR API</span>
                <span>Android & iOS</span>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="apple-card rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 mb-4">
                  <Zap size={20} />
                </div>
                <h3 className="font-display font-bold text-slate-950 text-lg mb-2">Offline PWA Operating System</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
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

        {/* --- DISCRETE FACULTY & INSTITUTION GATEWAY --- */}
        <section className="py-16 px-4 bg-slate-950 text-white">
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
