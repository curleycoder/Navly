'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { OptionCard, ChevronDownIcon, selectClass } from '../shared'
import { CA_PROVINCES } from '@/lib/geo'
import type { IntakeData } from '@/lib/profile'

// ─── Shared TEER picker ────────────────────────────────────────────────────────

const teerOptions = [
  { value: '0', label: 'TEER 0', desc: 'Management (e.g. CEO, director)' },
  { value: '1', label: 'TEER 1', desc: 'Requires university degree (e.g. software developer, nurse, accountant)' },
  { value: '2', label: 'TEER 2', desc: 'Requires 2-year college diploma (e.g. electrician, chef)' },
  { value: '3', label: 'TEER 3', desc: 'Requires 1-year college diploma (e.g. dental assistant)' },
  { value: '4', label: 'TEER 4', desc: 'Requires high school diploma (e.g. cashier, driver)' },
  { value: '5', label: 'TEER 5', desc: 'No formal education required (e.g. labourer)' },
]

const teerJobExamples: Record<string, { title: string; examples: string[] }> = {
  '0': { title: 'Management occupations — usually require experience in a related field', examples: ['Financial manager', 'HR manager', 'Restaurant manager', 'Construction manager', 'Operations manager', 'IT manager', 'Sales manager', 'Retail manager', 'Assistant manager (with full management duties)'] },
  '1': { title: 'Require a university degree', examples: ['Software engineer', 'Civil engineer', 'Registered nurse', 'Teacher', 'Accountant', 'Physician', 'Lawyer', 'Dentist', 'Pharmacist', 'Architect'] },
  '2': { title: 'Require a college diploma or 2–3 years of apprenticeship', examples: ['Electrician', 'Plumber', 'Paramedic', 'Dental hygienist', 'IT support technician', 'Chef / cook (Red Seal)', 'Welder', 'Industrial mechanic', 'Food service supervisor', 'Retail supervisor', 'Assistant manager (food service / retail)'] },
  '3': { title: 'Require less than 2 years of college or on-the-job training', examples: ['Baker', 'Security guard', 'Hairstylist', 'Pharmacy technician', 'Butcher / meat cutter', 'Early childhood educator', 'Truck driver'] },
  '4': { title: 'Require a high school diploma or short job-specific training', examples: ['Retail salesperson', 'Cashier', 'Bus driver', 'Administrative assistant', 'Food counter attendant', 'Hotel front desk clerk'] },
  '5': { title: 'No formal education required', examples: ['Fruit picker', 'General cleaner', 'Landscaping labourer', 'Construction labourer', 'Factory assembler'] },
}

function TeerOptionCard({ opt, selected, onClick }: { opt: typeof teerOptions[number]; selected: boolean; onClick: () => void }) {
  const [open, setOpen] = useState(false)
  const info = teerJobExamples[opt.value]
  return (
    <div className="flex flex-col">
      <div className={cn('flex items-center justify-between rounded-2xl border-2 p-4 transition-all', selected ? 'border-navly-red bg-navly-red/5' : 'border-subtle bg-surface-card hover:border-subtle/80 hover:shadow-sm')}>
        <button type="button" role="radio" aria-checked={selected} onClick={onClick} className="flex-1 text-left focus-visible:outline-none">
          <p className={cn('font-semibold text-heading', selected && 'text-navly-red')}>{opt.label}</p>
          <p className="mt-0.5 text-sm text-muted-text">{opt.desc}</p>
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
          className="ml-3 shrink-0 rounded-full p-1.5 text-muted-text/70 hover:bg-subtle hover:text-muted-text focus-visible:outline-none"
          aria-label={`See ${opt.label} job examples`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </button>
      </div>
      {open && info && (
        <div className="mt-1 rounded-xl border border-subtle bg-surface-alt px-4 py-3">
          <p className="text-xs font-semibold text-muted-text mb-2">{info.title}</p>
          <div className="flex flex-wrap gap-1.5">
            {info.examples.map((ex) => <span key={ex} className="rounded-full bg-surface-card border border-subtle px-2.5 py-0.5 text-xs text-muted-text">{ex}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}

function OccupationFields({ data, onChange, showForeignYears }: { data: IntakeData; onChange: (fields: Partial<IntakeData>) => void; showForeignYears: boolean }) {
  const isSkilled = ['0', '1', '2', '3'].includes(data.teerLevel)
  return (
    <>
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-semibold text-heading">
          TEER level of your main occupation
          <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Tap ⓘ on each option to see job examples. TEER 0–3 are skilled occupations for Express Entry.</span>
        </Label>
        <div className="flex flex-col gap-2">
          {teerOptions.map((opt) => (
            <TeerOptionCard key={opt.value} opt={opt} selected={data.teerLevel === opt.value} onClick={() => onChange({ teerLevel: opt.value, noc: '', foreignWorkYears: '' })} />
          ))}
        </div>
      </div>
      {isSkilled && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="noc" className="text-sm font-semibold text-heading">
            NOC code (if known)
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">5-digit code from the National Occupational Classification. Improves PNP stream matching.</span>
          </Label>
          <Input id="noc" placeholder="e.g. 21231" value={data.noc} onChange={(e) => onChange({ noc: e.target.value })}
            className="max-w-xs rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading placeholder:text-muted-text/70 focus-visible:ring-navly-red" />
        </div>
      )}
      {isSkilled && showForeignYears && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="foreignYears" className="text-sm font-semibold text-heading">
            Years of skilled work experience outside Canada (last 10 years)
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">TEER 0–3 only. Enter 0 if none.</span>
          </Label>
          <Input id="foreignYears" type="number" min={0} max={10} step={0.5} placeholder="e.g. 3"
            value={data.foreignWorkYears} onChange={(e) => onChange({ foreignWorkYears: e.target.value })}
            className="max-w-xs rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading placeholder:text-muted-text/70 focus-visible:ring-navly-red" />
        </div>
      )}
    </>
  )
}

// ─── Program level options ─────────────────────────────────────────────────────

const programLevelOptions = [
  { value: 'college-diploma', label: 'College diploma / certificate', desc: '2–3 year program' },
  { value: 'bachelor', label: "Bachelor's degree", desc: '3–4 year university program' },
  { value: 'master', label: "Master's degree", desc: 'Graduate-level program' },
  { value: 'doctoral', label: 'PhD / Doctoral', desc: 'Research or professional doctoral program' },
  { value: 'other', label: 'Other', desc: 'Language school, certificate, or short program' },
]

const workPermitOptions = [
  { value: 'pgwp', label: 'Post-Graduation Work Permit (PGWP)', desc: 'After graduating from a Canadian school' },
  { value: 'lmia', label: 'LMIA-backed work permit', desc: 'Employer obtained a Labour Market Impact Assessment' },
  { value: 'lmia-exempt', label: 'LMIA-exempt work permit', desc: 'e.g. ICT, IEC, CUSMA, spousal' },
  { value: 'open', label: 'Open work permit', desc: 'Not tied to a specific employer' },
  { value: 'spousal', label: 'Spousal open work permit', desc: "Based on your partner's status" },
  { value: 'other', label: 'Other / not sure', desc: '' },
]

// ─── Main component ────────────────────────────────────────────────────────────

export function StepWork({ data, onChange }: { data: IntakeData; onChange: (fields: Partial<IntakeData>) => void }) {
  const isInside = data.locationStatus === 'inside'
  const status = data.status
  const inputClass = 'rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading placeholder:text-muted-text/70 focus-visible:ring-navly-red'

  // ── Student branch ──────────────────────────────────────────────────────────
  if (isInside && status === 'student') {
    const pgwpEligible = ['college-diploma', 'bachelor', 'master', 'doctoral'].includes(data.programLevel)
    return (
      <div>
        <h1 className="text-3xl font-bold text-heading">Your study program</h1>
        <p className="mt-2 text-muted-text">PGWP eligibility and your CEC timeline depend on these details.</p>
        <div className="mt-8 flex flex-col gap-8">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="schoolName" className="text-sm font-semibold text-heading">School name</Label>
              <Input id="schoolName" placeholder="e.g. University of British Columbia" value={data.schoolName}
                onChange={(e) => onChange({ schoolName: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dliNumber" className="text-sm font-semibold text-heading">
                DLI number
                <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Designated Learning Institution number from your letter of acceptance.</span>
              </Label>
              <Input id="dliNumber" placeholder="e.g. O19395641872" value={data.dliNumber}
                onChange={(e) => onChange({ dliNumber: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="fieldOfStudy" className="text-sm font-semibold text-heading">Field of study</Label>
            <Input id="fieldOfStudy" placeholder="e.g. Computer Science, Nursing, Business Administration" value={data.fieldOfStudy}
              onChange={(e) => onChange({ fieldOfStudy: e.target.value })} className={inputClass} />
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Current program level
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Your current enrollment — not your previously completed education. This determines PGWP eligibility.</span>
            </Label>
            {programLevelOptions.map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.programLevel === opt.value} onClick={() => onChange({ programLevel: opt.value })} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="progStart" className="text-sm font-semibold text-heading">Program start</Label>
              <Input id="progStart" type="month" value={data.programStartDate}
                onChange={(e) => onChange({ programStartDate: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="progEnd" className="text-sm font-semibold text-heading">Program end (expected)</Label>
              <Input id="progEnd" type="month" value={data.programEndDate}
                onChange={(e) => onChange({ programEndDate: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="progLen" className="text-sm font-semibold text-heading">Program length (months)</Label>
              <Input id="progLen" type="number" min={1} max={72} placeholder="e.g. 24" value={data.programLengthMonths}
                onChange={(e) => onChange({ programLengthMonths: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">Is your program full-time?</Label>
            {[
              { value: 'yes', label: 'Yes — full-time', desc: 'Enrolled full-time every semester' },
              { value: 'no', label: 'No — part-time', desc: 'Currently enrolled part-time' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.fullTimeStudy === opt.value} onClick={() => onChange({ fullTimeStudy: opt.value })} />
            ))}
          </div>

          {data.fullTimeStudy === 'yes' && (
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-semibold text-heading">
                Have you had any part-time semesters?
                <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Any part-time semester can reduce your PGWP length.</span>
              </Label>
              {[
                { value: 'no', label: 'No', desc: 'All semesters have been full-time' },
                { value: 'yes', label: 'Yes', desc: 'At least one semester was part-time' },
              ].map((opt) => (
                <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.hadPartTimeSemester === opt.value} onClick={() => onChange({ hadPartTimeSemester: opt.value })} />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Have you done any unauthorized work?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Working without authorization while studying can affect future permit and PR applications.</span>
            </Label>
            {[
              { value: 'no', label: 'No', desc: 'I have not worked without authorization' },
              { value: 'yes', label: 'Yes', desc: 'I have worked without proper authorization' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.unauthorizedWork === opt.value} onClick={() => onChange({ unauthorizedWork: opt.value })} />
            ))}
            {data.unauthorizedWork === 'yes' && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">Unauthorized work must be disclosed and can affect future permit and PR applications. We strongly recommend speaking with a certified immigration consultant before proceeding.</p>
              </div>
            )}
          </div>

          {pgwpEligible && (
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-semibold text-heading">
                Have you applied for a PGWP?
                <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Post-Graduation Work Permit — allows you to work in Canada after graduation and build CEC-eligible experience.</span>
              </Label>
              {[
                { value: 'not-yet', label: 'Not yet — still studying', desc: 'I will apply after graduating' },
                { value: 'no', label: 'No — not applying', desc: 'I do not plan to get a PGWP' },
                { value: 'yes', label: 'Yes — already applied or received', desc: '' },
              ].map((opt) => (
                <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.pgwpApplied === opt.value} onClick={() => onChange({ pgwpApplied: opt.value })} />
              ))}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">PGWP language requirement (as of November 1, 2024):</span> PGWP applicants must provide proof of English or French language ability (CLB/NCLC 7 for most programs, CLB/NCLC 5 for trades). Exception: PGWP-eligible flight school graduates.
                </p>
              </div>
            </div>
          )}

          {data.pgwpApplied === 'yes' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="pgwpExpiry" className="text-sm font-semibold text-heading">
                PGWP expiry date
                <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Navly will remind you before it expires.</span>
              </Label>
              <Input id="pgwpExpiry" type="month" value={data.pgwpExpiry}
                onChange={(e) => onChange({ pgwpExpiry: e.target.value })} className={cn(inputClass, 'max-w-xs')} />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Current work authorization
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Work gained while studying full-time does not count toward CEC. Post-graduation PGWP work may count if TEER 0–3 at 30+ hrs/week.</span>
            </Label>
            {[
              { value: 'none', label: 'None — student only', desc: 'Not currently working' },
              { value: 'pgwp', label: 'Working on PGWP', desc: 'Post-graduation work permit' },
              { value: 'bridging', label: 'Bridging open work permit', desc: 'Applied for PR and received bridging permit' },
              { value: 'other', label: 'Other work authorization', desc: 'Co-op, on-campus, or other permit' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.workAuthAfterGrad === opt.value} onClick={() => onChange({ workAuthAfterGrad: opt.value })} />
            ))}
          </div>

          {['pgwp', 'bridging'].includes(data.workAuthAfterGrad) && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="canWorkPGWP" className="text-sm font-semibold text-heading">
                Months of skilled Canadian work experience
                <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">TEER 0–3 occupations, 30+ hrs/week. 12 months qualifies for CEC.</span>
              </Label>
              <Input id="canWorkPGWP" type="number" min={0} max={120} placeholder="e.g. 8" value={data.canadianWorkMonths}
                onChange={(e) => onChange({ canadianWorkMonths: e.target.value })} className={cn(inputClass, 'max-w-xs')} />
            </div>
          )}

          <OccupationFields data={data} onChange={onChange} showForeignYears={false} />

        </div>
      </div>
    )
  }

  // ── Worker branch ───────────────────────────────────────────────────────────
  if (isInside && status === 'work-permit') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-heading">Your work experience in Canada</h1>
        <p className="mt-2 text-muted-text">Canadian skilled work is the most direct path to PR through Canadian Experience Class.</p>
        <div className="mt-8 flex flex-col gap-8">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="employerName" className="text-sm font-semibold text-heading">Employer name</Label>
              <Input id="employerName" placeholder="e.g. Acme Corp" value={data.employerName}
                onChange={(e) => onChange({ employerName: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="jobTitle" className="text-sm font-semibold text-heading">Job title</Label>
              <Input id="jobTitle" placeholder="e.g. Software Developer" value={data.jobTitle}
                onChange={(e) => onChange({ jobTitle: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">Work permit type</Label>
            {workPermitOptions.map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.workPermitType === opt.value} onClick={() => onChange({ workPermitType: opt.value })} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="permitExpiry" className="text-sm font-semibold text-heading">
                Work permit expiry
                <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Navly will remind you before it expires.</span>
              </Label>
              <Input id="permitExpiry" type="month" value={data.permitExpiry}
                onChange={(e) => onChange({ permitExpiry: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="workStart" className="text-sm font-semibold text-heading">
                Start date in current skilled job
              </Label>
              <Input id="workStart" type="date" value={data.workStartDate}
                onChange={(e) => onChange({ workStartDate: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-heading">Province of job</Label>
            <div className="relative">
              <select value={data.provinceOfJob} onChange={(e) => onChange({ provinceOfJob: e.target.value })}
                className={cn(selectClass, !data.provinceOfJob && 'text-muted-text/70')}>
                <option value="" disabled>Select province or territory…</option>
                {CA_PROVINCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
              <ChevronDownIcon />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="wage" className="text-sm font-semibold text-heading">Hourly wage (CAD)</Label>
              <Input id="wage" type="number" min={0} step={0.5} placeholder="e.g. 28.50" value={data.wage}
                onChange={(e) => onChange({ wage: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hours" className="text-sm font-semibold text-heading">Hours per week</Label>
              <Input id="hours" type="number" min={1} max={80} placeholder="e.g. 40" value={data.hoursPerWeek}
                onChange={(e) => onChange({ hoursPerWeek: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">Full-time or part-time?</Label>
            {[
              { value: 'full-time', label: 'Full-time', desc: '30 or more hours per week' },
              { value: 'part-time', label: 'Part-time', desc: 'Less than 30 hours per week' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.fullTimeOrPartTime === opt.value} onClick={() => onChange({ fullTimeOrPartTime: opt.value })} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Is this job permanent and non-seasonal?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">CEC requires work that is non-seasonal and ongoing.</span>
            </Label>
            {[
              { value: 'yes', label: 'Yes', desc: 'Permanent, non-seasonal position' },
              { value: 'no', label: 'No', desc: 'Seasonal, contract, or temporary' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.isPermanentNonSeasonal === opt.value} onClick={() => onChange({ isPermanentNonSeasonal: opt.value })} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">Are you self-employed?</Label>
            {[
              { value: 'no', label: 'No', desc: 'Employed by a company or organization' },
              { value: 'yes', label: 'Yes', desc: 'Self-employed, freelance, or own a business' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.isSelfEmployed === opt.value} onClick={() => onChange({ isSelfEmployed: opt.value })} />
            ))}
            {data.isSelfEmployed === 'yes' && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">Self-employment does not count toward CEC or most PNP work experience requirements. Consult a certified consultant about alternative pathways.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Do you have a written job offer from a Canadian employer?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">A qualifying arranged employment offer may add 50 or 200 CRS points, but many job offers do not qualify. It must be LMIA-backed or LMIA-exempt under specific categories.</span>
            </Label>
            {[
              { value: 'yes', label: 'Yes', desc: 'I have a written offer from a Canadian employer' },
              { value: 'no', label: 'No', desc: 'No job offer' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.hasJobOffer === opt.value} onClick={() => onChange({ hasJobOffer: opt.value })} />
            ))}
          </div>

          {data.hasJobOffer === 'yes' && (
            <>
              <div className="flex flex-col gap-3">
                <Label className="text-sm font-semibold text-heading">Is this the same employer as your current job?</Label>
                {[
                  { value: 'yes', label: 'Yes', desc: 'Same employer I currently work for' },
                  { value: 'no', label: 'No', desc: 'Different employer' },
                ].map((opt) => (
                  <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.sameEmployerAsJobOffer === opt.value} onClick={() => onChange({ sameEmployerAsJobOffer: opt.value })} />
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lmia" className="text-sm font-semibold text-heading">
                  LMIA number (if applicable)
                  <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Leave blank if not LMIA-backed.</span>
                </Label>
                <Input id="lmia" placeholder="e.g. A1234567" value={data.lmiaNumber}
                  onChange={(e) => onChange({ lmiaNumber: e.target.value })} className={cn(inputClass, 'max-w-xs')} />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="canWorkMonths" className="text-sm font-semibold text-heading">
              Total months of skilled Canadian work experience
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">TEER 0–3 occupations, 30+ hrs/week. 12 months qualifies for CEC.</span>
            </Label>
            <Input id="canWorkMonths" type="number" min={0} max={120} placeholder="e.g. 14" value={data.canadianWorkMonths}
              onChange={(e) => onChange({ canadianWorkMonths: e.target.value })} className={cn(inputClass, 'max-w-xs')} />
          </div>

          <OccupationFields data={data} onChange={onChange} showForeignYears />

        </div>
      </div>
    )
  }

  // ── Visitor branch ──────────────────────────────────────────────────────────
  if (isInside && status === 'visitor') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-heading">Your visitor situation</h1>
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Visitors do not have a direct route to PR while in Canada</p>
            <p className="mt-1 text-sm text-amber-700">Most PR pathways require authorized work or study experience, or an application from outside Canada. Visitors who apply for PR from inside Canada without meeting the requirements will be refused. Do not rely on tourist status to build a PR application.</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-8">

          <div className="flex flex-col gap-2">
            <Label htmlFor="visitorExpiry" className="text-sm font-semibold text-heading">
              Visitor record / authorized stay expiry
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">The date you must leave Canada or apply to extend.</span>
            </Label>
            <Input id="visitorExpiry" type="date" value={data.visitorRecordExpiry}
              onChange={(e) => onChange({ visitorRecordExpiry: e.target.value })} className={cn(inputClass, 'max-w-xs')} />
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">Have you applied to extend your visitor status?</Label>
            {[
              { value: 'no', label: 'No', desc: 'I have not applied to extend' },
              { value: 'yes', label: 'Yes — applied', desc: 'Extension application is in progress' },
              { value: 'planning', label: 'Planning to apply', desc: 'I intend to apply before my status expires' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.extendedVisitorStatus === opt.value} onClick={() => onChange({ extendedVisitorStatus: opt.value })} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Do you have a Canadian citizen or PR spouse / partner?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Family sponsorship may be possible, but your spouse must meet income and other requirements.</span>
            </Label>
            {[
              { value: 'no', label: 'No', desc: 'I do not have a Canadian spouse or partner' },
              { value: 'yes', label: 'Yes', desc: 'My spouse or partner is a Canadian citizen or PR' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.parentOrChildSponsor === opt.value}
                onClick={() => onChange({ parentOrChildSponsor: opt.value })} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Are you planning to apply for a study permit?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Studying in Canada can lead to a PGWP and eventually CEC. This is a common route for visitors who want PR.</span>
            </Label>
            {[
              { value: 'no', label: 'No', desc: 'I am not planning to study' },
              { value: 'considering', label: 'Considering it', desc: 'I am researching study options' },
              { value: 'yes', label: 'Yes — applied or planning to apply soon', desc: '' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.applyingForStudyPermit === opt.value} onClick={() => onChange({ applyingForStudyPermit: opt.value })} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Do you have skilled work experience that may qualify for Express Entry from outside Canada?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">You can leave Canada and apply through Express Entry if you meet FSW or other federal program requirements.</span>
            </Label>
            {[
              { value: 'no', label: 'No', desc: 'I do not have qualifying skilled work experience' },
              { value: 'unsure', label: 'Not sure', desc: 'I have work experience but am unsure if it qualifies' },
              { value: 'yes', label: 'Yes', desc: 'I have 1+ years of skilled foreign or Canadian work experience' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.eligibleForEEFromAbroad === opt.value} onClick={() => onChange({ eligibleForEEFromAbroad: opt.value })} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Do you have a job offer from a Canadian employer?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Visitors generally cannot work in Canada. A job offer alone does not give you work authorization.</span>
            </Label>
            {[
              { value: 'no', label: 'No', desc: 'I do not have a Canadian job offer' },
              { value: 'yes', label: 'Yes', desc: 'I have a written offer from a Canadian employer' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.hasJobOffer === opt.value} onClick={() => onChange({ hasJobOffer: opt.value })} />
            ))}
          </div>

        </div>
      </div>
    )
  }

  // ── Outside Canada / FSW branch ─────────────────────────────────────────────
  if (data.locationStatus === 'outside') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-heading">Work experience</h1>
        <p className="mt-2 text-muted-text">Federal Skilled Worker requires at least 1 year of continuous skilled work. These details determine your FSW 67-point eligibility and CRS score.</p>
        <div className="mt-8 flex flex-col gap-8">

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Do you have at least 1 year of continuous full-time (or equivalent) skilled work experience?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Must be paid, non-self-employed, TEER 0–3, in the last 10 years. FSW requires 1 continuous year or equivalent part-time.</span>
            </Label>
            {[
              { value: 'yes', label: 'Yes', desc: 'I have at least 1 continuous year of skilled paid work' },
              { value: 'no', label: 'No', desc: 'I do not have 1 continuous year yet' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.continuousSkilledWork1yr === opt.value} onClick={() => onChange({ continuousSkilledWork1yr: opt.value })} />
            ))}
            {data.continuousSkilledWork1yr === 'no' && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800">Without 1 year of continuous skilled work, Federal Skilled Worker is not available. You may still qualify for other Express Entry programs once you gain more experience.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fswFrom" className="text-sm font-semibold text-heading">
                Work experience start (most recent qualifying job)
              </Label>
              <Input id="fswFrom" type="month" value={data.fswWorkDateFrom}
                onChange={(e) => onChange({ fswWorkDateFrom: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fswTo" className="text-sm font-semibold text-heading">Work experience end</Label>
              <Input id="fswTo" type="month" value={data.fswWorkDateTo}
                onChange={(e) => onChange({ fswWorkDateTo: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">Was this paid employment?</Label>
            {[
              { value: 'yes', label: 'Yes — paid', desc: 'I received wages or salary' },
              { value: 'no', label: 'No — unpaid / volunteer', desc: 'Volunteer or unpaid work does not count' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.paidWork === opt.value} onClick={() => onChange({ paidWork: opt.value })} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">Full-time or part-time equivalent?</Label>
            {[
              { value: 'full-time', label: 'Full-time', desc: '30 or more hours per week' },
              { value: 'part-time-equivalent', label: 'Part-time equivalent', desc: 'Multiple part-time jobs totalling 30+ hrs/week' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.fullTimeEquivalent === opt.value} onClick={() => onChange({ fullTimeEquivalent: opt.value })} />
            ))}
          </div>

          <OccupationFields data={data} onChange={onChange} showForeignYears />

          <div className="rounded-2xl border border-subtle bg-surface-alt p-4">
            <p className="text-sm font-semibold text-heading">Education Credential Assessment (ECA)</p>
            <p className="mt-1 text-xs text-muted-text">FSW applicants with foreign credentials must have an ECA from a designated organization (e.g. WES, ICAS, IQAS).</p>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ecaCountry" className="text-sm font-semibold text-heading">Country where credential was obtained</Label>
                <Input id="ecaCountry" placeholder="e.g. India, Philippines, Nigeria" value={data.educationCredentialCountry}
                  onChange={(e) => onChange({ educationCredentialCountry: e.target.value })} className={inputClass} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ecaOrg" className="text-sm font-semibold text-heading">ECA organization (if completed)</Label>
                <Input id="ecaOrg" placeholder="e.g. WES, ICAS, IQAS, PEBC" value={data.ecaOrganization}
                  onChange={(e) => onChange({ ecaOrganization: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ecaIssued" className="text-sm font-semibold text-heading">ECA issue date</Label>
                  <Input id="ecaIssued" type="month" value={data.ecaIssueDate}
                    onChange={(e) => onChange({ ecaIssueDate: e.target.value })} className={inputClass} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ecaExpiry" className="text-sm font-semibold text-heading">
                    ECA expiry
                    <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Most ECAs are valid 5 years from issue.</span>
                  </Label>
                  <Input id="ecaExpiry" type="month" value={data.ecaExpiryDate}
                    onChange={(e) => onChange({ ecaExpiryDate: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Do you have relatives in Canada (citizen or PR)?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">A sibling, parent, child, grandparent, aunt, or uncle who is a Canadian citizen or PR may add adaptability points to your FSW score.</span>
            </Label>
            {[
              { value: 'no', label: 'No', desc: 'No close relatives in Canada' },
              { value: 'yes', label: 'Yes', desc: 'I have at least one eligible relative in Canada' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.relativesInCanada === opt.value} onClick={() => onChange({ relativesInCanada: opt.value })} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">Current job search status</Label>
            {[
              { value: 'not-yet', label: 'Not actively searching yet', desc: 'I am focused on qualifying first' },
              { value: 'actively-searching', label: 'Actively searching', desc: 'I am applying to Canadian employers' },
              { value: 'have-offer', label: 'I have a job offer', desc: 'A Canadian employer has offered me a position' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.jobSearchStatus === opt.value} onClick={() => onChange({ jobSearchStatus: opt.value })} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Do you have a valid job offer from a Canadian employer?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">A qualifying arranged employment offer may add 50 or 200 CRS points, but many job offers do not qualify. It must be LMIA-backed or LMIA-exempt under specific categories.</span>
            </Label>
            {[
              { value: 'yes', label: 'Yes', desc: 'I have a written offer that may qualify' },
              { value: 'no', label: 'No', desc: 'I do not have a job offer yet' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.hasJobOffer === opt.value} onClick={() => onChange({ hasJobOffer: opt.value })} />
            ))}
          </div>

        </div>
      </div>
    )
  }

  // ── Default branch (refugee, family-member, other inside statuses) ───────────
  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">Work experience</h1>
      <p className="mt-2 text-muted-text">Your work history helps determine which PR pathways may be available to you.</p>
      <div className="mt-8 flex flex-col gap-8">
        <OccupationFields data={data} onChange={onChange} showForeignYears />
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Do you have a valid job offer from a Canadian employer?
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">A qualifying arranged employment offer may add 50 or 200 CRS points, but many job offers do not qualify.</span>
          </Label>
          {[
            { value: 'yes', label: 'Yes', desc: 'I have a written job offer from a Canadian employer' },
            { value: 'no', label: 'No', desc: 'I do not have a job offer yet' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.hasJobOffer === opt.value} onClick={() => onChange({ hasJobOffer: opt.value })} />
          ))}
        </div>
      </div>
    </div>
  )
}
