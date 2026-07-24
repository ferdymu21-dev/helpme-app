import {
    adminSupabase,
} from "@/lib/supabase/admin";

export interface CreateTaskFromPaymentPayload {

    userId: string;

    title: string;

    description: string;

    category: string;

    budget: number;

    locationType: string;

    locationName: string | null;

    manualAddress: string | null;

    latitude: number | null;

    longitude: number | null;

    ownerLatitude: number | null;

    ownerLongitude: number | null;

    scheduledAt: string;

    isUrgent: boolean;

}

export async function createTaskFromPayment(

    payload: CreateTaskFromPaymentPayload

) {

    const {

        data,

        error,

    }

    =

    await adminSupabase

        .from("tasks")

        .insert({

            user_id:

                payload.userId,

            title:

                payload.title,

            description:

                payload.description,

            category:

                payload.category,

            budget:

                payload.budget,

            location_type:

                payload.locationType,

            location_name:

                payload.locationName,

            manual_address:

                payload.manualAddress,

            latitude:

                payload.latitude,

            longitude:

                payload.longitude,

            owner_latitude:

                payload.ownerLatitude,

            owner_longitude:

                payload.ownerLongitude,

            scheduled_at:

                payload.scheduledAt,

            is_urgent:

                payload.isUrgent,

            status:

                "OPEN",

        })

        .select()

        .single();

    if (error) {

        throw error;

    }

    return data;

}