/**
 * Single source of truth for Navly's plans, prices and feature lists.
 *
 * These used to be hardcoded in four places — the landing page, the pricing
 * page cards, the pricing comparison table, and checkout-success. They had
 * already drifted: the comparison table listed a feature the cards did not,
 * and five labels were worded differently across files. A user could be sold
 * one list and shown another after paying.
 *
 * Change a price or a feature HERE and every surface updates together.
 */

export type Billing = 'monthly' | 'annual'

/**
 * Every feature Navly sells, with the tiers that include it.
 * Order is the order shown in the comparison table and in each plan's card.
 */
export type PlanFeature = {
  /** Shown in the plan cards. */
  label: string
  /** Shorter label for the comparison table. Falls back to `label`. */
  short?: string
  free: boolean
  report: boolean
  tracker: boolean
}

export const PLAN_FEATURES: PlanFeature[] = [
  { label: 'Inside/outside Canada intake',            short: 'Inside/outside Canada intake', free: true,  report: true,  tracker: true  },
  { label: 'Basic CRS score estimate',                short: 'Basic CRS estimate',           free: true,  report: true,  tracker: true  },
  { label: 'FSW 67-point grid check',                 short: 'FSW 67-point check',           free: true,  report: true,  tracker: true  },
  { label: 'Basic pathway overview',                                                          free: true,  report: true,  tracker: true  },
  { label: 'Gap summary — what\'s missing',           short: 'Gap summary',                  free: true,  report: true,  tracker: true  },
  { label: 'Consultant directory (coming soon)',                                              free: true,  report: true,  tracker: true  },

  { label: 'Full CRS + FSW score breakdown',          short: 'Full CRS + FSW breakdown',     free: false, report: true,  tracker: true  },
  { label: 'Top 3 PR pathways ranked for your profile', short: 'Top 3 PR pathways ranked',   free: false, report: true,  tracker: true  },
  { label: 'Gap analysis with risk flags',            short: 'Gap analysis + risk flags',    free: false, report: true,  tracker: true  },
  { label: 'Province-by-province PNP match',          short: 'PNP province match',           free: false, report: true,  tracker: true  },
  { label: 'Timeline estimate to eligibility',                                                free: false, report: true,  tracker: true  },
  { label: 'Best next actions — personalized',                                                free: false, report: true,  tracker: true  },
  { label: 'Consultant-ready PDF summary',            short: 'Consultant-ready PDF',         free: false, report: true,  tracker: true  },
  { label: 'Score improvement roadmap',                                                       free: false, report: true,  tracker: true  },

  { label: 'Canada physical presence days tracker',   short: 'Canada days tracker',          free: false, report: false, tracker: true  },
  { label: 'Permit expiry reminders',                                                         free: false, report: false, tracker: true  },
  { label: 'Express Entry draw alerts',                                                       free: false, report: false, tracker: true  },
  { label: 'Score updates when your profile or IRCC rules change', short: 'Auto score updates', free: false, report: false, tracker: true  },
  { label: 'Progress history',                                                                 free: false, report: false, tracker: true  },
  { label: 'AI immigration assistant',                                                         free: false, report: false, tracker: true  },
]

export type Tier = 'free' | 'report' | 'tracker'

/** Feature labels included in a tier, in display order. */
export function featuresFor(tier: Tier): string[] {
  return PLAN_FEATURES.filter(f => f[tier]).map(f => f.label)
}

/**
 * What a tier does NOT include, phrased as the negatives shown on the cards.
 * Derived, so it can never contradict the feature table.
 */
export const REPORT_EXCLUSIONS = [
  'No live updates or alerts',
  'No Canada days tracker',
  'No AI assistant',
] as const

export const PLANS = {
  free: {
    name: 'Free Check',
    price: '$0',
    priceNote: 'forever',
    desc: "Find out if you're on the right track.",
    cta: 'Start Free',
    href: '/onboarding',
  },
  report: {
    name: 'Readiness Report',
    price: '$69.99',
    priceNote: 'one-time',
    desc: 'A deep-dive PDF snapshot of your PR readiness — ready to share with a consultant.',
    cta: 'Get My Report',
    href: '/pricing',
  },
  tracker: {
    name: 'PR Tracker',
    price: '$119.99',
    priceNote: '/ year',
    priceMonthly: '$14.99',
    monthlyNote: 'or $14.99/month, billed monthly',
    desc: 'Full breakdown, daily tracking, permit alerts, and AI assistant — everything in one plan.',
    cta: 'Start Free 7-Day Trial',
    href: '/pricing',
    badge: 'Best value',
    trialDays: 7,
  },
} as const
