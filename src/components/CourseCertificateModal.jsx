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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#221611]/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#FAF5EB] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-[#221611]">
        {/* Close button */}
        <div className="flex justify-between items-center p-4 bg-[#221611] text-[#FAF5EB] border-b-2 border-[#221611]">
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#A4C93B]">
            Official Credential Record
          </span>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#332219] hover:bg-[#442c20] text-[#FAF5EB]/70 hover:text-white rounded-xl border border-[#FAF5EB]/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate body */}
        <div className="p-6 sm:p-8">
          {/* Ornate border container */}
          <div className="bg-white border-2 border-[#221611] rounded-2xl p-6 text-center relative shadow-[3px_3px_0px_#221611]">
            {/* Corner decorations */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#221611]"></div>
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#221611]"></div>
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#221611]"></div>
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#221611]"></div>

            {/* Seal icon */}
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-[#221611] border-2 border-[#A4C93B] flex items-center justify-center shadow-lg">
                <Award size={32} className="text-[#A4C93B]" />
              </div>
            </div>

            <p className="text-xs uppercase tracking-widest text-[#221611]/60 font-mono font-bold mb-1">
              {t('Certificate of Completion', 'ಪೂರ್ಣಗೊಳಿಸಿದ ಪ್ರಮಾಣಪತ್ರ')}
            </p>
            <h2 className="text-2xl font-black text-[#221611] mb-1 tracking-tight uppercase">CurioLabs</h2>
            
            <div className="my-3 border-t-2 border-[#221611]/15"></div>

            <p className="text-xs text-[#221611]/70 font-medium mb-1">{t('This certifies that', 'ಇದು ಪ್ರಮಾಣೀಕರಿಸುತ್ತದೆ')}</p>
            <p className="text-xl font-black text-[#221611] mb-1 underline decoration-[#A4C93B] decoration-4 underline-offset-4">{studentName}</p>
            <p className="text-xs text-[#221611]/70 font-medium mb-1 mt-2">{t('has successfully completed', 'ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಿದ್ದಾರೆ')}</p>
            <p className="text-base font-extrabold text-[#221611] mb-1">{courseName}</p>
            <p className="text-xs font-mono font-bold text-[#221611]/60">{t('in', 'ವಿಭಾಗ')} {domainName}</p>

            <div className="my-3 border-t-2 border-[#221611]/15"></div>

            <div className="flex justify-between text-[11px] font-mono font-bold text-[#221611]/60">
              <span>{t('Date', 'ದಿನಾಂಕ')}: {completedDate}</span>
              <span>{t('Ref', 'ಉಲ್ಲೇಖ')}: {referenceCode}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5 justify-center">
            <button 
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-[#A4C93B] hover:bg-[#93b533] text-[#221611] font-black px-4 py-2.5 rounded-xl border-2 border-[#221611] shadow-[2px_2px_0px_#221611] hover:shadow-[1px_1px_0px_#221611] hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-xs"
            >
              <Download size={16} />
              <span>{t('Download', 'ಡೌನ್‌ಲೋಡ್')}</span>
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'CurioLabs Certificate', text: `I completed ${courseName}!` })
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-[#FAF5EB] text-[#221611] font-bold px-4 py-2.5 rounded-xl border-2 border-[#221611] shadow-[2px_2px_0px_#221611] transition-all text-xs"
            >
              <Share2 size={16} />
              <span>{t('Share', 'ಹಂಚಿಕೊಳ್ಳಿ')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
