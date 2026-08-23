"use client";

import { useEffect, useState } from "react";

import imageCompression from "browser-image-compression";

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

  if (verificationStatus === null) {
    return (
      <main
        className="
                min-h-screen
                flex
                items-center
                justify-center
            "
      >
        <p>Memuat data...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1
          className="
            text-lg
            font-black
            text-slate-900
          "
        >
          Verifikasi Akun
        </h1>

        {verificationStatus === "UNVERIFIED" && (
          <>
            <div
              className="
                inline-flex
                rounded-full
                bg-slate-100
                px-4
                py-2
                text-sm
                font-bold
                text-slate-700
            "
            >
              ⭕ Belum Terverifikasi
            </div>

            <h2
              className="
                mt-4
                text-xl
                font-bold
                text-slate-900
            "
            >
              Verifikasi identitas Anda
            </h2>

            <p
              className="
                mt-2
                text-slate-500
            "
            >
              Upload KTP dan selfie untuk mendapatkan badge verified dan
              meningkatkan kepercayaan pengguna lain.
            </p>
          </>
        )}

        {verificationStatus === "PENDING" && (
          <div
            className="
            text-center
        "
          >
            <div
              className="
            mt-10
                mx-auto
                flex
                h-10
                w-10
                items-center
                justify-center
                text-4xl
            "
            >
              ⏳
            </div>

            <div
              className="
                mt-3
                inline-flex
                rounded-full
                bg-amber-100
                px-2
                py-2
                text-sm
                font-bold
                text-amber-500
            "
            >
              Menunggu Verifikasi
            </div>

            <h2
              className="
                mt-5
                text-lg
                font-black
                text-slate-900
            "
            >
              Dokumen sedang ditinjau
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-7
                text-slate-500
            "
            >
              Tim HelpMe sedang memeriksa dokumen Anda.
              <br />
              Estimasi proses 1–3 hari kerja.
            </p>
          </div>
        )}

        {verificationStatus === "VERIFIED" && (
          <>
            <div
              className="
                inline-flex
                rounded-full
                bg-emerald-100
                px-4
                py-2
                text-sm
                font-bold
                text-emerald-700
            "
            >
              ✔️ Akun Terverifikasi
            </div>

            <h2
              className="
                mt-4
                text-xl
                font-bold
                text-slate-900
            "
            >
              Selamat 🎉
            </h2>

            <p
              className="
                mt-2
                text-slate-500
            "
            >
              Badge verified sudah aktif. Akun Anda akan lebih dipercaya oleh
              pemilik task dan helper lain.
            </p>
          </>
        )}

        {verificationStatus === "REJECTED" && (
          <>
            <div
              className="
                inline-flex
                rounded-full
                bg-red-100
                px-4
                py-2
                text-sm
                font-bold
                text-red-700
            "
            >
              🚫 Verifikasi Ditolak
            </div>

            <h2
              className="
                mt-4
                text-xl
                font-bold
                text-slate-900
            "
            >
              Dokumen perlu diperbaiki
            </h2>

            <p
              className="
                mt-2
                text-slate-500
            "
            >
              Silakan upload ulang dokumen yang lebih jelas agar dapat
              diverifikasi.
            </p>
          </>
        )}

        {rejectionReason && (
          <div
            className="
            mt-4
            rounded-2xl
            bg-red-50
            border
            border-red-200
            p-4
        "
          >
            <p
              className="
                font-bold
                text-red-700
            "
            >
              Alasan Penolakan
            </p>

            <p
              className="
                mt-2
                text-sm
                text-red-600
            "
            >
              {rejectionReason}
            </p>
          </div>
        )}

        {/* UPLOAD DOCUMENTS */}

        {(verificationStatus === "UNVERIFIED" ||
          verificationStatus === "REJECTED") && (
          <div
            className="
    mt-6
    rounded-3xl
    bg-white
    p-6
    shadow-sm
  "
          >
            <h2
              className="
      text-lg
      font-bold
      text-slate-900
    "
            >
              Upload Dokumen
            </h2>

            {/* KTP */}

            <div className="mt-6">
              <p
                className="
        text-sm
        font-semibold
        text-slate-700
      "
              >
                Foto KTP
              </p>

              {ktpPreview && (
                <img
                  src={ktpPreview}
                  alt="KTP"
                  className="
          mt-3
          h-48
          w-full
          rounded-2xl
          object-cover
        "
                />
              )}

              <input
                type="file"
                accept="image/*"
                className="mt-3"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  handleKtpChange(file);
                }}
              />
            </div>

            {/* SELFIE */}

            <div className="mt-8">
              <p
                className="
        text-sm
        font-semibold
        text-slate-700
      "
              >
                Foto Selfie
              </p>

              {selfiePreview && (
                <img
                  src={selfiePreview}
                  alt="Selfie"
                  className="
          mt-3
          h-48
          w-full
          rounded-2xl
          object-cover
        "
                />
              )}

              <input
                type="file"
                accept="image/*"
                className="mt-3"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  handleSelfieChange(file);
                }}
              />
            </div>

            {/* SUBMIT BUTTON */}

            <button
              onClick={handleSubmitVerification}
              disabled={uploading}
              className="
                            mt-8
                            w-full
                            rounded-2xl
                            bg-indigo-600
                            py-4
                            text-sm
                            font-bold
                            text-white
                            transition
                            hover:bg-indigo-700
                            disabled:opacity-50
                        "
            >
              {uploading ? "Mengirim..." : "Kirim Verifikasi"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}