import { requireAdmin } from "@/features/admin/services/admin-auth.service";

import { createAdRepository } from "../repositories/createAd.repository";
import { createAdSchema } from "../validators/createAd.validator";

export async function createAdService(
  input: unknown,
) {
  await requireAdmin();

  const validatedInput =
    createAdSchema.parse(input);

  return createAdRepository(
    validatedInput,
  );
}