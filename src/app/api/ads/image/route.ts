import { NextRequest, NextResponse } from "next/server";

import { deleteAdImageService } from "@/features/ads/services/deleteAdImage.service";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const imageUrl = body?.imageUrl;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        {
          message: "URL gambar wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    await deleteAdImageService(imageUrl);

    return NextResponse.json({
      message: "Gambar iklan berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/ads/image error:", error);

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

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Gagal menghapus gambar iklan.",
      },
      {
        status: 500,
      },
    );
  }
}