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
  if (!hasData) return { label: 'Incomplete', text: 'text-slate-400', pill: 'bg-slate-100 text-slate-500' }
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
  const checkedInToday = isCheckedInToday(presence)
  const daysInCanada = getDaysInCanada(presence)
  const progressPct = crs > 0 ? Math.max(3, Math.round((crs / 600) * 100)) : 3

  function handleHomeCheckIn() {
    setPresence(checkIn())
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 pb-24">

        {/* ── Greeting ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">{todayLabel()}</p>
            <h1 className="mt-0.5 text-2xl font-bold text-[#0B1F3A]">
              {profile?.fullName ? `Hi, ${profile.fullName.split(' ')[0]}` : 'Your dashboard'}
            </h1>
          </div>
          <span className={`mt-1 rounded-full px-2.5 py-1 text-xs font-bold ${
            hasPlan(plan, 'tracker') ? 'bg-[#D62828]/10 text-[#D62828]'
            : hasPlan(plan, 'report') ? 'bg-amber-100 text-amber-700'
            : 'bg-slate-100 text-slate-500'
          }`}>
            {hasPlan(plan, 'tracker') ? 'PR Tracker' : hasPlan(plan, 'report') ? 'Readiness Report' : 'Free'}
          </span>
        </div>

        {/* ── No-profile CTA ───────────────────────────────────────────── */}
        {!profile && (
          <Link
            href="/onboarding"
            className="flex items-center justify-between rounded-2xl border-2 border-dashed border-[#D62828]/30 bg-white p-5 transition hover:border-[#D62828]/60 hover:bg-[#D62828]/5 focus-visible:ring-2 focus-visible:ring-[#D62828] focus-visible:ring-offset-2"
          >
            <div>
              <p className="text-base font-bold text-[#0B1F3A]">Start your immigration profile</p>
              <p className="mt-1 text-sm text-slate-500">See your CRS score, eligible pathways, and next steps.</p>
            </div>
            <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D62828]">
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
            className="group block overflow-hidden rounded-2xl bg-[#0B1F3A] p-5 shadow-md transition hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#D62828] focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider font-bold text-slate-100">
                  {statusLabels[profile.status] ?? 'Immigration score'}
                </p>
                {crs > 0 ? (
                  <p className="mt-1 text-5xl font-bold text-white leading-none">{crs}</p>
                ) : (
                  <p className="mt-2 text-lg font-semibold text-slate-300">No score yet</p>
                )}
               
              </div>
              <div className="shrink-0 text-right">
                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${strength.pill}`}>
                  {strength.label}
                </span>
                <div className="mt-3 flex items-center justify-end gap-1 font-bold text-xs text-slate-100 group-hover:text-slate-200 transition">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Full tracker</span>
                  <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200">0</span>
                <span className="text-xs font-bold text-slate-200">Target 491+</span>
                <span className="text-xs font-bold text-slate-200">600</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-[#D62828] transition-all duration-1000" style={{ width: `${progressPct}%` }} />
              </div>
              {!hasData && (
                <p className="mt-2 text-xs text-slate-500">Complete your profile to unlock your score</p>
              )}
            </div>
          </Link>
        )}

        {/* ── Quick stats grid ─────────────────────────────────────────── */}
        {((!isOutside && presence.arrivalDate) || profile) && (
          <div className="grid grid-cols-2 gap-3">

            {/* Days in Canada */}
            {!isOutside && presence.arrivalDate && (
              <div className={`flex flex-col rounded-2xl border bg-white p-4 ${checkedInToday ? 'border-slate-200' : 'border-orange-200'}`}>
                <CalendarDays className={`h-4 w-4 ${checkedInToday ? 'text-slate-800' : 'text-orange-400'}`} aria-hidden="true" />
                <p className="mt-3 text-3xl font-bold text-[#0B1F3A] leading-none">{daysInCanada}</p>
                <p className="mt-1 text-xs text-slate-500">Days in Canada</p>
                <div className="mt-auto pt-3 flex items-center gap-2">
                  {checkedInToday ? (
                    <>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      </span>
                      <Link href="/dashboard/days" className="pt-3 text-xs font-semibold text-slate-700 hover:text-[#0B1F3A]">
                        Details →
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={handleHomeCheckIn}
                      className="rounded-lg bg-[#D62828] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#B91C1C] transition-colors"
                    >
                      Check in
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Next task */}
            {profile && (
              <Link
                href="/dashboard/tasks"
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
              >
                <ListChecks className={`h-4 w-4 ${nextTask ? 'text-slate-800' : 'text-green-500'}`} aria-hidden="true" />
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-red-600">Next task</p>
                <p className={`mt-1 line-clamp-2 text-sm font-semibold leading-snug ${nextTask ? 'text-[#0B1F3A]' : 'text-green-700'}`}>
                  {nextTask ? nextTask.title : 'All done'}
                </p>
                {doneTasks > 0 && (
                  <p className="mt-auto pt-3 text-xs text-slate-400">
                    {doneTasks} task{doneTasks !== 1 ? 's' : ''} complete
                  </p>
                )}
              </Link>
            )}

          </div>
        )}

        {/* ── Latest news ──────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <p className="text-sm font-bold text-[#0B1F3A]">Latest updates</p>
            </div>
            <Link href="/dashboard/news" className="text-xs font-semibold text-[#D62828] hover:underline">
              View all →
            </Link>
          </div>
          {news.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {news.map((u) => (
                <li key={u.id} className="flex items-start gap-3 px-5 py-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${importanceDot[u.importance]}`} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug text-[#0B1F3A] line-clamp-2">{u.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{formatDate(u.publishedAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-sm text-slate-400">No updates yet.</p>
          )}
        </div>

        {/* ── Consultant CTA ───────────────────────────────────────────── */}
        <Link
          href="/dashboard/consultants"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A]/8">
            <Sparkles className="h-5 w-5 text-[#0B1F3A]" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#0B1F3A]">Talk to a certified consultant</p>
            <p className="mt-0.5 text-xs text-slate-500">RCICs, lawyers & advisors. Navly does not provide legal advice.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#D62828]" aria-hidden="true" />
        </Link>

        {/* Disclaimer */}
        <p className="pb-2 text-center text-xs text-slate-400">
          {t('common.disclaimer')}
        </p>

      </div>
    </div>
  )
}
