'use client'

import { AlertTriangle } from 'lucide-react'
import { OptionCard } from '../shared'
import type { IntakeData } from '@/lib/profile'

export const insideStatusOptions = [
  { value: 'student', label: 'International student', desc: 'Currently on a study permit' },
  { value: 'work-permit', label: 'Worker', desc: 'On a work permit, PGWP, or employer-specific permit' },
  { value: 'pr', label: 'Permanent resident', desc: 'Already have PR status' },
  { value: 'visitor', label: 'Visitor', desc: 'On a visitor visa, eTA, or temporary resident permit' },
  { value: 'other', label: 'Other status', desc: 'Refugee claimant, family permit, out of status, or other situation' },
]

const plannedEntryOptions = [
  { value: 'study-permit', label: 'Study permit', desc: 'Come to Canada to study, then explore PR through PGWP and CEC' },
  { value: 'work-permit', label: 'Work permit', desc: 'Come through a job offer, LMIA, or employer-specific permit' },
  { value: 'express-entry', label: 'Express Entry (direct PR)', desc: 'Apply for PR directly from outside — Federal Skilled Worker or FST' },
  { value: 'family', label: 'Family sponsorship', desc: 'Be sponsored by a Canadian citizen or permanent resident' },
  { value: 'business', label: 'Business / investment', desc: 'Provincial entrepreneur or investor programs' },
  { value: 'unsure', label: 'Not sure yet', desc: 'I want to compare all options before deciding' },
]

const goalOptions = [
  { value: 'pr', label: 'Become a permanent resident', desc: 'Canadian Experience Class, Express Entry, or Provincial Nominee Program' },
  { value: 'work-permit', label: 'Get a work permit', desc: 'Work in Canada temporarily or build toward PR' },
  { value: 'study-permit', label: 'Get a study permit', desc: 'Study in Canada, then explore PR through PGWP and CEC' },
  { value: 'citizenship', label: 'Apply for citizenship', desc: 'Already a PR — want to become a Canadian citizen' },
  { value: 'family', label: 'Sponsor or join family', desc: 'Be sponsored by or sponsor a Canadian citizen or permanent resident' },
  { value: 'compare', label: 'Compare my options', desc: 'I want to understand all pathways available to me' },
]

export function StepLocationSplit({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">Are you currently in Canada?</h1>
      <p className="mt-2 text-muted-text">This determines which pathways apply to you right now.</p>
      <div role="radiogroup" aria-label="Current location" className="mt-6 flex flex-col gap-3">
        <OptionCard
          label="Yes, I am in Canada"
          desc="Currently on a study permit, work permit, visitor visa, or other status"
          selected={value === 'inside'}
          onClick={() => onChange('inside')}
        />
        <OptionCard
          label="No, I am outside Canada"
          desc="Planning to come to Canada — I want to understand my options"
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
      <p className="mt-2 text-muted-text">
        Your planned entry route shapes the entire pathway to permanent residence. Each route has different requirements and timelines.
      </p>
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
      <p className="mt-2 text-muted-text">Your current status determines which PR pathways are open to you and what questions we ask next.</p>
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
      <p className="mt-2 text-muted-text">This helps us show the most relevant pathways and requirements for your situation.</p>

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
