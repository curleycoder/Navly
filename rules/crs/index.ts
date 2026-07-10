import { crsBase2024 } from './2024-01-01'
import { crsJobOfferRemoved2025 } from './2025-03-25'
import type { VersionedRule } from '../types'
import type { CRSTableData } from './types'

/** All CRS rule versions, in any order. getActiveRule() picks the right one by date. */
export const crsVersions: VersionedRule<CRSTableData>[] = [
  crsBase2024,
  crsJobOfferRemoved2025,
]

export type { CRSTableData }
