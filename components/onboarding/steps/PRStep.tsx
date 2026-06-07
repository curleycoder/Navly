'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OptionCard, ChevronDownIcon, selectClass } from '../shared'
import type { IntakeData } from '@/lib/profile'

const DAYS_IN_5_YEARS = 1825

export function StepPRStatus({ data, onChange }: {
  data: Pick<IntakeData, 'prDate' | 'prCardExpiry' | 'prPreStatus' | 'hasTraveledSincePR' | 'taxFilingComplete' | 'citizenshipLangProof' | 'citizenshipProhibitions' | 'age' | 'daysOutsideCanada5yr' | 'accompanyingCitizenSpouseAbroad' | 'workingAbroadForCanadianEmployer'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const age = parseInt(data.age) || 0
  const showLangProof = age >= 18 && age <= 54

  const daysOutside = parseInt(data.daysOutsideCanada5yr) || 0
  const daysInCanada = DAYS_IN_5_YEARS - daysOutside
  const hasExemption = data.accompanyingCitizenSpouseAbroad === 'yes' || data.workingAbroadForCanadianEmployer === 'yes'
  const meetsObligation = daysInCanada >= 730 || hasExemption
  const showResidencyStatus = !!data.daysOutsideCanada5yr

  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">Your PR details</h1>
      <p className="mt-2 text-muted-text">
        These dates power your citizenship countdown, PR card reminder, and residency obligation tracker.
      </p>
      <div className="mt-8 flex flex-col gap-8">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="prDate" className="text-sm font-semibold text-heading">
              Date you became a PR
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Used to calculate your citizenship eligibility date and PR residency obligation.</span>
            </Label>
            <Input id="prDate" type="date" value={data.prDate}
              onChange={(e) => onChange({ prDate: e.target.value })}
              className="rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading focus-visible:ring-navly-red" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="prCardExpiry" className="text-sm font-semibold text-heading">
              PR card expiry
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Navly will remind you before it expires.</span>
            </Label>
            <Input id="prCardExpiry" type="month" value={data.prCardExpiry}
              onChange={(e) => onChange({ prCardExpiry: e.target.value })}
              className="max-w-xs rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading focus-visible:ring-navly-red" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold text-heading">
            What was your status in Canada before becoming a PR?
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Temporary resident days before PR may count as half-days toward citizenship (up to 365 days credit).</span>
          </Label>
          <div className="relative">
            <select value={data.prPreStatus} onChange={(e) => onChange({ prPreStatus: e.target.value })}
              className={cn(selectClass, !data.prPreStatus && 'text-muted-text/70')}>
              <option value="" disabled>Select your status before PR…</option>
              <option value="student">International student</option>
              <option value="worker">Worker (work permit / PGWP)</option>
              <option value="visitor">Visitor</option>
              <option value="protected">Refugee / protected person</option>
              <option value="outside">I was outside Canada</option>
              <option value="other">Other</option>
            </select>
            <ChevronDownIcon />
          </div>
        </div>

        {/* ── PR Residency Obligation ── */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-heading">PR residency obligation</p>
            <p className="mt-0.5 text-xs text-muted-text">
              PRs must be physically in Canada at least <span className="font-semibold">730 days in any 5-year period</span> to keep their PR status.
              Time abroad may count if you were accompanying a Canadian citizen spouse or working for a Canadian employer.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Have you travelled outside Canada since becoming a PR?
            </Label>
            {[
              { value: 'no', label: 'No', desc: 'I have stayed in Canada since becoming PR' },
              { value: 'yes', label: 'Yes', desc: 'I have had trips outside Canada' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
                selected={data.hasTraveledSincePR === opt.value}
                onClick={() => onChange({
                  hasTraveledSincePR: opt.value,
                  ...(opt.value === 'no' ? { daysOutsideCanada5yr: '', accompanyingCitizenSpouseAbroad: '', workingAbroadForCanadianEmployer: '' } : {}),
                })} />
            ))}
          </div>

          {data.hasTraveledSincePR === 'yes' && (
            <div className="flex flex-col gap-4 rounded-2xl border border-subtle bg-surface-alt p-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="daysOutside" className="text-sm font-semibold text-heading">
                  Total days outside Canada in the last 5 years
                  <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Count all trips combined. If you became PR less than 5 years ago, count from your PR date.</span>
                </Label>
                <Input id="daysOutside" type="number" min={0} max={1825} placeholder="e.g. 120"
                  value={data.daysOutsideCanada5yr}
                  onChange={(e) => onChange({ daysOutsideCanada5yr: e.target.value })}
                  className="max-w-xs rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading placeholder:text-muted-text/70 focus-visible:ring-navly-red" />
                {showResidencyStatus && (
                  <div className={cn(
                    'flex items-start gap-2 rounded-xl p-3',
                    meetsObligation ? 'border border-green-200 bg-green-50' : 'border border-red-200 bg-red-50',
                  )}>
                    {!meetsObligation && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                    <p className={cn('text-sm font-semibold', meetsObligation ? 'text-green-700' : 'text-red-700')}>
                      {meetsObligation
                        ? `${daysInCanada.toLocaleString()} days in Canada — obligation met`
                        : `${daysInCanada.toLocaleString()} days in Canada — below the 730-day minimum. You may be at risk of losing PR status.`}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Label className="text-sm font-semibold text-heading">
                  Were you accompanying a Canadian citizen spouse or common-law partner abroad?
                  <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Days abroad with a Canadian citizen spouse count toward your residency obligation.</span>
                </Label>
                {[
                  { value: 'no', label: 'No', desc: 'This exemption does not apply' },
                  { value: 'yes', label: 'Yes', desc: 'I was abroad with my Canadian citizen spouse or partner' },
                ].map((opt) => (
                  <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
                    selected={data.accompanyingCitizenSpouseAbroad === opt.value}
                    onClick={() => onChange({ accompanyingCitizenSpouseAbroad: opt.value })} />
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <Label className="text-sm font-semibold text-heading">
                  Were you working outside Canada for a Canadian business or the Canadian government?
                  <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Days abroad employed by a Canadian company or public service may count toward your obligation.</span>
                </Label>
                {[
                  { value: 'no', label: 'No', desc: 'This exemption does not apply' },
                  { value: 'yes', label: 'Yes', desc: 'I worked abroad for a Canadian employer or government' },
                ].map((opt) => (
                  <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
                    selected={data.workingAbroadForCanadianEmployer === opt.value}
                    onClick={() => onChange({ workingAbroadForCanadianEmployer: opt.value })} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Have you filed Canadian taxes for the required years?
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Tax filing is a requirement for citizenship. CRA records are reviewed during citizenship processing.</span>
          </Label>
          {[
            { value: 'yes', label: 'Yes', desc: 'I have filed taxes for all required years' },
            { value: 'partial', label: 'Partially', desc: 'I have filed some but not all required years' },
            { value: 'no', label: 'No', desc: 'I have not filed taxes yet' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
              selected={data.taxFilingComplete === opt.value}
              onClick={() => onChange({ taxFilingComplete: opt.value })} />
          ))}
        </div>

        {showLangProof && (
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Do you have proof of English or French language ability?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Required for citizenship applicants aged 18–54. An accepted test result or other evidence of proficiency qualifies.</span>
            </Label>
            {[
              { value: 'yes', label: 'Yes', desc: 'I have an accepted language test or other proof' },
              { value: 'no', label: 'No', desc: 'I do not have language proof yet' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
                selected={data.citizenshipLangProof === opt.value}
                onClick={() => onChange({ citizenshipLangProof: opt.value })} />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Any criminal charges, removal order, probation, or past citizenship refusal?
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">These may affect citizenship eligibility. Navly will flag this for professional review.</span>
          </Label>
          {[
            { value: 'no', label: 'No', desc: 'None of the above apply to me' },
            { value: 'yes', label: 'Yes', desc: 'One or more of the above apply' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
              selected={data.citizenshipProhibitions === opt.value}
              onClick={() => onChange({ citizenshipProhibitions: opt.value })} />
          ))}
        </div>

      </div>
    </div>
  )
}
