import { WifiOff } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export default function OfflineModeBanner() {
  const { t } = useLanguage()
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 sticky top-0 z-50 shadow-sm">
      <WifiOff size={16} />
      {t('You are offline. Cached labs remain accessible.', 'ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ. ಸಂಗ್ರಹಿಸಿದ ಲ್ಯಾಬ್‌ಗಳು ಲಭ್ಯವಿವೆ.')}
    </div>
  )
}
