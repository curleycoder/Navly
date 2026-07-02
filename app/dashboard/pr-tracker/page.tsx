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
  Plane,
  CheckCircle2,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { syncProfile, saveProfile, type IntakeData } from '@/lib/profile'
import { calculateScore, type ScoreResult, type RiskFlag } from '@/lib/scoring'
import { ProgressGauge } from '@/components/dashboard/ProgressGauge'
import { RequirementCard } from '@/components/dashboard/RequirementCard'
import { ActionableScoreSheet, type CategoryKey } from '@/components/dashboard/ActionableScoreSheet'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { PlanGate } from '@/components/ui/PlanGate'
import { UpgradeModal } from '@/components/ui/UpgradeModal'
import { matchPNPStreams, pnpStatusLabels, pnpStatusColors, type PNPStream, type ReadinessItem } from '@/lib/pnp'
import { useLocale } from '@/lib/i18n'
import { PageTour } from '@/components/dashboard/PageTour'
import { getLatestCutoff, getLatestByType, getDrawsByType, type DrawCategory, DRAW_CATEGORIES } from '@/lib/draws'

// ─── Status Roadmap ───────────────────────────────────────────────────────────

const ROADMAPS: Record<string, { steps: string[]; label: string }> = {
  student: {
    label: 'Your path to PR as a student',
    steps: ['Finish your program', 'Apply for PGWP', '12 months skilled work on PGWP', 'Express Entry / CEC → PR'],
  },
  'work-permit': {
    label: 'Your path to PR as a worker',
    steps: ['12 months TEER 0–3 work', 'Enter Express Entry pool', 'Receive ITA', 'PR via CEC or FSW'],
  },
  'family-member': {
    label: 'Your path to PR as a family member',
    steps: ['Maintain valid permit', '12 months skilled work', 'Express Entry / PNP', 'PR'],
  },
  visitor: {
    label: 'Path from visitor status',
    steps: ['Obtain work or study permit', 'Gain Canadian experience', 'Express Entry / PNP', 'PR'],
  },
  outside: {
    label: 'Path to PR from outside Canada',
    steps: ['Meet language + work requirements', 'Create Express Entry profile', 'Wait for Invitation to Apply', 'Submit PR application'],
  },
  pr: {
    label: 'Path to Canadian citizenship',
    steps: ['Maintain PR (730 days/5 yrs)', '1,095 days physically in Canada', 'Language & tax proof', 'Apply for citizenship'],
  },
}

function StatusRoadmap({ status, score }: { status: string; score: ScoreResult }) {
  const roadmap = ROADMAPS[status] ?? ROADMAPS.outside

  // Determine active step index
  let activeStep = 0
  if (status === 'student') {
    const pgwpPath = score.pathways.find(p => p.id === 'pgwp')
    const cecPath = score.pathways.find(p => p.id === 'cec')
    if (cecPath?.status === 'eligible') activeStep = 3
    else if (pgwpPath?.status === 'eligible' || pgwpPath?.status === 'possible') activeStep = 2
    else if (pgwpPath) activeStep = 1
  } else if (status === 'work-permit') {
    const cecPath = score.pathways.find(p => p.id === 'cec')
    if (cecPath?.status === 'eligible') activeStep = 2
    else activeStep = 1
  } else if (status === 'outside') {
    if (score.fsw?.eligible) activeStep = 1
  }

  return (
    <div className="mb-6 rounded-2xl border border-subtle bg-surface-card p-5 shadow-sm">
      <p className="mb-4 t-eyebrow text-navly-red">{roadmap.label}</p>
      <ol className="flex flex-col gap-3">
        {roadmap.steps.map((step, i) => {
          const done = i < activeStep
          const active = i === activeStep
          return (
            <li key={i} className="flex items-center gap-3">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                done ? 'bg-green-600 text-white' : active ? 'bg-navly-navy text-white' : 'bg-subtle text-muted-text/70'
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </div>
              <span className={`text-sm ${done ? 'text-muted-text/70 line-through' : active ? 'font-semibold text-heading' : 'text-muted-text'}`}>
                {step}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ─── Score Tracker ────────────────────────────────────────────────────────────

function ScoreTracker({ profile }: { profile: IntakeData; score: ScoreResult }) {
  const [simulatedProfile, setSimulatedProfile] = useState<IntakeData>(profile)
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(null)

  useEffect(() => {
    setSimulatedProfile(profile)
  }, [profile])

  const currentScore = calculateScore(simulatedProfile)

  // Language card — universal
  const langDetails = currentScore.clb ? [
    { label: 'Reading', value: `CLB ${currentScore.clb.r}` },
    { label: 'Writing', value: `CLB ${currentScore.clb.w}` },
    { label: 'Listening', value: `CLB ${currentScore.clb.l}` },
    { label: 'Speaking', value: `CLB ${currentScore.clb.s}` },
  ] : []
  const minLang = currentScore.clb ? Math.min(currentScore.clb.r, currentScore.clb.w, currentScore.clb.l, currentScore.clb.s) : 0
  const langStatus = minLang >= 9 ? 'Complete' : minLang >= 7 ? 'In Progress' : 'Required'

  const eduLabels: Record<string, string> = {
    'less-than-secondary': 'None', secondary: 'High School', '1-year': '1 Year', '2-year': '2 Years',
    bachelors: "Bachelor's", 'two-credentials': 'Two Certs', masters: "Master's", doctoral: 'Doctorate',
  }
  const eduVal = simulatedProfile.educationLevel ? eduLabels[simulatedProfile.educationLevel] ?? simulatedProfile.educationLevel : 'Not set'
  const hasECA = simulatedProfile.ecaCompleted === 'yes'
  const canWork = parseFloat(simulatedProfile.canadianWorkMonths) || 0
  const forWork = parseFloat(simulatedProfile.foreignWorkYears) || 0
  const isEligible = currentScore.pathways.some((p) => p.status === 'eligible')

  const handleSave = () => {
    saveProfile(simulatedProfile)
    window.location.reload()
  }

  // ── Status-specific card configs ──────────────────────────────────────────

  const status = profile.status

  // Card 2 — Education context varies by status
  const eduCard = status === 'student' ? {
    title: 'Program & graduation',
    details: [
      { label: 'Level', value: eduVal },
      { label: 'Canadian', value: 'Yes' },
      { label: 'PGWP eligible', value: simulatedProfile.programLengthMonths && parseFloat(simulatedProfile.programLengthMonths) >= 8 ? 'Likely' : 'Check DLI' },
      { label: 'Full-time', value: simulatedProfile.fullTimeStudy === 'yes' ? 'Yes' : 'No' },
    ],
    status: (eduLabels[simulatedProfile.educationLevel] ? 'In Progress' : 'Required') as 'In Progress' | 'Required',
    progress: simulatedProfile.educationLevel ? 60 : 20,
  } : {
    title: 'Education & ECA',
    details: [
      { label: 'Level', value: eduVal },
      { label: 'ECA', value: hasECA ? 'Yes' : 'No' },
      { label: 'Can. Study', value: (!simulatedProfile.canadianEducation || simulatedProfile.canadianEducation === 'none') ? 'No' : 'Yes' },
    ],
    status: (['bachelors','two-credentials','masters','doctoral'].includes(simulatedProfile.educationLevel) && hasECA ? 'Complete' : 'In Progress') as 'Complete' | 'In Progress',
    progress: ['bachelors','two-credentials','masters','doctoral'].includes(simulatedProfile.educationLevel) && hasECA ? 100 : 50,
  }

  // Card 3 — Work context varies by status
  const workCard = status === 'student' ? {
    title: 'Post-graduation work',
    details: [
      { label: 'Post-grad months', value: canWork > 0 ? `${Math.round(canWork)} mo` : 'Not yet' },
      { label: 'TEER', value: simulatedProfile.teerLevel || 'Unknown' },
      { label: 'CEC target', value: '12 months' },
      { label: 'Progress', value: canWork >= 12 ? 'Done ✓' : `${Math.round(canWork)}/12 mo` },
    ],
    status: (canWork >= 12 ? 'Complete' : canWork > 0 ? 'In Progress' : 'Required') as 'Complete' | 'In Progress' | 'Required',
    progress: Math.min(Math.round((canWork / 12) * 100), 100),
  } : status === 'pr' ? {
    title: 'Residency obligation',
    details: [
      { label: '730 days / 5 yrs', value: 'Required' },
      { label: 'Citizenship', value: '1,095 days' },
      { label: 'Tax filings', value: simulatedProfile.taxFilingComplete === 'yes' ? 'On track' : 'Check' },
    ],
    status: 'In Progress' as 'In Progress',
    progress: 50,
  } : {
    title: 'Work experience',
    details: [
      { label: 'Canadian', value: canWork >= 12 ? `${Math.floor(canWork / 12)} yr${Math.floor(canWork / 12) !== 1 ? 's' : ''}` : `${Math.round(canWork)} mo` },
      { label: 'Foreign', value: `${forWork} yr${forWork !== 1 ? 's' : ''}` },
      { label: 'TEER', value: simulatedProfile.teerLevel || 'Unknown' },
      { label: 'Job offer', value: simulatedProfile.hasJobOffer === 'yes' ? 'Yes' : 'No' },
    ],
    status: (canWork >= 12 || forWork >= 3 ? 'Complete' : 'In Progress') as 'Complete' | 'In Progress',
    progress: canWork >= 12 || forWork >= 3 ? 100 : 50,
  }

  // Card 4 — Key pathway card tailored to status
  const card4 = status === 'student' ? (() => {
    const pgwp = currentScore.pathways.find(p => p.id === 'pgwp')
    const cec = currentScore.pathways.find(p => p.id === 'cec')
    return {
      title: 'PGWP & CEC readiness',
      details: [
        { label: 'PGWP', value: pgwp ? (pgwp.status === 'eligible' ? 'Appears to match' : pgwp.status === 'possible' ? 'Possible' : 'Check') : 'Pending' },
        { label: 'CEC', value: cec ? (cec.status === 'eligible' ? 'Appears to match' : 'Not ready yet') : 'Not ready yet' },
        { label: 'Min lang', value: minLang >= 7 ? `CLB ${minLang} ✓` : `CLB ${minLang || '?'} (need 7)` },
      ],
      status: (cec?.status === 'eligible' ? 'Complete' : pgwp?.status === 'eligible' ? 'In Progress' : 'Required') as 'Complete' | 'In Progress' | 'Required',
      progress: cec?.status === 'eligible' ? 100 : pgwp?.status === 'eligible' ? 65 : 30,
    }
  })() : status === 'pr' ? {
    title: 'Citizenship readiness',
    details: [
      { label: '1,095 days', value: 'Required' },
      { label: 'Language', value: simulatedProfile.langTestType ? 'Recorded' : 'Enter scores' },
      { label: 'Tax proof', value: 'Required' },
    ],
    status: 'In Progress' as 'In Progress',
    progress: 40,
  } : {
    title: 'Pathway eligibility',
    details: currentScore.pathways.filter(p => p.status !== 'not-applicable').slice(0, 3).map(p => ({
      label: p.name.replace('Federal Skilled Worker', 'FSW').replace('Canadian Experience Class', 'CEC').replace('Provincial Nominee', 'PNP'),
      value: p.status === 'eligible' ? 'Appears to match' : p.status === 'possible' ? 'May be worth exploring' : 'Not ready yet',
    })),
    status: (isEligible ? 'Complete' : currentScore.pathways.some(p => p.status === 'possible') ? 'In Progress' : 'Under Review') as 'Complete' | 'In Progress' | 'Under Review',
    progress: isEligible ? 100 : currentScore.pathways.some(p => p.status === 'possible') ? 70 : 40,
  }

  return (
    <div className="animate-fade-in relative">
      <StatusRoadmap status={profile.status} score={currentScore} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RequirementCard
          icon={BookOpen}
          title="Language score"
          status={langStatus}
          details={langDetails}
          progress={minLang >= 9 ? 100 : minLang >= 7 ? 65 : 30}
          onClick={() => setActiveCategory('language')}
        />
        <RequirementCard
          icon={GraduationCap}
          title={eduCard.title}
          status={eduCard.status}
          details={eduCard.details}
          progress={eduCard.progress}
          onClick={() => setActiveCategory('education')}
        />
        <RequirementCard
          icon={Briefcase}
          title={workCard.title}
          status={workCard.status}
          details={workCard.details}
          progress={workCard.progress}
          onClick={status !== 'pr' ? () => setActiveCategory('work') : undefined}
        />
        <RequirementCard
          icon={Award}
          title={card4.title}
          status={card4.status}
          details={card4.details.length > 0 ? card4.details : [{ label: 'Pathways', value: 'Calculating…' }]}
          progress={card4.progress}
        />
      </div>

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
    <Card className="mb-8 rounded-2xl border-subtle bg-surface-card">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navly-navy text-white">
            <Plane className="h-4 w-4" />
          </div>
          <div>
            <p className="t-eyebrow text-muted-text">Planning your move</p>
            <p className="font-bold text-heading">{info.title}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          {info.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-text/50" />
              <p className="text-sm leading-relaxed text-muted-text">{step}</p>
            </div>
          ))}
        </div>
        <Link href="/dashboard/tasks" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navly-red hover:underline">
          View your full task list <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}

// ─── PNP stream row (shared between single-province and any-province views) ───

function PNPStreamRow({ s }: { s: PNPStream }) {
  const pct = s.score !== undefined && s.maxScore ? Math.round((s.score / s.maxScore) * 100) : null
  return (
    <div className="rounded-xl border border-subtle/50 bg-surface-alt p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="font-semibold text-sm text-heading leading-snug">{s.streamName}</span>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold ${pnpStatusColors[s.status]}`}>
          {pnpStatusLabels[s.status]}
        </span>
      </div>
      <p className="text-sm text-muted-text">{s.reason}</p>

      {/* AIP readiness checklist */}
      {s.readinessItems && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-bold text-muted-text">AIP Readiness</p>
          <div className="flex flex-col gap-1.5">
            {s.readinessItems.map((item: ReadinessItem, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`mt-0.5 shrink-0 text-sm font-bold ${item.met ? 'text-green-600' : item.warning ? 'text-amber-500' : 'text-red-500'}`}>
                  {item.met ? '✓' : item.warning ? '!' : '✗'}
                </span>
                <div className="min-w-0">
                  <span className={`text-sm ${item.met ? 'text-heading' : 'text-muted-text'}`}>{item.label}</span>
                  {item.warning && (
                    <p className="mt-0.5 text-xs text-amber-600">{item.warning}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {s.readinessItems.every((item: ReadinessItem) => item.met && !item.warning) ? (
            <p className="mt-2 text-xs font-semibold text-green-700">All criteria appear to be met — review with a licensed RCIC before applying.</p>
          ) : s.readinessItems.every((item: ReadinessItem) => item.met) ? (
            <p className="mt-2 text-xs font-semibold text-amber-700">Gates met but some items need verification before applying.</p>
          ) : (
            <p className="mt-2 text-xs text-muted-text/70">Any ✗ item blocks the application.</p>
          )}
        </div>
      )}

      {/* Provincial score / connection strength */}
      {!s.readinessItems && s.score !== undefined && s.maxScore && pct !== null && (
        <div className="mt-3">
          {s.maxScore === 5 ? (
            <>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-text">{s.scoreLabel ?? 'Connection strength'}</span>
                <span className="font-bold text-heading">{s.score} / {s.maxScore}</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: s.maxScore }).map((_, i) => (
                  <span key={i} className={`text-base leading-none ${i < s.score! ? 'text-amber-400' : 'text-muted-text/25'}`}>★</span>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-text/60">
                No public points grid — this reflects your provincial ties (job offer, work, study, relatives). Not an official score.
              </p>
            </>
          ) : (
            <>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-text">{s.scoreLabel ?? 'Est. provincial score'}</span>
                <span className="font-bold text-heading">{s.score} / {s.maxScore}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${pct >= 60 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-400' : 'bg-muted-text/40'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-text/60">
                {s.maxScore === 200
                  ? 'BC Skills Immigration 200-pt grid — typical draw cut-off: 60–100 pts'
                  : 'SK SINP 100-pt grid — typical draw cut-off: 60–75 pts'}
              </p>
            </>
          )}
        </div>
      )}

      {s.missingItems.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {s.missingItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-text">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-text/50" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── PNP Streams Card ─────────────────────────────────────────────────────────

function PNPStreamsCard({ streams, isAnyProvince }: { streams: PNPStream[]; isAnyProvince?: boolean }) {
  const [showNotYet, setShowNotYet] = useState(false)
  if (streams.length === 0) return null

  if (isAnyProvince) {
    // Group by province; show eligible/possible first, collapse not-yet
    const byProvince = streams.reduce<Record<string, PNPStream[]>>((acc, s) => {
      const key = s.province
      acc[key] = acc[key] ?? []
      acc[key].push(s)
      return acc
    }, {})

    const active = streams.filter(s => s.status === 'eligible' || s.status === 'possible')
    const notYet = streams.filter(s => s.status === 'not-yet')
    const activeProvinces = [...new Set(active.map(s => s.province))]
    const notYetProvinces = [...new Set(notYet.map(s => s.province))].filter(p => !activeProvinces.includes(p))

    return (
      <Card className="mb-8 rounded-2xl border-subtle bg-surface-card">
        <CardContent className="p-5">
          <div className="mb-1 flex items-center gap-2">
            <Award className="h-4 w-4 text-heading" />
            <p className="t-section-title">PNP Streams — All Provinces</p>
          </div>
          <p className="mb-4 text-xs text-muted-text">Select a specific province in your profile for a more targeted match. Showing provinces where at least one stream is possible.</p>

          {activeProvinces.length === 0 && (
            <p className="text-sm text-muted-text">No streams appear likely yet. Complete your work, language, and job offer details to unlock matches.</p>
          )}

          <div className="flex flex-col gap-5">
            {activeProvinces.map(province => (
              <div key={province}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-text">{province}</p>
                <div className="flex flex-col gap-3">
                  {(byProvince[province] ?? [])
                    .filter(s => s.status === 'eligible' || s.status === 'possible')
                    .map(s => <PNPStreamRow key={s.id} s={s} />)}
                </div>
              </div>
            ))}
          </div>

          {notYetProvinces.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowNotYet(v => !v)}
                className="text-xs font-semibold text-muted-text hover:text-heading"
              >
                {showNotYet ? 'Hide' : `Show ${notYetProvinces.length} province${notYetProvinces.length > 1 ? 's' : ''} where you don't yet qualify`}
              </button>
              {showNotYet && (
                <div className="mt-3 flex flex-col gap-5">
                  {notYetProvinces.map(province => (
                    <div key={province}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-text">{province}</p>
                      <div className="flex flex-col gap-3">
                        {(byProvince[province] ?? []).map(s => <PNPStreamRow key={s.id} s={s} />)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="mt-4 text-xs text-muted-text/70">
            Provincial scores are estimates for planning only. Requirements and cut-offs change. Always verify at the official provincial website.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Single-province view
  const province = streams[0].province
  const program = streams[0].programName
  return (
    <Card className="mb-8 rounded-2xl border-subtle bg-surface-card">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Award className="h-4 w-4 text-heading" />
          <p className="t-section-title">{program} — {province}</p>
        </div>
        <div className="flex flex-col gap-3">
          {streams.map(s => <PNPStreamRow key={s.id} s={s} />)}
        </div>
        <p className="mt-4 text-xs text-muted-text/70">
          Provincial scores are estimates for planning only. Requirements and cut-offs change. Always verify at the official provincial website.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── EE Draws Card ────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<DrawCategory, string> = {
  'All programs': 'All',
  'Canadian Experience Class': 'CEC',
  'Federal Skilled Worker': 'FSW',
  'Provincial Nominee Program': 'PNP',
  'French Language Proficiency': 'French',
}

function EEDrawsCard({ crs }: { crs: number }) {
  const [activeTab, setActiveTab] = useState<DrawCategory>('All programs')

  const draws = getDrawsByType(activeTab)
  const latest = getLatestByType(activeTab)
  const isPNP = activeTab === 'Provincial Nominee Program'

  // For PNP the cutoff is in CRS-equivalent points after nomination (+600), so raw comparison is not meaningful
  const showScoreInsight = !isPNP && crs > 0 && latest !== null
  const gap = showScoreInsight ? latest!.cutoff - crs : null
  const isCompetitive = gap !== null && gap <= 0

  return (
    <Card className="mb-8 rounded-2xl border-subtle bg-surface-card">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-heading" />
            <p className="t-section-title">Express Entry Draw History</p>
          </div>
          <span className="text-xs text-muted-text/70">Source: IRCC</span>
        </div>

        {/* Category tabs */}
        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-0.5">
          {DRAW_CATEGORIES.map((cat) => {
            const latestForCat = getLatestByType(cat)
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`flex shrink-0 flex-col items-start rounded-xl border px-3 py-2 text-left transition ${
                  activeTab === cat
                    ? 'border-navly-navy bg-navly-navy text-white'
                    : 'border-subtle bg-surface-alt text-muted-text hover:border-navly-navy/30 hover:text-heading'
                }`}
              >
                <span className="text-xs font-bold">{CATEGORY_LABELS[cat]}</span>
                {latestForCat && (
                  <span className={`text-xs mt-0.5 font-semibold ${activeTab === cat ? 'text-white/80' : 'text-muted-text/70'}`}>
                    {cat === 'Provincial Nominee Program' ? `${latestForCat.cutoff} pts` : `${latestForCat.cutoff}`}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Score insight — the key feature */}
        {showScoreInsight && (
          <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${isCompetitive ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
            {isCompetitive
              ? `Your score of ${crs} is ${Math.abs(gap!)} point${Math.abs(gap!) !== 1 ? 's' : ''} above the last ${CATEGORY_LABELS[activeTab]} cutoff of ${latest!.cutoff} — you may be competitive now.`
              : `Your score of ${crs} is ${gap} point${gap !== 1 ? 's' : ''} below the last ${CATEGORY_LABELS[activeTab]} cutoff of ${latest!.cutoff} (${latest!.date}).`}
          </div>
        )}

        {isPNP && (
          <div className="mb-4 rounded-xl bg-surface-alt px-4 py-3 text-sm text-muted-text">
            PNP draws use a combined CRS score (your base score + 600 nomination points). The cutoff shown is the minimum CRS before nomination. Receiving a provincial nomination effectively guarantees an ITA.
          </div>
        )}

        {activeTab === 'French Language Proficiency' && (
          <div className="mb-4 rounded-xl bg-surface-alt px-4 py-3 text-sm text-muted-text">
            French Language Proficiency draws are open only to candidates with strong French scores (CLB/NCLC 7+ in all skills). The cutoff is much lower than All Programs draws because the pool is smaller and filtered. Your base CRS score still needs to meet the cutoff shown.
          </div>
        )}

        {/* Draw list */}
        <div className="flex flex-col gap-2">
          {draws.slice(0, 6).map((d) => {
            const rowGap = !isPNP && crs > 0 ? crs - d.cutoff : null
            const rowAbove = rowGap !== null && rowGap >= 0
            return (
              <div key={d.date} className="flex min-w-0 items-center justify-between rounded-xl bg-surface-alt px-4 py-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-heading whitespace-nowrap">{d.date}</span>
                  {d.invited && <span className="hidden sm:inline text-muted-text/60 text-xs">{d.invited.toLocaleString()} invited</span>}
                </div>
                <div className="ml-3 flex shrink-0 items-center gap-2">
                  <span className="font-bold text-heading">{d.cutoff}</span>
                  {rowGap !== null && (
                    <span className={`text-xs font-semibold ${rowAbove ? 'text-green-600' : 'text-muted-text/60'}`}>
                      {rowAbove ? `+${rowGap}` : rowGap}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-3 text-xs text-muted-text/70">
          Draw data is for planning only. Cutoffs vary by round type and pool composition. Verify at canada.ca.
        </p>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PRTrackerPage() {
  const { t } = useLocale()
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [pnpStreams, setPnpStreams] = useState<PNPStream[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    async function init() {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { user } } = await supabase.auth.getUser()
      const p = user ? await syncProfile(user.id) : null

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

  const cutoff = getLatestCutoff().cutoff
  const isOutside = profile?.locationStatus === 'outside'
  const isQuebec = profile?.intendedProvince === 'QC'

  return (
    <>
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard" className="mb-3 hidden md:inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-text hover:text-heading focus-visible:text-heading">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('prTracker.backToOverview')}
        </Link>
        <p className="hidden md:block t-eyebrow text-navly-red">{t('prTracker.eyebrow')}</p>
        <h1 className="hidden md:block mt-1 t-page-title">{t('prTracker.title')}</h1>
        <p className="mt-2 t-body">{t('prTracker.subtitle')}</p>
      </div>

      {!profile && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {t('prTracker.noProfile')}{' '}
          <Link href="/onboarding" className="font-semibold underline">{t('prTracker.noProfileLink')}</Link>{' '}
          {t('prTracker.noProfileSuffix')}
        </div>
      )}

      <PageTour
        tourKey="navly_tour_pr"
        steps={[
          {
            element: '[data-tour="crs-gauge"]',
            popover: {
              title: 'Your CRS score',
              description: 'This gauge shows your estimated Comprehensive Ranking System score out of 600. The higher it is, the more competitive you are in the Express Entry pool.',
              side: 'bottom', align: 'center',
            },
          },
          {
            element: '[data-tour="pr-improvements"]',
            popover: {
              title: 'How to improve',
              description: 'These are the highest-impact actions you can take right now to increase your score — ranked by how many points each would add.',
              side: 'top', align: 'start',
            },
          },
        ]}
      />

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
        <div className="mb-6 flex flex-col gap-4">
          {!score.hasEnoughData && score.missingFields.length > 0 && (
            <div className="flex items-start gap-3 rounded-2xl border border-navly-red/20 bg-navly-red/5 p-4">
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-navly-red" aria-hidden="true" />
              <div>
                <p className="font-semibold text-heading">{t('prTracker.incompleteTitle')}</p>
                <p className="mt-1 text-sm text-muted-text">
                  {t('prTracker.missingLabel')} <span className="font-medium text-navly-red">{score.missingFields.join(', ')}</span>
                </p>
                <Link href="/onboarding" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-navly-red hover:underline">
                  {t('prTracker.updateProfile')} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
          <div data-tour="crs-gauge" className="flex flex-col items-center rounded-2xl border border-subtle bg-surface-card p-6 shadow-sm">
            <ProgressGauge
              value={score.crs?.total ?? 0}
              max={600}
              label="Complete"
              sublabel="Competitive Express Entry scores typically range 480–550+"
            />
            <div className="mt-4 w-full border-t border-subtle/50 pt-4">
              <div className="flex items-center justify-around gap-2">
                <div className="flex flex-col items-center text-center">
                  <span className="t-stat">{score.crs?.total ?? 0}</span>
                  <span className="mt-1 t-eyebrow text-muted-text">{t('prTracker.yourCRS')}</span>
                </div>
                <>
                  <div className="h-10 w-px bg-subtle" />
                  <div className="flex flex-col items-center text-center">
                    <span className="t-stat">{cutoff}</span>
                    <span className="mt-1 t-eyebrow text-muted-text">{t('prTracker.lastDraw')}</span>
                  </div>
                </>
                {profile.status !== 'student' && profile.status !== 'pr' && score.fsw && score.fsw.score > 0 && (
                  <>
                    <div className="h-10 w-px bg-subtle" />
                    <div className="flex flex-col items-center text-center">
                      <span className="t-stat">{score.fsw.score}</span>
                      <span className="mt-1 t-eyebrow text-muted-text">{t('prTracker.fswGrid')}</span>
                    </div>
                  </>
                )}
              </div>
              {score.crs && score.crs.total > 0 && (() => {
                const gap = cutoff - score.crs.total
                const above = gap <= 0
                return (
                  <div className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-center ${above ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {above
                      ? `${Math.abs(gap)} point${Math.abs(gap) !== 1 ? 's' : ''} above the last cutoff ✓`
                      : `${gap} point${gap !== 1 ? 's' : ''} below the last cutoff`}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── Gated: full breakdown for paid users ── */}
      <PlanGate
        plan="tracker"
        fallback={
          <div className="mb-8">
            {score && score.pathways.length > 0 && (() => {
              const top = score.pathways.find(p => p.status === 'eligible' || p.status === 'possible') ?? score.pathways[0]
              return (
                <div className="mb-4 rounded-2xl border border-subtle bg-surface-card p-5 shadow-sm">
                  <p className="mb-2 t-eyebrow text-muted-text/70">{t('prTracker.topPathwayPreview')}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-heading">{top.name}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${top.status === 'eligible' ? 'bg-green-100 text-green-700' : top.status === 'possible' ? 'bg-amber-100 text-amber-700' : 'bg-subtle text-muted-text'}`}>
                      {top.status === 'eligible' ? t('prTracker.eligible') : top.status === 'possible' ? t('prTracker.possible') : t('prTracker.notReady')}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-text line-clamp-2">{top.reason}</p>
                </div>
              )
            })()}
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex w-full items-center justify-between rounded-2xl border border-dashed border-navly-red/40 bg-navly-red/5 p-5 text-left transition hover:bg-navly-red/10"
            >
              <div>
                <p className="font-bold text-heading">{t('prTracker.unlockTitle')}</p>
                <p className="mt-0.5 text-sm text-muted-text">{t('prTracker.unlockDesc')}</p>
              </div>
              <ArrowRight className="ml-4 h-5 w-5 shrink-0 text-navly-red" />
            </button>
          </div>
        }
      >
        {profile && score && score.hasEnoughData && score.improvements.length > 0 && (
          <div data-tour="pr-improvements" className="mb-6 rounded-2xl border border-navly-navy/15 bg-navly-navy p-5 shadow-md">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-white/60">How to move your score</p>
            <div className="flex flex-col gap-3">
              {score.improvements.slice(0, 3).map((imp, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl bg-white/8 px-4 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navly-red text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-white leading-snug">{imp.label}</span>
                      <span className="rounded-full bg-green-400/20 px-2 py-0.5 text-xs font-bold text-green-300">{imp.impact}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-white/60">{imp.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {profile && score && <ScoreTracker profile={profile} score={score} />}
        {pnpStreams.length > 0 && <PNPStreamsCard streams={pnpStreams} isAnyProvince={profile?.intendedProvince === 'Any'} />}
      </PlanGate>

      {/* EE draws — free for all users */}
      {profile && profile.goal === 'pr' && (
        <EEDrawsCard crs={score?.crs?.total ?? 0} />
      )}

      <div className="flex gap-3 rounded-2xl border border-navly-navy/15 bg-navly-navy/5 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-heading" />
        <p className="text-sm leading-6 text-muted-text">
          <span className="font-semibold text-heading">{t('prTracker.reminder')} </span>
          {t('prTracker.reminderText')}
        </p>
      </div>
    </div>
    {showUpgradeModal && (
      <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
    )}
    </>
  )
}
