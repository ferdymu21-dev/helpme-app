import { NextRequest, NextResponse } from "next/server";

import { requireSiagaAdmin } from "@/features/admin/siaga/server/require-siaga-admin";

import { reviewAdminSiagaOrganization } from "@/features/admin/siaga/services/review-admin-siaga-organization.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

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

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await requireSiagaAdmin();

    const { id } = await context.params;

    const contentLength = request.headers.get("content-length");

    if (
      contentLength !== null &&
      /^\d+$/.test(contentLength) &&
      Number(contentLength) > 64 * 1024
    ) {
      return jsonNoStore(
        { message: "Ukuran permintaan terlalu besar." },
        413,
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonNoStore(
        { message: "Body permintaan bukan JSON yang valid." },
        400,
      );
    }

    const result = await reviewAdminSiagaOrganization(id, body);

    return jsonNoStore(result, 200);
  } catch (error) {
    const code =
      error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (code === "UNAUTHORIZED") {
      return jsonNoStore(
        { message: "Silakan login kembali." },
        401,
      );
    }

    if (code === "BANNED" || code === "FORBIDDEN") {
      return jsonNoStore(
        { message: "Anda tidak memiliki akses admin." },
        403,
      );
    }

    if (code === "ORGANIZATION_NOT_FOUND") {
      return jsonNoStore(
        { message: "Organisasi tidak ditemukan." },
        404,
      );
    }

    if (code === "INVALID_ORGANIZATION_TRANSITION") {
      return jsonNoStore(
        { message: "Status organisasi tidak mengizinkan keputusan ini." },
        409,
      );
    }

    if (
      [
        "INVALID_ORGANIZATION_ID",
        "INVALID_REVIEW_INPUT",
        "INVALID_ORGANIZATION_DECISION",
        "CORRECTION_REASON_REQUIRED",
        "REJECTION_REASON_REQUIRED",
        "SUSPENSION_REASON_REQUIRED",
        "VERIFICATION_METHOD_REQUIRED",
        "VERIFICATION_EVIDENCE_REQUIRED",
        "VERIFICATION_EVIDENCE_TOO_LONG",
        "INVALID_SOURCE_URL",
        "INVALID_PUBLIC_SOURCE_URL",
      ].includes(code)
    ) {
      return jsonNoStore(
        { message: "Data review tidak valid atau belum lengkap." },
        400,
      );
    }

    if (code === "SIAGA_REVIEW_UNAVAILABLE") {
      return jsonNoStore(
        { message: "Fitur verifikasi Siaga belum tersedia pada database." },
        503,
      );
    }

    console.error("Admin Siaga review API failed:", code);

    return jsonNoStore(
      { message: "Gagal memproses keputusan verifikasi Siaga." },
      500,
    );
  }
}