export type HistoryTaskStatus =
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export interface HistoryTask {
  id: string;
  title: string;
  category: string | null;
  budget: number | null;
  status: HistoryTaskStatus;
  created_at: string;
  is_urgent?: boolean | null;
}