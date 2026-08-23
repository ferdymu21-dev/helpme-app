import { z } from "zod";

const adPositionSchema = z.enum(["home_desktop", "home_mobile"]);

export const updateAdSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul iklan wajib diisi.")
    .max(150, "Judul iklan maksimal 150 karakter.")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter.")
    .nullable()
    .optional(),

  image_url: z.string().trim().url("URL gambar tidak valid.").optional(),

  button_text: z
    .string()
    .trim()
    .min(1, "Teks tombol wajib diisi.")
    .max(50, "Teks tombol maksimal 50 karakter.")
    .optional(),

  link_url: z
    .string()
    .trim()
    .min(1, "Link iklan wajib diisi.")
    .max(1000, "Link iklan terlalu panjang.")
    .optional(),

  position: adPositionSchema.optional(),

  is_active: z.boolean().optional(),

  start_at: z
    .string()
    .datetime({
      offset: true,
    })
    .nullable()
    .optional(),

  end_at: z
    .string()
    .datetime({
      offset: true,
    })
    .nullable()
    .optional(),

  sort_order: z
    .number()
    .int()
    .min(0, "Urutan iklan tidak boleh negatif.")
    .optional(),
});

export type UpdateAdInput = z.infer<typeof updateAdSchema>;