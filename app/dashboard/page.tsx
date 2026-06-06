'use client'

import { useEffect, useState } from 'react'
import {
  Flame,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Newspaper,
  ListChecks,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { loadProfile, loadProfileFromSupabase, statusLabels, getPermitWarning, type IntakeData } from '@/lib/profile'
import { loadPresence, isCheckedInToday, getDaysInCanada, type PresenceData } from '@/lib/presence'

import { calculateScore, type ScoreResult } from '@/lib/scoring'
import { recordScoreSnapshot } from '@/lib/history'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { getPersonalizedUpdates, getCuratedUpdates, importanceDot, formatDate, type NewsUpdate } from '@/lib/news'
import { loadTasks } from '@/lib/tasks'
import { PlanGate } from '@/components/ui/PlanGate'
import { usePlan, hasPlan } from '@/lib/subscription'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LATEST_CUTOFF = 491

function getStrength(crs: number, hasData: boolean) {
  if (!hasData) return { label: 'Incomplete', color: '#94a3b8', bg: 'bg-slate-100', text: 'text-slate-500' }
  if (crs >= LATEST_CUTOFF) return { label: 'Competitive', color: '#16a34a', bg: 'bg-green-100', text: 'text-green-700' }
  if (crs >= 440) return { label: 'Developing', color: '#d97706', bg: 'bg-amber-100', text: 'text-amber-700' }
  return { label: 'See your next action', color: '#dc2626', bg: 'bg-red-100', text: 'text-red-700' }
}



// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useLocale()
  const { plan } = usePlan()
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [presence, setPresence] = useState<PresenceData>({
    totalDays: 0, streak: 0, longestStreak: 0, lastCheckIn: null, lastAcknowledgedDate: null, arrivalDate: null, travelLog: [],
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
        // Show curated news instantly, then silently replace with live DB data
        setNews(getCuratedUpdates(p.status, p.goal).slice(0, 2))
        getPersonalizedUpdates(p.status, p.goal).then(updates => setNews(updates.slice(0, 2)))
      }
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
  const topPathway = score?.pathways.find((p) => p.status === 'eligible' || p.status === 'possible')
  const improvement = score?.improvements[0]
  const checkedInToday = isCheckedInToday(presence)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">

      {/* Header + PR journey bar */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0B1F3A]">
            {profile?.fullName ? `Hi, ${profile.fullName.split(' ')[0]}` : 'Your overview'}
          </h1>
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${hasPlan(plan, 'tracker') ? 'bg-[#D62828]/10 text-[#D62828]' : hasPlan(plan, 'report') ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
            {hasPlan(plan, 'tracker') ? 'PR Tracker' : hasPlan(plan, 'report') ? 'Readiness Report' : 'Free plan'}
          </span>
        </div>
        {!profile && (
          <p className="mt-1 text-sm text-slate-500">Complete your profile to see your immigration roadmap</p>
        )}
        {profile && (
          <Link
            href="/dashboard/pr-tracker"
            className="mt-4 block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2 transition hover:shadow-md"
            aria-label="View PR tracker"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">
                {statusLabels[profile.status] ?? 'Current status'}
              </span>
              {crs > 0 && (
                <span className={`text-xs font-bold ${strength.text}`}>CRS {crs}</span>
              )}
              <span className="text-xs font-bold text-[#D62828]">PR</span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={crs > 0 ? Math.round((crs / 600) * 100) : 0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-[#D62828] transition-all duration-1000"
                style={{ width: `${crs > 0 ? Math.max(4, Math.round((crs / 600) * 100)) : 4}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {hasData
                ? `${strength.label}${topPathway ? ` · ${topPathway.name}` : ''}`
                : 'Complete your profile to unlock your score'}
            </p>
          </Link>
        )}
      </div>

      {/* Permit warning — tracker tier only */}
      {profile && (() => {
        const w = getPermitWarning(profile)
        if (!w) return null
        return (
          <PlanGate plan="tracker" fallback={null}>
            <div
              role="alert"
              className={`rounded-2xl border-l-4 p-4 ${w.urgent ? 'border-l-red-500 bg-red-50' : 'border-l-amber-400 bg-amber-50'}`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${w.urgent ? 'text-red-500' : 'text-amber-500'}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className={`text-base font-bold ${w.urgent ? 'text-red-900' : 'text-amber-900'}`}>
                    {w.daysLeft <= 0
                      ? `${w.permitLabel} may have expired`
                      : `${w.permitLabel} expires in ${w.daysLeft} day${w.daysLeft !== 1 ? 's' : ''}`}
                  </p>
                  <p className={`mt-1 text-sm ${w.urgent ? 'text-red-800' : 'text-amber-800'}`}>
                    Expiry: <strong>{w.expiryDate}</strong> · Fee: <strong>{w.renewalFee}</strong>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={w.renewalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex min-h-[40px] items-center rounded-xl px-4 py-2 text-sm font-semibold transition ${w.urgent ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                    >
                      How to renew on IRCC →
                    </a>
                    <Link
                      href="/dashboard/consultants"
                      className={`inline-flex min-h-[40px] items-center rounded-xl px-4 py-2 text-sm font-semibold transition ${w.urgent ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                    >
                      Find a consultant →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </PlanGate>
        )
      })()}

      {/* No profile CTA */}
      {!profile && (
        <Link
          href="/onboarding"
          className="flex min-h-[80px] items-center justify-between rounded-2xl border-2 border-dashed border-[#D62828]/40 bg-[#D62828]/5 p-5 transition hover:bg-[#D62828]/10 focus-visible:ring-2 focus-visible:ring-[#D62828] focus-visible:ring-offset-2"
        >
          <div>
            <p className="text-base font-bold text-[#0B1F3A]">Start your immigration profile</p>
            <p className="mt-1 text-sm text-slate-500">Answer a few questions to see your CRS score and best pathways.</p>
          </div>
          <ArrowRight className="ml-4 h-5 w-5 shrink-0 text-[#D62828]" aria-hidden="true" />
        </Link>
      )}

      {/* Streak / daily check-in */}
      {!isOutside && (
        <Link
          href="/dashboard/days"
          aria-label={checkedInToday
            ? `Canada streak: ${presence.streak} day${presence.streak !== 1 ? 's' : ''}. Tap to view tracker.`
            : 'Tap to log your Canada check-in for today'}
          className={`group flex min-h-[96px] items-center gap-4 rounded-2xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 ${
            checkedInToday
              ? 'bg-[#0B1F3A] focus-visible:ring-[#0B1F3A]'
              : 'border-2 border-dashed border-orange-400 bg-orange-50 focus-visible:ring-orange-400'
          }`}
        >
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${checkedInToday ? 'bg-white/10' : 'bg-orange-100'}`}>
            <Flame className={`h-7 w-7 ${checkedInToday ? 'text-orange-400' : 'text-orange-500'}`} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold uppercase tracking-widest ${checkedInToday ? 'text-orange-400' : 'text-orange-600'}`}>
              {checkedInToday ? 'Streak active' : 'Daily check-in needed'}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-4xl font-bold leading-none ${checkedInToday ? 'text-white' : 'text-[#0B1F3A]'}`}>
                {presence.streak}
              </span>
              <span className={`text-base font-semibold ${checkedInToday ? 'text-white/80' : 'text-slate-700'}`}>
                day{presence.streak !== 1 ? 's' : ''} in Canada
              </span>
            </div>
            <p className={`mt-1 text-sm ${checkedInToday ? 'text-white/75' : 'font-semibold text-orange-700'}`}>
              {checkedInToday
                ? `${getDaysInCanada(presence).toLocaleString()} total days · checked in today ✓`
                : 'Tap to confirm you were in Canada today'}
            </p>
          </div>
          <ChevronRight className={`h-5 w-5 shrink-0 transition group-hover:translate-x-1 ${checkedInToday ? 'text-white/50 group-hover:text-white' : 'text-orange-400'}`} aria-hidden="true" />
        </Link>
      )}

      {/* Next best action */}
      {profile && (
        <Link
          href="/dashboard/pr-tracker"
          className="group flex min-h-[108px] flex-col justify-between rounded-2xl bg-[#0B1F3A] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">Your next action</p>
            <p className="mt-2 text-base font-bold leading-snug text-white">
              {improvement?.label ?? (hasData ? "You're on track — review your pathways" : 'Complete your profile to unlock guidance')}
            </p>
            {improvement && (
              <p className="mt-1.5 text-sm leading-relaxed text-white/80 line-clamp-2">{improvement.action}</p>
            )}
          </div>
          <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-white/75 transition group-hover:text-white">
            View full breakdown <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden="true" />
          </p>
        </Link>
      )}

      {/* Next task */}
      {profile && (
        <Link
          href="/dashboard/tasks"
          aria-label={nextTask ? `Next task: ${nextTask.title}. Tap to view all tasks.` : 'All tasks complete. Tap to view tasks.'}
          className="group flex min-h-[72px] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2"
        >
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${nextTask ? 'bg-slate-100' : 'bg-green-100'}`}>
            {nextTask
              ? <ListChecks className="h-5 w-5 text-slate-500" aria-hidden="true" />
              : <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Next task</p>
            <p className={`mt-0.5 truncate text-sm font-semibold ${nextTask ? 'text-[#0B1F3A]' : 'text-green-700'}`}>
              {nextTask ? nextTask.title : 'All tasks complete'}
            </p>
            {nextTask && <p className="mt-0.5 text-xs text-slate-400">{nextTask.category}</p>}
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#D62828]" aria-hidden="true" />
        </Link>
      )}

      {/* AI Assistant */}
      <Link
        href="/dashboard/chat"
        aria-label="Open AI immigration assistant"
        className="group flex min-h-[88px] items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1F3A] to-[#1a3660] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-2"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <Sparkles className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-[#D62828]">AI Assistant</p>
          <p className="mt-1 text-base font-bold text-white">Ask anything about your immigration journey</p>
          <p className="mt-1 hidden text-sm text-white/75 sm:line-clamp-1">
            "What PNP streams match my NOC?" · "When can I apply for citizenship?"
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-white/50 transition group-hover:translate-x-1 group-hover:text-white" aria-hidden="true" />
      </Link>

      {/* News */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Updates for you</p>
          </div>
          <Link href="/dashboard/news" className="text-sm font-semibold text-[#D62828] hover:underline focus-visible:underline">
            View all →
          </Link>
        </div>
        {news.length > 0 ? (
          <ul className="space-y-4">
            {news.map((u: NewsUpdate) => (
              <li key={u.id} className="flex items-start gap-3">
                <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${importanceDot[u.importance]}`} aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold leading-snug text-[#0B1F3A] line-clamp-2">{u.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(u.publishedAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No personalized updates yet.</p>
        )}
      </div>

      {/* Disclaimer */}
      <p className="pb-2 text-center text-xs text-slate-400">
        {t('common.disclaimer')}{' '}
        <Link href="/dashboard/consultants" className="underline hover:text-slate-600 focus-visible:text-slate-600">
          {t('dashboard.findConsultant')} →
        </Link>
      </p>
    </div>
  )
}
