'use client'

import { useEffect, useState } from 'react'
import type { ConsultantListing } from '@/lib/consultants'
import { loadProfile, statusLabels, goalLabels, type IntakeData } from '@/lib/profile'
import { calculateScore, type ScoreResult } from '@/lib/scoring'
import { loadPresence, type PresenceData } from '@/lib/presence'
import { loadTasks, type Task } from '@/lib/tasks'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  ShieldCheck, MapPin, Globe, Briefcase, ExternalLink, Star, Loader2,
  Copy, Check, Mail, Download, Printer, AlertTriangle, TrendingUp, Target, Lock,
  Scale, DollarSign,
} from 'lucide-react'
import { usePlan, hasPlan } from '@/lib/subscription'
import { UpgradeModal } from '@/components/ui/UpgradeModal'
import { useLocale } from '@/lib/i18n'

const NOTES_KEY = 'navly_prep_notes'

// ─── Summary text builder ────────────────────────────────────────────────────

function buildSummaryText(profile: IntakeData | null, score: ScoreResult | null, presence: PresenceData, tasks: Task[], notes: string): string {
  const pendingTasks = tasks.filter((t) => !t.done)
  const lines: string[] = [
    'NAVLY — CONSULTATION SUMMARY', '─'.repeat(40), '',
    'IMMIGRATION PROFILE',
    `Current status:    ${profile ? (statusLabels[profile.status] ?? profile.status) : 'Not provided'}`,
    `Country of origin: ${profile?.originCountry || 'Not provided'}`,
    `Currently in:      ${profile?.currentCountry || 'Not provided'}`,
    `Main goal:         ${profile ? (goalLabels[profile.goal] ?? profile.goal) : 'Not provided'}`,
  ]
  if (score?.hasEnoughData && score.crs) {
    lines.push('', 'PR SCORE ESTIMATE', `CRS score: ${score.crs.total} / ~1,200`)
    if (score.fsw) lines.push(`FSW 67-pt grid: ${score.fsw.score} / 100 (${score.fsw.eligible ? 'passes' : 'below threshold'})`)
    if (score.pathways.length > 0) {
      lines.push('', 'Pathway eligibility:')
      score.pathways.forEach((p) => lines.push(`  ${p.name}: ${p.status} — ${p.reason}`))
    }
    if (score.improvements.length > 0) {
      lines.push('', 'Top improvements:')
      score.improvements.slice(0, 3).forEach((imp) => lines.push(`  • ${imp.label} (${imp.impact})`))
    }
  }
  lines.push('', 'DAYS IN CANADA', `Streak: ${presence.streak} day${presence.streak !== 1 ? 's' : ''}`, `Total: ${presence.totalDays}`)
  if (pendingTasks.length > 0) {
    lines.push('', 'OPEN TASKS')
    pendingTasks.forEach((t) => lines.push(`  ☐ ${t.title}`))
  }
  if (notes.trim()) { lines.push('', 'QUESTIONS FOR MY CONSULTANT', notes.trim()) }
  lines.push('', '─'.repeat(40), 'Note: This summary was created with Navly for organizational purposes only. Not legal advice.')
  return lines.join('\n')
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-text">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-heading">{value}</dd>
    </div>
  )
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 t-eyebrow text-muted-text/70">{title}</h3>
      {children}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ConsultantsPage() {
  const { t } = useLocale()
  // Profile / checklist state
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [presence, setPresence] = useState<PresenceData>({ totalDays: 0, streak: 0, longestStreak: 0, lastCheckIn: null, lastAcknowledgedDate: null, arrivalDate: null, travelLog: [] })
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState('')
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { plan } = usePlan()
  const isPaid = hasPlan(plan, 'tracker')

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
    await navigator.clipboard.writeText(buildSummaryText(profile, score, presence, tasks, notes))
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  function shareByEmail() {
    const text = buildSummaryText(profile, score, presence, tasks, notes)
    window.location.href = `mailto:?subject=${encodeURIComponent('My Immigration Profile — Navly Summary')}&body=${encodeURIComponent(text)}`
    setShared(true); setTimeout(() => setShared(false), 3000)
  }

  function downloadTxt() {
    const blob = new Blob([buildSummaryText(profile, score, presence, tasks, notes)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'navly-consultation-summary.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const pendingTasks = tasks.filter((t) => !t.done)

  return (
    <>
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">


      {/* ── 2. Consultation checklist ── */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="mb-1 t-section-title">{t('consultants.checklistTitle')}</h2>
            <p className="text-sm text-muted-text">{t('consultants.checklistDesc')}</p>
          </div>
          {!isPaid && (
            <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <Lock className="h-3 w-3" /> Report required
            </span>
          )}
        </div>

        {isPaid ? (
          <>
            {/* Export actions */}
            <div className="mb-1 flex flex-wrap gap-2 print:hidden">
              {[
                { label: copied ? 'Copied!' : 'Copy', icon: copied ? Check : Copy, action: copyToClipboard },
                { label: shared ? 'Opened!' : 'Email', icon: shared ? Check : Mail, action: shareByEmail },
                { label: 'Download', icon: Download, action: downloadTxt },
                { label: 'Print', icon: Printer, action: () => window.print() },
              ].map(({ label, icon: Icon, action }) => (
                <Button key={label} onClick={action} variant="outline" size="sm" className="gap-1.5 border-subtle text-muted-text hover:border-navly-navy hover:text-heading">
                  <Icon className="h-3.5 w-3.5" />{label}
                </Button>
              ))}
            </div>

            <Card className="rounded-2xl border-subtle bg-surface-card">
              <CardContent className="p-5 sm:p-6">
                {profile ? (
                  <>
                    <div className="mb-5 grid gap-3 sm:grid-cols-3">
                      <div className="flex items-center gap-3 rounded-xl border border-subtle bg-surface-alt p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navly-navy/8">
                          <Briefcase className="h-3.5 w-3.5 text-heading" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-text">Status</p>
                          <p className="truncate t-section-title">{statusLabels[profile.status] ?? profile.status}</p>
                        </div>
                      </div>
                      {score?.hasEnoughData && score.crs && (
                        <div className="flex items-center gap-3 rounded-xl border border-subtle bg-surface-alt p-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navly-red/10">
                            <TrendingUp className="h-3.5 w-3.5 text-navly-red" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-text">CRS Score</p>
                            <p className="t-section-title">{score.crs.total}</p>
                          </div>
                        </div>
                      )}
                      {score?.pathways?.[0] && (
                        <div className="flex items-center gap-3 rounded-xl border border-subtle bg-surface-alt p-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                            <Target className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-text">Top pathway</p>
                            <p className="truncate t-section-title">{score.pathways[0].name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Separator className="mb-5" />
                  </>
                ) : (
                  <p className="mb-5 text-sm text-muted-text/70">
                    <a href="/onboarding" className="font-semibold text-navly-red hover:underline">Complete your profile</a> to populate this summary.
                  </p>
                )}
                <SummarySection title="Immigration profile">
                  {profile ? (
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <SummaryRow label="Current status" value={statusLabels[profile.status] ?? profile.status} />
                      <SummaryRow label="Country of origin" value={profile.originCountry || '—'} />
                      <SummaryRow label="Currently in" value={profile.currentCountry || '—'} />
                      <SummaryRow label="Main goal" value={goalLabels[profile.goal] ?? profile.goal} />
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-text/70">No profile found. <a href="/onboarding" className="font-semibold text-navly-red hover:underline">Complete the intake</a> to populate this.</p>
                  )}
                </SummarySection>

                {score?.hasEnoughData && score.crs && (
                  <>
                    <Separator className="my-5" />
                    <SummarySection title="PR score estimate">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <SummaryRow label="CRS score" value={`${score.crs.total} / ~1,200`} />
                        {score.fsw && <SummaryRow label="FSW 67-pt grid" value={`${score.fsw.score} / 100 — ${score.fsw.eligible ? 'passes' : 'below threshold'}`} />}
                      </div>
                      {score.pathways.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-1.5 t-eyebrow text-muted-text/70">Pathway eligibility</p>
                          <ul className="flex flex-col gap-1">
                            {score.pathways.map((p) => (
                              <li key={p.id} className="text-sm text-muted-text"><span className="font-semibold text-heading">{p.name}:</span> {p.reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {score.improvements.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-1.5 t-eyebrow text-muted-text/70">Top improvements</p>
                          <ul className="flex flex-col gap-1">
                            {score.improvements.slice(0, 3).map((imp, i) => (
                              <li key={i} className="text-sm text-muted-text">• <span className="font-semibold">{imp.label}</span> <span className="text-green-700">({imp.impact})</span></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </SummarySection>
                  </>
                )}

                <Separator className="my-5" />
                <SummarySection title="Days in Canada">
                  <div className="flex gap-6">
                    <div><dt className="text-xs text-muted-text">Streak</dt><dd className="mt-0.5 text-sm font-semibold text-heading">{presence.streak} day{presence.streak !== 1 ? 's' : ''}</dd></div>
                    <div><dt className="text-xs text-muted-text">Total logged</dt><dd className="mt-0.5 text-sm font-semibold text-heading">{presence.totalDays}</dd></div>
                  </div>
                </SummarySection>

                {pendingTasks.length > 0 && (
                  <>
                    <Separator className="my-5" />
                    <SummarySection title="Open tasks">
                      <ul className="flex flex-col gap-1">
                        {pendingTasks.map((t) => <li key={t.id} className="text-sm text-muted-text">☐ {t.title}</li>)}
                      </ul>
                    </SummarySection>
                  </>
                )}

                <Separator className="my-5" />
                <SummarySection title="Questions for my consultant">
                  <Textarea
                    placeholder="Write down the questions you want to ask during your consultation…"
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    className="min-h-28 rounded-xl border-subtle bg-surface-card text-sm text-heading placeholder:text-muted-text/70 focus-visible:ring-navly-red"
                  />
                  <p className="mt-2 text-xs text-muted-text/70">Your notes are saved automatically.</p>
                </SummarySection>
              </CardContent>
            </Card>

            <div className="mt-3 flex gap-3 rounded-xl border border-navly-navy/10 bg-navly-navy/5 p-3 print:hidden">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-heading" />
              <p className="text-xs leading-5 text-muted-text">
                This summary is for organizational purposes only. It does not constitute legal advice and does not replace a licensed immigration consultant or lawyer.
              </p>
            </div>
          </>
        ) : (
          /* Locked state for free users */
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-subtle bg-surface-alt px-6 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Lock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-heading">Unlock your consultation checklist</p>
              <p className="mt-1 text-sm text-muted-text">Get PR Tracker to copy, email, download, or print your full profile summary.</p>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-navly-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navly-navy/80 transition-colors"
            >
              Get PR Tracker — $14.99/month
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Consultant directory ── */}
      <div className="flex flex-col gap-4">
        <p className="text-xs text-muted-text/70">
          Consultants are independent professionals. Navly does not provide immigration consulting services.
        </p>

        {/* Immigration consultants */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navly-navy/8">
              <ShieldCheck className="h-5 w-5 text-heading" />
            </div>
            <div>
              <h2 className="mt-2 t-section-title">Immigration Consultants</h2>
              <p className="text-xs text-muted-text">Certified RCICs for PR applications, permits, and pathway advice</p>
            </div>
          </div>

          <div className="rounded-2xl border border-subtle bg-surface-card p-6">
            <div className="mb-2 flex flex-wrap gap-2">
              {['Express Entry', 'Canadian Experience Class', 'PNP streams', 'Work permits', 'Study permits', 'PR applications'].map((tag) => (
                <span key={tag} className="rounded-md bg-subtle px-2.5 py-1 text-xs font-semibold text-muted-text">{tag}</span>
              ))}
            </div>
            <p className="mb-4 text-sm text-muted-text">
              Regulated Canadian Immigration Consultants (RCICs) are authorized to advise and represent you in immigration matters. They can review your eligibility, help prepare applications, and guide you through PR pathways.
            </p>
            <div className="rounded-xl border border-subtle bg-surface-alt px-4 py-3 text-sm font-semibold text-muted-text">
              Immigration consultant listings coming soon — we&apos;re vetting certified RCICs across Canada.
            </div>
          </div>
        </div>{/* end immigration consultants */}

        {/* Legal advisors */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
              <Scale className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="mt-2 t-section-title">Legal Advisors</h2>
              <p className="text-xs text-muted-text">Immigration lawyers for refusals, appeals, sponsorships, and complex cases</p>
            </div>
          </div>
          <div className="rounded-2xl border border-subtle bg-surface-card p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {['Refusal appeals', 'Inadmissibility', 'Sponsorship disputes', 'Judicial review', 'Refugee claims', 'PGWP issues'].map((tag) => (
                <span key={tag} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{tag}</span>
              ))}
            </div>
            <p className="mb-4 text-sm text-muted-text">
              Immigration lawyers are licensed to give legal advice and represent you before the Immigration and Refugee Board. They handle high-stakes and complex situations that go beyond what an RCIC can do.
            </p>
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm font-semibold text-blue-700">
              Legal advisor listings coming soon — we&apos;re vetting qualified immigration lawyers across Canada.
            </div>
          </div>
        </div>

        {/* Financial advisors */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="mt-2 t-section-title">Financial Advisors</h2>
              <p className="text-xs text-muted-text">Newcomer-focused advisors for settlement funds, tax, and banking</p>
            </div>
          </div>
          <div className="rounded-2xl border border-subtle bg-surface-card p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              {['Settlement funds planning', 'Newcomer banking', 'Tax filing (T1)', 'RRSP & TFSA setup', 'Credit building', 'Investment accounts'].map((tag) => (
                <span key={tag} className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{tag}</span>
              ))}
            </div>
            <p className="mb-4 text-sm text-muted-text">
              Financial advisors who specialize in newcomers can help you navigate Canadian banking, meet IRCC settlement fund requirements, file your first tax return, and start building credit in Canada.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-emerald-700">
              Financial advisor listings coming soon — we&apos;re partnering with newcomer-focused financial professionals.
            </div>
          </div>
        </div>

      </div>{/* end directory */}
    </div>

    {showUpgradeModal && (
      <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
    )}
    </>
  )
}
