import type { VersionedRule } from '../types'
import type { CLBTableData } from './types'

/**
 * IRCC Canadian Language Benchmark equivalency tables.
 * IELTS General, PTE Core, TEF, TCF lookup tables and CELPIP direct mapping.
 * Sources: IRCC language requirements pages and official test-provider equivalency charts.
 *
 * PTE Core tables reflect the corrected IRCC equivalency (updated ~2025).
 * TEF/TCF tables reflect IRCC official equivalency for Express Entry.
 */
export const clbConversion2025: VersionedRule<CLBTableData> = {
  effectiveDate: '2025-01-01',
  verifiedDate:  '2026-06-01',
  sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/documents/language-requirements/language-testing.html',
  supersedes: null,
  data: {
    ieltsGeneral: {
      r: [[8.0,10],[7.0,9],[6.5,8],[6.0,7],[5.0,6],[4.0,5],[3.5,4]],
      w: [[7.5,10],[7.0,9],[6.5,8],[6.0,7],[5.5,6],[5.0,5],[4.0,4]],
      l: [[8.5,10],[8.0,9],[7.5,8],[6.0,7],[5.5,6],[5.0,5],[4.5,4]],
      s: [[7.5,10],[7.0,9],[6.5,8],[6.0,7],[5.5,6],[5.0,5],[4.0,4]],
    },

    pteCore: {
      r: [[88,10],[78,9],[69,8],[60,7],[51,6],[42,5],[33,4],[24,3]],
      w: [[90,10],[88,9],[79,8],[69,7],[60,6],[51,5],[41,4],[32,3]],
      l: [[89,10],[82,9],[71,8],[60,7],[50,6],[39,5],[28,4],[18,3]],
      s: [[89,10],[84,9],[76,8],[68,7],[59,6],[51,5],[42,4],[34,3]],
    },

    tef: {
      r: [[206,10],[181,9],[151,8],[121,7],[91,6],[71,5],[60,4]],
      w: [[393,10],[349,9],[310,8],[271,7],[226,6],[181,5],[151,4]],
      l: [[316,10],[298,9],[280,8],[249,7],[217,6],[181,5],[145,4]],
      s: [[393,10],[349,9],[310,8],[271,7],[226,6],[181,5],[151,4]],
    },

    tcf: {
      r: [[549,10],[524,9],[499,8],[453,7],[406,6],[375,5],[342,4]],
      w: [[16,10],[14,9],[12,8],[10,7],[7,6],[6,5],[4,4]],
      l: [[549,10],[523,9],[503,8],[458,7],[398,6],[369,5],[331,4]],
      s: [[16,10],[14,9],[12,8],[10,7],[7,6],[6,5],[4,4]],
    },

    celpip: { min: 3, max: 10 },
  },
}
