/**
 * Canonical HelpMe Jasa listing configuration.
 *
 * Business invariants that are also enforced by PostgreSQL
 * must remain aligned with the corresponding Service
 * migration/RPC implementation.
 */
export const ServiceListingConfig = {
  /**
   * Exact publication period:
   * 30 * 24 * 60 * 60 seconds.
   */
  publicationDurationSeconds: 2_592_000,

  /**
   * Flat HelpMe Jasa publication / renewal fee.
   *
   * This value is authoritative only when read by trusted
   * server-side publication orchestration.
   *
   * The browser may display this value, but it never supplies
   * the amount used to create a payment.
   */
  publicationFeeAmount: 5_000,

  /**
   * Maximum number of reserved live listing slots
   * owned by one Provider.
   *
   * Authoritative enforcement happens inside the
   * trusted publication transaction.
   */
  maxReservedSlots: 5,

  /**
   * Promotional entitlement:
   * the Provider's first successful publication is free.
   *
   * This value is supplied only by trusted server code
   * when calling the first-free publication RPC.
   */
  firstListingFreeEnabled: true,

  /**
   * Listing media rules.
   */
  maxPortfolioImages: 5,

  coverSortOrder: 0,

  /**
   * Listing pagination rules.
   *
   * These values intentionally match the M4A RPC limits.
   */
  pagination: {
    defaultPage: 1,

    defaultPageSize: 20,

    maxPageSize: 50,
  },
} as const;