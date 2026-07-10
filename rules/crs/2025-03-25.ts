import type { VersionedRule } from '../types'
import type { CRSTableData } from './types'
import { crsBase2024 } from './2024-01-01'

/**
 * CRS update: arranged employment (job offer) no longer adds points to the CRS score.
 * Effective March 25, 2025. All other tables are unchanged from the 2024 base.
 *
 * Note: job offers may still strengthen PNP stream eligibility and FSW adaptability.
 * Only the CRS additional-points component is affected.
 */
export const crsJobOfferRemoved2025: VersionedRule<CRSTableData> = {
  effectiveDate: '2025-03-25',
  verifiedDate:  '2026-06-01',
  // The March 25, 2025 change is documented inline on the CRS criteria page — no separate notice URL exists.
  sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html',
  supersedes: 'crs-base@2024-01-01',
  data: {
    ...crsBase2024.data,
    additional: {
      ...crsBase2024.data.additional,
      arrangedEmployment: { teer01: 0, teer23: 0 },
    },
  },
}
