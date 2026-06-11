export type EEDraw = {
  date: string
  type: string
  cutoff: number
  invited?: number
}

// Draw category keys — used for tab filtering
export type DrawCategory =
  | 'All programs'
  | 'Canadian Experience Class'
  | 'Federal Skilled Worker'
  | 'Provincial Nominee Program'
  | 'French Language Proficiency'

export const DRAW_CATEGORIES: DrawCategory[] = [
  'All programs',
  'Canadian Experience Class',
  'Federal Skilled Worker',
  'Provincial Nominee Program',
  'French Language Proficiency',
]

// ─── Staleness tracking ───────────────────────────────────────────────────────
// Run scripts/add-draw.ts after each IRCC draw — it updates this date automatically.
// IRCC source: canada.ca/.../express-entry/submit-profile/rounds-invitations.html
export const DRAWS_LAST_UPDATED = '2026-05-28'

// Update this array by running: npx ts-node scripts/add-draw.ts --type "..." --date "..." --cutoff N --invited N
// Always prepend the newest draw — the first entry is treated as the latest.
export const recentDraws: EEDraw[] = [
  { date: 'May 28, 2026', type: 'French Language Proficiency',   cutoff: 409, invited: 4500 },
  { date: 'May 27, 2026', type: 'Canadian Experience Class',     cutoff: 518, invited: 3000 },
  { date: 'May 25, 2026', type: 'Provincial Nominee Program',    cutoff: 805, invited: 334  },
  { date: 'May 11, 2026', type: 'Provincial Nominee Program',    cutoff: 798, invited: 380  },
  { date: 'Apr 29, 2026', type: 'French Language Proficiency',   cutoff: 400, invited: 4000 },
  { date: 'Apr 28, 2026', type: 'Canadian Experience Class',     cutoff: 514, invited: 2000 },
  { date: 'Apr 27, 2026', type: 'Provincial Nominee Program',    cutoff: 795, invited: 473  },
  { date: 'Apr 23, 2026', type: 'All programs',                  cutoff: 491, invited: 4500 },
  { date: 'Apr 9, 2026',  type: 'All programs',                  cutoff: 488, invited: 4300 },
  { date: 'Mar 26, 2026', type: 'Canadian Experience Class',     cutoff: 504, invited: 2000 },
  { date: 'Mar 12, 2026', type: 'All programs',                  cutoff: 485, invited: 4500 },
  { date: 'Feb 26, 2026', type: 'Federal Skilled Worker',        cutoff: 511, invited: 1500 },
  { date: 'Feb 12, 2026', type: 'All programs',                  cutoff: 482, invited: 4500 },
  { date: 'Jan 22, 2026', type: 'Canadian Experience Class',     cutoff: 496, invited: 2000 },
  { date: 'Jan 8, 2026',  type: 'All programs',                  cutoff: 478, invited: 4300 },
  { date: 'Dec 18, 2025', type: 'Provincial Nominee Program',    cutoff: 792, invited: 1000 },
  { date: 'Dec 4, 2025',  type: 'All programs',                  cutoff: 474, invited: 4500 },
  { date: 'Nov 20, 2025', type: 'Canadian Experience Class',     cutoff: 488, invited: 2000 },
  { date: 'Nov 6, 2025',  type: 'All programs',                  cutoff: 470, invited: 4500 },
  { date: 'Oct 23, 2025', type: 'Federal Skilled Worker',        cutoff: 508, invited: 1500 },
  { date: 'Oct 9, 2025',  type: 'All programs',                  cutoff: 468, invited: 4500 },
  { date: 'Sep 25, 2025', type: 'Canadian Experience Class',     cutoff: 481, invited: 2000 },
  { date: 'Sep 11, 2025', type: 'All programs',                  cutoff: 465, invited: 4300 },
]

/** Returns the most recent All Programs draw, or the most recent draw of any type as fallback. */
export function getLatestCutoff(): EEDraw {
  return (
    recentDraws.find((d) => d.type === 'All programs') ??
    recentDraws[0]
  )
}

/** Returns the most recent draw for a specific category, or null if none exists. */
export function getLatestByType(type: DrawCategory): EEDraw | null {
  return recentDraws.find((d) => d.type === type) ?? null
}

/** Returns all draws for a specific category. */
export function getDrawsByType(type: DrawCategory): EEDraw[] {
  return recentDraws.filter((d) => d.type === type)
}
