export type EEDraw = {
  date: string
  type: string
  cutoff: number
  invited?: number
}

// Update this array as new draws are published at canada.ca/en/immigration-refugees-citizenship/corporate/mandate/policies-operational-instructions-agreements/ministerial-instructions/express-entry-rounds.html
export const recentDraws: EEDraw[] = [
  { date: 'Apr 23, 2026', type: 'All programs', cutoff: 491, invited: 4500 },
  { date: 'Apr 9, 2026', type: 'All programs', cutoff: 488, invited: 4300 },
  { date: 'Mar 26, 2026', type: 'Canadian Experience Class', cutoff: 504, invited: 2000 },
]
