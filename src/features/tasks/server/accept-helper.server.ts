import { adminSupabase } from "@/lib/supabase/admin";

import {
    createConversationServer,
} from "./create-conversation.server";

import {
    notifyTaskAccepted,
} from "@/features/notifications/actions";

export async function acceptHelperServer(
    taskId: string,
    helperId: string,
    ownerId: string,
) {

    /* =========================
       GET TASK
    ========================= */

    const {
        data: task,
        error: taskError,
    } =
        await adminSupabase
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

    if (task.user_id !== ownerId) {
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
        await adminSupabase
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

    await adminSupabase
        .from("task_applications")
        .update({
            status: "REJECTED",
        })
        .eq("task_id", taskId);

    await adminSupabase
        .from("task_applications")
        .update({
            status: "ACCEPTED",
        })
        .eq("task_id", taskId)
        .eq("helper_id", helperId);

    /* =========================
       CREATE CONVERSATION
    ========================= */

    await createConversationServer(
        taskId,
        helperId,
    );

    /* =========================
       CREATE NOTIFICATION
    ========================= */

    await notifyTaskAccepted(
        helperId,
        taskId,
    );

    return true;

}