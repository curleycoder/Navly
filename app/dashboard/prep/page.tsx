'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, Printer, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { loadProfile, statusLabels, goalLabels, timelineLabels } from '@/lib/profile'
import { loadDocuments, docCounts } from '@/lib/documents'
import { loadTasks } from '@/lib/tasks'
import type { IntakeData } from '@/lib/profile'
import type { Document } from '@/lib/documents'
import type { Task } from '@/lib/tasks'

const NOTES_KEY = 'navly_prep_notes'

function buildSummaryText(
  profile: IntakeData | null,
  docs: Document[],
  tasks: Task[],
  notes: string
): string {
  const counts = docCounts(docs)
  const pendingTasks = tasks.filter((t) => !t.done)
  const missingDocs = docs.filter((d) => d.status === 'missing')
  const expiringDocs = docs.filter((d) => d.status === 'expiring')

  const lines: string[] = [
    'NAVLY — CONSULTATION SUMMARY',
    '─'.repeat(40),
    '',
    'IMMIGRATION PROFILE',
    `Current status:   ${profile ? (statusLabels[profile.status] ?? profile.status) : 'Not provided'}`,
    `Country of origin: ${profile?.originCountry || 'Not provided'}`,
    `Currently in:     ${profile?.currentCountry || 'Not provided'}`,
    `Main goal:        ${profile ? (goalLabels[profile.goal] ?? profile.goal) : 'Not provided'}`,
    `Timeline:         ${profile ? (timelineLabels[profile.timeline] ?? profile.timeline) : 'Not provided'}`,
    '',
    'DOCUMENTS',
    `${counts.ready} of ${counts.total} ready  |  ${counts.expiring} expiring  |  ${counts.missing} missing`,
  ]

  if (missingDocs.length > 0) {
    lines.push('', 'Still needed:')
    missingDocs.forEach((d) => lines.push(`  • ${d.name}`))
  }

  if (expiringDocs.length > 0) {
    lines.push('', 'Expiring soon:')
    expiringDocs.forEach((d) => lines.push(`  • ${d.name}`))
  }

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
  const [docs, setDocs] = useState<Document[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setProfile(loadProfile())
    setDocs(loadDocuments())
    setTasks(loadTasks())
    const saved = localStorage.getItem(NOTES_KEY)
    if (saved) setNotes(saved)
  }, [])

  function handleNotesChange(val: string) {
    setNotes(val)
    localStorage.setItem(NOTES_KEY, val)
  }

  async function copyToClipboard() {
    const text = buildSummaryText(profile, docs, tasks, notes)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function print() {
    window.print()
  }

  const counts = docCounts(docs)
  const pendingTasks = tasks.filter((t) => !t.done)
  const missingDocs = docs.filter((d) => d.status === 'missing')
  const expiringDocs = docs.filter((d) => d.status === 'expiring')

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

      <div className="mb-8 mt-4 flex gap-3 print:hidden">
        <Button
          onClick={copyToClipboard}
          variant="outline"
          className="gap-2 border-[#0B1F3A] text-[#0B1F3A] hover:bg-[#0B1F3A] hover:text-white"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy summary'}
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
                <Row label="Timeline" value={timelineLabels[profile.timeline] ?? profile.timeline} />
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

          <Separator className="my-5" />

          {/* Documents section */}
          <Section title="Documents">
            <p className="mb-3 text-sm text-slate-600">
              <span className="font-semibold text-green-600">{counts.ready} ready</span>
              {' · '}
              <span className="font-semibold text-amber-500">{counts.expiring} expiring</span>
              {' · '}
              <span className="font-semibold text-slate-500">{counts.missing} missing</span>
              {' of '}
              {counts.total} total
            </p>
            {missingDocs.length > 0 && (
              <div className="mb-3">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Still needed</p>
                <ul className="flex flex-col gap-1">
                  {missingDocs.map((d) => (
                    <li key={d.id} className="text-sm text-slate-700">• {d.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {expiringDocs.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-500">Expiring soon</p>
                <ul className="flex flex-col gap-1">
                  {expiringDocs.map((d) => (
                    <li key={d.id} className="text-sm text-amber-700">• {d.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {missingDocs.length === 0 && expiringDocs.length === 0 && (
              <p className="text-sm text-slate-400">All documents accounted for.</p>
            )}
          </Section>

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

          {/* Notes / questions */}
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

      {/* Legal reminder */}
      <div className="flex gap-3 rounded-2xl border border-[#0B1F3A]/15 bg-[#0B1F3A]/5 p-4 print:hidden">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#0B1F3A]" />
        <p className="text-sm leading-6 text-slate-600">
          <span className="font-semibold text-[#0B1F3A]">Reminder: </span>
          This summary is for organizational purposes only. It does not constitute legal advice
          and does not replace a licensed immigration consultant or lawyer.
        </p>
      </div>
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
