import type {
  ServiceListingImageKindValue,
} from "../constants/service-listing-image-kind";

export interface ServiceListingMediaRpcRow {
  id: string;

  service_listing_id: string;

  storage_path: string;

  kind: ServiceListingImageKindValue;

  sort_order: number;

  created_at: string;
}

export interface ProviderServiceListingMedia {
  id: string;

  serviceListingId: string;

  storagePath: string;

  kind: ServiceListingImageKindValue;

  sortOrder: number;

  createdAt: string;

  publicUrl: string;
}

export interface UploadServiceListingMediaResult {
  imageId: string;

  kind: ServiceListingImageKindValue;

  sortOrder: number;

  publicUrl: string;
}

export interface DeleteServiceListingMediaResult {
  imageId: string;

  kind: ServiceListingImageKindValue;
}

export interface UploadServiceListingMediaServerInput {
  listingId: string;

  providerId: string;

  file: File;
}

export interface DeleteServiceListingMediaServerInput {
  listingId: string;

  providerId: string;

  imageId: string;
}