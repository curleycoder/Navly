'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { cn } from '@/lib/utils'
import {
  loadProfile,
  saveProfile,
  statusLabels,
  goalLabels,
  timelineLabels,
  educationLabels,
  EMPTY_PROFILE,
  type IntakeData,
} from '@/lib/profile'
import { TOP_COUNTRIES, ALL_COUNTRIES, CA_PROVINCES } from '@/lib/geo'

// ─── Step sequence logic ──────────────────────────────────────────────────────

type StepId =
  | 'status'
  | 'location'
  | 'goal'
  | 'timeline'
  | 'personal'
  | 'language'
  | 'education'
  | 'work'
  | 'province'

function getSteps(data: IntakeData): StepId[] {
  const base: StepId[] = ['status', 'location', 'goal', 'timeline']
  if (data.goal === 'pr') {
    return [...base, 'personal', 'language', 'education', 'work', 'province']
  }
  return base
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent appearance-none cursor-pointer'

function OptionCard({
  label,
  desc,
  selected,
  onClick,
}: {
  label: string
  desc: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border-2 p-4 text-left transition-all',
        selected
          ? 'border-[#D62828] bg-[#D62828]/5'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={cn('font-semibold text-[#0B1F3A]', selected && 'text-[#D62828]')}>{label}</p>
          {desc && <p className="mt-0.5 text-sm text-slate-500">{desc}</p>}
        </div>
        <div
          className={cn(
            'h-5 w-5 shrink-0 rounded-full border-2 transition-all',
            selected ? 'border-[#D62828] bg-[#D62828]' : 'border-slate-300'
          )}
        />
      </div>
    </button>
  )
}

const otherCountries = ALL_COUNTRIES.filter((c) => !TOP_COUNTRIES.includes(c))

function CountrySelect({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(selectClass, !value && 'text-slate-400')}
      >
        <option value="" disabled>{placeholder}</option>
        <optgroup label="Common source countries">
          {TOP_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </optgroup>
        <optgroup label="All countries">
          {otherCountries.map((c) => <option key={c} value={c}>{c}</option>)}
        </optgroup>
      </select>
      <ChevronDown />
    </div>
  )
}

function ChevronDown() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

// ─── Step: Status ─────────────────────────────────────────────────────────────

const statusOptions = [
  { value: 'outside-canada', label: 'Outside Canada', desc: 'Planning to come to Canada' },
  { value: 'student', label: 'International student', desc: 'Currently on a study permit in Canada' },
  { value: 'work-permit', label: 'Work permit holder', desc: 'Currently working in Canada' },
  { value: 'visitor', label: 'Visitor / tourist', desc: 'In Canada on a visitor visa or eTA' },
  { value: 'pr', label: 'Permanent resident', desc: 'Already have PR status' },
  { value: 'other', label: 'Other / not sure', desc: 'None of the above' },
]

function StepStatus({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Where are you right now?</h1>
      <p className="mt-2 text-slate-500">This determines which PR pathways are open to you.</p>
      <div className="mt-6 flex flex-col gap-3">
        {statusOptions.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={value === opt.value} onClick={() => onChange(opt.value)} />
        ))}
      </div>
    </div>
  )
}

// ─── Step: Location ───────────────────────────────────────────────────────────

function StepLocation({
  data,
  onChange,
}: {
  data: Pick<IntakeData, 'originCountry' | 'currentCountry' | 'province' | 'city'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const inCanada = data.currentCountry === 'Canada'
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Where are you from and where are you now?</h1>
      <p className="mt-2 text-slate-500">Province and city affect PR scoring and PNP eligibility.</p>
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="origin" className="text-sm font-semibold text-[#0B1F3A]">Country of origin</Label>
          <CountrySelect id="origin" value={data.originCountry} onChange={(v) => onChange({ originCountry: v })} placeholder="Select your country of origin…" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="current" className="text-sm font-semibold text-[#0B1F3A]">Country you are currently in</Label>
          <CountrySelect id="current" value={data.currentCountry} onChange={(v) => onChange({ currentCountry: v, province: '', city: '' })} placeholder="Select your current country…" />
        </div>
        {inCanada && (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="province" className="text-sm font-semibold text-[#0B1F3A]">
                Province / Territory
                <span className="ml-1.5 text-xs font-normal text-[#D62828]">Required for PR scoring</span>
              </Label>
              <div className="relative">
                <select
                  id="province"
                  value={data.province}
                  onChange={(e) => onChange({ province: e.target.value })}
                  className={cn(selectClass, !data.province && 'text-slate-400')}
                >
                  <option value="" disabled>Select province or territory…</option>
                  {CA_PROVINCES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="city" className="text-sm font-semibold text-[#0B1F3A]">
                City / Area
                <span className="ml-1.5 text-xs font-normal text-slate-400">Optional</span>
              </Label>
              <Input
                id="city"
                placeholder="e.g. Toronto, Vancouver, Calgary…"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Step: Goal ───────────────────────────────────────────────────────────────

const goalOptions = [
  { value: 'pr', label: 'Apply for permanent residence', desc: 'Express Entry, PNP, or other PR pathways' },
  { value: 'work-permit', label: 'Extend or change work permit', desc: 'PGWP, LMIA, or employer-specific permits' },
  { value: 'study-permit', label: 'Extend or change study permit', desc: 'Continue or change your studies' },
  { value: 'citizenship', label: 'Apply for citizenship', desc: 'Become a Canadian citizen' },
  { value: 'other', label: 'Other / not sure yet', desc: 'I want to explore my options' },
]

function StepGoal({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">What is your main immigration goal?</h1>
      <p className="mt-2 text-slate-500">
        If your goal is permanent residence, we will collect the information needed to estimate your eligibility and score.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        {goalOptions.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={value === opt.value} onClick={() => onChange(opt.value)} />
        ))}
      </div>
    </div>
  )
}

// ─── Step: Timeline ───────────────────────────────────────────────────────────

const timelineOptions = [
  { value: 'urgent', label: 'Urgent', desc: 'Within 3 months' },
  { value: 'soon', label: 'Soon', desc: '3–6 months from now' },
  { value: 'planning', label: 'Planning ahead', desc: '6+ months away' },
  { value: 'unsure', label: 'Not sure', desc: "I haven't decided yet" },
]

function StepTimeline({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">When do you need help by?</h1>
      <p className="mt-2 text-slate-500">This helps prioritize what to focus on first.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {timelineOptions.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={value === opt.value} onClick={() => onChange(opt.value)} />
        ))}
      </div>
    </div>
  )
}

// ─── Step: Personal ───────────────────────────────────────────────────────────

const maritalOptions = [
  { value: 'single', label: 'Single', desc: 'Never married / no common-law partner' },
  { value: 'married', label: 'Married', desc: 'Legally married' },
  { value: 'common-law', label: 'Common-law', desc: 'Living with partner 12+ months' },
]

function StepPersonal({
  data,
  onChange,
}: {
  data: Pick<IntakeData, 'age' | 'maritalStatus' | 'spouseComing'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const hasPartner = data.maritalStatus === 'married' || data.maritalStatus === 'common-law'
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Personal details</h1>
      <p className="mt-2 text-slate-500">Age and marital status directly affect your CRS score.</p>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Label htmlFor="age" className="text-sm font-semibold text-[#0B1F3A]">Your age</Label>
          <Input
            id="age"
            type="number"
            min={18}
            max={80}
            placeholder="e.g. 29"
            value={data.age}
            onChange={(e) => onChange({ age: e.target.value })}
            className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828] max-w-xs"
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">Marital status</Label>
          {maritalOptions.map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.maritalStatus === opt.value} onClick={() => onChange({ maritalStatus: opt.value, spouseComing: '' })} />
          ))}
        </div>
        {hasPartner && (
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-[#0B1F3A]">
              Will your spouse / partner come to Canada with you?
              <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">This affects how your CRS is calculated.</span>
            </Label>
            {[{ value: 'yes', label: 'Yes', desc: 'They will accompany me and be included in the application' }, { value: 'no', label: 'No', desc: 'I will apply without including them' }].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.spouseComing === opt.value} onClick={() => onChange({ spouseComing: opt.value })} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Step: Language ───────────────────────────────────────────────────────────

const langTestOptions = [
  { value: 'ielts-general', label: 'IELTS General Training', desc: 'Scores from 0.0 to 9.0' },
  { value: 'celpip', label: 'CELPIP-General', desc: 'Scores from 1 to 12' },
  { value: 'pte', label: 'PTE Core', desc: 'Scores from 10 to 90' },
]

const langConfig: Record<string, { min: number; max: number; step: number; placeholder: string }> = {
  'ielts-general': { min: 0, max: 9, step: 0.5, placeholder: 'e.g. 7.0' },
  celpip: { min: 1, max: 12, step: 1, placeholder: 'e.g. 9' },
  pte: { min: 10, max: 90, step: 1, placeholder: 'e.g. 65' },
}

function StepLanguage({
  data,
  onChange,
}: {
  data: Pick<IntakeData, 'langTestType' | 'langReading' | 'langWriting' | 'langListening' | 'langSpeaking'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const cfg = data.langTestType ? langConfig[data.langTestType] : null

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Language test results</h1>
      <p className="mt-2 text-slate-500">
        Language is the highest-value CRS factor. Use your most recent test (must be less than 2 years old).
        Only IELTS General Training, CELPIP-General, or PTE Core are accepted for PR.
      </p>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">Which test did you take?</Label>
          {langTestOptions.map((opt) => (
            <OptionCard
              key={opt.value}
              label={opt.label}
              desc={opt.desc}
              selected={data.langTestType === opt.value}
              onClick={() => onChange({ langTestType: opt.value, langReading: '', langWriting: '', langListening: '', langSpeaking: '' })}
            />
          ))}
        </div>

        {cfg && (
          <div>
            <Label className="mb-3 block text-sm font-semibold text-[#0B1F3A]">Enter your scores</Label>
            <div className="grid grid-cols-2 gap-4">
              {(['Reading', 'Writing', 'Listening', 'Speaking'] as const).map((skill) => {
                const key = `lang${skill}` as keyof Pick<IntakeData, 'langReading' | 'langWriting' | 'langListening' | 'langSpeaking'>
                return (
                  <div key={skill} className="flex flex-col gap-1.5">
                    <Label htmlFor={key} className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{skill}</Label>
                    <Input
                      id={key}
                      type="number"
                      min={cfg.min}
                      max={cfg.max}
                      step={cfg.step}
                      placeholder={cfg.placeholder}
                      value={data[key]}
                      onChange={(e) => onChange({ [key]: e.target.value })}
                      className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Step: Education ──────────────────────────────────────────────────────────

const educationOptions = [
  { value: 'less-than-secondary', label: 'Less than high school', desc: 'No secondary school diploma' },
  { value: 'secondary', label: 'High school diploma', desc: 'Secondary school graduation certificate' },
  { value: '1-year', label: '1-year post-secondary', desc: 'Certificate or diploma, 1 year' },
  { value: '2-year', label: '2-year post-secondary', desc: 'Diploma or associate degree, 2 years' },
  { value: 'bachelors', label: "Bachelor's degree", desc: '3+ year university degree' },
  { value: 'two-credentials', label: 'Two credentials (one 3+ years)', desc: 'Two post-secondary certificates, one being 3+ years' },
  { value: 'masters', label: "Master's degree", desc: 'Graduate-level university degree' },
  { value: 'doctoral', label: 'Doctoral degree (PhD)', desc: 'Doctoral-level university degree' },
]

function StepEducation({
  data,
  onChange,
}: {
  data: Pick<IntakeData, 'educationLevel' | 'canadianEducation' | 'ecaCompleted'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const isForeign = data.educationLevel && !['less-than-secondary','secondary'].includes(data.educationLevel)

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Education</h1>
      <p className="mt-2 text-slate-500">Your highest completed credential. Foreign education needs an ECA (Educational Credential Assessment) for PR.</p>
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
              <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Adds bonus CRS points (15 or 30) and strengthens provincial eligibility.</span>
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

        {isForeign && (data.canadianEducation === 'none' || !data.canadianEducation) && (
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

// ─── Step: Work (path-branching) ──────────────────────────────────────────────

const teerOptions = [
  { value: '0', label: 'TEER 0', desc: 'Management occupations (e.g. CEO, director)' },
  { value: '1', label: 'TEER 1', desc: 'Require a university degree (e.g. software developer, nurse, accountant)' },
  { value: '2', label: 'TEER 2', desc: 'Require a 2-year college diploma or apprenticeship (e.g. electrician, chef)' },
  { value: '3', label: 'TEER 3', desc: 'Require a 1-year college diploma (e.g. dental assistant, dispatcher)' },
  { value: '4', label: 'TEER 4', desc: 'Require high school diploma (e.g. cashier, driver)' },
  { value: '5', label: 'TEER 5', desc: 'No formal education required (e.g. labourer)' },
]

const workPermitOptions = [
  { value: 'pgwp', label: 'Post-Graduation Work Permit (PGWP)', desc: 'After graduating from a Canadian school' },
  { value: 'lmia', label: 'LMIA-backed work permit', desc: 'Employer obtained a Labour Market Impact Assessment' },
  { value: 'lmia-exempt', label: 'LMIA-exempt work permit', desc: 'e.g. ICT, IEC, CUSMA, spousal' },
  { value: 'open', label: 'Open work permit', desc: 'Not tied to a specific employer' },
  { value: 'spousal', label: 'Spousal open work permit', desc: 'Based on your partner\'s status' },
  { value: 'other', label: 'Other / not sure', desc: '' },
]

const programLevelOptions = [
  { value: 'college-diploma', label: 'College diploma / certificate', desc: '2–3 year program at a college' },
  { value: 'bachelor', label: "Bachelor's degree", desc: '3–4 year university program' },
  { value: 'master', label: "Master's degree", desc: 'Graduate-level program' },
  { value: 'doctoral', label: 'PhD / Doctoral', desc: 'Research or professional doctoral program' },
  { value: 'other', label: 'Other', desc: 'Language school, certificate, or short program' },
]

function StepWork({
  status,
  data,
  onChange,
}: {
  status: string
  data: IntakeData
  onChange: (fields: Partial<IntakeData>) => void
}) {
  if (status === 'student') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">Your study program</h1>
        <p className="mt-2 text-slate-500">
          This determines your PGWP eligibility and how long until you can apply for PR through Canadian Experience Class.
        </p>
        <div className="mt-8 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-[#0B1F3A]">Program level</Label>
            {programLevelOptions.map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.programLevel === opt.value} onClick={() => onChange({ programLevel: opt.value })} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="progLen" className="text-sm font-semibold text-[#0B1F3A]">Program length (months)</Label>
              <Input
                id="progLen"
                type="number"
                min={1}
                max={72}
                placeholder="e.g. 24"
                value={data.programLengthMonths}
                onChange={(e) => onChange({ programLengthMonths: e.target.value })}
                className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="gradDate" className="text-sm font-semibold text-[#0B1F3A]">Expected graduation</Label>
              <Input
                id="gradDate"
                type="month"
                value={data.graduationDate}
                onChange={(e) => onChange({ graduationDate: e.target.value })}
                className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="canWork" className="text-sm font-semibold text-[#0B1F3A]">
              Canadian skilled work experience so far (months)
              <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Any TEER 0–3 jobs, co-ops, or post-graduation work. Enter 0 if none.</span>
            </Label>
            <Input
              id="canWork"
              type="number"
              min={0}
              max={120}
              placeholder="e.g. 6"
              value={data.canadianWorkMonths}
              onChange={(e) => onChange({ canadianWorkMonths: e.target.value })}
              className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828] max-w-xs"
            />
          </div>
          <OccupationFields data={data} onChange={onChange} showForeignYears={false} />
        </div>
      </div>
    )
  }

  if (status === 'work-permit') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">Your work experience in Canada</h1>
        <p className="mt-2 text-slate-500">Canadian skilled work experience is the most direct path to PR through the Canadian Experience Class.</p>
        <div className="mt-8 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-[#0B1F3A]">Work permit type</Label>
            {workPermitOptions.map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.workPermitType === opt.value} onClick={() => onChange({ workPermitType: opt.value })} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="canWorkMonths" className="text-sm font-semibold text-[#0B1F3A]">Months of skilled Canadian work</Label>
              <Input
                id="canWorkMonths"
                type="number"
                min={0}
                max={120}
                placeholder="e.g. 14"
                value={data.canadianWorkMonths}
                onChange={(e) => onChange({ canadianWorkMonths: e.target.value })}
                className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
              />
              <p className="text-xs text-slate-500">In TEER 0–3 occupations (30+ hrs/week)</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="permitExpiry" className="text-sm font-semibold text-[#0B1F3A]">Permit expiry</Label>
              <Input
                id="permitExpiry"
                type="month"
                value={data.permitExpiry}
                onChange={(e) => onChange({ permitExpiry: e.target.value })}
                className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
              />
            </div>
          </div>
          <OccupationFields data={data} onChange={onChange} showForeignYears />
        </div>
      </div>
    )
  }

  // Outside Canada, visitor, or other
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Work experience</h1>
      <p className="mt-2 text-slate-500">Foreign skilled work experience contributes to both your CRS score and FSW eligibility.</p>
      <div className="mt-8 flex flex-col gap-8">
        <OccupationFields data={data} onChange={onChange} showForeignYears />
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">
            Do you have a valid job offer in Canada?
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Adds 50 CRS points (TEER 1–3) or 200 points (TEER 0).</span>
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

function OccupationFields({
  data,
  onChange,
  showForeignYears,
}: {
  data: IntakeData
  onChange: (fields: Partial<IntakeData>) => void
  showForeignYears: boolean
}) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-semibold text-[#0B1F3A]">
          TEER level of your main occupation
          <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Based on Canada's National Occupational Classification (NOC). TEER 0–3 are considered skilled.</span>
        </Label>
        <div className="flex flex-col gap-2">
          {teerOptions.map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.teerLevel === opt.value} onClick={() => onChange({ teerLevel: opt.value })} />
          ))}
        </div>
      </div>
      {showForeignYears && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="foreignYears" className="text-sm font-semibold text-[#0B1F3A]">
            Years of skilled work experience outside Canada (last 10 years)
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">TEER 0–3 occupations only. Enter 0 if none.</span>
          </Label>
          <Input
            id="foreignYears"
            type="number"
            min={0}
            max={10}
            step={0.5}
            placeholder="e.g. 3"
            value={data.foreignWorkYears}
            onChange={(e) => onChange({ foreignWorkYears: e.target.value })}
            className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828] max-w-xs"
          />
        </div>
      )}
    </>
  )
}

// ─── Step: Province ───────────────────────────────────────────────────────────

function StepProvince({
  data,
  onChange,
}: {
  data: Pick<IntakeData, 'intendedProvince' | 'hasJobOffer'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Where do you want to live in Canada?</h1>
      <p className="mt-2 text-slate-500">Your target province determines PNP eligibility. Each province has its own streams and cutoffs.</p>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Label htmlFor="intProv" className="text-sm font-semibold text-[#0B1F3A]">Intended province / territory</Label>
          <div className="relative">
            <select
              id="intProv"
              value={data.intendedProvince}
              onChange={(e) => onChange({ intendedProvince: e.target.value })}
              className={cn(selectClass, !data.intendedProvince && 'text-slate-400')}
            >
              <option value="" disabled>Select a province or territory…</option>
              <option value="Any">No preference — open to any province</option>
              {CA_PROVINCES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">
            Do you have a valid job offer in Canada?
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Adds 50–200 CRS points and strengthens PNP streams.</span>
          </Label>
          {[
            { value: 'yes', label: 'Yes', desc: 'I have a written offer from a Canadian employer' },
            { value: 'no', label: 'No', desc: 'No job offer yet' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.hasJobOffer === opt.value} onClick={() => onChange({ hasJobOffer: opt.value })} />
          ))}
        </div>

        <div className="rounded-2xl border border-[#0B1F3A]/15 bg-[#0B1F3A]/5 p-4">
          <p className="text-sm font-semibold text-[#0B1F3A]">Note on Quebec</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Quebec has its own separate immigration system (PSTQ / Arrima). If you want to live in Quebec, your PR process is different from Express Entry. We flag this on your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Validation ───────────────────────────────────────────────────────────────

function canContinue(stepId: StepId, data: IntakeData): boolean {
  switch (stepId) {
    case 'status':
      return !!data.status
    case 'location': {
      const base = !!data.originCountry && !!data.currentCountry
      if (data.currentCountry === 'Canada') return base && !!data.province
      return base
    }
    case 'goal':
      return !!data.goal
    case 'timeline':
      return !!data.timeline
    case 'personal': {
      const age = parseInt(data.age)
      if (isNaN(age) || age < 18 || age > 99) return false
      if (!data.maritalStatus) return false
      if ((data.maritalStatus === 'married' || data.maritalStatus === 'common-law') && !data.spouseComing) return false
      return true
    }
    case 'language': {
      if (!data.langTestType) return false
      return !!(data.langReading && data.langWriting && data.langListening && data.langSpeaking)
    }
    case 'education':
      return !!data.educationLevel
    case 'work': {
      if (!data.teerLevel) return false
      if (data.status === 'student') return !!data.programLevel
      if (data.status === 'work-permit') return !!data.workPermitType
      // Outside / visitor: need job offer answer
      return !!data.hasJobOffer
    }
    case 'province':
      return !!data.intendedProvince && !!data.hasJobOffer
    default:
      return false
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function SummaryView({ data }: { data: IntakeData }) {
  const rows = [
    { label: 'Current status', value: statusLabels[data.status] ?? data.status },
    { label: 'Country of origin', value: data.originCountry },
    { label: 'Currently in', value: data.currentCountry },
    data.province ? { label: 'Province', value: CA_PROVINCES.find(p => p.value === data.province)?.label ?? data.province } : null,
    { label: 'Main goal', value: goalLabels[data.goal] ?? data.goal },
    { label: 'Timeline', value: timelineLabels[data.timeline] ?? data.timeline },
    data.age ? { label: 'Age', value: data.age } : null,
    data.maritalStatus ? { label: 'Marital status', value: { single: 'Single', married: 'Married', 'common-law': 'Common-law' }[data.maritalStatus] ?? data.maritalStatus } : null,
    data.langTestType && data.langTestType !== 'none' ? {
      label: 'Language test',
      value: `${({ 'ielts-general': 'IELTS General', celpip: 'CELPIP', pte: 'PTE Core' } as Record<string,string>)[data.langTestType]} — R:${data.langReading} W:${data.langWriting} L:${data.langListening} S:${data.langSpeaking}`,
    } : null,
    data.educationLevel ? { label: 'Education', value: educationLabels[data.educationLevel] ?? data.educationLevel } : null,
    data.intendedProvince ? { label: 'Intended province', value: data.intendedProvince === 'Any' ? 'No preference' : CA_PROVINCES.find(p => p.value === data.intendedProvince)?.label ?? data.intendedProvince } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <NavlyLogo size="sm" />
        </div>
      </header>
      <div className="flex flex-1 items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <div className="mb-2 flex items-center gap-2 text-[#D62828]">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Profile saved</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0B1F3A]">Your immigration profile is ready</h1>
          <p className="mt-2 text-slate-500">Review your answers. You can update these anytime from your dashboard.</p>

          <div className="mt-8 flex flex-col gap-3">
            {rows.map((row) => (
              <div key={row.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">{row.label}</p>
                <p className="mt-1 font-semibold text-[#0B1F3A]">{row.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[#0B1F3A]/15 bg-[#0B1F3A]/5 p-4">
            <p className="text-sm font-semibold text-[#0B1F3A]">Reminder</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Navly provides an estimate based on the information you entered. It does not replace a licensed immigration consultant or lawyer.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className={buttonVariants({ className: 'flex-1 bg-[#D62828] text-white hover:bg-[#B91C1C] gap-2' })}>
              View my score and dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className={buttonVariants({ variant: 'outline', className: 'border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white' })}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step titles ──────────────────────────────────────────────────────────────

const stepTitles: Record<StepId, string> = {
  status: 'Your situation',
  location: 'Location',
  goal: 'Your goal',
  timeline: 'Timeline',
  personal: 'Personal details',
  language: 'Language',
  education: 'Education',
  work: 'Work experience',
  province: 'Province',
}

// ─── Main flow ────────────────────────────────────────────────────────────────

export function IntakeFlow() {
  const [data, setData] = useState<IntakeData>({ ...EMPTY_PROFILE })
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const saved = loadProfile()
    if (saved) setData(saved)
  }, [])

  const steps = getSteps(data)
  const currentStep = steps[stepIndex]
  const progress = ((stepIndex + 1) / steps.length) * 100

  function update(fields: Partial<IntakeData>) {
    setData((d) => ({ ...d, ...fields }))
  }

  function next() {
    // Recalculate steps after update in case goal changed
    const currentSteps = getSteps(data)
    if (stepIndex < currentSteps.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      saveProfile(data)
      setDone(true)
    }
  }

  function back() {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  if (done) return <SummaryView data={data} />

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <NavlyLogo size="sm" />
          <div className="text-right">
            <span className="text-sm text-slate-500">
              {stepIndex + 1} / {steps.length}
            </span>
            <p className="text-xs text-slate-400">{stepTitles[currentStep]}</p>
          </div>
        </div>
      </header>

      <div className="bg-white px-6 pb-2">
        <div className="mx-auto max-w-2xl">
          <Progress value={progress} className="h-1.5 bg-slate-100" />
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {currentStep === 'status' && (
            <StepStatus value={data.status} onChange={(v) => update({ status: v })} />
          )}
          {currentStep === 'location' && (
            <StepLocation data={data} onChange={update} />
          )}
          {currentStep === 'goal' && (
            <StepGoal value={data.goal} onChange={(v) => update({ goal: v })} />
          )}
          {currentStep === 'timeline' && (
            <StepTimeline value={data.timeline} onChange={(v) => update({ timeline: v })} />
          )}
          {currentStep === 'personal' && (
            <StepPersonal data={data} onChange={update} />
          )}
          {currentStep === 'language' && (
            <StepLanguage data={data} onChange={update} />
          )}
          {currentStep === 'education' && (
            <StepEducation data={data} onChange={update} />
          )}
          {currentStep === 'work' && (
            <StepWork status={data.status} data={data} onChange={update} />
          )}
          {currentStep === 'province' && (
            <StepProvince data={data} onChange={update} />
          )}

          <div className="mt-10 flex items-center justify-between">
            {stepIndex > 0 ? (
              <Button variant="ghost" onClick={back} className="gap-2 text-slate-600">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <Link href="/" className="text-sm text-slate-500 hover:text-[#0B1F3A]">
                Back to home
              </Link>
            )}
            <Button
              onClick={next}
              disabled={!canContinue(currentStep, data)}
              className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
            >
              {stepIndex === steps.length - 1 ? 'Save profile' : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
