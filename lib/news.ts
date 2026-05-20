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

// ─── Mock data — replace with real DB fetch in production ────────────────────

export const mockUpdates: NewsUpdate[] = [
  {
    id: 'ircc-2026-05-01',
    title: 'IRCC Updates PGWP Eligibility for Programs Starting After 2024',
    summary:
      'International students whose programs started after November 1, 2024 may receive a shorter Post-Graduation Work Permit based on program length. Programs under 2 years now generate a PGWP equal to the program length, not 3 years. Students in 2-year or longer programs are unaffected.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices.html',
    sourceName: 'IRCC Notices',
    publishedAt: '2026-05-01',
    category: 'study',
    importance: 'high',
    affectedUsers: ['student', 'study-permit'],
  },
  {
    id: 'ircc-2026-04-24',
    title: 'Express Entry Draw: Canadian Experience Class — 3,500 Invitations Issued',
    summary:
      'IRCC issued 3,500 Invitations to Apply (ITAs) to Canadian Experience Class candidates on April 24, 2026. The minimum CRS score was 491. Candidates with scores above 491 in the CEC pool should expect an invitation in the next draw cycle if their score holds.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
    sourceName: 'IRCC',
    publishedAt: '2026-04-24',
    category: 'express-entry',
    importance: 'high',
    affectedUsers: ['work-permit', 'pr', 'express-entry'],
  },
  {
    id: 'ircc-2026-04-15',
    title: 'Study Permit Application Cap: 2026 International Student Intake Plan',
    summary:
      'Canada has finalized its 2026 international student intake limits. Approved study permit applications are capped provincially. Applicants from provinces already near their cap may face longer processing times or refusals. Students should confirm their DLI and province quota before applying.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
    sourceName: 'IRCC',
    publishedAt: '2026-04-15',
    category: 'study',
    importance: 'high',
    affectedUsers: ['student', 'study-permit'],
  },
  {
    id: 'ircc-2026-04-08',
    title: 'Open Work Permit Eligibility Extended for Spouses of Certain Work Permit Holders',
    summary:
      'Spouses of TEER 1 work permit holders are now eligible for an open work permit regardless of their employer\'s size. Previously this applied only to spouses of workers with NOC 0 and NOC A occupations. This expansion came into effect April 1, 2026.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
    sourceName: 'IRCC',
    publishedAt: '2026-04-08',
    category: 'work',
    importance: 'medium',
    affectedUsers: ['work-permit'],
  },
  {
    id: 'ircc-2026-04-01',
    title: 'Provincial Nominee Program: 2026 Allocation Levels Released',
    summary:
      'Canada released its 2026 PNP allocation levels. Ontario, British Columbia, and Alberta received the largest share of nominations. Saskatchewan and Manitoba increased their allocations for skilled trades workers. Nominees should submit their federal PR application promptly after receiving a provincial nomination — delays can affect processing.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news.html',
    sourceName: 'IRCC',
    publishedAt: '2026-04-01',
    category: 'pnp',
    importance: 'medium',
    affectedUsers: ['work-permit', 'student', 'pr', 'pnp'],
  },
  {
    id: 'ircc-2026-03-20',
    title: 'Family Sponsorship: Updated Minimum Necessary Income Thresholds for 2026',
    summary:
      'IRCC has updated the Minimum Necessary Income (MNI) thresholds for sponsoring a spouse or dependent. Sponsors must demonstrate income at or above the 2026 Low Income Cut-Off (LICO). Applications submitted before the update date are assessed under 2025 thresholds.',
    sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices.html',
    sourceName: 'IRCC Notices',
    publishedAt: '2026-03-20',
    category: 'family',
    importance: 'medium',
    affectedUsers: ['family', 'family-member'],
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

/** Returns the N most recent updates from Supabase, falling back to mock data. */
export async function getUpdates(opts?: { limit?: number; category?: NewsCategory }): Promise<NewsUpdate[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const db = await createClient()

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
    const { createClient } = await import('@/lib/supabase/server')
    const db = await createClient()

    const { data, error } = await db
      .from('ircc_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)

    if (error || !data) throw new Error(error?.message ?? 'empty')

    const all = data.map(rowToUpdate)
    const relevant = all.filter(
      (u) => u.affectedUsers.includes(status) || u.affectedUsers.includes(goal)
    )
    const general = all.filter(
      (u) => u.category === 'general' && u.importance === 'high' && !relevant.includes(u)
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
