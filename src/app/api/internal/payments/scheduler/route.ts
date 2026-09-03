import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  runPaymentLifecycleService,
} from "@/lib/payments/server/paymentLifecycle.service";

export async function POST(
  request: NextRequest,
) {
  try {
    const secret =
      process.env
        .PAYMENT_CRON_SECRET;

    /*
     * Internal privileged endpoint
     * harus fail closed.
     */
    if (!secret) {
      console.error(
        "[PAYMENT SCHEDULER] PAYMENT_CRON_SECRET belum dikonfigurasi.",
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Scheduler belum dikonfigurasi.",
        },
        {
          status: 503,
        },
      );
    }

    const authorization =
      request.headers.get(
        "authorization",
      );

    if (
      authorization !==
      `Bearer ${secret}`
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const result =
      await runPaymentLifecycleService();

    return NextResponse.json({
      success: true,

      ...result,
    });
  } catch (error) {
    console.error(
      "[PAYMENT SCHEDULER]",

      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Scheduler failed.",
      },
      {
        status: 500,
      },
    );
  }
}