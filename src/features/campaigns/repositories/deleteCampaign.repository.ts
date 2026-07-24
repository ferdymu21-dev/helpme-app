import {
    adminSupabase,
} from "@/lib/supabase/admin";

export async function deleteCampaignRepository(

    id: string,

): Promise<void> {

    const {

        error,

    } = await adminSupabase

        .from("notification_campaigns")

        .delete()

        .eq("id", id);

    if (error) {

        throw error;

    }

}