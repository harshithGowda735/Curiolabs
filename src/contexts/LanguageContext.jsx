import { createContext, useContext, useState, useCallback } from 'react'

const LanguageContext = createContext(null)

// Translation helper — takes English and Kannada strings
// Usage: t('Hello', 'ನಮಸ್ಕಾರ')
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('curiolabs_lang') || 'en')

  const toggleLanguage = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'kn' : 'en'
      localStorage.setItem('curiolabs_lang', next)
      return next
    })
  }, [])

  const t = useCallback((en, kn) => {
    return lang === 'kn' && kn ? kn : en
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
