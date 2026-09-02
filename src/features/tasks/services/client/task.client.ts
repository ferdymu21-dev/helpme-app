import { supabase } from "@/lib/supabase/client";

import type { HistoryTask } from "@/features/tasks/types/history";

import type {
  GetNearbyTasksParams,
  GetNearbyTasksResult,
  NearbyTask,
} from "@/features/tasks/types/nearby-task";

/* =========================
   LOCAL TYPES
========================= */
interface HelperTask {
  id: string;
  title: string;
  category: string;
  budget: number;
  status: string;
  is_urgent: boolean;
  scheduled_at: string | null;
  created_at: string;
  location_type: string | null;
  location_name: string | null;
  manual_address: string | null;
  latitude: number | null;
  longitude: number | null;
  owner_latitude: number | null;
  owner_longitude: number | null;
}

interface HelperTaskApplicationRow {
  task_id: string;
  application_status: string;
  task:
    | HelperTask
    | HelperTask[]
    | null;
}

interface HelperHistoryTask {
  id: string;
  title: string;
  category: string;
  budget: number;
  status: string;
  created_at: string;
}

interface HelperHistoryApplicationRow {
  task_id: string;
  application_status: string;
  task:
    | HelperHistoryTask
    | HelperHistoryTask[]
    | null;
}

function unwrapSingleRelation<T>(
  relation: T | T[] | null,
): T | null {
  if (relation === null) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

/* =========================
   GET NEARBY OPEN TASKS
========================= */
export async function getTasks({
  latitude,
  longitude,
  page = 1,
  pageSize = 10,
  category = "Semua",
  search = "",
  urgentOnly = false,
}: GetNearbyTasksParams): Promise<GetNearbyTasksResult> {
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error("Latitude helper tidak valid");
  }

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Longitude helper tidak valid");
  }

  const safePage = Math.max(
    1,
    Math.trunc(page),
  );

  const safePageSize = Math.min(
    50,
    Math.max(
      1,
      Math.trunc(pageSize),
    ),
  );

  const safeSearch =
    search.trim();

  const { data, error } =
    await supabase.rpc(
      "get_nearby_open_tasks_feed",
      {
        p_latitude: latitude,
        p_longitude: longitude,
        p_page: safePage,
        p_page_size: safePageSize,
        p_category:
          category === "Semua"
            ? null
            : category,
        p_search:
          safeSearch.length > 0
            ? safeSearch
            : null,
        p_urgent_only: urgentOnly,
      },
    );

  if (error) {
    throw error;
  }

  const tasks =
    (data ?? []) as NearbyTask[];

  const totalCount =
    tasks.length > 0
      ? Number(
          tasks[0].total_count,
        )
      : 0;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalCount /
        safePageSize,
    ),
  );

  return {
    tasks,
    totalCount,
    totalPages,
  };
}

/* =========================
   GET TASK BY ID
========================= */
export async function getTaskById(taskId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      users!tasks_user_id_fkey (
        id,
        full_name,
        avatar_url,
        verification_status
      )
    `,
    )
    .eq("id", taskId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   GET TASK APPLICATIONS
========================= */
export async function getTaskApplications(taskId: string) {

  const { data: applications, error } = await supabase
    .from("task_applications")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  if (!applications) {
    return [];
  }

  /* =========================
     GET HELPER DATA
  ========================= */
  const mergedData = await Promise.all(
    applications.map(async (application) => {
      const { data: helper, error: helperError } = await supabase
        .from("users")
        .select(
          `
            id,
            full_name,
            avatar_url,
            rating,
            total_reviews
          `,
        )
        .eq("id", application.helper_id)
        .maybeSingle();

      if (helperError) {
        console.error(helperError);
      }

      return {
        ...application,
        helper,
      };
    }),
  );

  return mergedData;
}

/* =========================
   GET MY TASKS
========================= */
export async function getMyTasks() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User belum login");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
        *,
        task_applications (
          id
        )
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   GET HELPER TASKS
========================= */
export async function getHelperTasks(): Promise<HelperTask[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const { data, error } = await supabase
    .from("task_applications")
    .select(
      `
        task_id,
        application_status:status,
        task:tasks (
          id,
          title,
          category,
          budget,
          status,
          is_urgent,
          scheduled_at,
          created_at,
          location_type,
          location_name,
          manual_address,
          latitude,
          longitude,
          owner_latitude,
          owner_longitude
        )
      `,
    )
    .eq("helper_id", user.id)
    .in("status", ["PENDING", "ACCEPTED"]);

  if (error) {
    throw error;
  }

  const applications =
    (data ?? []) as HelperTaskApplicationRow[];

  const tasks: HelperTask[] = [];

  for (const application of applications) {

    const task =
  unwrapSingleRelation(
    application.task,
  );

if (!task) {
  continue;
}

    /*
     * Helper Tasks hanya berisi task yang masih
     * relevan untuk dashboard Helper.
     *
     * CANCELLED / EXPIRED tidak ditampilkan di sini
     * karena masuk ke History.
     */
    if (
      ![
        "OPEN",
        "ACCEPTED",
        "ON_PROGRESS",
        "WAITING_CONFIRMATION",
        "COMPLETED",
      ].includes(task.status)
    ) {
      continue;
    }

    tasks.push(task);
  }

  return tasks.sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime(),
  );
}

/* =========================
   GET CONVERSATION
========================= */

export async function getConversationByTask(
  taskId: string,
) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("task_id", taskId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   GET TASK HISTORY
========================= */

export async function getTaskHistory(): Promise<HistoryTask[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User belum login");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["COMPLETED", "CANCELLED", "EXPIRED"])
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as HistoryTask[];
}

/* =========================
   GET HELPER HISTORY
========================= */
export async function getHelperHistory(): Promise<HelperHistoryTask[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const { data, error } = await supabase
    .from("task_applications")
    .select(
      `
        task_id,
        application_status:status,
        task:tasks (
          id,
          title,
          category,
          budget,
          status,
          created_at
        )
      `,
    )
    .eq("helper_id", user.id)
    .in("status", ["PENDING", "ACCEPTED"]);

  if (error) {
    throw error;
  }

  const applications =
    (data ?? []) as HelperHistoryApplicationRow[];

  const tasks: HelperHistoryTask[] = [];

  for (const application of applications) {

    const task =
  unwrapSingleRelation(
    application.task,
  );

if (!task) {
  continue;
}

    if (
      ![
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
      ].includes(task.status)
    ) {
      continue;
    }

    /*
     * COMPLETED hanya boleh masuk history Helper
     * apabila application Helper tersebut ACCEPTED.
     *
     * Ini mencegah Helper yang tidak terpilih
     * melihat COMPLETED milik Helper lain.
     */
    if (
      task.status === "COMPLETED" &&
      application.application_status !== "ACCEPTED"
    ) {
      continue;
    }

    tasks.push(task);
  }

  /* =========================
     REMOVE DUPLICATE TASK
  ========================= */

  const uniqueTasks = Array.from(
    new Map(
      tasks.map((task) => [
        task.id,
        task,
      ]),
    ).values(),
  );

  return uniqueTasks.sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime(),
  );
}