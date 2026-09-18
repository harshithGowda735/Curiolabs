import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Users, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function RoleSelection() {
  const { createProfile, currentUser } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [studentMode, setStudentMode] = useState(false)

  const handleSelectStudentLevel = async (levelId) => {
    await createProfile(currentUser, 'student', { academicLevel: levelId, branch: levelId })
    localStorage.setItem('curiolabs_selected_level', levelId)
    navigate(`/catalog/${levelId}`)
  }

  const handleSelectTeacher = async () => {
    await createProfile(currentUser, 'faculty')
    navigate('/faculty')
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-4 border border-white/15">
          <Sparkles size={12} className="text-amber-400" />
          <span>CurioLabs Gateway</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
          {t('Welcome to CurioLabs', 'CurioLabs ಗೆ ಸ್ವಾಗತ')}
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mb-8">
          {t('Choose your role and academic track to enter your personalized laboratory', 'ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ')}
        </p>
        
        {!studentMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Button */}
            <div
              onClick={() => setStudentMode(true)}
              className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-center group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <GraduationCap size={32} className="text-white" />
                </div>
                <h2 className="font-display font-bold text-slate-900 text-xl mb-1">
                  {t('Student', 'ವಿದ್ಯಾರ್ಥಿ')}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('Choose between PUC and Engineering virtual laboratory tracks', 'PUC ಅಥವಾ ಎಂಜಿನಿಯರಿಂಗ್ ಲ್ಯಾಬ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ')}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-bold text-indigo-600">
                <span>Select Academic Track</span>
                <ArrowRight size={13} />
              </div>
            </div>

            {/* Teacher Button */}
            <div
              onClick={handleSelectTeacher}
              className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-center group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <Users size={32} className="text-white" />
                </div>
                <h2 className="font-display font-bold text-slate-900 text-xl mb-1">
                  {t('Teacher / Faculty', 'ಶಿಕ್ಷಕ')}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('Create custom labs, assign cohorts, monitor live telemetry & export reports', 'ಲ್ಯಾಬ್ ರಚಿಸಿ, ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ')}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-bold text-purple-600">
                <span>Open Faculty Console</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        ) : (
          /* Student Sub-level Selection */
          <div className="bg-white rounded-3xl p-6 shadow-2xl text-left animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">Select Student Track</h3>
                <p className="text-xs text-slate-500">Pick your current academic degree level:</p>
              </div>
              <button
                onClick={() => setStudentMode(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold p-1"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSelectStudentLevel('puc')}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏫</span>
                    <span className="font-bold text-slate-900 group-hover:text-teal-700 text-sm">
                      PUC Foundation (+2 Science)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Physics, Chemistry, Biology & Computer Science (20 Experiments)
                  </p>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
              </button>

              <button
                onClick={() => handleSelectStudentLevel('engineering')}
                className="w-full p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-left flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <span className="font-bold text-slate-900 group-hover:text-indigo-700 text-sm">
                      Undergraduate Engineering (B.Tech / B.E)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Electronics, Robotics (+AR), Cyber, Aero, AI/ML, IoT (35 Experiments)
                  </p>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
