'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { goalLabels, educationLabels, plannedEntryLabels, type IntakeData } from '@/lib/profile'
import { CA_PROVINCES } from '@/lib/geo'
import { insideStatusOptions } from './steps/LocationSteps'

type SignalStatus = 'on-track' | 'action-needed' | 'tracking'

interface PathwaySignal {
  label: string
  status: SignalStatus
  note: string
}

function getPathwaySignals(data: IntakeData): PathwaySignal[] {
  const isInside = data.locationStatus === 'inside'
  const isPR = data.status === 'pr'
  const isPGWP = data.status === 'pgwp'
  const isWorker = ['work-permit', 'pgwp', 'open-work-permit', 'employer-specific-work-permit'].includes(data.status)
  const isStudent = data.status === 'student'

  const canWorkMonths = parseInt(data.canadianWorkMonths) || 0
  const hasTeer03 = ['0', '1', '2', '3'].includes(data.teerLevel)
  const hasLang = !!data.langTestType && data.langTestType !== 'none'
  const foreignYrs = parseFloat(data.foreignWorkYears) || 0

  const signals: PathwaySignal[] = []

  if (isPR) {
    signals.push({
      label: 'Citizenship countdown',
      status: 'tracking',
      note: 'Need 1,095 days physically in Canada in the last 5 years. Your dashboard tracks this daily.',
    })
    signals.push({
      label: 'PR residency obligation',
      status: 'tracking',
      note: 'Must maintain 730 days in Canada per rolling 5-year period to keep PR status.',
    })
    return signals
  }

  // CEC — inside workers
  if (isInside && isWorker && hasTeer03) {
    const cecReady = canWorkMonths >= 12
    signals.push({
      label: 'Canadian Experience Class (CEC)',
      status: cecReady ? 'on-track' : 'action-needed',
      note: cecReady
        ? `${canWorkMonths} months of Canadian skilled work — 12-month minimum met.`
        : `${canWorkMonths} of 12 months of full-time TEER 0–3 work completed. Keep building.`,
    })
  }

  if (isPGWP) {
    signals.push({
      label: 'PGWP → CEC pathway',
      status: 'tracking',
      note: 'Your PGWP lets you gain Canadian work experience. CLB 7+ required since November 2024.',
    })
  }

  // FSW — outside users
  if (data.locationStatus === 'outside' && foreignYrs >= 1 && hasTeer03) {
    signals.push({
      label: 'Federal Skilled Worker (Express Entry)',
      status: hasLang ? 'on-track' : 'action-needed',
      note: hasLang
        ? 'Your full CRS estimate is on your dashboard.'
        : 'Language test required. Take IELTS General Training or CELPIP.',
    })
  }

  // Student → PGWP
  if (isStudent) {
    signals.push({
      label: 'Study → PGWP → CEC pathway',
      status: 'tracking',
      note: 'After graduation, apply for PGWP and gain 12 months of skilled work to qualify for CEC.',
    })
  }

  // Language gap
  if (!hasLang && !isPR) {
    signals.push({
      label: 'Language test missing',
      status: 'action-needed',
      note: 'Required for all Express Entry pathways. Target CLB 9+ for a competitive CRS score.',
    })
  }

  // PNP signal
  const targetProv = data.intendedProvince
  if (targetProv && targetProv !== 'Any' && targetProv !== 'QC') {
    const provLabel = CA_PROVINCES.find(p => p.value === targetProv)?.label ?? targetProv
    signals.push({
      label: `${provLabel} Provincial Nominee Program`,
      status: 'tracking',
      note: 'Your dashboard will match you to eligible PNP streams based on your occupation.',
    })
  }

  return signals
}

export function SummaryView({ data }: { data: IntakeData }) {
  const signals = getPathwaySignals(data)

  const rows = [
    { label: 'Location', value: data.locationStatus === 'inside' ? 'Inside Canada' : 'Outside Canada' },
    data.locationStatus === 'outside' && data.plannedEntry
      ? { label: 'Planned entry', value: plannedEntryLabels[data.plannedEntry] ?? data.plannedEntry }
      : null,
    data.locationStatus === 'inside' && data.status
      ? { label: 'Current status', value: insideStatusOptions.find(o => o.value === data.status)?.label ?? data.status }
      : null,
    data.goal ? { label: 'Main goal', value: goalLabels[data.goal] ?? data.goal } : null,
    data.originCountry ? { label: 'Citizenship', value: data.originCountry } : null,
    data.province ? { label: 'Province', value: CA_PROVINCES.find(p => p.value === data.province)?.label ?? data.province } : null,
    data.arrivalDate ? { label: 'Arrived in Canada', value: data.arrivalDate } : null,
    data.visaExpiryDate ? { label: 'Permit expiry', value: data.visaExpiryDate } : null,
    data.age ? { label: 'Age', value: data.age } : null,
    data.maritalStatus ? { label: 'Marital status', value: { single: 'Single', married: 'Married', 'common-law': 'Common-law' }[data.maritalStatus] ?? data.maritalStatus } : null,
    data.langTestType ? {
      label: 'Language test',
      value: data.langTestType === 'none'
        ? 'No test taken yet'
        : `${{ 'ielts-general': 'IELTS General', celpip: 'CELPIP', pte: 'PTE Core', tef: 'TEF Canada', tcf: 'TCF Canada' }[data.langTestType] || data.langTestType}${data.langReading ? ` — R:${data.langReading} W:${data.langWriting} L:${data.langListening} S:${data.langSpeaking}` : ''}`,
    } : null,
    data.educationLevel ? { label: 'Education', value: educationLabels[data.educationLevel] ?? data.educationLevel } : null,
    data.teerLevel ? { label: 'TEER level', value: `TEER ${data.teerLevel}` } : null,
    data.intendedProvince ? { label: 'Target province', value: data.intendedProvince === 'Any' ? 'No preference' : CA_PROVINCES.find(p => p.value === data.intendedProvince)?.label ?? data.intendedProvince } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-subtle bg-surface-card px-6 py-4">
        <div className="mx-auto max-w-2xl"><NavlyLogo size="sm" /></div>
      </header>
      <div className="flex flex-1 items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <div className="mb-2 flex items-center gap-2 text-navly-red">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Profile complete</span>
          </div>
          <h1 className="text-3xl font-bold text-heading">Your immigration profile is ready</h1>
          <p className="mt-2 text-muted-text">Here is what Navly is tracking for you. Your full score and pathways are on your dashboard.</p>

          {signals.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-heading">What Navly is tracking</p>
              <div className="flex flex-col gap-3">
                {signals.map((signal) => {
                  const isOnTrack = signal.status === 'on-track'
                  const isAction = signal.status === 'action-needed'
                  return (
                    <div key={signal.label} className={`flex items-start gap-3 rounded-2xl border p-4 ${
                      isOnTrack ? 'border-emerald-200 bg-emerald-50' :
                      isAction ? 'border-amber-200 bg-amber-50' :
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="mt-0.5 shrink-0">
                        {isOnTrack && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        {isAction && <AlertCircle className="h-4 w-4 text-amber-500" />}
                        {signal.status === 'tracking' && <Clock className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${
                          isOnTrack ? 'text-emerald-800' : isAction ? 'text-amber-800' : 'text-blue-800'
                        }`}>{signal.label}</p>
                        <p className={`mt-0.5 text-sm ${
                          isOnTrack ? 'text-emerald-700' : isAction ? 'text-amber-700' : 'text-blue-700'
                        }`}>{signal.note}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold text-heading">Profile summary</p>
            <div className="flex flex-col gap-2">
              {rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 rounded-xl border border-subtle bg-surface-card px-4 py-3">
                  <p className="shrink-0 text-sm text-muted-text">{row.label}</p>
                  <p className="text-right text-sm font-semibold text-heading">{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-navly-navy/15 bg-navly-navy/5 p-4">
            <p className="text-sm leading-6 text-muted-text">
              Navly provides estimates based on the information you entered. It does not replace a licensed immigration consultant or lawyer. For legal review, connect with a certified Canadian immigration consultant.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/dashboard" className={buttonVariants({ className: 'flex-1 bg-navly-red text-white hover:bg-navly-red/80 gap-2' })}>
              Open my dashboard <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/" className={buttonVariants({ variant: 'outline', className: 'border-navly-navy text-heading hover:bg-navly-navy hover:text-white' })}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
