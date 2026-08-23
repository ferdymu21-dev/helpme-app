export interface Conversation {
  id: string;

  task_id: string;

  owner_id: string;

  helper_id: string;

  created_at: string;

  last_message: string | null;

  last_message_at: string | null;

  owner_unread_count: number;

  helper_unread_count: number;

  tasks: {
    title: string;
  };

  owner: {
    full_name: string;
    avatar_url?: string;
  };

  helper: {
    full_name: string;
    avatar_url?: string;
  };
}