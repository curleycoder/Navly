'use client'

import { ArrowRight, Bell, CalendarDays, CheckCircle2, MapPin, TrendingUp } from 'lucide-react'
import { OptionCard } from '../shared'
import type { IntakeData } from '@/lib/profile'
import { computeDeadlines, formatDeadlineDate, daysUntilDate, normalizeDate } from '@/lib/deadlines'
import { EMPTY_PRESENCE } from '@/lib/presence'

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

      {!currentValue && (
        <button
          type="button"
          onClick={() => handleChange('')}
          className="mt-4 text-sm text-muted-text underline-offset-2 hover:text-heading hover:underline"
        >
          I don't know this date — skip for now
        </button>
      )}

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

export function StepPlanPreview({
  data,
  onSave,
}: {
  data: IntakeData
  onSave: () => void
}) {
  const isOutside = data.locationStatus === 'outside'
  const isPR = data.status === 'pr'

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-navly-red">Your plan is ready</p>
      <h1 className="mt-1 text-3xl font-bold text-heading">Here is what Navly will track</h1>
      <p className="mt-2 text-muted-text">Save your plan to start getting reminders and updates.</p>

      <div className="mt-6 space-y-4">
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
