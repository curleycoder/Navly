'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Bell } from 'lucide-react'
import {
  getUpdates,
  categoryLabels,
  categoryColors,
  importanceDot,
  formatDate,
  type NewsCategory,
  type NewsUpdate,
} from '@/lib/news'
import { loadProfile } from '@/lib/profile'
import { getPersonalizedUpdates } from '@/lib/news'
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

function UpdateCard({ update, highlight }: { update: NewsUpdate; highlight?: boolean }) {
  return (
    <div className={cn(
      'rounded-2xl border bg-white p-5 transition hover:shadow-md',
      highlight ? 'border-[#D62828]/30 ring-1 ring-[#D62828]/20' : 'border-slate-200'
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
          Read official update — {update.sourceName}
        </a>
        <Link
          href="/dashboard/chat"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#162d52] transition-colors"
        >
          Ask AI how this affects me
        </Link>
      </div>
    </div>
  )
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'all'>('all')
  const [personalizedIds, setPersonalizedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const profile = loadProfile()
    if (profile?.status || profile?.goal) {
      const personalized = getPersonalizedUpdates(profile.status, profile.goal)
      setPersonalizedIds(new Set(personalized.map((u) => u.id)))
    }
  }, [])

  const updates = activeCategory === 'all'
    ? getUpdates()
    : getUpdates({ category: activeCategory })

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">Immigration Updates</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">News & Policy Updates</h1>
        <p className="mt-2 text-slate-500">
          Official updates from IRCC, Canada Gazette, and government notices. Updates highlighted with{' '}
          <span className="inline-flex items-center gap-1 rounded-full bg-[#D62828]/10 px-2 py-0.5 text-xs font-bold text-[#D62828]">
            <Bell className="h-3 w-3" /> Affects you
          </span>{' '}
          are relevant to your profile.
        </p>
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              activeCategory === value
                ? 'bg-[#0B1F3A] text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-[#0B1F3A] hover:text-[#0B1F3A]'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Update cards */}
      <div className="flex flex-col gap-4">
        {updates.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No updates in this category yet.
          </div>
        ) : (
          updates.map((update) => (
            <UpdateCard
              key={update.id}
              update={update}
              highlight={personalizedIds.has(update.id)}
            />
          ))
        )}
      </div>

      {/* Source disclaimer */}
      <p className="mt-8 text-center text-xs text-slate-400">
        All updates are sourced from official Canadian government channels. Summaries are provided for educational purposes only and are not legal advice. Always verify at canada.ca.
      </p>
    </div>
  )
}
