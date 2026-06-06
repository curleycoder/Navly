/**
 * Cron route — fetches latest IRCC news from RSS feeds and upserts into immigration_news.
 * Also sends email digest for new high/medium importance items.
 *
 * Called by Vercel Cron (see vercel.json) twice daily, or manually via:
 *   GET /api/cron/news  (Authorization: Bearer <CRON_SECRET>)
 *
 * Note: /api/news already fetches live from RSS on every request.
 * This cron's main job is email notifications + keeping DB warm.
 */
import { createClient } from '@supabase/supabase-js'
import { fetchNewsFromRSS } from '@/lib/ircc-rss'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Email helpers ─────────────────────────────────────────────────────────────

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

type NewsItem = { id: string; title: string; summary: string; source_url: string; source_name: string; importance: string }

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

// ── Main cron handler ─────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = adminDb()
  const errors: string[] = []
  let totalUpserted = 0

  // Fetch from all RSS feeds using shared lib
  const rssItems = await fetchNewsFromRSS(15000).catch((e) => {
    errors.push(`RSS fetch failed: ${(e as Error).message}`)
    return []
  })

  for (const item of rssItems) {
    const { error } = await db.from('immigration_news').upsert(
      {
        id:             item.id,
        title:          item.title,
        summary:        item.summary,
        source_url:     item.sourceUrl,
        source_name:    item.sourceName,
        published_at:   item.publishedAt,
        category:       item.category,
        importance:     item.importance,
        affected_users: item.affectedUsers,
        // notified_at omitted — existing value preserved on conflict
      },
      { onConflict: 'id' }
    )
    if (error) errors.push(`Upsert ${item.id}: ${error.message}`)
    else totalUpserted++
  }

  // ── Email digest for new high/medium items not yet notified ─────────────────
  let emailsSent = 0

  const { data: newItems } = await db
    .from('immigration_news')
    .select('id, title, summary, source_url, source_name, importance')
    .in('importance', ['high', 'medium'])
    .is('notified_at', null)
    .order('published_at', { ascending: false })
    .limit(10)

  if (newItems && newItems.length > 0) {
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

    await db
      .from('immigration_news')
      .update({ notified_at: new Date().toISOString() })
      .in('id', newItems.map((n: NewsItem) => n.id))
  }

  return Response.json({
    ok: errors.length === 0,
    upserted: totalUpserted,
    emailsSent,
    errors: errors.length > 0 ? errors : undefined,
  })
}
