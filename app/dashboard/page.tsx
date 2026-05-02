'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  MinusCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { loadProfile, statusLabels, goalLabels, timelineLabels, type IntakeData } from '@/lib/profile'
import { loadDocuments, docCounts } from '@/lib/documents'
import { calculateScore, type ScoreResult, type PathwayStatus } from '@/lib/scoring'
import { cn } from '@/lib/utils'

const quickActions = [
  { href: '/dashboard/documents', label: 'Document checklist', desc: 'Track missing and expiring documents', icon: FileText },
  { href: '/dashboard/tasks', label: 'My tasks', desc: 'Stay on top of your next steps', icon: ListChecks },
  { href: '/dashboard/chat', label: 'Ask the AI assistant', desc: 'Get plain-language answers to your questions', icon: MessageSquare },
  { href: '/dashboard/prep', label: 'Consultation prep', desc: 'Build a summary before speaking with a professional', icon: ShieldCheck },
]

// ─── Score Tracker ────────────────────────────────────────────────────────────

function PathwayBadge({ status }: { status: PathwayStatus['status'] }) {
  const configs = {
    eligible:       { icon: CheckCircle2, label: 'Eligible',       className: 'text-green-700 bg-green-50 border-green-200' },
    'not-yet':      { icon: Clock,        label: 'Not yet',         className: 'text-amber-700 bg-amber-50 border-amber-200' },
    possible:       { icon: TrendingUp,   label: 'Possible',        className: 'text-blue-700 bg-blue-50 border-blue-200' },
    'not-applicable': { icon: MinusCircle, label: 'N/A',            className: 'text-slate-500 bg-slate-50 border-slate-200' },
  }
  const cfg = configs[status]
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold', cfg.className)}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  )
}

function ScoreBreakdownRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 text-xs text-slate-500">{label}</span>
      <div className="flex-1 rounded-full bg-slate-100 h-1.5">
        <div className={cn('h-1.5 rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-12 text-right text-xs font-semibold text-[#0B1F3A]">{value} / {max}</span>
    </div>
  )
}

function ScoreTracker({ score }: { profile: IntakeData; score: ScoreResult }) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  if (!score.hasEnoughData) {
    return (
      <Card className="mb-8 rounded-2xl border-[#D62828]/20 bg-[#D62828]/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-[#D62828]" />
            <div>
              <p className="font-semibold text-[#0B1F3A]">Complete your profile to see your PR score</p>
              <p className="mt-1 text-sm text-slate-600">
                Your profile is missing: <span className="font-medium text-[#D62828]">{score.missingFields.join(', ')}</span>.
              </p>
              <Link
                href="/onboarding"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#D62828] hover:underline"
              >
                Update profile <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const crs = score.crs!

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">PR Score Tracker</h2>

      {/* CRS card */}
      <Card className="mb-4 rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Estimated CRS score</p>
              <p className="mt-1 text-4xl font-bold text-[#0B1F3A]">{crs.total}</p>
              <p className="mt-0.5 text-xs text-slate-400">out of ~1,200 max</p>
            </div>
            {score.clb && (
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Your CLB</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-right text-xs">
                  <span className="text-slate-500">Reading</span>  <span className="font-bold text-[#0B1F3A]">CLB {score.clb.r}</span>
                  <span className="text-slate-500">Writing</span>  <span className="font-bold text-[#0B1F3A]">CLB {score.clb.w}</span>
                  <span className="text-slate-500">Listening</span><span className="font-bold text-[#0B1F3A]">CLB {score.clb.l}</span>
                  <span className="text-slate-500">Speaking</span> <span className="font-bold text-[#0B1F3A]">CLB {score.clb.s}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowBreakdown((s) => !s)}
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0B1F3A]"
          >
            {showBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showBreakdown ? 'Hide' : 'Show'} score breakdown
          </button>

          {showBreakdown && (
            <div className="mt-4 flex flex-col gap-2.5">
              <ScoreBreakdownRow label="Age"                   value={crs.age}                  max={110} color="bg-purple-400" />
              <ScoreBreakdownRow label="Education"             value={crs.education}            max={140} color="bg-blue-400" />
              <ScoreBreakdownRow label="Language"              value={crs.firstLanguage}        max={136} color="bg-green-400" />
              <ScoreBreakdownRow label="Canadian work"         value={crs.canadianExperience}   max={80}  color="bg-amber-400" />
              <ScoreBreakdownRow label="Skill transferability" value={crs.skillTransferability} max={100} color="bg-orange-400" />
              <ScoreBreakdownRow label="Additional points"     value={crs.additional}           max={200} color="bg-[#D62828]/70" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* FSW 67/100 (show when no or little Canadian experience) */}
      {score.fsw && (
        <Card className="mb-4 rounded-2xl border-slate-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">FSW 67-point grid</p>
                <p className={cn('mt-1 text-2xl font-bold', score.fsw.eligible ? 'text-green-700' : 'text-[#0B1F3A]')}>
                  {score.fsw.score} / 100
                </p>
              </div>
              <div className={cn(
                'rounded-xl px-3 py-1.5 text-sm font-semibold',
                score.fsw.eligible ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              )}>
                {score.fsw.eligible ? 'Passes threshold' : 'Below 67 pass mark'}
              </div>
            </div>
            {!score.fsw.meetsWorkRequirement && (
              <p className="mt-2 text-xs text-amber-700">
                FSW requires at least 1 year of TEER 0/1/2/3 work experience.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pathways */}
      <Card className="mb-4 rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-5">
          <p className="mb-3 text-sm font-semibold text-[#0B1F3A]">Pathway eligibility</p>
          <div className="flex flex-col gap-3">
            {score.pathways.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#0B1F3A]">{p.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{p.reason}</p>
                </div>
                <PathwayBadge status={p.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvements */}
      {score.improvements.length > 0 && (
        <Card className="rounded-2xl border-slate-200 bg-white">
          <CardContent className="p-5">
            <p className="mb-3 text-sm font-semibold text-[#0B1F3A]">Your top score improvements</p>
            <div className="flex flex-col gap-4">
              {score.improvements.slice(0, 4).map((imp, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B1F3A] text-xs font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#0B1F3A]">{imp.label}</p>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">{imp.impact}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{imp.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Quebec warning ───────────────────────────────────────────────────────────

function QuebecWarning() {
  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <p className="font-semibold">Quebec immigration is separate</p>
      <p className="mt-1 leading-6">
        Quebec has its own selection system (Arrima / PSTQ). If you plan to live in Quebec, Express Entry and most PNP pathways do not apply. You must apply through Quebec first (CSQ), then federally for PR.
      </p>
    </div>
  )
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [counts, setCounts] = useState({ ready: 0, expiring: 0, missing: 0, total: 0 })

  useEffect(() => {
    const p = loadProfile()
    setProfile(p)
    if (p) setScore(calculateScore(p))
    setCounts(docCounts(loadDocuments()))
  }, [])

  const status   = profile ? (statusLabels[profile.status] ?? profile.status) : '—'
  const goal     = profile ? (goalLabels[profile.goal] ?? profile.goal) : '—'
  const timeline = profile ? (timelineLabels[profile.timeline] ?? profile.timeline) : '—'
  const isQuebec = profile?.intendedProvince === 'QC'

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Your PR tracker</h1>
        </div>
        {profile && (
          <Link
            href="/onboarding"
            className="text-sm font-semibold text-slate-500 hover:text-[#D62828]"
          >
            Update profile
          </Link>
        )}
      </div>

      {!profile && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No profile found.{' '}
          <Link href="/onboarding" className="font-semibold underline">
            Complete the intake
          </Link>{' '}
          to see your score and pathways.
        </div>
      )}

      {/* Profile summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 bg-white">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Current status</p>
            <p className="mt-1 text-lg font-bold text-[#0B1F3A]">{status}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 bg-white">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Main goal</p>
            <p className="mt-1 text-lg font-bold text-[#0B1F3A]">{goal}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 bg-white">
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Timeline</p>
            <p className="mt-1 text-lg font-bold text-[#0B1F3A]">{timeline}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quebec warning */}
      {isQuebec && <QuebecWarning />}

      {/* Score tracker (only when goal is PR) */}
      {profile && profile.goal === 'pr' && score && (
        <ScoreTracker profile={profile} score={score} />
      )}

      {/* Documents progress */}
      <Card className="mb-8 rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Documents</p>
              <p className="mt-0.5 text-lg font-bold text-[#0B1F3A]">{counts.ready} of {counts.total} ready</p>
            </div>
            <Link href="/dashboard/documents" className="flex items-center gap-1 text-sm font-semibold text-[#D62828] hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[#D62828] transition-all"
              style={{ width: counts.total > 0 ? `${Math.round((counts.ready / counts.total) * 100)}%` : '0%' }}
            />
          </div>
          <div className="mt-3 flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> {counts.ready} ready</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> {counts.expiring} expiring</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300" /> {counts.missing} missing</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickActions.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#0B1F3A]/20 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A] text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-[#0B1F3A] group-hover:text-[#D62828]">{label}</p>
                <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Legal reminder */}
      <div className="flex gap-3 rounded-2xl border border-[#0B1F3A]/15 bg-[#0B1F3A]/5 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#0B1F3A]" />
        <p className="text-sm leading-6 text-slate-600">
          <span className="font-semibold text-[#0B1F3A]">Reminder: </span>
          Navly provides estimates based on the information you entered. Final eligibility depends on official program rules and document review. This is not legal advice.
        </p>
      </div>
    </div>
  )
}
