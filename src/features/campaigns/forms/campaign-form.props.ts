import type { CreateCampaignPayload } from "../types/campaign.types";
import type { CampaignFormErrors } from "./campaign-form.types";

export interface CampaignFormController {
  form: CreateCampaignPayload;

  errors: CampaignFormErrors;

  loading: boolean;

  uploadingImage: boolean;

  setField<K extends keyof CreateCampaignPayload>(
    field: K,
    value: CreateCampaignPayload[K],
  ): void;

  uploadImage(file: File): Promise<void>;

  submit(): Promise<void>;

  reset(): void;
}