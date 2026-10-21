import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { adminSupabase } from "@/lib/supabase/admin";
import {
  requireSiagaApiUser,
  SiagaApiError,
} from "@/features/siaga/server/require-siaga-api-user";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const BUCKET = "emergency-organization-media";
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 128 * 1024;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MediaKind = "profile" | "cover";

function jsonNoStore(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function detectImage(
  bytes: Buffer,
): { mimeType: "image/jpeg" | "image/png" | "image/webp"; extension: "jpg" | "png" | "webp" } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mimeType: "image/png", extension: "png" };
  }

  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { mimeType: "image/webp", extension: "webp" };
  }

  return null;
}

function isCurrentlySuspended(
  isSuspended: boolean,
  suspendedUntil: string | null,
): boolean {
  if (!isSuspended) return false;
  if (suspendedUntil === null) return true;
  const until = Date.parse(suspendedUntil);
  return !Number.isFinite(until) || until > Date.now();
}

export async function POST(request: NextRequest, context: RouteContext) {
  let uploadedPath: string | null = null;

  try {
    const { id: organizationId } = await context.params;
    if (!UUID_PATTERN.test(organizationId)) {
      return jsonNoStore({ message: "ID organisasi tidak valid." }, 400);
    }

    const contentLength = request.headers.get("content-length");
    if (
      contentLength !== null &&
      /^\d+$/.test(contentLength) &&
      Number(contentLength) > MAX_REQUEST_BYTES
    ) {
      return jsonNoStore({ message: "Ukuran permintaan terlalu besar." }, 413);
    }

    const user = await requireSiagaApiUser(request);

    const { data: actor, error: actorError } = await adminSupabase
      .from("users")
      .select("role, is_banned, is_suspended, suspended_until")
      .eq("id", user.id)
      .maybeSingle();

    if (
      actorError ||
      !actor ||
      actor.is_banned === true ||
      isCurrentlySuspended(
        actor.is_suspended === true,
        typeof actor.suspended_until === "string" ? actor.suspended_until : null,
      )
    ) {
      return jsonNoStore({ message: "Akun tidak diizinkan mengubah media organisasi." }, 403);
    }

    const { data: organization, error: organizationError } = await adminSupabase
      .from("emergency_organizations")
      .select("id, created_by, is_admin_managed, verification_status")
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      console.error("SIAGA media organization query failed:", organizationError.code);
      return jsonNoStore({ message: "Organisasi belum dapat diperiksa." }, 500);
    }
    if (!organization) {
      return jsonNoStore({ message: "Organisasi tidak ditemukan." }, 404);
    }

    const isOwner = organization.created_by === user.id;
    const mayManageAdminOrganization =
      organization.is_admin_managed === true && actor.role === "ADMIN";
    if (!isOwner && !mayManageAdminOrganization) {
      return jsonNoStore({ message: "Anda tidak berwenang mengubah media organisasi ini." }, 403);
    }
    if (organization.verification_status === "SUSPENDED") {
      return jsonNoStore({ message: "Organisasi yang ditangguhkan tidak dapat diubah." }, 409);
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return jsonNoStore({ message: "Form upload tidak valid." }, 400);
    }

    const kindValue = formData.get("kind");
    const fileValue = formData.get("file");
    if (kindValue !== "profile" && kindValue !== "cover") {
      return jsonNoStore({ message: "Jenis gambar tidak valid." }, 400);
    }
    if (!(fileValue instanceof File)) {
      return jsonNoStore({ message: "Pilih file gambar terlebih dahulu." }, 400);
    }
    if (fileValue.size <= 0 || fileValue.size > MAX_FILE_BYTES) {
      return jsonNoStore({ message: "Ukuran gambar harus antara 1 byte dan 5 MB." }, 413);
    }

    const bytes = Buffer.from(await fileValue.arrayBuffer());
    const detected = detectImage(bytes);
    if (!detected || fileValue.type !== detected.mimeType) {
      return jsonNoStore({ message: "Isi file tidak sesuai gambar JPG, PNG, atau WebP yang valid." }, 415);
    }

    const mediaKind: MediaKind = kindValue;
    const mediaFolder = mediaKind === "profile" ? "profile" : "cover";
    const storagePath = `${organizationId}/${mediaFolder}/${randomUUID()}.${detected.extension}`;

    const { error: uploadError } = await adminSupabase.storage
      .from(BUCKET)
      .upload(storagePath, bytes, {
        contentType: detected.mimeType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("SIAGA media upload failed:", uploadError.message);
      return jsonNoStore({ message: "Gambar gagal disimpan. Periksa konfigurasi bucket staging." }, 500);
    }
    uploadedPath = storagePath;

    const { data, error: rpcError } = await adminSupabase.rpc(
      "set_emergency_organization_media_path",
      {
        p_actor_user_id: user.id,
        p_organization_id: organizationId,
        p_media_kind: mediaKind.toUpperCase(),
        p_storage_path: storagePath,
      },
    );

    if (rpcError) {
      await adminSupabase.storage.from(BUCKET).remove([storagePath]);
      uploadedPath = null;
      console.error("SIAGA media path update failed:", rpcError.message);
      return jsonNoStore({ message: "Gambar terunggah, tetapi gagal ditautkan ke organisasi. Periksa migrasi media staging." }, 500);
    }

    const resultRow = Array.isArray(data) ? data[0] : data;
    if (!isRecord(resultRow) || !("result_previous_storage_path" in resultRow)) {
      await adminSupabase.storage.from(BUCKET).remove([storagePath]);
      uploadedPath = null;
      return jsonNoStore({ message: "Respons penyimpanan gambar tidak valid." }, 500);
    }

    const previousPath =
      typeof resultRow.result_previous_storage_path === "string"
        ? resultRow.result_previous_storage_path
        : null;

    if (
      previousPath &&
      previousPath !== storagePath &&
      previousPath.startsWith(`${organizationId}/`) &&
      !previousPath.includes("..")
    ) {
      const { error: removeError } = await adminSupabase.storage
        .from(BUCKET)
        .remove([previousPath]);
      if (removeError) {
        console.error("SIAGA old media cleanup failed:", removeError.message);
      }
    }

    uploadedPath = null;
    return jsonNoStore({
      message: mediaKind === "profile"
        ? "Foto profil organisasi berhasil diperbarui."
        : "Foto sampul organisasi berhasil diperbarui.",
    });
  } catch (error) {
    if (uploadedPath) {
      await adminSupabase.storage.from(BUCKET).remove([uploadedPath]);
    }

    if (error instanceof SiagaApiError && error.code === "UNAUTHORIZED") {
      return jsonNoStore({ message: "Anda belum login. Silakan login kembali." }, 401);
    }

    console.error(
      "POST /api/siaga/provider/organizations/[id]/media failed:",
      error instanceof Error ? error.message : "UNKNOWN_ERROR",
    );
    return jsonNoStore({ message: "Terjadi kesalahan saat mengunggah gambar organisasi." }, 500);
  }
}