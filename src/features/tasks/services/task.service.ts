import { supabase } from "@/lib/supabase/client";

import {
  checkUserModeration,
} from "@/features/admin/services/moderation-check.service";

import { CreateTaskPayload } from "../types/task.type";

import {
  createNotification,
} from "@/features/notifications/services/notification.service";

/* =========================
   CREATE TASK
========================= */

export async function createTask(
  payload: CreateTaskPayload
) {

  await checkUserModeration();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "User belum login"
    );
  }

  const { data, error } =
    await supabase
      .from("tasks")
      .insert([
        {
          user_id: user.id,

          title: payload.title,

          description:
            payload.description,

          category:
            payload.category,

          budget: payload.budget,

          location_type:
            payload.location_type,

          location_name:
            payload.location_name,

          manual_address:
            payload.manual_address,

          latitude:
            payload.latitude,

          longitude:
            payload.longitude,

          owner_latitude:
            payload.owner_latitude,

          owner_longitude:
            payload.owner_longitude,

          scheduled_at:
            payload.scheduled_at,

          is_urgent:
            payload.is_urgent ?? false,

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

  const { data, error } =
    await supabase
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

export async function getTaskById(
  taskId: string
) {

  const { data, error } =
  await supabase
    .from("tasks")
    .select(`
      *,
      users!tasks_user_id_fkey (
        id,
        full_name,
        avatar_url,
        verification_status
      )
    `)
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

export async function applyTask(
  taskId: string
) {

  await checkUserModeration();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "User belum login"
    );
  }

  /* =========================
     GET TASK
  ========================= */

  const { data: task } =
    await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();

  if (!task) {
    throw new Error(
      "Permintaan bantuan tidak ditemukan"
    );
  }

  /* =========================
     PREVENT SELF APPLY
  ========================= */

  if (task.user_id === user.id) {
    throw new Error(
      "Tidak bisa melamar task sendiri"
    );
  }

  /* =========================
     TASK MUST BE OPEN
  ========================= */

  if (task.status !== "OPEN") {
    throw new Error(
      "Permintaan bantuan ini sudah ditutup"
    );
  }

  /* =========================
     PREVENT DUPLICATE APPLY
  ========================= */

  const { data: existing } =
    await supabase
      .from("task_applications")
      .select("id")
      .eq("task_id", taskId)
      .eq("helper_id", user.id)
      .maybeSingle();

  if (existing) {
    throw new Error(
      "Kamu sudah melamar task ini"
    );
  }

  /* =========================
     INSERT APPLICATION
  ========================= */

  const { data, error } =
    await supabase
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

  /* =========================
     CREATE NOTIFICATION
  ========================= */

  await createNotification({

    userId: task.user_id,

    title: "Bantuan datang",

    message:
      "Seseorang ingin membantu",

    type: "APPLY_TASK",

    taskId: task.id,

    redirectUrl:
      `/tasks/${task.id}`,
  });

  return data;

}

/* =========================
   GET TASK APPLICATIONS
========================= */

export async function getTaskApplications(
  taskId: string
) {

  /* =========================
     GET APPLICATIONS
  ========================= */

  const {
    data: applications,
    error,
  } = await supabase
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

  const mergedData =
    await Promise.all(

      applications.map(
        async (application) => {

          const {
            data: helper,
            error: helperError,
          } = await supabase
            .from("users")
            .select(`
              id,
              full_name,
              avatar_url,
              rating,
              total_reviews
            `)
            .eq(
              "id",
              application.helper_id
            )
            .maybeSingle();

          if (helperError) {
            console.error(
              helperError
            );
          }

          return {
            ...application,
            helper,
          };
        }
      )
    );

  return mergedData;
}

/* =========================
   ACCEPT HELPER
========================= */

export async function acceptHelper(
  taskId: string,
  helperId: string
) {

  await checkUserModeration();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "User tidak ditemukan"
    );
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
     ONLY OWNER CAN ACCEPT
  ========================= */

  if (task.user_id !== user.id) {
    throw new Error(
      "Bukan pemilik task"
    );
  }

  /* =========================
     TASK ALREADY ACCEPTED
  ========================= */

  if (task.status !== "OPEN") {
    throw new Error(
      "Sudah dibantu"
    );
  }

  /* =========================
     UPDATE TASK
  ========================= */

  const { error } =
    await supabase
      .from("tasks")
      .update({
        status: "ACCEPTED",

        selected_helper_id:
          helperId,
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

  /* ========================= 
     CREATE NOTIFICATION 
  ========================= */

  await createNotification({

    userId: helperId,

    title: "Aku butuh bantuanmu",

    message:
      "Terima kasih sudah mau membantu",

    type: "TASK_ACCEPTED",

    taskId: taskId,

    redirectUrl:
      `/tasks/${taskId}`
  });

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
    throw new Error(
      "User belum login"
    );
  }

  const { data, error } =
    await supabase
      .from("tasks")
      .select(`
        *,
        task_applications (
          id
        )
      `)
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

export async function getHelperTasks() {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "User tidak ditemukan"
    );
  }

  const { data, error } =
    await supabase
      .from("task_applications")
      .select(`
        task_id,
        tasks (
          id,
          title,
          category,
          budget,
          status,
          is_urgent,
          scheduled_at,
          is_urgent,
          created_at,
          location_type,
          location_name,
          manual_address,

          latitude,
          longitude,

          owner_latitude,
          owner_longitude
        )
      `)
      .eq("helper_id", user.id);

  if (error) {
    throw error;
  }

  return (
    data
      ?.map(
        (item: any) => item.tasks
      )

      .filter(Boolean)

      .sort(
        (a: any, b: any) =>

          new Date(
            b.created_at
          ).getTime()

          -

          new Date(
            a.created_at
          ).getTime()
      )

    || []
  );
}

/* =========================
   CREATE CONVERSATION
========================= */

export async function createConversation(
  taskId: string,
  helperId: string
) {

  await checkUserModeration();

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

/* =========================
   GET CONVERSATION
========================= */

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

/* =========================
   EXPIRE TASKS
========================= */

export async function expireTasks() {

  const now =
    new Date().toISOString();

  const { error } =
    await supabase
      .from("tasks")
      .update({
        status: "EXPIRED",
      })
      .eq("status", "OPEN")
      .lt(
        "scheduled_at",
        now
      );

  if (error) {
    console.error(error);
  }
}

/* =========================
   CANCEL TASK
========================= */

export async function cancelTask(
  taskId: string
) {

  await checkUserModeration();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "User tidak ditemukan"
    );
  }

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

  if (task.user_id !== user.id) {
    throw new Error(
      "Bukan pemilik task"
    );
  }

  if (
    task.status === "COMPLETED"
  ) {
    throw new Error(
      "Task sudah selesai"
    );
  }

  const { error } =
    await supabase
      .from("tasks")
      .update({
        status: "CANCELLED",
      })
      .eq("id", taskId);

  if (error) {
    throw error;
  }

  /* =========================
     NOTIFICATION
  ========================= */

  if (
    task.status ===
    "ACCEPTED" &&

    task.selected_helper_id
  ) {

    await createNotification({

      userId:
        task.selected_helper_id,

      title:
        "Task dibatalkan",

      message:
        "Task yang sedang kamu bantu telah dibatalkan oleh pemilik.",

      type:
        "TASK_CANCELLED",

      taskId:
        task.id,

      redirectUrl:
        `/tasks/${task.id}`,
    });
  }

  return true;
}

/* =========================
   GET TASK HISTORY
========================= */

export async function getTaskHistory() {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "User belum login"
    );
  }

  const { data, error } =
    await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .in("status", [
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
      ])
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return data || [];
}

/* =========================
   GET HELPER HISTORY
========================= */

export async function getHelperHistory() {

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "User tidak ditemukan"
    );
  }

  const { data, error } =
    await supabase
      .from("task_applications")
      .select(`
        task_id,
        tasks (
          id,
          title,
          category,
          budget,
          status,
          created_at
        )
      `)
      .eq("helper_id", user.id);

  if (error) {
    throw error;
  }

  const tasks =
    data
      ?.map(
        (item: any) => item.tasks
      )

      .filter(
        (task: any) =>

          task &&
          [
            "COMPLETED",
            "CANCELLED",
            "EXPIRED",
          ].includes(
            task.status
          )
      )

      || [];

  /* =========================
     REMOVE DUPLICATE TASK
  ========================= */

  const uniqueTasks =

    Array.from(

      new Map(

        tasks.map(
          (task: any) => [
            task.id,
            task,
          ]
        )

      ).values()

    );

  return uniqueTasks.sort(
    (a: any, b: any) =>

      new Date(
        b.created_at
      ).getTime()

      -

      new Date(
        a.created_at
      ).getTime()
  );
}