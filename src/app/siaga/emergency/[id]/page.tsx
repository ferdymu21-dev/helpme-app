"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Copy,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Navigation,
  PhoneCall,
  RefreshCw,
  ShieldAlert,
  Users,
  Ban
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

type EmergencyStatus =
  | "ACTIVE"
  | "RESOLVED"
  | "CANCELLED"
  | "EXPIRED"
  | "ADMIN_CLOSED";

type ParticipantStatus =
  | "WILL_HELP"
  | "EN_ROUTE"
  | "ARRIVED"
  | "COMPLETED"
  | "WITHDRAWN";

interface EmergencyParticipant {
  id: string;
  helper_id: string;
  status: ParticipantStatus;
  created_at: string;
  updated_at: string;
}

interface EmergencyParticipantProfile {
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  verification_status: string | null;
}

interface EmergencyHelpDetail {
  id: string;
  requester_id: string | null;
  category: string;
  title: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string;
  landmark: string | null;
  share_phone: boolean;
  contact_phone: string | null;
  status: EmergencyStatus;
  created_at: string;
  updated_at: string;
  expires_at: string;
  helper_count: number;
  participants: EmergencyParticipant[];
}

type ParticipantAction = "EN_ROUTE" | "ARRIVED" | "WITHDRAWN";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isEmergencyStatus(value: unknown): value is EmergencyStatus {
  return (
    value === "ACTIVE" ||
    value === "RESOLVED" ||
    value === "CANCELLED" ||
    value === "EXPIRED" ||
    value === "ADMIN_CLOSED"
  );
}

function isParticipantStatus(value: unknown): value is ParticipantStatus {
  return (
    value === "WILL_HELP" ||
    value === "EN_ROUTE" ||
    value === "ARRIVED" ||
    value === "COMPLETED" ||
    value === "WITHDRAWN"
  );
}

function parseParticipant(value: unknown): EmergencyParticipant | null {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isString(value.helper_id) ||
    !isParticipantStatus(value.status) ||
    !isString(value.created_at) ||
    !isString(value.updated_at)
  ) {
    return null;
  }

  return {
    id: value.id,
    helper_id: value.helper_id,
    status: value.status,
    created_at: value.created_at,
    updated_at: value.updated_at,
  };
}

function parseDetail(value: unknown): EmergencyHelpDetail | null {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !(value.requester_id === null || isString(value.requester_id)) ||
    !isString(value.category) ||
    !isString(value.title) ||
    !isString(value.description) ||
    !isNullableNumber(value.latitude) ||
    !isNullableNumber(value.longitude) ||
    !isString(value.location_name) ||
    !(value.landmark === null || isString(value.landmark)) ||
    typeof value.share_phone !== "boolean" ||
    !(value.contact_phone === null || isString(value.contact_phone)) ||
    !isEmergencyStatus(value.status) ||
    !isString(value.created_at) ||
    !isString(value.updated_at) ||
    !isString(value.expires_at)
  ) {
    return null;
  }

  const participants = Array.isArray(value.participants)
    ? value.participants
        .map(parseParticipant)
        .filter((item): item is EmergencyParticipant => item !== null)
    : [];

  const helperCount =
    typeof value.helper_count === "number" &&
    Number.isFinite(value.helper_count)
      ? value.helper_count
      : 0;

  return {
    id: value.id,
    requester_id: value.requester_id,
    category: value.category,
    title: value.title,
    description: value.description,
    latitude: value.latitude,
    longitude: value.longitude,
    location_name: value.location_name,
    landmark: value.landmark,
    share_phone: value.share_phone,
    contact_phone: value.contact_phone,
    status: value.status,
    created_at: value.created_at,
    updated_at: value.updated_at,
    expires_at: value.expires_at,
    helper_count: helperCount,
    participants,
  };
}

function categoryLabel(category: string): string {
  switch (category) {
    case "MEDICAL":
      return "Medis";
    case "ACCIDENT":
      return "Kecelakaan";
    case "SECURITY":
      return "Keamanan";
    default:
      return "Bantuan lainnya";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "Membutuhkan bantuan";
    case "RESOLVED":
      return "Selesai";
    case "CANCELLED":
      return "Dibatalkan";
    case "EXPIRED":
      return "Kedaluwarsa";
    case "ADMIN_CLOSED":
      return "Ditutup oleh admin";
    case "WILL_HELP":
      return "Siap membantu";
    case "EN_ROUTE":
      return "Dalam perjalanan";
    case "ARRIVED":
      return "Sudah tiba";
    case "WITHDRAWN":
      return "Mengundurkan diri";
    default:
      return status;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function formatRelativeTime(value: string, now: number): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  if (now <= 0) {
    return formatDate(value);
  }

  const elapsedMinutes = Math.max(
    0,
    Math.floor((now - date.getTime()) / 60_000),
  );

  if (elapsedMinutes < 1) return "Baru saja";
  if (elapsedMinutes < 60) return `${elapsedMinutes} menit lalu`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} jam lalu`;

  return `${Math.floor(elapsedHours / 24)} hari lalu`;
}

function formatTimeRemaining(value: string, now: number): string {
  const expiry = new Date(value);

  if (Number.isNaN(expiry.getTime())) {
    return "-";
  }

  if (now <= 0) {
    return formatDate(value);
  }

  const remainingMs = expiry.getTime() - now;

  if (remainingMs <= 0) {
    return "Waktu terlewati";
  }

  const remainingMinutes = Math.ceil(remainingMs / 60_000);

  if (remainingMinutes < 60) {
    return `${remainingMinutes} menit lagi`;
  }

  const remainingHours = Math.floor(remainingMinutes / 60);

  if (remainingHours < 24) {
    const remainingMinutesAfterHours = remainingMinutes % 60;

    return remainingMinutesAfterHours > 0
      ? `${remainingHours} jam ${remainingMinutesAfterHours} menit`
      : `${remainingHours} jam lagi`;
  }

  return `${Math.ceil(remainingHours / 24)} hari lagi`;
}
export default function EmergencyHelpDetailPage() {
  const params = useParams<{ id: string }>();
  const requestId = params.id;

  const [userId, setUserId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EmergencyHelpDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [addressCopied, setAddressCopied] = useState(false);
  const [participantProfiles, setParticipantProfiles] = useState<
    Record<string, EmergencyParticipantProfile>
  >({});

  useEffect(() => {
    const initialUpdateId = window.setTimeout(() => {
      setCurrentTime(Date.now());
    }, 0);

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 60_000);

    return () => {
      window.clearTimeout(initialUpdateId);
      window.clearInterval(intervalId);
    };
  }, []);

  const loadDetail = useCallback(async () => {

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      setLoadError(null);

      if (authError || !authData.user) {
        setUserId(null);
        setDetail(null);
        return;
      }

      setUserId(authData.user.id);

      const { data, error } = await supabase.rpc(
        "get_emergency_help_detail",
        { p_request_id: requestId },
      );

      if (error) {
        setDetail(null);
        setLoadError(
          "Detail belum dapat dimuat. Permintaan mungkin tidak tersedia atau fitur database belum diaktifkan.",
        );
        return;
      }

      const parsed = parseDetail(data);

      if (!parsed) {
        setDetail(null);
        setLoadError("Data permintaan tidak sesuai format yang diharapkan.");
        return;
      }

      setDetail(parsed);
    } catch {
      setLoadError("Terjadi kendala saat memuat permintaan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialDetail() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (cancelled) return;

        setLoadError(null);

        if (authError || !authData.user) {
          setUserId(null);
          setDetail(null);
          return;
        }

        setUserId(authData.user.id);

        const { data, error } = await supabase.rpc(
          "get_emergency_help_detail",
          { p_request_id: requestId },
        );

        if (cancelled) return;

        if (error) {
          setDetail(null);
          setLoadError(
            "Detail belum dapat dimuat. Permintaan mungkin tidak tersedia atau fitur database belum diaktifkan.",
          );
          return;
        }

        const parsed = parseDetail(data);

        if (!parsed) {
          setDetail(null);
          setLoadError(
            "Data permintaan tidak sesuai format yang diharapkan.",
          );
          return;
        }

        setDetail(parsed);
      } catch {
        if (!cancelled) {
          setDetail(null);
          setLoadError(
            "Terjadi kendala saat memuat permintaan. Coba lagi.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchInitialDetail();

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  useEffect(() => {
    let cancelled = false;

    const helperIds = [
      ...new Set(
        (detail?.participants ?? []).map(
          (participant) => participant.helper_id,
        ),
      ),
    ];

    if (helperIds.length === 0) return;


    async function loadParticipantProfiles() {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, full_name, username, avatar_url, verification_status")
          .in("id", helperIds);

        if (cancelled) return;

        if (error) {
          console.warn("Gagal memuat profil penolong:", error.message);
          setParticipantProfiles({});
          return;
        }

        const nextProfiles: Record<
          string,
          EmergencyParticipantProfile
        > = {};

        for (const profile of data ?? []) {
          if (typeof profile.id !== "string") continue;

          nextProfiles[profile.id] = {
            full_name:
              typeof profile.full_name === "string"
                ? profile.full_name
                : null,
            username:
              typeof profile.username === "string"
                ? profile.username
                : null,
            avatar_url:
              typeof profile.avatar_url === "string"
                ? profile.avatar_url
                : null,
            verification_status:
              typeof profile.verification_status === "string"
                ? profile.verification_status
                : null,
          };
        }

        setParticipantProfiles(nextProfiles);
      } catch (error) {
        if (cancelled) return;

        console.warn("Gagal memuat profil penolong:", error);
        setParticipantProfiles({});
      }
    }

    void loadParticipantProfiles();

    return () => {
      cancelled = true;
    };
  }, [detail?.participants]);
  const ownParticipant = detail?.participants.find(
    (participant) => participant.helper_id === userId,
  );

  const isOwner =
    userId !== null &&
    detail !== null &&
    detail.requester_id === userId;

  const isActive = detail?.status === "ACTIVE";

  const canJoin =
    detail !== null &&
    userId !== null &&
    !isOwner &&
    !ownParticipant &&
    isActive;

  async function joinRequest() {
    if (!requestId || !canJoin || busy) return;

    setBusy(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const { data, error } = await supabase.rpc(
        "join_emergency_help_request",
        { p_request_id: requestId },
      );

      if (error) {
        setActionError(
          "Belum dapat bergabung. Permintaan mungkin sudah tidak aktif.",
        );
        return;
      }

      if (data === null) {
        setActionMessage(
          "Permintaan sudah tidak aktif. Muat ulang untuk melihat status terbaru.",
        );
      } else {
        setActionMessage("Kamu sudah terdaftar sebagai penolong.");
      }

      await loadDetail();
    } catch {
      setActionError("Terjadi kendala saat bergabung. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function updateParticipantStatus(nextStatus: ParticipantAction) {
    if (!ownParticipant || busy) return;

    setBusy(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const { error } = await supabase.rpc(
        "set_emergency_help_participant_status",
        {
          p_participant_id: ownParticipant.id,
          p_new_status: nextStatus,
        },
      );

      if (error) {
        setActionError(
          "Status belum berhasil diperbarui. Coba muat ulang halaman.",
        );
        return;
      }

      setActionMessage("Status bantuan berhasil diperbarui.");
      await loadDetail();
    } catch {
      setActionError("Terjadi kendala saat memperbarui status.");
    } finally {
      setBusy(false);
    }
  }

  async function extendRequest() {
    if (!detail || !isOwner || busy) return;

    setBusy(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const { error } = await supabase.rpc(
        "extend_emergency_help_request",
        { p_request_id: requestId },
      );

      if (error) {
        setActionError(
          "Perpanjangan belum berhasil. Pastikan permintaan masih aktif.",
        );
        return;
      }

      setActionMessage("Masa aktif permintaan berhasil diperpanjang.");
      await loadDetail();
    } catch {
      setActionError("Terjadi kendala saat memperpanjang permintaan.");
    } finally {
      setBusy(false);
    }
  }

  async function closeRequest(targetStatus: "RESOLVED" | "CANCELLED") {
    if (!detail || !isOwner || !isActive || busy) return;

    const confirmationMessage =
      targetStatus === "RESOLVED"
        ? "Pastikan bantuan benar-benar selesai. Permintaan dan grup koordinasi akan ditutup. Lanjutkan?"
        : "Batalkan permintaan bantuan ini? Permintaan dan grup koordinasi akan ditutup.";

    if (!window.confirm(confirmationMessage)) return;

    setBusy(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const { data, error } = await supabase.rpc(
        "close_emergency_help_request",
        {
          p_request_id: requestId,
          p_target_status: targetStatus,
        },
      );

      if (error) {
        setActionError(
          targetStatus === "RESOLVED"
            ? "Bantuan belum berhasil ditandai selesai. Pastikan permintaan masih aktif."
            : "Permintaan belum berhasil dibatalkan. Pastikan permintaan masih aktif.",
        );
        return;
      }

      if (data !== targetStatus) {
        setActionError("Server belum mengonfirmasi perubahan status permintaan.");
        return;
      }

      setActionMessage(
        targetStatus === "RESOLVED"
          ? "Bantuan berhasil ditandai selesai."
          : "Permintaan bantuan berhasil dibatalkan.",
      );
      await loadDetail();
    } catch {
      setActionError("Terjadi kendala saat menutup permintaan. Coba muat ulang.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-rose-50 px-4">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Memuat detail bantuan...
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-rose-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <ShieldAlert className="h-10 w-10 text-rose-600" />
          <h1 className="mt-4 text-2xl font-black text-slate-900">
            Bantuan warga sekitar
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Masuk ke HelpMe untuk melihat detail permintaan dan mendaftar
            sebagai penolong. Untuk keadaan yang mengancam nyawa, hubungi
            layanan darurat resmi.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-rose-600 px-5 text-sm font-bold text-white hover:bg-rose-700"
          >
            Masuk ke HelpMe
          </Link>
          <div className="mt-4">
            <Link href="/siaga" className="text-sm font-semibold text-slate-600 hover:text-rose-700">
              Kembali ke HelpMe Siaga
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!detail) {
    return (
      <main className="min-h-screen bg-rose-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <ShieldAlert className="h-10 w-10 text-rose-600" />
          <h1 className="mt-4 text-xl font-black text-slate-900">
            Detail bantuan belum tersedia
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {loadError ?? "Permintaan tidak ditemukan."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadDetail()}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Coba lagi
            </button>
            <Link
              href="/siaga"
              className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
            >
              Kembali ke Siaga
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const hasExactLocation =
    detail.latitude !== null && detail.longitude !== null;

  const locationAddress = [detail.location_name, detail.landmark]
    .filter(Boolean)
    .join(", ");

  const activeMapUrl = hasExactLocation
    ? `https://www.google.com/maps/dir/?api=1&destination=${detail.latitude},${detail.longitude}`
    : null;

  return (
    <main className="min-h-screen bg-linear-to-br from-rose-50 via-white to-slate-50 px-3 py-4 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/siaga"
            className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-rose-700"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Kembali
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3.5 py-2 text-sm font-bold text-rose-700">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            HelpMe Siaga
          </span>
        </header>

        <article className="overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-[0_16px_48px_rgba(225,29,72,0.10)]">
          <section className="relative overflow-hidden bg-linear-to-br from-rose-600 via-rose-600 to-red-700 px-5 py-6 text-white sm:px-7 sm:py-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"
            />

            <div className="relative">
              <div className="flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] text-rose-50 sm:text-sm">
                <ShieldAlert className="h-3 w-3 shrink-0" aria-hidden="true" />
                BANTUAN DARURAT
                <span className="inline-flex items-center gap-1 rounded-full bg-red-200 px-1.5 py-1 text-[10px] font-bold text-red-600">
                  <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                  {categoryLabel(detail.category)}
                </span>
              </div>

              <h1 className="mt-4 wrap-break-word text-[16px] font-black leading-[1.12] tracking-tight sm:text-4xl">
                {detail.title}
              </h1>

              <p className="mt-5 whitespace-pre-wrap text-[13px] leading-4 text-rose-50 sm:text-base sm:leading-7">
                {detail.description}
              </p>
            </div>
          </section>

          <div className="space-y-2 p-2.5 sm:p-5">
            <section
              aria-label="Ringkasan permintaan"
              className="grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-white px-1 py-2 shadow-sm sm:py-5"
            >
              <div className="flex min-w-0 flex-col items-center px-1.5 text-center">
                <Clock3
                  className="h-3.5 w-3.5 text-slate-500 sm:h-7 sm:w-7"
                  aria-hidden="true"
                />
                <p className="mt-1 text-[11px] font-semibold leading-3 text-slate-900 sm:text-sm">
                  {formatRelativeTime(detail.created_at, currentTime)}
                </p>
                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                  Dibuat
                </p>
              </div>

              <div className="flex min-w-0 flex-col items-center px-1.5 text-center">
                <Users
                  className="h-3.5 w-3.5 text-slate-500 sm:h-7 sm:w-7"
                  aria-hidden="true"
                />
                <p className="mt-1 text-[11px] font-semibold leading-3 text-slate-900 sm:text-sm">
                  {detail.helper_count} penolong
                </p>
                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                  Aktif
                </p>
              </div>

              <div className="flex min-w-0 flex-col items-center px-1.5 text-center">
                <CalendarClock
                  className="h-3.5 w-3.5 text-indigo-600 sm:h-7 sm:w-7"
                  aria-hidden="true"
                />
                <p className="mt-1 text-[11px] font-semibold leading-3 text-slate-900 sm:text-sm">
                  {formatTimeRemaining(detail.expires_at, currentTime)}
                </p>
                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                  Batas waktu
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-[15px] font-bold text-slate-900 sm:text-lg">
                      Lokasi kejadian
                      {hasExactLocation && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!navigator.clipboard?.writeText) {
                              setActionError(
                                "Fitur salin alamat tidak tersedia di browser ini.",
                              );
                              return;
                            }

                            void navigator.clipboard
                              .writeText(locationAddress)
                              .then(() => {
                                setAddressCopied(true);
                                setActionError(null);
                                setActionMessage(
                                  "Alamat lokasi berhasil disalin.",
                                );
                              })
                              .catch(() => {
                                setActionError(
                                  "Alamat belum dapat disalin. Silakan salin secara manual.",
                                );
                              });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-indigo-600 transition hover:bg-indigo-50 sm:text-sm"
                        >
                          <Copy className="h-2 w-2" aria-hidden="true" />
                          {addressCopied ? "Alamat disalin" : "Salin alamat"}
                        </button>
                      )}
                    </h2>
                  </div>

                  <p className="mt-1 text-[12px] leading-4 text-slate-600 sm:text-base">
                    {detail.location_name}
                  </p>

                  {detail.landmark && (
                    <p className="mt-1 text-[12px] leading-4 text-slate-500">
                      Patokan: {detail.landmark}
                    </p>
                  )}

                  {!hasExactLocation && (
                    <p className="mt-2 rounded-xl bg-slate-50 p-3 text-[11px] leading-4 text-slate-600">
                      Lokasi presisi hanya tersedia bagi pemohon dan penolong
                      yang telah bergabung serta memiliki akses.
                    </p>
                  )}
                </div>
              </div>

              {hasExactLocation && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  <iframe
                    title={`Peta lokasi bantuan: ${detail.location_name}`}
                    src={`https://maps.google.com/maps?q=${detail.latitude},${detail.longitude}&z=15&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-48 w-full border-0 sm:h-60"
                  />
                </div>
              )}

              {!isOwner && activeMapUrl && (
                <a
                  href={activeMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 sm:text-base"
                >
                  <Navigation className="h-5 w-5" aria-hidden="true" />
                  Buka petunjuk arah
                </a>
              )}
            </section>

            {!isOwner && detail.share_phone && detail.contact_phone && (
              <section className="rounded-3xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-white p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <PhoneCall className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-[15px] font-bold text-slate-900 sm:text-lg">
                      Nomor kontak yang dibagikan
                    </h2>
                    <p className="mt-1 text-[12px] leading-4 text-slate-600">
                      Hubungi untuk koordinasi langsung terkait bantuan ini.
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-100/70 p-2">
                  <p className="min-w-0 flex-1 break-all px-2 py-1 text-[13px] font-extrabold tracking-wide text-emerald-800">
                    {detail.contact_phone}
                  </p>
                  <a
                    href={`tel:${detail.contact_phone}`}
                    className="inline-flex min-h-8 shrink-0 items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700"
                  >
                    <PhoneCall className="h-4 w-4" aria-hidden="true" />
                    Hubungi
                  </a>
                </div>
              </section>
            )}

            {(canJoin ||
              (ownParticipant !== undefined &&
                ownParticipant.status !== "WITHDRAWN") ||
              (isOwner && isActive) ||
              (isOwner && detail.participants.length > 0)) && (
              <section className="space-y-2 rounded-3xl border border-rose-100 bg-linear-to-br from-rose-50 to-white p-4 sm:p-5">
                <h2 className="text-[15px] font-bold text-slate-900 sm:text-lg">
                  {ownParticipant ? "Status bantuan kamu" : isOwner ? "" : ""}
                </h2>

                {ownParticipant && ownParticipant.status !== "WITHDRAWN" && (
                  <>
                    <p className="text-[13px] text-slate-600">
                      Status saat ini:{" "}
                      <span className="font-bold text-slate-900">
                        {statusLabel(ownParticipant.status)}
                      </span>
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {ownParticipant.status === "WILL_HELP" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void updateParticipantStatus("EN_ROUTE")
                          }
                          className="min-h-10 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                        >
                          Dalam perjalanan
                        </button>
                      )}

                      {ownParticipant.status === "EN_ROUTE" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void updateParticipantStatus("ARRIVED")
                          }
                          className="min-h-10 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                        >
                          Saya sudah tiba
                        </button>
                      )}

                      {(ownParticipant.status === "WILL_HELP" ||
                        ownParticipant.status === "EN_ROUTE" ||
                        ownParticipant.status === "ARRIVED") && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void updateParticipantStatus("WITHDRAWN")
                            }
                            className="min-h-10 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                          >
                            Mengundurkan diri
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}

                {canJoin && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void joinRequest()}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? (
                      <LoaderCircle
                        className="h-5 w-5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    )}
                    Saya Siap Membantu
                  </button>
                )}

                {isOwner && detail.participants.length > 0 && (
                  <div className="space-y-2 border-t border-rose-100 pt-3">
                    <h3 className="text-sm font-bold text-slate-800">
                      Penolong yang bergabung
                    </h3>

                    {detail.participants.map((participant) => {
                      const participantProfile =
                        participantProfiles[participant.helper_id];

                      const participantName =
                        participantProfile?.full_name?.trim() ||
                        (participantProfile?.username
                          ? `@${participantProfile.username}`
                          : "Penolong HelpMe");

                      const initialsSource =
                        participantProfile?.full_name?.trim() ||
                        participantProfile?.username?.trim() ||
                        "P";

                      const initials =
                        initialsSource
                          .split(/\s+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part.charAt(0))
                          .join("")
                          .toUpperCase() || "P";

                      return (
                        <Link
                          key={participant.id}
                          href={`/users/${encodeURIComponent(participant.helper_id)}`}
                          aria-label={`Lihat profil ${participantName}`}
                          className="group flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 transition hover:border-indigo-200 hover:bg-indigo-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-indigo-50 text-sm font-bold text-indigo-700">
                            {participantProfile?.avatar_url ? (
                              <Image
                                src={participantProfile.avatar_url}
                                alt=""
                                width={44}
                                height={44}
                                unoptimized
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>{initials}</span>
                            )}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-1">
                              <span className="truncate text-[12px] font-bold text-slate-800">
                                {participantName}
                              </span>

                              {participantProfile?.verification_status ===
                              "VERIFIED" ? (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-1 py-0.5 text-[8px] font-bold text-emerald-700">
                                  <CheckCircle2
                                    className="h-3 w-3"
                                    aria-hidden="true"
                                  />
                                  Terverifikasi
                                </span>
                              ) : (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-1 py-0.5 text-[8px] font-medium text-slate-600">
                                  Belum Terverifikasi
                                </span>
                              )}
                            </span>
                          </span>

                          <span className="flex shrink-0 flex-col items-end gap-1">
                            <span className="rounded-full bg-slate-100 px-1.5 py-1 text-[9.5px] font-bold text-slate-700 sm:text-xs">
                              {statusLabel(participant.status)}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {actionMessage && (
              <p
                role="status"
                className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
              >
                {actionMessage}
              </p>
            )}

            {actionError && (
              <p
                role="alert"
                className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm font-medium text-rose-800"
              >
                {actionError}
              </p>
            )}

            {loadError && (
              <p
                role="alert"
                className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm font-medium text-amber-800"
              >
                {loadError}
              </p>
            )}

            <section className="flex items-start gap-2 rounded-[22px] border border-rose-200 bg-rose-50 p-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-600 text-white">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-[13px] font-semibold text-rose-700 sm:text-base">
                  Untuk kondisi darurat tertentu
                </h2>
                <p className="mt-1 text-[12px] leading-4 text-slate-600">
                  Segera hubungi layanan resmi:{" "}
                  <a
                    className="font-bold text-rose-700 underline"
                    href="tel:112"
                  >
                    112
                  </a>{" "}
                  (darurat umum),{" "}
                  <a
                    className="font-bold text-rose-700 underline"
                    href="tel:119"
                  >
                    119
                  </a>{" "}
                  (medis), atau{" "}
                  <a
                    className="font-bold text-rose-700 underline"
                    href="tel:110"
                  >
                    110
                  </a>{" "}
                  (polisi).
                </p>
                <p className="mt-1 text-xs leading-4 text-slate-500">
                  HelpMe Siaga melengkapi, bukan menggantikan, layanan darurat
                  resmi.
                </p>
              </div>
            </section>

            {isActive &&
              (isOwner ||
                (ownParticipant !== undefined &&
                  ownParticipant.status !== "WITHDRAWN")) && (
                <Link
                  href={`/siaga/emergency/${requestId}/chat`}
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-[22px] bg-green-500 px-5 py-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 sm:text-base"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  {isOwner ? "Buka Pesan" : "Kirim Pesan"}
                </Link>
              )}

            {isOwner && isActive && (
              <section
                aria-label="Konfirmasi permintaan bantuan"
                className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 sm:p-4"
              >
                <div>
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    Konfirmasi bantuan
                  </h2>
                </div>

                <div className="flex flex-row gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void closeRequest("RESOLVED")}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? (
                      <LoaderCircle
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    )}
                    Selesai
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void closeRequest("CANCELLED")}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? (
                      <LoaderCircle
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Ban className="h-4 w-4" aria-hidden="true" />
                    )}
                    Batalkan
                  </button>
                </div>
              </section>
            )}
            {isOwner && isActive && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void extendRequest()}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Perpanjang 3 jam
              </button>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={() => void loadDetail()}
              className="mx-auto flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold text-slate-500 transition hover:bg-white hover:text-rose-700 disabled:opacity-60"
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              Muat ulang informasi
            </button>
          </div>
        </article>
      </div>
    </main>
  );
}