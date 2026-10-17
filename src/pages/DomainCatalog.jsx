import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Search, ArrowRight, Smartphone, FlaskConical } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DomainIcon from '../components/DomainIcon'
import { DOMAIN_REGISTRY, EDUCATION_LEVELS } from '../data/domainRegistry'
import useScrollReveal from '../hooks/useScrollReveal'

export default function DomainCatalog() {
  const { level = 'engineering' } = useParams()
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTag, setActiveTag] = useState('ALL')

  useScrollReveal([level, activeTag, searchTerm])

  const currentLevelInfo = EDUCATION_LEVELS.find(l => l.id === level) || EDUCATION_LEVELS[1]

  const levelDomains = useMemo(() => {
    return DOMAIN_REGISTRY.filter(d => d.level === level)
  }, [level])

  // Extract all unique tags for filter pills
  const allTags = useMemo(() => {
    const set = new Set()
    levelDomains.forEach(d => (d.tags || []).forEach(tg => set.add(tg)))
    return ['ALL', ...Array.from(set)]
  }, [levelDomains])

  const filteredDomains = useMemo(() => {
    return levelDomains.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.experiments || []).some(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesTag = activeTag === 'ALL' || (d.tags || []).includes(activeTag)
      return matchesSearch && matchesTag
    })
  }, [levelDomains, searchTerm, activeTag])

  return (
    <div className="min-h-[100dvh] bg-[#FAF5EB] text-[#221611] flex flex-col justify-between selection:bg-[#221611] selection:text-[#FAF5EB]">
      <div>
        <Navbar />

        {/* Clean Header & Track Switcher without any weird gradient banners */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 pt-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2D7C5]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE0CD] text-[#221611] text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                <DomainIcon id={level} size={14} className="text-[#221611]" />
                <span>{level === 'puc' ? 'Grades 11-12' : 'B.Tech / B.E'}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-black uppercase text-[#221611] tracking-tight">
                {level === 'puc' ? 'PUC (+2) Sciences' : 'Undergraduate Engineering'}
              </h1>
              <p className="text-[#6B564A] text-xs sm:text-base mt-1.5 max-w-2xl font-medium leading-relaxed">
                {currentLevelInfo.description}
              </p>
            </div>

            {/* Clean Pill Track Switcher */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              {EDUCATION_LEVELS.map(lvl => (
                <Link
                  key={lvl.id}
                  to={`/catalog/${lvl.id}`}
                  className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 inline-flex items-center gap-1.5 ${
                    level === lvl.id 
                      ? 'bg-[#221611] text-[#FAF5EB] shadow-md scale-105' 
                      : 'bg-white hover:bg-[#221611]/10 text-[#221611] border-2 border-[#221611]'
                  }`}
                >
                  <DomainIcon id={lvl.id} size={14} className={level === lvl.id ? 'text-[#A4C93B]' : 'text-[#221611]'} />
                  <span>{lvl.id === 'puc' ? 'PUC (+2)' : 'Engineering'}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Tag Filter Bar */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7667]" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={t('Search experiments, domains, tags...', 'ಹುಡುಕಿ...')}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-full border border-[#D5C7B2] text-xs text-[#221611] placeholder:text-[#8C7667] focus:outline-none focus:ring-2 focus:ring-[#221611]/20 focus:border-[#221611] transition-all shadow-2xs font-medium"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {allTags.slice(0, 6).map(tg => (
                <button
                  key={tg}
                  onClick={() => setActiveTag(tg)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    activeTag === tg
                      ? 'bg-[#221611] text-white shadow-xs'
                      : 'bg-white text-[#6B564A] hover:bg-[#FAF5EB] border border-[#D5C7B2]'
                  }`}
                >
                  {tg}
                </button>
              ))}
            </div>
          </div>

          {/* Domain Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredDomains.map((domain, idx) => {
              const colType = idx % 3 === 0 ? 'left' : idx % 3 === 2 ? 'right' : 'bottom'
              const delay = (idx % 3) * 100
              return (
                <div
                  key={domain.id}
                  data-reveal={colType}
                  data-delay={delay}
                  className="bg-white rounded-3xl border border-[#D5C7B2] shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group card-hover-3d"
                >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2.5 bg-[#FAF5EB] rounded-2xl group-hover:scale-105 transition-transform border border-[#E2D7C5] text-[#221611] flex items-center justify-center">
                      <DomainIcon id={domain.id} size={24} className="text-[#221611]" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      {domain.hasAR && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8DAFF] text-[#5B1EB8] border border-[#5B1EB8]/20 font-mono">
                          <Smartphone size={10} />
                          WebAR
                        </span>
                      )}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF5EB] text-[#423126] font-bold border border-[#E2D7C5] font-mono">
                        {domain.experimentsCount} Labs
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-display font-black uppercase text-[#221611] group-hover:text-[#754F40] transition-colors">
                    {t(domain.title, domain.titleKn || domain.title)}
                  </h3>
                  <p className="text-[#6B564A] text-xs mt-1.5 leading-relaxed line-clamp-2 font-medium">
                    {domain.description}
                  </p>

                  {/* Experiments List Preview - Exactly 2 experiments */}
                  <div className="mt-5 pt-3.5 border-t border-[#E8DFC8] space-y-1.5">
                    {(domain.experiments || []).slice(0, 2).map((exp, idx) => (
                      <Link
                        key={idx}
                        to={exp.path}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF5EB] text-xs text-[#221611] font-bold transition-all duration-200 group/exp hover:translate-x-1"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FlaskConical size={13} className="text-[#754F40] shrink-0" />
                          <span className="truncate">{exp.title}</span>
                        </span>
                        <ArrowRight size={12} className="text-[#8C7667] group-hover/exp:translate-x-0.5 transition-transform flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to={domain.path}
                  className="w-full mt-5 py-2.5 text-center text-xs font-black uppercase tracking-wider rounded-full bg-[#FAF5EB] hover:bg-[#221611] text-[#221611] hover:text-[#FAF5EB] border border-[#D5C7B2] hover:border-[#221611] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>{t('Launch Lab Workstation', 'ಪ್ರಾರಂಭಿಸಿ')}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )
          })}
          </div>

          {filteredDomains.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#D5C7B2] mt-6">
              <Search size={32} className="mx-auto text-[#8C7667] mb-2" />
              <p className="text-[#221611] font-bold text-sm">No domains match your search query</p>
              <p className="text-[#8C7667] text-xs mt-1">Try searching for different keywords or clear filters</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
