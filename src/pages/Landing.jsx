import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ArrowRight, 
  Smartphone, 
  Zap, 
  Activity, 
  Users, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  FlaskConical,
  GraduationCap,
  Cpu,
  Brain,
  HardDrive,
  ShieldCheck,
  Check,
  X,
  Waves,
  Sliders,
  Play,
  AlertTriangle
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DomainIcon from '../components/DomainIcon'
import BackgroundPrintedIcons from '../components/BackgroundPrintedIcons'
import { DOMAIN_REGISTRY } from '../data/domainRegistry'
import useScrollReveal from '../hooks/useScrollReveal'

export default function Landing() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('engineering') // 'puc' | 'engineering'
  const [facultyEmail, setFacultyEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  // Trigger high-performance outside-to-inside scroll animations
  useScrollReveal([activeCategory])

  const handleFacultySubmit = (e) => {
    e.preventDefault()
    setSubscribed(true)
    setTimeout(() => {
      navigate('/faculty')
    }, 400)
  }

  const activeDomains = DOMAIN_REGISTRY.filter(d => d.level === activeCategory)

  // Scroll tracking to progressively highlight headline text down by down as user scrolls
  const specHeadlineRef = useRef(null)
  const [activeSpecLine, setActiveSpecLine] = useState(0)

  const heroHeadlineRef = useRef(null)
  const [activeHeroLine, setActiveHeroLine] = useState(0)

  const compHeadlineRef = useRef(null)
  const [activeCompLine, setActiveCompLine] = useState(0)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        const winH = window.innerHeight

        // 1. Section 2 Specialization Headline
        if (specHeadlineRef.current) {
          const top = specHeadlineRef.current.getBoundingClientRect().top
          const target = top > winH * 0.62 ? 0 : top > winH * 0.40 ? 1 : 2
          setActiveSpecLine(prev => prev !== target ? target : prev)
        }

        // 2. Hero Headline
        if (heroHeadlineRef.current) {
          const top = heroHeadlineRef.current.getBoundingClientRect().top
          const target = top > winH * 0.70 ? 0 : top > winH * 0.45 ? 1 : 2
          setActiveHeroLine(prev => prev !== target ? target : prev)
        }

        // 3. Comparison Section Headline
        if (compHeadlineRef.current) {
          const top = compHeadlineRef.current.getBoundingClientRect().top
          const target = top > winH * 0.65 ? 0 : top > winH * 0.40 ? 1 : 2
          setActiveCompLine(prev => prev !== target ? target : prev)
        }

        ticking = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-[100dvh] bg-[#FAF5EB] text-[#221611] flex flex-col justify-between selection:bg-[#221611] selection:text-[#FAF5EB] font-sans antialiased">
      <div>
        {/* Floating Espresso Editorial Navbar */}
        <Navbar />

        {/* --- HERO SECTION: Bold Editorial Theobroma Aesthetic --- */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-8 lg:px-14 max-w-[1720px] mx-auto overflow-hidden">
          {/* Authentic Letterpress Printed Background Stamps */}
          <BackgroundPrintedIcons variant="dark" />

          <div className="w-full text-left sm:text-center relative z-10">

            {/* Main Headline - Interactive Scroll-driven Highlight & Hover */}
            <h1 ref={heroHeadlineRef} className="font-display font-black text-4xl sm:text-6xl md:text-8xl lg:text-[88px] xl:text-[98px] leading-[0.98] tracking-tight text-[#221611] max-w-6xl mx-auto uppercase select-none">
              <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeHeroLine === 0 ? 'text-[#A4C93B]' : 'hover:text-[#A4C93B]'}`}>
                {t('The Future of', 'ವಿಜ್ಞಾನ ಮತ್ತು')}
              </span>{' '}
              <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeHeroLine === 1 ? 'text-[#A4C93B]' : 'hover:text-[#A4C93B]'}`}>
                {t('Science &', 'ಎಂಜಿನಿಯರಿಂಗ್‌')}
              </span>{' '}
              <br className="hidden sm:inline" />
              <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeHeroLine === 2 ? 'text-[#A4C93B]' : 'hover:text-[#A4C93B]'}`}>
                {t('Engineering Education', 'ಭವಿಷ್ಯದ ವರ್ಚುವಲ್ ಲ್ಯಾಬ್‌ಗಳು')}
              </span>
            </h1>

            {/* Subhead - Restored Original Text */}
            <p className="mt-6 text-base sm:text-xl text-[#5A453C] max-w-3xl mx-auto font-medium leading-relaxed">
              {t(
                'Interactive WebAR hardware projection, real-time mathematical simulation engines, and automated AI viva evaluation.',
                'ನೈಜ-ಸಮಯದ ಸಿಮ್ಯುಲೇಶನ್, WebAR ಹಾರ್ಡ್‌ವೇರ್ ಪ್ರೊಜೆಕ್ಷನ್ ಮತ್ತು AI ಮೌಲ್ಯಮಾಪನ.'
              )}
            </p>

            {/* Dual Track Action Buttons - Tactile Editorial Capsule Cards */}
            <div className="mt-10 flex flex-col sm:flex-row items-stretch justify-center gap-5 sm:gap-6 max-w-4xl mx-auto">
              {/* PUC Science (+2) Button */}
              <Link
                to="/catalog/puc"
                data-reveal="left"
                data-delay="100"
                className="group flex-1 flex items-center justify-between gap-4 px-7 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-full bg-white text-[#221611] border-2 border-[#221611] shadow-[0_6px_0_#221611] hover:shadow-[0_2px_0_#221611] hover:translate-y-1 active:translate-y-1.5 active:shadow-none transition-all duration-200 select-none cursor-pointer"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF5EB] border-2 border-[#221611] flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
                    <GraduationCap size={24} className="text-[#221611] transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <div className="font-display font-black text-sm sm:text-base uppercase tracking-wide group-hover:text-[#754F40] transition-colors leading-tight">
                      PUC Science (+2)
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F0E6D4] text-[#754F40] font-mono text-[10px] font-bold tracking-wider uppercase">
                        4 Branches
                      </span>
                      <span className="text-[11px] font-mono text-[#754F40]/80 hidden xs:inline">
                        Grades 11 & 12
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#221611] text-[#FAF5EB] flex items-center justify-center shrink-0 group-hover:bg-[#A4C93B] group-hover:text-[#221611] transition-all duration-200">
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              {/* Engineering (B.Tech) Button */}
              <Link
                to="/catalog/engineering"
                data-reveal="right"
                data-delay="200"
                className="group flex-1 flex items-center justify-between gap-4 px-7 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-full bg-[#221611] text-[#FAF5EB] border-2 border-[#221611] shadow-[0_6px_0_#A4C93B] hover:shadow-[0_2px_0_#A4C93B] hover:translate-y-1 active:translate-y-1.5 active:shadow-none transition-all duration-200 select-none cursor-pointer"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-[#A4C93B] border-2 border-[#221611] flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300 shadow-sm">
                    <Cpu size={24} className="text-[#221611] transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <div className="font-display font-black text-sm sm:text-base uppercase tracking-wide text-[#FAF5EB] group-hover:text-[#A4C93B] transition-colors leading-tight">
                      Engineering (B.Tech)
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#A4C93B] text-[#221611] font-mono text-[10px] font-black tracking-wider uppercase">
                        6 Branches
                      </span>
                      <span className="text-[11px] font-mono text-[#FAF5EB]/70 hidden xs:inline">
                        Undergraduate
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#A4C93B] text-[#221611] flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-[#221611] transition-all duration-200">
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* --- Theobroma Lime Green Ticker Bar --- */}
        <div className="bg-[#A4C93B] text-[#221611] py-3 overflow-hidden whitespace-nowrap border-y-2 border-[#221611] select-none flex">
          <div className="flex items-center gap-6 font-display font-black text-xs sm:text-sm uppercase tracking-wider animate-marquee shrink-0">
            <span className="inline-flex items-center gap-1.5"><Activity size={14} /> REAL-TIME MATHEMATICAL SIMULATION</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><Smartphone size={14} /> 3D WEBAR HARDWARE PROJECTION</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><Brain size={14} /> AUTOMATED AI VIVA VOCE EVALUATION</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><GraduationCap size={14} /> PUC FOUNDATION & B.TECH ENGINEERING</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> ZERO PHYSICAL LAB BREAKDOWN</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><HardDrive size={14} /> 100% OFFLINE READY WORKSTATIONS</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><Activity size={14} /> REAL-TIME MATHEMATICAL SIMULATION</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><Smartphone size={14} /> 3D WEBAR HARDWARE PROJECTION</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><Brain size={14} /> AUTOMATED AI VIVA VOCE EVALUATION</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><GraduationCap size={14} /> PUC FOUNDATION & B.TECH ENGINEERING</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> ZERO PHYSICAL LAB BREAKDOWN</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5"><HardDrive size={14} /> 100% OFFLINE READY WORKSTATIONS</span>
            <span>•</span>
          </div>
        </div>

        {/* --- SECTION 2: Specialization Branches with Warm Cocoa Background --- */}
        <section className="bg-[#754F40] text-white py-16 md:py-24 px-4 sm:px-8 lg:px-14 relative overflow-hidden">
          <BackgroundPrintedIcons variant="light" />
          <div className="max-w-[1720px] mx-auto relative z-10">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8 mb-14">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#FAF5EB]/80 mb-2 font-bold flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#A4C93B]" />
                  <span>{t('Specialization Branches', 'ವಿಶೇಷತೆಯ ವಿಭಾಗಗಳು')}</span>
                </div>
                <h2 ref={specHeadlineRef} className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#FAF5EB] uppercase select-none drop-shadow-[0_4px_0_rgba(34,22,17,0.35)] leading-[0.96]">
                  {activeCategory === 'puc' ? (
                    <>
                      <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeSpecLine === 0 ? 'text-[#A4C93B]' : 'text-[#FAF5EB] hover:text-[#A4C93B]'}`}>PUC</span>{' '}
                      <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeSpecLine === 1 ? 'text-[#A4C93B]' : 'text-[#FAF5EB] hover:text-[#A4C93B]'}`}>FOUNDATIONAL</span>{' '}
                      <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeSpecLine === 2 ? 'text-[#A4C93B]' : 'text-[#FAF5EB] hover:text-[#A4C93B]'}`}>SCIENCES</span>
                    </>
                  ) : (
                    <>
                      <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeSpecLine === 0 ? 'text-[#A4C93B]' : 'text-[#FAF5EB] hover:text-[#A4C93B]'}`}>UNDERGRADUATE</span>{' '}
                      <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeSpecLine === 1 ? 'text-[#A4C93B]' : 'text-[#FAF5EB] hover:text-[#A4C93B]'}`}>ENGINEERING</span>{' '}
                      <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeSpecLine === 2 ? 'text-[#A4C93B]' : 'text-[#FAF5EB] hover:text-[#A4C93B]'}`}>SPECIALIZATIONS</span>
                    </>
                  )}
                </h2>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button
                    onClick={() => setActiveCategory('puc')}
                    className={`px-6 py-3 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 ${
                      activeCategory === 'puc'
                        ? 'bg-[#FAF5EB] text-[#221611] shadow-lg scale-105'
                        : 'border-2 border-[#FAF5EB] text-[#FAF5EB] hover:bg-[#FAF5EB]/15'
                    }`}
                  >
                    PUC (+2) SCIENCES
                  </button>

                  <button
                    onClick={() => setActiveCategory('engineering')}
                    className={`px-6 py-3 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 ${
                      activeCategory === 'engineering'
                        ? 'bg-[#FAF5EB] text-[#221611] shadow-lg scale-105'
                        : 'border-2 border-[#FAF5EB] text-[#FAF5EB] hover:bg-[#FAF5EB]/15'
                    }`}
                  >
                    ENGINEERING (B.TECH)
                  </button>
                </div>
              </div>

              {/* Melting Cream Dripping Card - Positioned High at Top */}
              <div 
                data-reveal="tilt-card"
                data-delay="150"
                className="bg-[#221611] rounded-3xl p-6 sm:p-7 text-white max-w-sm border-2 border-[#3A2820] shadow-2xl relative -rotate-2 hover:rotate-0 transition-transform duration-300 self-start shrink-0 mb-8 xl:mb-0 xl:mt-2 group/card"
              >
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#A4C93B] mb-1 font-bold">
                  ABOUT THIS TRACK
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white mb-2 leading-tight">
                  {activeCategory === 'puc' ? 'WHAT IS PUC SCIENCE?' : 'WHAT IS ENGINEERING LAB?'}
                </h3>
                <p className="text-xs sm:text-sm text-[#D8CEBC] font-medium leading-relaxed">
                  {activeCategory === 'puc'
                    ? 'Foundational high-school Physics, Chemistry, and Biology laboratories designed according to state & CBSE boards. Zero lab hazards.'
                    : 'Real-world electronics, autonomous robotics, cybersecurity penetration labs, and aerospace flight simulation with WebAR 3D projection.'}
                </p>

                {/* SVG Melting Dark Drops along card bottom */}
                <svg 
                  className="absolute -bottom-8 left-1 right-1 w-[calc(100%-8px)] h-9 text-[#221611] fill-current pointer-events-none drop-shadow-md z-20" 
                  viewBox="0 0 320 36" 
                  preserveAspectRatio="none"
                >
                  <path d="M0,0 L320,0 L320,6 C310,6 304,18 294,18 C284,18 278,6 266,6 C256,6 250,28 238,28 C226,28 220,6 206,6 C196,6 190,20 178,20 C166,20 160,6 146,6 C134,6 128,34 114,34 C100,34 94,6 80,6 C68,6 62,24 50,24 C38,24 32,6 18,6 C8,6 2,16 0,16 Z" />
                </svg>

                {/* Animated Falling Teardrop Dark Droplets (Same dark color as card) */}
                <div 
                  className="absolute -bottom-11 left-12 w-3 h-4 bg-[#221611] rounded-full [clip-path:polygon(50%_0%,100%_65%,100%_100%,0%_100%,0%_65%)] animate-drip-1 shadow-md pointer-events-none z-20" 
                />
                <div 
                  className="absolute -bottom-13 left-28 w-2.5 h-3.5 bg-[#221611] rounded-full [clip-path:polygon(50%_0%,100%_65%,100%_100%,0%_100%,0%_65%)] animate-drip-2 shadow-md pointer-events-none z-20" 
                />
                <div 
                  className="absolute -bottom-12 right-20 w-3.5 h-4.5 bg-[#221611] rounded-full [clip-path:polygon(50%_0%,100%_65%,100%_100%,0%_100%,0%_65%)] animate-drip-3 shadow-md pointer-events-none z-20" 
                />
                <div 
                  className="absolute -bottom-10 right-8 w-2 h-2.5 bg-[#221611] rounded-full [clip-path:polygon(50%_0%,100%_65%,100%_100%,0%_100%,0%_65%)] animate-drip-1 shadow-sm pointer-events-none z-20" 
                  style={{ animationDelay: '1.2s' }} 
                />
              </div>
            </div>

            {/* Bento Grid of Experiment Domains in tall, expansive Theobroma card style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
              {activeDomains.map((domain, idx) => {
                const colType = idx % 3 === 0 ? 'left' : idx % 3 === 2 ? 'right' : 'bottom'
                const delay = (idx % 3) * 120
                return (
                  <div
                    key={domain.id}
                    data-reveal={colType}
                    data-delay={delay}
                    className="bg-[#FAF5EB] text-[#221611] rounded-[32px] p-7 sm:p-8 flex flex-col justify-between group transition-all duration-300 ease-out hover:-translate-y-2.5 hover:shadow-[0_24px_48px_rgba(34,22,17,0.28)] border-2 border-[#221611]/15 hover:border-[#221611] cursor-pointer card-hover-3d"
                  >
                  <div>
                    {/* Top Row: Clean Icon Medallion & Academic Badges (Older Authentic Style) */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EFE7D8] border-2 border-[#221611] shadow-[3px_3px_0_#221611] flex items-center justify-center text-[#221611] group-hover:rotate-6 group-hover:scale-105 transition-all">
                        <DomainIcon id={domain.id} size={28} className="text-[#221611]" />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3.5 py-1 rounded-full bg-[#221611] text-[#FAF5EB] font-mono text-[11px] font-black uppercase tracking-wider shadow-xs">
                          {domain.experimentsCount} Labs
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-black text-2xl sm:text-[26px] uppercase tracking-tight text-[#221611] group-hover:text-[#754F40] transition-colors flex items-center justify-between leading-tight">
                      <span>{t(domain.title, domain.titleKn || domain.title)}</span>
                      <ChevronRight size={20} className="text-[#A89886] group-hover:text-[#A4C93B] group-hover:translate-x-1.5 transition-all duration-200 shrink-0" />
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[#6B564A] mt-2.5 font-medium leading-relaxed line-clamp-2">
                      {domain.description}
                    </p>

                    {/* Included Labs Preview - Exactly 2 experiments */}
                    <div className="mt-6 pt-4 border-t border-[#E8DFC8] space-y-2">
                      <div className="text-[10px] font-mono text-[#8C7667] uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5">
                        <Sparkles size={11} className="text-[#754F40]" />
                        <span>Featured Experiments:</span>
                      </div>
                      {(domain.experiments || []).slice(0, 2).map((exp, idx) => (
                        <Link
                          key={idx}
                          to={exp.path}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F0E6D4] text-xs text-[#221611] font-bold transition-all duration-200 group/item hover:translate-x-1 border border-transparent hover:border-[#221611]/10"
                        >
                          <span className="flex items-center gap-2.5 truncate">
                            <FlaskConical size={14} className="text-[#754F40] shrink-0 group-hover/item:text-[#221611] transition-colors" />
                            <span className="truncate">{exp.title}</span>
                          </span>
                          <ArrowRight size={13} className="text-[#8C7667] group-hover/item:text-[#221611] group-hover/item:translate-x-1 transition-transform flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Tactile Card CTA Button */}
                  <Link
                    to={domain.path}
                    className="mt-6 w-full py-3.5 px-6 rounded-full bg-[#221611] text-[#FAF5EB] group-hover:bg-[#A4C93B] group-hover:text-[#221611] border-2 border-[#221611] font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_0_#754F40] group-hover:shadow-[0_4px_0_#221611] active:translate-y-1 active:shadow-none transition-all duration-200"
                  >
                    <span>LAUNCH WORKSTATION</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )
            })}
            </div>
          </div>
        </section>

        {/* --- COMPARISON SECTION: The Next Generation Lab --- */}
        <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-8 lg:px-14 max-w-6xl mx-auto relative overflow-hidden">
          <BackgroundPrintedIcons variant="dark" />
          <div className="relative z-10">
            {/* Header Eyebrow & Dynamic Headline */}
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
              <div className="inline-flex items-center gap-2 bg-[#221611] text-[#A4C93B] px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider mb-4 shadow-[2px_2px_0px_#A4C93B]">
                <Sparkles size={13} className="text-[#A4C93B]" />
                <span>THE NEXT GENERATION LAB</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#A4C93B] animate-pulse" />
              </div>
              <h2 ref={compHeadlineRef} className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-[#221611] uppercase mt-2 tracking-tight select-none">
                <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeCompLine === 0 ? 'text-[#A4C93B]' : 'hover:text-[#A4C93B]'}`}>BUILT</span>{' '}
                <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeCompLine === 1 ? 'text-[#A4C93B]' : 'hover:text-[#A4C93B]'}`}>FOR REAL</span>{' '}
                <span className={`inline-block transition-colors duration-500 cursor-pointer ${activeCompLine === 2 ? 'text-[#A4C93B]' : 'hover:text-[#A4C93B]'}`}>MASTERY.</span>
              </h2>
            </div>

            {/* Asymmetric Dual Console (No Bored Square Boxes) */}
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-stretch">
              
              {/* Central Floating Paradigm Leap Medallion */}
              <div className="hidden lg:flex flex-col items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div className="relative flex items-center justify-center animate-float-medallion">
                  <span className="absolute w-14 h-14 rounded-full border border-[#A4C93B] animate-radar-ring pointer-events-none" />
                  <div className="w-14 h-14 rounded-full border-3 border-[#221611] bg-[#A4C93B] text-[#221611] font-display font-black text-sm flex items-center justify-center shadow-[0_0_24px_rgba(164,201,59,0.5),4px_4px_0px_#221611] relative z-10">
                    VS
                  </div>
                </div>
                <div className="mt-2 px-2.5 py-0.5 rounded-full bg-[#221611] text-[#A4C93B] text-[9px] font-mono font-black tracking-widest uppercase border border-[#A4C93B]/40 shadow-sm animate-pulse">
                  10x LEAP
                </div>
              </div>

              {/* ── 1. The Legacy Past (Traditional Virtual Labs) ── */}
              <div 
                data-reveal="left"
                data-delay="80"
                className="group relative rounded-[32px] sm:rounded-[44px] border-2 border-[#754F40]/30 bg-gradient-to-b from-[#FAF4E8] to-[#F2E8D5] p-6 sm:p-9 flex flex-col justify-between shadow-[4px_4px_0px_#754F40]/15 hover:shadow-[8px_8px_0px_#754F40]/25 hover:-translate-y-1.5 hover:border-[#754F40]/60 transition-all duration-300 ease-out overflow-hidden"
              >
                {/* Caution stripe indicator along top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(45deg,#d97706,#d97706_8px,#fef3c7_8px,#fef3c7_16px)] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Background Watermark Stamp */}
                <div className="absolute right-4 bottom-14 text-6xl font-display font-black text-[#221611]/5 pointer-events-none select-none -rotate-12 group-hover:-rotate-6 group-hover:translate-x-1 transition-transform duration-500">
                  LEGACY
                </div>

                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b-2 border-[#754F40]/15 pb-4 mb-7">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl border-2 border-rose-300 bg-rose-50 text-rose-600 flex items-center justify-center font-black group-hover:scale-105 group-hover:rotate-6 transition-transform duration-300">
                        <X size={18} strokeWidth={3} />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-widest mb-0.5">
                          LEGACY PARADIGM
                        </div>
                        <h3 className="font-display font-black uppercase text-lg sm:text-xl text-[#754F40] tracking-tight group-hover:text-[#221611] transition-colors duration-200">
                          Traditional Virtual Labs
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Flowing Drawback Points */}
                  <div className="space-y-5">
                    {/* Defect 1 */}
                    <div className="group/item relative pl-7 hover:translate-x-1 transition-transform duration-200">
                      <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-rose-400 bg-rose-100 flex items-center justify-center text-rose-600 group-hover/item:scale-110 group-hover/item:bg-rose-200 transition-all duration-200">
                        <span className="w-1.5 h-0.5 bg-rose-500 rounded" />
                      </div>
                      <p className="text-sm font-bold text-[#6B564A] group-hover/item:text-[#221611] leading-snug transition-colors duration-200">
                        Pre-recorded video clips with zero interactive parameter tuning.
                      </p>
                      <p className="text-xs text-[#8C7667] mt-1 font-mono">
                        Canned animation playback with zero mathematical reality or dynamic component tolerances.
                      </p>
                    </div>

                    <div className="border-b border-dashed border-[#754F40]/15" />

                    {/* Defect 2 */}
                    <div className="group/item relative pl-7 hover:translate-x-1 transition-transform duration-200">
                      <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-rose-400 bg-rose-100 flex items-center justify-center text-rose-600 group-hover/item:scale-110 group-hover/item:bg-rose-200 transition-all duration-200">
                        <span className="w-1.5 h-0.5 bg-rose-500 rounded" />
                      </div>
                      <p className="text-sm font-bold text-[#6B564A] group-hover/item:text-[#221611] leading-snug transition-colors duration-200">
                        No 3D spatial hardware projection or real-world component testing.
                      </p>
                      <p className="text-xs text-[#8C7667] mt-1 font-mono">
                        Students never touch physical breadboard tie-points, IC pinouts, or real-world polarity.
                      </p>
                    </div>

                    <div className="border-b border-dashed border-[#754F40]/15" />

                    {/* Defect 3 */}
                    <div className="group/item relative pl-7 hover:translate-x-1 transition-transform duration-200">
                      <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-amber-400 bg-amber-100 flex items-center justify-center text-amber-700 group-hover/item:scale-110 group-hover/item:bg-amber-200 transition-all duration-200">
                        <span className="w-1.5 h-0.5 bg-amber-600 rounded" />
                      </div>
                      <p className="text-sm font-bold text-[#6B564A] group-hover/item:text-[#221611] leading-snug transition-colors duration-200">
                        Manual viva voce scoring causing weeks of grading overhead.
                      </p>
                      <p className="text-xs text-[#8C7667] mt-1 font-mono">
                        Subjective paper records pile up; professors spend weeks grading with zero timely cognitive feedback.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Legacy Card Footer */}
                <div className="mt-8 pt-4 border-t-2 border-[#754F40]/15 flex items-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border-2 border-rose-300/80 bg-rose-100/70 text-rose-700 font-mono font-black text-xs uppercase tracking-wider -rotate-1 shadow-sm group-hover:rotate-0 transition-transform duration-200">
                    <AlertTriangle size={12} />
                    <span>Legacy Experience</span>
                  </div>
                </div>
              </div>

              {/* ── 2. The CurioLabs Future (Autonomous Simulation Engine) ── */}
              <div 
                data-reveal="right"
                data-delay="160"
                className="group relative rounded-[32px] sm:rounded-[44px] border-3 border-[#221611] bg-[#1E140F] text-[#FAF5EB] p-6 sm:p-9 flex flex-col justify-between shadow-[8px_8px_0px_#A4C93B] hover:shadow-[12px_12px_0px_#A4C93B] hover:-translate-y-2 hover:border-[#A4C93B] transition-all duration-300 ease-out overflow-hidden"
              >
                {/* Ambient glow mesh with breathing pulse animation */}
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#A4C93B]/20 blur-3xl pointer-events-none animate-pulse-glow" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#A4C93B]/10 blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2.5s' }} />

                <div className="relative z-10">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-[#3A2820] pb-4 mb-7">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl border-2 border-[#221611] bg-[#A4C93B] text-[#221611] flex items-center justify-center font-black shadow-[2px_2px_0px_#FAF5EB] group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                        <Check size={20} strokeWidth={3} />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-black text-[#A4C93B] uppercase tracking-widest mb-0.5">
                          CURIOLABS ADVANTAGE
                        </div>
                        <h3 className="font-display font-black uppercase text-lg sm:text-xl text-white tracking-tight group-hover:text-[#A4C93B] transition-colors duration-200">
                          CurioLabs Simulation Engine
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Illuminated Power Tracks with Interactive Slide & Hover Glow */}
                  <div className="space-y-5">
                    {/* Feature 1 */}
                    <div className="group/feat relative pl-4 border-l-2 border-[#A4C93B] hover:border-l-4 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1 rounded-md bg-[#A4C93B] text-[#221611] group-hover/feat:scale-110 group-hover/feat:shadow-[0_0_12px_rgba(164,201,59,0.7)] transition-all duration-200">
                          <Waves size={13} strokeWidth={2.5} />
                        </span>
                        <h4 className="text-xs font-display font-black uppercase tracking-wider text-[#A4C93B] group-hover/feat:text-white transition-colors duration-200">
                          Mathematical Physics Engine
                        </h4>
                      </div>
                      <p className="text-sm font-bold text-white leading-snug">
                        Computes real differential equations in real time at 60 FPS.
                      </p>
                      <p className="text-xs text-[#D8CEBC] mt-1 font-mono">
                        Runge-Kutta numerical solvers for circuit poles, damping factors, & component tolerances.
                      </p>
                    </div>

                    <div className="border-b border-[#3A2820]" />

                    {/* Feature 2 */}
                    <div className="group/feat relative pl-4 border-l-2 border-[#A4C93B] hover:border-l-4 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1 rounded-md bg-[#A4C93B] text-[#221611] group-hover/feat:scale-110 group-hover/feat:shadow-[0_0_12px_rgba(164,201,59,0.7)] transition-all duration-200">
                          <Smartphone size={13} strokeWidth={2.5} />
                        </span>
                        <h4 className="text-xs font-display font-black uppercase tracking-wider text-[#A4C93B] group-hover/feat:text-white transition-colors duration-200">
                          WebAR Hardware Projection
                        </h4>
                      </div>
                      <p className="text-sm font-bold text-white leading-snug">
                        Projects 3D breadboards & robotic arms directly on your desk.
                      </p>
                      <p className="text-xs text-[#D8CEBC] mt-1 font-mono">
                        Zero app install required. 6-DoF spatial tracking on any Chrome or Safari mobile camera.
                      </p>
                    </div>

                    <div className="border-b border-[#3A2820]" />

                    {/* Feature 3 */}
                    <div className="group/feat relative pl-4 border-l-2 border-[#A4C93B] hover:border-l-4 hover:translate-x-1.5 transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1 rounded-md bg-[#A4C93B] text-[#221611] group-hover/feat:scale-110 group-hover/feat:shadow-[0_0_12px_rgba(164,201,59,0.7)] transition-all duration-200">
                          <Brain size={13} strokeWidth={2.5} />
                        </span>
                        <h4 className="text-xs font-display font-black uppercase tracking-wider text-[#A4C93B] group-hover/feat:text-white transition-colors duration-200">
                          Automated AI Viva Evaluation
                        </h4>
                      </div>
                      <p className="text-sm font-bold text-white leading-snug">
                        Instant conceptual rubric scoring & viva feedback.
                      </p>
                      <p className="text-xs text-[#D8CEBC] mt-1 font-mono">
                        Real-time speech-to-rubric scoring evaluates student conceptual reasoning against university benchmarks.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CurioLabs Telemetry Cockpit Footer */}
                <div className="mt-8 pt-4 border-t border-[#3A2820] flex flex-wrap items-center justify-between gap-3 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#A4C93B]/40 bg-[#A4C93B]/10 text-[#A4C93B] text-xs font-mono font-black uppercase tracking-wider hover:scale-105 hover:bg-[#A4C93B]/20 transition-all duration-200">
                    <Zap size={13} />
                    <span>Engineered for Deep Learning</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#FAF5EB]">
                    <span className="w-2 h-2 rounded-full bg-[#A4C93B] animate-ping" />
                    <span className="font-bold">v2.0 Client-Side</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* --- FACULTY CALLOUT BANNER (COMPACT IMMERSIVE ROUNDED GREEN CARD) --- */}
        <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <div 
              data-reveal="scale"
              className="relative rounded-3xl sm:rounded-4xl border-2 border-[#221611] bg-[#A4C93B] text-[#221611] py-10 sm:py-12 px-6 sm:px-10 shadow-[5px_5px_0px_#221611] overflow-hidden"
            >
              {/* Subtle architectural tech-dots and ambient lighting */}
              <div className="absolute inset-0 bg-tech-dots opacity-20 pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-white/20 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-[#221611]/10 blur-2xl pointer-events-none" />

              {/* Decorative Retro 4-Point Stars matching Reference Image */}
              <div className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 pointer-events-none select-none text-[#221611] animate-pulse">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path d="M12 0 C12 7, 17 12, 24 12 C17 12, 12 17, 12 24 C12 17, 7 12, 0 12 C7 12, 12 0 Z" />
                </svg>
              </div>
              <div className="absolute right-6 sm:right-12 top-6 sm:top-8 pointer-events-none select-none text-[#221611]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path d="M12 0 C12 7, 17 12, 24 12 C17 12, 12 17, 12 24 C12 17, 7 12, 0 12 C7 12, 12 0 Z" />
                </svg>
              </div>
              <div className="absolute right-5 sm:right-10 bottom-6 sm:bottom-8 pointer-events-none select-none text-[#221611]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path d="M12 0 C12 7, 17 12, 24 12 C17 12, 12 17, 12 24 C12 17, 7 12, 0 12 C7 12, 12 0 Z" />
                </svg>
              </div>

              <div className="max-w-2xl mx-auto text-center relative z-10">
                {/* Small Faculty Tag */}
                <div className="inline-flex items-center gap-1.5 bg-[#221611] text-[#FAF5EB] px-3.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider mb-4 shadow-[2px_2px_0px_#221611]">
                  <Users size={12} className="text-[#A4C93B]" />
                  <span>{t('Faculty & Institutional Console', 'ಶಿಕ್ಷಕರ ಮತ್ತು ಸಂಸ್ಥೆಯ ಕನ್ಸೋಲ್')}</span>
                </div>

                {/* Balanced Headline */}
                <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl leading-[1.08] tracking-tight text-[#221611] uppercase select-none">
                  MONITOR LIVE <span className="text-[#FAF5EB] drop-shadow-[0_2px_4px_rgba(34,22,17,0.25)]">LAB COHORTS</span><br />
                  & ACCREDITATION
                </h2>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm text-[#221611]/85 font-bold max-w-lg mx-auto mt-3 mb-6 sm:mb-8 leading-relaxed">
                  Empower your department with automated ABET & NAAC outcome attainment reports, custom lab experiment assignments, and live grading.
                </p>

                {/* Centered Email Pill Bar */}
                <form onSubmit={handleFacultySubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full max-w-lg mx-auto">
                  <div className="relative w-full sm:flex-1">
                    <input
                      type="email"
                      value={facultyEmail}
                      onChange={(e) => setFacultyEmail(e.target.value)}
                      placeholder="ENTER YOUR INSTITUTIONAL EMAIL"
                      className="w-full bg-[#FAF5EB] text-[#221611] placeholder:text-[#221611]/50 placeholder:font-display placeholder:font-black placeholder:text-xs placeholder:tracking-wider border-2 border-[#221611] rounded-full px-5 py-3 text-xs sm:text-sm font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#221611] shadow-[2px_2px_0px_#221611] transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#221611] hover:bg-[#35231B] text-[#FAF5EB] font-display font-black text-xs uppercase tracking-wider px-6 sm:px-8 py-3 rounded-full transition-all duration-200 border-2 border-[#221611] shadow-[2px_2px_0px_#221611] hover:translate-y-0.5 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 group"
                  >
                    <span>{subscribed ? 'ACCESS GRANTED' : 'SIGN UP'}</span>
                    <ArrowRight size={13} className="stroke-[2.5] transition-transform group-hover:translate-x-1 text-[#A4C93B]" />
                  </button>
                </form>

                {/* Decorative Accent Dot */}
                <div className="w-2 h-2 rounded-full bg-[#221611] mx-auto mt-5 animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
