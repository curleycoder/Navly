'use client'

import { useEffect, useState } from 'react'
import {
  Flame,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  CalendarCheck,
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
import { loadProfile, saveProfile, statusLabels, goalLabels, getPermitWarning, plannedEntryLabels, type IntakeData } from '@/lib/profile'
import { loadPresence, isCheckedInToday, getPresenceGoal, getDaysInCanada, type PresenceData } from '@/lib/presence'
import { calculateScore, type ScoreResult, type RiskFlag } from '@/lib/scoring'
import { recordScoreSnapshot } from '@/lib/history'
import { ProgressGauge } from '@/components/dashboard/ProgressGauge'
import { RequirementCard } from '@/components/dashboard/RequirementCard'
import { ActionableScoreSheet, type CategoryKey } from '@/components/dashboard/ActionableScoreSheet'
import { ScoreTimelineChart } from '@/components/dashboard/ScoreTimelineChart'
import { DashboardSkeleton } from '@/components/ui/Skeleton'

const allQuickActions = [
  { href: '/dashboard/days', label: 'Days in Canada', desc: 'Confirm your presence daily and protect your streak', icon: Flame, outsideOk: false },
  { href: '/dashboard/tasks', label: 'Settlement & PR tasks', desc: 'Your personalised checklist with step-by-step guidance', icon: ListChecks, outsideOk: true },
  { href: '/dashboard/chat', label: 'Ask the AI assistant', desc: 'Understand pathways, scores, and next steps in plain language', icon: MessageSquare, outsideOk: true },
  { href: '/dashboard/prep', label: 'Consultation prep', desc: 'Export a clean summary of your profile before meeting a consultant', icon: ShieldCheck, outsideOk: true },
]

// ─── Score Tracker ────────────────────────────────────────────────────────────

function ScoreTracker({ profile }: { profile: IntakeData; score: ScoreResult }) {
  const [simulatedProfile, setSimulatedProfile] = useState<IntakeData>(profile);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(null);

  useEffect(() => {
    setSimulatedProfile(profile);
  }, [profile]);

  const currentScore = calculateScore(simulatedProfile);
  const crs = currentScore.crs || { total: 0, age: 0, education: 0, firstLanguage: 0, canadianExperience: 0, skillTransferability: 0, additional: 0 };
  const showIncompleteWarning = !currentScore.hasEnoughData;
  
  // Language Card
  const langDetails = currentScore.clb ? [
    { label: 'Reading', value: `CLB ${currentScore.clb.r}` },
    { label: 'Writing', value: `CLB ${currentScore.clb.w}` },
    { label: 'Listening', value: `CLB ${currentScore.clb.l}` },
    { label: 'Speaking', value: `CLB ${currentScore.clb.s}` },
  ] : [];
  const minLang = currentScore.clb ? Math.min(currentScore.clb.r, currentScore.clb.w, currentScore.clb.l, currentScore.clb.s) : 0;
  const langStatus = minLang >= 9 ? 'Complete' : minLang >= 7 ? 'In Progress' : 'Required';

  // Education Card
  const eduLabels: Record<string, string> = {
    'less-than-secondary': 'None', secondary: 'High School', '1-year': '1 Year', '2-year': '2 Years', bachelors: "Bachelor's", 'two-credentials': 'Two Certs', masters: "Master's", doctoral: "Doctorate"
  };
  const eduVal = simulatedProfile.educationLevel ? eduLabels[simulatedProfile.educationLevel] || simulatedProfile.educationLevel : 'Not set';
  const hasECA = simulatedProfile.ecaCompleted === 'yes';
  const eduDetails = [
    { label: 'Level', value: eduVal },
    { label: 'ECA', value: hasECA ? 'Yes' : 'No' },
    { label: 'Can. Study', value: (!simulatedProfile.canadianEducation || simulatedProfile.canadianEducation === 'none') ? 'No' : 'Yes' }
  ];
  const advEdu = ['bachelors', 'two-credentials', 'masters', 'doctoral'].includes(simulatedProfile.educationLevel);
  const eduStatus = advEdu && hasECA ? 'Complete' : 'In Progress';

  // Work Experience Card
  const canWork = parseFloat(simulatedProfile.canadianWorkMonths) || 0;
  const forWork = parseFloat(simulatedProfile.foreignWorkYears) || 0;
  const workDetails = [
    { label: 'Canadian', value: `${Math.floor(canWork / 12)} Yrs` },
    { label: 'Foreign', value: `${forWork} Yrs` },
    { label: 'TEER', value: simulatedProfile.teerLevel || 'Unknown' },
    { label: 'Job Offer', value: simulatedProfile.hasJobOffer === 'yes' ? 'Yes' : 'No' }
  ];
  const workStatus = canWork >= 12 || forWork >= 3 ? 'Complete' : 'In Progress';

  // Pathways Card
  const pathwayDetails = currentScore.pathways.slice(0, 3).map((p) => ({ 
    label: p.id.toUpperCase(), 
    value: p.status === 'eligible' ? 'Eligible' : 'Not Yet' 
  }));
  const isEligible = currentScore.pathways.some(p => p.status === 'eligible');

  const handleSave = () => {
    saveProfile(simulatedProfile);
    if (crs && crs.total > 0) recordScoreSnapshot(crs.total);
    window.location.reload();
  };

  return (
    <div className="mb-10 animate-fade-in relative">
      {showIncompleteWarning && (
        <Card className="mb-8 rounded-2xl border-[#D62828]/20 bg-[#D62828]/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-[#D62828]" />
              <div>
                <p className="font-semibold text-[#0B1F3A]">Profile incomplete — score estimate unavailable</p>
                <p className="mt-1 text-sm text-slate-600">
                  Add the missing fields to unlock your CRS estimate and pathway analysis. Missing: <span className="font-medium text-[#D62828]">{currentScore.missingFields.join(', ')}</span>.
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
      )}

      <div className="mb-6 flex flex-col items-start gap-4 lg:flex-row lg:items-stretch">
        <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:w-[350px] transition-all duration-300">
          <ProgressGauge
            value={crs.total || 0}
            max={600}
            label="Complete"
            sublabel="Competitive Express Entry scores typically range 480–550+"
          />
          <div className="flex w-full items-center justify-center gap-8 border-t border-slate-100 pt-4">
             <div className="flex flex-col text-center">
               <span className="text-3xl font-bold text-[#0B1F3A] transition-all duration-500">{crs.total}</span>
               <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">CRS Points</span>
             </div>
             <div className="h-10 w-px bg-slate-200" />
             <div className="flex flex-col text-center">
               <span className="text-3xl font-bold text-[#0B1F3A] transition-all duration-500">{currentScore.fsw?.score || 0}</span>
               <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">FSW Grid</span>
             </div>
          </div>
          <ScoreTimelineChart />
        </div>
        
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
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
             details={pathwayDetails.length > 0 ? pathwayDetails : [{label: 'Pathways', value: 'Calculating…'}]}
             progress={isEligible ? 100 : currentScore.pathways.some(p => p.status === 'possible') ? 70 : 40}
          />
        </div>
      </div>

      {currentScore.improvements.length > 0 && (
         <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
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
        <Link
          href="/dashboard/tasks"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#D62828] hover:underline"
        >
          View your full task list <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}

// ─── Express Entry Draws Card ──────────────────────────────────────────────────

const recentDraws = [
  { date: 'Apr 23, 2026', type: 'All programs', cutoff: 491 },
  { date: 'Apr 9, 2026',  type: 'All programs', cutoff: 488 },
  { date: 'Mar 26, 2026', type: 'Canadian Experience Class', cutoff: 504 },
]

function EEDrawsCard({ crs }: { crs: number }) {
  const latest = recentDraws[0]
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
          {recentDraws.map((d) => (
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

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [presence, setPresence] = useState<PresenceData>({ totalDays: 0, streak: 0, longestStreak: 0, lastCheckIn: null, arrivalDate: null, travelLog: [] })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const p = loadProfile()
    setProfile(p)
    if (p) setScore(calculateScore(p))
    setPresence(loadPresence())
    setLoaded(true)
  }, [])

  if (!loaded) return <DashboardSkeleton />

  const status   = profile ? (statusLabels[profile.status] ?? profile.status) : '—'
  const goal     = profile ? (goalLabels[profile.goal] ?? profile.goal) : '—'
  const isOutside = profile?.locationStatus === 'outside'
  const isQuebec = profile?.intendedProvince === 'QC'
  const quickActions = allQuickActions.filter((a) => !isOutside || a.outsideOk)

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Your immigration overview</h1>
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

      {/* Permit expiry banner — shown at top before everything else */}
      {profile && (() => {
        const w = getPermitWarning(profile)
        if (!w) return null
        return (
          <div className={`mb-6 rounded-2xl border-l-4 p-4 ${w.urgent ? 'border-l-red-500 bg-red-50 ring-1 ring-red-200' : 'border-l-amber-400 bg-amber-50 ring-1 ring-amber-200'}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${w.urgent ? 'text-red-500' : 'text-amber-500'}`} />
              <div className="flex-1">
                <p className={`font-bold ${w.urgent ? 'text-red-900' : 'text-amber-900'}`}>
                  {w.daysLeft <= 0
                    ? 'Your permit may have expired'
                    : w.urgent
                    ? `Permit expires in ${w.daysLeft} day${w.daysLeft !== 1 ? 's' : ''} — act now`
                    : `Permit expires in ${w.daysLeft} day${w.daysLeft !== 1 ? 's' : ''}`}
                </p>
                <p className={`mt-1 text-sm ${w.urgent ? 'text-red-800' : 'text-amber-800'}`}>
                  {w.daysLeft <= 0
                    ? 'Contact a licensed RCIC or immigration lawyer immediately to discuss your options.'
                    : w.urgent
                    ? 'Start your renewal or status change application immediately. Do not wait.'
                    : 'Plan your renewal well before the expiry date to avoid gaps in your status.'}
                </p>
                <div className="mt-2 flex gap-4">
                  <Link
                    href="/dashboard/tasks"
                    className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline ${w.urgent ? 'text-red-700' : 'text-amber-700'}`}
                  >
                    View renewal tasks <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    href="/dashboard/consultants"
                    className={`inline-flex items-center gap-1 text-xs font-semibold hover:underline ${w.urgent ? 'text-red-700' : 'text-amber-700'}`}
                  >
                    Find a consultant <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Profile summary */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
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
      </div>

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

      {/* Quebec warning */}
      {isQuebec && <QuebecWarning />}

      {/* Score tracker (only when goal is PR) */}
      {profile && profile.goal === 'pr' && score && (
        <ScoreTracker profile={profile} score={score} />
      )}

      {/* EE draw context — for PR-goal users */}
      {profile && profile.goal === 'pr' && (
        <EEDrawsCard crs={score?.crs?.total ?? 0} />
      )}

      {/* Outside Canada planning — replaces days widget for outside users */}
      {isOutside && profile && <OutsidePlanningCard profile={profile} />}

      {/* Days in Canada — inside-Canada users only */}
      {!isOutside && <Card className="mb-8 rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm text-slate-500">Days in Canada</p>
            <Link href="/dashboard/days" className="flex items-center gap-1 text-sm font-semibold text-[#D62828] hover:underline">
              View details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-3 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Flame className={presence.streak > 0 ? 'h-5 w-5 text-orange-500' : 'h-5 w-5 text-slate-300'} />
              <div>
                <p className="text-2xl font-bold text-[#0B1F3A]">{presence.streak}</p>
                <p className="text-xs text-slate-500">day streak</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-[#0B1F3A]" />
              <div>
                <p className="text-2xl font-bold text-[#0B1F3A]">{getDaysInCanada(presence)}</p>
                <p className="text-xs text-slate-500">days in Canada</p>
              </div>
            </div>
            {profile?.goal && (() => {
              const goal = getPresenceGoal(profile.goal)
              if (!goal) return null
              const daysInCanada = getDaysInCanada(presence)
              const pct = Math.min((daysInCanada / goal.days) * 100, 100)
              return (
                <div className="ml-auto flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-[#D62828]">{daysInCanada} / {goal.days}</span>
                  <div className="h-1.5 w-24 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-[#D62828] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })()}
          </div>
          {!isCheckedInToday(presence) && (
            <p className="mt-3 text-xs text-amber-600 font-medium">You haven't checked in today yet.</p>
          )}
        </CardContent>
      </Card>}

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
          Navly provides estimates based on the data you entered. Final eligibility depends on official IRCC program rules and document review by a licensed professional. This is not legal advice.
        </p>
      </div>
    </div>
  )
}
