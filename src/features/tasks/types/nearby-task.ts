export interface NearbyTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  budget: number;
  status: string;

  latitude: number | null;
  longitude: number | null;

  created_at: string;
  address: string | null;
  updated_at: string;

  selected_helper_id: string | null;

  location_type: string | null;
  location_name: string | null;
  manual_address: string | null;

  owner_latitude: number | null;
  owner_longitude: number | null;

  scheduled_at: string | null;
  is_urgent: boolean;

  completion_proof_photo: string | null;
  completed_at: string | null;
  confirmed_at: string | null;

  distance_km: number;
  distance_tier: number;
  total_count: number;
}

export interface GetNearbyTasksParams {
  latitude: number;
  longitude: number;
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  urgentOnly?: boolean;
}

export interface GetNearbyTasksResult {
  tasks: NearbyTask[];
  totalCount: number;
  totalPages: number;
}