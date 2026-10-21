import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";
import { requireSiagaAdmin } from "@/features/admin/siaga/server/require-siaga-admin";

const REVIEW_DECISIONS = [
  "VERIFIED",
  "NEEDS_CORRECTION",
  "REJECTED",
  "SUSPENDED",
  "REACTIVATED",
] as const;

const VERIFICATION_METHODS = [
  "OFFICIAL_WEBSITE",
  "PHONE_CONFIRMATION",
  "PUBLIC_RECORD",
  "DOCUMENT_REVIEW",
  "IN_PERSON",
  "OTHER",
] as const;

const DATABASE_ERROR_TOKENS = [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "ORGANIZATION_NOT_FOUND",
  "INVALID_ORGANIZATION_DECISION",
  "INVALID_ORGANIZATION_TRANSITION",
  "CORRECTION_REASON_REQUIRED",
  "REJECTION_REASON_REQUIRED",
  "SUSPENSION_REASON_REQUIRED",
  "VERIFICATION_METHOD_REQUIRED",
  "VERIFICATION_EVIDENCE_REQUIRED",
  "VERIFICATION_EVIDENCE_TOO_LONG",
  "INVALID_SOURCE_URL",
  "INVALID_PUBLIC_SOURCE_URL",
] as const;

type ReviewDecision = (typeof REVIEW_DECISIONS)[number];
type VerificationMethod = (typeof VERIFICATION_METHODS)[number];

interface ReviewInput {
  decision: ReviewDecision;
  reason: string | null;
  verificationMethod: VerificationMethod | null;
  sourceName: string | null;
  sourceUrl: string | null;
  publicSourceLabel: string | null;
  publicSourceUrl: string | null;
  evidenceSummary: string | null;
  adminNotes: string | null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readOptionalText(
  value: Record<string, unknown>,
  key: string,
  maxLength: number,
): string | null {
  const raw = value[key];

  if (raw === undefined || raw === null) {
    return null;
  }

  if (typeof raw !== "string") {
    throw new Error("INVALID_REVIEW_INPUT");
  }

  const normalized = raw.trim();

  if (normalized.length > maxLength) {
    throw new Error("INVALID_REVIEW_INPUT");
  }

  return normalized || null;
}

function validateHttpUrl(
  value: string | null,
  errorCode: string,
): void {
  if (value === null) {
    return;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(errorCode);
  }

  if (
    parsedUrl.protocol !== "http:" &&
    parsedUrl.protocol !== "https:"
  ) {
    throw new Error(errorCode);
  }
}

function parseReviewInput(value: unknown): ReviewInput {
  if (!isRecord(value)) {
    throw new Error("INVALID_REVIEW_INPUT");
  }

  const rawDecision = value.decision;

  if (typeof rawDecision !== "string") {
    throw new Error("INVALID_ORGANIZATION_DECISION");
  }

  const normalizedDecision = rawDecision.trim().toUpperCase();
  const decision = REVIEW_DECISIONS.find(
    (candidate) => candidate === normalizedDecision,
  );

  if (!decision) {
    throw new Error("INVALID_ORGANIZATION_DECISION");
  }

  const reason = readOptionalText(value, "reason", 2000);
  const sourceName = readOptionalText(value, "sourceName", 250);
  const sourceUrl = readOptionalText(value, "sourceUrl", 500);
  const publicSourceLabel = readOptionalText(
    value,
    "publicSourceLabel",
    120,
  );
  const publicSourceUrl = readOptionalText(
    value,
    "publicSourceUrl",
    500,
  );
  const evidenceSummary = readOptionalText(
    value,
    "evidenceSummary",
    2000,
  );
  const adminNotes = readOptionalText(value, "adminNotes", 2000);

  let verificationMethod: VerificationMethod | null = null;

  if (value.verificationMethod !== undefined &&
      value.verificationMethod !== null) {
    if (typeof value.verificationMethod !== "string") {
      throw new Error("INVALID_REVIEW_INPUT");
    }

    const normalizedMethod = value.verificationMethod.trim().toUpperCase();
    const foundMethod = VERIFICATION_METHODS.find(
      (candidate) => candidate === normalizedMethod,
    );

    if (!foundMethod) {
      throw new Error("INVALID_REVIEW_INPUT");
    }

    verificationMethod = foundMethod;
  }

  if (
    (decision === "NEEDS_CORRECTION" ||
      decision === "REJECTED" ||
      decision === "SUSPENDED") &&
    reason === null
  ) {
    throw new Error(
      decision === "NEEDS_CORRECTION"
        ? "CORRECTION_REASON_REQUIRED"
        : decision === "REJECTED"
          ? "REJECTION_REASON_REQUIRED"
          : "SUSPENSION_REASON_REQUIRED",
    );
  }

  if (
    decision === "VERIFIED" ||
    decision === "REACTIVATED"
  ) {
    if (verificationMethod === null) {
      throw new Error("VERIFICATION_METHOD_REQUIRED");
    }

    if (
      sourceName === null ||
      publicSourceLabel === null ||
      evidenceSummary === null
    ) {
      throw new Error("VERIFICATION_EVIDENCE_REQUIRED");
    }
  }

  validateHttpUrl(sourceUrl, "INVALID_SOURCE_URL");
  validateHttpUrl(publicSourceUrl, "INVALID_PUBLIC_SOURCE_URL");

  return {
    decision,
    reason,
    verificationMethod,
    sourceName,
    sourceUrl,
    publicSourceLabel,
    publicSourceUrl,
    evidenceSummary,
    adminNotes,
  };
}

function readRequiredResultString(
  row: Record<string, unknown>,
  key: string,
): string {
  const value = row[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error("INVALID_REVIEW_RESULT");
  }

  return value;
}

function readNullableResultString(
  row: Record<string, unknown>,
  key: string,
): string | null {
  const value = row[key];

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("INVALID_REVIEW_RESULT");
  }

  return value;
}

function parseReviewResult(
  value: unknown,
  expectedOrganizationId: string,
) {
  if (
    !Array.isArray(value) ||
    value.length !== 1 ||
    !isRecord(value[0])
  ) {
    throw new Error("INVALID_REVIEW_RESULT");
  }

  const row = value[0];
  const organizationId = readRequiredResultString(
    row,
    "result_organization_id",
  );
  const verificationStatus = readRequiredResultString(
    row,
    "result_verification_status",
  );

  if (
    organizationId !== expectedOrganizationId ||
    ![
      "PENDING",
      "NEEDS_CORRECTION",
      "VERIFIED",
      "REJECTED",
      "SUSPENDED",
    ].includes(verificationStatus)
  ) {
    throw new Error("INVALID_REVIEW_RESULT");
  }

  const reviewedAt = readRequiredResultString(
    row,
    "result_reviewed_at",
  );
  const updatedAt = readRequiredResultString(
    row,
    "result_updated_at",
  );

  if (
    !Number.isFinite(Date.parse(reviewedAt)) ||
    !Number.isFinite(Date.parse(updatedAt))
  ) {
    throw new Error("INVALID_REVIEW_RESULT");
  }

  return {
    organization: {
      id: organizationId,
      verificationStatus,
      verifiedAt: readNullableResultString(
        row,
        "result_verified_at",
      ),
      rejectionReason: readNullableResultString(
        row,
        "result_rejection_reason",
      ),
      correctionReason: readNullableResultString(
        row,
        "result_correction_reason",
      ),
    },
    reviewedAt,
    updatedAt,
  };
}

export async function reviewAdminSiagaOrganization(
  organizationId: string,
  body: unknown,
) {
  const { user } = await requireSiagaAdmin();

  if (!UUID_PATTERN.test(organizationId)) {
    throw new Error("INVALID_ORGANIZATION_ID");
  }

  const input = parseReviewInput(body);

  const {
    data,
    error,
  } = await adminSupabase.rpc(
    "admin_review_emergency_organization",
    {
      p_actor_user_id: user.id,
      p_organization_id: organizationId,
      p_decision: input.decision,
      p_reason: input.reason,
      p_verification_method: input.verificationMethod,
      p_source_name: input.sourceName,
      p_source_url: input.sourceUrl,
      p_public_source_label: input.publicSourceLabel,
      p_public_source_url: input.publicSourceUrl,
      p_evidence_summary: input.evidenceSummary,
      p_admin_notes: input.adminNotes,
    },
  );

  if (error) {
    const knownToken = DATABASE_ERROR_TOKENS.find(
      (token) => error.message.includes(token),
    );

    if (knownToken) {
      throw new Error(knownToken);
    }

    if (
      ["PGRST202", "PGRST205", "42883", "42P01"].includes(
        error.code,
      )
    ) {
      throw new Error("SIAGA_REVIEW_UNAVAILABLE");
    }

    console.error(
      "Admin Siaga review RPC failed:",
      error.code,
    );
    throw new Error("SIAGA_REVIEW_FAILED");
  }

  return parseReviewResult(data, organizationId);
}