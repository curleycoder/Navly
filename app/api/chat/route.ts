import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'
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

Important rules you must always follow:
- Provide general educational information only — never legal advice
- Always remind users that for their specific situation they must consult a licensed RCIC or immigration lawyer
- Keep answers concise and easy to understand — avoid jargon where possible, explain it when you must
- Focus on Canadian immigration (IRCC, Express Entry, PNP, PGWP, LMIA, etc.)
- If asked something outside immigration topics, politely redirect the conversation
- Never tell a user what they should do or what their outcome will be — only explain how processes work generally
- Do not make up facts, processing times, or fees — say you are unsure if you don't know
- Use "Based on the data you entered, this pathway may be possible" rather than "You qualify"`

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
      lines.push(`- Estimated CRS score: ${score.crs.total}`)
      if (score.fsw) lines.push(`- FSW 67-pt score: ${score.fsw.score}/100 (${score.fsw.eligible ? 'eligible' : 'not eligible'})`)
      const eligible = score.pathways.filter(p => p.status === 'eligible').map(p => p.name)
      if (eligible.length > 0) lines.push(`- Eligible pathways: ${eligible.join(', ')}`)
    }
  } catch {
    // silently skip if scoring fails
  }

  lines.push('\nUse this context to give personalised, relevant answers. Always remind the user that estimates are based on the data they entered and a licensed professional should review their case.')

  return lines.join('\n')
}

const MAX_HISTORY = 14 // 7 turns

export async function POST(request: Request) {
  const { messages, profile } = await request.json() as {
    messages: { role: string; content: string }[]
    profile?: IntakeData
  }

  const trimmed = messages.slice(-MAX_HISTORY)

  // RAG: pull relevant rule snapshots based on the last user message
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content ?? ''
  const ruleContext = await fetchRuleContext(lastUserMsg)

  const systemPrompt = [
    BASE_SYSTEM,
    profile ? buildProfileContext(profile) : null,
    ruleContext || null,
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
