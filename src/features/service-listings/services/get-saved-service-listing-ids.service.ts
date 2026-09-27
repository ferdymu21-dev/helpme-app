import { getSavedServiceListingIdsRepository } from "../repositories/saved-service-listing.repository";

export async function getSavedServiceListingIdsService(): Promise<string[]> {
  return getSavedServiceListingIdsRepository();
}