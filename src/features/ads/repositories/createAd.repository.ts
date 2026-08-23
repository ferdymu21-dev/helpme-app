import { adminSupabase } from "@/lib/supabase/admin";

import type { CreateAdInput } from "../validators/createAd.validator";
import type { Ad } from "../types/ad.types";

export async function createAdRepository(input: CreateAdInput): Promise<Ad> {
  const { data, error } = await adminSupabase
    .from("ads")
    .insert({
      title: input.title,
      description: input.description ?? null,
      image_url: input.image_url,
      button_text: input.button_text,
      link_url: input.link_url,
      position: input.position,
      is_active: input.is_active,
      start_at: input.start_at ?? null,
      end_at: input.end_at ?? null,
      sort_order: input.sort_order,
    })
    .select(
      `
        id,
        title,
        description,
        image_url,
        button_text,
        link_url,
        position,
        is_active,
        start_at,
        end_at,
        sort_order,
        created_at,
        updated_at
      `,
    )
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Iklan gagal dibuat.");
  }

  return data;
}