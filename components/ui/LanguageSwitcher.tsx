'use client'

/**
 * LanguageSwitcher — drop into Sidebar or MobileNav when ready to ship French.
 *
 * Usage (Sidebar.tsx example):
 *   import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
 *   <LanguageSwitcher />
 *
 * The button is intentionally minimal so it fits any nav layout.
 * Swap `variant="compact"` for a full inline toggle if preferred.
 */

import { useLocale, localeNames, type LocaleCode } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const ALL_LOCALES = Object.keys(localeNames) as LocaleCode[]

/** Compact pill toggle — EN | FR */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale()

  return (
    <div
      role="group"
      aria-label="Language / Langue"
      className={cn('flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-50 p-0.5', className)}
    >
      {ALL_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          aria-label={localeNames[code]}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold transition-all',
            locale === code
              ? 'bg-[#0B1F3A] text-white shadow-sm'
              : 'text-slate-500 hover:text-[#0B1F3A]'
          )}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
