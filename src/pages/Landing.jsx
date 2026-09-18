import { Link } from 'react-router-dom'
import { FlaskConical, Zap, Globe, Smartphone, ArrowRight, Sparkles, GraduationCap, Users, Cpu, ShieldCheck } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const features = [
  { icon: FlaskConical, title: 'Virtual & AR Labs', desc: 'Real mathematical & physics engines — zero canned video clips' },
  { icon: Smartphone, title: 'WebAR on Any Phone', desc: 'Project 3D breadboards & robotic arms into your room' },
  { icon: Globe, title: 'Bilingual Interface', desc: 'Instant toggle between English & Kannada (ಕನ್ನಡ)' },
  { icon: Zap, title: 'Works Offline', desc: 'PWA-enabled for uninterrupted access without internet' },
]

export default function Landing() {
  const { t } = useLanguage()
  const { currentUser, userRole } = useAuth()

  const dashboardPath = currentUser 
    ? (userRole === 'teacher' ? '/faculty' : '/student')
    : '/login'

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-16 md:py-24">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-10 left-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-xs font-semibold mb-6 border border-white/15">
              <Sparkles size={14} className="text-amber-400" />
              <span>{t('AI-Powered Virtual Engineering & Science Laboratory Operating System', 'AI-ಚಾಲಿತ ವರ್ಚುವಲ್ ಲ್ಯಾಬೊರೇಟರಿ')}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight max-w-4xl mx-auto leading-tight">
              {t('Virtual Labs Built for', 'ವರ್ಚುವಲ್ ಲ್ಯಾಬ್‌ಗಳು')}{' '}
              <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                {t('Students & Faculty', 'ವಿದ್ಯಾರ್ಥಿಗಳು ಮತ್ತು ಶಿಕ್ಷಕರಿಗಾಗಿ')}
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-300 mt-4 max-w-2xl mx-auto leading-relaxed">
              {t(
                'High-fidelity simulations, WebAR hardware projection, and automated AI viva evaluation across PUC and Undergraduate Engineering.',
                'PUC ಮತ್ತು ಪದವಿಪೂರ್ವ ಎಂಜಿನಿಯರಿಂಗ್ ವಿಭಾಗಗಳಿಗೆ ಸಂವಾದಾತ್ಮಕ ಪ್ರಯೋಗಾಲಯಗಳು.'
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link 
                to="/level-select"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-teal-500/25 transition-all hover:scale-105 text-sm"
              >
                <span>{t('Enter Student Labs', 'ವಿದ್ಯಾರ್ಥಿ ಲ್ಯಾಬ್ ಪ್ರವೇಶಿಸಿ')}</span>
                <ArrowRight size={16} />
              </Link>
              <Link 
                to="/faculty"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold px-8 py-3 rounded-2xl transition-all border border-white/10 text-sm"
              >
                <Users size={16} />
                <span>{t('Faculty Command Console', 'ಶಿಕ್ಷಕರ ಕನ್ಸೋಲ್')}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Clean Apple-style Entry Gateways: Student vs Faculty */}
        <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* STUDENT GATEWAY CARD */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <GraduationCap size={24} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Student Portal
                  </span>
                </div>

                <h2 className="text-2xl font-display font-bold text-slate-900">
                  {t('I am a Student', 'ನಾನು ವಿದ್ಯಾರ್ಥಿ')}
                </h2>
                <p className="text-slate-500 text-xs mt-1 mb-6 leading-relaxed">
                  {t(
                    'Select your academic level below to launch verified curriculum experiments and automated AI evaluations:',
                    'ಪ್ರಯೋಗಗಳನ್ನು ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ಹಂತವನ್ನು ಆಯ್ಕೆಮಾಡಿ:'
                  )}
                </p>

                {/* Sub-level options for Student */}
                <div className="space-y-3">
                  <Link
                    to="/catalog/puc"
                    className="group/puc p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50/60 hover:border-teal-300 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏫</span>
                        <span className="font-bold text-slate-900 group-hover/puc:text-teal-700 text-sm">
                          PUC Foundation (+2 Science)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Physics • Chemistry • Biology • Computer Science
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white group-hover/puc:bg-teal-600 group-hover/puc:text-white flex items-center justify-center transition-all shadow-sm">
                      <ArrowRight size={14} />
                    </div>
                  </Link>

                  <Link
                    to="/catalog/engineering"
                    className="group/eng p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50/60 hover:border-indigo-300 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span className="font-bold text-slate-900 group-hover/eng:text-indigo-700 text-sm">
                          Undergraduate Engineering (B.Tech / B.E)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Electronics • Robotics (+AR) • Cyber • Aerospace • AI/ML • IoT
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white group-hover/eng:bg-indigo-600 group-hover/eng:text-white flex items-center justify-center transition-all shadow-sm">
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>40+ Experiments</span>
                <span>•</span>
                <span>Automated AI Viva</span>
                <span>•</span>
                <span>Instant Certificate</span>
              </div>
            </div>

            {/* FACULTY GATEWAY CARD */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    Faculty Console
                  </span>
                </div>

                <h2 className="text-2xl font-display font-bold text-slate-900">
                  {t('I am a Faculty / Teacher', 'ನಾನು ಶಿಕ್ಷಕ')}
                </h2>
                <p className="text-slate-500 text-xs mt-1 mb-6 leading-relaxed">
                  {t(
                    'Access complete laboratory management tools to author experiments, monitor live cohorts, and generate accreditation reports:',
                    'ಪ್ರಯೋಗಗಳನ್ನು ರಚಿಸಿ, ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ ಮತ್ತು ವರದಿಗಳನ್ನು ರಚಿಸಿ:'
                  )}
                </p>

                <div className="space-y-2 text-xs text-slate-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span><strong>Live Telemetry:</strong> Monitor student simulation parameters in real time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span><strong>Lab Authoring:</strong> Create custom experiments with custom tolerance bounds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span><strong>AI Grading Audit:</strong> Review automated viva answers with override controls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span><strong>Accreditation:</strong> Generate ABET and NAAC outcome attainment reports</span>
                  </div>
                </div>
              </div>

              <Link
                to="/faculty"
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>{t('Open Faculty Console', 'ಶಿಕ್ಷಕರ ಕನ್ಸೋಲ್ ತೆರೆಯಿರಿ')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 text-center hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3 text-teal-600">
                  <f.icon size={20} />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-sm mb-1">{t(f.title, f.title)}</h3>
                <p className="text-xs text-slate-500">{t(f.desc, f.desc)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
