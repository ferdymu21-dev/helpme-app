import { NextRequest, NextResponse } from "next/server";

import { ZodError } from "zod";

import { updateAdService } from "@/features/ads/services/updateAd.service";
import { deleteAdService } from "@/features/ads/services/deleteAd.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const ad = await updateAdService(id, body);

    return NextResponse.json(ad);
  } catch (error) {
    console.error("PUT /api/ads/[id] error:", error);

    if (error instanceof Error && error.message === "INVALID_ID") {
      return NextResponse.json(
        {
          message: "ID iklan tidak valid.",
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          message: "Anda belum login.",
        },
        {
          status: 401,
        },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          message: "Anda tidak memiliki akses admin.",
        },
        {
          status: 403,
        },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Data iklan tidak valid.",
          errors: error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof Error && error.message === "AD_NOT_FOUND") {
      return NextResponse.json(
        {
          message: "Iklan tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Gagal memperbarui iklan.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await deleteAdService(id);

    return NextResponse.json({
      message: "Iklan berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/ads/[id] error:", error);

    if (error instanceof Error && error.message === "INVALID_ID") {
      return NextResponse.json(
        {
          message: "ID iklan tidak valid.",
        },
        {
          status: 400,
        },
      );
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          message: "Anda belum login.",
        },
        {
          status: 401,
        },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          message: "Anda tidak memiliki akses admin.",
        },
        {
          status: 403,
        },
      );
    }

    if (error instanceof Error && error.message === "AD_NOT_FOUND") {
      return NextResponse.json(
        {
          message: "Iklan tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Gagal menghapus iklan.",
      },
      {
        status: 500,
      },
    );
  }
}