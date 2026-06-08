'use client'

import { AlertTriangle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { OptionCard } from '../shared'
import type { IntakeData } from '@/lib/profile'

export function StepRisk({ data, onChange }: {
  data: Pick<IntakeData, 'previousRefusals' | 'lostStatus' | 'criminalityIssues' | 'removalOrder' | 'medicalInadmissibility'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">Background questions</h1>
      <p className="mt-2 text-muted-text">These flag situations that need legal review. Answer honestly — IRCC checks records independently.</p>
      <div className="mt-6 flex flex-col gap-6">

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Have you ever been refused a visa, permit, or entry to Canada or any other country?
          </Label>
          {[
            { value: 'no', label: 'No', desc: '' },
            { value: 'yes', label: 'Yes', desc: 'At least one refusal' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.previousRefusals === opt.value} onClick={() => onChange({ previousRefusals: opt.value })} />
          ))}
          {data.previousRefusals === 'yes' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">Refusals must be disclosed and can affect some PNP streams. A certified consultant can help you address them properly.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Have you ever overstayed a permit or been out of status in Canada?
          </Label>
          {[
            { value: 'no', label: 'No', desc: '' },
            { value: 'yes', label: 'Yes', desc: 'I have overstayed or had a gap in status' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.lostStatus === opt.value} onClick={() => onChange({ lostStatus: opt.value })} />
          ))}
          {data.lostStatus === 'yes' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-sm text-red-800">An overstay or status gap can affect admissibility and some PR pathways. You may need to restore status before applying. We strongly recommend speaking with a certified consultant.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Do you have any criminal convictions, charges, or offences in any country?
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Includes DUI, assault, fraud, drug offences, and other criminal matters.</span>
          </Label>
          {[
            { value: 'no', label: 'No', desc: '' },
            { value: 'yes', label: 'Yes', desc: 'Conviction, charge, or caution on record' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.criminalityIssues === opt.value} onClick={() => onChange({ criminalityIssues: opt.value })} />
          ))}
          {data.criminalityIssues === 'yes' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-sm text-red-800">Criminal inadmissibility is a serious barrier to Canadian immigration. Depending on the offence and time elapsed, rehabilitation or a Temporary Resident Permit may be required. Legal advice is essential.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Have you ever been subject to a removal or deportation order from Canada or any country?
          </Label>
          {[
            { value: 'no', label: 'No', desc: '' },
            { value: 'yes', label: 'Yes', desc: 'I have received a removal or deportation order' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.removalOrder === opt.value} onClick={() => onChange({ removalOrder: opt.value })} />
          ))}
          {data.removalOrder === 'yes' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-sm text-red-800">A removal order can result in a return ban of 1 year, 2 years, or permanently. You likely need Authorization to Return to Canada (ARC) before any new application. Consult a certified immigration consultant or lawyer.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Do you have any serious health conditions that may affect admissibility?
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Conditions that may place excessive demand on Canadian health or social services.</span>
          </Label>
          {[
            { value: 'no', label: 'No', desc: '' },
            { value: 'yes', label: 'Yes / not sure', desc: 'A condition that may be relevant' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.medicalInadmissibility === opt.value} onClick={() => onChange({ medicalInadmissibility: opt.value })} />
          ))}
          {data.medicalInadmissibility === 'yes' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">Medical inadmissibility is assessed by IRCC medical officers after your application. Some conditions can be overcome with certain pathways. A certified consultant can advise on your specific situation.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}