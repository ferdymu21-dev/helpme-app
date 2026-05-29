"use client";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "../validators/login.schema";

import { LoginData } from "../types/auth.types";

import { loginUser } from "../services/auth.service";

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(
    data: LoginData
  ) {
    const { error } =
      await loginUser(data);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/home");

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
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
          : "Login"}
      </button>
    </form>
  );
}