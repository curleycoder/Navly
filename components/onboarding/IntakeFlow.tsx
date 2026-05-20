'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { NavlyLogo } from '@/components/ui/NavlyLogo'
import { cn } from '@/lib/utils'
import {
  loadProfile,
  saveProfile,
  saveProfileToSupabase,
  goalLabels,
  educationLabels,
  plannedEntryLabels,
  EMPTY_PROFILE,
  type IntakeData,
} from '@/lib/profile'
import { TOP_COUNTRIES, ALL_COUNTRIES, CA_PROVINCES } from '@/lib/geo'

// ─── Step sequence ─────────────────────────────────────────────────────────────

type StepId =
  | 'location-split'
  | 'planned-entry'
  | 'inside-status'
  | 'goal'
  | 'personal'
  | 'canada-dates'
  | 'spouse-language'
  | 'language'
  | 'education'
  | 'work'
  | 'settlement'
  | 'province'
  | 'risk'
  | 'signup'

function getSteps(data: IntakeData): StepId[] {
  const steps: StepId[] = ['location-split']
  if (!data.locationStatus) return steps

  if (data.locationStatus === 'outside') steps.push('planned-entry')
  else steps.push('inside-status')

  steps.push('goal', 'personal')

  if (data.locationStatus === 'inside') steps.push('canada-dates')

  const hasSpouse = (data.maritalStatus === 'married' || data.maritalStatus === 'common-law') && data.spouseComing === 'yes'
  if (hasSpouse) steps.push('spouse-language')

  steps.push('language', 'education', 'work', 'settlement', 'province', 'risk', 'signup')
  return steps
}

const stepTitles: Record<StepId, string> = {
  'location-split': 'Your location',
  'planned-entry': 'Your plan',
  'inside-status': 'Your status',
  goal: 'Your goal',
  personal: 'Personal details',
  'canada-dates': 'Canada dates',
  'spouse-language': 'Spouse details',
  language: 'Language',
  education: 'Education',
  work: 'Work experience',
  settlement: 'Settlement funds',
  province: 'Province',
  risk: 'Immigration history',
  signup: 'Create account',
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent appearance-none cursor-pointer'

function OptionCard({ label, desc, selected, onClick, comingSoon }: {
  label: string; desc?: string; selected: boolean; onClick: () => void; comingSoon?: boolean
}) {
  if (comingSoon) {
    return (
      <div className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 opacity-60 cursor-not-allowed">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-400">{label}</p>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">Coming soon</span>
            </div>
            {desc && <p className="mt-0.5 text-sm text-slate-400">{desc}</p>}
          </div>
        </div>
      </div>
    )
  }
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828] focus-visible:ring-offset-1',
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
          aria-hidden="true"
          className={cn(
            'ml-3 h-5 w-5 shrink-0 rounded-full border-2 transition-all',
            selected ? 'border-[#D62828] bg-[#D62828]' : 'border-slate-300'
          )}
        />
      </div>
    </button>
  )
}

function ChevronDownIcon() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

const otherCountries = ALL_COUNTRIES.filter((c) => !TOP_COUNTRIES.includes(c))

function CountrySelect({ id, value, onChange, placeholder }: {
  id: string; value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(selectClass, !value && 'text-slate-400')}>
        <option value="" disabled>{placeholder}</option>
        <optgroup label="Common source countries">
          {TOP_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </optgroup>
        <optgroup label="All countries">
          {otherCountries.map((c) => <option key={c} value={c}>{c}</option>)}
        </optgroup>
      </select>
      <ChevronDownIcon />
    </div>
  )
}

// ─── Step: Location Split ──────────────────────────────────────────────────────

function StepLocationSplit({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Are you currently in Canada?</h1>
      <p className="mt-2 text-slate-500">This determines which pathways apply to you right now.</p>
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

// ─── Step: Planned Entry (outside Canada) ──────────────────────────────────────

const plannedEntryOptions = [
  { value: 'study-permit', label: 'Study permit', desc: 'Come to Canada to study, then explore PR through PGWP and CEC' },
  { value: 'work-permit', label: 'Work permit', desc: 'Come through a job offer, LMIA, or employer-specific permit' },
  { value: 'express-entry', label: 'Express Entry (direct PR)', desc: 'Apply for PR directly from outside — Federal Skilled Worker or FST' },
  { value: 'unsure', label: 'Not sure yet', desc: 'I want to compare all options' },
  { value: 'family', label: 'Family sponsorship', desc: 'Be sponsored by a Canadian citizen or permanent resident', comingSoon: true },
  { value: 'visitor', label: 'Visitor visa first', desc: 'Visit Canada, then explore options from inside', comingSoon: true },
  { value: 'business', label: 'Business / investment', desc: 'Provincial entrepreneur or investor programs', comingSoon: true },
]

function StepPlannedEntry({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">How are you planning to come to Canada?</h1>
      <p className="mt-2 text-slate-500">
        Your planned entry route shapes the entire pathway to permanent residence. Each route has different requirements and timelines.
      </p>
      <div role="radiogroup" aria-label="Planned entry route" className="mt-6 flex flex-col gap-3">
        {plannedEntryOptions.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={value === opt.value} onClick={() => onChange(opt.value)} comingSoon={opt.comingSoon} />
        ))}
      </div>
    </div>
  )
}

// ─── Step: Inside Status ───────────────────────────────────────────────────────

const insideStatusOptions = [
  { value: 'student', label: 'International student', desc: 'Currently on a study permit' },
  { value: 'work-permit', label: 'Worker', desc: 'On a work permit, PGWP, or employer-specific permit' },
  { value: 'pr', label: 'Permanent resident', desc: 'Already have PR status' },
  { value: 'visitor', label: 'Visitor', desc: 'On a visitor visa, eTA, or temporary resident permit', comingSoon: true },
  { value: 'family-member', label: 'Spouse or family of Canadian / PR', desc: 'In Canada through family sponsorship or family permit', comingSoon: true },
  { value: 'refugee', label: 'Refugee / protected person', desc: 'Under refugee protection or asylum claim', comingSoon: true },
  { value: 'out-of-status', label: 'Out of status', desc: 'Permit has expired or was not maintained', comingSoon: true },
]

function StepInsideStatus({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">What is your current status in Canada?</h1>
      <p className="mt-2 text-slate-500">Your current status determines which PR pathways are open to you and what questions we ask next.</p>
      <div role="radiogroup" aria-label="Current status in Canada" className="mt-6 flex flex-col gap-3">
        {insideStatusOptions.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={value === opt.value} onClick={() => onChange(opt.value)} comingSoon={opt.comingSoon} />
        ))}
      </div>
    </div>
  )
}

// ─── Step: Goal ────────────────────────────────────────────────────────────────

const goalOptionsByStatus: Record<string, { value: string; label: string; desc: string }[]> = {
  outside: [
    { value: 'pr', label: 'Become a permanent resident', desc: 'Express Entry, Federal Skilled Worker, or PNP from outside Canada' },
    { value: 'study-permit', label: 'Study in Canada first', desc: 'Get a study permit, then explore PR through PGWP and CEC' },
    { value: 'work-permit', label: 'Work in Canada first', desc: 'Get a job offer or work permit, then build toward PR' },
    { value: 'family', label: 'Join family in Canada', desc: 'Be sponsored by a Canadian citizen or permanent resident' },
    { value: 'compare', label: 'Compare my options', desc: 'I want to understand all pathways before deciding' },
  ],
  student: [
    { value: 'pr', label: 'Become a permanent resident', desc: 'Use PGWP and Canadian Experience Class after graduation' },
    { value: 'finish-degree', label: 'Finish my degree and stay in Canada', desc: 'Complete my studies, then get a PGWP and plan next steps' },
    { value: 'work-permit', label: 'Get a post-graduation work permit', desc: 'Work in Canada after graduating to build CEC eligibility' },
    { value: 'family', label: 'Sponsor or join family in Canada', desc: 'Bring a spouse or reunite with family' },
    { value: 'compare', label: 'Compare my options', desc: 'I want to understand all pathways available to me' },
  ],
  'work-permit': [
    { value: 'pr', label: 'Become a permanent resident', desc: 'Canadian Experience Class, PNP, or Express Entry' },
    { value: 'extend-permit', label: 'Extend or change my work permit', desc: 'Stay in Canada longer while I plan next steps' },
    { value: 'family', label: 'Sponsor or join family in Canada', desc: 'Bring a spouse or reunite with family' },
    { value: 'compare', label: 'Compare my options', desc: 'I want to understand all pathways available to me' },
  ],
  pr: [
    { value: 'citizenship', label: 'Apply for Canadian citizenship', desc: 'Meet the physical presence requirement and apply for citizenship' },
    { value: 'family', label: 'Sponsor a family member', desc: 'Sponsor a spouse, child, or parent to become a PR' },
    { value: 'compare', label: 'Understand my options as a PR', desc: 'Learn about citizenship timelines, travel documents, and rights' },
  ],
  visitor: [
    { value: 'pr', label: 'Become a permanent resident', desc: 'Explore Express Entry or PNP pathways from inside Canada' },
    { value: 'work-permit', label: 'Transition to a work permit', desc: 'Get a job offer or employer-specific permit while in Canada' },
    { value: 'study-permit', label: 'Transition to a study permit', desc: 'Enroll in a program and get a study permit' },
    { value: 'family', label: 'Join family in Canada', desc: 'Be sponsored by a Canadian citizen or permanent resident' },
    { value: 'compare', label: 'Compare my options', desc: 'I want to understand all realistic pathways from visitor status' },
  ],
}

function getGoalOptions(locationStatus: string, status: string) {
  if (locationStatus === 'outside') return goalOptionsByStatus.outside
  if (status === 'student') return goalOptionsByStatus.student
  if (status === 'work-permit') return goalOptionsByStatus['work-permit']
  if (status === 'pr') return goalOptionsByStatus.pr
  if (status === 'visitor') return goalOptionsByStatus.visitor
  return goalOptionsByStatus.outside
}

function StepGoal({ data, onChange }: {
  data: Pick<IntakeData, 'goal' | 'status' | 'locationStatus'>
  onChange: (v: string) => void
}) {
  const options = getGoalOptions(data.locationStatus, data.status)

  const isVisitorGoingForPR = data.locationStatus === 'inside' && data.status === 'visitor' && data.goal === 'pr'

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">What is your main goal?</h1>
      <p className="mt-2 text-slate-500">This helps us show the most relevant pathways and requirements for your situation.</p>

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
        {options.map((opt) => (
          <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.goal === opt.value} onClick={() => onChange(opt.value)} />
        ))}
      </div>
    </div>
  )
}

// ─── Step: Personal ────────────────────────────────────────────────────────────

const maritalOptions = [
  { value: 'single', label: 'Single', desc: 'Never married / no common-law partner' },
  { value: 'married', label: 'Married', desc: 'Legally married' },
  { value: 'common-law', label: 'Common-law', desc: 'Living with partner 12+ months' },
]

function StepPersonal({ data, onChange }: {
  data: Pick<IntakeData, 'firstName' | 'lastName' | 'gender' | 'age' | 'originCountry' | 'currentCountry' | 'maritalStatus' | 'spouseComing' | 'canadianSibling' | 'locationStatus'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const hasPartner = data.maritalStatus === 'married' || data.maritalStatus === 'common-law'
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Personal details</h1>
      <p className="mt-2 text-slate-500">Age, marital status, and family ties directly affect your CRS score and pathway options.</p>
      <div className="mt-8 flex flex-col gap-8">

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName" className="text-sm font-semibold text-[#0B1F3A]">First name</Label>
            <Input id="firstName" placeholder="e.g. Amara" value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName" className="text-sm font-semibold text-[#0B1F3A]">Last name</Label>
            <Input id="lastName" placeholder="e.g. Osei" value={data.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="age" className="text-sm font-semibold text-[#0B1F3A]">Your age</Label>
          <Input id="age" type="number" min={18} max={80} placeholder="e.g. 29" value={data.age}
            onChange={(e) => onChange({ age: e.target.value })}
            className="max-w-xs rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gender" className="text-sm font-semibold text-[#0B1F3A]">
            Gender
            <span className="ml-1.5 text-xs font-normal text-slate-400">Optional</span>
          </Label>
          <div className="relative max-w-xs">
            <select id="gender" value={data.gender}
              onChange={(e) => onChange({ gender: e.target.value })}
              className={cn(selectClass, !data.gender && 'text-slate-400')}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
            <ChevronDownIcon />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="origin" className="text-sm font-semibold text-[#0B1F3A]">Country of citizenship</Label>
          <CountrySelect id="origin" value={data.originCountry} onChange={(v) => onChange({ originCountry: v })} placeholder="Select your country of citizenship…" />
        </div>

        {data.locationStatus === 'outside' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentCountry" className="text-sm font-semibold text-[#0B1F3A]">
              Country you are currently in
              <span className="ml-1.5 text-xs font-normal text-slate-400">Optional</span>
            </Label>
            <CountrySelect id="currentCountry" value={data.currentCountry} onChange={(v) => onChange({ currentCountry: v })} placeholder="Select your current country…" />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">Marital status</Label>
          {maritalOptions.map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
              selected={data.maritalStatus === opt.value}
              onClick={() => onChange({ maritalStatus: opt.value, spouseComing: '' })} />
          ))}
        </div>

        {hasPartner && (
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-[#0B1F3A]">
              Will your spouse / partner come to Canada with you?
              <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Adds up to 40 bonus CRS points based on their language, education, and Canadian work experience.</span>
            </Label>
            {[
              { value: 'yes', label: 'Yes', desc: 'They will accompany me' },
              { value: 'no', label: 'No', desc: 'Applying without them' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.spouseComing === opt.value} onClick={() => onChange({ spouseComing: opt.value })} />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">
            Do you have a brother or sister who is a Canadian citizen or permanent resident?
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Adds 15 CRS adaptability points.</span>
          </Label>
          {[
            { value: 'yes', label: 'Yes', desc: 'I have a sibling who is a Canadian citizen or PR' },
            { value: 'no', label: 'No', desc: 'No Canadian sibling' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.canadianSibling === opt.value} onClick={() => onChange({ canadianSibling: opt.value })} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step: Canada Dates (inside Canada only) ───────────────────────────────────

function StepCanadaDates({ data, onChange }: {
  data: Pick<IntakeData, 'province' | 'arrivalDate' | 'visaExpiryDate'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Your time in Canada</h1>
      <p className="mt-2 text-slate-500">
        Your arrival date is used to calculate your exact days in Canada for PR and citizenship planning. Your permit expiry is used to send you renewal reminders.
      </p>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Label htmlFor="province" className="text-sm font-semibold text-[#0B1F3A]">
            Province / Territory you are in
            <span className="ml-1.5 text-xs font-normal text-[#D62828]">Required for PNP scoring</span>
          </Label>
          <div className="relative">
            <select id="province" value={data.province} onChange={(e) => onChange({ province: e.target.value })}
              className={cn(selectClass, !data.province && 'text-slate-400')}>
              <option value="" disabled>Select province or territory…</option>
              {CA_PROVINCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
            <ChevronDownIcon />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="arrivalDate" className="text-sm font-semibold text-[#0B1F3A]">
            Date you arrived in Canada
          </Label>
          <Input id="arrivalDate" type="date" max={today} value={data.arrivalDate}
            onChange={(e) => onChange({ arrivalDate: e.target.value })}
            className="max-w-xs rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] focus-visible:ring-[#D62828]" />
          <p className="text-xs text-slate-400">Your days in Canada are calculated from this date. Every trip abroad is subtracted automatically.</p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="visaExpiry" className="text-sm font-semibold text-[#0B1F3A]">
            Visa / permit expiry date
            <span className="ml-1.5 text-xs font-normal text-slate-400">Optional — we will remind you before it expires</span>
          </Label>
          <Input id="visaExpiry" type="date" min={today} value={data.visaExpiryDate}
            onChange={(e) => onChange({ visaExpiryDate: e.target.value })}
            className="max-w-xs rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] focus-visible:ring-[#D62828]" />
          <p className="text-xs text-slate-400">Applies to study permits, work permits, visitor visas, and TRPs. You will get a task reminder at 90 days and 30 days before expiry.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Step: Spouse Language ─────────────────────────────────────────────────────

const langTestOptions = [
  { value: 'ielts-general', label: 'IELTS General Training', desc: 'Scores 0.0–9.0' },
  { value: 'celpip', label: 'CELPIP-General', desc: 'Scores 1–12' },
  { value: 'pte', label: 'PTE Core', desc: 'Scores 10–90' },
  { value: 'tef', label: 'TEF Canada (French)', desc: 'CO / EO / CE / EE scores' },
  { value: 'tcf', label: 'TCF Canada (French)', desc: 'Scores 0–699 / 0–20' },
]

const langConfig: Record<string, { min: number; max: number; step: number }> = {
  'ielts-general': { min: 0, max: 9, step: 0.5 },
  celpip: { min: 1, max: 12, step: 1 },
  pte: { min: 10, max: 90, step: 1 },
  tef: { min: 0, max: 450, step: 1 },
  tcf: { min: 0, max: 699, step: 1 },
}

const tefLabels = { r: 'CE — Reading (0–248)', w: 'EE — Writing (0–450)', l: 'CO — Listening (0–360)', s: 'EO — Speaking (0–450)' }
const tcfLabels = { r: 'CE — Reading (0–699)', w: 'EE — Writing (0–20)', l: 'CO — Listening (0–699)', s: 'EO — Speaking (0–20)' }
const frenchMax = { tef: { r: 248, w: 450, l: 360, s: 450 }, tcf: { r: 699, w: 20, l: 699, s: 20 } }

function LanguageScoreFields({ testType, values, onChange }: {
  testType: string
  values: { r: string; w: string; l: string; s: string }
  onChange: (key: string, val: string) => void
}) {
  const cfg = testType ? langConfig[testType] : null
  if (!cfg) return null
  const isFrench = testType === 'tef' || testType === 'tcf'
  const labels = isFrench ? (testType === 'tef' ? tefLabels : tcfLabels) : { r: 'Reading', w: 'Writing', l: 'Listening', s: 'Speaking' }

  return (
    <div>
      <Label className="mb-3 block text-sm font-semibold text-[#0B1F3A]">Enter your scores</Label>
      <div className="grid grid-cols-2 gap-4">
        {(['r', 'w', 'l', 's'] as const).map((skill) => {
          const maxVal = isFrench ? frenchMax[testType as 'tef' | 'tcf'][skill] : cfg.max
          return (
            <div key={skill} className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{labels[skill]}</Label>
              <Input
                type="number" min={0} max={maxVal} step={isFrench ? 1 : cfg.step}
                placeholder={`e.g. ${Math.floor(maxVal * 0.75)}`}
                value={values[skill]}
                onChange={(e) => onChange(skill, e.target.value)}
                className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

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

function StepSpouseLanguage({ data, onChange }: {
  data: Pick<IntakeData, 'spouseLangTestType' | 'spouseLangReading' | 'spouseLangWriting' | 'spouseLangListening' | 'spouseLangSpeaking' | 'spouseEducationLevel' | 'spouseCanadianWorkMonths'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Your spouse / partner's details</h1>
      <p className="mt-2 text-slate-500">When your spouse accompanies you, their language, education, and Canadian experience add up to 40 bonus CRS points.</p>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">
            Spouse's language test
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Skip if no test taken — they will contribute 0 language points.</span>
          </Label>
          {langTestOptions.map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
              selected={data.spouseLangTestType === opt.value}
              onClick={() => onChange({ spouseLangTestType: opt.value, spouseLangReading: '', spouseLangWriting: '', spouseLangListening: '', spouseLangSpeaking: '' })}
            />
          ))}
          <OptionCard label="No test taken" desc="Spouse has not taken a language test" selected={data.spouseLangTestType === 'none'} onClick={() => onChange({ spouseLangTestType: 'none' })} />
        </div>

        {data.spouseLangTestType && data.spouseLangTestType !== 'none' && (
          <LanguageScoreFields
            testType={data.spouseLangTestType}
            values={{ r: data.spouseLangReading, w: data.spouseLangWriting, l: data.spouseLangListening, s: data.spouseLangSpeaking }}
            onChange={(k, v) => {
              const keyMap: Record<string, keyof IntakeData> = { r: 'spouseLangReading', w: 'spouseLangWriting', l: 'spouseLangListening', s: 'spouseLangSpeaking' }
              onChange({ [keyMap[k]]: v })
            }}
          />
        )}

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">Spouse's highest education</Label>
          {educationOptions.map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.spouseEducationLevel === opt.value} onClick={() => onChange({ spouseEducationLevel: opt.value })} />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="spouseCanWork" className="text-sm font-semibold text-[#0B1F3A]">
            Spouse's skilled Canadian work experience (months)
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">TEER 0–3 only. Enter 0 if none.</span>
          </Label>
          <Input id="spouseCanWork" type="number" min={0} max={120} placeholder="e.g. 0"
            value={data.spouseCanadianWorkMonths} onChange={(e) => onChange({ spouseCanadianWorkMonths: e.target.value })}
            className="max-w-xs rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
        </div>
      </div>
    </div>
  )
}

// ─── Step: Language ────────────────────────────────────────────────────────────

function StepLanguage({ data, onChange }: {
  data: Pick<IntakeData, 'langTestType' | 'langReading' | 'langWriting' | 'langListening' | 'langSpeaking'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Language test results</h1>
      <p className="mt-2 text-slate-500">
        Language is the highest-value CRS factor. English: IELTS General, CELPIP, PTE Core. French: TEF Canada, TCF Canada. Use your most recent result (must be less than 2 years old).
      </p>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">Which test did you take?</Label>
          {langTestOptions.map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.langTestType === opt.value}
              onClick={() => onChange({ langTestType: opt.value, langReading: '', langWriting: '', langListening: '', langSpeaking: '' })}
            />
          ))}
        </div>
        {data.langTestType && langConfig[data.langTestType] && (
          <LanguageScoreFields
            testType={data.langTestType}
            values={{ r: data.langReading, w: data.langWriting, l: data.langListening, s: data.langSpeaking }}
            onChange={(k, v) => {
              const keyMap: Record<string, keyof IntakeData> = { r: 'langReading', w: 'langWriting', l: 'langListening', s: 'langSpeaking' }
              onChange({ [keyMap[k]]: v })
            }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Step: Education ───────────────────────────────────────────────────────────

function StepEducation({ data, onChange }: {
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

// ─── Step: Work ────────────────────────────────────────────────────────────────

const teerOptions = [
  { value: '0', label: 'TEER 0', desc: 'Management (e.g. CEO, director)' },
  { value: '1', label: 'TEER 1', desc: 'Requires university degree (e.g. software developer, nurse, accountant)' },
  { value: '2', label: 'TEER 2', desc: 'Requires 2-year college diploma (e.g. electrician, chef)' },
  { value: '3', label: 'TEER 3', desc: 'Requires 1-year college diploma (e.g. dental assistant)' },
  { value: '4', label: 'TEER 4', desc: 'Requires high school diploma (e.g. cashier, driver)' },
  { value: '5', label: 'TEER 5', desc: 'No formal education required (e.g. labourer)' },
]

const workPermitOptions = [
  { value: 'pgwp', label: 'Post-Graduation Work Permit (PGWP)', desc: 'After graduating from a Canadian school' },
  { value: 'lmia', label: 'LMIA-backed work permit', desc: 'Employer obtained a Labour Market Impact Assessment' },
  { value: 'lmia-exempt', label: 'LMIA-exempt work permit', desc: 'e.g. ICT, IEC, CUSMA, spousal' },
  { value: 'open', label: 'Open work permit', desc: 'Not tied to a specific employer' },
  { value: 'spousal', label: 'Spousal open work permit', desc: "Based on your partner's status" },
  { value: 'other', label: 'Other / not sure', desc: '' },
]

const programLevelOptions = [
  { value: 'college-diploma', label: 'College diploma / certificate', desc: '2–3 year program' },
  { value: 'bachelor', label: "Bachelor's degree", desc: '3–4 year university program' },
  { value: 'master', label: "Master's degree", desc: 'Graduate-level program' },
  { value: 'doctoral', label: 'PhD / Doctoral', desc: 'Research or professional doctoral program' },
  { value: 'other', label: 'Other', desc: 'Language school, certificate, or short program' },
]

function OccupationFields({ data, onChange, showForeignYears }: {
  data: IntakeData; onChange: (fields: Partial<IntakeData>) => void; showForeignYears: boolean
}) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="noc" className="text-sm font-semibold text-[#0B1F3A]">
          NOC code (if known)
          <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">5-digit code from the National Occupational Classification. Improves PNP matching.</span>
        </Label>
        <Input id="noc" placeholder="e.g. 21231" value={data.noc} onChange={(e) => onChange({ noc: e.target.value })}
          className="max-w-xs rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
      </div>
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-semibold text-[#0B1F3A]">
          TEER level of your main occupation
          <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">TEER 0–3 are considered skilled occupations for Express Entry.</span>
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
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">TEER 0–3 only. Enter 0 if none.</span>
          </Label>
          <Input id="foreignYears" type="number" min={0} max={10} step={0.5} placeholder="e.g. 3"
            value={data.foreignWorkYears} onChange={(e) => onChange({ foreignWorkYears: e.target.value })}
            className="max-w-xs rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
        </div>
      )}
    </>
  )
}

function StepWork({ data, onChange }: { data: IntakeData; onChange: (fields: Partial<IntakeData>) => void }) {
  const isInside = data.locationStatus === 'inside'
  const status = data.status

  if (isInside && status === 'student') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">Your study program</h1>
        <p className="mt-2 text-slate-500">Determines your PGWP eligibility and timeline to PR through Canadian Experience Class.</p>
        <div className="mt-8 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-[#0B1F3A]">Program level</Label>
            {programLevelOptions.map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.programLevel === opt.value} onClick={() => onChange({ programLevel: opt.value })} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="progLen" className="text-sm font-semibold text-[#0B1F3A]">Program length (months)</Label>
              <Input id="progLen" type="number" min={1} max={72} placeholder="e.g. 24"
                value={data.programLengthMonths} onChange={(e) => onChange({ programLengthMonths: e.target.value })}
                className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="gradDate" className="text-sm font-semibold text-[#0B1F3A]">Expected graduation</Label>
              <Input id="gradDate" type="month" value={data.graduationDate} onChange={(e) => onChange({ graduationDate: e.target.value })}
                className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] focus-visible:ring-[#D62828]" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="canWork" className="text-sm font-semibold text-[#0B1F3A]">
              Canadian skilled work experience so far (months)
              <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">TEER 0–3 jobs or co-ops. Enter 0 if none.</span>
            </Label>
            <Input id="canWork" type="number" min={0} max={120} placeholder="e.g. 6"
              value={data.canadianWorkMonths} onChange={(e) => onChange({ canadianWorkMonths: e.target.value })}
              className="max-w-xs rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
          </div>
          <OccupationFields data={data} onChange={onChange} showForeignYears={false} />
        </div>
      </div>
    )
  }

  if (isInside && status === 'work-permit') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">Your work experience in Canada</h1>
        <p className="mt-2 text-slate-500">Canadian skilled work is the most direct path to PR through Canadian Experience Class.</p>
        <div className="mt-8 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-[#0B1F3A]">Work permit type</Label>
            {workPermitOptions.map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.workPermitType === opt.value} onClick={() => onChange({ workPermitType: opt.value })} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="canWorkMonths" className="text-sm font-semibold text-[#0B1F3A]">
              Months of skilled Canadian work experience
              <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">TEER 0–3 occupations, 30+ hrs/week. 12 months qualifies you for CEC.</span>
            </Label>
            <Input id="canWorkMonths" type="number" min={0} max={120} placeholder="e.g. 14"
              value={data.canadianWorkMonths} onChange={(e) => onChange({ canadianWorkMonths: e.target.value })}
              className="max-w-xs rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
          </div>
          <OccupationFields data={data} onChange={onChange} showForeignYears />
        </div>
      </div>
    )
  }

  // Default: outside Canada or visitor or other inside status
  const isOutside = data.locationStatus === 'outside'
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Work experience</h1>
      <p className="mt-2 text-slate-500">
        {isOutside
          ? 'Foreign skilled work experience is the main factor for Federal Skilled Worker (Express Entry) eligibility.'
          : 'Your work history helps determine which PR pathways may be available to you.'}
      </p>
      <div className="mt-8 flex flex-col gap-8">
        <OccupationFields data={data} onChange={onChange} showForeignYears />
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">
            Do you have a valid job offer from a Canadian employer?
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Adds 50–200 CRS points depending on TEER level.</span>
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

// ─── Step: Settlement ──────────────────────────────────────────────────────────

function StepSettlement({ data, onChange }: {
  data: Pick<IntakeData, 'familySize' | 'settlementFunds'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const familySize = parseInt(data.familySize) || 1
  const fundsRequired: Record<number, number> = { 1: 13757, 2: 17127, 3: 21055, 4: 25564, 5: 28994, 6: 32700, 7: 36407 }
  const required = fundsRequired[Math.min(familySize, 7)]
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Settlement funds</h1>
      <p className="mt-2 text-slate-500">
        Federal Skilled Worker requires proof of available funds. Canadian Experience Class and most PNP streams do not require this.
      </p>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Label htmlFor="familySize" className="text-sm font-semibold text-[#0B1F3A]">
            Family size (including yourself)
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Count yourself, spouse (if coming), and all dependent children.</span>
          </Label>
          <Input id="familySize" type="number" min={1} max={20} placeholder="e.g. 2"
            value={data.familySize} onChange={(e) => onChange({ familySize: e.target.value })}
            className="max-w-xs rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
          {data.familySize && (
            <p className="text-xs font-semibold text-[#D62828]">FSW minimum: ${required.toLocaleString()} CAD for a family of {familySize}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="settlementFunds" className="text-sm font-semibold text-[#0B1F3A]">
            Available settlement funds (CAD)
            <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">Combined savings and liquid assets you can access. Do not include property.</span>
          </Label>
          <Input id="settlementFunds" type="number" min={0} placeholder="e.g. 20000"
            value={data.settlementFunds} onChange={(e) => onChange({ settlementFunds: e.target.value })}
            className="max-w-sm rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]" />
          {data.settlementFunds && data.familySize && (
            <p className={cn('text-xs font-semibold', parseFloat(data.settlementFunds) >= required ? 'text-green-700' : 'text-[#D62828]')}>
              {parseFloat(data.settlementFunds) >= required
                ? `Meets the FSW minimum of $${required.toLocaleString()}`
                : `Below the FSW minimum — this blocks FSW but not CEC or PNP`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step: Province ────────────────────────────────────────────────────────────

function StepProvince({ data, onChange }: {
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
            <select id="intProv" value={data.intendedProvince} onChange={(e) => onChange({ intendedProvince: e.target.value })}
              className={cn(selectClass, !data.intendedProvince && 'text-slate-400')}>
              <option value="" disabled>Select a province or territory…</option>
              <option value="Any">No preference — open to any province</option>
              {CA_PROVINCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
            <ChevronDownIcon />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">
            Do you have a valid job offer from a Canadian employer?
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
          <p className="mt-1 text-sm leading-6 text-slate-600">Quebec has its own selection system (Arrima / PSTQ). Express Entry and most PNP pathways do not apply. You must obtain a Quebec Selection Certificate (CSQ) first.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Step: Risk ────────────────────────────────────────────────────────────────

function StepRisk({ data, onChange }: {
  data: Pick<IntakeData, 'previousRefusals' | 'lostStatus'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Immigration history</h1>
      <p className="mt-2 text-slate-500">These questions help flag situations that need professional legal review. All Canadian applications require honest disclosure.</p>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">
            Have you ever been refused a visa, permit, or entry to Canada or any other country?
          </Label>
          {[
            { value: 'no', label: 'No', desc: 'No previous refusals' },
            { value: 'yes', label: 'Yes', desc: 'I have had at least one refusal' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.previousRefusals === opt.value} onClick={() => onChange({ previousRefusals: opt.value })} />
          ))}
          {data.previousRefusals === 'yes' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">Refusals must be disclosed in your application. A licensed RCIC or immigration lawyer can advise you on how to address them.</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-[#0B1F3A]">
            Have you ever overstayed a permit, lost status, or been out of status in Canada or another country?
          </Label>
          {[
            { value: 'no', label: 'No', desc: 'No history of status loss or overstay' },
            { value: 'yes', label: 'Yes', desc: 'I have overstayed or lost status at some point' },
          ].map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc} selected={data.lostStatus === opt.value} onClick={() => onChange({ lostStatus: opt.value })} />
          ))}
          {data.lostStatus === 'yes' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">This is a serious issue that can affect admissibility. Consult a licensed RCIC or immigration lawyer before applying for anything.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step: Sign Up ─────────────────────────────────────────────────────────────

type SignUpPhase = 'phone' | 'otp' | 'details'

function StepSignUp({ onComplete }: { onComplete: (phone: string) => void }) {
  const [phase, setPhase] = useState<SignUpPhase>('phone')

  // Phase 1 — phone
  const [phone, setPhone] = useState('')

  // Phase 2 — OTP
  const [otp, setOtp] = useState('')

  // Phase 3 — account details
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [consent, setConsent] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // ── Phase 1: send OTP ──────────────────────────────────────────────────────
  async function handleSendOtp() {
    setLoading(true)
    setError('')

    const trimmedPhone = phone.trim()
    if (!trimmedPhone) {
      setError('Enter your phone number.')
      setLoading(false)
      return
    }

    // Duplicate check
    const res = await fetch('/api/auth/check-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: trimmedPhone }),
    })
    const { taken } = await res.json()
    if (taken) {
      setError('An account already exists with this phone number. Please log in instead.')
      setLoading(false)
      return
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: trimmedPhone })
    if (otpError) {
      setError(otpError.message)
      setLoading(false)
      return
    }

    setPhase('otp')
    setLoading(false)
  }

  // ── Phase 2: verify OTP ────────────────────────────────────────────────────
  async function handleVerifyOtp() {
    setLoading(true)
    setError('')

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp.trim(),
      type: 'sms',
    })

    if (verifyError) {
      setError('Incorrect code. Check your SMS and try again.')
      setLoading(false)
      return
    }

    setPhase('details')
    setLoading(false)
  }

  // ── Phase 2.5: forgot password ─────────────────────────────────────────────
  async function handleForgotPassword() {
    if (!email) { setError('Enter your email address first.'); return }
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard`,
    })
    setResetSent(true)
    setError('')
  }

  // ── Phase 3: add email + password to the phone-authed account ─────────────
  async function handleCompleteSignUp() {
    setLoading(true)
    setError('')

    const { error: updateError } = await supabase.auth.updateUser({
      email,
      password,
      data: { phone: phone.trim() },
    })

    if (updateError) {
      setError(
        updateError.message.toLowerCase().includes('already registered') ||
        updateError.message.toLowerCase().includes('already been registered')
          ? 'An account with this email already exists. Please log in instead.'
          : updateError.message
      )
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  function ErrorBanner({ msg }: { msg: string }) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <p className="text-sm text-red-700">
          {msg}{' '}
          {msg.includes('already exists') && (
            <Link href="/login" className="font-semibold underline">Log in →</Link>
          )}
        </p>
      </div>
    )
  }

  if (done) {
    return (
      <div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">Check your email</h1>
        <p className="mt-2 text-slate-500">
          We sent a confirmation link to <span className="font-semibold text-[#0B1F3A]">{email}</span>.
          Click the link to activate your account.
        </p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            Your profile is saved. You can continue to your dashboard now and confirm your email later.
            Log in after confirming to sync your data across devices.
          </p>
        </div>
        <Button onClick={() => onComplete(phone.trim())} className="mt-6 gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C]">
          Continue to dashboard <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // ── Phase 1: enter phone ───────────────────────────────────────────────────
  if (phase === 'phone') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">Verify your phone</h1>
        <p className="mt-2 text-slate-500">
          We'll send a one-time code to confirm your number. One phone number per account.
        </p>
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="su-phone" className="text-sm font-semibold text-[#0B1F3A]">Phone number</Label>
            <Input
              id="su-phone"
              type="tel"
              placeholder="+1 416 555 0100"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
            />
          </div>
          {error && <ErrorBanner msg={error} />}
          <Button
            onClick={handleSendOtp}
            disabled={!phone.trim() || loading}
            className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Sending code…' : 'Send verification code'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#D62828] hover:underline">Log in →</Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Phase 2: enter OTP ─────────────────────────────────────────────────────
  if (phase === 'otp') {
    return (
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3A]">Enter the code</h1>
        <p className="mt-2 text-slate-500">
          We sent a 6-digit code to <span className="font-semibold text-[#0B1F3A]">{phone}</span>.
        </p>
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="su-otp" className="text-sm font-semibold text-[#0B1F3A]">Verification code</Label>
            <Input
              id="su-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
              className="rounded-xl border-slate-200 bg-white px-4 py-3 text-center text-xl font-bold tracking-widest text-[#0B1F3A] placeholder:text-slate-300 focus-visible:ring-[#D62828]"
            />
          </div>
          {error && <ErrorBanner msg={error} />}
          <Button
            onClick={handleVerifyOtp}
            disabled={otp.length < 6 || loading}
            className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Verifying…' : 'Verify code'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
          <button
            type="button"
            onClick={() => { setPhase('phone'); setOtp(''); setError('') }}
            className="text-center text-sm text-slate-400 hover:text-[#0B1F3A]"
          >
            ← Use a different number
          </button>
        </div>
      </div>
    )
  }

  // ── Phase 3: email + password ──────────────────────────────────────────────
  return (
    <div>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-[#0B1F3A]">Phone verified</h1>
      <p className="mt-2 text-slate-500">Now set your email and password to complete your account.</p>
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="su-email" className="text-sm font-semibold text-[#0B1F3A]">Email address</Label>
          <Input
            id="su-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="su-password" className="text-sm font-semibold text-[#0B1F3A]">Password</Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-slate-400 hover:text-[#D62828]"
            >
              {resetSent ? 'Reset email sent ✓' : 'Forgot password?'}
            </button>
          </div>
          <div className="relative">
            <Input
              id="su-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border-slate-200 bg-white px-4 py-3 pr-11 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#D62828]"
            />
            <p className="text-sm leading-6 text-slate-600">
              I understand that Navly is a planning and information tool only — not legal advice or immigration consulting.
              By creating an account I agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#D62828] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#D62828] hover:underline">Privacy Policy</a>.
            </p>
          </label>
        </div>
        {error && <ErrorBanner msg={error} />}
        <Button
          onClick={handleCompleteSignUp}
          disabled={!email || password.length < 8 || !consent || loading}
          className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? 'Creating account…' : 'Create account'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#D62828] hover:underline">Log in →</Link>
        </p>
      </div>
    </div>
  )
}

// ─── Validation ────────────────────────────────────────────────────────────────

function getValidationHint(stepId: StepId, data: IntakeData): string {
  switch (stepId) {
    case 'location-split': return 'Select whether you are inside or outside Canada to continue.'
    case 'planned-entry': return 'Select your planned entry route to continue.'
    case 'inside-status': return 'Select your current immigration status to continue.'
    case 'goal': return 'Select your main immigration goal to continue.'
    case 'personal': {
      const age = parseInt(data.age)
      if (!data.age || isNaN(age) || age < 18 || age > 99) return 'Enter your age (must be 18–99).'
      if (!data.originCountry) return 'Select your country of citizenship.'
      if (!data.maritalStatus) return 'Select your marital status.'
      if ((data.maritalStatus === 'married' || data.maritalStatus === 'common-law') && !data.spouseComing) return 'Indicate whether your spouse is coming to Canada.'
      if (!data.canadianSibling) return 'Answer the Canadian sibling question.'
      return ''
    }
    case 'canada-dates': {
      if (!data.arrivalDate) return 'Enter your arrival date in Canada.'
      if (!data.province) return 'Select your province or territory.'
      return ''
    }
    case 'spouse-language': {
      if (!data.spouseLangTestType) return 'Select your spouse\'s language test type.'
      if (!data.spouseEducationLevel) return 'Select your spouse\'s education level.'
      return ''
    }
    case 'language': {
      if (!data.langTestType) return 'Select your language test type.'
      if (!data.langReading || !data.langWriting || !data.langListening || !data.langSpeaking) return 'Enter all four test scores.'
      return ''
    }
    case 'education': return 'Select your highest level of education.'
    case 'work': {
      if (!data.teerLevel) return 'Select your TEER level.'
      const isInside = data.locationStatus === 'inside'
      if (isInside && data.status === 'student' && !data.programLevel) return 'Select your program level.'
      if (isInside && data.status === 'work-permit' && !data.workPermitType) return 'Select your work permit type.'
      if (!data.hasJobOffer) return 'Indicate whether you have a Canadian job offer.'
      return ''
    }
    case 'settlement': return 'Enter your family size to continue.'
    case 'risk': {
      if (!data.previousRefusals) return 'Answer the previous refusals question.'
      if (!data.lostStatus) return 'Answer the lost status question.'
      return ''
    }
    case 'province': {
      if (!data.intendedProvince) return 'Select your intended province.'
      if (!data.hasJobOffer) return 'Indicate whether you have a Canadian job offer.'
      return ''
    }
    default: return ''
  }
}

function canContinue(stepId: StepId, data: IntakeData): boolean {
  switch (stepId) {
    case 'location-split': return !!data.locationStatus
    case 'planned-entry': return !!data.plannedEntry
    case 'inside-status': return !!data.status
    case 'goal': return !!data.goal
    case 'personal': {
      const age = parseInt(data.age)
      if (isNaN(age) || age < 18 || age > 99) return false
      if (!data.originCountry) return false
      if (!data.maritalStatus) return false
      if ((data.maritalStatus === 'married' || data.maritalStatus === 'common-law') && !data.spouseComing) return false
      if (!data.canadianSibling) return false
      return true
    }
    case 'canada-dates': return !!data.arrivalDate && !!data.province
    case 'spouse-language': return !!data.spouseLangTestType && !!data.spouseEducationLevel
    case 'language': return !!(data.langTestType && data.langReading && data.langWriting && data.langListening && data.langSpeaking)
    case 'education': return !!data.educationLevel
    case 'work': {
      if (!data.teerLevel) return false
      const isInside = data.locationStatus === 'inside'
      if (isInside && data.status === 'student') return !!data.programLevel
      if (isInside && data.status === 'work-permit') return !!data.workPermitType
      return !!data.hasJobOffer
    }
    case 'settlement': return !!data.familySize
    case 'risk': return !!data.previousRefusals && !!data.lostStatus
    case 'province': return !!data.intendedProvince && !!data.hasJobOffer
    case 'signup': return false
    default: return false
  }
}

// ─── Summary ───────────────────────────────────────────────────────────────────

function SummaryView({ data }: { data: IntakeData }) {
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
    data.langTestType && data.langReading ? {
      label: 'Language test',
      value: `${{ 'ielts-general': 'IELTS General', celpip: 'CELPIP', pte: 'PTE Core', tef: 'TEF Canada', tcf: 'TCF Canada' }[data.langTestType] || data.langTestType} — R:${data.langReading} W:${data.langWriting} L:${data.langListening} S:${data.langSpeaking}`,
    } : null,
    data.educationLevel ? { label: 'Education', value: educationLabels[data.educationLevel] ?? data.educationLevel } : null,
    data.teerLevel ? { label: 'TEER level', value: `TEER ${data.teerLevel}` } : null,
    data.intendedProvince ? { label: 'Intended province', value: data.intendedProvince === 'Any' ? 'No preference' : CA_PROVINCES.find(p => p.value === data.intendedProvince)?.label ?? data.intendedProvince } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl"><NavlyLogo size="sm" /></div>
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
              View my pathways and dashboard <ArrowRight className="h-4 w-4" />
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

// ─── Main flow ─────────────────────────────────────────────────────────────────

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

  function handleLocationSplit(v: string) {
    // Auto-set derived fields when location is chosen
    if (v === 'inside') {
      update({ locationStatus: 'inside', currentCountry: 'Canada', plannedEntry: '' })
    } else {
      update({ locationStatus: 'outside', status: 'outside-canada', arrivalDate: '', visaExpiryDate: '', province: '', canadianWorkMonths: '' })
    }
  }

  async function handleSignUpComplete(phone: string) {
    const withPhone = { ...data, phone, phoneVerified: 'yes' }
    setData(withPhone)
    saveProfile(withPhone)
    // Sync to Supabase — user is authenticated at this point (phone OTP + email/password set)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await saveProfileToSupabase(user.id, withPhone)
    }
    setDone(true)
  }

  if (done) return <SummaryView data={data} />

  const isSignupStep = currentStep === 'signup'

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <NavlyLogo size="sm" />
          <div className="text-right">
            <span className="text-sm text-slate-500">{stepIndex + 1} / {steps.length}</span>
            <p className="text-xs text-slate-400">{stepTitles[currentStep]}</p>
          </div>
        </div>
      </header>

      <div className="bg-white px-6 pb-2">
        <div className="mx-auto max-w-2xl">
          <Progress
            value={progress}
            className="h-1.5 bg-slate-100"
            aria-label="Onboarding progress"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {currentStep === 'location-split' && (
            <StepLocationSplit value={data.locationStatus} onChange={handleLocationSplit} />
          )}
          {currentStep === 'planned-entry' && (
            <StepPlannedEntry value={data.plannedEntry} onChange={(v) => update({ plannedEntry: v })} />
          )}
          {currentStep === 'inside-status' && (
            <StepInsideStatus value={data.status} onChange={(v) => update({ status: v })} />
          )}
          {currentStep === 'goal' && (
            <StepGoal data={data} onChange={(v) => update({ goal: v })} />
          )}
          {currentStep === 'personal' && (
            <StepPersonal data={data} onChange={update} />
          )}
          {currentStep === 'canada-dates' && (
            <StepCanadaDates data={data} onChange={update} />
          )}
          {currentStep === 'spouse-language' && (
            <StepSpouseLanguage data={data} onChange={update} />
          )}
          {currentStep === 'language' && (
            <StepLanguage data={data} onChange={update} />
          )}
          {currentStep === 'education' && (
            <StepEducation data={data} onChange={update} />
          )}
          {currentStep === 'work' && (
            <StepWork data={data} onChange={update} />
          )}
          {currentStep === 'settlement' && (
            <StepSettlement data={data} onChange={update} />
          )}
          {currentStep === 'province' && (
            <StepProvince data={data} onChange={update} />
          )}
          {currentStep === 'risk' && (
            <StepRisk data={data} onChange={update} />
          )}
          {currentStep === 'signup' && (
            <StepSignUp onComplete={(phone) => handleSignUpComplete(phone)} />
          )}

          {!isSignupStep && (
            <div className="mt-10">
              {(() => {
                const ok = canContinue(currentStep, data)
                const hint = !ok ? getValidationHint(currentStep, data) : ''
                return (
                  <>
                    <div className="flex items-center justify-between">
                      {stepIndex > 0 ? (
                        <Button variant="ghost" onClick={back} className="gap-2 text-slate-600">
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                        </Button>
                      ) : (
                        <Link href="/" className="text-sm text-slate-500 hover:text-[#0B1F3A]">Back to home</Link>
                      )}
                      <Button
                        onClick={next}
                        disabled={!ok}
                        aria-describedby={!ok && hint ? 'step-hint' : undefined}
                        className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
                      >
                        {stepIndex === steps.length - 2 ? 'Continue to account' : 'Continue'}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                    {!ok && hint && (
                      <p id="step-hint" role="status" className="mt-3 text-right text-xs text-slate-400">
                        {hint}
                      </p>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {isSignupStep && (
            <div className="mt-6">
              <Button variant="ghost" onClick={back} className="gap-2 text-slate-500">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
