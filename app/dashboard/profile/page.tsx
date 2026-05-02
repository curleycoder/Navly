'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { loadProfile, saveProfile, EMPTY_PROFILE, type IntakeData } from '@/lib/profile'
import { TOP_COUNTRIES, ALL_COUNTRIES, CA_PROVINCES } from '@/lib/geo'

const statusOptions = [
  { value: 'student', label: 'International student', desc: 'Currently studying in Canada' },
  { value: 'work-permit', label: 'Work permit holder', desc: 'Currently working in Canada' },
  { value: 'visitor', label: 'Visitor / tourist', desc: 'Visiting on a temporary visa' },
  { value: 'pr', label: 'Permanent resident', desc: 'Already have PR status' },
  { value: 'other', label: 'Other', desc: 'None of the above' },
]

const goalOptions = [
  { value: 'pr', label: 'Apply for permanent residence', desc: 'Express Entry, PNP, or other PR pathways' },
  { value: 'work-permit', label: 'Extend or change work permit', desc: 'PGWP, LMIA, or employer-specific permits' },
  { value: 'study-permit', label: 'Extend or change study permit', desc: 'Continue or change your studies' },
  { value: 'citizenship', label: 'Apply for citizenship', desc: 'Become a Canadian citizen' },
  { value: 'other', label: 'Other / not sure yet', desc: 'I want to explore my options' },
]

const timelineOptions = [
  { value: 'urgent', label: 'Urgent', desc: 'Within 3 months' },
  { value: 'soon', label: 'Soon', desc: '3–6 months from now' },
  { value: 'planning', label: 'Planning ahead', desc: '6+ months away' },
  { value: 'unsure', label: 'Not sure', desc: "I haven't decided yet" },
]

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent appearance-none cursor-pointer'

const otherCountries = ALL_COUNTRIES.filter((c) => !TOP_COUNTRIES.includes(c))

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
          <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
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
          {TOP_COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </optgroup>
        <optgroup label="All countries">
          {otherCountries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </optgroup>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [data, setData] = useState<IntakeData>({ ...EMPTY_PROFILE })
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const profile = loadProfile()
    if (profile) setData(profile)
    setLoaded(true)
  }, [])

  const inCanada = data.currentCountry === 'Canada'

  function canSave() {
    const base = !!data.status && !!data.originCountry && !!data.currentCountry && !!data.goal && !!data.timeline
    if (inCanada) return base && !!data.province
    return base
  }

  function handleSave() {
    saveProfile(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!loaded) return null

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">Profile</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Edit your profile</h1>
        <p className="mt-2 text-slate-500">Update your immigration details at any time.</p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Status */}
        <section>
          <h2 className="mb-3 text-base font-bold text-[#0B1F3A]">Current immigration status</h2>
          <div className="flex flex-col gap-3">
            {statusOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                desc={opt.desc}
                selected={data.status === opt.value}
                onClick={() => setData((d) => ({ ...d, status: opt.value }))}
              />
            ))}
          </div>
        </section>

        {/* Location */}
        <section>
          <h2 className="mb-3 text-base font-bold text-[#0B1F3A]">Location</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="origin" className="text-sm font-semibold text-[#0B1F3A]">
                Country of origin
              </Label>
              <CountrySelect
                id="origin"
                value={data.originCountry}
                onChange={(v) => setData((d) => ({ ...d, originCountry: v }))}
                placeholder="Select your country of origin…"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="current" className="text-sm font-semibold text-[#0B1F3A]">
                Country you are currently in
              </Label>
              <CountrySelect
                id="current"
                value={data.currentCountry}
                onChange={(v) => setData((d) => ({ ...d, currentCountry: v, province: '', city: '' }))}
                placeholder="Select your current country…"
              />
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
                      onChange={(e) => setData((d) => ({ ...d, province: e.target.value }))}
                      className={cn(selectClass, !data.province && 'text-slate-400')}
                    >
                      <option value="" disabled>Select province or territory…</option>
                      {CA_PROVINCES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
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
                    onChange={(e) => setData((d) => ({ ...d, city: e.target.value }))}
                    className="rounded-xl border-slate-200 bg-white px-4 py-3 text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* Goal */}
        <section>
          <h2 className="mb-3 text-base font-bold text-[#0B1F3A]">Main immigration goal</h2>
          <div className="flex flex-col gap-3">
            {goalOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                desc={opt.desc}
                selected={data.goal === opt.value}
                onClick={() => setData((d) => ({ ...d, goal: opt.value }))}
              />
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="mb-3 text-base font-bold text-[#0B1F3A]">Timeline</h2>
          <div className="grid grid-cols-2 gap-3">
            {timelineOptions.map((opt) => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                desc={opt.desc}
                selected={data.timeline === opt.value}
                onClick={() => setData((d) => ({ ...d, timeline: opt.value }))}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Save */}
      <div className="mt-10 flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={!canSave()}
          className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
        >
          Save changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </div>
  )
}
