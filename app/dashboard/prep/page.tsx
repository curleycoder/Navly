'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, Check, Printer, AlertTriangle, ShieldCheck, Mail, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { loadProfile, statusLabels, goalLabels } from '@/lib/profile'
import { PlanGate } from '@/components/ui/PlanGate'
import { UpgradeBanner } from '@/components/ui/UpgradeBanner'
import { loadTasks } from '@/lib/tasks'
import { calculateScore, type ScoreResult } from '@/lib/scoring'
import { loadPresence, type PresenceData } from '@/lib/presence'
import type { IntakeData } from '@/lib/profile'
import type { Task } from '@/lib/tasks'

const NOTES_KEY = 'navly_prep_notes'

function buildSummaryText(
  profile: IntakeData | null,
  score: ScoreResult | null,
  presence: PresenceData,
  tasks: Task[],
  notes: string
): string {
  const pendingTasks = tasks.filter((t) => !t.done)

  const lines: string[] = [
    'NAVLY — CONSULTATION SUMMARY',
    '─'.repeat(40),
    '',
    'IMMIGRATION PROFILE',
    `Current status:    ${profile ? (statusLabels[profile.status] ?? profile.status) : 'Not provided'}`,
    `Country of origin: ${profile?.originCountry || 'Not provided'}`,
    `Currently in:      ${profile?.currentCountry || 'Not provided'}`,
    `Main goal:         ${profile ? (goalLabels[profile.goal] ?? profile.goal) : 'Not provided'}`,
    ]

  if (score?.hasEnoughData && score.crs) {
    lines.push('', 'PR SCORE ESTIMATE')
    lines.push(`CRS score:         ${score.crs.total} / ~1,200`)
    if (score.fsw) {
      lines.push(`FSW 67-pt grid:    ${score.fsw.score} / 100 (${score.fsw.eligible ? 'passes threshold' : 'below threshold'})`)
    }
    if (score.pathways.length > 0) {
      lines.push('', 'Pathway eligibility:')
      score.pathways.forEach((p) => lines.push(`  ${p.name}: ${p.status} — ${p.reason}`))
    }
    if (score.improvements.length > 0) {
      lines.push('', 'Top improvements:')
      score.improvements.slice(0, 3).forEach((imp) => lines.push(`  • ${imp.label} (${imp.impact})`))
    }
  }

  lines.push(
    '',
    'DAYS IN CANADA',
    `Streak:            ${presence.streak} day${presence.streak !== 1 ? 's' : ''}`,
    `Total days logged: ${presence.totalDays}`,
  )

  if (pendingTasks.length > 0) {
    lines.push('', 'OPEN TASKS')
    pendingTasks.forEach((t) => lines.push(`  ☐ ${t.title}`))
  }

  if (notes.trim()) {
    lines.push('', 'QUESTIONS FOR MY CONSULTANT')
    lines.push(notes.trim())
  }

  lines.push('', '─'.repeat(40))
  lines.push('Note: This summary was created with Navly for organizational purposes only.')
  lines.push('It does not constitute legal advice.')

  return lines.join('\n')
}

export default function PrepPage() {
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [presence, setPresence] = useState<PresenceData>({ totalDays: 0, streak: 0, longestStreak: 0, lastCheckIn: null, arrivalDate: null, travelLog: [] })
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState('')
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    const p = loadProfile()
    setProfile(p)
    if (p) setScore(calculateScore(p))
    setPresence(loadPresence())
    setTasks(loadTasks())
    const saved = localStorage.getItem(NOTES_KEY)
    if (saved) setNotes(saved)
  }, [])

  function handleNotesChange(val: string) {
    setNotes(val)
    localStorage.setItem(NOTES_KEY, val)
  }

  async function copyToClipboard() {
    const text = buildSummaryText(profile, score, presence, tasks, notes)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareByEmail() {
    const text = buildSummaryText(profile, score, presence, tasks, notes)
    const subject = encodeURIComponent('My Immigration Profile — Navly Summary')
    const body = encodeURIComponent(text)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setShared(true)
    setTimeout(() => setShared(false), 3000)
  }

  function downloadTxt() {
    const text = buildSummaryText(profile, score, presence, tasks, notes)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'navly-consultation-summary.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function print() {
    window.print()
  }

  const pendingTasks = tasks.filter((t) => !t.done)

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      {/* Header */}
      <div className="mb-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#D62828]">
          Consultation prep
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">Your consultation summary</h1>
        <p className="mt-2 text-slate-500">
          A clean overview of your situation to bring to a licensed immigration consultant or lawyer.
        </p>
      </div>

      <PlanGate plan="report" fallback={
        <div className="mt-4">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="mb-1 font-semibold text-[#0B1F3A]">Unlock your consultation summary</p>
            <p className="mb-4 text-sm text-slate-500">The full summary — with score breakdown, pathway analysis, and print/export — is included in the Personalized Report.</p>
            <div className="mx-auto max-w-md"><UpgradeBanner plan="report" /></div>
          </div>
        </div>
      }>

      <div className="mb-8 mt-4 flex flex-wrap gap-3 print:hidden">
        <Button
          onClick={copyToClipboard}
          variant="outline"
          className="gap-2 border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy summary'}
        </Button>
        <Button
          onClick={shareByEmail}
          variant="outline"
          className="gap-2 border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white"
        >
          {shared ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          {shared ? 'Email opened!' : 'Share by email'}
        </Button>
        <Button
          onClick={downloadTxt}
          variant="outline"
          className="gap-2 border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white"
        >
          <Download className="h-4 w-4" />
          Download .txt
        </Button>
        <Button
          onClick={print}
          variant="outline"
          className="gap-2 border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      {/* Summary card */}
      <Card className="mb-6 rounded-2xl border-slate-200 bg-white">
        <CardContent className="p-6">

          {/* Profile section */}
          <Section title="Immigration profile">
            {profile ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                <Row label="Current status" value={statusLabels[profile.status] ?? profile.status} />
                <Row label="Country of origin" value={profile.originCountry || '—'} />
                <Row label="Currently in" value={profile.currentCountry || '—'} />
                <Row label="Main goal" value={goalLabels[profile.goal] ?? profile.goal} />
              </dl>
            ) : (
              <p className="text-sm text-slate-400">
                No profile found.{' '}
                <a href="/onboarding" className="font-semibold text-[#D62828] hover:underline">
                  Complete the intake
                </a>{' '}
                to populate this section.
              </p>
            )}
          </Section>

          {/* Score section */}
          {score?.hasEnoughData && score.crs && (
            <>
              <Separator className="my-5" />
              <Section title="PR score estimate">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Row label="CRS score" value={`${score.crs.total} / ~1,200`} />
                  {score.fsw && (
                    <Row
                      label="FSW 67-pt grid"
                      value={`${score.fsw.score} / 100 — ${score.fsw.eligible ? 'passes threshold' : 'below threshold'}`}
                    />
                  )}
                </div>
                {score.pathways.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Pathway eligibility</p>
                    <ul className="flex flex-col gap-1">
                      {score.pathways.map((p) => (
                        <li key={p.id} className="text-sm text-slate-700">
                          <span className="font-semibold text-[#0B1F3A]">{p.name}:</span>{' '}
                          {p.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {score.improvements.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">Top improvements</p>
                    <ul className="flex flex-col gap-1">
                      {score.improvements.slice(0, 3).map((imp, i) => (
                        <li key={i} className="text-sm text-slate-700">
                          •{' '}<span className="font-semibold">{imp.label}</span>{' '}
                          <span className="text-green-700">({imp.impact})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Section>
            </>
          )}

          {/* Days in Canada */}
          <Separator className="my-5" />
          <Section title="Days in Canada">
            <div className="flex gap-6">
              <div>
                <dt className="text-xs text-slate-500">Streak</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[#0B1F3A]">{presence.streak} day{presence.streak !== 1 ? 's' : ''}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Total days logged</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[#0B1F3A]">{presence.totalDays}</dd>
              </div>
            </div>
          </Section>

          {/* Open tasks */}
          {pendingTasks.length > 0 && (
            <>
              <Separator className="my-5" />
              <Section title="Open tasks">
                <ul className="flex flex-col gap-1">
                  {pendingTasks.map((t) => (
                    <li key={t.id} className="text-sm text-slate-700">☐ {t.title}</li>
                  ))}
                </ul>
              </Section>
            </>
          )}

          <Separator className="my-5" />

          {/* Notes */}
          <Section title="Questions for my consultant">
            <Textarea
              placeholder="Write down the questions you want to ask during your consultation…"
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              className="min-h-32 rounded-xl border-slate-200 bg-white text-sm text-[#0B1F3A] placeholder:text-slate-400 focus-visible:ring-[#D62828]"
            />
            <p className="mt-2 text-xs text-slate-400">Your notes are saved automatically.</p>
          </Section>
        </CardContent>
      </Card>

      {/* Consultant Promo */}
      <Card className="mb-6 rounded-2xl border-[#0B1F3A] bg-[#0B1F3A] text-white shadow-lg print:hidden">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Book a certified consultant</h2>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-300">
                Get a professional legal review of your profile before you apply. Navly users get an exclusive discount.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-stretch sm:items-end mt-2 sm:mt-0">
             <Link href="/dashboard/consultants" className="w-full sm:w-auto mt-2">
               <Button className="w-full bg-[#D62828] text-white shadow-md hover:bg-[#B91C1C]">
                  View consultant directory
               </Button>
             </Link>
          </div>
        </CardContent>
      </Card>

      {/* Legal reminder */}
      <div className="flex gap-3 rounded-2xl border border-[#0B1F3A]/15 bg-[#0B1F3A]/5 p-4 print:hidden">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#0B1F3A]" />
        <p className="text-sm leading-6 text-slate-600">
          <span className="font-semibold text-[#0B1F3A]">Reminder: </span>
          This summary is for organizational purposes only. It does not constitute legal advice
          and does not replace a licensed immigration consultant or lawyer.
        </p>
      </div>
      </PlanGate>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-[#0B1F3A]">{value}</dd>
    </div>
  )
}
