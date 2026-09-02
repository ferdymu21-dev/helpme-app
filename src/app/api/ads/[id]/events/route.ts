import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { createAdEventService } from "@/features/ads/services/createAdEvent.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          message: "Anda belum login.",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    const event = await createAdEventService(id, body?.event_type, user.id);

    /*
     * event === null berarti duplicate dalam
     * dedupe window. Request tetap sukses.
     */
    return NextResponse.json(
      {
        recorded: event !== null,
      },
      {
        status: event ? 201 : 200,
      },
    );
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

    if (error instanceof Error && error.message === "AD_NOT_TRACKABLE") {
      return NextResponse.json(
        {
          message: "Iklan tidak tersedia untuk tracking.",
        },
        {
          status: 404,
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