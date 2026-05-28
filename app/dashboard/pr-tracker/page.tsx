'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Briefcase,
  Award,
  ShieldAlert,
  Plane,
  CheckCircle2,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { loadProfile, loadProfileFromSupabase, saveProfile, type IntakeData } from '@/lib/profile'
import { calculateScore, type ScoreResult, type RiskFlag } from '@/lib/scoring'
import { recordScoreSnapshot } from '@/lib/history'
import { ProgressGauge } from '@/components/dashboard/ProgressGauge'
import { RequirementCard } from '@/components/dashboard/RequirementCard'
import { ActionableScoreSheet, type CategoryKey } from '@/components/dashboard/ActionableScoreSheet'
import { ScoreTimelineChart } from '@/components/dashboard/ScoreTimelineChart'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { PlanGate } from '@/components/ui/PlanGate'
import { matchPNPStreams, pnpStatusLabels, pnpStatusColors, type PNPStream } from '@/lib/pnp'

// ─── Score Tracker ────────────────────────────────────────────────────────────

function ScoreTracker({ profile }: { profile: IntakeData; score: ScoreResult }) {
  const [simulatedProfile, setSimulatedProfile] = useState<IntakeData>(profile)
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(null)

  useEffect(() => {
    setSimulatedProfile(profile)
  }, [profile])

  const currentScore = calculateScore(simulatedProfile)
  const crs = currentScore.crs || { total: 0, age: 0, education: 0, firstLanguage: 0, canadianExperience: 0, skillTransferability: 0, additional: 0 }
  const langDetails = currentScore.clb ? [
    { label: 'Reading', value: `CLB ${currentScore.clb.r}` },
    { label: 'Writing', value: `CLB ${currentScore.clb.w}` },
    { label: 'Listening', value: `CLB ${currentScore.clb.l}` },
    { label: 'Speaking', value: `CLB ${currentScore.clb.s}` },
  ] : []
  const minLang = currentScore.clb ? Math.min(currentScore.clb.r, currentScore.clb.w, currentScore.clb.l, currentScore.clb.s) : 0
  const langStatus = minLang >= 9 ? 'Complete' : minLang >= 7 ? 'In Progress' : 'Required'

  const eduLabels: Record<string, string> = {
    'less-than-secondary': 'None', secondary: 'High School', '1-year': '1 Year', '2-year': '2 Years', bachelors: "Bachelor's", 'two-credentials': 'Two Certs', masters: "Master's", doctoral: 'Doctorate',
  }
  const eduVal = simulatedProfile.educationLevel ? eduLabels[simulatedProfile.educationLevel] || simulatedProfile.educationLevel : 'Not set'
  const hasECA = simulatedProfile.ecaCompleted === 'yes'
  const eduDetails = [
    { label: 'Level', value: eduVal },
    { label: 'ECA', value: hasECA ? 'Yes' : 'No' },
    { label: 'Can. Study', value: (!simulatedProfile.canadianEducation || simulatedProfile.canadianEducation === 'none') ? 'No' : 'Yes' },
  ]
  const advEdu = ['bachelors', 'two-credentials', 'masters', 'doctoral'].includes(simulatedProfile.educationLevel)
  const eduStatus = advEdu && hasECA ? 'Complete' : 'In Progress'

  const canWork = parseFloat(simulatedProfile.canadianWorkMonths) || 0
  const forWork = parseFloat(simulatedProfile.foreignWorkYears) || 0
  const workDetails = [
    { label: 'Canadian', value: `${Math.floor(canWork / 12)} Yrs` },
    { label: 'Foreign', value: `${forWork} Yrs` },
    { label: 'TEER', value: simulatedProfile.teerLevel || 'Unknown' },
    { label: 'Job Offer', value: simulatedProfile.hasJobOffer === 'yes' ? 'Yes' : 'No' },
  ]
  const workStatus = canWork >= 12 || forWork >= 3 ? 'Complete' : 'In Progress'

  const pathwayDetails = currentScore.pathways.slice(0, 3).map((p) => ({
    label: p.id.toUpperCase(),
    value: p.status === 'eligible' ? 'Eligible' : 'Not Yet',
  }))
  const isEligible = currentScore.pathways.some((p) => p.status === 'eligible')

  const handleSave = () => {
    saveProfile(simulatedProfile)
    if (crs && crs.total > 0) recordScoreSnapshot(crs.total)
    window.location.reload()
  }

  return (
    <div className="animate-fade-in relative">
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <RequirementCard
            icon={BookOpen}
            title="Language Score"
            status={langStatus}
            details={langDetails}
            progress={minLang >= 9 ? 100 : minLang >= 7 ? 65 : 30}
            onClick={() => setActiveCategory('language')}
          />
          <RequirementCard
            icon={GraduationCap}
            title="Education & ECA"
            status={eduStatus}
            details={eduDetails}
            progress={eduStatus === 'Complete' ? 100 : 50}
            onClick={() => setActiveCategory('education')}
          />
          <RequirementCard
            icon={Briefcase}
            title="Work Experience"
            status={workStatus}
            details={workDetails}
            progress={workStatus === 'Complete' ? 100 : 50}
            onClick={() => setActiveCategory('work')}
          />
          <RequirementCard
            icon={Award}
            title="Pathway Eligibility"
            status={isEligible ? 'Complete' : 'Under Review'}
            details={pathwayDetails.length > 0 ? pathwayDetails : [{ label: 'Pathways', value: 'Calculating…' }]}
            progress={isEligible ? 100 : currentScore.pathways.some((p) => p.status === 'possible') ? 70 : 40}
          />
      </div>

      {currentScore.improvements.length > 0 && (
        <div className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-amber-800">Highest-Impact Next Steps</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {currentScore.improvements.slice(0, 2).map((imp, i) => (
              <div key={i} className="flex flex-col justify-between rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between">
                  <span className="font-bold text-[#0b1f3a]">{imp.label}</span>
                  <span className="ml-2 whitespace-nowrap rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 shadow-sm">{imp.impact}</span>
                </div>
                <p className="text-sm leading-6 text-slate-600">{imp.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <ActionableScoreSheet
        category={activeCategory}
        onClose={() => setActiveCategory(null)}
        profile={simulatedProfile}
        setProfile={setSimulatedProfile}
        onSaveToProfile={handleSave}
        onReset={() => setSimulatedProfile(profile)}
      />
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

// ─── Outside Canada Planning Card ─────────────────────────────────────────────

const outsideSteps: Record<string, { title: string; steps: string[] }> = {
  'express-entry': {
    title: 'Express Entry (Direct to PR)',
    steps: [
      'Complete an ECA from WES Canada to have your foreign credentials recognised',
      'Take IELTS General Training or CELPIP and aim for CLB 9 in all four skills',
      'Accumulate 1+ year of skilled foreign work experience (TEER 0–3)',
      'Create your Express Entry profile and enter the pool',
    ],
  },
  'study-permit': {
    title: 'Study Permit',
    steps: [
      'Choose a program at a Designated Learning Institution (DLI) — 8+ months for PGWP eligibility',
      'Get your acceptance letter, then apply for a study permit at least 3 months before start',
      'Prove you have sufficient funds to cover tuition and living costs',
      'After graduation, apply for a Post-Graduation Work Permit to start your PR path',
    ],
  },
  'work-permit': {
    title: 'Work Permit',
    steps: [
      'Secure a job offer from a Canadian employer in a TEER 0–3 occupation',
      'Employer applies for an LMIA (or confirm the role is LMIA-exempt)',
      'Apply for your work permit with the LMIA approval number',
      'After 12 months of skilled Canadian work, apply for PR via Canadian Experience Class',
    ],
  },
  visitor: {
    title: 'Visitor Visa / eTA',
    steps: [
      'Check if your country requires a visitor visa or just an eTA',
      'Apply online well before your travel date — processing varies by nationality',
      'Prepare proof of ties to your home country (employment, property, family)',
      'A visitor visa does not give work or study rights inside Canada',
    ],
  },
  family: {
    title: 'Family Sponsorship',
    steps: [
      'Your Canadian citizen or PR sponsor must initiate the sponsorship application',
      'Sponsor must meet income requirements and sign an undertaking',
      'Gather relationship documents: marriage certificate, proof of relationship, photos',
      'Processing times vary — spousal sponsorship averages 12 months',
    ],
  },
  business: {
    title: 'Business / Investor Immigration',
    steps: [
      'Research the Start-Up Visa program if you have an innovative business concept',
      'Contact provincial nominee programs with entrepreneur streams (BC, ON, AB, MB)',
      'Prepare a detailed business plan and proof of available investment funds',
      'Many streams require a business exploration visit to Canada first',
    ],
  },
  unsure: {
    title: 'Explore Your Options',
    steps: [
      'Complete your full profile to unlock a personalised pathway estimate',
      'Review your language test scores — CLB 7+ opens most pathways',
      'Consider your education level and foreign work experience as key factors',
      'Book a consultation with a certified RCIC to review your specific situation',
    ],
  },
}

function OutsidePlanningCard({ profile }: { profile: IntakeData }) {
  const entry = profile.plannedEntry || 'unsure'
  const info = outsideSteps[entry] ?? outsideSteps.unsure
  return (
    <Card className="mb-8 rounded-2xl border-slate-200 bg-white">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A] text-white">
            <Plane className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Planning your move</p>
            <p className="font-bold text-[#0B1F3A]">{info.title}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {info.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
              <p className="text-sm leading-relaxed text-slate-600">{step}</p>
            </div>
          ))}
        </div>
        <Link href="/dashboard/tasks" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#D62828] hover:underline">
          View your full task list <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}

// ─── PNP Streams Card ────────────────────────────────────────────────────────

function PNPStreamsCard({ streams }: { streams: PNPStream[] }) {
  if (streams.length === 0) return null
  const province = streams[0].province
  const program = streams[0].programName

  return (
    <Card className="mb-8 rounded-2xl border-slate-200 bg-white">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Award className="h-4 w-4 text-[#0B1F3A]" />
          <p className="text-sm font-bold text-[#0B1F3A]">
            {program} — {province}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {streams.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="font-semibold text-sm text-[#0B1F3A]">{s.streamName}</span>
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${pnpStatusColors[s.status]}`}>
                  {pnpStatusLabels[s.status]}
                </span>
              </div>
              <p className="text-sm text-slate-600">{s.reason}</p>
              {s.missingItems.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1">
                  {s.missingItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          PNP stream requirements change frequently. Always verify eligibility at the official provincial website before applying.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Free CRS Summary Card ────────────────────────────────────────────────────

function CRSSummaryCard({ crs }: { crs: number }) {
  const [cutoff, setCutoff] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/draws')
      .then(r => r.json())
      .then((data: { cutoff: number }[]) => { if (data[0]?.cutoff) setCutoff(data[0].cutoff) })
      .catch(() => {})
  }, [])

  const gap = cutoff !== null && crs > 0 ? cutoff - crs : null
  const isAbove = gap !== null && gap <= 0

  return (
    <Card className="mb-6 rounded-2xl border-slate-200 bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-[#0B1F3A] px-5 py-3 text-white">
              <span className="text-3xl font-bold leading-none">{crs > 0 ? crs : '—'}</span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/60">Your CRS</span>
            </div>
            {cutoff !== null && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3">
                <span className="text-3xl font-bold leading-none text-[#0B1F3A]">{cutoff}</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Last draw</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {gap === null && crs === 0 && (
              <p className="text-sm text-slate-500">Complete your profile to see your CRS score.</p>
            )}
            {gap !== null && (
              <p className={`text-lg font-bold ${isAbove ? 'text-green-700' : 'text-[#0B1F3A]'}`}>
                {isAbove
                  ? `You are ${Math.abs(gap)} point${Math.abs(gap) !== 1 ? 's' : ''} above the last cutoff ✓`
                  : `You are ${gap} point${gap !== 1 ? 's' : ''} away 👀`}
              </p>
            )}
            {cutoff !== null && gap !== null && !isAbove && (
              <p className="text-sm text-slate-500">Last draw cutoff was {cutoff} CRS</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── EE Draws Card ────────────────────────────────────────────────────────────

type EEDraw = { date: string; type: string; cutoff: number; invited?: number }

function EEDrawsCard({ crs }: { crs: number }) {
  const [draws, setDraws] = useState<EEDraw[]>([])

  useEffect(() => {
    fetch('/api/draws')
      .then((r) => r.json())
      .then((data: EEDraw[]) => setDraws(data))
      .catch(() => {})
  }, [])

  if (draws.length === 0) return null

  const latest = draws[0]
  const isCompetitive = crs > 0 && crs >= latest.cutoff
  const gap = crs > 0 ? latest.cutoff - crs : null

  return (
    <Card className="mb-8 rounded-2xl border-slate-200 bg-white">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#0B1F3A]" />
            <p className="text-sm font-bold text-[#0B1F3A]">Recent Express Entry Draws</p>
          </div>
          <span className="text-xs text-slate-400">Source: IRCC</span>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          {draws.map((d) => (
            <div key={d.date} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
              <div>
                <span className="font-semibold text-[#0B1F3A]">{d.date}</span>
                <span className="ml-2 text-slate-500">{d.type}</span>
              </div>
              <span className="font-bold text-[#0B1F3A]">{d.cutoff} CRS</span>
            </div>
          ))}
        </div>

        {crs > 0 && (
          <div className={`rounded-xl px-4 py-3 text-sm ${isCompetitive ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
            {isCompetitive
              ? `Your estimated score of ${crs} CRS is above the latest cutoff of ${latest.cutoff}. You may be competitive in the current pool.`
              : `Your estimated score of ${crs} CRS is ${gap} points below the latest cutoff of ${latest.cutoff}. Focus on the improvements below.`}
          </div>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Draw data is for reference only. Actual cutoffs vary by round type and pool size. Verify at canada.ca.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PRTrackerPage() {
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [pnpStreams, setPnpStreams] = useState<PNPStream[]>([])
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
        setScore(calculateScore(p))
        setPnpStreams(matchPNPStreams(p))
      }
      setLoaded(true)
    }
    init()
  }, [])

  if (!loaded) return <DashboardSkeleton />

  const isOutside = profile?.locationStatus === 'outside'
  const isQuebec = profile?.intendedProvince === 'QC'

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to overview
        </Link>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">PR Readiness</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Score & pathway analysis</h1>
        <p className="mt-2 text-slate-500">Your estimated CRS score, pathway strength, and what to improve next.</p>
      </div>

      {!profile && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No profile found.{' '}
          <Link href="/onboarding" className="font-semibold underline">Complete the intake</Link>{' '}
          to see your score and pathways.
        </div>
      )}

      {/* Risk flags */}
      {score && score.riskFlags.length > 0 && (
        <div className="mb-6 flex flex-col gap-3">
          {score.riskFlags.map((flag: RiskFlag, i) => (
            <div key={i} className={`flex gap-3 rounded-2xl border p-4 ${flag.level === 'critical' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
              <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${flag.level === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
              <p className={`text-sm leading-6 ${flag.level === 'critical' ? 'text-red-800' : 'text-amber-800'}`}>
                <span className="font-semibold">{flag.level === 'critical' ? 'Important: ' : 'Note: '}</span>
                {flag.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {isQuebec && <QuebecWarning />}

      {isOutside && profile && <OutsidePlanningCard profile={profile} />}

      {/* ── CRS gauge — always visible, never gated ── */}
      {profile && score && (
        <div className="mb-6 flex flex-col items-start gap-4 lg:flex-row lg:items-stretch">
          <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:w-[350px]">
            <ProgressGauge
              value={score.crs?.total ?? 0}
              max={600}
              label="Complete"
              sublabel="Competitive Express Entry scores typically range 480–550+"
            />
            <div className="flex w-full items-center justify-center gap-8 border-t border-slate-100 pt-4">
              <div className="flex flex-col text-center">
                <span className="text-3xl font-bold text-[#0B1F3A]">{score.crs?.total ?? 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">CRS Points</span>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex flex-col text-center">
                <span className="text-3xl font-bold text-[#0B1F3A]">{score.fsw?.score ?? 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">FSW Grid</span>
              </div>
            </div>
            <ScoreTimelineChart />
          </div>

          <div className="flex flex-1 flex-col gap-4">
            {!score.hasEnoughData && score.missingFields.length > 0 && (
              <Card className="rounded-2xl border-[#D62828]/20 bg-[#D62828]/5">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-[#D62828]" />
                    <div>
                      <p className="font-semibold text-[#0B1F3A]">Profile incomplete — score estimate unavailable</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Missing: <span className="font-medium text-[#D62828]">{score.missingFields.join(', ')}</span>.
                      </p>
                      <Link href="/onboarding" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#D62828] hover:underline">
                        Update profile <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <CRSSummaryCard crs={score.crs?.total ?? 0} />
          </div>
        </div>
      )}

      {/* ── Gated: full breakdown for paid users ── */}
      <PlanGate
        plan="report"
        fallback={
          <div className="mb-8">
            {score && score.pathways.length > 0 && (() => {
              const top = score.pathways.find(p => p.status === 'eligible' || p.status === 'possible') ?? score.pathways[0]
              return (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Top pathway preview</p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[#0B1F3A]">{top.name}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${top.status === 'eligible' ? 'bg-green-100 text-green-700' : top.status === 'possible' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                      {top.status === 'eligible' ? 'Eligible' : top.status === 'possible' ? 'Possible' : 'Not ready'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{top.reason}</p>
                </div>
              )
            })()}
            <Link
              href="/pricing"
              className="flex items-center justify-between rounded-2xl border border-dashed border-[#D62828]/40 bg-[#D62828]/5 p-5 transition hover:bg-[#D62828]/10"
            >
              <div>
                <p className="font-bold text-[#0B1F3A]">Unlock the full breakdown →</p>
                <p className="mt-0.5 text-sm text-slate-500">See your CRS score by category, all pathway eligibility, and the exact improvements that would move your score.</p>
              </div>
              <ArrowRight className="ml-4 h-5 w-5 shrink-0 text-[#D62828]" />
            </Link>
          </div>
        }
      >
        {profile && score && <ScoreTracker profile={profile} score={score} />}
        {pnpStreams.length > 0 && <PNPStreamsCard streams={pnpStreams} />}
      </PlanGate>

      {/* EE draws — free for all users */}
      {profile && profile.goal === 'pr' && (
        <EEDrawsCard crs={score?.crs?.total ?? 0} />
      )}

      <div className="flex gap-3 rounded-2xl border border-[#0B1F3A]/15 bg-[#0B1F3A]/5 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#0B1F3A]" />
        <p className="text-sm leading-6 text-slate-600">
          <span className="font-semibold text-[#0B1F3A]">Reminder: </span>
          Navly provides estimates based on the data you entered. Final eligibility depends on official IRCC program rules and document review by a licensed professional. This is not legal advice.
        </p>
      </div>
    </div>
  )
}
