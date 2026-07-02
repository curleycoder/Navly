import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { IntakeData } from '@/lib/profile'
import { calculateScore, convertToCLB } from '@/lib/scoring'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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
    // Always include the latest EE draw when Express Entry is relevant
    const keys = categories.includes('express_entry') ? ['latest_ee_draw'] : []
    query = query.or(
      [
        `category.in.(${categories.join(',')})`,
        keys.length ? `rule_key.in.(${keys.join(',')})` : null,
      ]
        .filter(Boolean)
        .join(',')
    )
  } else {
    // No specific match — pull all active rules (few enough to fit in context)
    // (no additional filter)
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

  lines.push(`- Current status: ${profile.status || 'not provided'}`)
  lines.push(`- Country of origin: ${profile.originCountry || 'not provided'}`)
  lines.push(`- Currently in: ${profile.currentCountry || 'not provided'}${profile.province ? `, ${profile.province}` : ''}`)
  if (profile.locationStatus) lines.push(`- Location: ${profile.locationStatus === 'inside' ? 'inside Canada' : 'outside Canada'}`)
  if (profile.plannedEntry) lines.push(`- Planned entry route: ${profile.plannedEntry}`)
  lines.push(`- Main goal: ${profile.goal || 'not provided'}`)

  if (profile.age) lines.push(`- Age: ${profile.age}`)
  if (profile.maritalStatus) {
    lines.push(`- Marital status: ${profile.maritalStatus}${profile.spouseComing ? `, spouse coming: ${profile.spouseComing}` : ''}`)
  }

  if (profile.langTestType && profile.langTestType !== 'none') {
    const testName: Record<string, string> = {
      'ielts-general': 'IELTS General Training', celpip: 'CELPIP-General',
      pte: 'PTE Core', tef: 'TEF Canada', tcf: 'TCF Canada',
    }
    const scores = { r: parseFloat(profile.langReading), w: parseFloat(profile.langWriting), l: parseFloat(profile.langListening), s: parseFloat(profile.langSpeaking) }
    const clb = convertToCLB(profile.langTestType, scores)
    lines.push(`- Language test: ${testName[profile.langTestType] || profile.langTestType} — R:${profile.langReading} W:${profile.langWriting} L:${profile.langListening} S:${profile.langSpeaking}`)
    if (clb) lines.push(`- Estimated CLB: R:${clb.r} W:${clb.w} L:${clb.l} S:${clb.s} (min: ${Math.min(clb.r, clb.w, clb.l, clb.s)})`)
  }

  if (profile.educationLevel) lines.push(`- Highest education: ${profile.educationLevel}${profile.ecaCompleted ? `, ECA: ${profile.ecaCompleted}` : ''}`)
  if (profile.teerLevel) lines.push(`- TEER level: ${profile.teerLevel}`)
  if (profile.foreignWorkYears) lines.push(`- Foreign skilled work: ${profile.foreignWorkYears} year(s)`)
  if (profile.canadianWorkMonths) lines.push(`- Canadian skilled work: ${profile.canadianWorkMonths} month(s)`)
  if (profile.hasJobOffer) lines.push(`- Job offer: ${profile.hasJobOffer}`)
  if (profile.intendedProvince) lines.push(`- Intended province: ${profile.intendedProvince}`)
  if (profile.permitExpiry) lines.push(`- Permit expiry: ${profile.permitExpiry}`)
  if (profile.previousRefusals === 'yes') lines.push('- Has reported a previous refusal')
  if (profile.lostStatus === 'yes') lines.push('- Has reported previous loss of status or overstay')
  if (profile.familySize) lines.push(`- Family size: ${profile.familySize}`)

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

// Per-user rate limit: 20 messages per minute (free, in-memory)
const chatRateMap = new Map<string, { count: number; resetAt: number }>()
function isChatRateLimited(userId: string): boolean {
  const now = Date.now()
  const entry = chatRateMap.get(userId)
  if (!entry || entry.resetAt < now) {
    chatRateMap.set(userId, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= 20) return true
  entry.count++
  return false
}

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (isChatRateLimited(session.user.id)) {
    return Response.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
  }

  const { messages, profile } = await request.json() as {
    messages: { role: string; content: string }[]
    profile?: IntakeData
  }

  const trimmed = messages.slice(-MAX_HISTORY)

  // RAG: pull relevant rule snapshots + recent news in parallel
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? ''
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
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    messages: [
      { role: 'system', content: systemPrompt },
      ...trimmed as { role: 'user' | 'assistant'; content: string }[],
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
