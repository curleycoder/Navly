'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Bell, Loader2, Lock, SlidersHorizontal, Check, X } from 'lucide-react'
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

const categories: { value: NewsCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All updates' },
  { value: 'express-entry', label: 'Express Entry' },
  { value: 'study', label: 'Study' },
  { value: 'work', label: 'Work' },
  { value: 'pr', label: 'PR' },
  { value: 'pnp', label: 'PNP' },
  { value: 'family', label: 'Family' },
  { value: 'visitor', label: 'Visitor' },
  { value: 'general', label: 'General' },
]

function ImportanceBadge({ importance }: { importance: NewsUpdate['importance'] }) {
  const label = importance === 'high' ? 'High impact' : importance === 'medium' ? 'Medium impact' : 'Low impact'
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', importanceDot[importance])} />
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </span>
  )
}

const importanceBorder: Record<NewsUpdate['importance'], string> = {
  high:   'border-red-400 ring-1 ring-red-100',
  medium: 'border-amber-300 ring-1 ring-amber-50',
  low:    'border-slate-200',
}

function UpdateCard({ update, highlight, isPaid }: { update: NewsUpdate; highlight?: boolean; isPaid: boolean }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  return (
    <div className={cn(
      'rounded-2xl border bg-white p-5 transition hover:shadow-md',
      importanceBorder[update.importance]
    )}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {highlight && (
          <span className="flex items-center gap-1 rounded-full bg-[#D62828]/10 px-2.5 py-0.5 text-xs font-bold text-[#D62828]">
            <Bell className="h-3 w-3" /> Affects you
          </span>
        )}
        <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', categoryColors[update.category])}>
          {categoryLabels[update.category]}
        </span>
        <ImportanceBadge importance={update.importance} />
        <span className="ml-auto text-xs text-slate-400">{formatDate(update.publishedAt)}</span>
      </div>

      <h3 className="mb-2 font-bold text-[#0B1F3A] leading-snug">{update.title}</h3>
      <p className="text-sm leading-6 text-slate-600">{update.summary}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={update.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-[#0B1F3A] hover:text-[#0B1F3A] transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {update.sourceType === 'official'
            ? `Official source — ${update.sourceName}`
            : `Read more — ${update.sourceName}`}
        </a>
        {update.sourceType === 'third_party' && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            Third-party — not official IRCC
          </span>
        )}

        {isPaid ? (
          <Link
            href="/dashboard/chat"
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#162d52] transition-colors"
          >
            Ask AI how this affects me
          </Link>
        ) : (
          <div className="ml-auto flex flex-col items-end gap-1">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400 cursor-pointer hover:border-slate-300 transition-colors"
            >
              <Lock className="h-3 w-3" />
              Ask AI how this affects me
            </button>
            {showUpgradeModal && (
              <UpgradeModal plan="tracker" onClose={() => setShowUpgradeModal(false)} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'all'>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [allUpdates, setAllUpdates] = useState<NewsUpdate[]>([])
  const [personalizedIds, setPersonalizedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { plan } = usePlan()
  const isPaid = hasPlan(plan, 'report')

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data: NewsUpdate[]) => {
        setAllUpdates(data)
        const profile = loadProfile()
        if (profile?.status || profile?.goal) {
          const userTags = [profile.status, profile.goal].filter(Boolean)
          const ids = data
            .filter((u) => u.affectedUsers.some((tag) => userTags.includes(tag)))
            .map((u) => u.id)
          setPersonalizedIds(new Set(ids))
        }
        // Mark all news as read — clears the sidebar badge
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

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8">
        <Link href="/dashboard" className="mb-4 hidden md:inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>
        <p className="hidden md:block text-sm font-semibold uppercase tracking-wide text-[#D62828]">Immigration Updates</p>
        <h1 className="hidden md:block mt-1 text-3xl font-bold text-[#0B1F3A]">News & Policy Updates</h1>
        <p className="mt-2 text-slate-500">
          Official updates from IRCC and Canada Gazette, plus immigration news and commentary from third-party sources. Updates highlighted with{' '}
          <span className="inline-flex items-center gap-1 rounded-full bg-[#D62828]/10 px-2 py-0.5 text-xs font-bold text-[#D62828]">
            <Bell className="h-3 w-3" /> Affects you
          </span>{' '}
          are relevant to your profile.
        </p>
      </div>

      {/* Filter button + dropdown */}
      <div className="relative mb-6 flex items-center gap-3">
        <button
          onClick={() => setFilterOpen((v) => !v)}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
            activeCategory !== 'all'
              ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeCategory === 'all' ? 'Filter' : categoryLabels[activeCategory as NewsCategory]}
        </button>

        {activeCategory !== 'all' && (
          <button
            onClick={() => setActiveCategory('all')}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}

        {filterOpen && (
          <>
            {/* backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
            <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
              {categories.map(({ value, label }) => {
                const count = value === 'all'
                  ? allUpdates.length
                  : allUpdates.filter((u) => u.category === value).length
                if (value !== 'all' && count === 0) return null
                const active = activeCategory === value
                return (
                  <button
                    key={value}
                    onClick={() => { setActiveCategory(value); setFilterOpen(false) }}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-slate-50',
                      active ? 'font-semibold text-[#0B1F3A]' : 'text-slate-600'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {active && <Check className="h-3.5 w-3.5 text-[#0B1F3A]" />}
                      {!active && <span className="w-3.5" />}
                      {label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-500">
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
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
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Official Updates</h2>
                  <div className="flex flex-col gap-4">
                    {officialUpdates.map((update) => (
                      <UpdateCard key={update.id} update={update} highlight={personalizedIds.has(update.id)} isPaid={isPaid} />
                    ))}
                  </div>
                </section>
              )}
              {thirdPartyUpdates.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Immigration News & Commentary</h2>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Third-party — not official IRCC
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
        Official updates are sourced from IRCC and Canada Gazette. Third-party summaries are for context only — always verify policy changes at canada.ca. Nothing here is legal advice.
      </p>
    </div>
  )
}
