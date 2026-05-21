// IRCC proof of settlement funds requirements for Federal Skilled Worker (Express Entry).
// IRCC updates these amounts annually, typically in the spring, based on LICO tables.
// Source: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html
//
// TO UPDATE: change `byFamilySize` values and set `lastCheckedAt` to today's date.

export const SETTLEMENT_FUNDS = {
  lastCheckedAt: '2024-04-01',
  sourceUrl:
    'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/proof-funds.html',
  byFamilySize: {
    1: 13757,
    2: 17127,
    3: 21055,
    4: 25564,
    5: 28994,
    6: 32700,
    7: 36407,
  } as Record<number, number>,
}

export function getRequiredFunds(familySize: number): number {
  const capped = Math.min(Math.max(familySize, 1), 7)
  return SETTLEMENT_FUNDS.byFamilySize[capped]
}
