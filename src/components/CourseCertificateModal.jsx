import { X, Award, Download, Share2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

/**
 * CourseCertificateModal — certificate-of-completion overlay.
 * Props:
 * - isOpen, onClose
 * - studentName, courseName, domainName, completedDate
 * - referenceCode
 */
export default function CourseCertificateModal({
  isOpen,
  onClose,
  studentName = 'Student',
  courseName = 'Lab Experiment',
  domainName = 'Science',
  completedDate = new Date().toLocaleDateString(),
  referenceCode = 'CL-' + Date.now().toString(36).toUpperCase(),
}) {
  const { t } = useLanguage()

  if (!isOpen) return null

  const handleDownload = () => {
    // Create a simple text certificate for download
    const certText = `
═══════════════════════════════════════════
       CERTIFICATE OF COMPLETION
           CurioLabs Platform
═══════════════════════════════════════════

This certifies that

       ${studentName}

has successfully completed the lab:

       ${courseName}

in the domain of ${domainName}

Date: ${completedDate}
Reference: ${referenceCode}

═══════════════════════════════════════════
    `
    const blob = new Blob([certText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `CurioLabs_Certificate_${referenceCode}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Close button */}
        <div className="flex justify-end p-3">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Certificate body */}
        <div className="px-8 pb-8">
          {/* Ornate border container */}
          <div className="border-4 border-double border-amber-400 rounded-xl p-6 text-center relative">
            {/* Corner decorations */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500"></div>

            {/* Seal icon */}
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <Award size={32} className="text-white" />
              </div>
            </div>

            <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">
              {t('Certificate of Completion', 'ಪೂರ್ಣಗೊಳಿಸಿದ ಪ್ರಮಾಣಪತ್ರ')}
            </p>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-1">CurioLabs</h2>
            
            <div className="my-4 border-t border-amber-200"></div>

            <p className="text-sm text-gray-600 mb-1">{t('This certifies that', 'ಇದು ಪ್ರಮಾಣೀಕರಿಸುತ್ತದೆ')}</p>
            <p className="text-xl font-display font-bold text-teal-600 mb-1">{studentName}</p>
            <p className="text-sm text-gray-600 mb-1">{t('has successfully completed', 'ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿದ್ದಾರೆ')}</p>
            <p className="text-lg font-bold text-gray-800 mb-1">{courseName}</p>
            <p className="text-sm text-gray-500">{t('in', 'ವಿಭಾಗ')} {domainName}</p>

            <div className="my-4 border-t border-amber-200"></div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('Date', 'ದಿನಾಂಕ')}: {completedDate}</span>
              <span>{t('Ref', 'ಉಲ್ಲೇಖ')}: {referenceCode}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5 justify-center">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Download size={16} />
              {t('Download', 'ಡೌನ್‌ಲೋಡ್')}
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'CurioLabs Certificate', text: `I completed ${courseName}!` })
                }
              }}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Share2 size={16} />
              {t('Share', 'ಹಂಚಿಕೊಳ್ಳಿ')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
