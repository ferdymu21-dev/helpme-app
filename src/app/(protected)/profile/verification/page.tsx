"use client";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Info,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UploadCloud,
} from "lucide-react";

import imageCompression from "browser-image-compression";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

import { supabase } from "@/lib/supabase/client";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function VerificationPage() {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    null,
  );

  const [rejectionReason, setRejectionReason] = useState("");
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState("");
  const [selfiePreview, setSelfiePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [
  showMobileNavbar,
  setShowMobileNavbar,
] = useState(true);

const lastScrollYRef = useRef(0);

  useEffect(() => {
    return () => {
      if (ktpPreview) {
        URL.revokeObjectURL(ktpPreview);
      }

      if (selfiePreview) {
        URL.revokeObjectURL(selfiePreview);
      }
    };
  }, [ktpPreview, selfiePreview]);

  useEffect(() => {
    async function loadStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: pendingRequest } = await supabase
        .from("verification_requests")
        .select(
          `
        status
    `,
        )
        .eq("user_id", user.id)
        .eq("status", "PENDING")
        .maybeSingle();

      if (pendingRequest) {
        setVerificationStatus("PENDING");

        return;
      }

      const { data } = await supabase
        .from("users")
        .select(
          `
            verification_status
        `,
        )
        .eq("id", user.id)
        .single();

      setVerificationStatus(data?.verification_status || "UNVERIFIED");

      if (data?.verification_status === "REJECTED") {
        const { data: rejectedRequest } = await supabase
          .from("verification_requests")
          .select("rejection_reason")
          .eq("user_id", user.id)
          .eq("status", "REJECTED")
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .single();

        setRejectionReason(rejectedRequest?.rejection_reason || "");
      }
    }

    loadStatus();
  }, []);

  useEffect(() => {
  lastScrollYRef.current =
    window.scrollY;

  function handleScroll() {
    const currentScrollY =
      window.scrollY;

    const previousScrollY =
      lastScrollYRef.current;

    /*
     * Saat berada dekat bagian paling atas,
     * navbar selalu ditampilkan.
     */
    if (currentScrollY <= 16) {
      setShowMobileNavbar(true);

      lastScrollYRef.current =
        currentScrollY;

      return;
    }

    /*
     * Scroll cukup jauh ke bawah
     * -> sembunyikan navbar.
     */
    if (
      currentScrollY >
      previousScrollY + 8
    ) {
      setShowMobileNavbar(false);

      lastScrollYRef.current =
        currentScrollY;

      return;
    }

    /*
     * Scroll cukup jauh ke atas
     * -> tampilkan navbar.
     */
    if (
      currentScrollY <
      previousScrollY - 8
    ) {
      setShowMobileNavbar(true);

      lastScrollYRef.current =
        currentScrollY;
    }
  }

  window.addEventListener(
    "scroll",
    handleScroll,
    {
      passive: true,
    },
  );

  return () => {
    window.removeEventListener(
      "scroll",
      handleScroll,
    );
  };
}, []);

  async function handleKtpChange(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert("Format KTP harus JPG, PNG, atau WEBP");

      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran KTP maksimal 2MB");

      return;
    }

    const compressed = await imageCompression(file, {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    });

    setKtpFile(compressed as File);

    setKtpPreview(URL.createObjectURL(compressed));
  }

  async function handleSelfieChange(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert("Format Selfie harus JPG, PNG, atau WEBP");

      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran Selfie maksimal 10MB");

      return;
    }

    const compressed = await imageCompression(file, {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    });

    setSelfieFile(compressed as File);

    setSelfiePreview(URL.createObjectURL(compressed));
  }

  async function handleSubmitVerification() {
    try {
      if (!ktpFile || !selfieFile) {
        alert("Upload KTP dan selfie terlebih dahulu");

        return;
      }

      setUploading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      /* =========================
               CHECK EXISTING REQUEST
            ========================= */

      const { data: existingRequest } = await supabase
        .from("verification_requests")
        .select(
          `
        id,
        status
    `,
        )
        .eq("user_id", user.id)
        .eq("status", "PENDING")
        .maybeSingle();

      if (existingRequest) {
        alert("Verifikasi Anda masih sedang diproses");

        return;
      }

      /* =========================
               FILE PATH
            ========================= */

      const timestamp = Date.now();

      const ktpPath = `${user.id}/ktp-${timestamp}.jpg`;

      const selfiePath = `${user.id}/selfie-${timestamp}.jpg`;

      /* =========================
               UPLOAD KTP
            ========================= */

      const { error: ktpError } = await supabase.storage
        .from("verifications")
        .upload(ktpPath, ktpFile);

      if (ktpError) {
        console.error(ktpError);

        alert("Gagal upload KTP");

        return;
      }

      /* =========================
               UPLOAD SELFIE
            ========================= */

      const { error: selfieError } = await supabase.storage
        .from("verifications")
        .upload(selfiePath, selfieFile);

      if (selfieError) {
        await supabase.storage.from("verifications").remove([ktpPath]);

        alert("Gagal upload selfie");

        return;
      }

      /* =========================
               INSERT REQUEST
            ========================= */

      const { error: requestError } = await supabase
        .from("verification_requests")
        .insert({
          user_id: user.id,

          ktp_url: ktpPath,

          selfie_url: selfiePath,

          status: "PENDING",
        });

      if (requestError) {
        console.error("CODE:", requestError.code);

        console.error("MESSAGE:", requestError.message);

        console.error("DETAILS:", requestError.details);

        console.error("HINT:", requestError.hint);

        alert(requestError.message);

        return;
      }

      /* =========================
               UPDATE USER STATUS
            ========================= */

      const { error: updateError } = await supabase
        .from("users")
        .update({
          verification_status: "PENDING",
        })
        .eq("id", user.id);

      if (updateError) {
        console.error(updateError);
      }

      setVerificationStatus("PENDING");

      alert("Verifikasi berhasil dikirim");

      setKtpFile(null);

      setSelfieFile(null);

      setKtpPreview("");

      setSelfiePreview("");
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  const canUpload =
  verificationStatus === "UNVERIFIED" ||
  verificationStatus === "REJECTED";

const documentsReady =
  Boolean(ktpFile) &&
  Boolean(selfieFile);

    if (verificationStatus === null) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50
          px-6
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-indigo-100
              bg-white
              text-indigo-600
              shadow-sm
            "
          >
            <LoaderCircle
              className="h-6 w-6 animate-spin"
              strokeWidth={2}
            />
          </div>

          <p
            className="
              mt-4
              text-sm
              font-bold
              text-slate-800
            "
          >
            Memuat status verifikasi
          </p>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
            "
          >
            Kami sedang menyiapkan informasi akun Anda.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-slate-50
        pb-28
        lg:pb-12
      "
    >
      {/* DESKTOP BACKGROUND */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          hidden
          h-105
          bg-linear-to-b
          from-indigo-50
          via-violet-50/40
          to-transparent
          lg:block
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -top-32
          right-12
          hidden
          h-96
          w-96
          rounded-full
          bg-indigo-100/40
          blur-3xl
          lg:block
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-6xl
          px-5
          pt-5
          sm:px-6
          lg:px-8
          lg:py-10
        "
      >
        {/* MOBILE HEADER */}
        <header className="lg:hidden">
          <div className="relative flex h-11 items-center">
            <Link
              href="/profile"
              aria-label="Kembali ke profil"
              className="
                relative
                z-10
                -ml-1
                inline-flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-700
                shadow-sm
                transition
                active:scale-95
              "
            >
              <ArrowLeft
                className="h-5 w-5"
                strokeWidth={2.2}
              />
            </Link>

            <h1
              className="
                pointer-events-none
                absolute
                left-1/2
                -translate-x-1/2
                whitespace-nowrap
                text-base
                font-black
                tracking-tight
                text-slate-900
              "
            >
              Verifikasi Akun
            </h1>
          </div>

          <p
            className="
              mt-3
              max-w-sm
              text-sm
              leading-6
              text-slate-500
            "
          >
            Verifikasi identitas membantu menciptakan interaksi
            yang lebih aman dan terpercaya di HelpMe.
          </p>
        </header>

        {/* DESKTOP HEADER */}
        <header
          className="
            mb-8
            hidden
            lg:block
          "
        >
          <Link
            href="/profile"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-bold
              text-slate-500
              transition
              hover:text-indigo-600
            "
          >
            <ArrowLeft
              className="h-4 w-4"
              strokeWidth={2.2}
            />

            Kembali ke Profil
          </Link>

          <div
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-indigo-100
              bg-white/80
              px-3.5
              py-2
              text-xs
              font-bold
              text-indigo-700
              shadow-sm
              backdrop-blur
            "
          >
            <ShieldCheck
              className="h-4 w-4"
              strokeWidth={2}
            />

            Keamanan & Identitas
          </div>

          <h1
            className="
              mt-4
              max-w-3xl
              text-4xl
              font-black
              tracking-[-0.03em]
              text-slate-950
              xl:text-[42px]
            "
          >
            Verifikasi Identitas Anda
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              text-[15px]
              leading-7
              text-slate-500
            "
          >
            Tingkatkan kepercayaan komunitas HelpMe dengan
            memastikan bahwa identitas di balik akun Anda telah
            melalui proses verifikasi.
          </p>
        </header>

        <div
          className="
            mt-6
            grid
            items-start
            gap-6
            lg:mt-0
            lg:grid-cols-[minmax(0,1fr)_330px]
            lg:gap-7
          "
        >
          {/* MAIN CONTENT */}
          <div className="min-w-0">
            {/* STATUS CARD */}
            <section
              className="
                overflow-hidden
                rounded-[28px]
                border
                border-slate-200
                bg-white
                shadow-[0_12px_32px_rgba(15,23,42,0.05)]
              "
            >
              {/* UNVERIFIED */}
              {verificationStatus === "UNVERIFIED" && (
                <div className="p-5 sm:p-6 lg:p-7">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-indigo-50
                      text-indigo-600
                    "
                  >
                    <ShieldCheck
                      className="h-6 w-6"
                      strokeWidth={2}
                    />
                  </div>

                  <div
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-slate-100
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-slate-600
                    "
                  >
                    Belum terverifikasi
                  </div>

                  <h2
                    className="
                      mt-4
                      text-xl
                      font-black
                      tracking-tight
                      text-slate-900
                      sm:text-2xl
                    "
                  >
                    Bangun kepercayaan melalui identitas yang
                    terverifikasi
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-2xl
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Siapkan foto KTP dan selfie yang jelas.
                    Dokumen akan digunakan dalam proses pemeriksaan
                    identitas sebelum badge verified diaktifkan.
                  </p>
                </div>
              )}

              {/* REJECTED */}
              {verificationStatus === "REJECTED" && (
                <div className="p-5 sm:p-6 lg:p-7">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-red-50
                      text-red-600
                    "
                  >
                    <TriangleAlert
                      className="h-6 w-6"
                      strokeWidth={2}
                    />
                  </div>

                  <div
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-red-50
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-red-600
                    "
                  >
                    Perlu diperbaiki
                  </div>

                  <h2
                    className="
                      mt-4
                      text-xl
                      font-black
                      tracking-tight
                      text-slate-900
                      sm:text-2xl
                    "
                  >
                    Dokumen verifikasi perlu dikirim ulang
                  </h2>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Periksa alasan penolakan, lalu unggah foto baru
                    yang lebih jelas agar tim HelpMe dapat melakukan
                    pemeriksaan kembali.
                  </p>

                  {rejectionReason && (
                    <div
                      className="
                        mt-5
                        rounded-2xl
                        border
                        border-red-100
                        bg-red-50/70
                        p-4
                      "
                    >
                      <div className="flex gap-3">
                        <Info
                          className="
                            mt-0.5
                            h-5
                            w-5
                            shrink-0
                            text-red-500
                          "
                          strokeWidth={2}
                        />

                        <div>
                          <p
                            className="
                              text-sm
                              font-black
                              text-red-800
                            "
                          >
                            Alasan penolakan
                          </p>

                          <p
                            className="
                              mt-1
                              text-sm
                              leading-6
                              text-red-600
                            "
                          >
                            {rejectionReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PENDING */}
              {verificationStatus === "PENDING" && (
                <div
                  className="
                    px-5
                    py-10
                    text-center
                    sm:px-8
                    sm:py-12
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-3xl
                      bg-amber-50
                      text-amber-600
                    "
                  >
                    <Clock3
                      className="h-8 w-8"
                      strokeWidth={1.9}
                    />
                  </div>

                  <div
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-amber-50
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-amber-700
                    "
                  >
                    Sedang ditinjau
                  </div>

                  <h2
                    className="
                      mt-4
                      text-2xl
                      font-black
                      tracking-tight
                      text-slate-900
                    "
                  >
                    Dokumen Anda sudah kami terima
                  </h2>

                  <p
                    className="
                      mx-auto
                      mt-3
                      max-w-md
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Tim HelpMe sedang memeriksa dokumen yang Anda
                    kirim. Estimasi proses verifikasi adalah
                    1–3 hari kerja.
                  </p>

                  <div
                    className="
                      mx-auto
                      mt-7
                      max-w-md
                      rounded-2xl
                      border
                      border-slate-100
                      bg-slate-50
                      p-4
                      text-left
                    "
                  >
                    <div className="flex gap-3">
                      <Info
                        className="
                          mt-0.5
                          h-5
                          w-5
                          shrink-0
                          text-indigo-600
                        "
                        strokeWidth={2}
                      />

                      <p
                        className="
                          text-xs
                          leading-5
                          text-slate-500
                        "
                      >
                        Anda tidak perlu mengirim ulang dokumen
                        selama status masih ditinjau. Hasil
                        verifikasi akan muncul setelah proses
                        pemeriksaan selesai.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    className="
                      mt-7
                      inline-flex
                      h-11
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-5
                      text-sm
                      font-bold
                      text-slate-700
                      transition
                      hover:bg-slate-50
                    "
                  >
                    Kembali ke Profil
                  </Link>
                </div>
              )}

              {/* VERIFIED */}
              {verificationStatus === "VERIFIED" && (
                <div
                  className="
                    px-5
                    py-10
                    text-center
                    sm:px-8
                    sm:py-12
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-3xl
                      bg-emerald-50
                      text-emerald-600
                    "
                  >
                    <BadgeCheck
                      className="h-8 w-8"
                      strokeWidth={1.9}
                    />
                  </div>

                  <div
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-emerald-50
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-emerald-700
                    "
                  >
                    Akun terverifikasi
                  </div>

                  <h2
                    className="
                      mt-4
                      text-2xl
                      font-black
                      tracking-tight
                      text-slate-900
                    "
                  >
                    Identitas Anda telah diverifikasi
                  </h2>

                  <p
                    className="
                      mx-auto
                      mt-3
                      max-w-md
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Badge verified sudah aktif dan membantu pengguna
                    lain mengenali akun Anda sebagai akun yang telah
                    melalui pemeriksaan identitas HelpMe.
                  </p>

                  <div
                    className="
                      mx-auto
                      mt-7
                      flex
                      max-w-md
                      items-start
                      gap-3
                      rounded-2xl
                      border
                      border-emerald-100
                      bg-emerald-50/60
                      p-4
                      text-left
                    "
                  >
                    <Sparkles
                      className="
                        mt-0.5
                        h-5
                        w-5
                        shrink-0
                        text-emerald-600
                      "
                      strokeWidth={2}
                    />

                    <p
                      className="
                        text-xs
                        leading-5
                        text-emerald-800
                      "
                    >
                      Status verified akan ditampilkan sebagai bagian
                      dari identitas dan reputasi akun Anda di HelpMe.
                    </p>
                  </div>

                  <Link
                    href="/profile"
                    className="
                      mt-7
                      inline-flex
                      h-11
                      items-center
                      justify-center
                      rounded-2xl
                      bg-indigo-600
                      px-5
                      text-sm
                      font-bold
                      text-white
                      shadow-[0_8px_20px_rgba(79,70,229,0.18)]
                      transition
                      hover:bg-indigo-700
                    "
                  >
                    Lihat Profil Saya
                  </Link>
                </div>
              )}
            </section>

            {/* UPLOAD FLOW */}
            {canUpload && (
              <section
                className="
                  mt-5
                  rounded-[28px]
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-[0_12px_32px_rgba(15,23,42,0.04)]
                  sm:p-6
                  lg:p-7
                "
              >
                <div>
                  <p
                    className="
                      text-xs
                      font-black
                      tracking-wide
                      text-indigo-600
                      uppercase
                    "
                  >
                    Dokumen Verifikasi
                  </p>

                  <h2
                    className="
                      mt-2
                      text-lg
                      font-black
                      text-slate-900
                      sm:text-xl
                    "
                  >
                    Lengkapi dua foto berikut
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      leading-6
                      text-slate-500
                    "
                  >
                    Pastikan seluruh informasi terlihat jelas dan
                    foto tidak buram atau terpotong.
                  </p>
                </div>

                {/* STEPS */}
                <div
                  className="
                    mt-6
                    grid
                    grid-cols-3
                    gap-2
                  "
                >
                  {[
                    {
                      number: "1",
                      label: "KTP",
                    },
                    {
                      number: "2",
                      label: "Selfie",
                    },
                    {
                      number: "3",
                      label: "Kirim",
                    },
                  ].map((step) => (
                    <div
                      key={step.number}
                      className="
                        rounded-2xl
                        border
                        border-slate-100
                        bg-slate-50
                        px-2
                        py-3
                        text-center
                      "
                    >
                      <div
                        className="
                          mx-auto
                          flex
                          h-7
                          w-7
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          text-xs
                          font-black
                          text-indigo-600
                          shadow-sm
                        "
                      >
                        {step.number}
                      </div>

                      <p
                        className="
                          mt-1.5
                          text-[10px]
                          font-bold
                          text-slate-500
                        "
                      >
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* UPLOAD CARDS */}
                <div
                  className="
                    mt-6
                    grid
                    gap-4
                    md:grid-cols-2
                  "
                >
                  {/* KTP */}
                  <div
                    className="
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                    "
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-indigo-50
                          text-indigo-600
                        "
                      >
                        <FileCheck2
                          className="h-5 w-5"
                          strokeWidth={2}
                        />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-sm
                            font-black
                            text-slate-900
                          "
                        >
                          Foto Identitas (KTP, SIM, KTM)
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[11px]
                            leading-4
                            text-slate-500
                          "
                        >
                          JPG, PNG, atau WEBP · Maks. 2 MB
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        mt-4
                        flex
                        min-h-45
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-2xl
                        border
                        border-dashed
                        border-slate-200
                        bg-slate-50
                      "
                    >
                      {ktpPreview ? (
                        <img
                          src={ktpPreview}
                          alt="Preview KTP"
                          className="
                            h-45
                            w-full
                            object-contain
                            p-2
                          "
                        />
                      ) : (
                        <div className="px-5 py-8 text-center">
                          <UploadCloud
                            className="
                              mx-auto
                              h-7
                              w-7
                              text-slate-400
                            "
                            strokeWidth={1.8}
                          />

                          <p
                            className="
                              mt-3
                              text-xs
                              font-bold
                              text-slate-700
                            "
                          >
                            Belum ada foto KTP
                          </p>

                          <p
                            className="
                              mt-1
                              text-[10px]
                              leading-4
                              text-slate-400
                            "
                          >
                            Pastikan seluruh sisi kartu terlihat
                            dan tulisan dapat dibaca.
                          </p>
                        </div>
                      )}
                    </div>

                    <input
                      id="ktp-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const file =
                          e.target.files?.[0];

                        if (!file) return;

                        handleKtpChange(file);
                      }}
                    />

                    <label
                      htmlFor="ktp-upload"
                      className="
                        mt-4
                        flex
                        h-10
                        cursor-pointer
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-xs
                        font-bold
                        text-slate-700
                        transition
                        hover:border-indigo-200
                        hover:bg-indigo-50
                        hover:text-indigo-700
                      "
                    >
                      <UploadCloud
                        className="h-4 w-4"
                        strokeWidth={2}
                      />

                      {ktpFile
                        ? "Ganti Foto KTP"
                        : "Pilih Foto KTP"}
                    </label>

                    {ktpFile && (
                      <div
                        className="
                          mt-3
                          flex
                          items-center
                          gap-2
                          rounded-xl
                          bg-emerald-50
                          px-3
                          py-2.5
                        "
                      >
                        <CheckCircle2
                          className="
                            h-4
                            w-4
                            shrink-0
                            text-emerald-600
                          "
                          strokeWidth={2}
                        />

                        <p
                          className="
                            min-w-0
                            truncate
                            text-[10px]
                            font-bold
                            text-emerald-700
                          "
                        >
                          Foto KTP siap dikirim
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SELFIE */}
                  <div
                    className="
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                    "
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-violet-50
                          text-violet-600
                        "
                      >
                        <Camera
                          className="h-5 w-5"
                          strokeWidth={2}
                        />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-sm
                            font-black
                            text-slate-900
                          "
                        >
                          Foto Selfie
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[11px]
                            leading-4
                            text-slate-500
                          "
                        >
                          JPG, PNG, atau WEBP · Maks. 10 MB
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        mt-4
                        flex
                        min-h-45
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-2xl
                        border
                        border-dashed
                        border-slate-200
                        bg-slate-50
                      "
                    >
                      {selfiePreview ? (
                        <img
                          src={selfiePreview}
                          alt="Preview selfie"
                          className="
                            h-45
                            w-full
                            object-cover
                          "
                        />
                      ) : (
                        <div className="px-5 py-8 text-center">
                          <Camera
                            className="
                              mx-auto
                              h-7
                              w-7
                              text-slate-400
                            "
                            strokeWidth={1.8}
                          />

                          <p
                            className="
                              mt-3
                              text-xs
                              font-bold
                              text-slate-700
                            "
                          >
                            Belum ada foto selfie
                          </p>

                          <p
                            className="
                              mt-1
                              text-[10px]
                              leading-4
                              text-slate-400
                            "
                          >
                            Hadapkan wajah ke kamera dengan
                            pencahayaan yang cukup.
                          </p>
                        </div>
                      )}
                    </div>

                    <input
                      id="selfie-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const file =
                          e.target.files?.[0];

                        if (!file) return;

                        handleSelfieChange(file);
                      }}
                    />

                    <label
                      htmlFor="selfie-upload"
                      className="
                        mt-4
                        flex
                        h-10
                        cursor-pointer
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        text-xs
                        font-bold
                        text-slate-700
                        transition
                        hover:border-violet-200
                        hover:bg-violet-50
                        hover:text-violet-700
                      "
                    >
                      <Camera
                        className="h-4 w-4"
                        strokeWidth={2}
                      />

                      {selfieFile
                        ? "Ganti Foto Selfie"
                        : "Pilih Foto Selfie"}
                    </label>

                    {selfieFile && (
                      <div
                        className="
                          mt-3
                          flex
                          items-center
                          gap-2
                          rounded-xl
                          bg-emerald-50
                          px-3
                          py-2.5
                        "
                      >
                        <CheckCircle2
                          className="
                            h-4
                            w-4
                            shrink-0
                            text-emerald-600
                          "
                          strokeWidth={2}
                        />

                        <p
                          className="
                            text-[10px]
                            font-bold
                            text-emerald-700
                          "
                        >
                          Foto selfie siap dikirim
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* QUALITY TIPS */}
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-slate-100
                    bg-slate-50
                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      font-black
                      text-slate-800
                    "
                  >
                    Agar proses pemeriksaan lebih lancar
                  </p>

                  <div
                    className="
                      mt-3
                      grid
                      gap-2
                      sm:grid-cols-2
                    "
                  >
                    {[
                      "Pastikan foto tidak buram atau gelap.",
                      "Seluruh informasi kartu identitas harus terlihat.",
                      "Wajah pada selfie terlihat jelas.",
                      "Hindari filter atau edit berlebihan.",
                    ].map((tip) => (
                      <div
                        key={tip}
                        className="
                          flex
                          items-start
                          gap-2
                          text-[11px]
                          leading-5
                          text-slate-500
                        "
                      >
                        <CheckCircle2
                          className="
                            mt-0.5
                            h-3.5
                            w-3.5
                            shrink-0
                            text-emerald-500
                          "
                          strokeWidth={2.2}
                        />

                        {tip}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SUBMIT */}
                <div
                  className="
                    mt-6
                    border-t
                    border-slate-100
                    pt-5
                  "
                >
                  <button
                    type="button"
                    onClick={
                      handleSubmitVerification
                    }
                    disabled={
                      uploading ||
                      !documentsReady
                    }
                    className="
                      flex
                      h-12
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-indigo-600
                      px-5
                      text-sm
                      font-bold
                      text-white
                      shadow-[0_8px_20px_rgba(79,70,229,0.2)]
                      transition
                      hover:bg-indigo-700
                      active:scale-[0.995]
                      disabled:cursor-not-allowed
                      disabled:bg-slate-200
                      disabled:text-slate-400
                      disabled:shadow-none
                    "
                  >
                    {uploading ? (
                      <>
                        <LoaderCircle
                          className="
                            h-4
                            w-4
                            animate-spin
                          "
                          strokeWidth={2}
                        />

                        Mengirim dokumen...
                      </>
                    ) : verificationStatus ===
                      "REJECTED" ? (
                      <>
                        <RefreshCw
                          className="h-4 w-4"
                          strokeWidth={2}
                        />

                        Kirim Ulang Verifikasi
                      </>
                    ) : (
                      <>
                        <ShieldCheck
                          className="h-4 w-4"
                          strokeWidth={2}
                        />

                        Kirim untuk Diverifikasi
                      </>
                    )}
                  </button>

                  {!documentsReady && (
                    <p
                      className="
                        mt-3
                        text-center
                        text-[10px]
                        leading-4
                        text-slate-400
                      "
                    >
                      Lengkapi foto kartu identitas dan selfie untuk
                      mengaktifkan tombol kirim.
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* TRUST SIDEBAR */}
          <aside
            className="
              space-y-4
              lg:sticky
              lg:top-6
            "
          >
            <section
              className="
                rounded-[28px]
                border
                border-indigo-100
                bg-white
                p-5
                shadow-[0_10px_28px_rgba(15,23,42,0.04)]
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <LockKeyhole
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </div>

              <h3
                className="
                  mt-4
                  text-sm
                  font-black
                  text-slate-900
                "
              >
                Dokumen Anda bersifat privat
              </h3>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Foto kartu identitas dan selfie tidak ditampilkan pada profil
                publik. Dokumen digunakan untuk proses pemeriksaan
                identitas akun.
              </p>

              <div
                className="
                  mt-4
                  space-y-3
                  border-t
                  border-slate-100
                  pt-4
                "
              >
                {[
                  "Dokumen tidak muncul di profil publik.",
                  "Akses dokumen verifikasi dibatasi.",
                  "Status verifikasi ditampilkan terpisah.",
                ].map((item) => (
                  <div
                    key={item}
                    className="
                      flex
                      items-start
                      gap-2
                    "
                  >
                    <ShieldCheck
                      className="
                        mt-0.5
                        h-4
                        w-4
                        shrink-0
                        text-indigo-500
                      "
                      strokeWidth={2}
                    />

                    <p
                      className="
                        text-[11px]
                        leading-5
                        text-slate-500
                      "
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section
              className="
                rounded-[28px]
                border
                border-slate-200
                bg-white
                p-5
                shadow-[0_10px_28px_rgba(15,23,42,0.035)]
              "
            >
              <p
                className="
                  text-xs
                  font-black
                  tracking-wide
                  text-slate-500
                  uppercase
                "
              >
                Proses Verifikasi
              </p>

              <div className="mt-4 space-y-4">
                {[
                  {
                    number: "01",
                    title: "Kirim dokumen",
                    text: "Unggah kartu identitas dan selfie yang jelas.",
                  },
                  {
                    number: "02",
                    title: "Pemeriksaan",
                    text: "Tim HelpMe meninjau dokumen Anda.",
                  },
                  {
                    number: "03",
                    title: "Badge aktif",
                    text: "Status verified aktif setelah disetujui.",
                  },
                ].map((step) => (
                  <div
                    key={step.number}
                    className="flex gap-3"
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-[10px]
                        font-black
                        text-slate-500
                      "
                    >
                      {step.number}
                    </div>

                    <div>
                      <p
                        className="
                          text-xs
                          font-black
                          text-slate-800
                        "
                      >
                        {step.title}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[10px]
                          leading-4
                          text-slate-400
                        "
                      >
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVBAR */}
      {showMobileNavbar && (
        <div className="lg:hidden">
          <MobileBottomNavbar />
        </div>
      )}
    </main>
  );
}