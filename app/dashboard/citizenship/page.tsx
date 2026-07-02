'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Clock, ExternalLink, Info } from 'lucide-react'
import { syncProfile, type IntakeData } from '@/lib/profile'
import { syncPresence, EMPTY_PRESENCE } from '@/lib/presence'
import { computeCitizenshipPresence, type CitizenshipResult } from '@/lib/pr-math'
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

function StatRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-subtle last:border-0">
      <p className="text-sm text-muted-text">{label}</p>
      <div className="text-right">
        <p className="text-sm font-bold text-heading">{value}</p>
        {sub && <p className="text-xs text-muted-text/70">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CitizenshipPage() {
  const [result, setResult] = useState<CitizenshipResult | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function init() {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoaded(true); return }
      const [profile, presence] = await Promise.all([
        import('@/lib/profile').then(m => m.syncProfile(user.id)) as Promise<IntakeData | null>,
        syncPresence(user.id),
      ])
      if (profile) setResult(computeCitizenshipPresence(profile, presence))
      track('citizenship_tracker_viewed', { authenticated: true })
      setLoaded(true)
    }
    init()
  }, [])

  if (!loaded) return <DashboardSkeleton />

  if (!result) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-24">
          <h1 className="t-page-title">Citizenship — Physical Presence</h1>
          <p className="mt-4 t-body">Complete your profile to use this tracker.</p>
          <Link href="/onboarding" className="mt-4 inline-flex items-center rounded-xl bg-navly-red px-4 py-2 text-sm font-bold text-white hover:bg-navly-red/80">
            Complete profile
          </Link>
        </div>
      </div>
    )
  }

  const {
    postPRDays, prePRDays, prePRCredit,
    totalCreditedDays, daysRequired, daysNeeded,
    pctComplete, estimatedEligibilityDate, status, hasPRDate,
  } = result

  const isEligible = status === 'eligible'
  const barClass = isEligible ? 'bg-green-500' : pctComplete >= 50 ? 'bg-blue-500' : 'bg-amber-400'

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6 pb-24">

        <div>
          <h1 className="t-page-title">Citizenship — Physical Presence</h1>
          <p className="mt-1 t-body">
            To apply for Canadian citizenship, you generally need at least{' '}
            <strong>1,095 days physically in Canada</strong> in the 5 years before you apply.
          </p>
        </div>

        {!hasPRDate && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">PR date required</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Add your PR date in your profile. It is needed to separate post-PR days
              (full credit) from pre-PR days (half credit).
            </p>
            <Link href="/dashboard/profile" className="mt-3 inline-flex items-center text-xs font-semibold text-amber-800 underline-offset-2 hover:underline">
              Update profile →
            </Link>
          </div>
        )}

        {/* Progress card */}
        <div className={`rounded-2xl border p-5 ${isEligible ? 'border-green-200 bg-green-50' : 'border-subtle bg-surface-card'}`}>
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              {isEligible
                ? <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" aria-hidden="true" />
                : <Clock className="h-6 w-6 shrink-0 text-blue-500" aria-hidden="true" />}
              <div>
                <p className="text-sm font-bold text-heading">Physical presence estimate</p>
                <p className="text-xs text-muted-text">5-year window ending today</p>
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
              isEligible ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {pctComplete}% complete
            </span>
          </div>

          <div className="mb-2 flex items-end justify-between">
            <span className="text-4xl font-bold text-heading leading-none">{totalCreditedDays}</span>
            <span className="text-sm font-semibold text-muted-text">/ {daysRequired} days</span>
          </div>
          <ProgressBar value={totalCreditedDays} max={daysRequired} colorClass={barClass} />

          {!isEligible && (
            <p className="mt-3 text-xs text-muted-text">
              {daysNeeded} more day{daysNeeded !== 1 ? 's' : ''} needed
              {estimatedEligibilityDate ? ` · estimated by ${fmtDate(estimatedEligibilityDate)} (no travel)` : ''}
            </p>
          )}
          {isEligible && (
            <p className="mt-3 text-sm font-semibold text-green-700">
              Physical presence threshold appears to be met based on your entered data.
              Verify with official IRCC records before applying.
            </p>
          )}
        </div>

        {/* Breakdown */}
        <div className="rounded-2xl bg-surface-card p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-text">Calculation breakdown</p>
          <StatRow
            label="Days in Canada as PR (full credit)"
            value={postPRDays}
            sub="Each day counts as 1 day"
          />
          {prePRDays > 0 && (
            <StatRow
              label="Days in Canada before PR (half credit)"
              value={prePRDays}
              sub={`Counts as ${prePRCredit} days (capped at 365)`}
            />
          )}
          <StatRow
            label="Pre-PR credit applied"
            value={prePRCredit}
            sub="Max 365 days"
          />
          <StatRow
            label="Total credited days"
            value={totalCreditedDays}
            sub={`of ${daysRequired} required`}
          />
          {estimatedEligibilityDate && (
            <StatRow
              label="Estimated eligibility date"
              value={fmtDate(estimatedEligibilityDate)}
              sub="Assumes you stay in Canada every day from now"
            />
          )}
        </div>

        {/* Pre-PR credit explanation */}
        {prePRDays > 0 && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
              <div className="space-y-1 text-xs text-blue-800 leading-relaxed">
                <p className="font-semibold">How pre-PR credit works</p>
                <p>
                  Days you were physically in Canada as a temporary resident or protected person
                  before becoming a PR count as half a day each toward the 1,095-day requirement.
                  The maximum credit from pre-PR days is 365 days (requiring at least 730 pre-PR days in Canada).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Eligibility notes */}
        <div className="rounded-2xl bg-surface-card p-4 text-xs text-muted-text leading-relaxed space-y-2">
          <p className="font-semibold text-heading text-sm">Other citizenship requirements</p>
          <p>Physical presence is one of several requirements. You must also:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Have been a PR for at least 1 of the last 5 years</li>
            <li>Have filed taxes for at least 3 of the last 5 years (if required)</li>
            <li>Meet language requirements if aged 18–54 at time of application</li>
            <li>Have no prohibitions (e.g. criminal charges, removal orders)</li>
          </ul>
          <p>Navly tracks physical presence only. A licensed RCIC or immigration lawyer should review all requirements before you apply.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility/already-pr.html"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-subtle bg-surface-card px-4 py-2.5 text-xs font-semibold text-heading transition hover:bg-subtle"
          >
            IRCC — citizenship eligibility
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <Link
            href="/dashboard/residency"
            className="inline-flex items-center rounded-xl border border-subtle bg-surface-card px-4 py-2.5 text-xs font-semibold text-heading transition hover:bg-subtle"
          >
            PR residency obligation →
          </Link>
          <Link
            href="/dashboard/days"
            className="inline-flex items-center rounded-xl border border-subtle bg-surface-card px-4 py-2.5 text-xs font-semibold text-heading transition hover:bg-subtle"
          >
            Update travel log →
          </Link>
        </div>

        <p className="pb-2 text-center text-xs text-muted-text/70">
          This is an estimate based on data you entered. Navly is a planning tool only — not legal advice.
          Consult a licensed RCIC or immigration lawyer before applying for citizenship.
        </p>

      </div>
    </div>
  )
}
