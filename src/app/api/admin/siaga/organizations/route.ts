import { NextRequest, NextResponse } from "next/server";

import { getAdminSiagaOrganizations } from "@/features/admin/siaga/services/get-admin-siaga-organizations.service";

function jsonNoStore(
  body: unknown,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const result = await getAdminSiagaOrganizations({
      status: request.nextUrl.searchParams.get("status"),
      search: request.nextUrl.searchParams.get("search"),
    });

    return jsonNoStore(result, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "UNAUTHORIZED") {
      return jsonNoStore(
        { message: "Silakan login kembali." },
        401,
      );
    }

    if (message === "FORBIDDEN") {
      return jsonNoStore(
        { message: "Anda tidak memiliki akses admin." },
        403,
      );
    }

    if (
      message === "INVALID_STATUS" ||
      message === "INVALID_SEARCH"
    ) {
      return jsonNoStore(
        { message: "Filter antrean Siaga tidak valid." },
        400,
      );
    }

    if (message === "SIAGA_ORGANIZATION_LIST_UNAVAILABLE") {
      return jsonNoStore(
        { message: "Antrean verifikasi Siaga sementara tidak tersedia." },
        503,
      );
    }

    console.error("Admin Siaga organization list API failed:", message);

    return jsonNoStore(
      { message: "Gagal memuat antrean verifikasi Siaga." },
      500,
    );
  }
}