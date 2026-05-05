'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { loadProfile, saveProfile, EMPTY_PROFILE, type IntakeData } from '@/lib/profile'
import { TOP_COUNTRIES, ALL_COUNTRIES, CA_PROVINCES } from '@/lib/geo'

// ─── Options ─────────────────────────────────────────────────────────────────

const statusOptions = [
  { value: 'student', label: 'International student' },
  { value: 'work-permit', label: 'Work permit holder' },
  { value: 'visitor', label: 'Visitor / tourist' },
  { value: 'refugee', label: 'Refugee / protected person' },
  { value: 'family-member', label: 'Spouse / family of Canadian or PR' },
  { value: 'out-of-status', label: 'Out of status' },
  { value: 'pr', label: 'Permanent resident' },
  { value: 'other', label: 'Other / not sure' },
]

const goalOptions = [
  { value: 'pr', label: 'Apply for permanent residence' },
  { value: 'work-permit', label: 'Extend or change work permit' },
  { value: 'study-permit', label: 'Extend or change study permit' },
  { value: 'citizenship', label: 'Apply for citizenship' },
  { value: 'family', label: 'Join family in Canada' },
  { value: 'business', label: 'Start or expand a business' },
  { value: 'compare', label: 'Compare all my options' },
  { value: 'other', label: 'Other / not sure yet' },
]

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not', label: 'Prefer not to say' },
]

const otherCountries = ALL_COUNTRIES.filter((c) => !TOP_COUNTRIES.includes(c))

// ─── Shared select style ─────────────────────────────────────────────────────

const selectCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent appearance-none cursor-pointer pr-10'

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

// ─── Confirmation prompt ──────────────────────────────────────────────────────

function ConfirmChange({
  label,
  onConfirm,
  onCancel,
}: {
  label: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="mt-2 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <div className="flex-1">
        <p className="text-sm text-amber-800">
          Change to <span className="font-semibold">{label}</span>? This may affect your pathway estimates.
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-[#0B1F3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#162d52]"
          >
            Yes, update
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="font-semibold text-[#0B1F3A]">{title}</h2>
        {desc && <p className="mt-0.5 text-sm text-slate-500">{desc}</p>}
      </div>
      <div className="flex flex-col gap-5 px-6 py-5">{children}</div>
    </section>
  )
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-semibold text-[#0B1F3A]">{label}</Label>
        {note && <span className="text-xs text-slate-400">{note}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [data, setData] = useState<IntakeData>({ ...EMPTY_PROFILE })
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Pending confirmation state for sensitive dropdowns
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [pendingGoal, setPendingGoal] = useState<string | null>(null)
  const [pendingCountry, setPendingCountry] = useState<string | null>(null)

  useEffect(() => {
    const profile = loadProfile()
    if (profile) setData(profile)
    setLoaded(true)
  }, [])

  const inCanada = data.currentCountry === 'Canada'

  function handleSave() {
    saveProfile(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function update(fields: Partial<IntakeData>) {
    setData((d) => ({ ...d, ...fields }))
  }

  if (!loaded) return null

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">Settings</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Your profile</h1>
        <p className="mt-2 text-slate-500">Keep your details up to date so your pathway estimates stay accurate.</p>
      </div>

      <div className="flex flex-col gap-5">

        {/* ── Account ─────────────────────────────────────────────────────── */}
        <Section title="Account" desc="Your personal and login details.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <Input
                value={data.firstName}
                onChange={(e) => update({ firstName: e.target.value })}
                placeholder="e.g. Amara"
                className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
              />
            </Field>
            <Field label="Last name">
              <Input
                value={data.lastName}
                onChange={(e) => update({ lastName: e.target.value })}
                placeholder="e.g. Osei"
                className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
              />
            </Field>
          </div>

          <Field label="Email address">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="flex-1 text-sm text-[#0B1F3A]">{data.email || 'Not set'}</span>
              <span className="text-xs text-slate-400">Contact support to change</span>
            </div>
          </Field>

          <Field label="Password">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="flex-1 text-sm text-slate-400">••••••••••••</span>
              <button
                type="button"
                className="text-xs font-semibold text-[#D62828] hover:underline"
                onClick={() => alert('Password change coming soon.')}
              >
                Change
              </button>
            </div>
          </Field>

          <Field label="Gender" note="Optional">
            <SelectWrapper>
              <select
                value={data.gender}
                onChange={(e) => update({ gender: e.target.value })}
                className={cn(selectCls, !data.gender && 'text-slate-400')}
              >
                <option value="">Prefer not to say</option>
                {genderOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>
        </Section>

        {/* ── Immigration status ───────────────────────────────────────────── */}
        <Section title="Immigration status" desc="Your current status in Canada. Changing this may affect your pathway analysis.">
          <Field label="Current status">
            <SelectWrapper>
              <select
                value={pendingStatus ?? data.status}
                onChange={(e) => {
                  if (e.target.value !== data.status) setPendingStatus(e.target.value)
                }}
                className={cn(selectCls, !data.status && 'text-slate-400')}
              >
                <option value="" disabled>Select your status…</option>
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SelectWrapper>
            {pendingStatus && (
              <ConfirmChange
                label={statusOptions.find((o) => o.value === pendingStatus)?.label ?? pendingStatus}
                onConfirm={() => { update({ status: pendingStatus }); setPendingStatus(null) }}
                onCancel={() => setPendingStatus(null)}
              />
            )}
          </Field>
        </Section>

        {/* ── Location ─────────────────────────────────────────────────────── */}
        <Section title="Location" desc="Where you are from and where you currently live.">
          <Field label="Country of origin">
            <SelectWrapper>
              <select
                value={data.originCountry}
                onChange={(e) => update({ originCountry: e.target.value })}
                className={cn(selectCls, !data.originCountry && 'text-slate-400')}
              >
                <option value="" disabled>Select country of origin…</option>
                <optgroup label="Common source countries">
                  {TOP_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
                <optgroup label="All countries">
                  {otherCountries.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
              </select>
            </SelectWrapper>
          </Field>

          <Field label="Current country">
            <SelectWrapper>
              <select
                value={pendingCountry ?? data.currentCountry}
                onChange={(e) => {
                  if (e.target.value !== data.currentCountry) setPendingCountry(e.target.value)
                }}
                className={cn(selectCls, !data.currentCountry && 'text-slate-400')}
              >
                <option value="" disabled>Select current country…</option>
                <optgroup label="Common source countries">
                  {TOP_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
                <optgroup label="All countries">
                  {otherCountries.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
              </select>
            </SelectWrapper>
            {pendingCountry && (
              <ConfirmChange
                label={pendingCountry}
                onConfirm={() => {
                  update({ currentCountry: pendingCountry, province: '', city: '' })
                  setPendingCountry(null)
                }}
                onCancel={() => setPendingCountry(null)}
              />
            )}
          </Field>

          {inCanada && (
            <>
              <Field label="Province / Territory" note="Required for PR scoring">
                <SelectWrapper>
                  <select
                    value={data.province}
                    onChange={(e) => update({ province: e.target.value })}
                    className={cn(selectCls, !data.province && 'text-slate-400')}
                  >
                    <option value="" disabled>Select province or territory…</option>
                    {CA_PROVINCES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </SelectWrapper>
              </Field>

              <Field label="City / Area" note="Optional">
                <Input
                  value={data.city}
                  onChange={(e) => update({ city: e.target.value })}
                  placeholder="e.g. Toronto, Vancouver…"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
                />
              </Field>
            </>
          )}
        </Section>

        {/* ── Goal ─────────────────────────────────────────────────────────── */}
        <Section title="Main goal" desc="What you are trying to achieve. Changing this updates your task list and pathway analysis.">
          <Field label="Your immigration goal">
            <SelectWrapper>
              <select
                value={pendingGoal ?? data.goal}
                onChange={(e) => {
                  if (e.target.value !== data.goal) setPendingGoal(e.target.value)
                }}
                className={cn(selectCls, !data.goal && 'text-slate-400')}
              >
                <option value="" disabled>Select your goal…</option>
                {goalOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SelectWrapper>
            {pendingGoal && (
              <ConfirmChange
                label={goalOptions.find((o) => o.value === pendingGoal)?.label ?? pendingGoal}
                onConfirm={() => { update({ goal: pendingGoal }); setPendingGoal(null) }}
                onCancel={() => setPendingGoal(null)}
              />
            )}
          </Field>
        </Section>

      </div>

      {/* Save */}
      <div className="mt-6 flex items-center gap-4">
        <Button
          onClick={handleSave}
          className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C]"
        >
          Save changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </div>
  )
}
