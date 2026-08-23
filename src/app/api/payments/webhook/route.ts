import { NextRequest, NextResponse } from "next/server";

import { webhookController } from "@/features/payments/controllers/webhook.controller";

import type { MidtransNotification } from "@/lib/payments/server";

export async function POST(request: NextRequest) {
  try {
    const notification = (await request.json()) as MidtransNotification;

    const result = await webhookController(notification);

    return NextResponse.json(
      result,

      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "WEBHOOK ERROR",

      error,
    );

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Webhook Error",
      },

      {
        status: 400,
      },
    );
  }
}