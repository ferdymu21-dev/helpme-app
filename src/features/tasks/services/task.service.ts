import { supabase } from "@/lib/supabase/client";

import { CreateTaskPayload } from "../types/task.type";

/* =========================
   CREATE TASK
========================= */

export async function createTask(payload: CreateTaskPayload) {
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

        address: payload.address,

        latitude: payload.latitude,
        longitude: payload.longitude,

        status: "OPEN",
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
   GET TASKS
========================= */

export async function getTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "OPEN")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   GET TASK BY ID
========================= */

export async function getTaskById(taskId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
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
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User belum login");
  }

  /* =========================
     GET TASK
  ========================= */

  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (!task) {
    throw new Error("Task tidak ditemukan");
  }

  /* =========================
     PREVENT SELF APPLY
  ========================= */

  if (task.user_id === user.id) {
    throw new Error("Tidak bisa melamar task sendiri");
  }

  /* =========================
     TASK MUST BE OPEN
  ========================= */

  if (task.status !== "OPEN") {
    throw new Error("Task sudah tidak tersedia");
  }

  /* =========================
     PREVENT DUPLICATE APPLY
  ========================= */

  const { data: existing } = await supabase
    .from("task_applications")
    .select("id")
    .eq("task_id", taskId)
    .eq("helper_id", user.id)
    .maybeSingle();

  if (existing) {
    throw new Error("Kamu sudah melamar task ini");
  }

  /* =========================
     INSERT APPLICATION
  ========================= */

  const { data, error } = await supabase
    .from("task_applications")
    .insert([
      {
        task_id: taskId,
        helper_id: user.id,
        status: "PENDING",
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
   GET TASK APPLICATIONS
========================= */

export async function getTaskApplications(taskId: string) {
  const { data, error } = await supabase
    .from("task_applications")
    .select(
      `
      *,
      users (
        id,
        full_name,
        rating
      )
    `,
    )
    .eq("task_id", taskId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   ACCEPT HELPER
========================= */

export async function acceptHelper(taskId: string, helperId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  /* =========================
     GET TASK
  ========================= */

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError) {
    throw taskError;
  }

  /* =========================
     ONLY OWNER CAN ACCEPT
  ========================= */

  if (task.user_id !== user.id) {
    throw new Error("Bukan pemilik task");
  }

  /* =========================
     TASK ALREADY ACCEPTED
  ========================= */

  if (task.status !== "OPEN") {
    throw new Error("Task sudah memiliki helper");
  }

  /* =========================
     UPDATE TASK
  ========================= */

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "ACCEPTED",
      selected_helper_id: helperId,
    })
    .eq("id", taskId);

  if (error) {
    throw error;
  }

  /* =========================
     UPDATE APPLICATIONS
  ========================= */

  await supabase
    .from("task_applications")
    .update({
      status: "REJECTED",
    })
    .eq("task_id", taskId);

  await supabase
    .from("task_applications")
    .update({
      status: "ACCEPTED",
    })
    .eq("task_id", taskId)
    .eq("helper_id", helperId);

  /* =========================
     CREATE CONVERSATION
  ========================= */

  await createConversation(
    taskId, 
    helperId
  );

  return true;
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

export async function getHelperTasks() {
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
        tasks (
          id,
          title,
          category,
          budget,
          address,
          status
        )
      `,
    )
    .eq("helper_id", user.id);

  if (error) {
    throw error;
  }

  return data?.map((item: any) => item.tasks).filter(Boolean) || [];
}


export async function createConversation(
  taskId: string,
  helperId: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "User tidak ditemukan"
    );
  }

  /* =========================
     CHECK EXISTING
  ========================= */

  const {
    data: existingConversation,
  } = await supabase
    .from("conversations")
    .select("*")
    .eq("task_id", taskId)
    .eq("helper_id", helperId)
    .maybeSingle();

  if (existingConversation) {
    return existingConversation;
  }

  /* =========================
     GET TASK
  ========================= */

  const {
    data: task,
    error: taskError,
  } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (taskError) {
    throw taskError;
  }

  /* =========================
     CREATE CONVERSATION
  ========================= */

  const {
    data,
    error,
  } = await supabase
    .from("conversations")
    .insert({
      task_id: taskId,
      owner_id: task.user_id,
      helper_id: helperId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getConversationByTask(
  taskId: string
) {
  const {
    data,
    error,
  } = await supabase
    .from("conversations")
    .select("*")
    .eq("task_id", taskId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}