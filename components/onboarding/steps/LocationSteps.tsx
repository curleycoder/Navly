'use client'

import { AlertTriangle } from 'lucide-react'
import { OptionCard } from '../shared'
import type { IntakeData } from '@/lib/profile'

export const insideStatusOptions = [
  { value: 'student', label: 'International student', desc: 'Study permit' },
  { value: 'pgwp', label: 'Post-graduation worker (PGWP)', desc: 'Graduated from a Canadian school, now on PGWP' },
  { value: 'work-permit', label: 'Employer-specific worker', desc: 'LMIA or closed work permit tied to one employer' },
  { value: 'open-work-permit', label: 'Open work permit', desc: 'Spousal OWP, bridging OWP, or refugee work permit' },
  { value: 'pr', label: 'Permanent resident', desc: 'Have PR status' },
  { value: 'visitor', label: 'Visitor', desc: 'Visitor visa, eTA, or TRP' },
  { value: 'other', label: 'Other / not sure', desc: 'Refugee claimant, out of status, or unclear situation' },
]

const plannedEntryOptions = [
  { value: 'study-permit', label: 'Study permit', desc: 'Study in Canada, then PR through PGWP and CEC' },
  { value: 'work-permit', label: 'Work permit', desc: 'Job offer, LMIA, or employer-specific permit' },
  { value: 'express-entry', label: 'Express Entry (direct PR)', desc: 'Federal Skilled Worker or Federal Skilled Trades from outside Canada' },
  { value: 'family', label: 'Family sponsorship', desc: 'Sponsored by a Canadian citizen or permanent resident' },
  { value: 'business', label: 'Business / investment', desc: 'Provincial entrepreneur or investor programs' },
  { value: 'unsure', label: 'Not sure yet', desc: 'Compare all options first' },
]

const goalOptions = [
  { value: 'pr', label: 'Permanent residence', desc: 'CEC, Express Entry, or PNP' },
  { value: 'work-permit', label: 'Work permit', desc: 'Temporary work authorization or path to PR' },
  { value: 'study-permit', label: 'Study permit', desc: 'Study, then PGWP and CEC' },
  { value: 'citizenship', label: 'Canadian citizenship', desc: 'Already a PR — tracking toward citizenship' },
  { value: 'family', label: 'Sponsor or join family', desc: 'Family sponsorship pathway' },
  { value: 'compare', label: 'Compare my options', desc: 'See all pathways available to me' },
]

export function StepLocationSplit({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">Where are you right now?</h1>
      <div role="radiogroup" aria-label="Current location" className="mt-6 flex flex-col gap-3">
        <OptionCard
          label="Inside Canada"
          desc="On a study permit, work permit, visitor visa, or other status"
          selected={value === 'inside'}
          onClick={() => onChange('inside')}
        />
        <OptionCard
          label="Outside Canada"
          desc="Planning to come to Canada"
          selected={value === 'outside'}
          onClick={() => onChange('outside')}
        />
      </div>
    </div>
  )
}

export function StepPlannedEntry({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">How are you planning to come to Canada?</h1>
      <p className="mt-2 text-muted-text">Your entry route determines your pathway to PR.</p>
      <div role="radiogroup" aria-label="Planned entry route" className="mt-6 flex flex-col gap-3">
        {plannedEntryOptions.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={value === opt.value} onClick={() => onChange(opt.value)} />
        ))}
      </div>
    </div>
  )
}

export function StepInsideStatus({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">What is your current status in Canada?</h1>
      <p className="mt-2 text-muted-text">This determines which PR pathways are open to you.</p>
      <div role="radiogroup" aria-label="Current status in Canada" className="mt-6 flex flex-col gap-3">
        {insideStatusOptions.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={value === opt.value} onClick={() => onChange(opt.value)} />
        ))}
      </div>
    </div>
  )
}

export function StepGoal({ data, onChange }: {
  data: Pick<IntakeData, 'goal' | 'status' | 'locationStatus'>
  onChange: (v: string) => void
}) {
  const isVisitorGoingForPR = data.locationStatus === 'inside' && data.status === 'visitor' && data.goal === 'pr'

  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">What is your main goal?</h1>

      {isVisitorGoingForPR && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Visitor status note: </span>
              Visitor status alone does not create a direct PR pathway. You would typically need to transition to a work permit, study permit, or qualify for Express Entry from outside Canada. We will show you the realistic options.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {goalOptions.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.goal === opt.value} onClick={() => onChange(opt.value)} />
        ))}
      </div>
    </div>
  )
}
