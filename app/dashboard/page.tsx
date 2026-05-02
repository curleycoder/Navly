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
  CheckCircle2,
  Clock,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  BookOpen,
  GraduationCap,
  Briefcase,
  Award,
  ShieldAlert,
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { loadProfile, statusLabels, goalLabels, timelineLabels, type IntakeData } from '@/lib/profile'
import { loadPresence, isCheckedInToday, getPresenceGoal, type PresenceData } from '@/lib/presence'
import { calculateScore, type ScoreResult, type PathwayStatus } from '@/lib/scoring'
import { cn } from '@/lib/utils'
import { ProgressGauge } from '@/components/dashboard/ProgressGauge'
import { RequirementCard } from '@/components/dashboard/RequirementCard'

const quickActions = [
  { href: '/dashboard/days', label: 'Days in Canada', desc: 'Check in daily and track your streak', icon: Flame },
  { href: '/dashboard/tasks', label: 'My tasks', desc: 'Stay on top of your next steps', icon: ListChecks },
  { href: '/dashboard/chat', label: 'Ask the AI assistant', desc: 'Get plain-language answers to your questions', icon: MessageSquare },
  { href: '/dashboard/prep', label: 'Consultation prep', desc: 'Build a summary before speaking with a professional', icon: ShieldCheck },
]

// ─── Score Tracker ────────────────────────────────────────────────────────────

function ScoreTracker({ profile, score }: { profile: IntakeData; score: ScoreResult }) {
  if (!score.hasEnoughData) {
    return (
      <Card className="mb-8 rounded-2xl border-[#D62828]/20 bg-[#D62828]/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-[#D62828]" />
            <div>
              <p className="font-semibold text-[#0B1F3A]">Complete your profile to see your PR progress</p>
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
  
  // Language Card
  const langDetails = score.clb ? [
    { label: 'Reading', value: `CLB ${score.clb.r}` },
    { label: 'Writing', value: `CLB ${score.clb.w}` },
    { label: 'Listening', value: `CLB ${score.clb.l}` },
    { label: 'Speaking', value: `CLB ${score.clb.s}` },
  ] : [];
  const minLang = score.clb ? Math.min(score.clb.r, score.clb.w, score.clb.l, score.clb.s) : 0;
  const langStatus = minLang >= 9 ? 'Complete' : minLang >= 7 ? 'In Progress' : 'Required';

  // Education Card
  const eduLabels: Record<string, string> = {
    'less-than-secondary': 'None', secondary: 'High School', '1-year': '1 Year', '2-year': '2 Years', bachelors: "Bachelor's", 'two-credentials': 'Two Certs', masters: "Master's", doctoral: "Doctorate"
  };
  const eduVal = profile.educationLevel ? eduLabels[profile.educationLevel] || profile.educationLevel : 'Not set';
  const hasECA = profile.ecaCompleted === 'yes';
  const eduDetails = [
    { label: 'Level', value: eduVal },
    { label: 'ECA', value: hasECA ? 'Yes' : 'No' },
    { label: 'Can. Study', value: (!profile.canadianEducation || profile.canadianEducation === 'none') ? 'No' : 'Yes' }
  ];
  const advEdu = ['bachelors', 'two-credentials', 'masters', 'doctoral'].includes(profile.educationLevel);
  const eduStatus = advEdu && hasECA ? 'Complete' : 'In Progress';

  // Work Experience Card
  const canWork = parseFloat(profile.canadianWorkMonths) || 0;
  const forWork = parseFloat(profile.foreignWorkYears) || 0;
  const workDetails = [
    { label: 'Canadian', value: `${Math.floor(canWork / 12)} Yrs` },
    { label: 'Foreign', value: `${forWork} Yrs` },
    { label: 'TEER', value: profile.teerLevel || 'Unknown' },
    { label: 'Job Offer', value: profile.hasJobOffer === 'yes' ? 'Yes' : 'No' }
  ];
  const workStatus = canWork >= 12 || forWork >= 3 ? 'Complete' : 'In Progress';

  // Pathways Card
  const pathwayDetails = score.pathways.slice(0, 3).map((p) => ({ 
    label: p.id.toUpperCase(), 
    value: p.status === 'eligible' ? 'Eligible' : 'Not Yet' 
  }));
  const isEligible = score.pathways.some(p => p.status === 'eligible');

  return (
    <div className="mb-10 animate-fade-in">
      <div className="mb-6 flex flex-col items-start gap-4 lg:flex-row lg:items-stretch">
        <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:w-[350px]">
          <ProgressGauge 
            value={crs.total || 0} 
            max={600} 
            label="Complete" 
            sublabel="Targeting competitive base score (500+)" 
          />
          <div className="flex w-full items-center justify-center gap-8 border-t border-slate-100 pt-4">
             <div className="flex flex-col text-center">
               <span className="text-3xl font-bold text-[#0B1F3A]">{crs.total}</span>
               <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">CRS Points</span>
             </div>
             <div className="h-10 w-px bg-slate-200" />
             <div className="flex flex-col text-center">
               <span className="text-3xl font-bold text-[#0B1F3A]">{score.fsw?.score || 0}</span>
               <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">FSW Grid</span>
             </div>
          </div>
        </div>
        
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          <RequirementCard 
             icon={BookOpen} 
             title="Language (IELTS)"
             status={langStatus}
             details={langDetails}
             progress={minLang >= 9 ? 100 : minLang >= 7 ? 65 : 30}
          />
          <RequirementCard 
             icon={GraduationCap} 
             title="Education Check"
             status={eduStatus}
             details={eduDetails}
             progress={eduStatus === 'Complete' ? 100 : 50}
          />
          <RequirementCard 
             icon={Briefcase} 
             title="Work Experience"
             status={workStatus}
             details={workDetails}
             progress={workStatus === 'Complete' ? 100 : 50}
          />
          <RequirementCard 
             icon={Award} 
             title="Pathway Eligibility"
             status={isEligible ? 'Complete' : 'Under Review'}
             details={pathwayDetails.length > 0 ? pathwayDetails : [{label: "Pathways", value: "None"}]}
             progress={isEligible ? 100 : score.pathways.some(p => p.status === 'possible') ? 70 : 40}
          />
        </div>
      </div>

      {score.improvements.length > 0 && (
         <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
           <div className="mb-4 flex items-center gap-2">
             <ShieldAlert className="h-5 w-5 text-amber-600" />
             <h3 className="text-sm font-bold uppercase tracking-wide text-amber-800">Top Action Items</h3>
           </div>
           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {score.improvements.slice(0, 2).map((imp, i) => (
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
  const [presence, setPresence] = useState<PresenceData>({ totalDays: 0, streak: 0, longestStreak: 0, lastCheckIn: null })

  useEffect(() => {
    const p = loadProfile()
    setProfile(p)
    if (p) setScore(calculateScore(p))
    setPresence(loadPresence())
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

      {/* Days in Canada */}
      <Card className="mb-8 rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm text-slate-500">Days in Canada</p>
            <Link href="/dashboard/days" className="flex items-center gap-1 text-sm font-semibold text-[#D62828] hover:underline">
              Check in <ArrowRight className="h-3.5 w-3.5" />
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
                <p className="text-2xl font-bold text-[#0B1F3A]">{presence.totalDays}</p>
                <p className="text-xs text-slate-500">total days</p>
              </div>
            </div>
            {profile?.goal && (() => {
              const goal = getPresenceGoal(profile.goal)
              if (!goal) return null
              const pct = Math.min((presence.totalDays / goal.days) * 100, 100)
              return (
                <div className="ml-auto flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-[#D62828]">{presence.totalDays} / {goal.days}</span>
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
