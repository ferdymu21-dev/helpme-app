import { NextRequest, NextResponse } from "next/server";

import { runServiceListingExpirationService } from "@/features/service-listings/services/run-service-listing-expiration.server.service";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.SERVICE_LISTING_CRON_SECRET;

    /*
     * Internal privileged endpoint
     * harus fail closed.
     */
    if (!secret) {
      console.error(
        "[SERVICE LISTING SCHEDULER] SERVICE_LISTING_CRON_SECRET belum dikonfigurasi.",
      );

      return NextResponse.json(
        {
          success: false,

          message: "Scheduler belum dikonfigurasi.",
        },
        {
          status: 503,
        },
      );
    }

    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json(
        {
          success: false,

          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const result = await runServiceListingExpirationService();

    return NextResponse.json({
      success: true,

      ...result,
    });
  } catch (error) {
    console.error(
      "[SERVICE LISTING SCHEDULER]",

      error,
    );

    return NextResponse.json(
      {
        success: false,

        message: "Scheduler failed.",
      },
      {
        status: 500,
      },
    );
  }
}
