export interface CreateTaskReportPayload {

    reporterId: string;

    reportedUserId: string;

    taskId: string;

    reason: string;

    description: string;

}

export interface Report {

    id: string;

    reporter_id: string;

    reported_user_id: string;

    task_id: string | null;

    reason: string;

    description: string | null;

    status: string;

    admin_notes: string | null;

    created_at: string;

    reviewed_at: string | null;

}