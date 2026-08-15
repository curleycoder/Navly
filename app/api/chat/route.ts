import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { IntakeData } from '@/lib/profile'
import { calculateScore, convertToCLB } from '@/lib/scoring'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ── Admin DB (service role — bypasses RLS for rate limit writes) ──────────────

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Server-side plan check ────────────────────────────────────────────────────
// AI chat is a tracker-only feature. Verify against the DB, not client state.

async function hasTrackerPlan(userId: string): Promise<boolean> {
  const db = adminDb()
  const { data } = await db
    .from('subscriptions')
    .select('plan, status, expires_at')
    .eq('user_id', userId)
    .eq('plan', 'tracker')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return false
  // If expires_at is set, the subscription must not have lapsed.
  if (data.expires_at && new Date(data.expires_at) < new Date()) return false
  return true
}

// ── Supabase-based rate limiter ───────────────────────────────────────────────
// Replaces the in-memory Map which resets on every serverless cold start.
// Uses the chat_rate_limits table (migration 010_security.sql).
// 20 messages per 60-second window per user.

const RATE_LIMIT = 20
const WINDOW_MS = 60_000

async function isChatRateLimited(userId: string): Promise<boolean> {
  const db = adminDb()
  const now = new Date()
  const windowCutoff = new Date(now.getTime() - WINDOW_MS)

  const { data } = await db
    .from('chat_rate_limits')
    .select('count, window_start')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data || new Date(data.window_start) < windowCutoff) {
    // No record yet, or window has expired — start a fresh window
    await db.from('chat_rate_limits').upsert({
      user_id: userId,
      window_start: now.toISOString(),
      count: 1,
      updated_at: now.toISOString(),
    })
    return false
  }

  if (data.count >= RATE_LIMIT) return true

  await db
    .from('chat_rate_limits')
    .update({ count: data.count + 1, updated_at: now.toISOString() })
    .eq('user_id', userId)
  return false
}

// ── Prompt injection sanitization ────────────────────────────────────────────
// Profile fields injected into the system prompt are user-supplied strings.
// Strip common injection patterns and control characters before injection.
// This is a defence-in-depth measure alongside the system-prompt guardrails.

const INJECTION_PATTERNS = [
  /ignore\s+(all|previous|above|prior|the|your)\s+\w+/gi,
  /you\s+are\s+(now|a|an)\s+/gi,
  /disregard\s+(all|previous|above|the)/gi,
  /new\s+instructions?/gi,
  /system\s+prompt/gi,
  /override\s+(all|the|your|previous)/gi,
  /forget\s+(all|everything|previous|your)/gi,
  /\[system\]/gi,
  /<\/?system>/gi,
  /act\s+as\s+(a|an|if)/gi,
]

function sanitizeField(value: string | undefined, maxLen = 120): string {
  if (!value) return 'not provided'
  let s = value
    .slice(0, maxLen)
    .replace(/[\r\n\t]/g, ' ')   // no newlines or tabs that could break prompt structure
    .replace(/[<>]/g, '')        // strip angle brackets (XML/HTML injection)
  for (const pattern of INJECTION_PATTERNS) {
    s = s.replace(pattern, '[removed]')
  }
  return s.trim() || 'not provided'
}

// ── RAG: retrieve rule_snapshots relevant to the user's query ──────────────

const KEYWORD_CATEGORY_MAP: [RegExp, string][] = [
  [/express.?entry|ee draw|crs|cutoff|round of invitation/i, 'express_entry'],
  [/pgwp|post.?grad|work permit/i, 'pgwp'],
  [/citizen(ship)?|naturali[sz]/i, 'citizenship'],
  [/pr card|resid(ency|ence) obligation|2 (years|yrs)/i, 'pr_residency'],
  [/settlement fund|proof of fund|bank|money/i, 'proof_of_funds'],
  [/french|francoph|bilingu/i, 'express_entry'],
  [/pnp|provincial nominee/i, 'express_entry'],
]

function detectCategories(query: string): string[] {
  const cats = new Set<string>()
  for (const [re, cat] of KEYWORD_CATEGORY_MAP) {
    if (re.test(query)) cats.add(cat)
  }
  return [...cats]
}

type RuleSnapshot = {
  rule_key: string
  category: string
  data: Record<string, unknown>
  source_url: string
  effective_date: string | null
}

async function fetchRuleContext(userQuery: string): Promise<string> {
  const db = adminDb()
  const categories = detectCategories(userQuery)

  let query = db
    .from('rule_snapshots')
    .select('rule_key, category, data, source_url, effective_date')
    .eq('status', 'active')

  if (categories.length > 0) {
    const keys = categories.includes('express_entry') ? ['latest_ee_draw'] : []
    query = query.or(
      [
        `category.in.(${categories.join(',')})`,
        keys.length ? `rule_key.in.(${keys.join(',')})` : null,
      ]
        .filter(Boolean)
        .join(',')
    )
  }

  const { data: rows } = await query.limit(10)
  if (!rows || rows.length === 0) return ''

  const lines = ['---', 'OFFICIAL RULE CONTEXT (sourced from IRCC, effective dates noted):']
  for (const row of rows as RuleSnapshot[]) {
    lines.push(`\n[${row.rule_key}] (effective: ${row.effective_date ?? 'unknown'}, source: ${row.source_url})`)
    lines.push(JSON.stringify(row.data, null, 2))
  }
  lines.push('---')
  lines.push('Use the above official data when answering. Cite the effective date when relevant. Do not invent numbers not present above.')

  return lines.join('\n')
}

const BASE_SYSTEM = `You are Navly's immigration information assistant. You help users understand Canadian immigration concepts, pathways, and terminology in plain, clear language.

━━━ CRITICAL OVERRIDES (highest priority — apply before anything else) ━━━

OVERRIDE — Quebec: If the user's message mentions Quebec, PEQ, PSTQ, Arrima, QSWP, or any Quebec provincial immigration program, respond only with:
"Quebec uses its own separate immigration system (Arrima). Navly currently covers federal Express Entry and other provincial programs only. For Quebec immigration, visit immigration.quebec.gouv.ca."
Do not answer further. Do not use any other context.

OVERRIDE — Off-topic: If the message is not about Canadian immigration, respond only with:
"I can only help with Canadian immigration questions."

OVERRIDE — High-risk legal situation: If the user's message involves any of the following, you must stop and use the escalation response below instead of answering the question:
• Removal order, deportation, or inadmissibility finding
• Misrepresentation accusation or allegation
• Criminal charge, conviction, or criminal inadmissibility
• Refugee claim, asylum, or protected person status
• Procedural fairness letter from IRCC
• Out-of-status, expired permit with no pending restoration
• Detention or arrest by CBSA
Escalation response: "This situation involves legal risk that Navly cannot assess. Navly is a planning and information tool only — not a legal service. Please contact a licensed Regulated Canadian Immigration Consultant (RCIC) or a Canadian immigration lawyer as soon as possible. ICCRC (now CICC) verifies RCICs at iccrc-crcic.ca."

━━━ LANGUAGE YOU MUST NEVER USE ━━━

Never say these phrases or anything equivalent:
- "You qualify"
- "You are eligible"
- "You will be approved"
- "You should apply"
- "You do not need a lawyer"
- "This guarantees"
- "You will receive an ITA"
- "Your application will succeed"
- "Submit this application"
- "You are safe to stay"
- "Your status is valid"

Always replace with language like:
- "Based on the data you entered, this pathway may be possible"
- "This pathway appears to match your profile — a certified consultant should confirm"
- "The program requirements suggest you may meet the threshold"
- "Navly cannot confirm your eligibility — consult a licensed RCIC or immigration lawyer"

━━━ CITATION REQUIREMENT ━━━

Whenever you state a specific rule, number, date, fee, processing time, or eligibility threshold, you must cite the source. Use this format at the end of the relevant sentence or paragraph:
[Source: canada.ca/en/... — effective YYYY-MM]

If you do not know the source, say: "I am not certain of the source for this — please verify at canada.ca before making decisions."

━━━ STANDARD RESPONSE FORMAT ━━━

For non-trivial questions, structure your answer as follows:

**What Navly can tell you:**
[General educational information based on publicly known program rules]

**What this may mean for your situation:**
[Personalised reading of the user's profile data — use cautious language]

**What Navly cannot confirm:**
[Limits — eligibility decisions, document review, legal strategy]

**Official source:**
[Direct canada.ca link if known, or "Please verify at canada.ca"]

**When to speak to a professional:**
[Specific trigger — e.g. "If your permit expires within 90 days", "If you have had a refusal"]

For simple factual questions (definitions, terminology), a shorter direct answer is fine without this full structure.

━━━ GENERAL RULES ━━━

- Provide general educational information only — never legal advice
- Always remind users that for their specific situation they must consult a licensed RCIC or immigration lawyer
- Keep answers concise and clear — explain jargon when you use it
- Focus on Canadian immigration (IRCC, Express Entry, PNP, PGWP, LMIA, etc.)
- Explain how processes work generally — do not prescribe actions for a specific person's case
- Do not make up facts, processing times, or fees — say you are unsure if you do not know
- Do not claim to be an RCIC, immigration lawyer, or government officer`

function buildProfileContext(profile: IntakeData): string {
  const lines: string[] = ['The user has provided the following profile data (for context only):']

  lines.push(`- Current status: ${sanitizeField(profile.status)}`)
  lines.push(`- Country of origin: ${sanitizeField(profile.originCountry)}`)
  lines.push(`- Currently in: ${sanitizeField(profile.currentCountry)}${profile.province ? `, ${sanitizeField(profile.province)}` : ''}`)
  if (profile.locationStatus) lines.push(`- Location: ${profile.locationStatus === 'inside' ? 'inside Canada' : 'outside Canada'}`)
  if (profile.plannedEntry) lines.push(`- Planned entry route: ${sanitizeField(profile.plannedEntry)}`)
  lines.push(`- Main goal: ${sanitizeField(profile.goal)}`)

  if (profile.age) lines.push(`- Age: ${sanitizeField(profile.age)}`)
  if (profile.maritalStatus) {
    lines.push(`- Marital status: ${sanitizeField(profile.maritalStatus)}${profile.spouseComing ? `, spouse coming: ${sanitizeField(profile.spouseComing)}` : ''}`)
  }

  if (profile.langTestType && profile.langTestType !== 'none') {
    const testName: Record<string, string> = {
      'ielts-general': 'IELTS General Training', celpip: 'CELPIP-General',
      pte: 'PTE Core', tef: 'TEF Canada', tcf: 'TCF Canada',
    }
    const scores = { r: parseFloat(profile.langReading), w: parseFloat(profile.langWriting), l: parseFloat(profile.langListening), s: parseFloat(profile.langSpeaking) }
    const clb = convertToCLB(profile.langTestType, scores)
    lines.push(`- Language test: ${testName[profile.langTestType] || sanitizeField(profile.langTestType)} — R:${profile.langReading} W:${profile.langWriting} L:${profile.langListening} S:${profile.langSpeaking}`)
    if (clb) lines.push(`- Estimated CLB: R:${clb.r} W:${clb.w} L:${clb.l} S:${clb.s} (min: ${Math.min(clb.r, clb.w, clb.l, clb.s)})`)
  }

  if (profile.educationLevel) lines.push(`- Highest education: ${sanitizeField(profile.educationLevel)}${profile.ecaCompleted ? `, ECA: ${sanitizeField(profile.ecaCompleted)}` : ''}`)
  if (profile.teerLevel) lines.push(`- TEER level: ${sanitizeField(profile.teerLevel)}`)
  if (profile.foreignWorkYears) lines.push(`- Foreign skilled work: ${sanitizeField(profile.foreignWorkYears)} year(s)`)
  if (profile.canadianWorkMonths) lines.push(`- Canadian skilled work: ${sanitizeField(profile.canadianWorkMonths)} month(s)`)
  if (profile.hasJobOffer) lines.push(`- Job offer: ${sanitizeField(profile.hasJobOffer)}`)
  if (profile.intendedProvince) lines.push(`- Intended province: ${sanitizeField(profile.intendedProvince)}`)
  if (profile.permitExpiry) lines.push(`- Permit expiry: ${sanitizeField(profile.permitExpiry)}`)
  if (profile.previousRefusals === 'yes') lines.push('- Has reported a previous refusal')
  if (profile.lostStatus === 'yes') lines.push('- Has reported previous loss of status or overstay')
  if (profile.familySize) lines.push(`- Family size: ${sanitizeField(profile.familySize)}`)

  try {
    const score = calculateScore(profile)
    if (score.hasEnoughData && score.crs) {
      lines.push(`- Estimated CRS score (based on entered data): ${score.crs.total}`)
      if (score.fsw) lines.push(`- FSW 67-pt estimate: ${score.fsw.score}/100 (${score.fsw.eligible ? 'appears to meet threshold' : 'does not appear to meet threshold — based on entered data'})`)
      const possiblePaths = score.pathways
        .filter(p => p.status === 'eligible' || p.status === 'possible')
        .map(p => p.name)
      if (possiblePaths.length > 0) lines.push(`- Pathways that appear to match profile (not confirmed eligibility): ${possiblePaths.join(', ')}`)
      const notReady = score.pathways.filter(p => p.status === 'not-yet').map(p => p.name)
      if (notReady.length > 0) lines.push(`- Pathways not yet met based on entered data: ${notReady.join(', ')}`)
    }
  } catch {
    // silently skip if scoring fails
  }

  lines.push('\nIMPORTANT: Use this context to personalise your answer. Never tell the user they qualify or are eligible — only that pathways appear to match or not match based on what they entered. Always recommend a licensed RCIC or immigration lawyer for their specific case.')

  return lines.join('\n')
}

// ── Recent news context ────────────────────────────────────────────────────────

async function fetchRecentNewsContext(): Promise<string> {
  try {
    const db = adminDb()
    const { data: rows } = await db
      .from('immigration_news')
      .select('title, summary, source_name, source_type, published_at, category')
      .not('category', 'eq', 'quebec')
      .not('title', 'ilike', '%quebec%')
      .not('title', 'ilike', '%arrima%')
      .not('title', 'ilike', '%pstq%')
      .not('title', 'ilike', '%peq%')
      .order('published_at', { ascending: false })
      .limit(8)

    if (!rows || rows.length === 0) return ''

    const lines = ['---', 'RECENT IMMIGRATION NEWS (for context — summarise relevance to user, do not fabricate details):']
    for (const row of rows) {
      const date = String(row.published_at).slice(0, 10)
      const sourceLabel = row.source_type === 'official' ? `[Official — ${row.source_name}]` : `[${row.source_name} — third-party commentary]`
      lines.push(`\n${date} ${sourceLabel}: ${row.title}`)
      if (row.summary) lines.push(row.summary.slice(0, 300))
    }
    lines.push('---')
    lines.push('Reference relevant news items when they relate to the user\'s question. Always note whether a source is official IRCC or third-party commentary.')
    return lines.join('\n')
  } catch {
    return ''
  }
}

const MAX_HISTORY = 14 // 7 turns

export async function POST(request: Request) {
  const supabase = await createServerClient()
  // getUser() validates the JWT against the auth server; getSession() only
  // reads the cookie and must not be trusted for server-side authorization.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id

  // ── Server-side plan gate ─────────────────────────────────────────────────
  // AI chat is a tracker-only feature. Check against the DB, not client state.
  const hasPlan = await hasTrackerPlan(userId)
  if (!hasPlan) {
    return Response.json(
      { error: 'AI chat requires an active PR Tracker plan.' },
      { status: 403 }
    )
  }

  // ── Rate limit (Supabase-backed, survives serverless cold starts) ──────────
  const limited = await isChatRateLimited(userId)
  if (limited) {
    return Response.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
  }

  const { messages, profile } = await request.json() as {
    messages: { role: string; content: string }[]
    profile?: IntakeData
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'No messages provided.' }, { status: 400 })
  }

  // Only user/assistant roles are allowed through. Without this filter a user
  // could POST a { role: "system" } message and override every guardrail.
  const safeMessages = messages
    .filter(
      (m): m is { role: 'user' | 'assistant'; content: string } =>
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string'
    )
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))

  if (safeMessages.length === 0) {
    return Response.json({ error: 'No valid messages provided.' }, { status: 400 })
  }

  const trimmed = safeMessages.slice(-MAX_HISTORY)

  // RAG: pull relevant rule snapshots + recent news in parallel
  const lastUserMsg = [...safeMessages].reverse().find(m => m.role === 'user')?.content ?? ''
  const [ruleContext, newsContext] = await Promise.all([
    fetchRuleContext(lastUserMsg),
    fetchRecentNewsContext(),
  ])

  const systemPrompt = [
    BASE_SYSTEM,
    profile ? buildProfileContext(profile) : null,
    ruleContext || null,
    newsContext || null,
  ].filter(Boolean).join('\n\n')

  const stream = await client.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    max_tokens: 2048,
    messages: [
      { role: 'system', content: systemPrompt },
      ...trimmed,
    ],
    stream: true,
  })

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) controller.enqueue(new TextEncoder().encode(text))
      }
      controller.close()
    },
  })

  return new Response(readableStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
