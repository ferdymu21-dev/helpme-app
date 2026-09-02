import { supabase } from "@/lib/supabase/client";

import { checkUserModeration } from "@/features/admin/services/moderation-check.service";

import { CreateTaskPayload } from "../../types/task.type";

/* =========================
   CREATE TASK
========================= */

export async function createTask(payload: CreateTaskPayload) {
  await checkUserModeration();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User belum login");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        user_id: user.id,

        title: payload.title,

        description: payload.description,

        category: payload.category,

        budget: payload.budget,

        location_type: payload.location_type,

        location_name: payload.location_name,

        manual_address: payload.manual_address,

        latitude: payload.latitude,

        longitude: payload.longitude,

        owner_latitude: payload.owner_latitude,

        owner_longitude: payload.owner_longitude,

        scheduled_at: payload.scheduled_at,

        is_urgent: payload.is_urgent ?? false,

      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   APPLY TASK
========================= */

export async function applyTask(taskId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User belum login");
  }

  const response = await fetch("/api/tasks/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      taskId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message);
  }

  return response.json();
}

/* =========================
   ACCEPT HELPER
========================= */

export async function acceptHelper(taskId: string, helperId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User belum login");
  }

  const response = await fetch("/api/tasks/accept", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      taskId,
      helperId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message);
  }

  return true;
}

/* =========================
   CANCEL TASK
========================= */

export async function cancelTask(taskId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User belum login");
  }

  const response = await fetch("/api/tasks/cancel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      taskId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message);
  }

  return true;
}

/* =========================
   EXPIRE TASKS
========================= */

export async function expireTasks() {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "EXPIRED",
    })
    .eq("status", "OPEN")
    .lt("scheduled_at", now);

  if (error) {
    console.error(error);
  }
}

export async function createConversation(taskId: string, helperId: string) {
  throw new Error("createConversation API belum dibuat.");
}

export async function completeTask(
  taskId: string,
  proofUrl: string,
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User belum login");
  }

  const response = await fetch("/api/tasks/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      taskId,
      proofUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return true;
}

/* =========================
   CONFIRM TASK COMPLETION
========================= */

export async function confirmTaskCompletion(taskId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User belum login");
  }

  const response = await fetch("/api/tasks/complete/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      taskId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.message);
  }

  return true;
}