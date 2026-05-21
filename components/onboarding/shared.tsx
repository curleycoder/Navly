'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { TOP_COUNTRIES, ALL_COUNTRIES } from '@/lib/geo'

export const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent appearance-none cursor-pointer'

export function OptionCard({ label, desc, selected, onClick, comingSoon }: {
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

export function ChevronDownIcon() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

const otherCountries = ALL_COUNTRIES.filter((c) => !TOP_COUNTRIES.includes(c))

export function CountrySelect({ id, value, onChange, placeholder }: {
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

export const englishTestOptions = [
  { value: 'ielts-general', label: 'IELTS General Training', desc: 'Accepted for Express Entry and most PNP streams — scores 0.0–9.0' },
  { value: 'celpip', label: 'CELPIP-General', desc: 'Accepted for Express Entry — scores 1–12' },
  { value: 'pte', label: 'PTE Core', desc: 'Accepted for Express Entry — scores 10–90' },
]

export const frenchTestOptions = [
  { value: 'tef', label: 'TEF Canada', desc: 'French test for Express Entry — CO / EO / CE / EE scores' },
  { value: 'tcf', label: 'TCF Canada', desc: 'French test for Express Entry — scores 0–699 / 0–20' },
]

// Legacy combined list (used in spouse language step)
export const langTestOptions = [
  ...englishTestOptions,
  ...frenchTestOptions,
  { value: 'other', label: 'Other (IELTS Academic, TOEFL, etc.)', desc: 'Not counted for Express Entry CRS — we will note it for PNP streams' },
  { value: 'none', label: 'No test taken yet', desc: 'I have not taken a language test' },
]

export const langConfig: Record<string, { min: number; max: number; step: number }> = {
  'ielts-general': { min: 0, max: 9, step: 0.5 },
  celpip: { min: 1, max: 12, step: 1 },
  pte: { min: 10, max: 90, step: 1 },
  tef: { min: 0, max: 450, step: 1 },
  tcf: { min: 0, max: 699, step: 1 },
}

const tefLabels = { r: 'CE — Reading (0–248)', w: 'EE — Writing (0–450)', l: 'CO — Listening (0–360)', s: 'EO — Speaking (0–450)' }
const tcfLabels = { r: 'CE — Reading (0–699)', w: 'EE — Writing (0–20)', l: 'CO — Listening (0–699)', s: 'EO — Speaking (0–20)' }
const frenchMax = { tef: { r: 248, w: 450, l: 360, s: 450 }, tcf: { r: 699, w: 20, l: 699, s: 20 } }

export function LanguageScoreFields({ testType, values, onChange }: {
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

export const educationOptions = [
  { value: 'less-than-secondary', label: 'Less than high school', desc: 'No secondary school diploma' },
  { value: 'secondary', label: 'High school diploma', desc: 'Secondary school graduation certificate' },
  { value: '1-year', label: '1-year post-secondary', desc: 'Certificate or diploma, 1 year' },
  { value: '2-year', label: '2-year post-secondary', desc: 'Diploma or associate degree, 2 years' },
  { value: 'bachelors', label: "Bachelor's degree", desc: '3+ year university degree' },
  { value: 'two-credentials', label: 'Two credentials (one 3+ years)', desc: 'Two post-secondary certificates, one being 3+ years' },
  { value: 'masters', label: "Master's degree", desc: 'Graduate-level university degree' },
  { value: 'doctoral', label: 'Doctoral degree (PhD)', desc: 'Doctoral-level university degree' },
]
