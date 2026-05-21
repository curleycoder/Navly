'use client'

import { Sparkles, AlertTriangle } from 'lucide-react'
import { StepSignUp } from './SignUpStep'
import type { IntakeData } from '@/lib/profile'

type Pathway = { label: string; desc: string; strength: 'likely' | 'possible' | 'limited' }

function getMiniPathways(data: IntakeData): Pathway[] {
  const isInside = data.locationStatus === 'inside'

  if (data.status === 'pr') {
    return [{
      label: 'Canadian Citizenship',
      desc: 'As a PR, you are on the path to citizenship. Complete your profile to see your eligibility date and residency day count.',
      strength: 'likely',
    }]
  }

  if (isInside && data.status === 'work-permit') {
    return [
      { label: 'Canadian Experience Class (CEC)', desc: '12 months of skilled paid work in Canada (TEER 0–3) qualifies you for CEC — one of the fastest routes to PR.', strength: 'likely' },
      { label: 'Provincial Nominee Program (PNP)', desc: 'Several PNP streams target workers already in a province. Your occupation and employer play a major role.', strength: 'possible' },
    ]
  }

  if (isInside && data.status === 'student') {
    return [
      { label: 'PGWP → Canadian Experience Class', desc: 'After graduation, a PGWP lets you work in Canada. 12 months of skilled work qualifies you for CEC.', strength: 'possible' },
      { label: 'Provincial Graduate Streams (PNP)', desc: 'Many provinces have international graduate streams for students who studied and want to stay.', strength: 'possible' },
    ]
  }

  if (isInside && data.status === 'visitor') {
    return [
      { label: 'Limited options from visitor status', desc: 'Visitors generally cannot apply for PR from inside Canada. A study or work permit opens more routes.', strength: 'limited' },
      { label: 'Family sponsorship', desc: 'If you have a Canadian citizen or PR spouse or parent, family sponsorship may be possible.', strength: 'possible' },
    ]
  }

  if (data.locationStatus === 'outside') {
    return [
      { label: 'Federal Skilled Worker (Express Entry)', desc: '1+ year of continuous skilled paid work and a strong language score is the main FSW route to PR.', strength: 'possible' },
      { label: 'Provincial Nominee Program (PNP)', desc: 'Most provinces have streams for skilled workers from abroad with ties to that province.', strength: 'possible' },
    ]
  }

  return [
    { label: 'Express Entry', desc: 'Based on your situation, Express Entry may be available. Complete your profile to see your estimated CRS score.', strength: 'possible' },
  ]
}

const strengthColors: Record<Pathway['strength'], string> = {
  likely: 'border-green-200 bg-green-50',
  possible: 'border-blue-200 bg-blue-50',
  limited: 'border-amber-200 bg-amber-50',
}

const strengthLabels: Record<Pathway['strength'], string> = {
  likely: 'Strong path',
  possible: 'Possible',
  limited: 'Limited',
}

const strengthLabelColors: Record<Pathway['strength'], string> = {
  likely: 'text-green-700 bg-green-100',
  possible: 'text-blue-700 bg-blue-100',
  limited: 'text-amber-700 bg-amber-100',
}

export function StepEarlySignup({ data, onComplete }: {
  data: IntakeData
  onComplete: (phone: string) => void
}) {
  const pathways = getMiniPathways(data)

  return (
    <div>
      {/* Mini result preview */}
      <div className="mb-2 flex items-center gap-2 text-[#D62828]">
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-wide">Early result</span>
      </div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Here is what we see so far</h1>
      <p className="mt-2 text-slate-500">
        Based on your location and status, these pathways may be relevant to you. Complete your profile to get a full score and detailed breakdown.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {pathways.map((p) => (
          <div key={p.label} className={`rounded-2xl border p-4 ${strengthColors[p.strength]}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#0B1F3A]">{p.label}</p>
                <p className="mt-1 text-sm text-slate-600">{p.desc}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${strengthLabelColors[p.strength]}`}>
                {strengthLabels[p.strength]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p className="text-xs text-slate-500">
          This is a preliminary estimate based on 4 questions. Your actual eligibility depends on language scores, work experience, education, and other factors you will enter next.
        </p>
      </div>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm font-semibold text-[#0B1F3A]">Create a free account to save your progress</span>
        </div>
      </div>

      {/* Signup form */}
      <StepSignUp onComplete={onComplete} />
    </div>
  )
}
