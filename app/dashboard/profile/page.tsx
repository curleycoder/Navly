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

const langTestOptions = [
  { value: 'ielts-general', label: 'IELTS General Training' },
  { value: 'celpip', label: 'CELPIP-General' },
  { value: 'pte', label: 'PTE Core' },
  { value: 'tef', label: 'TEF Canada (French)' },
  { value: 'tcf', label: 'TCF Canada (French)' },
  { value: 'none', label: 'Not taken yet' },
]

const frenchTestOptions = [
  { value: 'tef', label: 'TEF Canada' },
  { value: 'tcf', label: 'TCF Canada' },
  { value: 'none', label: 'Not taken' },
]

const educationOptions = [
  { value: 'less-than-secondary', label: 'Less than high school' },
  { value: 'secondary', label: 'High school diploma' },
  { value: '1-year', label: '1-year post-secondary' },
  { value: '2-year', label: '2-year post-secondary' },
  { value: 'bachelors', label: "Bachelor's degree (3+ years)" },
  { value: 'two-credentials', label: 'Two post-secondary credentials (one 3+ years)' },
  { value: 'masters', label: "Master's degree" },
  { value: 'doctoral', label: 'Doctoral degree (PhD)' },
]

const canadianEducationOptions = [
  { value: 'none', label: 'No Canadian education' },
  { value: '1-2-year', label: '1–2 year Canadian program' },
  { value: '3-plus-year', label: '3+ year Canadian degree or graduate program' },
]

const teerOptions = [
  { value: '0', label: 'TEER 0 — Senior management' },
  { value: '1', label: 'TEER 1 — University-level (CLB 7+ usually required)' },
  { value: '2', label: 'TEER 2 — College diploma / 2-year apprenticeship' },
  { value: '3', label: 'TEER 3 — College diploma / 1-year apprenticeship' },
  { value: '4', label: 'TEER 4 — High school diploma' },
  { value: '5', label: 'TEER 5 — Short demonstration' },
]

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

  function reset() {
    setNewPassword('')
    setConfirm('')
    setError('')
    setSuccess(false)
    setOpen(false)
  }

  async function handleChange() {
    setError('')
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setSuccess(true)
    setTimeout(reset, 2000)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-[#D62828] hover:underline"
      >
        Change
      </button>
    )
  }

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold text-slate-600">New password</Label>
        <div className="relative">
          <Input
            type={showNew ? 'text' : 'password'}
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError('') }}
            className="rounded-xl border-slate-200 pr-10 text-sm focus-visible:ring-[#D62828]"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold text-slate-600">Confirm new password</Label>
        <div className="relative">
          <Input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleChange()}
            className="rounded-xl border-slate-200 pr-10 text-sm focus-visible:ring-[#D62828]"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
          >
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
        <Button
          onClick={handleChange}
          disabled={!newPassword || !confirm || loading}
          size="sm"
          className="gap-1.5 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-40"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {loading ? 'Saving…' : 'Update password'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={reset}
          className="border-slate-200 text-slate-600"
        >
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

  // Pending confirmation state for sensitive dropdowns
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [pendingGoal, setPendingGoal] = useState<string | null>(null)
  const [pendingCountry, setPendingCountry] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      // Load localStorage immediately for fast display
      const local = loadProfile()
      if (local) setData(local)

      // Sync from Supabase (source of truth) — overwrites localStorage if newer
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const remote = await loadProfileFromSupabase(user.id)
        if (remote) setData(remote)
      }

      setLoaded(true)
    }
    load()
  }, [])

  const inCanada = data.currentCountry === 'Canada'

  async function handleSave() {
    setSaving(true)
    saveProfile(data) // localStorage — instant
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await saveProfileToSupabase(user.id, data)
    }
    setSaving(false)
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
          <Field label="Full name">
            <Input
              value={data.fullName}
              onChange={(e) => update({ fullName: e.target.value })}
              placeholder="e.g. Amara Osei"
              className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
            />
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

          <Field label="Country of citizenship" note="Your legal nationality">
            <SelectWrapper>
              <select
                value={data.citizenship}
                onChange={(e) => update({ citizenship: e.target.value })}
                className={cn(selectCls, !data.citizenship && 'text-slate-400')}
              >
                <option value="" disabled>Select citizenship…</option>
                <optgroup label="Common source countries">
                  {TOP_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
                <optgroup label="All countries">
                  {otherCountries.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
              </select>
            </SelectWrapper>
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

          <Field label="Do you intend to live in Quebec?" note="Quebec has separate immigration programs">
            <SelectWrapper>
              <select
                value={data.quebecIntent}
                onChange={(e) => update({ quebecIntent: e.target.value })}
                className={cn(selectCls, !data.quebecIntent && 'text-slate-400')}
              >
                <option value="" disabled>Select…</option>
                <option value="yes">Yes — I plan to settle in Quebec</option>
                <option value="no">No — outside Quebec</option>
              </select>
            </SelectWrapper>
          </Field>
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

        {/* ── Language ──────────────────────────────────────────────────────── */}
        <Section title="Language — first official" desc="Your primary test results used to calculate CLB and CRS scores.">
          <Field label="Test type">
            <SelectWrapper>
              <select
                value={data.langTestType}
                onChange={(e) => update({ langTestType: e.target.value })}
                className={cn(selectCls, !data.langTestType && 'text-slate-400')}
              >
                <option value="">Select test…</option>
                {langTestOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>

          {data.langTestType && data.langTestType !== 'none' && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(['langReading', 'langWriting', 'langListening', 'langSpeaking'] as const).map((key) => (
                <Field key={key} label={key.replace('lang', '').charAt(0).toUpperCase() + key.replace('lang', '').slice(1)}>
                  <Input
                    value={data[key]}
                    onChange={(e) => update({ [key]: e.target.value })}
                    placeholder="—"
                    className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
                  />
                </Field>
              ))}
            </div>
          )}
        </Section>

        {/* ── French (second official language) ─────────────────────────────── */}
        <Section title="Language — French (optional)" desc="If you have taken TEF Canada or TCF Canada, add your scores to claim up to 50 additional CRS points.">
          <Field label="French test type">
            <SelectWrapper>
              <select
                value={data.frenchTestType}
                onChange={(e) => update({ frenchTestType: e.target.value })}
                className={cn(selectCls, !data.frenchTestType && 'text-slate-400')}
              >
                <option value="">Select French test…</option>
                {frenchTestOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>

          {data.frenchTestType && data.frenchTestType !== 'none' && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(['frenchReading', 'frenchWriting', 'frenchListening', 'frenchSpeaking'] as const).map((key) => (
                <Field key={key} label={key.replace('french', '').charAt(0).toUpperCase() + key.replace('french', '').slice(1)}>
                  <Input
                    value={data[key]}
                    onChange={(e) => update({ [key]: e.target.value })}
                    placeholder="—"
                    className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
                  />
                </Field>
              ))}
            </div>
          )}
        </Section>

        {/* ── Education ─────────────────────────────────────────────────────── */}
        <Section title="Education" desc="Your highest completed credential. Required for CRS and FSW scoring.">
          <Field label="Highest education level">
            <SelectWrapper>
              <select
                value={data.educationLevel}
                onChange={(e) => update({ educationLevel: e.target.value })}
                className={cn(selectCls, !data.educationLevel && 'text-slate-400')}
              >
                <option value="" disabled>Select level…</option>
                {educationOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>

          <Field label="Canadian education">
            <SelectWrapper>
              <select
                value={data.canadianEducation}
                onChange={(e) => update({ canadianEducation: e.target.value })}
                className={cn(selectCls, !data.canadianEducation && 'text-slate-400')}
              >
                <option value="" disabled>Select…</option>
                {canadianEducationOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>

          <Field label="ECA completed" note="Educational Credential Assessment">
            <SelectWrapper>
              <select
                value={data.ecaCompleted}
                onChange={(e) => update({ ecaCompleted: e.target.value })}
                className={cn(selectCls, !data.ecaCompleted && 'text-slate-400')}
              >
                <option value="" disabled>Select…</option>
                <option value="yes">Yes — ECA completed</option>
                <option value="no">No — not completed</option>
                <option value="in-progress">In progress</option>
              </select>
            </SelectWrapper>
          </Field>

          <Field label="Study budget (CAD / year)" note="If planning to study in Canada">
            <Input
              value={data.studyBudget}
              onChange={(e) => update({ studyBudget: e.target.value })}
              placeholder="e.g. 30000"
              className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
            />
          </Field>
        </Section>

        {/* ── Work experience ───────────────────────────────────────────────── */}
        <Section title="Work experience" desc="Used to calculate CRS, CEC eligibility, and FSW score.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Foreign skilled work (years)">
              <Input
                value={data.foreignWorkYears}
                onChange={(e) => update({ foreignWorkYears: e.target.value })}
                placeholder="e.g. 3"
                className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
              />
            </Field>
            <Field label="Canadian skilled work (months)">
              <Input
                value={data.canadianWorkMonths}
                onChange={(e) => update({ canadianWorkMonths: e.target.value })}
                placeholder="e.g. 12"
                className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
              />
            </Field>
          </div>

          <Field label="NOC code" note="Optional — leave blank if unknown">
            <Input
              value={data.noc}
              onChange={(e) => update({ noc: e.target.value })}
              placeholder="e.g. 21232"
              className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
            />
          </Field>

          <Field label="TEER level">
            <SelectWrapper>
              <select
                value={data.teerLevel}
                onChange={(e) => update({ teerLevel: e.target.value })}
                className={cn(selectCls, !data.teerLevel && 'text-slate-400')}
              >
                <option value="" disabled>Select TEER level…</option>
                {teerOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SelectWrapper>
          </Field>

          <Field label="Valid Canadian job offer">
            <SelectWrapper>
              <select
                value={data.hasJobOffer}
                onChange={(e) => update({ hasJobOffer: e.target.value })}
                className={cn(selectCls, !data.hasJobOffer && 'text-slate-400')}
              >
                <option value="" disabled>Select…</option>
                <option value="yes">Yes — I have a valid job offer</option>
                <option value="no">No job offer</option>
              </select>
            </SelectWrapper>
          </Field>

          <Field label="Provincial nomination (PNP)" note="+600 CRS if nominated">
            <SelectWrapper>
              <select
                value={data.pnpNomination}
                onChange={(e) => update({ pnpNomination: e.target.value })}
                className={cn(selectCls, !data.pnpNomination && 'text-slate-400')}
              >
                <option value="" disabled>Select…</option>
                <option value="yes">Yes — I have a provincial nomination</option>
                <option value="no">No nomination</option>
              </select>
            </SelectWrapper>
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Hourly wage (CAD)" note="Optional">
              <Input
                value={data.wage}
                onChange={(e) => update({ wage: e.target.value })}
                placeholder="e.g. 28.50"
                className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
              />
            </Field>
            <Field label="Hours per week" note="Optional">
              <Input
                value={data.hoursPerWeek}
                onChange={(e) => update({ hoursPerWeek: e.target.value })}
                placeholder="e.g. 40"
                className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
              />
            </Field>
            <Field label="Work start date" note="Optional">
              <Input
                type="date"
                value={data.workStartDate}
                onChange={(e) => update({ workStartDate: e.target.value })}
                className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
              />
            </Field>
          </div>
        </Section>

        {/* ── Family ties ───────────────────────────────────────────────────── */}
        <Section title="Family ties in Canada" desc="Family connections can add CRS points and open additional pathways.">
          <Field label="Canadian citizen or PR sibling">
            <SelectWrapper>
              <select
                value={data.canadianSibling}
                onChange={(e) => update({ canadianSibling: e.target.value })}
                className={cn(selectCls, !data.canadianSibling && 'text-slate-400')}
              >
                <option value="" disabled>Select…</option>
                <option value="yes">Yes — I have a sibling who is Canadian citizen or PR</option>
                <option value="no">No</option>
              </select>
            </SelectWrapper>
          </Field>

          <Field label="Parent or child sponsor" note="Canadian citizen or PR parent/child who could sponsor you">
            <SelectWrapper>
              <select
                value={data.parentOrChildSponsor}
                onChange={(e) => update({ parentOrChildSponsor: e.target.value })}
                className={cn(selectCls, !data.parentOrChildSponsor && 'text-slate-400')}
              >
                <option value="" disabled>Select…</option>
                <option value="yes">Yes — I have a parent or child in Canada who could sponsor</option>
                <option value="no">No</option>
              </select>
            </SelectWrapper>
          </Field>
        </Section>

        {/* ── Settlement funds ──────────────────────────────────────────────── */}
        <Section title="Settlement funds" desc="Required for the Federal Skilled Worker pathway.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Family size">
              <Input
                value={data.familySize}
                onChange={(e) => update({ familySize: e.target.value })}
                placeholder="e.g. 2"
                className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
              />
            </Field>
            <Field label="Available funds (CAD)">
              <Input
                value={data.settlementFunds}
                onChange={(e) => update({ settlementFunds: e.target.value })}
                placeholder="e.g. 25000"
                className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
              />
            </Field>
          </div>
        </Section>

      </div>

      {/* Save */}
      <div className="mt-6 flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-60"
        >
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
