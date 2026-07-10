import type { VersionedRule } from '../types'
import type { CRSTableData } from './types'

/**
 * Base CRS point tables as used through 2024.
 * Arranged employment adds 200 pts (TEER 0/1) or 50 pts (TEER 2/3) — superseded 2025-03-25.
 * Source: IRCC Comprehensive Ranking System (CRS) grid
 */
export const crsBase2024: VersionedRule<CRSTableData> = {
  effectiveDate: '2024-01-01',
  verifiedDate:  '2026-06-01',
  sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html',
  supersedes: null,
  data: {
    age: [
      { from: 18, to: 18, noSpouse: 99,  withSpouse: 90  },
      { from: 19, to: 19, noSpouse: 105, withSpouse: 95  },
      { from: 20, to: 29, noSpouse: 110, withSpouse: 100 },
      { from: 30, to: 30, noSpouse: 105, withSpouse: 95  },
      { from: 31, to: 31, noSpouse: 99,  withSpouse: 90  },
      { from: 32, to: 32, noSpouse: 94,  withSpouse: 85  },
      { from: 33, to: 33, noSpouse: 88,  withSpouse: 80  },
      { from: 34, to: 34, noSpouse: 83,  withSpouse: 75  },
      { from: 35, to: 35, noSpouse: 77,  withSpouse: 70  },
      { from: 36, to: 36, noSpouse: 72,  withSpouse: 65  },
      { from: 37, to: 37, noSpouse: 66,  withSpouse: 60  },
      { from: 38, to: 38, noSpouse: 61,  withSpouse: 55  },
      { from: 39, to: 39, noSpouse: 55,  withSpouse: 50  },
      { from: 40, to: 40, noSpouse: 50,  withSpouse: 45  },
      { from: 41, to: 41, noSpouse: 39,  withSpouse: 35  },
      { from: 42, to: 42, noSpouse: 28,  withSpouse: 25  },
      { from: 43, to: 43, noSpouse: 17,  withSpouse: 15  },
      { from: 44, to: 44, noSpouse: 6,   withSpouse: 5   },
    ],

    education: {
      noSpouse: {
        'less-than-secondary': 0,  secondary: 30,
        '1-year': 90,  '2-year': 98,  bachelors: 120,
        'two-credentials': 128,  masters: 135,  professional: 135,  doctoral: 150,
      },
      withSpouse: {
        'less-than-secondary': 0,  secondary: 28,
        '1-year': 84,  '2-year': 91,  bachelors: 112,
        'two-credentials': 119,  masters: 126,  professional: 126,  doctoral: 140,
      },
    },

    firstLanguageSkill: [
      { minCLB: 10, noSpouse: 34, withSpouse: 32 },
      { minCLB: 9,  noSpouse: 31, withSpouse: 29 },
      { minCLB: 8,  noSpouse: 23, withSpouse: 22 },
      { minCLB: 7,  noSpouse: 17, withSpouse: 16 },
      { minCLB: 6,  noSpouse: 9,  withSpouse: 8  },
      { minCLB: 4,  noSpouse: 6,  withSpouse: 6  },
    ],

    canadianWork: {
      noSpouse:  [0, 40, 53, 64, 72, 80],
      withSpouse: [0, 35, 46, 56, 63, 70],
    },

    skillTransferability: {
      advancedEducation:  ['bachelors', 'two-credentials', 'masters', 'professional', 'doctoral'],
      anyPostEducation: ['1-year', '2-year', 'bachelors', 'two-credentials', 'masters', 'professional', 'doctoral'],
      // [highA+highB, highA+lowB, lowA+highB, lowA+lowB] — see CRSTableData for key definitions
      educationLanguage: [50, 25, 25, 13],
      educationCanadian: [50, 25, 25, 13],
      foreignLanguage:   [50, 25, 25, 13],
      foreignCanadian:   [50, 25, 25, 13],
      maxPerCategory: 50,
      maxTotal: 100,
    },

    additional: {
      arrangedEmployment: { teer01: 200, teer23: 50 }, // superseded by 2025-03-25
      canadianEducation:  { oneToTwo: 15, threePlus: 30 },
      sibling: 15,
      pnpNomination: 600,
    },
  },
}
