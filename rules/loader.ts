import type { VersionedRule } from './types'

const STALE_DAYS = 90

/**
 * Returns the rule version whose effectiveDate is the closest to (and not after) `asOf`.
 * Defaults to today. Throws if no version qualifies — every ruleset must have at least one
 * version effective before any date the app runs.
 */
export function getActiveRule<T>(
  versions: VersionedRule<T>[],
  asOf: string = new Date().toISOString().slice(0, 10),
): VersionedRule<T> {
  const sorted = versions
    .filter(v => v.effectiveDate <= asOf)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))
  if (sorted.length === 0) {
    throw new Error(`No rule version is effective as of ${asOf}`)
  }
  return sorted[0]
}

/**
 * Returns true if verifiedDate is more than STALE_DAYS days ago.
 * Use in CI or a weekly cron to catch rules that haven't been re-checked against IRCC.
 */
export function isStale(rule: VersionedRule<unknown>): boolean {
  const verified = new Date(rule.verifiedDate + 'T12:00:00')
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - STALE_DAYS)
  return verified < cutoff
}
