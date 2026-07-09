'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Bell, CalendarDays, CheckCircle2, MapPin, TrendingUp, Zap } from 'lucide-react'
import { OptionCard } from '../shared'
import type { IntakeData } from '@/lib/profile'
import { computeDeadlines, formatDeadlineDate } from '@/lib/deadlines'
import { roughCRS } from '@/lib/rough-crs'
import { track } from '@/lib/analytics'
import { supabase } from '@/lib/supabase/client'

// ─── Step: Quick CRS inputs ───────────────────────────────────────────────────

const EDU_OPTIONS = [
  { value: 'secondary',    label: 'High school' },
  { value: '1-year',       label: '1-year diploma' },
  { value: '2-year',       label: '2-year diploma' },
  { value: 'bachelors',    label: "Bachelor's" },
  { value: 'masters',      label: "Master's" },
  { value: 'doctoral',     label: 'PhD / Doctoral' },
]

const CLB_OPTIONS = [
  { value: '5',  label: 'Below CLB 6', hint: 'Beginner – intermediate' },
  { value: '6',  label: 'CLB 6',       hint: 'e.g. IELTS ~5.5' },
  { value: '7',  label: 'CLB 7',       hint: 'e.g. IELTS ~6.0' },
  { value: '8',  label: 'CLB 8',       hint: 'e.g. IELTS ~7.0' },
  { value: '9',  label: 'CLB 9',       hint: 'e.g. IELTS ~7.5' },
  { value: '10', label: 'CLB 10+',     hint: 'e.g. IELTS 8.5+' },
]

const WORK_OPTIONS = [
  { value: '0', label: 'None yet' },
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
  { value: '4', label: '4 years' },
  { value: '5', label: '5+ years' },
]

type QuickCRSProps = {
  data: IntakeData
  onChange: (fields: Partial<IntakeData>) => void
}

export function StepQuickCRS({ data, onChange }: QuickCRSProps) {
  const isInsideWorker = data.locationStatus === 'inside' &&
    ['work-permit', 'pgwp', 'open-work-permit', 'employer-specific-work-permit'].includes(data.status)

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-navly-red">
        <Zap className="h-5 w-5" aria-hidden="true" />
        <span className="text-sm font-semibold uppercase tracking-wide">30 seconds</span>
      </div>
      <h1 className="text-3xl font-bold text-heading">Quick score check</h1>
      <p className="mt-2 text-muted-text">
        3 questions. We will estimate your CRS score before you sign up.
      </p>

      {/* Marital status */}
      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold text-heading">Marital status</p>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Marital status">
          {[
            { value: 'single',  label: 'Single / no spouse' },
            { value: 'married', label: 'Married or common-law' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={data.maritalStatus === opt.value || (opt.value === 'married' && data.maritalStatus === 'common-law')}
              onClick={() => onChange({ maritalStatus: opt.value })}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold text-left transition ${
                (data.maritalStatus === opt.value || (opt.value === 'married' && data.maritalStatus === 'common-law'))
                  ? 'border-navly-red bg-navly-red/5 text-navly-red'
                  : 'border-subtle bg-surface-card text-heading hover:border-navly-red/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Age */}
      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold text-heading">How old are you?</p>
        <input
          type="number"
          inputMode="numeric"
          min={18}
          max={70}
          value={data.age}
          onChange={(e) => onChange({ age: e.target.value })}
          placeholder="e.g. 29"
          className="w-full rounded-2xl border-2 border-subtle bg-surface-card px-5 py-4 text-lg font-semibold text-heading placeholder:text-muted-text/50 focus:border-navly-red focus:outline-none"
          aria-label="Your age"
        />
      </div>

      {/* Education */}
      <div className="mt-8">
        <p className="mb-3 text-sm font-semibold text-heading">Highest education completed</p>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Education level">
          {EDU_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={data.educationLevel === opt.value}
              onClick={() => onChange({ educationLevel: opt.value })}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold text-left transition ${
                data.educationLevel === opt.value
                  ? 'border-navly-red bg-navly-red/5 text-navly-red'
                  : 'border-subtle bg-surface-card text-heading hover:border-navly-red/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* CLB */}
      <div className="mt-8">
        <p className="mb-1 text-sm font-semibold text-heading">Best English or French level</p>
        <p className="mb-3 text-xs text-muted-text">Estimate is fine — you can add exact scores after signing up.</p>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Language CLB level">
          {CLB_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={data.selfReportedCLB === opt.value}
              onClick={() => onChange({ selfReportedCLB: opt.value })}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                data.selfReportedCLB === opt.value
                  ? 'border-navly-red bg-navly-red/5'
                  : 'border-subtle bg-surface-card hover:border-navly-red/40'
              }`}
            >
              <p className={`text-sm font-semibold ${data.selfReportedCLB === opt.value ? 'text-navly-red' : 'text-heading'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-muted-text">{opt.hint}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Work experience */}
      <div className="mt-8">
        <p className="mb-1 text-sm font-semibold text-heading">
          {isInsideWorker ? 'Canadian skilled work experience' : 'Total skilled work experience'}
        </p>
        <p className="mb-3 text-xs text-muted-text">
          {isInsideWorker
            ? 'Full-time paid work in TEER 0–3 occupation in Canada.'
            : 'Inside or outside Canada, in a skilled occupation (TEER 0–3).'}
        </p>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Years of skilled work">
          {WORK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={data.foreignWorkYears === opt.value}
              onClick={() => onChange({ foreignWorkYears: opt.value })}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold text-center transition ${
                data.foreignWorkYears === opt.value
                  ? 'border-navly-red bg-navly-red/5 text-navly-red'
                  : 'border-subtle bg-surface-card text-heading hover:border-navly-red/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 1: Goal first ───────────────────────────────────────────────────────

const GOAL_OPTIONS = [
  {
    value: 'deadlines',
    label: 'Track my immigration deadlines',
    desc: 'Permit expiry, passport, language test — get reminders before they lapse',
  },
  {
    value: 'pr',
    label: 'Plan my PR options',
    desc: 'See which Express Entry or PNP pathways match your profile',
  },
  {
    value: 'citizenship',
    label: 'Track my citizenship days',
    desc: 'Count your 1,095 days physically in Canada toward citizenship',
  },
  {
    value: 'residency',
    label: 'Track my PR travel days',
    desc: 'Make sure you meet the 730-day PR residency obligation',
  },
  {
    value: 'explore',
    label: "I'm not sure",
    desc: 'Show me what Navly can do for my situation',
  },
]

export function StepGoalFirst({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">What do you need help with today?</h1>
      <p className="mt-2 text-muted-text">Navly will build your plan around your most important need.</p>
      <div role="radiogroup" aria-label="What you need help with" className="mt-6 flex flex-col gap-3">
        {GOAL_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            desc={opt.desc}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Step 4: Key date ─────────────────────────────────────────────────────────

type DateConfig = {
  label: string
  description: string
  inputType: 'date' | 'month'
  fieldKey: keyof Pick<
    IntakeData,
    'permitExpiry' | 'visaExpiryDate' | 'visitorRecordExpiry' | 'prDate'
  >
  placeholder: string
}

const DATE_CONFIG: Partial<Record<string, DateConfig>> = {
  'work-permit': {
    label: 'Work permit expiry',
    description: 'The expiry month printed on your work permit.',
    inputType: 'month',
    fieldKey: 'permitExpiry',
    placeholder: 'YYYY-MM',
  },
  'pgwp': {
    label: 'PGWP expiry',
    description: 'The expiry month on your Post-Graduation Work Permit.',
    inputType: 'month',
    fieldKey: 'permitExpiry',
    placeholder: 'YYYY-MM',
  },
  'open-work-permit': {
    label: 'Work permit expiry',
    description: 'The expiry month printed on your open work permit.',
    inputType: 'month',
    fieldKey: 'permitExpiry',
    placeholder: 'YYYY-MM',
  },
  'employer-specific-work-permit': {
    label: 'Work permit expiry',
    description: 'The expiry month on your employer-specific work permit.',
    inputType: 'month',
    fieldKey: 'permitExpiry',
    placeholder: 'YYYY-MM',
  },
  'student': {
    label: 'Study permit expiry',
    description: 'The exact expiry date on your study permit.',
    inputType: 'date',
    fieldKey: 'visaExpiryDate',
    placeholder: 'YYYY-MM-DD',
  },
  'visitor': {
    label: 'Visitor record expiry',
    description: 'The expiry date on your visitor record or entry stamp.',
    inputType: 'date',
    fieldKey: 'visitorRecordExpiry',
    placeholder: 'YYYY-MM-DD',
  },
  'pr': {
    label: 'Date you became a PR',
    description: 'The date on your Confirmation of Permanent Residence (COPR).',
    inputType: 'date',
    fieldKey: 'prDate',
    placeholder: 'YYYY-MM-DD',
  },
}

export function StepKeyDate({
  data,
  onChange,
}: {
  data: IntakeData
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const cfg = DATE_CONFIG[data.status]
  if (!cfg) return null

  const currentValue = data[cfg.fieldKey] as string

  function handleChange(raw: string) {
    onChange({ [cfg!.fieldKey]: raw })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">{cfg.label}</h1>
      <p className="mt-2 text-muted-text">{cfg.description}</p>

      <div className="mt-6">
        <input
          type={cfg.inputType}
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full rounded-2xl border-2 border-subtle bg-surface-card px-5 py-4 text-lg font-semibold text-heading focus:border-navly-red focus:outline-none"
          aria-label={cfg.label}
        />
      </div>

      <p className="mt-6 text-xs text-muted-text/70">
        You can add or update this date any time from your dashboard. Navly will never block you from continuing.
      </p>
    </div>
  )
}

// ─── Step 5: Plan preview ─────────────────────────────────────────────────────

function DeadlinePreviewCard({ data }: { data: IntakeData }) {
  const deadlines = computeDeadlines(data).filter((d) => d.relevant && d.date)
  const top = deadlines.sort((a, b) => a.daysUntil - b.daysUntil)[0]

  if (!top) {
    return (
      <div className="rounded-2xl border border-subtle bg-surface-alt p-5 text-center">
        <CalendarDays className="mx-auto h-8 w-8 text-muted-text/40" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-heading">Add your key date in the next step</p>
        <p className="mt-1 text-xs text-muted-text">Navly will track it and remind you before it lapses.</p>
      </div>
    )
  }

  const isExpired = top.daysUntil < 0
  const isUrgent = top.daysUntil <= 60

  return (
    <div className={`rounded-2xl border-l-4 p-5 ${
      isExpired ? 'border-l-red-500 bg-red-50' :
      isUrgent  ? 'border-l-amber-400 bg-amber-50' :
                  'border-l-blue-400 bg-blue-50'
    }`}>
      <p className={`text-xs font-bold uppercase tracking-wider ${
        isExpired ? 'text-red-600' : isUrgent ? 'text-amber-700' : 'text-blue-700'
      }`}>
        {isExpired ? 'Expired' : isUrgent ? 'Action needed' : 'Upcoming deadline'}
      </p>
      <p className={`mt-1 text-lg font-bold ${
        isExpired ? 'text-red-900' : isUrgent ? 'text-amber-900' : 'text-blue-900'
      }`}>
        {top.label}
      </p>
      <p className={`mt-0.5 text-sm ${
        isExpired ? 'text-red-700' : isUrgent ? 'text-amber-700' : 'text-blue-700'
      }`}>
        {isExpired
          ? `${Math.abs(top.daysUntil)} days ago — ${formatDeadlineDate(top.date)}`
          : `${top.daysUntil} day${top.daysUntil !== 1 ? 's' : ''} left — ${formatDeadlineDate(top.date)}`}
      </p>
    </div>
  )
}

function OutsideCanadaPreview() {
  const features = [
    { icon: CalendarDays, text: 'Track permit expiry and key deadlines' },
    { icon: Bell, text: 'Get reminders 180 · 90 · 60 · 30 · 7 days before expiry' },
    { icon: MapPin, text: 'Count your days in Canada toward PR and citizenship' },
    { icon: TrendingUp, text: 'See which PR pathways match your profile' },
  ]
  return (
    <div className="rounded-2xl border border-subtle bg-surface-card p-5">
      <p className="text-sm font-semibold text-heading">When you arrive in Canada, Navly will:</p>
      <ul className="mt-4 space-y-3">
        {features.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-navly-red/10">
              <Icon className="h-4 w-4 text-navly-red" aria-hidden="true" />
            </div>
            <span className="text-sm text-heading">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PRPreview() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-subtle bg-surface-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navly-red/10">
            <MapPin className="h-4 w-4 text-navly-red" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-heading">PR Residency Obligation</p>
            <p className="text-xs text-muted-text">730 days required in 5 years</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-subtle bg-surface-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navly-red/10">
            <CheckCircle2 className="h-4 w-4 text-navly-red" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-heading">Citizenship Tracker</p>
            <p className="text-xs text-muted-text">1,095 days required, including half-day pre-PR credit</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoughCRSCard({ data }: { data: IntakeData }) {
  const est = roughCRS(data)
  if (!est) return null

  return (
    <div className="rounded-2xl border border-navly-navy/20 bg-navly-navy p-5">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-navly-red" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-wider text-white/60">Rough CRS estimate</p>
      </div>
      <p className="text-4xl font-bold text-white leading-none">
        {est.low} – {est.high}
      </p>
      <p className="mt-2 text-sm text-white/60">
        Based on your age, education, language level, and work experience.
        Assumes the same level across reading, writing, listening, and speaking —
        exact test scores will refine this after you sign up.
      </p>
    </div>
  )
}

// ─── Plan preview CTA ─────────────────────────────────────────────────────────
// TODO: replace hardcoded 450 threshold with dynamic "last 3-draw average"
// once an IRCC draw-history pipeline exists and the CTA has proven click demand.

const CRS_THRESHOLD = 450

// State machine:
//   low_score  → idle → waitlist-form → waitlist-done
//                     → consultant-soon
//   high_score → idle → connect-soon
//
// Requires a `waitlist` Supabase table:
//   create table waitlist (
//     id uuid default gen_random_uuid() primary key,
//     email text not null,
//     source text not null default 'plan_preview',
//     created_at timestamptz default now()
//   );

type CTAPhase = 'idle' | 'waitlist-form' | 'waitlist-done' | 'coming-soon'

function ConsultantCTA({
  estimate,
  prefillEmail = '',
}: {
  estimate: { low: number; high: number }
  prefillEmail?: string
}) {
  const [phase, setPhase]         = useState<CTAPhase>('idle')
  const [email, setEmail]         = useState(prefillEmail)
  const [submitting, setSubmitting] = useState(false)

  const base    = Math.round((estimate.low + estimate.high) / 2)
  const variant = base < CRS_THRESHOLD ? 'low_score' : 'high_score'

  useEffect(() => {
    track('plan_cta_viewed', { cta_variant: variant })
  }, [variant])

  function handleClick(cta_type: 'waitlist' | 'consultant' | 'connect') {
    track('plan_cta_clicked', { cta_variant: variant, cta_type })
    setPhase(cta_type === 'waitlist' ? 'waitlist-form' : 'coming-soon')
  }

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    await supabase.from('waitlist').insert({ email: email.trim(), source: 'plan_preview' })
    setSubmitting(false)
    setPhase('waitlist-done')
  }

  // ── Waitlist email form ────────────────────────────────────────────────────
  if (phase === 'waitlist-form') {
    return (
      <form
        onSubmit={handleWaitlistSubmit}
        className="rounded-2xl border border-subtle bg-surface-card p-5"
      >
        <p className="text-sm font-bold text-heading">Be first to know when it launches</p>
        <p className="mt-1 text-xs text-muted-text">
          We&rsquo;ll reach out as soon as the personalized action plan is ready.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-xl border border-subtle bg-surface-alt px-4 py-2.5 text-sm text-heading placeholder:text-muted-text/50 focus:border-navly-red focus:outline-none"
            aria-label="Your email address"
          />
          <button
            type="submit"
            disabled={submitting || !email.trim()}
            className="rounded-xl bg-navly-red px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-40"
          >
            {submitting ? '…' : 'Notify me'}
          </button>
        </div>
      </form>
    )
  }

  // ── Waitlist confirmed ─────────────────────────────────────────────────────
  if (phase === 'waitlist-done') {
    return (
      <div className="rounded-2xl border border-subtle bg-surface-card p-5 text-center">
        <CheckCircle2 className="mx-auto h-6 w-6 text-navly-red" aria-hidden="true" />
        <p className="mt-2 text-sm font-semibold text-heading">You&rsquo;re on the list</p>
        <p className="mt-1 text-xs text-muted-text">
          We&rsquo;ll email you when the personalized action plan is ready.
        </p>
      </div>
    )
  }

  // ── Coming soon (consultant paths) ────────────────────────────────────────
  if (phase === 'coming-soon') {
    return (
      <div className="rounded-2xl border border-subtle bg-surface-card p-5 text-center">
        <p className="text-sm font-semibold text-heading">Consultant matching — coming soon</p>
        <p className="mt-1 text-xs text-muted-text">
          Sign up below and we&rsquo;ll let you know when this is available.
        </p>
      </div>
    )
  }

  // ── Idle — low score: two separate CTAs ───────────────────────────────────
  if (variant === 'low_score') {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleClick('waitlist')}
          className="w-full rounded-2xl border border-navly-red/30 bg-navly-red/5 p-5 text-left transition hover:bg-navly-red/10"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-heading">Your score needs work before a draw invite</p>
              <p className="mt-1 text-xs text-muted-text">
                Recent Express Entry draws have cut off around 480–520. Get a sequenced plan —
                what to fix first, in what order, and which PNP stream to target.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-navly-red/10 px-2 py-0.5 text-xs font-semibold text-navly-red">
              Coming soon
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-navly-red">Join the waitlist →</p>
        </button>

        <button
          type="button"
          onClick={() => handleClick('consultant')}
          className="w-full rounded-2xl border border-subtle bg-surface-card p-5 text-left transition hover:bg-surface-alt"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-heading">Or speak to a certified RCIC</p>
              <p className="mt-1 text-xs text-muted-text">
                An RCIC can review your exact profile, flag your best path, and tell you what to fix first.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-surface-alt px-2 py-0.5 text-xs font-semibold text-muted-text">
              Coming soon
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-navly-red">Book a free consultation →</p>
        </button>
      </div>
    )
  }

  // ── Idle — high score: single connect CTA ─────────────────────────────────
  return (
    <button
      type="button"
      onClick={() => handleClick('connect')}
      className="w-full rounded-2xl border border-subtle bg-surface-card p-5 text-left transition hover:bg-surface-alt"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-heading">Your score is competitive — don&rsquo;t sit on it</p>
          <p className="mt-1 text-xs text-muted-text">
            Express Entry cutoffs shift with every draw. A certified RCIC can tell you which
            current streams you qualify for and when to submit.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-surface-alt px-2 py-0.5 text-xs font-semibold text-muted-text">
          Coming soon
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold text-navly-red">Connect with a certified consultant →</p>
    </button>
  )
}

export function StepPlanPreview({
  data,
  onSave,
}: {
  data: IntakeData
  onSave: () => void
}) {
  const isOutside = data.locationStatus === 'outside'
  const isPR = data.status === 'pr'
  const showCRS = !isPR
  const crsEstimate = showCRS ? roughCRS(data) : null

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-navly-red">Your plan is ready</p>
      <h1 className="mt-1 text-3xl font-bold text-heading">Here is what Navly will track</h1>
      <p className="mt-2 text-muted-text">Save your plan to start getting reminders and updates.</p>

      <div className="mt-6 space-y-4">
        {/* CRS estimate + action CTA — shown for all non-PR users */}
        {crsEstimate && <RoughCRSCard data={data} />}
        {crsEstimate && <ConsultantCTA estimate={crsEstimate} prefillEmail={data.email} />}

        {isOutside ? (
          <OutsideCanadaPreview />
        ) : isPR ? (
          <PRPreview />
        ) : (
          <DeadlinePreviewCard data={data} />
        )}

        {/* Reminder schedule */}
        {!isOutside && !isPR && (
          <div className="rounded-2xl bg-surface-card p-4">
            <p className="text-xs font-semibold text-muted-text mb-2">Reminder schedule</p>
            <div className="flex flex-wrap gap-2">
              {['180 days', '120 days', '90 days', '60 days', '30 days', '7 days'].map((d) => (
                <span key={d} className="rounded-full bg-subtle px-2.5 py-1 text-xs font-semibold text-heading">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-text/70">
          You can add more dates and profile details any time after signing up.
          Navly is a planning tool only — not legal advice.
        </p>
      </div>

      <button
        type="button"
        onClick={onSave}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-navly-red px-6 py-4 text-base font-bold text-white transition hover:bg-navly-red/80"
      >
        Save my plan with email
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <p className="mt-3 text-center text-xs text-muted-text/70">
        Free account · No credit card · Takes under 30 seconds
      </p>
    </div>
  )
}
