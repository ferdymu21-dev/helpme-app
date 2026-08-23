import { NextRequest, NextResponse } from "next/server";

import { uploadAdImageService } from "@/features/ads/services/uploadAdImage.service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          message: "File gambar wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    const result = await uploadAdImageService(file);

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/ads/upload error:", error);

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

    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Gagal mengupload gambar iklan.",
      },
      {
        status: 500,
      },
    );
  }
}