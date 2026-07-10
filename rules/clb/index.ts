import { clbConversion2025 } from './2025-01-01'
import type { VersionedRule } from '../types'
import type { CLBTableData } from './types'

/** All CLB conversion rule versions, in any order. getActiveRule() picks the right one by date. */
export const clbVersions: VersionedRule<CLBTableData>[] = [
  clbConversion2025,
]

export type { CLBTableData }
