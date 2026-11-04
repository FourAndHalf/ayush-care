import { createContext, useContext, useEffect, useState } from 'react'

const LangContext = createContext({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)

// Inline bilingual text: <T en="Hello" ml="ഹലോ" />
export function T({ en, ml }) {
  const { lang } = useLang()
  return lang === 'ml' ? (
    <span className="ml" lang="ml">
      {ml}
    </span>
  ) : (
    <span>{en}</span>
  )
}
