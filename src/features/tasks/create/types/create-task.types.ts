import type { FormEvent } from "react";

import type { PaymentResult } from "@/features/payments/types/paymentResult";

export type LocationMethod = "SEARCH" | "MANUAL";

export interface NominatimLocation {
  place_id: number;

  display_name: string;

  lat: string;

  lon: string;
}

export interface TaskCategory {
  name: string;

  icon: string;
}

/*
|--------------------------------------------------------------------------
| PREMIUM TASK
|--------------------------------------------------------------------------
*/

export type PremiumTaskServiceType = "URGENT_TASK";

export interface PremiumTaskService {
  type: PremiumTaskServiceType;

  amount: number;
}

export interface HandleCreateTaskParams {
  title: string;

  description: string;

  category: string;

  budget: string;

  taskDate: string;

  taskTime: string;

  isUrgent: boolean;

  premiumServices: PremiumTaskService[];

  locationMethod: LocationMethod;

  locationQuery: string;

  latitude: number | null;

  longitude: number | null;

  manualAddress: string;

  selectedLocation: NominatimLocation | null;

  setLoading: (value: boolean) => void;
}

export interface CreateTaskPageUIProps {
  title: string;

  description: string;

  category: string;

  budget: string;

  taskDate: string;

  taskTime: string;

  isUrgent: boolean;

  loading: boolean;

  paymentResult: PaymentResult;

  paymentOrderId: string;

  paymentAmount: number;

  paymentType: "DONATION" | "URGENT_TASK" | null;

  taskId: string | null;

  closePaymentResult: () => void;

  onTitleChange: (value: string) => void;

  onDescriptionChange: (value: string) => void;

  onCategoryChange: (value: string) => void;

  onBudgetChange: (value: string) => void;

  onTaskDateChange: (value: string) => void;

  onTaskTimeChange: (value: string) => void;

  onUrgentChange: (value: boolean) => void;

  locationMethod: LocationMethod;

  locationQuery: string;

  selectedLocation: NominatimLocation | null;

  latitude: number | null;

  longitude: number | null;

  manualAddress: string;

  searchResults: NominatimLocation[];

  locationSearch: string;

  searchingLocation: boolean;

  onLocationMethodChange: (value: LocationMethod) => void;

  onLocationSearchChange: (value: string) => void;

  onManualAddressChange: (value: string) => void;

  onSelectedLocationChange: (value: NominatimLocation | null) => void;

  onSearchResultsChange: (value: NominatimLocation[]) => void;

  onLatitudeChange: (value: number | null) => void;

  onLongitudeChange: (value: number | null) => void;

  onLocationQueryChange: (value: string) => void;

  onSubmit: (e: FormEvent) => void;

  onSearchLocation: (query: string) => void;

  onBack: () => void;
}