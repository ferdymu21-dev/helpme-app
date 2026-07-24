import { supabase } from "@/lib/supabase/client";

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