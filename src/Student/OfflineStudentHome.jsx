import { useLanguage } from '../contexts/LanguageContext'

export default function OfflineStudentHome() {
  const { t } = useLanguage()
  const cachedLabs = JSON.parse(localStorage.getItem('curiolabs_cached_labs') || '[]')
  
  return (
    <div className="min-h-[100dvh] bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">📡</span>
          <h1 className="text-2xl font-display font-bold text-gray-800 mb-2">
            {t('Offline Mode', 'ಆಫ್‌ಲೈನ್ ಮೋಡ್')}
          </h1>
          <p className="text-gray-500">{t('You can still access labs you\'ve visited before.', 'ನೀವು ಮೊದಲು ಭೇಟಿ ನೀಡಿದ ಲ್ಯಾಬ್‌ಗಳನ್ನು ಇನ್ನೂ ಪ್ರವೇಶಿಸಬಹುದು.')}</p>
        </div>
        {cachedLabs.length > 0 ? (
          <div className="space-y-2">
            {cachedLabs.map((lab, i) => (
              <a key={i} href={lab.path} className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-800">{lab.name}</h3>
                <p className="text-xs text-gray-400">Cached {new Date(lab.cachedAt).toLocaleDateString()}</p>
              </a>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <p className="text-gray-400">{t('No cached labs yet. Visit labs while online to cache them.', 'ಇನ್ನೂ ಯಾವುದೇ ಕ್ಯಾಶ್ ಮಾಡಿದ ಲ್ಯಾಬ್ ಇಲ್ಲ.')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
