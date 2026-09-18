import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, GraduationCap, Cpu, Sparkles, BookOpen } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Breadcrumbs from '../components/Breadcrumbs'
import { EDUCATION_LEVELS } from '../data/domainRegistry'

export default function LevelSelection() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleSelectLevel = (levelId) => {
    localStorage.setItem('curiolabs_selected_level', levelId)
    navigate(`/catalog/${levelId}`)
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar />
        <Breadcrumbs items={[{ label: t('Select Academic Track', 'ಶೈಕ್ಷಣಿಕ ಹಂತ ಆಯ್ಕೆಮಾಡಿ') }]} />

        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <Sparkles size={13} />
              <span>{t('Curriculum & Level Pathway', 'ಪಠ್ಯಕ್ರಮ ಮತ್ತು ಮಟ್ಟದ ಹಾದಿ')}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">
              {t('Select Your Academic Level', 'ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ಮಟ್ಟವನ್ನು ಆಯ್ಕೆಮಾಡಿ')}
            </h1>
            <p className="text-slate-600 mt-3 text-sm md:text-base leading-relaxed">
              {t(
                'Personalize your virtual laboratory workspace. Choose foundational high-school science or specialized undergraduate engineering curricula.',
                'ನಿಮ್ಮ ವರ್ಚುವಲ್ ಲ್ಯಾಬ್ ಕೆಲಸದ ಸ್ಥಳವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ. PUC ಅಥವಾ ಎಂಜಿನಿಯರಿಂಗ್ ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EDUCATION_LEVELS.map(lvl => (
              <div
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl.id)}
                className="group relative bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden flex flex-col justify-between"
              >
                {/* Background soft ambient glow on hover */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-50 to-teal-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl p-3 bg-slate-100 rounded-2xl group-hover:scale-110 transition-transform">
                      {lvl.icon}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {lvl.badge}
                    </span>
                  </div>

                  <h2 className="text-2xl font-display font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {lvl.title}
                  </h2>
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                    {lvl.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>{lvl.domainsCount} Core Domains</span>
                    <span>•</span>
                    <span>{lvl.experimentsCount} Experiments</span>
                    <span>•</span>
                    <span>{lvl.id === 'engineering' ? 'WebAR Ready' : 'Interactive Canvas'}</span>
                  </div>
                </div>

                <div className="mt-8 pt-4 flex items-center justify-between text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                  <span>{t('Enter Curriculum', 'ಪ್ರವೇಶಿಸಿ')}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
