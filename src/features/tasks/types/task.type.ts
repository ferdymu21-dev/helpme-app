export interface CreateTaskPayload {
  title: string;
  description: string;
  category: string;
  budget: number;
  latitude: number | null;
  longitude: number | null;

  location_type?: string;

  location_name?: string | null;

  manual_address?: string | null;

  owner_latitude?: number | null;

  owner_longitude?: number | null;

  scheduled_at?: string;

  is_urgent?: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  selected_helper_id: string | null;

  title: string;
  description: string;
  category: string;

  budget: number;

  latitude: number;
  longitude: number;

  status: string;
  scheduled_at: string | null;
  is_urgent: boolean;

  created_at: string;
  updated_at: string;
}