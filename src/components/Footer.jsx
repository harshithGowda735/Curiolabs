import { FlaskConical, Github, Heart } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="bg-slate-900 text-gray-400 py-8 px-4 safe-bottom">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FlaskConical size={20} className="text-teal-400" />
            <span className="font-display font-bold text-white">CurioLabs</span>
            <span className="text-xs">— {t('Virtual & AR Lab Platform', 'ವರ್ಚುವಲ್ ಮತ್ತು AR ಲ್ಯಾಬ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್')}</span>
          </div>
          <p className="text-xs flex items-center gap-1">
            {t('Made with', 'ನಿರ್ಮಿಸಲಾಗಿದೆ')} <Heart size={12} className="text-red-400" /> {t('for students everywhere', 'ಎಲ್ಲೆಡೆಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗಾಗಿ')}
          </p>
        </div>
      </div>
    </footer>
  )
}
