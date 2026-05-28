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
} from 'lucide-react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { loadProfile, loadProfileFromSupabase, statusLabels, goalLabels, getPermitWarning, type IntakeData } from '@/lib/profile'
import { loadPresence, isCheckedInToday, getDaysInCanada, type PresenceData } from '@/lib/presence'

import { calculateScore, type ScoreResult } from '@/lib/scoring'
import { recordScoreSnapshot } from '@/lib/history'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { getPersonalizedUpdates, importanceDot, formatDate, type NewsUpdate } from '@/lib/news'
import { loadTasks } from '@/lib/tasks'
import { PlanGate } from '@/components/ui/PlanGate'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LATEST_CUTOFF = 491

function getStrength(crs: number, hasData: boolean) {
  if (!hasData) return { label: 'Incomplete', color: '#94a3b8', bg: 'bg-slate-100', text: 'text-slate-500' }
  if (crs >= LATEST_CUTOFF) return { label: 'Competitive', color: '#16a34a', bg: 'bg-green-100', text: 'text-green-700' }
  if (crs >= 440) return { label: 'Developing', color: '#d97706', bg: 'bg-amber-100', text: 'text-amber-700' }
  return { label: 'Needs work', color: '#dc2626', bg: 'bg-red-100', text: 'text-red-700' }
}


// ─── Mini gauge ───────────────────────────────────────────────────────────────

function MiniGauge({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} stroke="#f1f5f9" strokeWidth="8" fill="none" />
        <circle cx="44" cy="44" r={r} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-xl font-bold text-[#0B1F3A]">{value > 0 ? value : '—'}</span>
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">CRS</span>
      </div>
    </div>
  )
}


// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useLocale()
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [presence, setPresence] = useState<PresenceData>({
    totalDays: 0, streak: 0, longestStreak: 0, lastCheckIn: null, arrivalDate: null, travelLog: [],
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
    <div className="mx-auto w-full max-w-4xl px-6 py-8">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3A]">
            {profile?.fullName ? `Hi, ${profile.fullName.split(' ')[0]}` : 'Your overview'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {profile
              ? `${statusLabels[profile.status] ?? profile.status} · Goal: ${goalLabels[profile.goal] ?? profile.goal}`
              : 'Complete your profile to get started'}
          </p>
        </div>
        <Link href="/onboarding" className="text-xs font-semibold text-slate-400 hover:text-[#D62828]">
          Update profile →
        </Link>
      </div>

      {/* Permit warning — tracker tier only */}
      {profile && (() => {
        const w = getPermitWarning(profile)
        if (!w) return null
        return (
          <PlanGate plan="tracker" fallback={null}>
            <div className={`mb-5 flex items-start gap-3 rounded-2xl border-l-4 p-4 ${w.urgent ? 'border-l-red-500 bg-red-50' : 'border-l-amber-400 bg-amber-50'}`}>
              <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${w.urgent ? 'text-red-500' : 'text-amber-500'}`} />
              <div>
                <p className={`text-sm font-bold ${w.urgent ? 'text-red-900' : 'text-amber-900'}`}>
                  {w.daysLeft <= 0 ? 'Permit may have expired' : `Permit expires in ${w.daysLeft} day${w.daysLeft !== 1 ? 's' : ''}`}
                </p>
                <div className="mt-1 flex gap-3">
                  <Link href="/dashboard/tasks" className={`text-xs font-semibold hover:underline ${w.urgent ? 'text-red-700' : 'text-amber-700'}`}>Renewal tasks →</Link>
                  <Link href="/dashboard/consultants" className={`text-xs font-semibold hover:underline ${w.urgent ? 'text-red-700' : 'text-amber-700'}`}>Find consultant →</Link>
                </div>
              </div>
            </div>
          </PlanGate>
        )
      })()}

      {/* No profile */}
      {!profile && (
        <Link href="/onboarding" className="mb-5 flex items-center justify-between rounded-2xl border border-dashed border-[#D62828]/40 bg-[#D62828]/5 p-5">
          <div>
            <p className="font-bold text-[#0B1F3A]">Start your immigration profile</p>
            <p className="mt-0.5 text-sm text-slate-500">Answer a few questions to see your CRS score and best pathways.</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-[#D62828]" />
        </Link>
      )}

      {/* Streak banner — always visible for inside-Canada users */}
      {!isOutside && (
        <Link
          href="/dashboard/days"
          className={`group mb-5 flex items-center gap-5 rounded-2xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            checkedInToday
              ? 'bg-[#0B1F3A]'
              : 'border-2 border-dashed border-orange-400 bg-orange-50'
          }`}
        >
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${checkedInToday ? 'bg-white/10' : 'bg-orange-100'}`}>
            <Flame className={`h-8 w-8 ${checkedInToday ? 'text-orange-400' : 'text-orange-500'}`} />
          </div>
          <div className="flex-1">
            <p className={`text-[10px] font-bold uppercase tracking-wide ${checkedInToday ? 'text-orange-400' : 'text-orange-600'}`}>
              {checkedInToday ? 'Streak active' : "Don't break your streak!"}
            </p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${checkedInToday ? 'text-white' : 'text-[#0B1F3A]'}`}>
                {presence.streak}
              </span>
              <span className={`text-sm font-semibold ${checkedInToday ? 'text-white/70' : 'text-slate-600'}`}>
                day{presence.streak !== 1 ? 's' : ''} in Canada
              </span>
            </div>
            <p className={`mt-0.5 text-xs ${checkedInToday ? 'text-white/50' : 'text-orange-700 font-semibold'}`}>
              {checkedInToday
                ? `${getDaysInCanada(presence).toLocaleString()} total days tracked · checked in today`
                : 'Tap to confirm you are in Canada today'}
            </p>
          </div>
          <ArrowRight className={`h-5 w-5 shrink-0 transition group-hover:translate-x-1 ${checkedInToday ? 'text-white/40 group-hover:text-white' : 'text-orange-400'}`} />
        </Link>
      )}

      {/* Main grid: gauge + next action + next task */}
      {profile && (
        <div className="mb-5 grid gap-4 sm:grid-cols-3">

          {/* PR Readiness */}
          <Link href="/dashboard/pr-tracker" className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <MiniGauge value={crs} max={600} color={strength.color} />
            <div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${strength.bg} ${strength.text}`}>
                {strength.label}
              </span>
              {!hasData && score?.missingFields && score.missingFields.length > 0 && (
                <p className="mt-1.5 text-xs text-slate-400">Missing: {score.missingFields.join(', ')}</p>
              )}
              {hasData && topPathway && (
                <p className="mt-1.5 text-xs font-semibold text-[#0B1F3A]">{topPathway.name}</p>
              )}
            </div>
            <p className="flex items-center gap-1 text-xs font-semibold text-[#D62828] group-hover:underline">
              PR Readiness <ArrowRight className="h-3 w-3" />
            </p>
          </Link>

          {/* Next best action */}
          <Link href="/dashboard/pr-tracker" className="group flex flex-col justify-between rounded-2xl border border-[#0B1F3A] bg-[#0B1F3A] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#D62828]">Next action</p>
              <p className="mt-1.5 text-sm font-bold leading-snug text-white">
                {improvement?.label ?? (hasData ? "You're on track — review your pathways" : 'Complete your profile to unlock guidance')}
              </p>
              {improvement && (
                <p className="mt-1 text-xs leading-5 text-slate-400 line-clamp-2">{improvement.action}</p>
              )}
            </div>
            <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-white/70 group-hover:text-white">
              View full breakdown <ArrowRight className="h-3 w-3" />
            </p>
          </Link>

          {/* Next task */}
          <Link href="/dashboard/tasks" className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Next task</p>
              </div>
              {nextTask ? (
                <>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                    <p className="text-sm font-semibold leading-snug text-[#0B1F3A]">{nextTask.title}</p>
                  </div>
                  <p className="mt-1.5 pl-6 text-xs text-slate-400">{nextTask.category}</p>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <p className="text-sm font-semibold text-green-700">All tasks complete</p>
                </div>
              )}
            </div>
            <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#D62828] group-hover:underline">
              All tasks <ArrowRight className="h-3 w-3" />
            </p>
          </Link>
        </div>
      )}

      {/* AI Assistant */}
      <Link
        href="/dashboard/chat"
        className="group mb-5 flex items-center gap-5 overflow-hidden rounded-2xl bg-linear-to-r from-[#0B1F3A] to-[#1a3660] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-[#D62828]">AI Assistant</p>
          <p className="mt-0.5 text-base font-bold text-white">Ask anything about your immigration journey</p>
          <p className="mt-1 text-xs text-slate-400">"What PNP streams match my NOC?" · "When can I apply for citizenship?" · "How do I improve my CRS?"</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-white/50 transition group-hover:text-white group-hover:translate-x-1" />
      </Link>

      {/* News */}
      <div className="mb-5 flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-slate-400" />
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Updates for you</p>
          </div>
          <Link href="/dashboard/news" className="text-xs font-semibold text-[#D62828] hover:underline">View all →</Link>
        </div>
        {news.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {news.map((u: NewsUpdate) => (
              <div key={u.id} className="flex items-start gap-2.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${importanceDot[u.importance]}`} />
                <div>
                  <p className="text-sm font-semibold leading-snug text-[#0B1F3A] line-clamp-2">{u.title}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{formatDate(u.publishedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No personalized updates yet.</p>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-slate-400">
        {t('common.disclaimer')}{' '}
        <Link href="/dashboard/consultants" className="hover:underline">{t('dashboard.findConsultant')} →</Link>
      </p>
    </div>
  )
}
