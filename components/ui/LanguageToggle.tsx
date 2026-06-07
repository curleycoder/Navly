'use client'

import { useEffect, useState } from 'react'

export type AppLanguage = 'en' | 'fr'

export function LanguageToggle() {
  const [lang, setLang] = useState<AppLanguage>('en')

  useEffect(() => {
    const stored = localStorage.getItem('language') as AppLanguage | null
    if (stored === 'en' || stored === 'fr') setLang(stored)
  }, [])

  function select(next: AppLanguage) {
    setLang(next)
    localStorage.setItem('language', next)
    document.documentElement.lang = next === 'fr' ? 'fr-CA' : 'en-CA'
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border border-subtle bg-surface-alt p-1">
      <button
        onClick={() => select('en')}
        aria-pressed={lang === 'en'}
        className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
          lang === 'en'
            ? 'bg-navly-navy text-white'
            : 'text-muted-text hover:text-heading'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => select('fr')}
        aria-pressed={lang === 'fr'}
        className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
          lang === 'fr'
            ? 'bg-navly-navy text-white'
            : 'text-muted-text hover:text-heading'
        }`}
      >
        FR
      </button>
    </div>
  )
}
