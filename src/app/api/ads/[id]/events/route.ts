import { NextRequest, NextResponse } from "next/server";

import { createAdEventService } from "@/features/ads/services/createAdEvent.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const event = await createAdEventService(id, body?.event_type);

    return NextResponse.json(event, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/ads/[id]/events error:", error);

    if (error instanceof Error && error.message === "INVALID_AD_ID") {
      return NextResponse.json(
        {
          message: "ID iklan tidak valid.",
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof Error && error.message === "INVALID_EVENT_TYPE") {
      return NextResponse.json(
        {
          message: "Jenis event iklan tidak valid.",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Gagal mencatat event iklan.",
      },
      {
        status: 500,
      },
    );
  }
}