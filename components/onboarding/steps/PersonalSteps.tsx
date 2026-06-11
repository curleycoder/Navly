'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { CA_PROVINCES } from '@/lib/geo'
import { OptionCard, CountrySelect, ChevronDownIcon, selectClass } from '../shared'
import type { IntakeData } from '@/lib/profile'

const maritalOptions = [
  { value: 'single', label: 'Single', desc: 'Never married / no common-law partner' },
  { value: 'married', label: 'Married', desc: 'Legally married' },
  { value: 'common-law', label: 'Common-law', desc: 'Living with partner 12+ months' },
]

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function derivedAge(birthYear: string, birthMonth: string): number | null {
  const year = parseInt(birthYear)
  const month = parseInt(birthMonth)
  if (!year || !month || year < 1920 || year > 2010 || month < 1 || month > 12) return null
  const today = new Date()
  let age = today.getFullYear() - year
  if (today.getMonth() + 1 < month) age--
  return age >= 18 && age <= 99 ? age : null
}

export function StepPersonal({ data, onChange }: {
  data: Pick<IntakeData, 'age' | 'birthYear' | 'birthMonth' | 'originCountry' | 'currentCountry' | 'maritalStatus' | 'spouseComing' | 'canadianSibling' | 'locationStatus'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const hasPartner = data.maritalStatus === 'married' || data.maritalStatus === 'common-law'
  const computedAge = derivedAge(data.birthYear, data.birthMonth)

  function handleBirthField(fields: { birthYear?: string; birthMonth?: string }) {
    const next = { ...data, ...fields }
    const age = derivedAge(next.birthYear, next.birthMonth)
    onChange({ ...fields, age: age !== null ? String(age) : '' })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">Personal details</h1>
      <p className="mt-2 text-muted-text">These directly affect your CRS score and pathway options.</p>
      <div className="mt-4 flex flex-col gap-3">

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-semibold text-heading">Year of birth</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number" min={1924} max={2006} placeholder="e.g. 1994"
              value={data.birthYear}
              onChange={(e) => handleBirthField({ birthYear: e.target.value })}
              className="max-w-30 rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading placeholder:text-muted-text/70 focus-visible:ring-navly-red"
            />
            <select
              value={data.birthMonth}
              onChange={(e) => handleBirthField({ birthMonth: e.target.value })}
              className="rounded-xl border border-subtle bg-surface-card px-3 py-3 text-sm text-heading focus-visible:ring-navly-red"
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            {computedAge !== null && (
              <span className="text-sm text-muted-text">= age {computedAge}</span>
            )}
          </div>
          <p className="text-xs text-muted-text/70">Your age updates automatically each year — no need to edit your profile on your birthday.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="origin" className="text-sm font-semibold text-heading">Country of citizenship</Label>
          <CountrySelect id="origin" value={data.originCountry} onChange={(v) => onChange({ originCountry: v })} placeholder="Select your country of citizenship…" />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold text-heading">Marital status</Label>
          {maritalOptions.map((opt) => (
            <OptionCard key={opt.value} label={opt.label} desc={opt.desc}
              selected={data.maritalStatus === opt.value}
              onClick={() => onChange({ maritalStatus: opt.value, spouseComing: '' })} />
          ))}
        </div>

        {hasPartner && (
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold text-heading">
              Will your spouse / partner come to Canada with you?
              <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Adds up to 40 CRS bonus points based on their language and education.</span>
            </Label>
            {[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ].map((opt) => (
              <OptionCard key={opt.value} label={opt.label} desc="" selected={data.spouseComing === opt.value} onClick={() => onChange({ spouseComing: opt.value })} />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Label className="text-sm font-semibold text-heading">
            Do you have a brother or sister who is a Canadian citizen or permanent resident?
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">Adds 15 CRS adaptability points.</span>
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

export function StepCanadaDates({ data, onChange }: {
  data: Pick<IntakeData, 'province' | 'arrivalDate' | 'visaExpiryDate'>
  onChange: (fields: Partial<IntakeData>) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div>
      <h1 className="text-3xl font-bold text-heading">Your time in Canada</h1>
      <p className="mt-2 text-muted-text">Used to calculate your days in Canada and track permit expiry.</p>
      <div className="mt-4 flex flex-col gap-3 overflow-hidden">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="province" className="text-sm font-semibold text-heading">
            Province / Territory you are in
            <span className="ml-1.5 text-xs font-normal text-navly-red">Required for PNP scoring</span>
          </Label>
          <div className="relative">
            <select id="province" value={data.province} onChange={(e) => onChange({ province: e.target.value })}
              className={cn(selectClass, !data.province && 'text-muted-text/70')}>
              <option value="" disabled>Select province or territory…</option>
              {CA_PROVINCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
            <ChevronDownIcon />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="arrivalDate" className="text-sm font-semibold text-heading">
            Date you arrived in Canada
          </Label>
          <Input id="arrivalDate" type="date" max={today} value={data.arrivalDate}
            onChange={(e) => onChange({ arrivalDate: e.target.value })}
            className="block w-full min-w-0 rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading focus-visible:ring-navly-red" />
          <p className="text-xs text-muted-text/70">Your days in Canada are calculated from this date. Every trip abroad is subtracted automatically.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="visaExpiry" className="text-sm font-semibold text-heading">
            Visa / permit expiry date
            <span className="ml-1.5 block text-xs font-normal text-muted-text mt-0.5">We use this to send you renewal reminders at 90 and 30 days before expiry.</span>
          </Label>
          <Input id="visaExpiry" type="date" min={today} value={data.visaExpiryDate}
            onChange={(e) => onChange({ visaExpiryDate: e.target.value })}
            className="block w-full min-w-0 rounded-xl border-subtle bg-surface-card px-4 py-3 text-heading focus-visible:ring-navly-red" />
          <p className="text-xs text-muted-text/70">Applies to study permits, work permits, visitor visas, and TRPs. You will get a task reminder at 90 days and 30 days before expiry.</p>
        </div>
      </div>
    </div>
  )
}
