import { adminSupabase } from "@/lib/supabase/admin";

import {
    notifyTaskApplied,
} from "@/features/notifications/actions";

export async function applyTaskServer(
    taskId: string,
    userId: string,
) {

    /* =========================
         GET TASK
      ========================= */

    const { data: task } =
        await adminSupabase
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

    if (task.user_id === userId) {
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
        await adminSupabase
            .from("task_applications")
            .select("id")
            .eq("task_id", taskId)
            .eq("helper_id", userId)
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

        await adminSupabase

            .from("task_applications")

            .insert([
                {

                    task_id: taskId,

                    helper_id: userId,

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

    await notifyTaskApplied(

        task.user_id,

        task.id,

    );

    return {

        application: data,

        task,

    };

}