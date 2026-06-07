'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight,
  Eye, EyeOff, Loader2, Sun, Moon, Archive, Phone, Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  loadProfile, saveProfile, loadProfileFromSupabase, saveProfileToSupabase,
  EMPTY_PROFILE, type IntakeData,
} from '@/lib/profile'
import { TOP_COUNTRIES, ALL_COUNTRIES, CA_PROVINCES } from '@/lib/geo'
import { supabase } from '@/lib/supabase/client'
import { getRequiredFunds } from '@/lib/settlement-funds'

// ─── Options ─────────────────────────────────────────────────────────────────

const statusOptions = [
  { value: 'student',       label: 'International student' },
  { value: 'work-permit',   label: 'Work permit holder' },
  { value: 'visitor',       label: 'Visitor / tourist' },
  { value: 'refugee',       label: 'Refugee / protected person' },
  { value: 'family-member', label: 'Spouse / family of Canadian or PR' },
  { value: 'out-of-status', label: 'Out of status' },
  { value: 'pr',            label: 'Permanent resident' },
  { value: 'other',         label: 'Other / not sure' },
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
  { value: 'express-entry', label: 'Express Entry / PR' },
  { value: 'study-permit',  label: 'Study permit' },
  { value: 'work-permit',   label: 'Work permit' },
  { value: 'visitor',       label: 'Visitor / tourism' },
  { value: 'family',        label: 'Family sponsorship' },
  { value: 'business',      label: 'Business / investor' },
  { value: 'unsure',        label: 'Not sure yet' },
]
const maritalOptions = [
  { value: 'single',     label: 'Single' },
  { value: 'married',    label: 'Married' },
  { value: 'common-law', label: 'Common-law' },
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
  { value: 'two-credentials',     label: 'Two credentials (one 3+ yrs)' },
  { value: 'masters',             label: "Master's degree" },
  { value: 'doctoral',            label: 'Doctoral / PhD' },
]
const canadianEducationOptions = [
  { value: 'none',        label: 'No Canadian education' },
  { value: '1-2-year',    label: '1–2 year Canadian program' },
  { value: '3-plus-year', label: '3+ year Canadian degree' },
]
const teerOptions = [
  { value: '0', label: 'TEER 0 — Senior management' },
  { value: '1', label: 'TEER 1 — University-level' },
  { value: '2', label: 'TEER 2 — College / 2-yr apprenticeship' },
  { value: '3', label: 'TEER 3 — College / 1-yr apprenticeship' },
  { value: '4', label: 'TEER 4 — High school diploma' },
  { value: '5', label: 'TEER 5 — Short demonstration' },
]
const programLevelOptions = [
  { value: 'certificate', label: 'Certificate' },
  { value: 'diploma',     label: 'College diploma' },
  { value: 'bachelors',   label: "Bachelor's degree" },
  { value: 'masters',     label: "Master's degree" },
  { value: 'doctoral',    label: 'Doctoral / PhD' },
  { value: 'other',       label: 'Other' },
]
const prPreStatusOptions = [
  { value: 'student',   label: 'International student' },
  { value: 'worker',    label: 'Worker (work permit / PGWP)' },
  { value: 'visitor',   label: 'Visitor' },
  { value: 'protected', label: 'Refugee / protected person' },
  { value: 'outside',   label: 'Outside Canada' },
  { value: 'other',     label: 'Other' },
]

const otherCountries = ALL_COUNTRIES.filter((c) => !TOP_COUNTRIES.includes(c))

// ─── Display helpers ──────────────────────────────────────────────────────────

const dv = (val: string | undefined, opts: { value: string; label: string }[]) =>
  val ? (opts.find((o) => o.value === val)?.label ?? val) : null

const yn = (val: string | undefined) =>
  val === 'yes' ? 'Yes' : val === 'no' ? 'No' : null

const scoreLine = (r: string, w: string, l: string, s: string) => {
  if (!r && !w && !l && !s) return null
  return `R: ${r || '—'}  W: ${w || '—'}  L: ${l || '—'}  S: ${s || '—'}`
}

const provinceName = (val: string) =>
  (CA_PROVINCES.find((p) => p.value === val)?.label ?? val) || null

// ─── Shared select style ──────────────────────────────────────────────────────

const selectCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#D62828] focus:border-transparent appearance-none cursor-pointer pr-10 disabled:cursor-not-allowed disabled:opacity-60'

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

function CountrySelect({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string
}) {
  return (
    <SelectWrapper>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={cn(selectCls, !value && 'text-slate-400')}>
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

// ─── UI primitives ────────────────────────────────────────────────────────────

/** WhatsApp-style section group: optional gray label above a white divided card.
 *  Pass `flat` when rendered inside an outer card — renders without its own background/shadow. */
function SettingsGroup({ title, children, flat = false }: { title?: string; children: React.ReactNode; flat?: boolean }) {
  if (flat) {
    return (
      <div className="border-t border-slate-100">
        {title && (
          <p className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        )}
        <div className="divide-y divide-slate-100">{children}</div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-1.5">
      {title && (
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      )}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm divide-y divide-slate-100">
        {children}
      </div>
    </div>
  )
}

/**
 * A single row within a SettingsGroup.
 * - View mode: label (left) + value (right), single line.
 * - Edit mode: label (top, small gray) + children (input/select).
 */
function SettingsRow({ label, value, editing = false, note, children }: {
  label: string
  value?: string | null
  editing?: boolean
  note?: string
  children?: React.ReactNode
}) {
  if (editing && children) {
    return (
      <div className="px-4 py-3.5">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">{label}</span>
          {note && <span className="text-xs text-slate-400">{note}</span>}
        </div>
        {children}
      </div>
    )
  }
  return (
    <div className="flex min-h-[52px] items-center gap-4 px-4 py-2">
      <span className="shrink-0 text-sm text-slate-600">{label}</span>
      <span className="ml-auto text-right text-sm font-medium text-[#0B1F3A] min-w-0 truncate pl-4">
        {value || <span className="text-xs font-normal text-slate-400">Not set</span>}
      </span>
    </div>
  )
}

/** A static info-only row (no value, used for warnings/notes) */
function SettingsNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <p className="text-xs text-amber-700">{children}</p>
    </div>
  )
}

// ─── Confirmation prompt ──────────────────────────────────────────────────────

function ConfirmChange({ label, onConfirm, onCancel }: {
  label: string; onConfirm: () => void; onCancel: () => void
}) {
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

// ─── Risk yes/no row ──────────────────────────────────────────────────────────

function RiskRow({ label, value, onChange, editing, warningText, level = 'warning' }: {
  label: string; value: string; onChange: (v: string) => void
  editing: boolean; warningText?: string; level?: 'warning' | 'critical'
}) {
  return (
    <>
      <SettingsRow label={label} value={yn(value)} editing={editing}>
        <SelectWrapper>
          <select value={value} onChange={(e) => onChange(e.target.value)}
            className={cn(selectCls, !value && 'text-slate-400')}>
            <option value="" disabled>Select…</option>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </SelectWrapper>
      </SettingsRow>
      {value === 'yes' && warningText && (
        <div className={cn(
          'flex items-start gap-2 px-4 py-3',
          level === 'critical' ? 'bg-red-50' : 'bg-amber-50',
        )}>
          <AlertTriangle className={cn('mt-0.5 h-4 w-4 shrink-0', level === 'critical' ? 'text-red-500' : 'text-amber-500')} />
          <p className={cn('text-xs', level === 'critical' ? 'text-red-700' : 'text-amber-700')}>{warningText}</p>
        </div>
      )}
    </>
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
        <div key={key as string} className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold text-slate-500">{labels[i]}</Label>
          <Input
            value={values[i]}
            onChange={(e) => onChange(key, e.target.value)}
            placeholder="—"
            className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]"
          />
        </div>
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

  function reset() {
    setNewPassword(''); setConfirm(''); setError(''); setSuccess(false); setOpen(false)
  }

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
      <button type="button" onClick={() => setOpen(true)}
        className="text-xs font-semibold text-[#D62828] hover:underline">
        Change password
      </button>
    )
  }

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
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
        <Button type="button" variant="outline" size="sm" onClick={reset}
          className="border-slate-200 text-slate-600">
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [data, setData] = useState<IntakeData>({ ...EMPTY_PROFILE })
  const [editingAccount, setEditingAccount] = useState(false)
  const [savingAccount, setSavingAccount] = useState(false)
  const [savedAccount, setSavedAccount] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savedProfile, setSavedProfile] = useState(false)
  const [originalData, setOriginalData] = useState<IntakeData | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [pendingGoal, setPendingGoal] = useState<string | null>(null)

  useEffect(() => {
    const theme = localStorage.getItem('navly_theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      setDarkMode(true)
    }
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

  async function handleSaveAccount() {
    setSavingAccount(true)
    const toSave = { ...data }
    saveProfile(toSave)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await saveProfileToSupabase(user.id, toSave)
    setSavingAccount(false)
    setSavedAccount(true)
    setEditingAccount(false)
    setTimeout(() => setSavedAccount(false), 3000)
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    const toSave = { ...data }
    if (data.lang2TestType === 'tef' || data.lang2TestType === 'tcf') {
      toSave.frenchTestType  = data.lang2TestType
      toSave.frenchReading   = data.lang2Reading
      toSave.frenchWriting   = data.lang2Writing
      toSave.frenchListening = data.lang2Listening
      toSave.frenchSpeaking  = data.lang2Speaking
    } else {
      toSave.frenchTestType = ''; toSave.frenchReading = ''
      toSave.frenchWriting  = ''; toSave.frenchListening = ''
      toSave.frenchSpeaking = ''
    }
    saveProfile(toSave)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await saveProfileToSupabase(user.id, toSave)
    setSavingProfile(false)
    setSavedProfile(true)
    setEditingProfile(false)
    setTimeout(() => setSavedProfile(false), 3000)
  }

  function handleCancelProfile() {
    if (originalData) setData(originalData)
    setEditingProfile(false)
    setPendingStatus(null)
    setPendingGoal(null)
  }

  function toggleDark() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('navly_theme', next ? 'dark' : 'light')
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
  const showSettlement  = isOutside || (isInside && data.status !== 'student' && !isWorker && !isPR)

  const isEnglishFirst   = data.firstOfficialLanguage === 'english'
  const isFrenchFirst    = data.firstOfficialLanguage === 'french'
  const firstTestOptions = isEnglishFirst ? englishTestOptions : isFrenchFirst ? frenchOnlyTestOptions : []
  const secondTestOptions = isEnglishFirst ? frenchOnlyTestOptions : isFrenchFirst ? englishTestOptions : []
  const showFirstScores  = !!data.langTestType  && data.langTestType  !== 'none'
  const showSecondScores = !!data.lang2TestType && data.lang2TestType !== 'none'

  const familySize    = parseInt(data.familySize) || 1
  const requiredFunds = getRequiredFunds(familySize)
  const fundsOk       = data.settlementFunds ? parseFloat(data.settlementFunds) >= requiredFunds : null

  const ep = editingProfile // shorthand

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-6 pb-24 sm:px-6 sm:py-10">

        {/* Back link — desktop only */}
        <Link href="/dashboard"
          className="hidden md:inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#0B1F3A]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>

        {/* ── Profile header ──────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Avatar + identity */}
          <div className="flex flex-col items-center px-6 pb-6 pt-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0B1F3A] text-2xl font-bold text-white shadow-md">
              {data.fullName ? data.fullName.trim()[0].toUpperCase() : '?'}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <p className="text-xl font-bold text-[#0B1F3A]">{data.fullName || 'Your name'}</p>
              <button onClick={() => setEditingAccount(true)} aria-label="Edit name"
                className="text-slate-400 hover:text-[#D62828] transition-colors">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{data.email || 'No email'}</p>
            {data.phone && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                <Phone className="h-3 w-3" />{data.phone}
              </p>
            )}
            {(data.status || data.goal) && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {data.status && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#0B1F3A]">
                    {statusOptions.find(o => o.value === data.status)?.label ?? data.status}
                  </span>
                )}
                {data.goal && (
                  <span className="rounded-full bg-[#D62828]/10 px-3 py-1 text-xs font-semibold text-[#D62828]">
                    {goalOptions.find(o => o.value === data.goal)?.label ?? data.goal}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Edit form — only when editing account */}
          {editingAccount && (
            <div className="border-t border-slate-100 px-4 py-4 flex flex-col gap-4 sm:px-6">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-slate-500">Full name</Label>
                <Input value={data.fullName} onChange={(e) => update({ fullName: e.target.value })}
                  placeholder="e.g. Amara Osei"
                  className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-slate-500">Phone number</Label>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm text-[#0B1F3A]">{data.phone || 'Not set'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-slate-500">Email address</Label>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm text-[#0B1F3A]">{data.email || 'Not set'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-slate-500">Password</Label>
                <PasswordChangeForm />
              </div>
            </div>
          )}

          {/* Save/Cancel — only when editing */}
          {editingAccount && (
            <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-3 sm:px-6">
              <Button onClick={handleSaveAccount} disabled={savingAccount} size="sm"
                className="gap-1.5 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-60">
                {savingAccount && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {savingAccount ? 'Saving…' : 'Save'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditingAccount(false)}
                className="border-slate-200 text-slate-600">
                Cancel
              </Button>
              {savedAccount && (
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Document archive ─────────────────────────────────────────── */}
        <SettingsGroup title="Documents">
          <div className="flex items-center gap-4 px-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <Archive className="h-5 w-5 text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0B1F3A]">Document storage</p>
              <p className="text-xs text-slate-400">Coming soon — permits, ECA letters, test results</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
          </div>
        </SettingsGroup>

        {/* ── App settings ─────────────────────────────────────────────── */}
        <SettingsGroup title="App">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-4 w-4 text-slate-400" /> : <Sun className="h-4 w-4 text-slate-400" />}
              <p className="text-sm font-semibold text-[#0B1F3A]">{darkMode ? 'Dark mode' : 'Light mode'}</p>
            </div>
            <button onClick={toggleDark}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-[#0B1F3A]' : 'bg-slate-200'}`}
              role="switch" aria-checked={darkMode}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <Link href="/terms" className="flex items-center justify-between px-4 py-4">
            <p className="text-sm font-semibold text-[#0B1F3A]">Terms & Conditions</p>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Link>
          <Link href="/privacy" className="flex items-center justify-between px-4 py-4">
            <p className="text-sm font-semibold text-[#0B1F3A]">Privacy Policy</p>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Link>
        </SettingsGroup>

        {/* ── Immigration profile card ──────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Immigration profile
          </p>
          {!editingProfile && (
            <button
              onClick={() => { setOriginalData({ ...data }); setEditingProfile(true) }}
              className="text-sm font-semibold text-[#D62828] hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {/* ── All profile sections ─────────────────────────────────────── */}
        <fieldset disabled={!ep} className="m-0 border-0 p-0">

          {/* Status & Goal */}
          <SettingsGroup title="Status & Goal" flat>
            {isInside && (
              <SettingsRow label="Current status" value={dv(data.status, statusOptions)} editing={ep}>
                <SelectWrapper>
                  <select value={pendingStatus ?? data.status}
                    onChange={(e) => { if (e.target.value !== data.status) setPendingStatus(e.target.value) }}
                    className={cn(selectCls, !data.status && 'text-slate-400')}>
                    <option value="" disabled>Select…</option>
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
              </SettingsRow>
            )}
            {isOutside && (
              <SettingsRow label="Entry plan" value={dv(data.plannedEntry, plannedEntryOptions)} editing={ep}>
                <SelectWrapper>
                  <select value={data.plannedEntry} onChange={(e) => update({ plannedEntry: e.target.value })}
                    className={cn(selectCls, !data.plannedEntry && 'text-slate-400')}>
                    <option value="" disabled>Select…</option>
                    {plannedEntryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </SelectWrapper>
              </SettingsRow>
            )}
            <SettingsRow label="Main goal" value={dv(data.goal, goalOptions)} editing={ep}>
              <SelectWrapper>
                <select value={pendingGoal ?? data.goal}
                  onChange={(e) => { if (e.target.value !== data.goal) setPendingGoal(e.target.value) }}
                  className={cn(selectCls, !data.goal && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
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
            </SettingsRow>
          </SettingsGroup>

          {/* Personal */}
          <SettingsGroup title="Personal details" flat>
            <SettingsRow label="Age" value={data.age ? `${data.age} years old` : null} editing={ep}>
              <Input type="number" min={18} max={80} placeholder="e.g. 29"
                value={data.age} onChange={(e) => update({ age: e.target.value })}
                className="w-full max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
            </SettingsRow>
            <SettingsRow label="Country of citizenship" value={data.originCountry || null} editing={ep}>
              <CountrySelect value={data.originCountry} onChange={(v) => update({ originCountry: v })}
                placeholder="Select country…" />
            </SettingsRow>
            {isOutside && (
              <SettingsRow label="Currently living in" value={data.currentCountry || null} editing={ep}>
                <CountrySelect value={data.currentCountry} onChange={(v) => update({ currentCountry: v })}
                  placeholder="Select country…" />
              </SettingsRow>
            )}
            <SettingsRow label="Marital status" value={dv(data.maritalStatus, maritalOptions)} editing={ep}>
              <SelectWrapper>
                <select value={data.maritalStatus}
                  onChange={(e) => update({ maritalStatus: e.target.value, spouseComing: '' })}
                  className={cn(selectCls, !data.maritalStatus && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  {maritalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </SelectWrapper>
            </SettingsRow>
            {hasPartner && (
              <SettingsRow label="Spouse coming to Canada?" value={yn(data.spouseComing)} editing={ep}>
                <SelectWrapper>
                  <select value={data.spouseComing} onChange={(e) => update({ spouseComing: e.target.value })}
                    className={cn(selectCls, !data.spouseComing && 'text-slate-400')}>
                    <option value="" disabled>Select…</option>
                    <option value="yes">Yes — will accompany me</option>
                    <option value="no">No — applying without them</option>
                  </select>
                </SelectWrapper>
              </SettingsRow>
            )}
            <SettingsRow label="Canadian citizen or PR sibling" note="+15 CRS" value={yn(data.canadianSibling)} editing={ep}>
              <SelectWrapper>
                <select value={data.canadianSibling} onChange={(e) => update({ canadianSibling: e.target.value })}
                  className={cn(selectCls, !data.canadianSibling && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  <option value="yes">Yes — Canadian citizen or PR sibling</option>
                  <option value="no">No</option>
                </select>
              </SelectWrapper>
            </SettingsRow>
          </SettingsGroup>

          {/* Location */}
          <SettingsGroup title="Location & destination" flat>
            {isInside && (
              <SettingsRow label="Province / territory" value={provinceName(data.province)} editing={ep}>
                <SelectWrapper>
                  <select value={data.province} onChange={(e) => update({ province: e.target.value })}
                    className={cn(selectCls, !data.province && 'text-slate-400')}>
                    <option value="" disabled>Select province…</option>
                    {CA_PROVINCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </SelectWrapper>
              </SettingsRow>
            )}
            <SettingsRow label="Intended PR province" value={data.intendedProvince === 'Any' ? 'No preference' : provinceName(data.intendedProvince)} editing={ep}>
              <SelectWrapper>
                <select value={data.intendedProvince} onChange={(e) => update({ intendedProvince: e.target.value })}
                  className={cn(selectCls, !data.intendedProvince && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  <option value="Any">No preference — open to any province</option>
                  {CA_PROVINCES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </SelectWrapper>
            </SettingsRow>
            {isOutside && (
              <SettingsRow label="Arrival timeline" value={dv(data.targetArrivalTimeline, arrivalTimelineOptions)} editing={ep}>
                <SelectWrapper>
                  <select value={data.targetArrivalTimeline}
                    onChange={(e) => update({ targetArrivalTimeline: e.target.value })}
                    className={cn(selectCls, !data.targetArrivalTimeline && 'text-slate-400')}>
                    <option value="" disabled>Select…</option>
                    {arrivalTimelineOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </SelectWrapper>
              </SettingsRow>
            )}
            <SettingsRow label="Plan to live in Quebec?" value={yn(data.quebecIntent)} editing={ep}>
              <SelectWrapper>
                <select value={data.quebecIntent} onChange={(e) => update({ quebecIntent: e.target.value })}
                  className={cn(selectCls, !data.quebecIntent && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  <option value="yes">Yes — settling in Quebec</option>
                  <option value="no">No — outside Quebec</option>
                </select>
              </SelectWrapper>
            </SettingsRow>
          </SettingsGroup>

          {/* Canada dates */}
          {showCanadaDates && (
            <SettingsGroup title="Canada dates" flat>
              <SettingsRow label="Date arrived in Canada" value={data.arrivalDate || null} editing={ep}>
                <Input type="date" max={new Date().toISOString().slice(0, 10)}
                  value={data.arrivalDate} onChange={(e) => update({ arrivalDate: e.target.value })}
                  className="block w-full rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </SettingsRow>
              <SettingsRow label="Permit / visa expiry" value={data.visaExpiryDate || null} editing={ep}>
                <Input type="date" value={data.visaExpiryDate}
                  onChange={(e) => update({ visaExpiryDate: e.target.value })}
                  className="block w-full rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </SettingsRow>
            </SettingsGroup>
          )}

          {/* Spouse / partner */}
          {hasSpouse && (
            <SettingsGroup title="Spouse / partner" flat>
              <SettingsRow label="Spouse's language test" value={dv(data.spouseLangTestType, [...englishTestOptions, ...frenchOnlyTestOptions])} editing={ep}>
                <SelectWrapper>
                  <select value={data.spouseLangTestType}
                    onChange={(e) => update({
                      spouseLangTestType: e.target.value,
                      spouseLangReading: '', spouseLangWriting: '',
                      spouseLangListening: '', spouseLangSpeaking: '',
                    })}
                    className={cn(selectCls, !data.spouseLangTestType && 'text-slate-400')}>
                    <option value="" disabled>Select test…</option>
                    {[...englishTestOptions, ...frenchOnlyTestOptions].map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                    <option value="none">No test taken</option>
                  </select>
                </SelectWrapper>
              </SettingsRow>
              {data.spouseLangTestType && data.spouseLangTestType !== 'none' && (
                <SettingsRow label="Spouse's scores"
                  value={scoreLine(data.spouseLangReading, data.spouseLangWriting, data.spouseLangListening, data.spouseLangSpeaking)}
                  editing={ep}>
                  <LangScoreGrid
                    keys={['spouseLangReading', 'spouseLangWriting', 'spouseLangListening', 'spouseLangSpeaking']}
                    values={[data.spouseLangReading, data.spouseLangWriting, data.spouseLangListening, data.spouseLangSpeaking]}
                    onChange={(k, v) => update({ [k]: v })}
                  />
                </SettingsRow>
              )}
              <SettingsRow label="Spouse's education" value={dv(data.spouseEducationLevel, educationOptions)} editing={ep}>
                <SelectWrapper>
                  <select value={data.spouseEducationLevel}
                    onChange={(e) => update({ spouseEducationLevel: e.target.value })}
                    className={cn(selectCls, !data.spouseEducationLevel && 'text-slate-400')}>
                    <option value="" disabled>Select level…</option>
                    {educationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </SelectWrapper>
              </SettingsRow>
              <SettingsRow label="Spouse's Canadian work" note="TEER 0–3 months"
                value={data.spouseCanadianWorkMonths ? `${data.spouseCanadianWorkMonths} months` : null}
                editing={ep}>
                <Input type="number" min={0} max={120} placeholder="e.g. 0"
                  value={data.spouseCanadianWorkMonths}
                  onChange={(e) => update({ spouseCanadianWorkMonths: e.target.value })}
                  className="w-full max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </SettingsRow>
            </SettingsGroup>
          )}

          {/* Language */}
          <SettingsGroup title="Language tests" flat>
            <SettingsRow label="First official language"
              value={data.firstOfficialLanguage ? data.firstOfficialLanguage.charAt(0).toUpperCase() + data.firstOfficialLanguage.slice(1) : null}
              editing={ep}>
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
            </SettingsRow>

            {(isEnglishFirst || isFrenchFirst) && (
              <>
                <SettingsRow label={isEnglishFirst ? 'English test' : 'French test'}
                  value={dv(data.langTestType, firstTestOptions) ?? (data.langTestType === 'none' ? 'Not taken yet' : null)}
                  editing={ep}>
                  <SelectWrapper>
                    <select value={data.langTestType}
                      onChange={(e) => update({ langTestType: e.target.value, langReading: '', langWriting: '', langListening: '', langSpeaking: '' })}
                      className={cn(selectCls, !data.langTestType && 'text-slate-400')}>
                      <option value="" disabled>Select test…</option>
                      {firstTestOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      <option value="none">No test taken yet</option>
                    </select>
                  </SelectWrapper>
                </SettingsRow>

                {showFirstScores && (
                  <SettingsRow label="Test date" value={data.langTestDate || null} editing={ep}>
                    <Input type="date" value={data.langTestDate}
                      onChange={(e) => update({ langTestDate: e.target.value })}
                      className="w-full max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                  </SettingsRow>
                )}

                {showFirstScores && (
                  <SettingsRow label="Scores"
                    value={scoreLine(data.langReading, data.langWriting, data.langListening, data.langSpeaking)}
                    editing={ep}>
                    <LangScoreGrid
                      keys={['langReading', 'langWriting', 'langListening', 'langSpeaking']}
                      values={[data.langReading, data.langWriting, data.langListening, data.langSpeaking]}
                      onChange={(k, v) => update({ [k]: v })}
                    />
                  </SettingsRow>
                )}

                <SettingsRow label={isEnglishFirst ? 'French test (optional)' : 'English test (optional)'}
                  value={dv(data.lang2TestType, secondTestOptions) ?? (data.lang2TestType === 'none' ? 'None' : null)}
                  editing={ep}>
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
                </SettingsRow>

                {showSecondScores && (
                  <>
                    <SettingsRow label="Second test date" value={data.lang2TestDate || null} editing={ep}>
                      <Input type="date" value={data.lang2TestDate}
                        onChange={(e) => update({ lang2TestDate: e.target.value })}
                        className="w-full max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                    </SettingsRow>
                    <SettingsRow label="Second language scores"
                      value={scoreLine(data.lang2Reading, data.lang2Writing, data.lang2Listening, data.lang2Speaking)}
                      editing={ep}>
                      <LangScoreGrid
                        keys={['lang2Reading', 'lang2Writing', 'lang2Listening', 'lang2Speaking']}
                        values={[data.lang2Reading, data.lang2Writing, data.lang2Listening, data.lang2Speaking]}
                        onChange={(k, v) => update({ [k]: v })}
                      />
                    </SettingsRow>
                  </>
                )}
              </>
            )}
          </SettingsGroup>

          {/* Education */}
          <SettingsGroup title="Education" flat>
            <SettingsRow label="Highest education" value={dv(data.educationLevel, educationOptions)} editing={ep}>
              <SelectWrapper>
                <select value={data.educationLevel} onChange={(e) => update({ educationLevel: e.target.value })}
                  className={cn(selectCls, !data.educationLevel && 'text-slate-400')}>
                  <option value="" disabled>Select level…</option>
                  {educationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </SelectWrapper>
            </SettingsRow>

            {data.educationLevel && !['less-than-secondary', 'secondary'].includes(data.educationLevel) && (
              <>
                <SettingsRow label="Canadian education" note="+15 or +30 CRS"
                  value={dv(data.canadianEducation, canadianEducationOptions)} editing={ep}>
                  <SelectWrapper>
                    <select value={data.canadianEducation} onChange={(e) => update({ canadianEducation: e.target.value })}
                      className={cn(selectCls, !data.canadianEducation && 'text-slate-400')}>
                      <option value="" disabled>Select…</option>
                      {canadianEducationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </SelectWrapper>
                </SettingsRow>

                {(!data.canadianEducation || data.canadianEducation === 'none') && (
                  <SettingsRow label="ECA completed?" note="Required for foreign education"
                    value={data.ecaCompleted === 'yes' ? 'Yes' : data.ecaCompleted === 'no' ? 'No' : data.ecaCompleted === 'in-progress' ? 'In progress' : null}
                    editing={ep}>
                    <SelectWrapper>
                      <select value={data.ecaCompleted} onChange={(e) => update({ ecaCompleted: e.target.value })}
                        className={cn(selectCls, !data.ecaCompleted && 'text-slate-400')}>
                        <option value="" disabled>Select…</option>
                        <option value="yes">Yes — ECA completed</option>
                        <option value="no">No — not yet</option>
                        <option value="in-progress">In progress</option>
                      </select>
                    </SelectWrapper>
                  </SettingsRow>
                )}
              </>
            )}

            {isStudent && (
              <>
                <SettingsRow label="School" value={data.schoolName || null} editing={ep}>
                  <Input value={data.schoolName} onChange={(e) => update({ schoolName: e.target.value })}
                    placeholder="e.g. University of Toronto"
                    className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </SettingsRow>
                <SettingsRow label="DLI number" value={data.dliNumber || null} editing={ep}>
                  <Input value={data.dliNumber} onChange={(e) => update({ dliNumber: e.target.value })}
                    placeholder="e.g. O19395641872"
                    className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </SettingsRow>
                <SettingsRow label="Field of study" value={data.fieldOfStudy || null} editing={ep}>
                  <Input value={data.fieldOfStudy} onChange={(e) => update({ fieldOfStudy: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </SettingsRow>
                <SettingsRow label="Program level" value={dv(data.programLevel, programLevelOptions)} editing={ep}>
                  <SelectWrapper>
                    <select value={data.programLevel} onChange={(e) => update({ programLevel: e.target.value })}
                      className={cn(selectCls, !data.programLevel && 'text-slate-400')}>
                      <option value="" disabled>Select level…</option>
                      {programLevelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </SelectWrapper>
                </SettingsRow>
                <SettingsRow label="Studying full-time?" value={yn(data.fullTimeStudy)} editing={ep}>
                  <SelectWrapper>
                    <select value={data.fullTimeStudy} onChange={(e) => update({ fullTimeStudy: e.target.value })}
                      className={cn(selectCls, !data.fullTimeStudy && 'text-slate-400')}>
                      <option value="" disabled>Select…</option>
                      <option value="yes">Yes — full-time</option>
                      <option value="no">No — part-time</option>
                    </select>
                  </SelectWrapper>
                </SettingsRow>
              </>
            )}
          </SettingsGroup>

          {/* Work */}
          <SettingsGroup title="Work experience" flat>
            <SettingsRow label="TEER level" value={dv(data.teerLevel, teerOptions)} editing={ep}>
              <SelectWrapper>
                <select value={data.teerLevel} onChange={(e) => update({ teerLevel: e.target.value })}
                  className={cn(selectCls, !data.teerLevel && 'text-slate-400')}>
                  <option value="" disabled>Select TEER level…</option>
                  {teerOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </SelectWrapper>
            </SettingsRow>
            <SettingsRow label="NOC code" value={data.noc || null} editing={ep}>
              <Input value={data.noc} onChange={(e) => update({ noc: e.target.value })}
                placeholder="e.g. 21231"
                className="w-full max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
            </SettingsRow>
            <SettingsRow label="Foreign skilled work" note="last 10 yrs"
              value={data.foreignWorkYears ? `${data.foreignWorkYears} years` : null} editing={ep}>
              <Input type="number" min={0} max={10} step={0.5} placeholder="e.g. 3"
                value={data.foreignWorkYears} onChange={(e) => update({ foreignWorkYears: e.target.value })}
                className="w-full max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
            </SettingsRow>
            {(isInside || data.canadianWorkMonths) && (
              <SettingsRow label="Canadian skilled work" note="TEER 0–3"
                value={data.canadianWorkMonths ? `${data.canadianWorkMonths} months` : null} editing={ep}>
                <Input type="number" min={0} max={120} placeholder="e.g. 12"
                  value={data.canadianWorkMonths} onChange={(e) => update({ canadianWorkMonths: e.target.value })}
                  className="w-full max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </SettingsRow>
            )}
            {isWorker && (
              <>
                <SettingsRow label="Hourly wage (CAD)" value={data.wage ? `$${data.wage}/hr` : null} editing={ep}>
                  <Input value={data.wage} onChange={(e) => update({ wage: e.target.value })}
                    placeholder="e.g. 28.50"
                    className="w-full max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </SettingsRow>
                <SettingsRow label="Hours per week"
                  value={data.hoursPerWeek ? `${data.hoursPerWeek} hrs/week` : null} editing={ep}>
                  <Input type="number" min={1} max={80} placeholder="e.g. 40"
                    value={data.hoursPerWeek} onChange={(e) => update({ hoursPerWeek: e.target.value })}
                    className="w-full max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </SettingsRow>
                <SettingsRow label="Work start date" value={data.workStartDate || null} editing={ep}>
                  <Input type="date" value={data.workStartDate}
                    onChange={(e) => update({ workStartDate: e.target.value })}
                    className="block w-full rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                </SettingsRow>
              </>
            )}
            <SettingsRow label="Canadian job offer" value={yn(data.hasJobOffer)} editing={ep}>
              <SelectWrapper>
                <select value={data.hasJobOffer} onChange={(e) => update({ hasJobOffer: e.target.value })}
                  className={cn(selectCls, !data.hasJobOffer && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  <option value="yes">Yes — valid job offer</option>
                  <option value="no">No job offer</option>
                </select>
              </SelectWrapper>
            </SettingsRow>
            <SettingsRow label="Provincial nomination" note="+600 CRS" value={yn(data.pnpNomination)} editing={ep}>
              <SelectWrapper>
                <select value={data.pnpNomination} onChange={(e) => update({ pnpNomination: e.target.value })}
                  className={cn(selectCls, !data.pnpNomination && 'text-slate-400')}>
                  <option value="" disabled>Select…</option>
                  <option value="yes">Yes — I have a provincial nomination</option>
                  <option value="no">No nomination yet</option>
                </select>
              </SelectWrapper>
            </SettingsRow>
          </SettingsGroup>

          {/* Settlement */}
          {showSettlement && (
            <SettingsGroup title="Settlement funds" flat>
              <SettingsRow label="Family size" note="including yourself"
                value={data.familySize ? `${data.familySize} people` : null} editing={ep}>
                <Input type="number" min={1} max={20} placeholder="e.g. 2"
                  value={data.familySize} onChange={(e) => update({ familySize: e.target.value })}
                  className="w-full max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </SettingsRow>
              <SettingsRow label="Available funds (CAD)"
                value={data.settlementFunds ? `$${Number(data.settlementFunds).toLocaleString()}` : null}
                editing={ep}>
                <div className="flex flex-col gap-1.5">
                  <Input type="number" min={0} placeholder="e.g. 25000"
                    value={data.settlementFunds} onChange={(e) => update({ settlementFunds: e.target.value })}
                    className="rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                  {fundsOk !== null && (
                    <p className={cn('text-xs font-semibold', fundsOk ? 'text-green-700' : 'text-[#D62828]')}>
                      {fundsOk
                        ? `Meets the FSW minimum of $${requiredFunds.toLocaleString()}`
                        : `Below FSW minimum ($${requiredFunds.toLocaleString()}) — blocks FSW but not CEC or PNP`}
                    </p>
                  )}
                </div>
              </SettingsRow>
            </SettingsGroup>
          )}

          {/* Background */}
          <SettingsGroup title="Background checks" flat>
            <RiskRow label="Any past visa or entry refusals?" value={data.previousRefusals} onChange={(v) => update({ previousRefusals: v })} editing={ep}
              warningText="Refusals must be disclosed and can affect some PNP streams. A certified consultant can help." />
            <RiskRow label="Ever overstayed or lost status in Canada?" value={data.lostStatus} onChange={(v) => update({ lostStatus: v })} editing={ep}
              level="critical"
              warningText="A status gap can affect admissibility. You may need to restore status before applying." />
            <RiskRow label="Any criminal convictions or charges?" value={data.criminalityIssues} onChange={(v) => update({ criminalityIssues: v })} editing={ep}
              level="critical"
              warningText="Criminal inadmissibility is a serious barrier. Legal advice is essential." />
            <RiskRow label="Ever subject to a removal or deportation order?" value={data.removalOrder} onChange={(v) => update({ removalOrder: v })} editing={ep}
              level="critical"
              warningText="A removal order can result in a multi-year ban. Consult a certified consultant or immigration lawyer." />
            <RiskRow label="Any serious health conditions affecting admissibility?" value={data.medicalInadmissibility} onChange={(v) => update({ medicalInadmissibility: v })} editing={ep}
              warningText="Medical inadmissibility is assessed by IRCC medical officers. A consultant can advise." />
          </SettingsGroup>

          {/* PR & citizenship */}
          {isPR && (
            <SettingsGroup title="PR & citizenship" flat>
              <SettingsRow label="Date became a PR" value={data.prDate || null} editing={ep}>
                <Input type="date" value={data.prDate} onChange={(e) => update({ prDate: e.target.value })}
                  className="block w-full rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </SettingsRow>
              <SettingsRow label="PR card expiry" value={data.prCardExpiry || null} editing={ep}>
                <Input type="month" value={data.prCardExpiry} onChange={(e) => update({ prCardExpiry: e.target.value })}
                  className="block w-full rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
              </SettingsRow>
              <SettingsRow label="Status before becoming PR" value={dv(data.prPreStatus, prPreStatusOptions)} editing={ep}>
                <SelectWrapper>
                  <select value={data.prPreStatus} onChange={(e) => update({ prPreStatus: e.target.value })}
                    className={cn(selectCls, !data.prPreStatus && 'text-slate-400')}>
                    <option value="" disabled>Select…</option>
                    {prPreStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </SelectWrapper>
              </SettingsRow>
              <SettingsRow label="Travelled outside Canada since PR?" value={yn(data.hasTraveledSincePR)} editing={ep}>
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
                    <option value="no">No — stayed in Canada</option>
                    <option value="yes">Yes — trips outside Canada</option>
                  </select>
                </SelectWrapper>
              </SettingsRow>
              {data.hasTraveledSincePR === 'yes' && (
                <SettingsRow label="Days outside Canada (last 5 yrs)" note="min 730 days inside required"
                  value={data.daysOutsideCanada5yr ? `${data.daysOutsideCanada5yr} days outside` : null}
                  editing={ep}>
                  <div className="flex flex-col gap-1.5">
                    <Input type="number" min={0} max={1825} placeholder="e.g. 120"
                      value={data.daysOutsideCanada5yr}
                      onChange={(e) => update({ daysOutsideCanada5yr: e.target.value })}
                      className="w-full max-w-xs rounded-xl border-slate-200 focus-visible:ring-[#D62828]" />
                    {data.daysOutsideCanada5yr && (() => {
                      const outside = parseInt(data.daysOutsideCanada5yr) || 0
                      const inside  = 1825 - outside
                      const ok = inside >= 730
                      return (
                        <p className={cn('text-xs font-semibold', ok ? 'text-green-700' : 'text-red-600')}>
                          {inside.toLocaleString()} days in Canada — {ok ? 'obligation met' : 'below 730-day minimum'}
                        </p>
                      )
                    })()}
                  </div>
                </SettingsRow>
              )}
              <SettingsRow label="Filed taxes for required years?" value={data.taxFilingComplete === 'yes' ? 'Yes' : data.taxFilingComplete === 'partial' ? 'Partial' : data.taxFilingComplete === 'no' ? 'No' : null} editing={ep}>
                <SelectWrapper>
                  <select value={data.taxFilingComplete} onChange={(e) => update({ taxFilingComplete: e.target.value })}
                    className={cn(selectCls, !data.taxFilingComplete && 'text-slate-400')}>
                    <option value="" disabled>Select…</option>
                    <option value="yes">Yes — all required years</option>
                    <option value="partial">Partially — some years</option>
                    <option value="no">No — not yet</option>
                  </select>
                </SelectWrapper>
              </SettingsRow>
              <SettingsRow label="Language proof for citizenship?" value={yn(data.citizenshipLangProof)} editing={ep}>
                <SelectWrapper>
                  <select value={data.citizenshipLangProof}
                    onChange={(e) => update({ citizenshipLangProof: e.target.value })}
                    className={cn(selectCls, !data.citizenshipLangProof && 'text-slate-400')}>
                    <option value="" disabled>Select…</option>
                    <option value="yes">Yes — accepted test or proof</option>
                    <option value="no">No — not yet</option>
                  </select>
                </SelectWrapper>
              </SettingsRow>
              <SettingsRow label="Any citizenship prohibitions?" value={yn(data.citizenshipProhibitions)} editing={ep}>
                <SelectWrapper>
                  <select value={data.citizenshipProhibitions}
                    onChange={(e) => update({ citizenshipProhibitions: e.target.value })}
                    className={cn(selectCls, !data.citizenshipProhibitions && 'text-slate-400')}>
                    <option value="" disabled>Select…</option>
                    <option value="no">No — none apply</option>
                    <option value="yes">Yes — one or more apply</option>
                  </select>
                </SelectWrapper>
              </SettingsRow>
              {data.citizenshipProhibitions === 'yes' && (
                <SettingsNote>
                  These may affect citizenship eligibility. A certified consultant or immigration lawyer can review your situation.
                </SettingsNote>
              )}
            </SettingsGroup>
          )}

        </fieldset>

        {/* Save / Cancel bar */}
        {editingProfile && (
          <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4">
            <Button onClick={handleSaveProfile} disabled={savingProfile} size="sm"
              className="gap-1.5 bg-[#D62828] text-white hover:bg-[#B91C1C] disabled:opacity-60">
              {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {savingProfile ? 'Saving…' : 'Save changes'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancelProfile}
              className="border-slate-200 text-slate-600">
              Cancel
            </Button>
            {savedProfile && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved
              </span>
            )}
          </div>
        )}

        </div>{/* end immigration profile card */}


      </div>
    </div>
  )
}
