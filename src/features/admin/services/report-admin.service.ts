import { supabase }
    from "@/lib/supabase/client";

export async function updateReportStatus(

    reportId: string,

    status:
        | "REVIEWED"
        | "RESOLVED"
        | "REJECTED",

    adminNotes: string

) {

    const {
        error,
    } = await supabase
        .from("reports")
        .update({

            status,

            admin_notes:
                adminNotes,

            reviewed_at:
                new Date()
                    .toISOString(),

        })
        .eq(
            "id",
            reportId
        );

    if (error) {
        throw error;
    }
}