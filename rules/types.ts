/** A versioned IRCC rule dataset. T is the shape of the rule's data payload. */
export type VersionedRule<T> = {
  /** When IRCC made these values effective. Format: YYYY-MM-DD */
  effectiveDate: string
  /** When Navly last confirmed this against the official source. Format: YYYY-MM-DD */
  verifiedDate: string
  /** Official IRCC or provincial source URL */
  sourceUrl: string
  /** ID of the rule version this supersedes, e.g. "crs-base@2024-01-01". Null for the base version. */
  supersedes: string | null
  data: T
}
