/**
 * Cron route — fetches latest IRCC news from the canada.ca RSS feed and
 * upserts into the ircc_news Supabase table.
 *
 * Called by Vercel Cron (see vercel.json) or manually via GET with
 * Authorization: Bearer <CRON_SECRET>
 */
import { createClient } from '@supabase/supabase-js'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Simple RSS XML parser — no external dependencies needed
function parseRSS(xml: string): Array<{ guid: string; title: string; link: string; description: string; pubDate: string }> {
  const items: Array<{ guid: string; title: string; link: string; description: string; pubDate: string }> = []

  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'))
      return m ? m[1].trim() : ''
    }
    const guid = get('guid') || get('link')
    const title = get('title')
    const link = get('link')
    const description = get('description')
    const pubDate = get('pubDate')
    if (title && link) items.push({ guid, title, link, description, pubDate })
  }

  return items
}

function classifyCategory(title: string, desc: string): string {
  const text = (title + ' ' + desc).toLowerCase()
  if (text.includes('express entry') || text.includes('crs') || text.includes('invitation to apply')) return 'express-entry'
  if (text.includes('provincial nominee') || text.includes('pnp')) return 'pnp'
  if (text.includes('study permit') || text.includes('pgwp') || text.includes('student')) return 'study'
  if (text.includes('work permit') || text.includes('lmia') || text.includes('open work')) return 'work'
  if (text.includes('family sponsorship') || text.includes('spousal') || text.includes('spouse')) return 'family'
  if (text.includes('refugee') || text.includes('asylum') || text.includes('protected person')) return 'refugee'
  if (text.includes('visitor') || text.includes('eta') || text.includes('tourism')) return 'visitor'
  if (text.includes('permanent residen') || text.includes('pr ') || text.includes(' pr,')) return 'pr'
  return 'general'
}

function classifyImportance(title: string, desc: string): string {
  const text = (title + ' ' + desc).toLowerCase()
  if (
    text.includes('draw') || text.includes('invitation') || text.includes('cap') ||
    text.includes('suspended') || text.includes('new policy') || text.includes('cutoff') ||
    text.includes('processing times') || text.includes('intake')
  ) return 'high'
  if (
    text.includes('update') || text.includes('change') || text.includes('extended') ||
    text.includes('threshold') || text.includes('allocation')
  ) return 'medium'
  return 'low'
}

function classifyAffectedUsers(category: string): string[] {
  const map: Record<string, string[]> = {
    'express-entry': ['work-permit', 'pr', 'express-entry'],
    'pnp': ['work-permit', 'student', 'pr', 'pnp'],
    'study': ['student', 'study-permit'],
    'work': ['work-permit'],
    'family': ['family', 'family-member'],
    'refugee': ['refugee'],
    'visitor': ['visitor'],
    'pr': ['work-permit', 'student', 'pr'],
    'general': [],
  }
  return map[category] ?? []
}

const IRCC_RSS_FEEDS = [
  'https://www.canada.ca/en/immigration-refugees-citizenship/news/rss.xml',
  'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/rss.xml',
]

// ── Email helpers ────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log(`[news-notify] (no RESEND_API_KEY) Would send to ${to}: ${subject}`)
    return
  }
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? 'Navly <no-reply@navly.ca>',
      to,
      subject,
      html,
    }),
  })
}

type NewsItem = { title: string; summary: string; source_url: string; source_name: string; importance: string }

function newsDigestHtml(items: NewsItem[]): string {
  const importanceLabel: Record<string, string> = {
    high: '🔴 High priority',
    medium: '🟡 Update',
  }
  const rows = items.map((n) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #E5E7EB;vertical-align:top">
        <p style="margin:0 0 4px;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.05em">
          ${importanceLabel[n.importance] ?? n.importance} · ${n.source_name}
        </p>
        <a href="${n.source_url}" style="font-size:16px;font-weight:600;color:#0B1F3A;text-decoration:none">
          ${n.title}
        </a>
        ${n.summary ? `<p style="margin:6px 0 0;font-size:14px;color:#374151;line-height:1.5">${n.summary.slice(0, 200)}${n.summary.length > 200 ? '…' : ''}</p>` : ''}
      </td>
    </tr>
  `).join('')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#0B1F3A;margin-bottom:4px">New IRCC update${items.length > 1 ? 's' : ''}</h2>
      <p style="color:#6B7280;margin-top:0;margin-bottom:24px">
        ${items.length} new important immigration update${items.length > 1 ? 's' : ''} from the Canadian government.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        ${rows}
      </table>
      <div style="margin-top:24px;text-align:center">
        <a href="https://navly.ca/dashboard" style="display:inline-block;background:#D62828;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          View full update on Navly
        </a>
      </div>
      <p style="margin-top:32px;font-size:12px;color:#9CA3AF;text-align:center">
        Navly is a planning tool only — not legal advice.<br>
        Consult a licensed RCIC or immigration lawyer for your specific situation.<br>
        <a href="https://navly.ca/dashboard/settings" style="color:#9CA3AF">Manage notification preferences</a>
      </p>
    </div>
  `
}

// ── Main cron handler ────────────────────────────────────────────────────────

export async function GET(req: Request) {
  // Auth check
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (secret && auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = adminDb()
  let totalUpserted = 0
  const errors: string[] = []

  for (const feedUrl of IRCC_RSS_FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Navly-NewsBot/1.0' },
        next: { revalidate: 0 },
      })
      if (!res.ok) {
        errors.push(`Feed ${feedUrl}: HTTP ${res.status}`)
        continue
      }
      const xml = await res.text()
      const items = parseRSS(xml)

      for (const item of items.slice(0, 20)) {
        const category = classifyCategory(item.title, item.description)
        const importance = classifyImportance(item.title, item.description)
        const affectedUsers = classifyAffectedUsers(category)
        const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
        const sourceName = feedUrl.includes('notices') ? 'IRCC Notices' : 'IRCC'

        const { error } = await db.from('ircc_news').upsert({
          id: item.guid || item.link,
          title: item.title.slice(0, 500),
          summary: item.description.replace(/<[^>]+>/g, '').trim().slice(0, 1000),
          source_url: item.link,
          source_name: sourceName,
          published_at: publishedAt,
          category,
          importance,
          affected_users: affectedUsers,
          // notified_at is omitted — existing value is preserved on conflict
        }, { onConflict: 'id' })

        if (error) errors.push(`Upsert error: ${error.message}`)
        else totalUpserted++
      }
    } catch (e) {
      errors.push(`Feed ${feedUrl}: ${(e as Error).message}`)
    }
  }

  // ── Send notification emails for new high/medium items ──────────────────────
  let emailsSent = 0

  const { data: newItems } = await db
    .from('ircc_news')
    .select('id, title, summary, source_url, source_name, importance')
    .in('importance', ['high', 'medium'])
    .is('notified_at', null)
    .order('published_at', { ascending: false })
    .limit(10)

  if (newItems && newItems.length > 0) {
    // Fetch all user emails via service role
    const { data: { users } } = await db.auth.admin.listUsers({ perPage: 1000 })

    const subject = newItems.length === 1
      ? `IRCC update: ${newItems[0].title.slice(0, 60)}${newItems[0].title.length > 60 ? '…' : ''}`
      : `${newItems.length} new IRCC immigration updates`
    const html = newsDigestHtml(newItems)

    for (const user of users ?? []) {
      if (!user.email) continue
      try {
        await sendEmail(user.email, subject, html)
        emailsSent++
      } catch (e) {
        errors.push(`Email to ${user.id}: ${(e as Error).message}`)
      }
    }

    // Mark all notified items so they are not re-sent on the next cron run
    const ids = newItems.map((n: NewsItem & { id: string }) => n.id)
    await db
      .from('ircc_news')
      .update({ notified_at: new Date().toISOString() })
      .in('id', ids)
  }

  return Response.json({
    ok: true,
    upserted: totalUpserted,
    emailsSent,
    errors: errors.length > 0 ? errors : undefined,
  })
}
