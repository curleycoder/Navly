/**
 * News & Policy Updates
 *
 * Schema matches what the real database table will look like.
 * To go live: replace mockUpdates with a fetch from your DB/API.
 * Cron job (Vercel/Supabase/GitHub Actions) should run 1–2x per day,
 * pull official IRCC RSS feeds, and upsert into this table.
 *
 * Official sources:
 *   IRCC Newsroom: https://www.canada.ca/en/immigration-refugees-citizenship/news.html
 *   IRCC Notices:  https://www.canada.ca/en/immigration-refugees-citizenship/news/notices.html
 *   IRCC RSS:      https://www.canada.ca/en/immigration-refugees-citizenship/news/rss.html
 *   Canada Gazette:https://gazette.gc.ca/rss/sc-rb-eng.html
 */

export type NewsCategory =
  | 'study'
  | 'work'
  | 'pr'
  | 'express-entry'
  | 'pnp'
  | 'visitor'
  | 'family'
  | 'refugee'
  | 'general'

export type NewsImportance = 'low' | 'medium' | 'high'

export type NewsSourceName =
  | 'IRCC'
  | 'IRCC Notices'
  | 'Express Entry'
  | 'Canada Gazette'
  | 'CIC News'
  | 'CanadaVisa'

export type NewsSourceType = 'official' | 'third_party'

export type NewsUpdate = {
  id: string
  title: string
  summary: string
  sourceUrl: string
  sourceName: NewsSourceName
  sourceType: NewsSourceType  // 'official' = government source; 'third_party' = news/commentary
  publishedAt: string         // ISO date string 'YYYY-MM-DD' or full ISO timestamp
  category: NewsCategory
  importance: NewsImportance
  affectedUsers: string[]     // matches IntakeData.status or IntakeData.goal values
}

export const categoryLabels: Record<NewsCategory, string> = {
  study: 'Study',
  work: 'Work',
  pr: 'PR',
  'express-entry': 'Express Entry',
  pnp: 'PNP',
  visitor: 'Visitor',
  family: 'Family',
  refugee: 'Refugee / Asylum',
  general: 'General',
}

export const categoryColors: Record<NewsCategory, string> = {
  study:          'bg-blue-50 text-blue-700 border-blue-100',
  work:           'bg-violet-50 text-violet-700 border-violet-100',
  pr:             'bg-emerald-50 text-emerald-700 border-emerald-100',
  'express-entry':'bg-emerald-50 text-emerald-700 border-emerald-100',
  pnp:            'bg-teal-50 text-teal-700 border-teal-100',
  visitor:        'bg-slate-100 text-slate-600 border-slate-200',
  family:         'bg-pink-50 text-pink-700 border-pink-100',
  refugee:        'bg-orange-50 text-orange-700 border-orange-100',
  general:        'bg-slate-100 text-slate-600 border-slate-200',
}

export const importanceDot: Record<NewsImportance, string> = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-slate-300',
}

// ─── Fallback data — real verified IRCC policy changes ───────────────────────
// These are shown when the Supabase DB is empty or unavailable.
// The cron job at /api/cron/news fetches live items from canada.ca RSS feeds
// and upserts them into the immigration_news table — these are only a safety net.
// Sources: canada.ca/en/immigration-refugees-citizenship/news and /notices

export const mockUpdates: NewsUpdate[] = [
  {
    id: 'cicnews-ee-french-draw-409-2026-05-28',
    title: 'French-speaking Express Entry candidates receive invitations at higher CRS cut-off',
    summary:
      'IRCC issued 4,500 Invitations to Apply (ITAs) in a French-language-proficiency Express Entry draw on May 28, 2026. The minimum CRS cut-off for this draw was 409. To be considered, candidates needed a CRS score of at least 409 and a valid Express Entry profile with French language proficiency. French-speaking candidates continue to receive dedicated draws separate from all-program rounds.',
    sourceUrl: 'https://www.cicnews.com/',
    sourceName: 'CIC News',
    sourceType: 'third_party',
    publishedAt: '2026-05-28',
    category: 'express-entry',
    importance: 'high',
    affectedUsers: ['express-entry', 'pr'],
  },
  {
    id: 'cicnews-work-permit-wait-times-2026-05-28',
    title: 'Work permit wait times are on the rise, latest IRCC data shows',
    summary:
      'IRCC updated its processing time estimates on May 26, 2026, covering work permits, study permits, visitor visas, and super visas. Improvements to wait times have been modest, with many countries seeing stagnant or notably increased timelines for work permit applications. Applicants should check the IRCC processing times tool for their specific country before planning travel or employment start dates.',
    sourceUrl: 'https://www.cicnews.com/',
    sourceName: 'CIC News',
    sourceType: 'third_party',
    publishedAt: '2026-05-28',
    category: 'work',
    importance: 'high',
    affectedUsers: ['work-permit', 'student'],
  },
  {
    id: 'cicnews-pr-residency-obligation-traps-2026-05-28',
    title: 'Maintaining your Canadian PR status: The residency obligation traps that catch new permanent residents',
    summary:
      'Permanent residents can lose PR status through simple misunderstandings of the residency obligation. The rule requires 730 days physically inside Canada in every rolling 5-year period. Common traps include counting days incorrectly, assuming employment abroad with a Canadian company counts automatically, and not realising that time spent outside Canada with a Canadian citizen spouse only applies in specific circumstances. New PRs should track their travel carefully from day one.',
    sourceUrl: 'https://www.cicnews.com/',
    sourceName: 'CIC News',
    sourceType: 'third_party',
    publishedAt: '2026-05-28',
    category: 'pr',
    importance: 'low',
    affectedUsers: ['pr'],
  },
  {
    id: 'cicnews-ee-pool-501-600-2026-05-28',
    title: '93% of Express Entry pool growth driven by candidates scoring in the 501–600 range',
    summary:
      "Canada's Express Entry pool grew by 4,395 profiles between April 26 and May 24, 2026. Of that growth, 4,085 profiles — 93% — came from candidates in the 501–600 CRS score range. This concentration signals that the competitive band for all-program draws is likely to remain in this range in the near term. Candidates below 500 should focus on score improvement actions such as language retesting or securing a provincial nomination.",
    sourceUrl: 'https://www.cicnews.com/',
    sourceName: 'CIC News',
    sourceType: 'third_party',
    publishedAt: '2026-05-28',
    category: 'express-entry',
    importance: 'low',
    affectedUsers: ['express-entry', 'pr'],
  },
  {
    id: 'cicnews-study-cbsa-interview-2026-05-28',
    title: 'Coming to Canada to study? Here are the questions you can expect immigration officers to ask',
    summary:
      'When arriving in Canada as an international student, CBSA officers verify that you meet entry requirements and have genuine temporary resident intent. Common questions cover your program, institution, funding, ties to your home country, and plans after graduation. Officers are checking that you intend to study and leave (or transition through a legal pathway) — not that you intend to overstay. Being clear, consistent, and prepared with your acceptance letter, proof of funds, and study permit will help your entry go smoothly.',
    sourceUrl: 'https://www.cicnews.com/',
    sourceName: 'CIC News',
    sourceType: 'third_party',
    publishedAt: '2026-05-28',
    category: 'study',
    importance: 'low',
    affectedUsers: ['student'],
  },
  {
    id: 'ircc-job-offer-crs-removed-2025-03-25',
    title: 'Express Entry: Job offer no longer adds points to CRS score',
    summary:
      'Effective March 25, 2025, IRCC removed arranged employment (job offer) points from the Comprehensive Ranking System. A valid job offer no longer adds 50 or 200 CRS points. This change applies to all candidates currently in the pool and all future rounds. A job offer may still strengthen eligibility for some Provincial Nominee Program streams, but it has no direct effect on your Express Entry CRS score.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices.html',
    sourceName: 'IRCC Notices',
    publishedAt: '2025-03-25',
    category: 'express-entry',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['work-permit', 'pr', 'express-entry'],
  },
  {
    id: 'ircc-pgwp-language-field-study-2024-11-01',
    title: 'New language and field-of-study requirements for PGWP applicants',
    summary:
      'Starting November 1, 2024, most students who applied for a study permit must meet two new PGWP requirements at graduation: (1) provide proof of English or French language ability — CLB 7 (English) or NCLC 7 (French) minimum — and (2) have studied in a program whose field of study appears on the IRCC-approved list, which focuses on healthcare, trades, STEM, and agriculture. Graduates of designated flight schools are exempt from both requirements. Students who held a study permit before November 1, 2024 are not affected.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices.html',
    sourceName: 'IRCC Notices',
    publishedAt: '2024-11-01',
    category: 'study',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['student', 'study-permit'],
  },
  {
    id: 'ircc-2025-2027-levels-plan-2024-10-24',
    title: 'Canada reduces permanent resident targets in 2025–2027 Immigration Levels Plan',
    summary:
      'IRCC released a revised multi-year immigration levels plan on October 24, 2024. Canada\'s permanent resident admission targets are: 395,000 in 2025, 380,000 in 2026, and 365,000 in 2027. This represents a significant reduction from the previous 500,000 target for 2025. The government cited housing supply, infrastructure capacity, and public services as reasons for the adjustment. Express Entry, PNP, family sponsorship, and other programs will operate within these reduced overall targets.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
    sourceName: 'IRCC',
    publishedAt: '2024-10-24',
    category: 'pr',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['work-permit', 'student', 'pr', 'express-entry', 'pnp'],
  },
  {
    id: 'ircc-temp-residents-5pct-target-2024-03-21',
    title: 'Canada sets target to reduce temporary residents to 5% of population by 2025',
    summary:
      'The federal government announced a plan to reduce the share of temporary residents in Canada from approximately 6.5% of the total population to 5% by the end of 2025. This affects the overall volume of study permits, work permits, and visitor visas that will be approved going forward. The target was cited alongside major cuts to immigration levels and signals that Canada is actively reducing temporary immigration across all streams, not just permanent residence. Workers and students on temporary status in Canada should plan their pathways carefully, as future permit extensions and renewals may face higher rejection rates as IRCC manages down overall temporary resident volumes.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
    sourceName: 'IRCC',
    publishedAt: '2024-03-21',
    category: 'general',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['work-permit', 'student', 'visitor'],
  },
  {
    id: 'ircc-student-off-campus-work-20hr-limit-2024-04-30',
    title: 'International students: off-campus work limit returns to 20 hours per week',
    summary:
      'The temporary COVID-era public policy that allowed eligible international students to work more than 20 hours per week off-campus ended April 30, 2024. Students are now subject to the standard 20-hour-per-week off-campus work limit during regular academic sessions. Students may still work unlimited hours during scheduled breaks (winter holidays, summer break) if they are actively enrolled in a program. Exceeding the 20-hour limit outside of scheduled breaks is a condition violation that can affect PGWP eligibility. Authorized on-campus work and co-op/internship hours are separate and not subject to this limit.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices.html',
    sourceName: 'IRCC Notices',
    publishedAt: '2024-04-30',
    category: 'study',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['student', 'study-permit'],
  },
  {
    id: 'ircc-low-wage-tfw-lmia-restrictions-2024-08-26',
    title: 'IRCC tightens Temporary Foreign Worker Program rules for low-wage positions',
    summary:
      'Effective August 26, 2024, IRCC introduced significant restrictions on LMIA approvals for low-wage temporary foreign worker positions. Employers in census metropolitan areas with an unemployment rate of 6% or higher are no longer eligible to hire low-wage TFWs through the Temporary Foreign Worker Program for most sectors. Employers already over a 10% low-wage TFW workforce cap cannot apply for new low-wage LMIA approvals in affected sectors. Exceptions apply for food security, healthcare, and construction. This change does not affect high-wage LMIA applications or LMIA-exempt categories such as CUSMA workers, ICT intracompany transferees, or open work permits.',
    sourceUrl: 'https://www.canada.ca/en/employment-social-development/news/2024/08/canada-strengthens-temporary-foreign-worker-program-to-put-canadians-first.html',
    sourceName: 'IRCC',
    publishedAt: '2024-08-26',
    category: 'work',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['work-permit'],
  },
  {
    id: 'ircc-rural-community-immigration-pilot-2024',
    title: 'Rural Community Immigration Pilot: PR only available through smaller communities outside major cities',
    summary:
      'IRCC launched the Rural Community Immigration Pilot (RCIP), replacing the former Rural and Northern Immigration Pilot (RNIP). This permanent residence pathway is only available through designated smaller communities — it is explicitly not available to applicants who intend to settle in major urban centres such as Toronto, Vancouver, Calgary, Edmonton, or Montréal. Each designated community sets its own job offer and labour market requirements. Applicants must have a qualifying full-time, non-seasonal job offer from an employer in a designated community, and must genuinely intend to live and work there. The program gives communities with labour shortages direct control over recruiting the workers they need for PR.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/rural-community-immigration-pilot.html',
    sourceName: 'IRCC',
    publishedAt: '2024-03-01',
    category: 'pnp',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['work-permit', 'pr', 'pnp'],
  },
  {
    id: 'ircc-visitor-work-permit-policy-ended-2024-08-28',
    title: 'Temporary policy allowing visitors to apply for work permits from inside Canada ended',
    summary:
      'IRCC ended the temporary public policy that allowed foreign nationals visiting Canada to apply for an employer-specific work permit from inside Canada without first leaving the country. This policy ended August 28, 2024. Visitors who want to work in Canada must now apply for a work permit before arriving, or qualify under one of the established in-Canada exceptions (such as certain CUSMA/USMCA workers or International Experience Canada participants). Maintained status from a previously held work permit is not affected.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices.html',
    sourceName: 'IRCC Notices',
    publishedAt: '2024-08-28',
    category: 'work',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['visitor', 'work-permit'],
  },
  {
    id: 'ircc-study-permit-cap-2024-01-22',
    title: 'Canada announces two-year cap on international study permit approvals',
    summary:
      'IRCC announced on January 22, 2024, a two-year cap on new approved study permits for international students. For 2024, the target was approximately 360,000 approved permits distributed across provinces by population. Graduate-level programs (master\'s and doctoral) are exempt from the cap. Applicants should verify their institution\'s DLI status and provincial allocation before applying, as provinces already near their quota may face processing delays or refusals.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
    sourceName: 'IRCC',
    publishedAt: '2024-01-22',
    category: 'study',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['student', 'study-permit'],
  },
  {
    id: 'ircc-pnp-allocations-reduced-2024',
    title: 'Provincial Nominee Program allocations reduced as part of lower immigration targets',
    summary:
      'As part of the revised 2025–2027 Immigration Levels Plan, IRCC reduced the annual allocation for Provincial Nominee Programs (PNPs). Each province receives a fixed number of nominations per year; once that quota is reached, new applications in most streams are paused until the following year. In 2025, the combined PNP allocation across all provinces and territories is lower than previous years. Candidates waiting for a provincial nomination should monitor their target province\'s stream status and apply as early in the year as possible, as popular streams such as Ontario\'s Human Capital Priority and BC PNP Skills Immigration can exhaust their allocations before year-end.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html',
    sourceName: 'IRCC',
    publishedAt: '2024-10-24',
    category: 'pnp',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['work-permit', 'student', 'pr', 'pnp'],
  },
  {
    id: 'ircc-pr-card-renewal-delays-2024',
    title: 'PR card renewals: IRCC warns of extended processing times',
    summary:
      'IRCC has flagged that PR card renewal applications are experiencing above-average processing times. Permanent residents who plan to travel outside Canada should apply for PR card renewal well in advance — IRCC recommends applying at least six months before the card expiry date or before any planned international travel. If a PR card expires while a resident is outside Canada, they will need to apply for a Permanent Resident Travel Document (PRTD) from a Canadian visa office abroad before they can board a flight back. Holding an expired PR card does not affect PR status itself, but it does restrict re-entry by air.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/apply-renew-replace.html',
    sourceName: 'IRCC',
    publishedAt: '2024-06-01',
    category: 'pr',
    importance: 'medium',
    sourceType: 'official',
    affectedUsers: ['pr'],
  },
  {
    id: 'ircc-study-permit-cap-extended-2025',
    title: 'Study permit cap extended: provincial allocations maintained for 2025',
    summary:
      'IRCC confirmed that the two-year study permit cap introduced in January 2024 continues into 2025 with revised provincial allocations. The 2025 national target for new approved study permits is approximately 437,000 — down significantly from pre-cap levels. Each province and territory receives a fixed share. Graduate-level programs (master\'s and doctoral) remain exempt from the cap. Applicants at institutions in provinces already at or near their allocation may experience delays or refusals regardless of application quality. Prospective students should confirm their designated learning institution (DLI) and their province\'s remaining capacity before applying.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
    sourceName: 'IRCC',
    publishedAt: '2025-01-22',
    category: 'study',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['student', 'study-permit'],
  },
  {
    id: 'ircc-express-entry-category-draws-2023-05-31',
    title: 'Express Entry introduces category-based selection draws',
    summary:
      'IRCC launched category-based selection for Express Entry rounds starting May 31, 2023. In addition to all-program draws, IRCC now issues targeted Invitations to Apply (ITAs) to candidates in specific occupational categories — including healthcare, STEM, trades, transport, agriculture, and education — and to French-language-proficiency candidates. Candidates who qualify under a targeted category may receive an ITA even if their overall CRS score is lower than the all-program cut-off. French speakers with CLB 7+ now receive 25–50 bonus CRS points depending on English proficiency.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
    sourceName: 'IRCC',
    publishedAt: '2023-05-31',
    category: 'express-entry',
    importance: 'high',
    sourceType: 'official',
    affectedUsers: ['work-permit', 'pr', 'express-entry'],
  },
  {
    id: 'ircc-citizenship-physical-presence-clarification-2023',
    title: 'Citizenship: Physical presence must be verified — travel days carefully reviewed',
    summary:
      'IRCC has increased scrutiny of physical presence calculations in citizenship applications. Applicants must demonstrate 1,095 days physically present in Canada in the 5 years before applying. IRCC cross-references declared travel history with CBSA entry/exit records. Days spent working remotely from outside Canada, even for a Canadian employer, do not count. Half-day credit for pre-PR days as a temporary resident (student, worker, or visitor) is capped at 365 days credit total. Applicants with significant travel outside Canada or periods of remote work abroad should consult a certified immigration consultant before filing.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility.html',
    sourceName: 'IRCC',
    publishedAt: '2023-03-01',
    category: 'general',
    importance: 'medium',
    sourceType: 'official',
    affectedUsers: ['pr'],
  },
]


// ─── Helpers ─────────────────────────────────────────────────────────────────

function rowToUpdate(row: Record<string, unknown>): NewsUpdate {
  return {
    id:            row.id as string,
    title:         row.title as string,
    summary:       row.summary as string,
    sourceUrl:     row.source_url as string,
    sourceName:    row.source_name as NewsUpdate['sourceName'],
    sourceType:    (row.source_type as NewsSourceType) ?? 'official',
    publishedAt:   (row.published_at as string).slice(0, 10),
    category:      row.category as NewsCategory,
    importance:    row.importance as NewsImportance,
    affectedUsers: (row.affected_users as string[]) ?? [],
  }
}

function anonDb() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/** Returns the N most recent updates, always merging live DB items with curated mock items. */
export async function getUpdates(opts?: { limit?: number; category?: NewsCategory }): Promise<NewsUpdate[]> {
  let liveItems: NewsUpdate[] = []

  try {
    const db = anonDb()

    let query = db
      .from('immigration_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)

    const { data, error } = await query
    if (!error && data && data.length > 0) liveItems = data.map(rowToUpdate)
  } catch {
    // DB unavailable — curated items still shown below
  }

  // Always include curated items; DB items win on ID collision
  const liveIds = new Set(liveItems.map((i) => i.id))
  let merged = [
    ...liveItems,
    ...mockUpdates.filter((m) => !liveIds.has(m.id)),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  if (opts?.category) merged = merged.filter((u) => u.category === opts.category)
  if (opts?.limit) merged = merged.slice(0, opts.limit)
  return merged
}

/** Returns updates relevant to a user's status and goal, always merging live DB items with curated mock items. */
export async function getPersonalizedUpdates(status: string, goal: string): Promise<NewsUpdate[]> {
  let liveItems: NewsUpdate[] = []

  try {
    const db = anonDb()
    const { data, error } = await db
      .from('immigration_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)

    if (!error && data && data.length > 0) liveItems = data.map(rowToUpdate)
  } catch {
    // DB unavailable — curated items still shown below
  }

  // Always include curated items; DB items win on ID collision
  const liveIds = new Set(liveItems.map((i) => i.id))
  const all = [
    ...liveItems,
    ...mockUpdates.filter((m) => !liveIds.has(m.id)),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const relevant = all.filter(
    (u) => u.affectedUsers.includes(status) || u.affectedUsers.includes(goal)
  )
  const general = all.filter(
    (u) => u.category === 'general' && u.importance === 'high' && !relevant.includes(u)
  )
  return [...relevant, ...general]
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ─── In-app notification tracking (localStorage) ──────────────────────────────

const NEWS_LAST_READ_KEY = 'navly_news_last_read'

/** Call when the user opens the news page to clear the unread badge. */
export function markNewsAsRead(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NEWS_LAST_READ_KEY, new Date().toISOString())
  }
}

/** Returns how many items in the list are newer than the last time the user read news. */
export function countUnread(updates: NewsUpdate[]): number {
  if (typeof window === 'undefined') return 0
  const raw = localStorage.getItem(NEWS_LAST_READ_KEY)
  const lastRead = raw ? new Date(raw) : new Date(0) // epoch = never read
  return updates.filter((u) => new Date(u.publishedAt) > lastRead).length
}
