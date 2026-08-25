"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import { register } from "../services/auth.service";

import {
  registerSchema,
  type RegisterFormValues,
} from "../validators/register.schema";

type FieldErrors = Partial<
  Record<
    keyof RegisterFormValues,
    string
  >
>;

export default function RegisterForm() {
  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<FieldErrors>({});

  const [
    confirmationEmail,
    setConfirmationEmail,
  ] = useState("");

  function clearFieldError(
    field: keyof RegisterFormValues,
  ) {
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  async function handleRegister(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setFormError("");
    setFieldErrors({});

    const result =
      registerSchema.safeParse({
        full_name: fullName,
        email,
        password,
        confirm_password:
          confirmPassword,
      });

    if (!result.success) {
      const nextErrors: FieldErrors = {};

      for (
        const issue
        of result.error.issues
      ) {
        const field =
          issue.path[0];

        if (
          field === "full_name" ||
          field === "email" ||
          field === "password" ||
          field === "confirm_password"
        ) {
          if (!nextErrors[field]) {
            nextErrors[field] =
              issue.message;
          }
        }
      }

      setFieldErrors(nextErrors);

      return;
    }

    try {
      setLoading(true);

      const data = await register({
        full_name:
          result.data.full_name,
        email:
          result.data.email,
        password:
          result.data.password,
      });

      if (data.session) {
        window.location.href =
          "/home";

        return;
      }

      setConfirmationEmail(
        result.data.email,
      );
    } catch (error: unknown) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : "";

      const normalizedMessage =
        rawMessage.toLowerCase();

      if (
        normalizedMessage.includes(
          "user already registered",
        )
      ) {
        setFormError(
          "Email ini sudah terdaftar. Silakan masuk menggunakan akun Anda.",
        );

        return;
      }

      if (
        normalizedMessage.includes(
          "password",
        ) &&
        normalizedMessage.includes(
          "characters",
        )
      ) {
        setFormError(
          "Kata sandi belum memenuhi persyaratan keamanan.",
        );

        return;
      }

      setFormError(
        rawMessage ||
          "Pendaftaran gagal. Silakan coba kembali.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (confirmationEmail) {
    return (
      <div
        className="
          rounded-3xl
          border
          border-emerald-200
          bg-emerald-50/70
          p-6
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-emerald-100
            text-emerald-600
          "
        >
          <CheckCircle2
            className="h-7 w-7"
            aria-hidden="true"
          />
        </div>

        <h3
          className="
            mt-5
            text-xl
            font-bold
            text-slate-950
          "
        >
          Periksa email Anda
        </h3>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-slate-600
          "
        >
          Kami telah mengirim tautan
          konfirmasi ke
        </p>

        <p
          className="
            mt-1
            break-all
            text-sm
            font-bold
            text-slate-900
          "
        >
          {confirmationEmail}
        </p>

        <p
          className="
            mt-4
            text-sm
            leading-6
            text-slate-500
          "
        >
          Klik tautan pada email
          tersebut untuk mengaktifkan
          akun HelpMe Anda.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleRegister}
      className="space-y-5"
      noValidate
    >
      {formError && (
        <div
          role="alert"
          className="
            flex
            gap-3
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            leading-6
            text-red-700
          "
        >
          <AlertCircle
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
            "
            aria-hidden="true"
          />

          <span>{formError}</span>
        </div>
      )}

      {/* FULL NAME */}
      <div>
        <label
          htmlFor="register-full-name"
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-slate-700
          "
        >
          Nama lengkap
        </label>

        <div className="relative">
          <UserRound
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              h-5
              w-5
              -translate-y-1/2
              text-slate-400
            "
            aria-hidden="true"
          />

          <input
            id="register-full-name"
            type="text"
            value={fullName}
            onChange={(event) => {
              setFullName(
                event.target.value,
              );

              clearFieldError(
                "full_name",
              );
            }}
            placeholder="Nama lengkap Anda"
            autoComplete="name"
            required
            disabled={loading}
            aria-invalid={
              Boolean(
                fieldErrors.full_name,
              )
            }
            className="
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              py-3.5
              pl-12
              pr-4
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-primary-500
              focus:bg-white
              focus:ring-4
              focus:ring-primary-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:text-base
            "
          />
        </div>

        {fieldErrors.full_name && (
          <p
            className="
              mt-2
              text-sm
              text-red-600
            "
          >
            {fieldErrors.full_name}
          </p>
        )}
      </div>

      {/* EMAIL */}
      <div>
        <label
          htmlFor="register-email"
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-slate-700
          "
        >
          Email
        </label>

        <div className="relative">
          <Mail
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              h-5
              w-5
              -translate-y-1/2
              text-slate-400
            "
            aria-hidden="true"
          />

          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(
                event.target.value,
              );

              clearFieldError(
                "email",
              );
            }}
            placeholder="nama@email.com"
            autoComplete="email"
            inputMode="email"
            required
            disabled={loading}
            aria-invalid={
              Boolean(
                fieldErrors.email,
              )
            }
            className="
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              py-3.5
              pl-12
              pr-4
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-primary-500
              focus:bg-white
              focus:ring-4
              focus:ring-primary-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:text-base
            "
          />
        </div>

        {fieldErrors.email && (
          <p
            className="
              mt-2
              text-sm
              text-red-600
            "
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* PASSWORD */}
      <div>
        <label
          htmlFor="register-password"
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-slate-700
          "
        >
          Kata sandi
        </label>

        <div className="relative">
          <LockKeyhole
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              h-5
              w-5
              -translate-y-1/2
              text-slate-400
            "
            aria-hidden="true"
          />

          <input
            id="register-password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(event) => {
              setPassword(
                event.target.value,
              );

              clearFieldError(
                "password",
              );
            }}
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            required
            disabled={loading}
            aria-invalid={
              Boolean(
                fieldErrors.password,
              )
            }
            className="
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              py-3.5
              pl-12
              pr-12
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-primary-500
              focus:bg-white
              focus:ring-4
              focus:ring-primary-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:text-base
            "
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (current) =>
                  !current,
              )
            }
            disabled={loading}
            aria-label={
              showPassword
                ? "Sembunyikan kata sandi"
                : "Tampilkan kata sandi"
            }
            className="
              absolute
              right-3
              top-1/2
              flex
              h-9
              w-9
              -translate-y-1/2
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              focus:outline-none
              focus:ring-2
              focus:ring-primary-100
              disabled:opacity-50
            "
          >
            {showPassword ? (
              <EyeOff
                className="h-5 w-5"
                aria-hidden="true"
              />
            ) : (
              <Eye
                className="h-5 w-5"
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        {fieldErrors.password ? (
          <p
            className="
              mt-2
              text-sm
              text-red-600
            "
          >
            {fieldErrors.password}
          </p>
        ) : (
          <p
            className="
              mt-2
              text-xs
              text-slate-400
            "
          >
            Gunakan minimal 8 karakter.
          </p>
        )}
      </div>

      {/* CONFIRM PASSWORD */}
      <div>
        <label
          htmlFor="register-confirm-password"
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-slate-700
          "
        >
          Konfirmasi kata sandi
        </label>

        <div className="relative">
          <LockKeyhole
            className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              h-5
              w-5
              -translate-y-1/2
              text-slate-400
            "
            aria-hidden="true"
          />

          <input
            id="register-confirm-password"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(
                event.target.value,
              );

              clearFieldError(
                "confirm_password",
              );
            }}
            placeholder="Ulangi kata sandi"
            autoComplete="new-password"
            required
            disabled={loading}
            aria-invalid={
              Boolean(
                fieldErrors.confirm_password,
              )
            }
            className="
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              py-3.5
              pl-12
              pr-12
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              hover:border-slate-300
              focus:border-primary-500
              focus:bg-white
              focus:ring-4
              focus:ring-primary-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:text-base
            "
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (current) =>
                  !current,
              )
            }
            disabled={loading}
            aria-label={
              showConfirmPassword
                ? "Sembunyikan konfirmasi kata sandi"
                : "Tampilkan konfirmasi kata sandi"
            }
            className="
              absolute
              right-3
              top-1/2
              flex
              h-9
              w-9
              -translate-y-1/2
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              focus:outline-none
              focus:ring-2
              focus:ring-primary-100
              disabled:opacity-50
            "
          >
            {showConfirmPassword ? (
              <EyeOff
                className="h-5 w-5"
                aria-hidden="true"
              />
            ) : (
              <Eye
                className="h-5 w-5"
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        {fieldErrors.confirm_password && (
          <p
            className="
              mt-2
              text-sm
              text-red-600
            "
          >
            {
              fieldErrors.confirm_password
            }
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-primary-600
          px-5
          py-3.5
          text-sm
          font-bold
          text-white
          shadow-sm
          transition
          hover:bg-primary-500
          focus:outline-none
          focus:ring-4
          focus:ring-primary-100
          disabled:cursor-not-allowed
          disabled:opacity-60
          sm:text-base
        "
      >
        {loading && (
          <LoaderCircle
            className="
              h-5
              w-5
              animate-spin
            "
            aria-hidden="true"
          />
        )}

        {loading
          ? "Membuat akun..."
          : "Buat akun HelpMe"}
      </button>
    </form>
  );
}