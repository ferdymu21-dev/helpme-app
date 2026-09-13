import "server-only";

import { expireDueServiceListingsRepository } from "../repositories/expire-due-service-listings.server.repository";

export interface RunServiceListingExpirationResult {
  expired: number;
}

export async function runServiceListingExpirationService(): Promise<RunServiceListingExpirationResult> {
  const expired = await expireDueServiceListingsRepository();

  return {
    expired,
  };
}
