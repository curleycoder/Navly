'use client'

import { useEffect, useState } from 'react'
import { Download, AlertTriangle, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react'
import { loadProfile, statusLabels, type IntakeData } from '@/lib/profile'
import { calculateScore, type ScoreResult } from '@/lib/scoring'
import { matchPNPStreams, type PNPStream } from '@/lib/pnp'
import { getLatestCutoff } from '@/lib/draws'
import { usePlan, hasReport } from '@/lib/subscription'

const CUTOFF = getLatestCutoff().cutoff
const CUTOFF_DATE = getLatestCutoff().date

function timelineEstimate(crs: number, hasData: boolean): string {
  if (!hasData) return 'Complete your profile to get a timeline estimate.'
  const gap = CUTOFF - crs
  if (gap <= 0) return 'Your score is at or above the last draw cutoff. Create or update your Express Entry profile now.'
  if (gap <= 20) return 'You are close to the cutoff. With a targeted improvement (language or work experience), you could be invitation-ready within 1–3 months.'
  if (gap <= 60) return 'With consistent effort on the roadmap steps below, you could reach a competitive score in 3–9 months.'
  if (gap <= 120) return 'Your path to a competitive score is 9–18 months. Focus on language improvement and accumulating Canadian work experience first.'
  return 'Reaching a competitive Express Entry score will likely take 18+ months. Consider Provincial Nominee Programs or other pathways that may have lower score requirements.'
}

function clbLabel(n: number | null): string {
  if (!n) return '—'
  return `CLB ${n}`
}

// ─── Report content ───────────────────────────────────────────────────────────

function ReportContent({ profile, score, pnp }: {
  profile: IntakeData
  score: ScoreResult
  pnp: PNPStream[]
}) {
  const today = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  const eligiblePnp = pnp.filter(s => s.status === 'eligible')
  const possiblePnp = pnp.filter(s => s.status === 'possible')
  const topPathways = score.pathways
    .filter(p => p.status === 'eligible' || p.status === 'possible')
    .slice(0, 3)
  const gap = score.crs ? CUTOFF - score.crs.total : null

  return (
    <div className="report-body mx-auto max-w-3xl space-y-8 px-6 py-8 text-sm text-gray-800">

      {/* ── Header ── */}
      <div className="flex items-start justify-between border-b border-gray-200 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">Navly</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">PR Readiness Report</h1>
          <p className="mt-1 text-xs text-gray-500">
            Generated {today} · Based on data entered by the applicant
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p className="font-semibold text-gray-800">{profile.fullName || 'Applicant'}</p>
          {profile.email && <p>{profile.email}</p>}
          <p>{statusLabels[profile.status ?? ''] ?? profile.locationStatus}</p>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <span className="font-bold">Planning tool only.</span> This report is based on information entered by the applicant. It is not legal advice, not an eligibility determination, and does not guarantee any immigration outcome. For legal advice, consult a certified Canadian immigration consultant (RCIC) or immigration lawyer.
      </div>

      {/* ── Express Entry Scores ── */}
      <section>
        <h2 className="mb-4 text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Express Entry Scores</h2>

        {score.crs && score.crs.total > 0 ? (
          <div className="grid grid-cols-2 gap-6">
            {/* CRS breakdown */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">CRS Breakdown</p>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Age', score.crs.age],
                    ['Education', score.crs.education],
                    ['First language', score.crs.firstLanguage],
                    ['Second language', score.crs.secondLanguage],
                    ['Canadian work experience', score.crs.canadianExperience],
                    ['Skill transferability', score.crs.skillTransferability],
                    ['Spouse / partner factors', score.crs.spouseFactors],
                    ['Additional points', score.crs.additional],
                  ].map(([label, val]) => (
                    <tr key={label as string}>
                      <td className="py-1.5 text-gray-600">{label}</td>
                      <td className="py-1.5 text-right font-semibold text-gray-900">{val}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300">
                    <td className="py-2 font-bold text-gray-900">Total CRS</td>
                    <td className="py-2 text-right text-lg font-bold text-red-600">{score.crs.total}</td>
                  </tr>
                </tbody>
              </table>
              <div className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${gap !== null && gap <= 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                Last draw cutoff: <span className="font-bold">{CUTOFF}</span> ({CUTOFF_DATE})
                {gap !== null && gap > 0 && <span className="ml-2">· {gap} points below cutoff</span>}
                {gap !== null && gap <= 0 && <span className="ml-2">· At or above cutoff</span>}
              </div>
            </div>

            {/* FSW + Language */}
            <div className="space-y-4">
              {score.fsw && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">FSW 67-Point Grid</p>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {[
                        ['Language', score.fsw.breakdown.language],
                        ['Education', score.fsw.breakdown.education],
                        ['Work experience', score.fsw.breakdown.workExperience],
                        ['Age', score.fsw.breakdown.age],
                        ['Adaptability', score.fsw.breakdown.adaptability],
                      ].map(([label, val]) => (
                        <tr key={label as string}>
                          <td className="py-1 text-gray-600">{label}</td>
                          <td className="py-1 text-right font-semibold text-gray-900">{val}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300">
                        <td className="py-1.5 font-bold text-gray-900">Total / 100</td>
                        <td className={`py-1.5 text-right font-bold ${score.fsw.eligible ? 'text-green-600' : 'text-amber-600'}`}>
                          {score.fsw.score} {score.fsw.eligible ? '✓ Meets 67-pt minimum' : '· Below 67-pt minimum'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {score.clb && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Language (CLB)</p>
                  <div className="grid grid-cols-4 gap-1 text-center text-xs">
                    {(['r','w','l','s'] as const).map(skill => (
                      <div key={skill} className="rounded-lg border border-gray-100 bg-gray-50 py-2">
                        <p className="font-bold text-gray-500 uppercase">{skill}</p>
                        <p className="mt-0.5 font-bold text-gray-900">{clbLabel(score.clb![skill])}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-center text-xs text-gray-500">Reading · Writing · Listening · Speaking</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Not enough profile data to calculate Express Entry scores. Complete your language, education, and work sections.</p>
        )}
      </section>

      {/* ── Top PR Pathways ── */}
      <section>
        <h2 className="mb-4 text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Top PR Pathways</h2>
        {topPathways.length > 0 ? (
          <div className="space-y-3">
            {topPathways.map((p, i) => (
              <div key={p.id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${p.status === 'eligible' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {p.status === 'eligible' ? 'Appears to match' : 'Possible'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">{p.reason}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No matching pathways found based on current profile data. Complete your profile for accurate results.</p>
        )}

        {score.pathways.filter(p => p.status === 'not-yet').length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Not ready yet</p>
            <div className="space-y-2">
              {score.pathways.filter(p => p.status === 'not-yet').map(p => (
                <div key={p.id} className="flex items-start gap-2 text-xs text-gray-500">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span><span className="font-semibold text-gray-700">{p.name}</span> — {p.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── PNP Province Match ── */}
      <section>
        <h2 className="mb-4 text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Province-by-Province PNP Match</h2>
        {eligiblePnp.length === 0 && possiblePnp.length === 0 ? (
          <p className="text-gray-500 italic">No PNP streams matched your current profile. Add NOC, province preference, and work details to improve matching.</p>
        ) : (
          <div className="space-y-4">
            {eligiblePnp.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-600">Appears to match</p>
                <div className="space-y-2">
                  {eligiblePnp.map(s => (
                    <div key={s.id} className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{s.province} — {s.streamName}</p>
                          <p className="mt-0.5 text-xs text-gray-600">{s.reason}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Match</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {possiblePnp.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-600">Worth exploring</p>
                <div className="space-y-2">
                  {possiblePnp.map(s => (
                    <div key={s.id} className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                      <p className="font-semibold text-gray-900">{s.province} — {s.streamName}</p>
                      <p className="mt-0.5 text-xs text-gray-600">{s.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Gap Analysis & Risk Flags ── */}
      <section>
        <h2 className="mb-4 text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Gap Analysis</h2>
        {score.missingFields.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Missing profile data</p>
            <div className="flex flex-wrap gap-2">
              {score.missingFields.map(f => (
                <span key={f} className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{f}</span>
              ))}
            </div>
          </div>
        )}
        {score.riskFlags.length > 0 && (
          <div className="space-y-2">
            {score.riskFlags.map((flag, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 ${flag.level === 'critical' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
                <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${flag.level === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                <p className={`text-xs ${flag.level === 'critical' ? 'text-red-800' : 'text-amber-800'}`}>
                  <span className="font-bold">{flag.level === 'critical' ? 'Important: ' : 'Note: '}</span>
                  {flag.message}
                </p>
              </div>
            ))}
          </div>
        )}
        {score.missingFields.length === 0 && score.riskFlags.length === 0 && (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-sm font-semibold">No critical gaps or risk flags found.</p>
          </div>
        )}
      </section>

      {/* ── Score Improvement Roadmap ── */}
      {score.improvements.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Score Improvement Roadmap</h2>
          <div className="space-y-3">
            {score.improvements.map((imp, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{imp.label}</p>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">{imp.impact}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">{imp.action}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Timeline Estimate ── */}
      <section>
        <h2 className="mb-3 text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Timeline Estimate</h2>
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
          <p className="text-sm text-gray-700">{timelineEstimate(score.crs?.total ?? 0, score.hasEnoughData)}</p>
        </div>
        <p className="mt-2 text-xs text-gray-400">Timeline is an estimate only. Actual draw cutoffs vary. Monitor IRCC Express Entry draws regularly.</p>
      </section>

      {/* ── Footer ── */}
      <div className="border-t border-gray-200 pt-6 text-xs text-gray-400 space-y-1">
        <p>Generated by Navly · navly.app · {today}</p>
        <p>This report is for personal planning only. It is not legal advice and does not constitute an immigration assessment. Always consult a Regulated Canadian Immigration Consultant (RCIC) or licensed immigration lawyer before submitting any application.</p>
        <p>Navly does not guarantee accuracy of scores or pathway eligibility. Immigration rules change frequently — verify all information with official IRCC sources at canada.ca.</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const { plan, loading } = usePlan()
  const [profile, setProfile] = useState<IntakeData | null>(null)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [pnp, setPnp] = useState<PNPStream[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    const p = loadProfile()
    setProfile(p)
    if (p) {
      const s = calculateScore(p)
      setScore(s)
      setPnp(matchPNPStreams(p))
    }
    setDataLoaded(true)
  }, [])

  if (loading || !dataLoaded) return null

  if (!hasReport(plan)) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-navly-red">Readiness Report</p>
        <h1 className="mb-3 text-2xl font-bold text-heading">Your full PR snapshot</h1>
        <p className="mb-6 text-sm text-muted-text">
          CRS breakdown, top pathways, PNP province match, gap analysis, and a personalized improvement roadmap — delivered as a PDF you can share with a consultant.
        </p>
        <div className="space-y-3">
          <a
            href="/pricing"
            className="flex w-full items-center justify-between rounded-2xl border border-navly-navy bg-navly-navy px-5 py-4 text-left transition hover:bg-navly-navy/90"
          >
            <div>
              <p className="font-bold text-white">Readiness Report — $69.99</p>
              <p className="mt-0.5 text-xs text-white/60">One-time · no subscription</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-white/60" />
          </a>
          <a
            href="/pricing"
            className="flex w-full items-center justify-between rounded-2xl border border-subtle bg-surface-card px-5 py-4 text-left transition hover:border-navly-red/30"
          >
            <div>
              <p className="font-bold text-heading">PR Tracker — $14.99/mo</p>
              <p className="mt-0.5 text-xs text-muted-text">Includes the report + live tracking + AI assistant</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-text/40" />
          </a>
        </div>
      </div>
    )
  }

  if (!profile || !score) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 text-center">
        <p className="font-semibold text-heading">No profile found</p>
        <p className="mt-2 text-sm text-muted-text">Complete your profile first to generate your report.</p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .report-body, .report-body * { visibility: visible; }
          .report-body { position: absolute; inset: 0; margin: 0; padding: 24px; max-width: none; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Download bar */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-subtle bg-surface-card px-6 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-navly-red">Navly</p>
          <p className="font-semibold text-heading">PR Readiness Report</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-navly-red px-4 py-2 text-sm font-bold text-white transition hover:bg-navly-red/80"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      <ReportContent profile={profile} score={score} pnp={pnp} />
    </>
  )
}
