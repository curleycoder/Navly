/**
 * Admin route — seeds official_sources and rule_snapshots with known verified data.
 * Run once (or re-run to update stale seeds — uses upsert).
 *
 * POST /api/admin/seed-rules
 * Authorization: Bearer <CRON_SECRET>
 */
import { createClient } from '@supabase/supabase-js'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Official sources ──────────────────────────────────────────────────────────

const OFFICIAL_SOURCES = [
  {
    name: 'IRCC News',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/rss.xml',
    source_type: 'rss',
    category: 'ircc_news',
    authority_level: 'official',
    check_frequency: 'daily',
    active: true,
  },
  {
    name: 'IRCC Notices',
    url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/notices/rss.xml',
    source_type: 'rss',
    category: 'ircc_notices',
    authority_level: 'official',
    check_frequency: 'daily',
    active: true,
  },
]

// ── Rule snapshots ────────────────────────────────────────────────────────────

const RULE_SNAPSHOTS = [
  {
    rule_key: 'cec_eligibility',
    category: 'express_entry',
    data: {
      minimum_canadian_work_months: 12,
      work_must_be_paid: true,
      accepted_teer: ['0', '1', '2', '3'],
      student_work_counts: false,
      self_employment_counts: false,
      language_required: true,
      minimum_clb: 7,
      notes: [
        'Must be skilled paid work (TEER 0, 1, 2, or 3).',
        'Work done while on a full-time study permit (on or off campus) does not count.',
        'Self-employment does not count.',
        '12 months can be full-time or equivalent part-time.',
      ],
    },
    source_url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/canadian-experience-class.html',
    effective_date: '2025-03-25',
    status: 'active',
  },
  {
    rule_key: 'pgwp_eligibility',
    category: 'study',
    data: {
      program_duration_min_months: 8,
      pgwp_valid_programs: 'DLI-designated programs at eligible institutions',
      pgwp_duration_based_on_program_length: true,
      maximum_pgwp_months: 36,
      language_requirement_added_date: '2024-11-01',
      language_min_clb: 7,
      language_min_nclc: 7,
      language_min_clb_college_some_programs: 5,
      notes: [
        'Students who finished studying on or after Nov 1, 2024 must show language proof with PGWP application.',
        'Most programs require CLB/NCLC 7.',
        'Some college programs require CLB/NCLC 5 — check the specific institution list.',
        'PGWP length equals program length for programs 8–23 months; 3 years for programs 24+ months.',
      ],
    },
    source_url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/about.html',
    effective_date: '2024-11-01',
    status: 'active',
  },
  {
    rule_key: 'citizenship_physical_presence',
    category: 'citizenship',
    data: {
      required_days: 1095,
      eligibility_window_years: 5,
      pre_pr_days_count_as_half: true,
      max_pre_pr_credit_days: 365,
      language_required_age_min: 18,
      language_required_age_max: 54,
      minimum_clb_nclc: 4,
      notes: [
        '1,095 days physically present in Canada within the 5 years before applying.',
        'Days spent in Canada before becoming a PR count as half (1 day = 0.5 credited day).',
        'Maximum 365 credited pre-PR days.',
        'Language proof (CLB/NCLC 4+) required for applicants aged 18–54.',
        'Must have filed taxes for at least 3 years within the 5-year window if required.',
      ],
    },
    source_url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-citizenship/become-canadian-citizen/eligibility.html',
    effective_date: '2024-01-01',
    status: 'active',
  },
  {
    rule_key: 'pr_residency_obligation',
    category: 'pr',
    data: {
      required_days_per_5yr: 730,
      window_type: 'rolling_5_years',
      exemptions: [
        {
          key: 'accompanying_citizen_spouse',
          desc: 'Time abroad counts if accompanying a Canadian citizen spouse or common-law partner.',
        },
        {
          key: 'canadian_employer_abroad',
          desc: 'Time abroad counts if employed full-time by a Canadian business or federal/provincial government.',
        },
      ],
      notes: [
        '730 days (2 years) physically in Canada in any rolling 5-year period.',
        'Failing the obligation does not automatically cancel PR — it is assessed when re-entering or renewing PR card.',
        'Exemptions must be documented.',
      ],
    },
    source_url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/understand-pr-status.html',
    effective_date: '2024-01-01',
    status: 'active',
  },
  {
    rule_key: 'proof_of_funds',
    category: 'express_entry',
    data: {
      currency: 'CAD',
      note_year: 2024,
      amounts_by_family_size: {
        1: 13757,
        2: 17127,
        3: 21055,
        4: 25564,
        5: 28994,
        6: 32700,
        7: 36407,
      },
      exemptions: [
        'Applicants with a valid Canadian job offer.',
        'Applicants currently authorized to work in Canada.',
      ],
      notes: [
        'Required for Federal Skilled Worker (FSW) and Federal Skilled Trades (FST) applicants.',
        'Funds must be unencumbered and available.',
        'Family size includes spouse/common-law partner and dependent children.',
        'Verify current amounts — IRCC updates these annually.',
      ],
    },
    source_url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
    effective_date: '2024-01-01',
    status: 'active',
  },
  {
    rule_key: 'crs_job_offer_points_removed',
    category: 'express_entry',
    data: {
      change: 'job_offer_crs_points_removed',
      effective_date: '2025-03-25',
      old_points: { noc_00: 200, other_noc: 50 },
      new_points: 0,
      notes: [
        'As of March 25, 2025, job offers no longer add CRS points.',
        'Arranged employment points (50 or 200) were removed from the CRS grid.',
        'Job offers may still affect PNP stream eligibility.',
      ],
    },
    source_url: 'https://www.canada.ca/en/immigration-refugees-citizenship/news/2025/03/changes-to-express-entry.html',
    effective_date: '2025-03-25',
    status: 'active',
  },
  {
    rule_key: 'french_category_express_entry',
    category: 'express_entry',
    data: {
      draws_available: true,
      categories: [
        {
          label: 'Strong French proficiency',
          condition: 'CLB/NCLC 7+ in French AND CLB 5+ in English',
          bonus_crs_points: 50,
        },
        {
          label: 'Intermediate French proficiency',
          condition: 'CLB/NCLC 7+ in French, limited or no English',
          bonus_crs_points: 25,
        },
      ],
      notes: [
        'French category draws can invite candidates with lower overall CRS scores.',
        'French bonus points are added on top of core CRS score.',
        'TEF Canada and TCF Canada are accepted French tests.',
      ],
    },
    source_url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/submit-profile/rounds-invitations.html',
    effective_date: '2023-11-01',
    status: 'active',
  },
]

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = adminDb()
  const now = new Date().toISOString()
  const errors: string[] = []
  let sourcesUpserted = 0
  let rulesUpserted = 0

  // 1. Seed official_sources
  for (const source of OFFICIAL_SOURCES) {
    const { error } = await db.from('official_sources').upsert(
      { ...source, last_checked_at: null },
      { onConflict: 'url' }
    )
    if (error) errors.push(`Source "${source.name}": ${error.message}`)
    else sourcesUpserted++
  }

  // 2. Seed rule_snapshots
  for (const rule of RULE_SNAPSHOTS) {
    const { error } = await db.from('rule_snapshots').upsert(
      { ...rule, last_checked_at: now },
      { onConflict: 'rule_key' }
    )
    if (error) errors.push(`Rule "${rule.rule_key}": ${error.message}`)
    else rulesUpserted++
  }

  return Response.json({
    ok: errors.length === 0,
    sourcesUpserted,
    rulesUpserted,
    errors: errors.length > 0 ? errors : undefined,
  })
}
