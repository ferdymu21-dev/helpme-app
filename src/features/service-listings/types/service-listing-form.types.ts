import type {
  ServiceModeValue,
} from "../constants/service-mode";

export interface ServiceListingFormValues {
  title: string;

  category: string;

  customCategory: string;

  description: string;

  deliverables: string;

  customerPreparation: string;

  priceFrom: string;

  isNegotiable: boolean;

  serviceMode: ServiceModeValue;

  locationName: string;
}