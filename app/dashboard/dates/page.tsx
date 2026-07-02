'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Clock, CheckCircle2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { syncProfile, type IntakeData } from '@/lib/profile'
import {
  getActiveDeadlines,
  formatDeadlineDate,
  type Deadline,
  type DeadlineStatus,
} from '@/lib/deadlines'
import { DashboardSkeleton } from '@/components/ui/Skeleton'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DeadlineStatus, {
  label: string
  cardClass: string
  borderClass: string
  textClass: string
  subTextClass: string
  tagClass: string
  icon: typeof AlertTriangle
  iconClass: string
}> = {
  expired: {
    label: 'Expired',
    cardClass: 'bg-red-50',
    borderClass: 'border-l-red-500',
    textClass: 'text-red-900',
    subTextClass: 'text-red-700',
    tagClass: 'bg-red-100 text-red-700',
    icon: AlertTriangle,
    iconClass: 'text-red-500',
  },
  urgent: {
    label: 'Urgent',
    cardClass: 'bg-amber-50',
    borderClass: 'border-l-amber-400',
    textClass: 'text-amber-900',
    subTextClass: 'text-amber-700',
    tagClass: 'bg-amber-100 text-amber-700',
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
  },
  action_soon: {
    label: 'Coming up',
    cardClass: 'bg-blue-50',
    borderClass: 'border-l-blue-400',
    textClass: 'text-blue-900',
    subTextClass: 'text-blue-700',
    tagClass: 'bg-blue-100 text-blue-700',
    icon: Clock,
    iconClass: 'text-blue-500',
  },
  on_track: {
    label: 'On track',
    cardClass: 'bg-green-50',
    borderClass: 'border-l-green-400',
    textClass: 'text-green-900',
    subTextClass: 'text-green-700',
    tagClass: 'bg-green-100 text-green-700',
    icon: CheckCircle2,
    iconClass: 'text-green-500',
  },
}

// ─── Deadline card ────────────────────────────────────────────────────────────

function DeadlineCard({ d }: { d: Deadline }) {
  const cfg = STATUS_CONFIG[d.status]
  const Icon = cfg.icon

  const daysLabel =
    d.status === 'expired'
      ? `${Math.abs(d.daysUntil)} day${Math.abs(d.daysUntil) !== 1 ? 's' : ''} ago`
      : `${d.daysUntil} day${d.daysUntil !== 1 ? 's' : ''} left`

  return (
    <div className={`rounded-2xl border-l-4 p-4 ${cfg.cardClass} ${cfg.borderClass}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.iconClass}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-bold ${cfg.textClass}`}>{d.label}</p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.tagClass}`}>
              {daysLabel}
            </span>
          </div>
          <p className={`mt-0.5 text-xs ${cfg.subTextClass}`}>
            {formatDeadlineDate(d.date)}
            {d.source === 'calculated' && (
              <span className="ml-1 opacity-70">(estimated)</span>
            )}
          </p>
          <p className={`mt-2 text-xs leading-relaxed ${cfg.subTextClass}`}>{d.action}</p>
          {d.note && (
            <p className={`mt-1.5 text-xs leading-relaxed opacity-75 ${cfg.subTextClass}`}>{d.note}</p>
          )}
          <a
            href={d.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold underline-offset-2 hover:underline ${cfg.subTextClass}`}
          >
            Official guidance
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, items }: { title: string; items: Deadline[] }) {
  if (items.length === 0) return null
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-text">{title}</p>
      {items.map((d) => <DeadlineCard key={d.id} d={d} />)}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DatesPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function init() {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()
      const profile: IntakeData | null = user
        ? await import('@/lib/profile').then(m => m.syncProfile(user.id))
        : null
      setDeadlines(profile ? getActiveDeadlines(profile) : [])
      setLoaded(true)
    }
    init()
  }, [])

  if (!loaded) return <DashboardSkeleton />

  const expired = deadlines.filter(d => d.status === 'expired')
  const urgent = deadlines.filter(d => d.status === 'urgent')
  const actionSoon = deadlines.filter(d => d.status === 'action_soon')
  const onTrack = deadlines.filter(d => d.status === 'on_track')
  const hasActionRequired = expired.length + urgent.length > 0

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 pb-24">

        <div>
          <h1 className="t-page-title">Important Dates</h1>
          <p className="mt-1 t-body">Key expiry dates and deadlines based on your profile.</p>
        </div>

        {deadlines.length === 0 && (
          <div className="rounded-2xl border border-dashed border-subtle bg-surface-card p-8 text-center">
            <p className="text-sm font-semibold text-heading">No dates to show yet</p>
            <p className="mt-1 text-xs text-muted-text">
              Complete your profile to see expiry dates and deadline reminders.
            </p>
            <Link
              href="/onboarding"
              className="mt-4 inline-flex items-center rounded-xl bg-navly-red px-4 py-2 text-xs font-bold text-white transition hover:bg-navly-red/80"
            >
              Complete profile
            </Link>
          </div>
        )}

        {hasActionRequired && (
          <Section title="Action Required" items={[...expired, ...urgent]} />
        )}

        <Section title="Coming Up" items={actionSoon} />
        <Section title="On Track" items={onTrack} />

        <p className="pb-2 text-center text-xs text-muted-text/70">
          Dates are estimates based on information you entered. Always verify with official IRCC sources before making decisions.
        </p>

      </div>
    </div>
  )
}
