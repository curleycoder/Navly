'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { goalLabels, educationLabels, plannedEntryLabels, type IntakeData } from '@/lib/profile'
import { CA_PROVINCES } from '@/lib/geo'
import { insideStatusOptions } from './steps/LocationSteps'

export function SummaryView({ data }: { data: IntakeData }) {
  const rows = [
    { label: 'Location', value: data.locationStatus === 'inside' ? 'Inside Canada' : 'Outside Canada' },
    data.locationStatus === 'outside' && data.plannedEntry
      ? { label: 'Planned entry', value: plannedEntryLabels[data.plannedEntry] ?? data.plannedEntry }
      : null,
    data.locationStatus === 'inside' && data.status
      ? { label: 'Current status', value: insideStatusOptions.find(o => o.value === data.status)?.label ?? data.status }
      : null,
    { label: 'Main goal', value: goalLabels[data.goal] ?? data.goal },
    data.originCountry ? { label: 'Country of citizenship', value: data.originCountry } : null,
    data.province ? { label: 'Province', value: CA_PROVINCES.find(p => p.value === data.province)?.label ?? data.province } : null,
    data.arrivalDate ? { label: 'Arrived in Canada', value: data.arrivalDate } : null,
    data.visaExpiryDate ? { label: 'Visa / permit expiry', value: data.visaExpiryDate } : null,
    data.age ? { label: 'Age', value: data.age } : null,
    data.maritalStatus ? { label: 'Marital status', value: { single: 'Single', married: 'Married', 'common-law': 'Common-law' }[data.maritalStatus] ?? data.maritalStatus } : null,
    data.langTestType ? {
      label: 'Language test',
      value: data.langTestType === 'none'
        ? 'No test taken yet'
        : data.langTestType === 'other'
          ? data.langTestName || 'Other test'
          : `${{ 'ielts-general': 'IELTS General', 'ielts-academic': 'IELTS Academic', celpip: 'CELPIP', pte: 'PTE Core', tef: 'TEF Canada', tcf: 'TCF Canada' }[data.langTestType] || data.langTestType}${data.langReading ? ` — R:${data.langReading} W:${data.langWriting} L:${data.langListening} S:${data.langSpeaking}` : ''}`,
    } : null,
    data.educationLevel ? { label: 'Education', value: educationLabels[data.educationLevel] ?? data.educationLevel } : null,
    data.teerLevel ? { label: 'TEER level', value: `TEER ${data.teerLevel}` } : null,
    data.intendedProvince ? { label: 'Intended province', value: data.intendedProvince === 'Any' ? 'No preference' : CA_PROVINCES.find(p => p.value === data.intendedProvince)?.label ?? data.intendedProvince } : null,
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
            <span className="text-sm font-semibold uppercase tracking-wide">Profile saved</span>
          </div>
          <h1 className="text-3xl font-bold text-heading">Your immigration profile is ready</h1>
          <p className="mt-2 text-muted-text">Review your answers. You can update these anytime from your dashboard.</p>
          <div className="mt-8 flex flex-col gap-3">
            {rows.map((row) => (
              <div key={row.label} className="rounded-2xl border border-subtle bg-surface-card p-4">
                <p className="text-sm text-muted-text">{row.label}</p>
                <p className="mt-1 font-semibold text-heading">{row.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-navly-navy/15 bg-navly-navy/5 p-4">
            <p className="text-sm font-semibold text-heading">Reminder</p>
            <p className="mt-1 text-sm leading-6 text-muted-text">
              Navly provides an estimate based on the information you entered. It does not replace a licensed immigration consultant or lawyer.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className={buttonVariants({ className: 'flex-1 bg-navly-red text-white hover:bg-navly-red/80 gap-2' })}>
              View my pathways and dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className={buttonVariants({ variant: 'outline', className: 'border-navly-navy text-heading hover:bg-navly-navy hover:text-white' })}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
