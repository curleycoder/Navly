'use client'

import { Label } from '@/components/ui/label'
import { OptionCard, educationOptions } from '../shared'
import type { IntakeData } from '@/lib/profile'

export function StepEducation({ data, onChange }: {
  data: Pick<IntakeData, 'educationLevel' | 'canadianEducation' | 'ecaCompleted'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const isForeign = data.educationLevel && !['less-than-secondary', 'secondary'].includes(data.educationLevel)
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Education</h1>
      <p className="mt-2 text-slate-500">Your highest completed credential. Foreign education needs an ECA for Express Entry.</p>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">Highest education completed</Label>
          {educationOptions.map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.educationLevel === opt.value} onClick={() => onChange({ educationLevel: opt.value })} />
          ))}
        </div>
        {isForeign && (
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-[#0B1F3A]">
              Canadian education
              <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Adds 15 or 30 bonus CRS points.</span>
            </Label>
            {[
              { value: 'none', label: 'No Canadian education', desc: 'All education is from outside Canada' },
              { value: '1-2-year', label: '1–2 year Canadian program', desc: 'College diploma or equivalent' },
              { value: '3-plus-year', label: '3+ year Canadian program', desc: "University degree, Master's, or PhD" },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.canadianEducation === opt.value} onClick={() => onChange({ canadianEducation: opt.value })} />
            ))}
          </div>
        )}
        {isForeign && (!data.canadianEducation || data.canadianEducation === 'none') && (
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-[#0B1F3A]">
              ECA (Educational Credential Assessment) completed?
              <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Required to use foreign education in an Express Entry application.</span>
            </Label>
            {[
              { value: 'yes', label: 'Yes, ECA is done', desc: '' },
              { value: 'no', label: 'No, not yet', desc: '' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.ecaCompleted === opt.value} onClick={() => onChange({ ecaCompleted: opt.value })} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
