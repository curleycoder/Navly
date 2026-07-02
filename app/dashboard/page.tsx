'use client'

import { useEffect, useState } from 'react'
import {
  CalendarDays,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { syncProfile, statusLabels, type IntakeData } from '@/lib/profile'
import { EMPTY_PRESENCE, syncPresence, syncPresenceToSupabase, checkIn, isCheckedInToday, getDaysInCanada, type PresenceData } from '@/lib/presence'
import { calculateScore, type ScoreResult } from '@/lib/scoring'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { loadTasks } from '@/lib/tasks'
import { usePlan, hasPlan } from '@/lib/subscription'
import { getLatestCutoff } from '@/lib/draws'
import { getUrgentDeadlines, formatDeadlineDate } from '@/lib/deadlines'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LATEST_CUTOFF = getLatestCutoff().cutoff

function getStrength(crs: number, hasData: boolean) {
  if (!hasData) return { label: 'Incomplete', text: 'text-muted-text/70', pill: 'bg-subtle text-muted-text' }
  if (crs >= LATEST_CUTOFF) return { label: 'Competitive', text: 'text-green-400', pill: 'bg-green-500/20 text-green-300' }
  if (crs >= 440) return { label: 'Developing', text: 'text-amber-400', pill: 'bg-amber-500/20 text-amber-300' }
  return { label: 'Below target', text: 'text-red-400', pill: 'bg-red-500/50 text-red-100' }
}

function todayLabel() {
  return new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'short', day: 'numeric' })
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useLocale()
  const { plan } = usePlan()
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [presence, setPresence] = useState<PresenceData>(EMPTY_PRESENCE)
  const [userId, setUserId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function init() {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id ?? null
      setUserId(uid)

      const p = uid ? await syncProfile(uid) : null
      setProfile(p)
      if (p) setScore(calculateScore(p))

      const presenceData = uid ? await syncPresence(uid) : EMPTY_PRESENCE
      setPresence(presenceData)
      setLoaded(true)
    }
    init()
  }, [])

  if (!loaded) return <DashboardSkeleton />

  const isOutside = profile?.locationStatus === 'outside'
  const crs = score?.crs?.total ?? 0
  const hasData = score?.hasEnoughData ?? false
  const strength = getStrength(crs, hasData)
  const tasks = loadTasks()
  const nextTask = tasks.find((t) => !t.done)
  const doneTasks = tasks.filter((t) => t.done).length
  // Seed arrival date from profile if presence tracker hasn't been set up yet
  const effectivePresence = presence.arrivalDate
    ? presence
    : { ...presence, arrivalDate: profile?.arrivalDate || null }
  const checkedInToday = isCheckedInToday(effectivePresence)
  const daysInCanada = getDaysInCanada(effectivePresence)
  const progressPct = crs > 0 ? Math.max(3, Math.round((crs / 600) * 100)) : 3

  function handleHomeCheckIn() {
    const updated = checkIn()
    setPresence(updated)
    if (userId) syncPresenceToSupabase(userId, updated).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 pb-24">

        {/* ── Greeting ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="t-caption">{todayLabel()}</p>
            <h1 className="mt-0.5 t-page-title">
              {profile?.fullName ? `Hi, ${profile.fullName.split(' ')[0]}` : 'Your dashboard'}
            </h1>
          </div>
          <span className={`mt-1 rounded-full px-2.5 py-1 text-xs font-bold ${
            hasPlan(plan, 'tracker') ? 'bg-navly-red/10 text-navly-red' : 'bg-subtle text-muted-text'
          }`}>
            {hasPlan(plan, 'tracker') ? 'PR Tracker' : 'Free'}
          </span>
        </div>

        {/* ── No-profile CTA ───────────────────────────────────────────── */}
        {!profile && (
          <Link
            href="/onboarding"
            className="flex items-center justify-between rounded-2xl border-2 border-dashed border-navly-red/30 bg-surface-card p-5 transition hover:border-navly-red/60 hover:bg-navly-red/5 focus-visible:ring-2 focus-visible:ring-navly-red focus-visible:ring-offset-2"
          >
            <div>
              <p className="t-section-title">{t('dashboard.profileSummary')}</p>
              <p className="mt-1 t-body">{t('dashboard.crsNote')}</p>
            </div>
            <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navly-red">
              <ArrowRight className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          </Link>
        )}

        {/* ── Action Required (deadlines) ──────────────────────────────── */}
        {profile && (() => {
          const urgent = getUrgentDeadlines(profile).slice(0, 2)
          if (urgent.length === 0) return (
            <Link
              href="/dashboard/dates"
              className="flex items-center justify-between rounded-2xl border border-dashed border-subtle bg-surface-card p-4 transition hover:border-navly-red/30 hover:bg-navly-red/5"
            >
              <div>
                <p className="text-sm font-semibold text-heading">Track your key dates</p>
                <p className="mt-0.5 text-xs text-muted-text">Add permit expiry, passport, and language test dates to get deadline reminders.</p>
              </div>
              <ChevronRight className="ml-4 h-5 w-5 shrink-0 text-muted-text/50" aria-hidden="true" />
            </Link>
          )
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-text">Action Required</p>
                <Link href="/dashboard/dates" className="text-xs font-semibold text-navly-red hover:underline">
                  See all →
                </Link>
              </div>
              {urgent.map((d) => {
                const isExpired = d.status === 'expired'
                const isUrgent = d.status === 'urgent'
                return (
                  <div
                    key={d.id}
                    role="alert"
                    className={`rounded-2xl border-l-4 p-4 ${
                      isExpired
                        ? 'border-l-red-500 bg-red-50'
                        : isUrgent
                          ? 'border-l-amber-400 bg-amber-50'
                          : 'border-l-blue-400 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          isExpired ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-blue-500'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold ${
                          isExpired ? 'text-red-900' : isUrgent ? 'text-amber-900' : 'text-blue-900'
                        }`}>
                          {isExpired
                            ? `${d.label} may have expired`
                            : `${d.label} expires in ${d.daysUntil} day${d.daysUntil !== 1 ? 's' : ''}`}
                        </p>
                        <p className={`mt-0.5 text-xs ${
                          isExpired ? 'text-red-700' : isUrgent ? 'text-amber-700' : 'text-blue-700'
                        }`}>
                          {formatDeadlineDate(d.date)}
                        </p>
                        <div className="mt-3">
                          <Link href="/dashboard/dates" className={`inline-flex min-h-[36px] items-center rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                            isExpired ? 'bg-red-100 text-red-800 hover:bg-red-200' : isUrgent ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}>
                            View details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* ── PR score hero card ───────────────────────────────────────── */}
        {profile && (
          <Link
            href="/dashboard/pr-tracker"
            aria-label="View PR tracker"
            data-tour="score"
            className="group block overflow-hidden rounded-2xl bg-navly-navy p-5 shadow-md transition hover:shadow-lg focus-visible:ring-2 focus-visible:ring-navly-red focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider font-bold text-white/70">
                  {statusLabels[profile.status] ?? 'Immigration score'}
                </p>
                {crs > 0 ? (
                  <p className="mt-1 text-5xl font-bold text-white leading-none">{crs}</p>
                ) : (
                  <p className="mt-2 text-lg font-semibold text-white/50">{t('dashboard.noScoreYet')}</p>
                )}
               
              </div>
              <div className="shrink-0 text-right">
                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${strength.pill}`}>
                  {strength.label}
                </span>
                <div className="mt-3 flex items-center justify-end gap-1 font-bold text-xs text-white/80 group-hover:text-white transition">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{t('dashboard.fullTracker')}</span>
                  <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white/80">0</span>
                <span className="text-xs font-bold text-white/80">600</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-card/10" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-navly-red transition-all duration-1000" style={{ width: `${progressPct}%` }} />
              </div>
              {!hasData && (
                <p className="mt-2 text-xs text-muted-text">Complete your profile to unlock your score</p>
              )}
            </div>
          </Link>
        )}

        {/* ── Quick stats grid ─────────────────────────────────────────── */}
        {((!isOutside && effectivePresence.arrivalDate) || profile) && (
          <div className="grid grid-cols-2 gap-3">

            {/* Days in Canada */}
            {!isOutside && effectivePresence.arrivalDate && (
              <div data-tour="days" className={`flex flex-col rounded-2xl border p-4 ${checkedInToday ? 'border-blue-100 bg-blue-50' : 'border-orange-200 bg-orange-50'}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${checkedInToday ? 'bg-navly-navy/10' : 'bg-orange-100'}`}>
                      <CalendarDays className={`h-4 w-4 ${checkedInToday ? 'text-navly-navy' : 'text-orange-500'}`} aria-hidden="true" />
                    </div>
                    <p className={`truncate text-xs font-semibold ${checkedInToday ? 'text-navly-navy/60' : 'text-orange-700/70'}`}>Days in Canada</p>
                  </div>
                  {checkedInToday ? (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Today
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                      Missed
                    </span>
                  )}
                </div>
                <p className={`mt-3 text-3xl font-bold leading-none ${checkedInToday ? 'text-navly-navy' : 'text-orange-700'}`}>{daysInCanada}</p>
                <div className="mt-auto pt-3">
                  {checkedInToday ? (
                    <Link href="/dashboard/days" className="text-xs font-semibold text-navly-navy/70 hover:text-navly-navy">
                      View details →
                    </Link>
                  ) : (
                    <button
                      onClick={handleHomeCheckIn}
                      className="w-full rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-600"
                    >
                      {t('dashboard.checkIn')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Next task */}
            {profile && (
              <Link
                href="/dashboard/tasks"
                data-tour="tasks"
                className={`group flex flex-col rounded-2xl border p-4 transition ${nextTask ? 'border-navly-red/20 bg-red-50 hover:border-navly-red/40' : 'border-green-200 bg-green-50 hover:border-green-300'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${nextTask ? 'bg-navly-red/10' : 'bg-green-100'}`}>
                      <ListChecks className={`h-4 w-4 ${nextTask ? 'text-navly-red' : 'text-green-600'}`} aria-hidden="true" />
                    </div>
                    <p className={`truncate text-xs font-semibold ${nextTask ? 'text-navly-red/70' : 'text-green-700/70'}`}>{t('dashboard.nextTask')}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 ${nextTask ? 'text-navly-red/30 group-hover:text-navly-red' : 'text-green-400'}`} aria-hidden="true" />
                </div>
                <p className={`mt-3 line-clamp-2 text-sm font-bold leading-snug ${nextTask ? 'text-heading' : 'text-green-700'}`}>
                  {nextTask ? nextTask.title : t('dashboard.allDone')}
                </p>
                {doneTasks > 0 && (
                  <p className="mt-auto pt-3 text-xs text-muted-text">
                    {doneTasks} {t('dashboard.tasksComplete')}
                  </p>
                )}
              </Link>
            )}

          </div>
        )}

        {/* ── PR status cards (residency + citizenship) ────────────────── */}
        {profile?.status === 'pr' && (
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/residency" className="group flex flex-col rounded-2xl border border-subtle bg-surface-card p-4 transition hover:border-navly-red/30 hover:bg-navly-red/5">
              <p className="text-xs font-semibold text-muted-text">PR Residency</p>
              <p className="mt-1 text-sm font-bold text-heading leading-snug">730-day obligation</p>
              <p className="mt-auto pt-3 text-xs font-semibold text-navly-red group-hover:underline">Check status →</p>
            </Link>
            <Link href="/dashboard/citizenship" className="group flex flex-col rounded-2xl border border-subtle bg-surface-card p-4 transition hover:border-navly-red/30 hover:bg-navly-red/5">
              <p className="text-xs font-semibold text-muted-text">Citizenship</p>
              <p className="mt-1 text-sm font-bold text-heading leading-snug">1,095-day tracker</p>
              <p className="mt-auto pt-3 text-xs font-semibold text-navly-red group-hover:underline">Check status →</p>
            </Link>
          </div>
        )}

        {/* ── Consultant CTA ───────────────────────────────────────────── */}
        <Link
          href="/dashboard/consultants"
          data-tour="consultant"
          className="group relative block overflow-hidden rounded-2xl bg-navly-navy p-5 transition hover:bg-navly-navy/95 focus-visible:ring-2 focus-visible:ring-navly-red focus-visible:ring-offset-2"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(220,38,38,0.18),transparent_65%)]" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white">{t('dashboard.talkToConsultant')}</p>
              <p className="mt-0.5 text-xs text-white/55">{t('dashboard.consultantDesc')}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white" aria-hidden="true" />
          </div>
        </Link>

        {/* Disclaimer */}
        <p className="pb-2 text-center text-xs text-muted-text/70">
          {t('common.disclaimer')}
        </p>

      </div>
    </div>
  )
}
