export interface CreateTaskPayload {
  title: string;
  description: string;
  category: string;
  budget: number;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Task {
  id: string;
  user_id: string;
  selected_helper_id: string | null;

  title: string;
  description: string;
  category: string;

  budget: number;

  address: string;
  latitude: number;
  longitude: number;

  status: string;

  created_at: string;
  updated_at: string;
}