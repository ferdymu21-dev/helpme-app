import { supabase }
    from "@/lib/supabase/client";

export async function removeTask(
    taskId: string
) {

    const { error } =
        await supabase
            .from("tasks")
            .update({
                status: "REMOVED",
            })
            .eq("id", taskId);

    if (error) {
        throw error;
    }

    return true;
}

export async function restoreTask(
    taskId: string
) {

    const { error } =
        await supabase
            .from("tasks")
            .update({
                status: "OPEN",
            })
            .eq("id", taskId);

    if (error) {
        throw error;
    }

    return true;
}