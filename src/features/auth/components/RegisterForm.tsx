"use client";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { registerSchema } from "../validators/register.schema";

import { RegisterData } from "../types/auth.types";

import { registerUser } from "../services/auth.service";

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(
    data: RegisterData
  ) {
    const { error } =
      await registerUser(data);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/login");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* FULL NAME */}
      <div>
        <input
          type="text"
          placeholder="Nama Lengkap"
          {...register("full_name")}
          className="w-full rounded-lg border p-3"
        />

        {errors.full_name && (
          <p className="text-sm text-red-500">
            {errors.full_name.message}
          </p>
        )}
      </div>

      {/* EMAIL */}
      <div>
        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          className="w-full rounded-lg border p-3"
        />

        {errors.email && (
          <p className="text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* PASSWORD */}
      <div>
        <input
          type="password"
          placeholder="Password"
          {...register("password")}
          className="w-full rounded-lg border p-3"
        />

        {errors.password && (
          <p className="text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-black p-3 text-white"
      >
        {isSubmitting
          ? "Loading..."
          : "Register"}
      </button>
    </form>
  );
}