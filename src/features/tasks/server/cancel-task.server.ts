import { adminSupabase } from "@/lib/supabase/admin";

import {
    notifyTaskCancelled,
} from "@/features/notifications/actions/server";

export async function cancelTaskServer(
    taskId: string,
    ownerId: string,
) {

    const {
        data: task,
        error: taskError,
    } = await adminSupabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

    if (taskError) {
        throw taskError;
    }

    if (task.user_id !== ownerId) {
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
        await adminSupabase
            .from("tasks")
            .update({
                status: "CANCELLED",
            })
            .eq("id", taskId);

    if (error) {
        throw error;
    }

    /* =========================
       CREATE NOTIFICATION
   ========================= */

    if (
        task.status === "ACCEPTED" &&
        task.selected_helper_id
    ) {
        await notifyTaskCancelled(
            task.selected_helper_id,
            task.id,
        );
    }

    return true;

}