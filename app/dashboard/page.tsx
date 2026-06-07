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
  Newspaper,
} from 'lucide-react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { loadProfile, loadProfileFromSupabase, statusLabels, getPermitWarning, type IntakeData } from '@/lib/profile'
import { loadPresence, checkIn, isCheckedInToday, getDaysInCanada, type PresenceData } from '@/lib/presence'
import { calculateScore, type ScoreResult } from '@/lib/scoring'
import { recordScoreSnapshot } from '@/lib/history'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { getUpdates, importanceDot, formatDate, type NewsUpdate } from '@/lib/news'
import { loadTasks } from '@/lib/tasks'
import { PlanGate } from '@/components/ui/PlanGate'
import { usePlan, hasPlan } from '@/lib/subscription'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LATEST_CUTOFF = 491

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
  const [presence, setPresence] = useState<PresenceData>({
    totalDays: 0, streak: 0, longestStreak: 0, lastCheckIn: null,
    lastAcknowledgedDate: null, arrivalDate: null, travelLog: [],
  })
  const [news, setNews] = useState<NewsUpdate[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function init() {
      let p = loadProfile()
      if (!p) {
        const { supabase } = await import('@/lib/supabase/client')
        const { data: { user } } = await supabase.auth.getUser()
        if (user) p = await loadProfileFromSupabase(user.id)
      }
      setProfile(p)
      if (p) {
        const s = calculateScore(p)
        setScore(s)
        if (s.crs && s.crs.total > 0) recordScoreSnapshot(s.crs.total)
      }
      getUpdates({ limit: 2 }).then((latest) => setNews(latest))
      setPresence(loadPresence())
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
  const topPathway = score?.pathways.find((p) => p.status === 'eligible' || p.status === 'possible')
  // Seed arrival date from profile if presence tracker hasn't been set up yet
  const effectivePresence = presence.arrivalDate
    ? presence
    : { ...presence, arrivalDate: profile?.canadaArrivalDate ?? null }
  const checkedInToday = isCheckedInToday(effectivePresence)
  const daysInCanada = getDaysInCanada(effectivePresence)
  const progressPct = crs > 0 ? Math.max(3, Math.round((crs / 600) * 100)) : 3

  function handleHomeCheckIn() {
    setPresence(checkIn())
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
            hasPlan(plan, 'tracker') ? 'bg-navly-red/10 text-navly-red'
            : hasPlan(plan, 'report') ? 'bg-amber-100 text-amber-700'
            : 'bg-subtle text-muted-text'
          }`}>
            {hasPlan(plan, 'tracker') ? 'PR Tracker' : hasPlan(plan, 'report') ? 'Readiness Report' : 'Free'}
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

        {/* ── Permit warning ───────────────────────────────────────────── */}
        {profile && (() => {
          const w = getPermitWarning(profile)
          if (!w) return null
          return (
            <PlanGate plan="tracker" fallback={null}>
              <div role="alert" className={`rounded-2xl border-l-4 p-4 ${w.urgent ? 'border-l-red-500 bg-red-50' : 'border-l-amber-400 bg-amber-50'}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${w.urgent ? 'text-red-500' : 'text-amber-500'}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold ${w.urgent ? 'text-red-900' : 'text-amber-900'}`}>
                      {w.daysLeft <= 0
                        ? `${w.permitLabel} may have expired`
                        : `${w.permitLabel} expires in ${w.daysLeft} day${w.daysLeft !== 1 ? 's' : ''}`}
                    </p>
                    <p className={`mt-0.5 text-xs ${w.urgent ? 'text-red-700' : 'text-amber-700'}`}>
                      Expiry: <strong>{w.expiryDate}</strong> · Fee: <strong>{w.renewalFee}</strong>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={w.renewalUrl} target="_blank" rel="noopener noreferrer"
                        className={`inline-flex min-h-[36px] items-center rounded-xl px-3 py-1.5 text-xs font-semibold transition ${w.urgent ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}>
                        How to renew →
                      </a>
                      <Link href="/dashboard/consultants"
                        className={`inline-flex min-h-[36px] items-center rounded-xl px-3 py-1.5 text-xs font-semibold transition ${w.urgent ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}>
                        Find a consultant →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </PlanGate>
          )
        })()}

        {/* ── PR score hero card ───────────────────────────────────────── */}
        {profile && (
          <Link
            href="/dashboard/pr-tracker"
            aria-label="View PR tracker"
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
                <span className="text-xs font-bold text-white/60">0</span>
                <span className="text-xs font-bold text-white/60">Target 491+</span>
                <span className="text-xs font-bold text-white/60">600</span>
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
              <div className={`flex flex-col rounded-2xl border bg-surface-card p-4 ${checkedInToday ? 'border-subtle' : 'border-orange-200'}`}>
                <CalendarDays className={`h-4 w-4 ${checkedInToday ? 'text-heading' : 'text-orange-400'}`} aria-hidden="true" />
                <p className="mt-3 t-stat">{daysInCanada}</p>
                <p className="mt-1 t-caption">Days in Canada</p>
                <div className="mt-auto pt-3 flex items-center gap-2">
                  {checkedInToday ? (
                    <>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      </span>
                      <Link href="/dashboard/days" className="pt-3 text-xs font-semibold text-muted-text hover:text-heading">
                        {t('dashboard.details')}
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={handleHomeCheckIn}
                      className="rounded-lg bg-navly-red px-3 py-1.5 text-xs font-bold text-white hover:bg-navly-red/80 transition-colors"
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
                className="group flex flex-col rounded-2xl border border-subtle bg-surface-card p-4 transition hover:border-subtle/80"
              >
                <ListChecks className={`h-4 w-4 ${nextTask ? 'text-heading' : 'text-green-500'}`} aria-hidden="true" />
                <p className="mt-3 t-eyebrow text-navly-red">{t('dashboard.nextTask')}</p>
                <p className={`mt-1 line-clamp-2 t-section-title leading-snug ${nextTask ? '' : 'text-green-700'}`}>
                  {nextTask ? nextTask.title : t('dashboard.allDone')}
                </p>
                {doneTasks > 0 && (
                  <p className="mt-auto pt-3 t-caption">
                    {doneTasks} {t('dashboard.tasksComplete')}
                  </p>
                )}
              </Link>
            )}

          </div>
        )}

        {/* ── Latest news ──────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-subtle bg-surface-card">
          <div className="flex items-center justify-between border-b border-subtle/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-muted-text/70" aria-hidden="true" />
              <p className="t-section-title">{t('dashboard.latestUpdates')}</p>
            </div>
            <Link href="/dashboard/news" className="text-xs pt-3 font-semibold text-navly-red hover:underline">
              {t('dashboard.viewAll')}
            </Link>
          </div>
          {news.length > 0 ? (
            <ul className="divide-y divide-subtle/60">
              {news.map((u) => (
                <li key={u.id} className="flex items-start gap-3 px-5 py-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${importanceDot[u.importance]}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="t-section-title leading-snug line-clamp-2">{u.title}</p>
                    <p className="mt-0.5 t-caption">{formatDate(u.publishedAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-sm text-muted-text/70">{t('dashboard.noUpdatesYet')}</p>
          )}
        </div>

        {/* ── Consultant CTA ───────────────────────────────────────────── */}
        <Link
          href="/dashboard/consultants"
          className="group flex items-center gap-4 rounded-2xl border border-subtle bg-surface-card p-5 transition hover:border-subtle/80 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-navly-navy focus-visible:ring-offset-2"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navly-navy/8">
            <Sparkles className="h-5 w-5 text-heading" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="t-section-title">{t('dashboard.talkToConsultant')}</p>
            <p className="mt-0.5 t-caption">{t('dashboard.consultantDesc')}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-text/50 transition group-hover:translate-x-0.5 group-hover:text-navly-red" aria-hidden="true" />
        </Link>

        {/* Disclaimer */}
        <p className="pb-2 text-center text-xs text-muted-text/70">
          {t('common.disclaimer')}
        </p>

      </div>
    </div>
  )
}
