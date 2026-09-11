import "server-only";

import {
  ServiceListingImageKind,
} from "../constants/service-listing-image-kind";

import {
  addServiceListingPortfolioMetadataRepository,
  deleteServiceListingImageMetadataRepository,
  getServiceListingMediaPublicUrl,
  removeServiceListingMediaObject,
  setServiceListingCoverMetadataRepository,
  uploadServiceListingMediaObject,
} from "../repositories/service-listing-media.server.repository";

import type {
  DeleteServiceListingMediaResult,
  DeleteServiceListingMediaServerInput,
  UploadServiceListingMediaResult,
  UploadServiceListingMediaServerInput,
} from "../types/service-listing-media.types";

import {
  validateAndNormalizeServiceListingImageId,
  validateAndNormalizeServiceListingMediaListingId,
  validateAndNormalizeServiceProviderId,
  validateServiceListingMediaFile,
} from "../validators/validate-service-listing-media";

async function tryRemoveStorageObject(
  storagePath: string,
): Promise<void> {
  try {
    await removeServiceListingMediaObject(
      storagePath,
    );
  } catch (error) {
    console.error(
      "SERVICE LISTING MEDIA CLEANUP ERROR:",
      error,
    );
  }
}

function buildStoragePath(
  providerId: string,
  listingId: string,
  directory:
    | "cover"
    | "portfolio",
  extension: string,
): string {
  return (
    `${providerId}/` +
    `${listingId}/` +
    `${directory}/` +
    `${crypto.randomUUID()}.${extension}`
  );
}

export async function uploadServiceListingCoverService({
  listingId,
  providerId,
  file,
}: UploadServiceListingMediaServerInput): Promise<UploadServiceListingMediaResult> {
  const normalizedListingId =
    validateAndNormalizeServiceListingMediaListingId(
      listingId,
    );

  const normalizedProviderId =
    validateAndNormalizeServiceProviderId(
      providerId,
    );

  const {
    extension,
    contentType,
  } =
    validateServiceListingMediaFile(
      file,
    );

  const storagePath =
    buildStoragePath(
      normalizedProviderId,
      normalizedListingId,
      "cover",
      extension,
    );

  await uploadServiceListingMediaObject(
    storagePath,
    file,
    contentType,
  );

  let metadata;

  try {
    metadata =
      await setServiceListingCoverMetadataRepository(
        normalizedListingId,
        normalizedProviderId,
        storagePath,
      );
  } catch (error) {
    await tryRemoveStorageObject(
      storagePath,
    );

    throw error;
  }

  if (
    metadata.replacedStoragePath &&
    metadata.replacedStoragePath !==
      storagePath
  ) {
    await tryRemoveStorageObject(
      metadata.replacedStoragePath,
    );
  }

  return {
    imageId:
      metadata.imageId,

    kind:
      ServiceListingImageKind.COVER,

    sortOrder:
      0,

    publicUrl:
      getServiceListingMediaPublicUrl(
        storagePath,
      ),
  };
}

export async function uploadServiceListingPortfolioImageService({
  listingId,
  providerId,
  file,
}: UploadServiceListingMediaServerInput): Promise<UploadServiceListingMediaResult> {
  const normalizedListingId =
    validateAndNormalizeServiceListingMediaListingId(
      listingId,
    );

  const normalizedProviderId =
    validateAndNormalizeServiceProviderId(
      providerId,
    );

  const {
    extension,
    contentType,
  } =
    validateServiceListingMediaFile(
      file,
    );

  const storagePath =
    buildStoragePath(
      normalizedProviderId,
      normalizedListingId,
      "portfolio",
      extension,
    );

  await uploadServiceListingMediaObject(
    storagePath,
    file,
    contentType,
  );

  let metadata;

  try {
    metadata =
      await addServiceListingPortfolioMetadataRepository(
        normalizedListingId,
        normalizedProviderId,
        storagePath,
      );
  } catch (error) {
    await tryRemoveStorageObject(
      storagePath,
    );

    throw error;
  }

  return {
    imageId:
      metadata.imageId,

    kind:
      ServiceListingImageKind.PORTFOLIO,

    sortOrder:
      metadata.sortOrder,

    publicUrl:
      getServiceListingMediaPublicUrl(
        storagePath,
      ),
  };
}

export async function deleteServiceListingImageService({
  listingId,
  providerId,
  imageId,
}: DeleteServiceListingMediaServerInput): Promise<DeleteServiceListingMediaResult> {
  const normalizedListingId =
    validateAndNormalizeServiceListingMediaListingId(
      listingId,
    );

  const normalizedProviderId =
    validateAndNormalizeServiceProviderId(
      providerId,
    );

  const normalizedImageId =
    validateAndNormalizeServiceListingImageId(
      imageId,
    );

  const metadata =
    await deleteServiceListingImageMetadataRepository(
      normalizedListingId,
      normalizedProviderId,
      normalizedImageId,
    );

  await tryRemoveStorageObject(
    metadata.storagePath,
  );

  return {
    imageId:
      normalizedImageId,

    kind:
      metadata.kind,
  };
}