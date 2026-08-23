export type TaskStatus =
  | "OPEN"
  | "ACCEPTED"
  | "ON_PROGRESS"
  | "WAITING_CONFIRMATION"
  | "COMPLETED"
  | "REVIEWED"
  | "CANCELLED"
  | "EXPIRED"
  | "REMOVED";

const TASK_STATUS_LABELS: Record<
  TaskStatus,
  string
> = {
  OPEN: "Terbuka",
  ACCEPTED: "Diterima",
  ON_PROGRESS: "Dikerjakan",
  WAITING_CONFIRMATION:
    "Menunggu Konfirmasi",
  COMPLETED: "Selesai",
  REVIEWED: "Selesai & Diulas",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kedaluwarsa",
  REMOVED: "Dihapus",
};

const TASK_STATUS_BADGE_CLASSES: Record<
  TaskStatus,
  string
> = {
  OPEN:
    "border border-emerald-100 bg-emerald-50 text-emerald-600",

  ACCEPTED:
    "border border-violet-100 bg-violet-50 text-violet-600",

  ON_PROGRESS:
    "border border-blue-100 bg-blue-50 text-blue-600",

  WAITING_CONFIRMATION:
    "border border-amber-100 bg-amber-50 text-amber-600",

  COMPLETED:
    "border border-blue-100 bg-blue-50 text-blue-600",

  REVIEWED:
    "border border-teal-100 bg-teal-50 text-teal-600",

  CANCELLED:
    "border border-rose-100 bg-rose-50 text-rose-600",

  EXPIRED:
    "border border-red-200 bg-red-100 text-red-600",

  REMOVED:
    "border border-zinc-200 bg-zinc-100 text-zinc-600",
};

function isTaskStatus(
  status: string,
): status is TaskStatus {
  return Object.prototype.hasOwnProperty.call(
    TASK_STATUS_LABELS,
    status,
  );
}

export function getTaskStatusLabel(
  status: string,
) {
  if (isTaskStatus(status)) {
    return TASK_STATUS_LABELS[
      status
    ];
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

export function getTaskStatusBadgeClass(
  status: string,
) {
  if (isTaskStatus(status)) {
    return TASK_STATUS_BADGE_CLASSES[
      status
    ];
  }

  return "border border-slate-200 bg-slate-50 text-slate-600";
}