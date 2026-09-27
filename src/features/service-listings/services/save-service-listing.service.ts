import { saveServiceListingRepository } from "../repositories/saved-service-listing.repository";

export async function saveServiceListingService(
  listingId: string,
): Promise<void> {
  await saveServiceListingRepository(
    listingId,
  );
}