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

export type NewsUpdate = {
  id: string
  title: string
  summary: string         // plain-English summary (AI-generated in production)
  sourceUrl: string
  sourceName: 'IRCC' | 'Canada Gazette' | 'IRCC Notices'
  publishedAt: string     // ISO date string 'YYYY-MM-DD'
  category: NewsCategory
  importance: NewsImportance
  affectedUsers: string[] // matches IntakeData.status or IntakeData.goal values
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
// and upserts them into the ircc_news table — these are only a safety net.
// Sources: canada.ca/en/immigration-refugees-citizenship/news and /notices

export const mockUpdates: NewsUpdate[] = [
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
    affectedUsers: ['work-permit', 'student', 'pr', 'express-entry', 'pnp'],
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
    affectedUsers: ['work-permit', 'pr', 'express-entry'],
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

/** Returns the N most recent updates from Supabase, falling back to mock data. */
export async function getUpdates(opts?: { limit?: number; category?: NewsCategory }): Promise<NewsUpdate[]> {
  try {
    const db = anonDb()

    let query = db
      .from('ircc_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(opts?.limit ?? 20)

    if (opts?.category) query = query.eq('category', opts.category)

    const { data, error } = await query
    if (error || !data || data.length === 0) throw new Error(error?.message ?? 'empty')

    return data.map(rowToUpdate)
  } catch {
    // Fall back to mock data if DB is unavailable or table not yet populated
    let list = [...mockUpdates].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    if (opts?.category) list = list.filter((u) => u.category === opts.category)
    if (opts?.limit) list = list.slice(0, opts.limit)
    return list
  }
}

/** Returns updates relevant to a user's status and goal */
export async function getPersonalizedUpdates(status: string, goal: string): Promise<NewsUpdate[]> {
  try {
    const db = anonDb()

    const { data, error } = await db
      .from('ircc_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)

    if (error || !data) throw new Error(error?.message ?? 'empty')

    const all: NewsUpdate[] = data.map(rowToUpdate)
    const relevant = all.filter(
      (u: NewsUpdate) => u.affectedUsers.includes(status) || u.affectedUsers.includes(goal)
    )
    const general = all.filter(
      (u: NewsUpdate) => u.category === 'general' && u.importance === 'high' && !relevant.includes(u)
    )
    return [...relevant, ...general]
  } catch {
    const relevant = mockUpdates.filter(
      (u) => u.affectedUsers.includes(status) || u.affectedUsers.includes(goal)
    )
    const general = mockUpdates.filter(
      (u) => u.category === 'general' && u.importance === 'high' && !relevant.includes(u)
    )
    return [...relevant, ...general].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  }
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
