import "server-only";

import {
  requireAdmin,
} from "@/features/admin/services/admin-auth.service";

import {
  updateAdRepository,
} from "@/features/ads/repositories/updateAd.repository";

import {
  updateAdSchema,
  type UpdateAdInput,
} from "@/features/ads/validators/updateAd.validator";

export async function updateAdService(
  id: string,

  input: unknown,
) {
  await requireAdmin();

  if (!id) {
    throw new Error(
      "INVALID_ID",
    );
  }

  const validatedInput:
    UpdateAdInput =
      updateAdSchema.parse(
        input,
      );

  return updateAdRepository(
    id,

    validatedInput,
  );
}