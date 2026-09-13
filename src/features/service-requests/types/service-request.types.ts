import { ServiceMode } from "@/features/service-listings/constants/service-mode";

export type ServiceRequestMode =
  | typeof ServiceMode.ONLINE
  | typeof ServiceMode.OFFLINE;

export interface CreateServiceRequestInput {
  listingId: string;

  requestDescription: string;

  neededAt: string;

  serviceMode: ServiceRequestMode;

  locationName: string | null;

  budget: number | null;
}

export interface CreateServiceRequestResult {
  requestId: string;
}

export interface CreateServiceRequestFormValues {
  requestDescription: string;

  neededAt: string;

  serviceMode: ServiceRequestMode | "";

  locationName: string;

  budget: string;
}