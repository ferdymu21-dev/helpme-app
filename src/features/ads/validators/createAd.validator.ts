import { z } from "zod";

export const createAdSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul iklan wajib diisi.")
    .max(150, "Judul iklan maksimal 150 karakter."),

  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter.")
    .nullable()
    .optional(),

  image_url: z.string().trim().min(1, "URL gambar wajib diisi."),

  button_text: z
    .string()
    .trim()
    .min(1, "Teks tombol wajib diisi.")
    .max(50, "Teks tombol maksimal 50 karakter."),

  link_url: z.string().trim().min(1, "Link iklan wajib diisi."),

  position: z.enum(["home_desktop", "home_mobile"]),

  is_active: z.boolean().default(true),

  start_at: z.string().datetime({ offset: true }).nullable().optional(),

  end_at: z.string().datetime({ offset: true }).nullable().optional(),

  sort_order: z.number().int().min(0).default(0),
});

export type CreateAdInput = z.infer<typeof createAdSchema>;