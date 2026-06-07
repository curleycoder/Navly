'use client'

import { AlertTriangle, Sparkles } from 'lucide-react'

import type { IntakeData } from '@/lib/profile'
import { StepSignUp } from './SignUpStep'

type PathwayStrength = 'likely' | 'possible' | 'limited'

type Pathway = {
  label: string
  desc: string
  strength: PathwayStrength
}

type AccountPayload = {
  fullName: string
  email: string
}

type StepEarlySignupProps = {
  data: IntakeData
  onComplete: (account: AccountPayload) => void
}

function getMiniPathways(data: IntakeData): Pathway[] {
  const isInside = data.locationStatus === 'inside'

  if (data.status === 'pr') {
    return [
      {
        label: 'Canadian Citizenship',
        desc: 'As a permanent resident, your next step may be citizenship. Complete your profile to estimate your eligibility date and residency days.',
        strength: 'likely',
      },
    ]
  }

  if (
    isInside &&
    ['work-permit', 'pgwp', 'open-work-permit', 'employer-specific-work-permit'].includes(
      data.status || ''
    )
  ) {
    return [
      {
        label: 'Canadian Experience Class',
        desc: 'If you have 12 months of skilled paid work in Canada, CEC may be one of your strongest PR pathways.',
        strength: 'likely',
      },
      {
        label: 'Provincial Nominee Program',
        desc: 'Many provinces have worker streams. Your province, occupation, employer, and job offer matter.',
        strength: 'possible',
      },
    ]
  }

  if (isInside && data.status === 'student') {
    return [
      {
        label: 'PGWP to Canadian Experience Class',
        desc: 'After graduation, a PGWP can help you gain Canadian work experience and later qualify for CEC.',
        strength: 'possible',
      },
      {
        label: 'Provincial Graduate Streams',
        desc: 'Some provinces offer PR pathways for international graduates who studied and want to stay.',
        strength: 'possible',
      },
    ]
  }

  if (isInside && data.status === 'visitor') {
    return [
      {
        label: 'Limited options from visitor status',
        desc: 'Visitor status alone usually gives fewer PR options. A study permit, work permit, or family pathway may open more routes.',
        strength: 'limited',
      },
      {
        label: 'Family Sponsorship',
        desc: 'If you have a Canadian citizen or permanent resident spouse, partner, parent, or eligible family member, sponsorship may be possible.',
        strength: 'possible',
      },
    ]
  }

  if (data.locationStatus === 'outside') {
    return [
      {
        label: 'Federal Skilled Worker',
        desc: 'If you have skilled work experience, strong language scores, and enough points, Express Entry may be possible.',
        strength: 'possible',
      },
      {
        label: 'Provincial Nominee Program',
        desc: 'Some provinces invite skilled workers from outside Canada, especially with job offers, local ties, or in-demand occupations.',
        strength: 'possible',
      },
    ]
  }

  return [
    {
      label: 'Express Entry',
      desc: 'Based on your answers so far, Express Entry may be worth checking. Complete your profile to estimate your score.',
      strength: 'possible',
    },
  ]
}

const strengthStyles: Record<PathwayStrength, string> = {
  likely: 'border-green-200 bg-green-50',
  possible: 'border-blue-200 bg-blue-50',
  limited: 'border-amber-200 bg-amber-50',
}

const strengthBadgeStyles: Record<PathwayStrength, string> = {
  likely: 'bg-green-100 text-green-700',
  possible: 'bg-blue-100 text-blue-700',
  limited: 'bg-amber-100 text-amber-700',
}

const strengthLabels: Record<PathwayStrength, string> = {
  likely: 'Strong path',
  possible: 'Possible',
  limited: 'Limited',
}

export function StepEarlySignup({ data, onComplete }: StepEarlySignupProps) {
  const pathways = getMiniPathways(data)

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-navly-red">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        <span className="text-sm font-semibold uppercase tracking-wide">
          Early result
        </span>
      </div>

      <h1 className="text-3xl font-bold text-heading">
        Here is what we see so far
      </h1>

      <p className="mt-2 text-muted-text">
        Based on your answers, these pathways may be relevant. Create a free
        account to save your result and continue your full PR check.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {pathways.map((pathway) => (
          <div
            key={pathway.label}
            className={`rounded-2xl border p-4 ${strengthStyles[pathway.strength]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-heading">
                  {pathway.label}
                </p>

                <p className="mt-1 text-sm text-muted-text">
                  {pathway.desc}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${strengthBadgeStyles[pathway.strength]}`}
              >
                {strengthLabels[pathway.strength]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-subtle bg-surface-alt p-3">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-text/70"
          aria-hidden="true"
        />

        <p className="text-xs text-muted-text">
          This is only an early estimate. Your full result depends on your
          language score, education, work experience, province, and background
          details.
        </p>
      </div>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-subtle" />
        </div>

        <div className="relative flex justify-center">
          <span className="bg-surface-card px-4 text-sm font-semibold text-heading">
            Save your progress
          </span>
        </div>
      </div>

      <StepSignUp
        defaultFullName={data.fullName}
        defaultEmail={data.email}
        onComplete={onComplete}
      />
    </div>
  )
}