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
  low:    'border-slate-200',
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-20 rounded-full bg-slate-100" />
        <div className="h-5 w-16 rounded-full bg-slate-100" />
        <div className="ml-auto h-4 w-12 rounded bg-slate-100" />
      </div>
      <div className="mb-2 h-5 w-3/4 rounded bg-slate-100" />
      <div className="h-4 w-full rounded bg-slate-100" />
      <div className="mt-1 h-4 w-2/3 rounded bg-slate-100" />
      <div className="mt-4 h-8 w-32 rounded-lg bg-slate-100" />
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function UpdateCard({ update, highlight, isPaid }: { update: NewsUpdate; highlight?: boolean; isPaid: boolean }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  return (
    <div className={cn(
      'rounded-2xl border bg-white p-4 sm:p-5 transition hover:shadow-md',
      importanceBorder[update.importance]
    )}>
      {/* Meta row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {highlight && (
          <span className="flex items-center gap-1 rounded-full bg-[#D62828]/10 px-2.5 py-0.5 text-xs font-bold text-[#D62828]">
            <Bell className="h-3 w-3" /> Affects you
          </span>
        )}
        <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', categoryColors[update.category])}>
          {categoryLabels[update.category]}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn('h-2 w-2 rounded-full', importanceDot[update.importance])} />
          <span className="text-xs font-semibold text-slate-500">
            {update.importance === 'high' ? 'High impact' : update.importance === 'medium' ? 'Medium impact' : 'Low impact'}
          </span>
        </span>
        <span className="ml-auto text-xs text-slate-400">{formatDate(update.publishedAt)}</span>
      </div>

      <h3 className="mb-2 font-bold leading-snug text-[#0B1F3A]">{update.title}</h3>
      <p className="text-sm leading-6 text-slate-600">{update.summary}</p>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <a
          href={update.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-[#0B1F3A] hover:text-[#0B1F3A] transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {update.sourceType === 'official'
            ? `Official source — ${update.sourceName}`
            : `Read more — ${update.sourceName}`}
        </a>
        {update.sourceType === 'third_party' && (
          <span className="self-start rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            Third-party — not official IRCC
          </span>
        )}
        {isPaid ? (
          <Link
            href="/dashboard/chat"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#162d52] transition-colors sm:ml-auto"
          >
            Ask AI how this affects me
          </Link>
        ) : (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400 hover:border-slate-300 transition-colors sm:ml-auto"
          >
            <Lock className="h-3 w-3" />
            Ask AI how this affects me
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
        <Link href="/dashboard" className="mb-4 hidden md:inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>
        <p className="hidden md:block text-sm font-semibold uppercase tracking-wide text-[#D62828]">Immigration Updates</p>
        <h1 className="hidden md:block mt-1 text-3xl font-bold text-[#0B1F3A]">News & Policy Updates</h1>
        <p className="mt-1 text-sm text-slate-500">
          Updates highlighted with{' '}
          <span className="inline-flex items-center gap-1 rounded-full bg-[#D62828]/10 px-2 py-0.5 text-xs font-bold text-[#D62828]">
            <Bell className="h-3 w-3" /> Affects you
          </span>{' '}
          are relevant to your profile.
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
                    ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                )}
              >
                {label}
                <span className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
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
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              No updates in this category yet.
            </div>
          ) : (
            <>
              {officialUpdates.length > 0 && (
                <section>
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Official Updates</h2>
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
                    <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">Immigration News & Commentary</h2>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Not official IRCC
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

      <p className="mt-8 text-center text-xs text-slate-400">
        Official updates are sourced from IRCC and Canada Gazette. Third-party summaries are for context only. Nothing here is legal advice.
      </p>
    </div>
  )
}
