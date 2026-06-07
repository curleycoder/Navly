'use client'

import { useLocale } from '@/lib/i18n'

export function LanguageToggle() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex items-center gap-1 rounded-xl border border-subtle bg-surface-alt p-1">
      <button
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
          locale === 'en'
            ? 'bg-navly-navy text-white'
            : 'text-muted-text hover:text-heading'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('fr')}
        aria-pressed={locale === 'fr'}
        className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
          locale === 'fr'
            ? 'bg-navly-navy text-white'
            : 'text-muted-text hover:text-heading'
        }`}
      >
        FR
      </button>
    </div>
  )
}
