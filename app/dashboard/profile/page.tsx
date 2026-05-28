'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertTriangle, ChevronDown, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { loadProfile, saveProfile, loadProfileFromSupabase, saveProfileToSupabase, EMPTY_PROFILE, type IntakeData } from '@/lib/profile'
import { TOP_COUNTRIES, ALL_COUNTRIES, CA_PROVINCES } from '@/lib/geo'
import { supabase } from '@/lib/supabase/client'
import { getRequiredFunds } from '@/lib/settlement-funds'

// ─── Options ─────────────────────────────────────────────────────────────────

const statusOptions = [
  { value: 'student',        label: 'International student' },
  { value: 'work-permit',    label: 'Work permit holder' },
  { value: 'visitor',        label: 'Visitor / tourist' },
  { value: 'refugee',        label: 'Refugee / protected person' },
  { value: 'family-member',  label: 'Spouse / family of Canadian or PR' },
  { value: 'out-of-status',  label: 'Out of status' },
  { value: 'pr',             label: 'Permanent resident' },
  { value: 'other',          label: 'Other / not sure' },
]

const goalOptions = [
  { value: 'pr',           label: 'Apply for permanent residence' },
  { value: 'work-permit',  label: 'Extend or change work permit' },
  { value: 'study-permit', label: 'Extend or change study permit' },
  { value: 'citizenship',  label: 'Apply for citizenship' },
  { value: 'family',       label: 'Join family in Canada' },
  { value: 'business',     label: 'Start or expand a business' },
  { value: 'compare',      label: 'Compare all my options' },
  { value: 'other',        label: 'Other / not sure yet' },
]

const plannedEntryOptions = [
  { value: 'express-entry', label: 'Express Entry / Permanent residence' },
  { value: 'study-permit',  label: 'Study permit' },
  { value: 'work-permit',   label: 'Work permit' },
  { value: 'visitor',       label: 'Visitor / tourism' },
  { value: 'family',        label: 'Family sponsorship' },
  { value: 'business',      label: 'Business / investor' },
  { value: 'unsure',        label: 'Not sure yet' },
]

const maritalOptions = [
  { value: 'single',      label: 'Single' },
  { value: 'married',     label: 'Married' },
  { value: 'common-law',  label: 'Common-law' },
]

const arrivalTimelineOptions = [
  { value: 'within-3-months', label: 'Within 3 months' },
  { value: '3-6-months',      label: '3–6 months' },
  { value: '6-12-months',     label: '6–12 months' },
  { value: '1-2-years',       label: '1–2 years' },
  { value: 'not-sure',        label: 'Not sure yet' },
]

const englishTestOptions = [
  { value: 'ielts-general', label: 'IELTS General Training' },
  { value: 'celpip',        label: 'CELPIP-General' },
  { value: 'pte',           label: 'PTE Core' },
]

const frenchOnlyTestOptions = [
  { value: 'tef', label: 'TEF Canada' },
  { value: 'tcf', label: 'TCF Canada' },
]

const educationOptions = [
  { value: 'less-than-secondary', label: 'Less than high school' },
  { value: 'secondary',           label: 'High school diploma' },
  { value: '1-year',              label: '1-year post-secondary' },
  { value: '2-year',              label: '2-year post-secondary' },
  { value: 'bachelors',           label: "Bachelor's degree (3+ years)" },
  { value: 'two-credentials',     label: 'Two post-secondary credentials (one 3+ years)' },
  { value: 'masters',             label: "Master's degree" },
  { value: 'doctoral',            label: 'Doctoral degree (PhD)' },
]

const canadianEducationOptions = [
  { value: 'none',        label: 'No Canadian education' },
  { value: '1-2-year',    label: '1–2 year Canadian program' },
  { value: '3-plus-year', label: '3+ year Canadian degree or graduate program' },
]

const teerOptions = [
  { value: '0', label: 'TEER 0 — Senior management' },
  { value: '1', label: 'TEER 1 — University-level' },
  { value: '2', label: 'TEER 2 — College diploma / 2-year apprenticeship' },
  { value: '3', label: 'TEER 3 — College diploma / 1-year apprenticeship' },
  { value: '4', label: 'TEER 4 — High school diploma' },
  { value: '5', label: 'TEER 5 — Short demonstration' },
]

const programLevelOptions = [
  { value: 'certificate',  label: 'Certificate' },
  { value: 'diploma',      label: 'College diploma' },
  { value: 'bachelors',    label: "Bachelor's degree" },
  { value: 'masters',      label: "Master's degree" },
  { value: 'doctoral',     label: 'Doctoral / PhD' },
  { value: 'other',        label: 'Other' },
]

const prPreStatusOptions = [
  { value: 'student',   label: 'International student' },
  { value: 'worker',    label: 'Worker (work permit / PGWP)' },
  { value: 'visitor',   label: 'Visitor' },
  { value: 'protected', label: 'Refugee / protected person' },
  { value: 'outside',   label: 'I was outside Canada' },
  { value: 'other',     label: 'Other' },
]

const otherCountries = ALL_COUNTRIES.filter((c) => !TOP_COUNTRIES.includes(c))

// ─── Shared select style ──────────────────────────────────────────────────────

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

// ─── Country select ───────────────────────────────────────────────────────────

function CountrySelect({ id, value, onChange, placeholder }: { id?: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <SelectWrapper>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(selectCls, !value && 'text-slate-400')}>
        <option value="" disabled>{placeholder}</option>
        <optgroup label="Common source countries">
          {TOP_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </optgroup>
        <optgroup label="All countries">
          {otherCountries.map((c) => <option key={c} value={c}>{c}</option>)}
        </optgroup>
      </select>
    </SelectWrapper>
  )
}

// ─── Confirmation prompt ──────────────────────────────────────────────────────

function ConfirmChange({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="mt-2 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <div className="flex-1">
        <p className="text-sm text-amber-800">
          Change to <span className="font-semibold">{label}</span>? This may affect your pathway estimates.
        </p>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={onConfirm}
            className="rounded-lg bg-[#0B1F3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#162d52]">
            Yes, update
          </button>
          <button type="button" onClick={onCancel}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section / Field wrappers ─────────────────────────────────────────────────

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

// ─── Risk yes/no field ────────────────────────────────────────────────────────

function RiskField({ label, note, value, onChange, warningText, level = 'warning' }: {
  label: string; note?: string; value: string; onChange: (v: string) => void
  warningText?: string; level?: 'warning' | 'critical'
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-semibold text-[#0B1F3A]">
        {label}
        {note && <span className="ml-1.5 block text-xs font-normal text-slate-500 mt-0.5">{note}</span>}
      </Label>
      <SelectWrapper>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(selectCls, !value && 'text-slate-400')}>
          <option value="" disabled>Select…</option>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </SelectWrapper>
      {value === 'yes' && warningText && (
        <div className={cn(
          'flex items-start gap-2 rounded-xl border p-3',
          level === 'critical' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50',
        )}>
          <AlertTriangle className={cn('mt-0.5 h-4 w-4 shrink-0', level === 'critical' ? 'text-red-500' : 'text-amber-600')} />
          <p className={cn('text-sm', level === 'critical' ? 'text-red-800' : 'text-amber-800')}>{warningText}</p>
        </div>
      )}
    </div>
  )
}

// ─── Language score grid ──────────────────────────────────────────────────────

function LangScoreGrid({ keys, values, onChange }: {
  keys: [keyof IntakeData, keyof IntakeData, keyof IntakeData, keyof IntakeData]
  values: [string, string, string, string]
  onChange: (key: keyof IntakeData, v: string) => void
}) {
  const labels = ['Reading', 'Writing', 'Listening', 'Speaking']
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {keys.map((key, i) => (
        <Field key={key as string} label={labels[i]}>
          <Input
            value={values[i]}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder="—"
            className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
          />
        </Field>
      ))}
    </div>
  )
}

// ─── Password change ──────────────────────────────────────────────────────────

function PasswordChangeForm() {
  const [open, setOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function reset() { setNewPassword(''); setConfirm(''); setError(''); setSuccess(false); setOpen(false) }

  async function handleChange() {
    setError('')
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)
    if (updateError) { setError(updateError.message); return }
    setSuccess(true)
    setTimeout(reset, 2000)
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold text-[#D62828] hover:underline">
        Change
      </button>
    )
  }

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold text-slate-600">New password</Label>
        <div className="relative">
          <Input type={showNew ? 'text' : 'password'} placeholder="At least 8 characters"
            value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError('') }}
            className="rounded-xl border-slate-200 pr-10 text-sm focus-visible:ring-[#D62828]" />
          <button type="button" onClick={() => setShowNew(v => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold text-slate-600">Confirm new password</Label>
        <div className="relative">
          <Input type={showConfirm ? 'text' : 'password'} placeholder="Repeat password"
            value={confirm} onChange={(e) => { setConfirm(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleChange()}
            className="rounded-xl border-slate-200 pr-10 text-sm focus-visible:ring-[#D62828]" />
          <button type="button" onClick={() => setShowConfirm(v => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
          <p className="text-xs text-green-700">Password updated.</p>
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={handleChange} disabled={!newPassword || !confirm || loading} size="sm"
          className="gap-1.5 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40">
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {loading ? 'Saving…' : 'Update password'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={reset} className="border-slate-200 text-slate-600">
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [data, setData] = useState<IntakeData>({ ...EMPTY_PROFILE })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [pendingGoal, setPendingGoal] = useState<string | null>(null)
  const [pendingCountry, setPendingCountry] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const local = loadProfile()
      if (local) setData(local)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const remote = await loadProfileFromSupabase(user.id)
        if (remote) setData(remote)
      }
      setLoaded(true)
    }
    load()
  }, [])

  function update(fields: Partial<IntakeData>) {
    setData((d) => ({ ...d, ...fields }))
  }

  async function handleSave() {
    setSaving(true)

    // Sync lang2 fields → frenchTestType for scoring engine compatibility
    // (scoring.ts reads frenchTestType/frenchReading; onboarding saves lang2*)
    const toSave = { ...data }
    if (data.lang2TestType === 'tef' || data.lang2TestType === 'tcf') {
      toSave.frenchTestType  = data.lang2TestType
      toSave.frenchReading   = data.lang2Reading
      toSave.frenchWriting   = data.lang2Writing
      toSave.frenchListening = data.lang2Listening
      toSave.frenchSpeaking  = data.lang2Speaking
    } else {
      toSave.frenchTestType  = ''
      toSave.frenchReading   = ''
      toSave.frenchWriting   = ''
      toSave.frenchListening = ''
      toSave.frenchSpeaking  = ''
    }

    saveProfile(toSave)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await saveProfileToSupabase(user.id, toSave)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!loaded) return null

  const isInside  = data.locationStatus === 'inside'
  const isOutside = data.locationStatus === 'outside'
  const isPR      = data.status === 'pr'
  const isStudent = data.status === 'student'
  const isWorker  = ['work-permit', 'pgwp', 'open-work-permit', 'employer-specific-work-permit'].includes(data.status)
  const hasPartner = data.maritalStatus === 'married' || data.maritalStatus === 'common-law'
  const hasSpouse  = hasPartner && data.spouseComing === 'yes'

  const showCanadaDates = isInside && !isPR
  const showSettlement  = isOutside ||
    (isInside && data.status !== 'student' && !isWorker && !isPR)

  // Second language options depend on which language is first
  const isEnglishFirst = data.firstOfficialLanguage === 'english'
  const isFrenchFirst  = data.firstOfficialLanguage === 'french'
  const firstTestOptions  = isEnglishFirst ? englishTestOptions : isFrenchFirst ? frenchOnlyTestOptions : []
  const secondTestOptions = isEnglishFirst ? frenchOnlyTestOptions : isFrenchFirst ? englishTestOptions : []
  const showFirstScores  = !!data.langTestType  && data.langTestType  !== 'none'
  const showSecondScores = !!data.lang2TestType && data.lang2TestType !== 'none'

  const familySize     = parseInt(data.familySize) || 1
  const requiredFunds  = getRequiredFunds(familySize)
  const fundsOk        = data.settlementFunds ? parseFloat(data.settlementFunds) >= requiredFunds : null

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
        <Section title="Account" desc="Your login details.">
          <Field label="Full name">
            <Input value={data.fullName} onChange={(e) => update({ fullName: e.target.value })}
              placeholder="e.g. Amara Osei"
              className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
          </Field>

          <Field label="Email address">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="flex-1 text-sm text-[#0B1F3A]">{data.email || 'Not set'}</span>
              <span className="text-xs text-slate-400">Contact support to change</span>
            </div>
          </Field>

          <Field label="Password">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="flex-1 text-sm text-slate-400">••••••••••••</span>
              <PasswordChangeForm />
            </div>
          </Field>
        </Section>

        {/* ── Status & Goal ────────────────────────────────────────────────── */}
        <Section title="Status & goal" desc="Changing these updates your pathway analysis.">
          {isInside && (
            <Field label="Current status in Canada">
              <SelectWrapper>
                <select value={pendingStatus ?? data.status}
                  onChange={(e) => { if (e.target.value !== data.status) setPendingStatus(e.target.value) }}
                  className={cn(selectCls, !data.status && 'text-slate-400')}>
                  <option value="" disabled>Select your status…</option>
                  {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
          )}

          {isOutside && (
            <Field label="Entry plan">
              <SelectWrapper>
                <select value={data.plannedEntry} onChange={(e) => update({ plannedEntry: e.target.value })}
                  className={cn(selectCls, !data.plannedEntry && 'text-slate-400')}>
                  <option value="" disabled>Select entry plan…</option>
                  {plannedEntryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </SelectWrapper>
            </Field>
          )}

          <Field label="Main immigration goal">
            <SelectWrapper>
              <select value={pendingGoal ?? data.goal}
                onChange={(e) => { if (e.target.value !== data.goal) setPendingGoal(e.target.value) }}
                className={cn(selectCls, !data.goal && 'text-slate-400')}>
                <option value="" disabled>Select your goal…</option>
                {goalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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

        {/* ── Personal details ─────────────────────────────────────────────── */}
        <Section title="Personal details" desc="Age, marital status, and family ties directly affect your CRS score.">
          <Field label="Age">
            <Input type="number" min={18} max={80} placeholder="e.g. 29"
              value={data.age} onChange={(e) => update({ age: e.target.value })}
              className="max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
          </Field>

          <Field label="Country of citizenship">
            <CountrySelect value={data.originCountry} onChange={(v) => update({ originCountry: v })}
              placeholder="Select your country of citizenship…" />
          </Field>

          {isOutside && (
            <Field label="Country you are currently in" note="Optional">
              <CountrySelect value={data.currentCountry}
                onChange={(v) => update({ currentCountry: v })}
                placeholder="Select current country…" />
            </Field>
          )}

          <Field label="Marital status">
            <SelectWrapper>
              <select value={data.maritalStatus}
                onChange={(e) => update({ maritalStatus: e.target.value, spouseComing: '' })}
                className={cn(selectCls, !data.maritalStatus && 'text-slate-400')}>
                <option value="" disabled>Select…</option>
                {maritalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </SelectWrapper>
          </Field>

          {hasPartner && (
            <Field label="Will your spouse / partner come to Canada with you?"
              note="Affects CRS calculation">
              <SelectWrapper>
                <select value={data.spouseComing} onChange={(e) => update({ spouseComing: e.target.value })}
                  className={cn(selectCls, !data.spouseComing && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  <option value="yes">Yes — they will accompany me</option>
                  <option value="no">No — applying without them</option>
                </select>
              </SelectWrapper>
            </Field>
          )}

          <Field label="Canadian citizen or PR sibling" note="+15 CRS">
            <SelectWrapper>
              <select value={data.canadianSibling} onChange={(e) => update({ canadianSibling: e.target.value })}
                className={cn(selectCls, !data.canadianSibling && 'text-slate-400')}>
                <option value="" disabled>Select…</option>
                <option value="yes">Yes — I have a Canadian citizen or PR sibling</option>
                <option value="no">No</option>
              </select>
            </SelectWrapper>
          </Field>
        </Section>

        {/* ── Location & destination ───────────────────────────────────────── */}
        <Section title="Location & destination" desc="Province determines PNP eligibility and pathway matching.">
          {isInside && (
            <Field label="Province / territory you are in" note="Required for PNP scoring">
              <SelectWrapper>
                <select value={data.province} onChange={(e) => update({ province: e.target.value })}
                  className={cn(selectCls, !data.province && 'text-slate-400')}>
                  <option value="" disabled>Select province or territory…</option>
                  {CA_PROVINCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </SelectWrapper>
            </Field>
          )}

          <Field label="Intended province for PR">
            <SelectWrapper>
              <select value={data.intendedProvince} onChange={(e) => update({ intendedProvince: e.target.value })}
                className={cn(selectCls, !data.intendedProvince && 'text-slate-400')}>
                <option value="" disabled>Select…</option>
                <option value="Any">No preference — open to any province</option>
                {CA_PROVINCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </SelectWrapper>
          </Field>

          {isOutside && (
            <Field label="When are you planning to arrive in Canada?">
              <SelectWrapper>
                <select value={data.targetArrivalTimeline}
                  onChange={(e) => update({ targetArrivalTimeline: e.target.value })}
                  className={cn(selectCls, !data.targetArrivalTimeline && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  {arrivalTimelineOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </SelectWrapper>
            </Field>
          )}

          <Field label="Do you intend to live in Quebec?" note="Quebec has a separate immigration system">
            <SelectWrapper>
              <select value={data.quebecIntent} onChange={(e) => update({ quebecIntent: e.target.value })}
                className={cn(selectCls, !data.quebecIntent && 'text-slate-400')}>
                <option value="" disabled>Select…</option>
                <option value="yes">Yes — I plan to settle in Quebec</option>
                <option value="no">No — outside Quebec</option>
              </select>
            </SelectWrapper>
          </Field>
        </Section>

        {/* ── Canada dates (inside non-PR only) ───────────────────────────── */}
        {showCanadaDates && (
          <Section title="Canada dates" desc="Your arrival date calculates days in Canada. Permit expiry triggers renewal reminders.">
            <Field label="Date you arrived in Canada">
              <Input type="date" max={new Date().toISOString().slice(0, 10)}
                value={data.arrivalDate} onChange={(e) => update({ arrivalDate: e.target.value })}
                className="block w-full rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
            </Field>
            <Field label="Visa / permit expiry date">
              <Input type="date" value={data.visaExpiryDate}
                onChange={(e) => update({ visaExpiryDate: e.target.value })}
                className="block w-full rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              <p className="text-xs text-slate-400">
                Applies to study permits, work permits, visitor visas, and TRPs. You will get a reminder at 90 and 30 days before expiry.
              </p>
            </Field>
          </Section>
        )}

        {/* ── Spouse / partner details (when spouse is coming) ────────────── */}
        {hasSpouse && (
          <Section title="Spouse / partner's details"
            desc="Their language, education, and Canadian work experience add up to 40 bonus CRS points.">
            <Field label="Spouse's language test">
              <SelectWrapper>
                <select value={data.spouseLangTestType}
                  onChange={(e) => update({
                    spouseLangTestType: e.target.value,
                    spouseLangReading: '', spouseLangWriting: '', spouseLangListening: '', spouseLangSpeaking: '',
                  })}
                  className={cn(selectCls, !data.spouseLangTestType && 'text-slate-400')}>
                  <option value="" disabled>Select test…</option>
                  {[...englishTestOptions, ...frenchOnlyTestOptions].map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                  <option value="none">No test taken</option>
                </select>
              </SelectWrapper>
            </Field>

            {data.spouseLangTestType && data.spouseLangTestType !== 'none' && (
              <LangScoreGrid
                keys={['spouseLangReading', 'spouseLangWriting', 'spouseLangListening', 'spouseLangSpeaking']}
                values={[data.spouseLangReading, data.spouseLangWriting, data.spouseLangListening, data.spouseLangSpeaking]}
                onChange={(k, v) => update({ [k]: v })}
              />
            )}

            <Field label="Spouse's highest education">
              <SelectWrapper>
                <select value={data.spouseEducationLevel}
                  onChange={(e) => update({ spouseEducationLevel: e.target.value })}
                  className={cn(selectCls, !data.spouseEducationLevel && 'text-slate-400')}>
                  <option value="" disabled>Select level…</option>
                  {educationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </SelectWrapper>
            </Field>

            <Field label="Spouse's skilled Canadian work experience (months)" note="TEER 0–3 only">
              <Input type="number" min={0} max={120} placeholder="e.g. 0"
                value={data.spouseCanadianWorkMonths}
                onChange={(e) => update({ spouseCanadianWorkMonths: e.target.value })}
                className="max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
            </Field>
          </Section>
        )}

        {/* ── Language ─────────────────────────────────────────────────────── */}
        <Section title="Language test results"
          desc="Language is the highest-value CRS factor. Results must be less than 2 years old for Express Entry.">

          <Field label="First official language">
            <SelectWrapper>
              <select value={data.firstOfficialLanguage}
                onChange={(e) => update({
                  firstOfficialLanguage: e.target.value,
                  langTestType: '', langTestDate: '', langReading: '', langWriting: '', langListening: '', langSpeaking: '',
                  lang2TestType: '', lang2TestDate: '', lang2Reading: '', lang2Writing: '', lang2Listening: '', lang2Speaking: '',
                })}
                className={cn(selectCls, !data.firstOfficialLanguage && 'text-slate-400')}>
                <option value="" disabled>Select…</option>
                <option value="english">English</option>
                <option value="french">French</option>
              </select>
            </SelectWrapper>
          </Field>

          {(isEnglishFirst || isFrenchFirst) && (
            <>
              <Field label={isEnglishFirst ? 'English test' : 'French test'}>
                <SelectWrapper>
                  <select value={data.langTestType}
                    onChange={(e) => update({ langTestType: e.target.value, langReading: '', langWriting: '', langListening: '', langSpeaking: '' })}
                    className={cn(selectCls, !data.langTestType && 'text-slate-400')}>
                    <option value="" disabled>Select test…</option>
                    {firstTestOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    <option value="none">No test taken yet</option>
                  </select>
                </SelectWrapper>
              </Field>

              {showFirstScores && (
                <Field label="Test date" note="Results expire after 2 years for Express Entry">
                  <Input type="date" value={data.langTestDate}
                    onChange={(e) => update({ langTestDate: e.target.value })}
                    className="max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </Field>
              )}

              {showFirstScores && (
                <LangScoreGrid
                  keys={['langReading', 'langWriting', 'langListening', 'langSpeaking']}
                  values={[data.langReading, data.langWriting, data.langListening, data.langSpeaking]}
                  onChange={(k, v) => update({ [k]: v })}
                />
              )}

              {/* Second official language */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-[#0B1F3A]">
                  Second official language — optional
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Adding a {isEnglishFirst ? 'French' : 'English'} test can add up to{' '}
                  <span className="font-semibold">24 bonus CRS points</span> for bilingualism.
                </p>
                <div className="mt-4 flex flex-col gap-4">
                  <Field label={isEnglishFirst ? 'French test' : 'English test'}>
                    <SelectWrapper>
                      <select value={data.lang2TestType}
                        onChange={(e) => update({
                          lang2TestType: e.target.value,
                          lang2TestDate: '', lang2Reading: '', lang2Writing: '', lang2Listening: '', lang2Speaking: '',
                        })}
                        className={cn(selectCls, !data.lang2TestType && 'text-slate-400')}>
                        <option value="" disabled>Select test…</option>
                        {secondTestOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        <option value="none">No second language test</option>
                      </select>
                    </SelectWrapper>
                  </Field>

                  {showSecondScores && (
                    <Field label="Test date">
                      <Input type="date" value={data.lang2TestDate}
                        onChange={(e) => update({ lang2TestDate: e.target.value })}
                        className="max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                    </Field>
                  )}

                  {showSecondScores && (
                    <LangScoreGrid
                      keys={['lang2Reading', 'lang2Writing', 'lang2Listening', 'lang2Speaking']}
                      values={[data.lang2Reading, data.lang2Writing, data.lang2Listening, data.lang2Speaking]}
                      onChange={(k, v) => update({ [k]: v })}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </Section>

        {/* ── Education ─────────────────────────────────────────────────────── */}
        <Section title="Education" desc="Your highest completed credential. Foreign education needs an ECA for Express Entry.">
          <Field label="Highest education level">
            <SelectWrapper>
              <select value={data.educationLevel} onChange={(e) => update({ educationLevel: e.target.value })}
                className={cn(selectCls, !data.educationLevel && 'text-slate-400')}>
                <option value="" disabled>Select level…</option>
                {educationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </SelectWrapper>
          </Field>

          {data.educationLevel && !['less-than-secondary', 'secondary'].includes(data.educationLevel) && (
            <>
              <Field label="Canadian education" note="+15 or +30 CRS">
                <SelectWrapper>
                  <select value={data.canadianEducation} onChange={(e) => update({ canadianEducation: e.target.value })}
                    className={cn(selectCls, !data.canadianEducation && 'text-slate-400')}>
                    <option value="" disabled>Select…</option>
                    {canadianEducationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </SelectWrapper>
              </Field>

              {(!data.canadianEducation || data.canadianEducation === 'none') && (
                <Field label="ECA (Educational Credential Assessment)" note="Required for foreign education in Express Entry">
                  <SelectWrapper>
                    <select value={data.ecaCompleted} onChange={(e) => update({ ecaCompleted: e.target.value })}
                      className={cn(selectCls, !data.ecaCompleted && 'text-slate-400')}>
                      <option value="" disabled>Select…</option>
                      <option value="yes">Yes — ECA completed</option>
                      <option value="no">No — not yet</option>
                      <option value="in-progress">In progress</option>
                    </select>
                  </SelectWrapper>
                </Field>
              )}
            </>
          )}

          {/* Student-specific education details */}
          {isStudent && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Study permit details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="School name">
                  <Input value={data.schoolName} onChange={(e) => update({ schoolName: e.target.value })}
                    placeholder="e.g. University of Toronto"
                    className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </Field>
                <Field label="DLI number" note="Optional">
                  <Input value={data.dliNumber} onChange={(e) => update({ dliNumber: e.target.value })}
                    placeholder="e.g. O19395641872"
                    className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </Field>
              </div>
              <Field label="Field of study">
                <Input value={data.fieldOfStudy} onChange={(e) => update({ fieldOfStudy: e.target.value })}
                  placeholder="e.g. Computer Science, Nursing"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </Field>
              <Field label="Program level">
                <SelectWrapper>
                  <select value={data.programLevel} onChange={(e) => update({ programLevel: e.target.value })}
                    className={cn(selectCls, !data.programLevel && 'text-slate-400')}>
                    <option value="" disabled>Select level…</option>
                    {programLevelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </SelectWrapper>
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Program start">
                  <Input type="month" value={data.programStartDate}
                    onChange={(e) => update({ programStartDate: e.target.value })}
                    className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </Field>
                <Field label="Program end (expected)">
                  <Input type="month" value={data.programEndDate}
                    onChange={(e) => update({ programEndDate: e.target.value })}
                    className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </Field>
                <Field label="Length (months)">
                  <Input type="number" min={1} max={72} placeholder="e.g. 24"
                    value={data.programLengthMonths} onChange={(e) => update({ programLengthMonths: e.target.value })}
                    className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </Field>
              </div>
              <Field label="Studying full-time?">
                <SelectWrapper>
                  <select value={data.fullTimeStudy} onChange={(e) => update({ fullTimeStudy: e.target.value })}
                    className={cn(selectCls, !data.fullTimeStudy && 'text-slate-400')}>
                    <option value="" disabled>Select…</option>
                    <option value="yes">Yes — full-time</option>
                    <option value="no">No — part-time</option>
                  </select>
                </SelectWrapper>
              </Field>
              {data.fullTimeStudy === 'yes' && (
                <Field label="Any part-time semester?">
                  <SelectWrapper>
                    <select value={data.hadPartTimeSemester}
                      onChange={(e) => update({ hadPartTimeSemester: e.target.value })}
                      className={cn(selectCls, !data.hadPartTimeSemester && 'text-slate-400')}>
                      <option value="" disabled>Select…</option>
                      <option value="no">No — all semesters were full-time</option>
                      <option value="yes">Yes — at least one semester was part-time</option>
                    </select>
                  </SelectWrapper>
                </Field>
              )}
            </>
          )}
        </Section>

        {/* ── Work experience ───────────────────────────────────────────────── */}
        <Section title="Work experience" desc="Used to calculate CRS, CEC eligibility, and FSW score.">
          <Field label="TEER level">
            <SelectWrapper>
              <select value={data.teerLevel} onChange={(e) => update({ teerLevel: e.target.value })}
                className={cn(selectCls, !data.teerLevel && 'text-slate-400')}>
                <option value="" disabled>Select TEER level…</option>
                {teerOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </SelectWrapper>
          </Field>

          <Field label="NOC code" note="5-digit code — optional">
            <Input value={data.noc} onChange={(e) => update({ noc: e.target.value })}
              placeholder="e.g. 21231"
              className="max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Foreign skilled work (years)" note="In last 10 years">
              <Input type="number" min={0} max={10} step={0.5} placeholder="e.g. 3"
                value={data.foreignWorkYears} onChange={(e) => update({ foreignWorkYears: e.target.value })}
                className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
            </Field>

            {(isInside || data.canadianWorkMonths) && (
              <Field label="Canadian skilled work (months)" note="TEER 0–3 only">
                <Input type="number" min={0} max={120} placeholder="e.g. 12"
                  value={data.canadianWorkMonths} onChange={(e) => update({ canadianWorkMonths: e.target.value })}
                  className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </Field>
            )}
          </div>

          {/* Worker-specific fields */}
          {isWorker && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Hourly wage (CAD)" note="Optional">
                <Input value={data.wage} onChange={(e) => update({ wage: e.target.value })}
                  placeholder="e.g. 28.50"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </Field>
              <Field label="Hours per week">
                <Input type="number" min={1} max={80} placeholder="e.g. 40"
                  value={data.hoursPerWeek} onChange={(e) => update({ hoursPerWeek: e.target.value })}
                  className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </Field>
              <Field label="Work start date">
                <Input type="date" value={data.workStartDate}
                  onChange={(e) => update({ workStartDate: e.target.value })}
                  className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </Field>
            </div>
          )}

          <Field label="Valid Canadian job offer">
            <SelectWrapper>
              <select value={data.hasJobOffer} onChange={(e) => update({ hasJobOffer: e.target.value })}
                className={cn(selectCls, !data.hasJobOffer && 'text-slate-400')}>
                <option value="" disabled>Select…</option>
                <option value="yes">Yes — I have a valid job offer</option>
                <option value="no">No job offer</option>
              </select>
            </SelectWrapper>
            <p className="text-xs text-slate-400">
              A job offer no longer adds CRS points as of March 25, 2025. It may still strengthen some PNP streams.
            </p>
          </Field>

          <Field label="Provincial nomination (PNP)" note="+600 CRS if nominated">
            <SelectWrapper>
              <select value={data.pnpNomination} onChange={(e) => update({ pnpNomination: e.target.value })}
                className={cn(selectCls, !data.pnpNomination && 'text-slate-400')}>
                <option value="" disabled>Select…</option>
                <option value="yes">Yes — I have a provincial nomination</option>
                <option value="no">No nomination yet</option>
              </select>
            </SelectWrapper>
          </Field>
        </Section>

        {/* ── Settlement funds (conditional) ───────────────────────────────── */}
        {showSettlement && (
          <Section title="Settlement funds"
            desc="Federal Skilled Worker requires proof of available funds. CEC and most PNP streams do not.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Family size" note="Including yourself">
                <Input type="number" min={1} max={20} placeholder="e.g. 2"
                  value={data.familySize} onChange={(e) => update({ familySize: e.target.value })}
                  className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                {data.familySize && (
                  <p className="text-xs font-semibold text-[#D62828]">
                    FSW minimum: ${requiredFunds.toLocaleString()} CAD for a family of {familySize}
                  </p>
                )}
              </Field>
              <Field label="Available funds (CAD)">
                <Input type="number" min={0} placeholder="e.g. 25000"
                  value={data.settlementFunds} onChange={(e) => update({ settlementFunds: e.target.value })}
                  className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                {fundsOk !== null && (
                  <p className={cn('text-xs font-semibold', fundsOk ? 'text-green-700' : 'text-[#D62828]')}>
                    {fundsOk
                      ? `Meets the FSW minimum of $${requiredFunds.toLocaleString()}`
                      : 'Below FSW minimum — blocks FSW but not CEC or PNP'}
                  </p>
                )}
              </Field>
            </div>
          </Section>
        )}

        {/* ── Background / risk flags ───────────────────────────────────────── */}
        <Section title="Background" desc="These do not affect your CRS score, but flag situations that may need legal review.">
          <RiskField
            label="Have you ever been refused a visa, permit, or entry to Canada or any other country?"
            value={data.previousRefusals}
            onChange={(v) => update({ previousRefusals: v })}
            warningText="Refusals must be disclosed and can affect some PNP streams. A certified consultant can help address them properly."
          />
          <RiskField
            label="Have you ever overstayed a permit or been out of status in Canada?"
            value={data.lostStatus}
            onChange={(v) => update({ lostStatus: v })}
            level="critical"
            warningText="An overstay or status gap can affect admissibility. You may need to restore status before applying. Speaking with a certified consultant is strongly recommended."
          />
          <RiskField
            label="Do you have any criminal convictions, charges, or offences in any country?"
            note="Includes DUI, assault, fraud, drug offences, and other criminal matters."
            value={data.criminalityIssues}
            onChange={(v) => update({ criminalityIssues: v })}
            level="critical"
            warningText="Criminal inadmissibility is a serious barrier. Depending on the offence, rehabilitation or a Temporary Resident Permit may be required. Legal advice is essential."
          />
          <RiskField
            label="Have you ever been subject to a removal or deportation order?"
            value={data.removalOrder}
            onChange={(v) => update({ removalOrder: v })}
            level="critical"
            warningText="A removal order can result in a ban of 1 year, 2 years, or permanently. You likely need Authorization to Return to Canada (ARC). Consult a certified consultant or immigration lawyer."
          />
          <RiskField
            label="Do you have any serious health conditions that may affect admissibility?"
            note="Conditions that may place excessive demand on Canadian health or social services."
            value={data.medicalInadmissibility}
            onChange={(v) => update({ medicalInadmissibility: v })}
            warningText="Medical inadmissibility is assessed by IRCC medical officers. Some conditions can be overcome with certain pathways. A certified consultant can advise."
          />
        </Section>

        {/* ── PR & citizenship details (PR users only) ─────────────────────── */}
        {isPR && (
          <Section title="PR & citizenship details"
            desc="These dates power your citizenship countdown, PR card reminder, and residency obligation tracker.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date you became a PR">
                <Input type="date" value={data.prDate} onChange={(e) => update({ prDate: e.target.value })}
                  className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </Field>
              <Field label="PR card expiry">
                <Input type="month" value={data.prCardExpiry} onChange={(e) => update({ prCardExpiry: e.target.value })}
                  className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </Field>
            </div>

            <Field label="Status in Canada before becoming a PR">
              <SelectWrapper>
                <select value={data.prPreStatus} onChange={(e) => update({ prPreStatus: e.target.value })}
                  className={cn(selectCls, !data.prPreStatus && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  {prPreStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </SelectWrapper>
              <p className="text-xs text-slate-400">
                Temporary resident days before PR may count as half-days toward citizenship (up to 365 days credit).
              </p>
            </Field>

            <Field label="Have you travelled outside Canada since becoming a PR?">
              <SelectWrapper>
                <select value={data.hasTraveledSincePR}
                  onChange={(e) => update({
                    hasTraveledSincePR: e.target.value,
                    ...(e.target.value === 'no'
                      ? { daysOutsideCanada5yr: '', accompanyingCitizenSpouseAbroad: '', workingAbroadForCanadianEmployer: '' }
                      : {}),
                  })}
                  className={cn(selectCls, !data.hasTraveledSincePR && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  <option value="no">No — I have stayed in Canada</option>
                  <option value="yes">Yes — I have had trips outside Canada</option>
                </select>
              </SelectWrapper>
            </Field>

            {data.hasTraveledSincePR === 'yes' && (
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Field label="Total days outside Canada in the last 5 years"
                  note="PRs must be in Canada at least 730 of every 1,825 days">
                  <Input type="number" min={0} max={1825} placeholder="e.g. 120"
                    value={data.daysOutsideCanada5yr}
                    onChange={(e) => update({ daysOutsideCanada5yr: e.target.value })}
                    className="max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                  {data.daysOutsideCanada5yr && (() => {
                    const outside = parseInt(data.daysOutsideCanada5yr) || 0
                    const inside  = 1825 - outside
                    const ok = inside >= 730
                    return (
                      <p className={cn('text-xs font-semibold', ok ? 'text-green-700' : 'text-red-600')}>
                        {inside.toLocaleString()} days in Canada — {ok ? 'obligation met' : 'below the 730-day minimum'}
                      </p>
                    )
                  })()}
                </Field>

                <Field label="Were you accompanying a Canadian citizen spouse or partner abroad?">
                  <SelectWrapper>
                    <select value={data.accompanyingCitizenSpouseAbroad}
                      onChange={(e) => update({ accompanyingCitizenSpouseAbroad: e.target.value })}
                      className={cn(selectCls, !data.accompanyingCitizenSpouseAbroad && 'text-slate-400')}>
                      <option value="" disabled>Select…</option>
                      <option value="no">No — this exemption does not apply</option>
                      <option value="yes">Yes — I was abroad with my Canadian citizen spouse</option>
                    </select>
                  </SelectWrapper>
                </Field>

                <Field label="Were you working outside Canada for a Canadian business or government?">
                  <SelectWrapper>
                    <select value={data.workingAbroadForCanadianEmployer}
                      onChange={(e) => update({ workingAbroadForCanadianEmployer: e.target.value })}
                      className={cn(selectCls, !data.workingAbroadForCanadianEmployer && 'text-slate-400')}>
                      <option value="" disabled>Select…</option>
                      <option value="no">No — this exemption does not apply</option>
                      <option value="yes">Yes — I worked abroad for a Canadian employer or government</option>
                    </select>
                  </SelectWrapper>
                </Field>
              </div>
            )}

            <Field label="Filed Canadian taxes for all required years?"
              note="Required for citizenship application">
              <SelectWrapper>
                <select value={data.taxFilingComplete} onChange={(e) => update({ taxFilingComplete: e.target.value })}
                  className={cn(selectCls, !data.taxFilingComplete && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  <option value="yes">Yes — filed for all required years</option>
                  <option value="partial">Partially — some years filed</option>
                  <option value="no">No — not yet filed</option>
                </select>
              </SelectWrapper>
            </Field>

            <Field label="Do you have proof of English or French language ability?"
              note="Required for citizenship applicants aged 18–54">
              <SelectWrapper>
                <select value={data.citizenshipLangProof}
                  onChange={(e) => update({ citizenshipLangProof: e.target.value })}
                  className={cn(selectCls, !data.citizenshipLangProof && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  <option value="yes">Yes — I have an accepted test or proof</option>
                  <option value="no">No — not yet</option>
                </select>
              </SelectWrapper>
            </Field>

            <Field label="Any criminal charges, removal order, probation, or past citizenship refusal?"
              note="These may affect citizenship eligibility">
              <SelectWrapper>
                <select value={data.citizenshipProhibitions}
                  onChange={(e) => update({ citizenshipProhibitions: e.target.value })}
                  className={cn(selectCls, !data.citizenshipProhibitions && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  <option value="no">No — none of the above apply</option>
                  <option value="yes">Yes — one or more apply</option>
                </select>
              </SelectWrapper>
              {data.citizenshipProhibitions === 'yes' && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-800">
                    These may affect citizenship eligibility. A certified consultant or immigration lawyer can review your specific situation.
                  </p>
                </div>
              )}
            </Field>
          </Section>
        )}

      </div>

      {/* Save */}
      <div className="mt-6 flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}
          className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving…' : 'Save changes'}
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
