import type { IntakeData } from './profile'

export type DeadlineType =
  | 'work_permit'
  | 'study_permit'
  | 'pgwp'
  | 'visitor_record'
  | 'passport'
  | 'language_test'
  | 'pr_card'

export type DeadlineStatus = 'on_track' | 'action_soon' | 'urgent' | 'expired'

export type Deadline = {
  id: string
  type: DeadlineType
  label: string
  date: string           // YYYY-MM-DD (normalized — YYYY-MM inputs use last day of month)
  daysUntil: number      // negative = already expired
  status: DeadlineStatus
  source: 'user_entered' | 'calculated'
  relevant: boolean      // false = not applicable to this user's situation
  action: string         // what the user should do
  officialUrl: string    // canada.ca link
  note?: string          // extra context shown below the action
}

// ─── Thresholds ───────────────────────────────────────────────────────────────

const URGENT_DAYS = 60
const ACTION_SOON_DAYS = 180

// Alert schedule (days before expiry when reminders fire)
export const ALERT_DAYS = [180, 120, 90, 60, 30, 7] as const

// ─── Date helpers ─────────────────────────────────────────────────────────────

// For YYYY-MM permit dates we use the last day of that month so the user
// gets the maximum benefit of the doubt on their deadline window.
function lastDayOfMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-').map(Number)
  return new Date(y, m, 0).toISOString().slice(0, 10)
}

export function normalizeDate(raw: string): string | null {
  if (!raw) return null
  if (/^\d{4}-\d{2}$/.test(raw)) return lastDayOfMonth(raw)
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  return null
}

export function daysUntilDate(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((target.getTime() - today.getTime()) / 86_400_000)
}

function statusFromDays(days: number): DeadlineStatus {
  if (days < 0) return 'expired'
  if (days <= URGENT_DAYS) return 'urgent'
  if (days <= ACTION_SOON_DAYS) return 'action_soon'
  return 'on_track'
}

export function formatDeadlineDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

// ─── Per-type config ──────────────────────────────────────────────────────────

type Config = {
  label: string
  action: string
  expiredAction: string   // safe wording when the date has already passed
  officialUrl: string
  note?: string
}

const CONFIGS: Record<DeadlineType, Config> = {
  work_permit: {
    label: 'Work permit',
    action: 'Review extension or PR pathway options. Apply well before expiry — processing times vary.',
    expiredAction: 'Your work permit date has passed. Review your status and get professional guidance as soon as possible.',
    officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/permit/temporary/extend.html',
  },
  study_permit: {
    label: 'Study permit',
    action: 'Review extension or post-graduation options. Apply before your current permit expires.',
    expiredAction: 'Your study permit date has passed. Review your status and get professional guidance as soon as possible.',
    officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/extend-study-permit.html',
  },
  pgwp: {
    label: 'Post-graduation work permit (PGWP)',
    action: 'Review PR pathway options. The PGWP cannot be renewed — plan your next step before it expires.',
    expiredAction: 'Your PGWP date has passed. The PGWP cannot be renewed. Review PR pathway options or Bridging Open Work Permit (BOWP) eligibility with a licensed RCIC.',
    officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/work/after-graduation/work-permit.html',
    note: 'PGWPs cannot be extended. If your PR application is in progress, you may be eligible for a Bridging Open Work Permit (BOWP) if your permit expires before a decision.',
  },
  visitor_record: {
    label: 'Visitor status',
    action: 'Apply to extend visitor status, or explore a work or study permit if eligible.',
    expiredAction: 'Your visitor status date has passed. Review your situation with a licensed RCIC or immigration lawyer.',
    officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/extend-stay.html',
    note: 'Visitor status alone does not lead directly to permanent residence in most cases.',
  },
  passport: {
    label: 'Passport',
    action: 'Renew your passport before applying for any permit or travelling internationally.',
    expiredAction: 'Your passport has expired. Renew it before applying for any immigration status or travelling internationally.',
    officialUrl: 'https://www.passport.gc.ca/renewal/eu/renewalAdult.aspx',
    note: 'Most immigration applications require a passport valid for at least 6 months beyond your intended period of stay.',
  },
  language_test: {
    label: 'Language test results',
    action: 'Book a new test before your scores expire. Expired scores cannot be used in Express Entry applications.',
    expiredAction: 'Your language test scores may have expired (estimated). Book a new test before submitting any Express Entry or PR application.',
    officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-requirements/language-testing.html',
    note: 'IRCC requires language test scores to be less than 2 years old at the time you are invited to apply for permanent residence.',
  },
  pr_card: {
    label: 'PR card',
    action: 'Apply to renew your PR card before any international travel.',
    expiredAction: 'Your PR card has expired. An expired PR card does not affect your PR status, but you need a valid PR card or PRTD to board a flight back to Canada.',
    officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/new-immigrants/pr-card/apply-renew-replace.html',
    note: 'An expired PR card does not affect your permanent resident status — you can still live and work in Canada. However, you need a valid PR card or a Permanent Resident Travel Document (PRTD) to board a flight back to Canada after travelling abroad.',
  },
}

// ─── Relevance ────────────────────────────────────────────────────────────────

function isRelevant(type: DeadlineType, profile: IntakeData): boolean {
  const { status, goal, locationStatus } = profile
  const isInside = locationStatus === 'inside'
  switch (type) {
    case 'work_permit':
      return status === 'work-permit' || status === 'family-member'
    case 'study_permit':
      return status === 'student'
    case 'pgwp':
      return !!profile.pgwpExpiry
    case 'visitor_record':
      return status === 'visitor'
    case 'passport':
      // Everyone inside Canada or actively pursuing any immigration goal
      return isInside || (!!goal && goal !== 'other' && goal !== '')
    case 'language_test':
      // Only when pursuing a goal that requires language scores
      return !!(
        profile.langTestDate &&
        (goal === 'pr' || goal === 'citizenship' || goal === 'work-permit' || goal === 'study-permit')
      )
    case 'pr_card':
      return status === 'pr'
    default:
      return false
  }
}

// ─── Engine ───────────────────────────────────────────────────────────────────

function push(
  out: Deadline[],
  type: DeadlineType,
  raw: string | undefined,
  profile: IntakeData,
  source: 'user_entered' | 'calculated' = 'user_entered',
) {
  if (!raw) return
  const date = normalizeDate(raw)
  if (!date) return
  const days = daysUntilDate(date)
  const cfg = CONFIGS[type]
  const status = statusFromDays(days)
  out.push({
    id: type,
    type,
    label: cfg.label,
    date,
    daysUntil: days,
    status,
    source,
    relevant: isRelevant(type, profile),
    action: status === 'expired' ? cfg.expiredAction : cfg.action,
    officialUrl: cfg.officialUrl,
    note: cfg.note,
  })
}

// Returns all deadlines derived from the profile, including non-relevant ones.
// Use getActiveDeadlines() for the filtered, sorted list shown in the UI.
export function computeDeadlines(profile: IntakeData): Deadline[] {
  const out: Deadline[] = []

  // Work permit — stored as YYYY-MM
  push(out, 'work_permit', profile.permitExpiry, profile)

  // Study permit — uses visaExpiryDate (exact date) or permitExpiry (month)
  if (profile.status === 'student') {
    push(out, 'study_permit', profile.visaExpiryDate || profile.permitExpiry, profile)
  }

  // PGWP expiry — stored as YYYY-MM
  push(out, 'pgwp', profile.pgwpExpiry, profile)

  // Visitor record — stored as YYYY-MM-DD
  push(out, 'visitor_record', profile.visitorRecordExpiry, profile)

  // Passport — stored as YYYY-MM
  push(out, 'passport', profile.passportExpiry, profile)

  // Language test expiry — calculated as test date + 2 years
  if (profile.langTestDate) {
    const d = new Date(profile.langTestDate + 'T12:00:00')
    d.setFullYear(d.getFullYear() + 2)
    push(out, 'language_test', d.toISOString().slice(0, 10), profile, 'calculated')
  }

  // PR card — stored as YYYY-MM
  push(out, 'pr_card', profile.prCardExpiry, profile)

  return out
}

// Returns only relevant deadlines, sorted by urgency then by days remaining.
// Deletion always wins: the tombstone approach in the sync layer handles travel log;
// deadlines are derived from profile fields so they never have stale deletions.
export function getActiveDeadlines(profile: IntakeData): Deadline[] {
  const ORDER: DeadlineStatus[] = ['expired', 'urgent', 'action_soon', 'on_track']
  return computeDeadlines(profile)
    .filter((d) => d.relevant)
    .sort((a, b) => {
      const diff = ORDER.indexOf(a.status) - ORDER.indexOf(b.status)
      return diff !== 0 ? diff : a.daysUntil - b.daysUntil
    })
}

// Returns a short summary suitable for showing in the dashboard "Action Required" strip.
// Only returns deadlines that need attention (not on_track).
export function getUrgentDeadlines(profile: IntakeData): Deadline[] {
  return getActiveDeadlines(profile).filter((d) => d.status !== 'on_track')
}
