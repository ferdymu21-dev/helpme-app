import {
    createUrgentTaskPayment,
} from "@/lib/payments/server/urgentTask.server";

interface CreateUrgentTaskCommand {

    userId: string;

    amount: number;

    metadata?: Record<string, unknown>;

}

export async function createUrgentTaskController(

    payload: CreateUrgentTaskCommand

) {

    return await createUrgentTaskPayment(

        payload

    );

}