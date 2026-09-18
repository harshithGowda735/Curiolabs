import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Search, Sparkles, ArrowRight, Smartphone, Filter } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { DOMAIN_REGISTRY, EDUCATION_LEVELS } from '../data/domainRegistry'

export default function DomainCatalog() {
  const { level = 'engineering' } = useParams()
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTag, setActiveTag] = useState('ALL')

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

  const breadcrumbItems = [
    { label: t('Academic Tracks', 'ಶೈಕ್ಷಣಿಕ ಹಂತ'), path: '/level-select' },
    { label: currentLevelInfo.shortTitle }
  ]

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar />
        <Breadcrumbs items={breadcrumbItems} />

        {/* Hero Header */}
        <div className={`bg-gradient-to-r ${currentLevelInfo.gradient} text-white px-4 py-10 shadow-inner`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-white text-xs font-semibold mb-2">
                <span>{currentLevelInfo.icon}</span>
                <span>{currentLevelInfo.badge}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                {currentLevelInfo.title}
              </h1>
              <p className="text-white/80 text-sm mt-1 max-w-xl">
                {currentLevelInfo.description}
              </p>
            </div>

            {/* Track Switcher */}
            <div className="flex bg-white/10 backdrop-blur p-1 rounded-xl border border-white/20 self-start md:self-auto">
              {EDUCATION_LEVELS.map(lvl => (
                <Link
                  key={lvl.id}
                  to={`/catalog/${lvl.id}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    level === lvl.id ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {lvl.shortTitle}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Tag Filter Bar */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={t('Search experiments, domains, tags...', 'ಹುಡುಕಿ...')}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {allTags.slice(0, 6).map(tg => (
                <button
                  key={tg}
                  onClick={() => setActiveTag(tg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTag === tg
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tg}
                </button>
              ))}
            </div>
          </div>

          {/* Domain Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {filteredDomains.map(domain => (
              <div
                key={domain.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 bg-slate-50 rounded-xl group-hover:scale-105 transition-transform">
                      {domain.icon}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {domain.hasAR && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Smartphone size={10} />
                          WebAR
                        </span>
                      )}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {domain.experimentsCount} Labs
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-display font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {t(domain.title, domain.titleKn || domain.title)}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">
                    {domain.description}
                  </p>

                  {/* Experiments List Preview */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    {(domain.experiments || []).slice(0, 3).map((exp, idx) => (
                      <Link
                        key={idx}
                        to={exp.path}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 text-xs text-slate-700 transition-colors group/exp"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{exp.icon || '🔬'}</span>
                          <span className="truncate">{exp.title}</span>
                        </span>
                        <ArrowRight size={12} className="text-slate-400 group-hover/exp:translate-x-0.5 transition-transform flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to={domain.path}
                  className="w-full mt-4 py-2 text-center text-xs font-bold rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-all flex items-center justify-center gap-1"
                >
                  <span>{t('View All Experiments', 'ಎಲ್ಲಾ ಪ್ರಯೋಗಗಳನ್ನು ನೋಡಿ')}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>

          {filteredDomains.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 mt-6">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-slate-700 font-semibold text-sm">No domains match your search query</p>
              <p className="text-slate-400 text-xs mt-1">Try searching for different keywords or clear filters</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
