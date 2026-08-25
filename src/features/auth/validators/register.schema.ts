import { z } from "zod";

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(
        3,
        "Nama lengkap minimal 3 karakter.",
      ),

    email: z
      .string()
      .trim()
      .email(
        "Masukkan alamat email yang valid.",
      ),

    password: z
      .string()
      .min(
        8,
        "Kata sandi minimal 8 karakter.",
      ),

    confirm_password: z
      .string()
      .min(
        1,
        "Konfirmasi kata sandi wajib diisi.",
      ),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirm_password,
    {
      message:
        "Konfirmasi kata sandi tidak cocok.",
      path: ["confirm_password"],
    },
  );

export type RegisterFormValues =
  z.infer<typeof registerSchema>;