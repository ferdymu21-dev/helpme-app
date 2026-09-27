import { unsaveServiceListingRepository } from "../repositories/saved-service-listing.repository";

export async function unsaveServiceListingService(
  listingId: string,
): Promise<void> {
  await unsaveServiceListingRepository(
    listingId,
  );
}