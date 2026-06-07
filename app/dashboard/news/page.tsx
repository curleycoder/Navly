'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Bell, Lock } from 'lucide-react'
import {
  categoryLabels,
  categoryColors,
  importanceDot,
  formatDate,
  markNewsAsRead,
  type NewsCategory,
  type NewsUpdate,
} from '@/lib/news'
import { loadProfile } from '@/lib/profile'
import { usePlan, hasPlan } from '@/lib/subscription'
import { UpgradeModal } from '@/components/ui/UpgradeModal'
import { cn } from '@/lib/utils'
import { useLocale } from '@/lib/i18n'

// ─── Cache ────────────────────────────────────────────────────────────────────

const CACHE_KEY = 'navly_news_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function readCache(): NewsUpdate[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data as NewsUpdate[]
  } catch { return null }
}

function writeCache(data: NewsUpdate[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch { /* ignore */ }
}

// ─── Categories ───────────────────────────────────────────────────────────────

const categories: { value: NewsCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'express-entry', label: 'Express Entry' },
  { value: 'study', label: 'Study' },
  { value: 'work', label: 'Work' },
  { value: 'pr', label: 'PR' },
  { value: 'pnp', label: 'PNP' },
  { value: 'family', label: 'Family' },
  { value: 'visitor', label: 'Visitor' },
  { value: 'general', label: 'General' },
]

const importanceBorder: Record<NewsUpdate['importance'], string> = {
  high:   'border-red-400 ring-1 ring-red-100',
  medium: 'border-amber-300 ring-1 ring-amber-50',
  low:    'border-subtle',
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-subtle bg-surface-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-20 rounded-full bg-subtle" />
        <div className="h-5 w-16 rounded-full bg-subtle" />
        <div className="ml-auto h-4 w-12 rounded bg-subtle" />
      </div>
      <div className="mb-2 h-5 w-3/4 rounded bg-subtle" />
      <div className="h-4 w-full rounded bg-subtle" />
      <div className="mt-1 h-4 w-2/3 rounded bg-subtle" />
      <div className="mt-4 h-8 w-32 rounded-lg bg-subtle" />
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function UpdateCard({ update, highlight, isPaid }: { update: NewsUpdate; highlight?: boolean; isPaid: boolean }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { t } = useLocale()

  return (
    <div className={cn(
      'rounded-2xl border bg-surface-card p-4 sm:p-5 transition hover:shadow-md',
      importanceBorder[update.importance]
    )}>
      {/* Meta row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {highlight && (
          <span className="flex items-center gap-1 rounded-full bg-navly-red/10 px-2.5 py-0.5 text-xs font-bold text-navly-red">
            <Bell className="h-3 w-3" /> {t('news.affectsYou')}
          </span>
        )}
        <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', categoryColors[update.category])}>
          {categoryLabels[update.category]}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full', importanceDot[update.importance])} />
          <span className="text-xs font-semibold text-muted-text">
            {update.importance === 'high' ? t('news.highImpact') : update.importance === 'medium' ? t('news.mediumImpact') : t('news.lowImpact')}
          </span>
        </span>
        <span className="ml-auto text-xs text-muted-text/70">{formatDate(update.publishedAt)}</span>
      </div>

      <h3 className="mb-2 font-bold leading-snug text-heading">{update.title}</h3>
      <p className="text-sm leading-6 text-muted-text">{update.summary}</p>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <a
          href={update.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-subtle px-3 py-2 text-xs font-semibold text-muted-text hover:border-navly-navy hover:text-heading transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {update.sourceType === 'official'
            ? `${t('news.officialSourceLabel')} ${update.sourceName}`
            : `${t('news.readMoreLabel')} ${update.sourceName}`}
        </a>
        {update.sourceType === 'third_party' && (
          <span className="self-start rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            {t('news.thirdParty')}
          </span>
        )}
        {isPaid ? (
          <Link
            href="/dashboard/chat"
            className="inline-flex items-center gap-1.5 rounded-lg bg-navly-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navly-navy/80 transition-colors sm:ml-auto"
          >
            {t('news.askAI')}
          </Link>
        ) : (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-subtle bg-surface-alt px-3 py-2 text-xs font-semibold text-muted-text/70 hover:border-subtle/80 transition-colors sm:ml-auto"
          >
            <Lock className="h-3 w-3" />
            {t('news.askAI')}
          </button>
        )}
      </div>

      {showUpgradeModal && (
        <UpgradeModal plan="tracker" onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const { t } = useLocale()
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'all'>('all')
  const [allUpdates, setAllUpdates] = useState<NewsUpdate[]>([])
  const [personalizedIds, setPersonalizedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { plan } = usePlan()
  const isPaid = hasPlan(plan, 'tracker')

  useEffect(() => {
    // Show cached data immediately
    const cached = readCache()
    if (cached) {
      setAllUpdates(cached)
      setLoading(false)
    }

    // Always refetch in background
    fetch('/api/news')
      .then((r) => r.json())
      .then((data: NewsUpdate[]) => {
        setAllUpdates(data)
        writeCache(data)
        const profile = loadProfile()
        if (profile?.status || profile?.goal) {
          const userTags = [profile.status, profile.goal].filter(Boolean)
          const ids = data
            .filter((u) => u.affectedUsers.some((tag) => userTags.includes(tag)))
            .map((u) => u.id)
          setPersonalizedIds(new Set(ids))
        }
        markNewsAsRead()
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updates = activeCategory === 'all'
    ? allUpdates
    : allUpdates.filter((u) => u.category === activeCategory)

  const officialUpdates = updates.filter((u) => u.sourceType === 'official')
  const thirdPartyUpdates = updates.filter((u) => u.sourceType === 'third_party')

  const visibleCategories = categories.filter(({ value }) =>
    value === 'all' || allUpdates.some((u) => u.category === value)
  )

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard" className="mb-4 hidden md:inline-flex items-center gap-1.5 text-sm text-muted-text hover:text-heading">
          <ArrowLeft className="h-3.5 w-3.5" /> {t('news.backToDashboard')}
        </Link>
        <p className="hidden md:block t-eyebrow text-navly-red">{t('news.eyebrow')}</p>
        <h1 className="hidden md:block mt-1 t-page-title">{t('news.title')}</h1>
        <p className="mt-1 text-sm text-muted-text">
          {t('news.affectsYouDesc')}{' '}
          <span className="inline-flex items-center gap-1 rounded-full bg-navly-red/10 px-2 py-0.5 text-xs font-bold text-navly-red">
            <Bell className="h-3 w-3" /> {t('news.affectsYou')}
          </span>{' '}
          {t('news.subtitle')}
        </p>
      </div>

      {/* Category pills — horizontally scrollable */}
      <div className="-mx-4 mb-5 sm:mx-0">
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:px-0 sm:pb-0 no-scrollbar">
          {visibleCategories.map(({ value, label }) => {
            const active = activeCategory === value
            const count = value === 'all' ? allUpdates.length : allUpdates.filter((u) => u.category === value).length
            return (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'border-navly-navy bg-navly-navy text-white'
                    : 'border-subtle bg-surface-card text-muted-text hover:border-subtle/80'
                )}
              >
                {label}
                <span className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                  active ? 'bg-white/20 text-white' : 'bg-subtle text-muted-text'
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {officialUpdates.length === 0 && thirdPartyUpdates.length === 0 ? (
            <div className="rounded-2xl border border-subtle bg-surface-card p-8 text-center text-muted-text">
              {t('news.noCategoryUpdates')}
            </div>
          ) : (
            <>
              {officialUpdates.length > 0 && (
                <section>
                  <h2 className="mb-3 t-eyebrow text-muted-text/70">{t('news.officialUpdates')}</h2>
                  <div className="flex flex-col gap-4">
                    {officialUpdates.map((update) => (
                      <UpdateCard key={update.id} update={update} highlight={personalizedIds.has(update.id)} isPaid={isPaid} />
                    ))}
                  </div>
                </section>
              )}
              {thirdPartyUpdates.length > 0 && (
                <section>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h2 className="t-eyebrow text-muted-text/70">{t('news.commentaryTitle')}</h2>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      {t('news.notOfficial')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {thirdPartyUpdates.map((update) => (
                      <UpdateCard key={update.id} update={update} highlight={personalizedIds.has(update.id)} isPaid={isPaid} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted-text/70">{t('news.disclaimer')}</p>
    </div>
  )
}
