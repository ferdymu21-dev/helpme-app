import { supabase }
    from "@/lib/supabase/client";

import {
    CreateTaskReportPayload,
} from "../types/report.types";

export async function submitTaskReport(
    payload: CreateTaskReportPayload
) {

    const {
        reporterId,
        reportedUserId,
        taskId,
        reason,
        description,
    } = payload;

    if (
        reporterId ===
        reportedUserId
    ) {

        throw new Error(
            "Tidak dapat melaporkan diri sendiri"
        );

    }

    const {
        data: existingReport,
        error: existingError,
    } = await supabase
        .from("reports")
        .select("id")
        .eq(
            "reporter_id",
            reporterId
        )
        .eq(
            "task_id",
            taskId
        )
        .eq(
            "status",
            "PENDING"
        )
        .maybeSingle();

    if (existingError) {

        throw existingError;

    }

    if (existingReport) {

        throw new Error(
            "Anda sudah melaporkan task ini"
        );

    }

    const {
        error,
    } = await supabase
        .from("reports")
        .insert({

            reporter_id:
                reporterId,

            reported_user_id:
                reportedUserId,

            task_id:
                taskId,

            reason,

            description,

            status:
                "PENDING",

        });

    if (error) {

        throw error;

    }

}