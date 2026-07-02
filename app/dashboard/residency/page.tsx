'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, ExternalLink } from 'lucide-react'
import { syncProfile, type IntakeData } from '@/lib/profile'
import { syncPresence, type PresenceData, EMPTY_PRESENCE } from '@/lib/presence'
import { computePRResidency, type PRResidencyResult } from '@/lib/pr-math'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { track } from '@/lib/analytics'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(s: string) {
  return new Date(s + 'T12:00:00').toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function ProgressBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResidencyPage() {
  const [result, setResult] = useState<PRResidencyResult | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function init() {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoaded(true); return }
      const [profile, presence] = await Promise.all([
        syncProfile(user.id) as Promise<IntakeData | null>,
        syncPresence(user.id),
      ])
      if (profile) setResult(computePRResidency(profile, presence))
      track('residency_tracker_viewed', { authenticated: true })
      setLoaded(true)
    }
    init()
  }, [])

  if (!loaded) return <DashboardSkeleton />

  if (!result) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-24">
          <h1 className="t-page-title">PR Residency Obligation</h1>
          <p className="mt-4 t-body">Complete your profile to use this tracker.</p>
          <Link href="/onboarding" className="mt-4 inline-flex items-center rounded-xl bg-navly-red px-4 py-2 text-sm font-bold text-white hover:bg-navly-red/80">
            Complete profile
          </Link>
        </div>
      </div>
    )
  }

  const { daysInCanada, daysRequired, daysNeeded, daysBuffer, windowStart, windowEnd, status, estimatedMeetDate, hasPRDate } = result

  const statusConfig = {
    on_track: {
      icon: CheckCircle2,
      iconClass: 'text-green-500',
      cardClass: 'border-green-200 bg-green-50',
      label: 'On track',
      labelClass: 'bg-green-100 text-green-700',
      barClass: 'bg-green-500',
    },
    at_risk: {
      icon: Clock,
      iconClass: 'text-amber-500',
      cardClass: 'border-amber-200 bg-amber-50',
      label: 'Below threshold',
      labelClass: 'bg-amber-100 text-amber-700',
      barClass: 'bg-amber-400',
    },
    breach: {
      icon: AlertTriangle,
      iconClass: 'text-red-500',
      cardClass: 'border-red-200 bg-red-50',
      label: 'May not be meeting obligation',
      labelClass: 'bg-red-100 text-red-700',
      barClass: 'bg-red-400',
    },
  }

  const cfg = statusConfig[status]
  const Icon = cfg.icon

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6 pb-24">

        <div>
          <h1 className="t-page-title">PR Residency Obligation</h1>
          <p className="mt-1 t-body">
            Permanent residents must be physically present in Canada for at least{' '}
            <strong>730 days in any 5-year period</strong> to maintain PR status.
          </p>
        </div>

        {!hasPRDate && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">PR date not entered</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Add your PR date in your profile to get an accurate calculation.
            </p>
            <Link href="/dashboard/profile" className="mt-3 inline-flex items-center text-xs font-semibold text-amber-800 underline-offset-2 hover:underline">
              Update profile →
            </Link>
          </div>
        )}

        {/* Status card */}
        <div className={`rounded-2xl border p-5 ${cfg.cardClass}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Icon className={`h-6 w-6 shrink-0 ${cfg.iconClass}`} aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-heading">5-year rolling window</p>
                <p className="text-xs text-muted-text">{fmtDate(windowStart)} — {fmtDate(windowEnd)}</p>
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${cfg.labelClass}`}>
              {cfg.label}
            </span>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-4xl font-bold text-heading leading-none">{daysInCanada}</span>
              <span className="text-sm font-semibold text-muted-text">/ {daysRequired} days required</span>
            </div>
            <ProgressBar value={daysInCanada} max={daysRequired} colorClass={cfg.barClass} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {status === 'on_track' ? (
              <div className="rounded-xl bg-white/60 p-3">
                <p className="text-xs text-muted-text">Buffer days</p>
                <p className="mt-0.5 text-xl font-bold text-green-700">{daysBuffer}</p>
                <p className="text-xs text-muted-text">above the 730 threshold</p>
              </div>
            ) : (
              <div className="rounded-xl bg-white/60 p-3">
                <p className="text-xs text-muted-text">Days still needed</p>
                <p className="mt-0.5 text-xl font-bold text-heading">{daysNeeded}</p>
                <p className="text-xs text-muted-text">to meet the 730-day requirement</p>
              </div>
            )}
            {estimatedMeetDate && (
              <div className="rounded-xl bg-white/60 p-3">
                <p className="text-xs text-muted-text">If you stay in Canada</p>
                <p className="mt-0.5 text-sm font-bold text-heading">{fmtDate(estimatedMeetDate)}</p>
                <p className="text-xs text-muted-text">estimated date you'd meet 730 days</p>
              </div>
            )}
          </div>
        </div>

        {/* What this means */}
        <div className="rounded-2xl bg-surface-card p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-text">What this means</p>
          {status === 'on_track' && (
            <p className="text-sm text-heading">
              Based on your entered data, you appear to be meeting the 730-day PR residency obligation.
              Continue to log your travel and verify your total with official IRCC records.
            </p>
          )}
          {status === 'at_risk' && (
            <p className="text-sm text-heading">
              You appear to be below 730 days in the current window. You may still be able to meet the
              requirement — continue logging Canada presence and minimise time outside Canada.
            </p>
          )}
          {status === 'breach' && (
            <p className="text-sm text-heading">
              Based on the data you entered, you may not be meeting the 730-day obligation in the
              current 5-year window. Navly cannot confirm a residency breach — consult a licensed
              RCIC or immigration lawyer to review your situation.
            </p>
          )}
        </div>

        {/* Important notes */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-text">Important notes</p>
          <div className="rounded-2xl bg-surface-card p-4 space-y-2 text-xs text-muted-text leading-relaxed">
            <p>An expired PR card does not cancel your PR status. However, you need a valid PR card or Permanent Resident Travel Document (PRTD) to board a flight back to Canada after travelling abroad.</p>
            <p>Navly calculates days based on travel dates you entered. Actual counts depend on border crossing records held by IRCC and CBSA.</p>
            <p>Days spent outside Canada with a Canadian citizen spouse, or while employed by a Canadian business or government abroad, may count toward your obligation — this calculation does not include those exceptions.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/understand-pr-status/is-pr-status-valid.html"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-subtle bg-surface-card px-4 py-2.5 text-xs font-semibold text-heading transition hover:bg-subtle"
          >
            IRCC — PR residency obligation
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <Link
            href="/dashboard/days"
            className="inline-flex items-center rounded-xl border border-subtle bg-surface-card px-4 py-2.5 text-xs font-semibold text-heading transition hover:bg-subtle"
          >
            Update travel log →
          </Link>
        </div>

        <p className="pb-2 text-center text-xs text-muted-text/70">
          This is an estimate based on data you entered. Navly is a planning tool only — not legal advice.
          Consult a licensed RCIC or immigration lawyer for professional guidance.
        </p>

      </div>
    </div>
  )
}
