'use client'

/**
 * Navly i18n — zero-dependency locale system.
 *
 * Usage:
 *   const { t, locale, setLocale } = useLocale()
 *   t('common.continue')         // → 'Continue' | 'Continuer'
 *   t('onboarding.locationTitle') // → 'Are you currently in Canada?' | …
 *
 * To add a new locale:
 *   1. Create lib/locales/xx.ts satisfying LocaleDict
 *   2. Add it to the `locales` map below
 *   3. Add it to the LanguageSwitcher options
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { en, type LocaleDict } from './locales/en'
import { fr } from './locales/fr'

// ─── Supported locales ──────────────────────────────────────────────────────

export type LocaleCode = 'en' | 'fr'

const locales: Record<LocaleCode, LocaleDict> = { en, fr }

export const localeNames: Record<LocaleCode, string> = {
  en: 'English',
  fr: 'Français',
}

const STORAGE_KEY = 'navly_locale'
const DEFAULT_LOCALE: LocaleCode = 'en'

function isLocaleCode(v: unknown): v is LocaleCode {
  return typeof v === 'string' && v in locales
}

// ─── Dot-notation key lookup ────────────────────────────────────────────────

// Build a union of all valid dot-paths from LocaleDict (two levels deep — section.key)
type Section = keyof LocaleDict
type TKey = { [S in Section]: `${S & string}.${keyof LocaleDict[S] & string}` }[Section]

function lookup(dict: LocaleDict, key: TKey): string {
  const dot = key.indexOf('.')
  const section = key.slice(0, dot) as Section
  const field = key.slice(dot + 1) as keyof LocaleDict[Section]
  const val = (dict[section] as Record<string, string>)[field as string]
  if (process.env.NODE_ENV === 'development' && val === undefined) {
    console.warn(`[i18n] Missing key: "${key}"`)
  }
  return val ?? key
}

// ─── Context ─────────────────────────────────────────────────────────────────

type LocaleContextValue = {
  locale: LocaleCode
  setLocale: (code: LocaleCode) => void
  t: (key: TKey) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (isLocaleCode(stored)) setLocaleState(stored)
    } catch {
      // localStorage unavailable (SSR / private mode) — use default
    }
  }, [])

  // Update <html lang> whenever locale changes
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      // ignore
    }
  }, [])

  const t = useCallback((key: TKey) => lookup(locales[locale], key), [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return ctx
}
