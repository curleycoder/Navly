// IRCC proof of settlement funds requirements for Federal Skilled Worker (Express Entry).
// IRCC updates these amounts annually, typically in the spring, based on LICO tables.
// Source: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html
//
// TO UPDATE: change `byFamilySize` values and set `lastCheckedAt` to today's date.

export const SETTLEMENT_FUNDS = {
  lastCheckedAt: '2026-08-15',
  sourceUrl:
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
  // IRCC update effective mid-2025. KEEP IN SYNC with lib/profile.ts SETTLEMENT_FUNDS.
  byFamilySize: {
    1: 15263,
    2: 19001,
    3: 23360,
    4: 28362,
    5: 32168,
    6: 36280,
    7: 40392,
  } as Record<number, number>,
}

export function getRequiredFunds(familySize: number): number {
  const capped = Math.min(Math.max(familySize, 1), 7)
  return SETTLEMENT_FUNDS.byFamilySize[capped]
}
