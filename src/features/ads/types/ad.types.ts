export type AdPosition =
  | "home_desktop"
  | "home_mobile";

export interface Ad {
  id: string;

  title: string;
  description: string | null;

  image_url: string;
  button_text: string;
  link_url: string;

  position: AdPosition;

  is_active: boolean;

  start_at: string | null;
  end_at: string | null;

  sort_order: number;

  created_at: string;
  updated_at: string;
}

export interface CreateAdInput {
  title: string;
  description?: string | null;

  image_url: string;
  button_text?: string;
  link_url: string;

  position: AdPosition;

  is_active?: boolean;

  start_at?: string | null;
  end_at?: string | null;

  sort_order?: number;
}

export interface UpdateAdInput extends Partial<CreateAdInput> {
  id: string;
}

export interface AdEventStats {
  impressions: number;
  clicks: number;
}

export interface AdStats extends AdEventStats {
  ctr: number;
}

export interface AdWithStats extends Ad {
  stats: AdStats;
}