"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import {
  BadgeCheck,
  CalendarClock,
  Camera,
  CheckCircle2,
  Clock3,
  FileText,
  Inbox,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";

interface VerificationRequest {
  id: string;

  user_id: string;

  ktp_url: string;

  selfie_url: string;

  status: string;

  rejection_reason?: string;

  created_at: string;

  users?: {
    full_name: string;

    avatar_url: string | null;
  };
}

export default function VerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);

  const [ktpImageUrl, setKtpImageUrl] = useState("");

  const [selfieImageUrl, setSelfieImageUrl] = useState("");

  const [rejectionReason, setRejectionReason] = useState("");

  const [processing, setProcessing] = useState(false);

  const [search, setSearch] = useState("");

  function closeModal() {
    setSelectedRequest(null);

    setKtpImageUrl("");

    setSelfieImageUrl("");

    setRejectionReason("");
  }

  async function fetchPendingRequests(): Promise<VerificationRequest[]> {
    const { data = [], error } = await supabase
      .from("verification_requests")
      .select(
        `
        *,
        users (
          full_name,
          avatar_url
        )
      `,
      )
      .eq("status", "PENDING")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return data as VerificationRequest[];
  }

  async function loadRequests() {
    try {
      setLoading(true);

      const data = await fetchPendingRequests();

      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function approveVerification(request: VerificationRequest) {
    try {
      setProcessing(true);

      const { error: requestError } = await supabase
        .from("verification_requests")
        .update({
          status: "APPROVED",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (requestError) {
        console.error(requestError);

        return;
      }

      const { error: userError } = await supabase
        .from("users")
        .update({
          verification_status: "VERIFIED",
        })
        .eq("id", request.user_id);

      if (userError) {
        alert(userError.message);

        console.error(userError);

        return;
      }

      alert("User berhasil diverifikasi");

      await supabase.from("notifications").insert({
        user_id: request.user_id,

        title: "Verifikasi Disetujui",

        message: "Selamat! Akun Anda berhasil diverifikasi.",

        type: "VERIFICATION_APPROVED",
      });

      await loadRequests();

      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  }

  async function rejectVerification(request: VerificationRequest) {
    try {
      setProcessing(true);

      const { error: requestError } = await supabase
        .from("verification_requests")
        .update({
          status: "REJECTED",
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (requestError) {
        console.error(requestError);

        return;
      }

      const { error: userError } = await supabase
        .from("users")
        .update({
          verification_status: "REJECTED",
        })
        .eq("id", request.user_id);

      if (userError) {
        console.error(userError);

        return;
      }

      alert("Verifikasi ditolak");

      await supabase.from("notifications").insert({
        user_id: request.user_id,

        title: "Verifikasi Ditolak",

        message: rejectionReason,

        type: "VERIFICATION_REJECTED",
      });

      await loadRequests();

      closeModal();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const loadInitialRequests = async () => {
      try {
        const data = await fetchPendingRequests();

        if (cancelled) {
          return;
        }

        setRequests(data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadInitialRequests();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedSearch =
  search
    .trim()
    .toLowerCase();

const filteredRequests =
  requests.filter((request) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      request.users?.full_name
        ?.toLowerCase()
        .includes(
          normalizedSearch,
        ) ||
      request.user_id
        .toLowerCase()
        .includes(
          normalizedSearch,
        )
    );
  });

    return (
    <main
      className="
        min-h-screen
        bg-slate-50/70
        p-4
        sm:p-6
        lg:p-8
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
        "
      >
        {/* PAGE HEADER */}
        <header
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="max-w-3xl">
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-indigo-100
                bg-white
                px-3.5
                py-2
                text-xs
                font-bold
                text-indigo-700
                shadow-sm
              "
            >
              <ShieldCheck
                className="h-4 w-4"
                strokeWidth={2}
              />

              Trust & Safety
            </div>

            <h1
              className="
                mt-4
                text-3xl
                font-black
                tracking-[-0.03em]
                text-slate-950
                sm:text-4xl
              "
            >
              Verifikasi Identitas
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-slate-500
              "
            >
              Tinjau dokumen identitas pengguna secara
              cermat sebelum menentukan hasil verifikasi.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadRequests();
            }}
            disabled={loading}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              font-bold
              text-slate-700
              shadow-sm
              transition
              hover:border-indigo-200
              hover:text-indigo-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              className={`
                h-4
                w-4

                ${
                  loading
                    ? "animate-spin"
                    : ""
                }
              `}
              strokeWidth={2}
            />

            Muat Ulang
          </button>
        </header>

        {/* SUMMARY */}
        <section
          className="
            mt-7
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          <div
            className="
              rounded-[26px]
              border
              border-amber-100
              bg-white
              p-5
              shadow-[0_8px_24px_rgba(15,23,42,0.035)]
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-amber-50
                  text-amber-600
                "
              >
                <Clock3
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    text-slate-500
                  "
                >
                  Menunggu Ditinjau
                </p>

                <p
                  className="
                    mt-0.5
                    text-2xl
                    font-black
                    text-slate-900
                  "
                >
                  {requests.length}
                </p>
              </div>
            </div>
          </div>

          <div
            className="
              rounded-[26px]
              border
              border-indigo-100
              bg-white
              p-5
              shadow-[0_8px_24px_rgba(15,23,42,0.035)]
            "
          >
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <BadgeCheck
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    text-slate-500
                  "
                >
                  Pemeriksaan
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    font-black
                    text-slate-900
                  "
                >
                  KTP + Selfie
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* QUEUE */}
        <section
          className="
            mt-6
            overflow-hidden
            rounded-[28px]
            border
            border-slate-200
            bg-white
            shadow-[0_10px_30px_rgba(15,23,42,0.04)]
          "
        >
          {/* TOOLBAR */}
          <div
            className="
              border-b
              border-slate-100
              p-4
              sm:p-5
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                md:flex-row
                md:items-center
                md:justify-between
              "
            >
              <div>
                <h2
                  className="
                    text-base
                    font-black
                    text-slate-900
                  "
                >
                  Antrean Verifikasi
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  {filteredRequests.length} permintaan
                  menunggu pemeriksaan.
                </p>
              </div>

              <div
                className="
                  relative
                  w-full
                  md:max-w-sm
                "
              >
                <Search
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                  strokeWidth={2}
                />

                <input
                  type="search"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value,
                    )
                  }
                  placeholder="Cari nama atau User ID..."
                  className="
                    h-11
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-10
                    pr-4
                    text-sm
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-indigo-300
                    focus:bg-white
                    focus:ring-4
                    focus:ring-indigo-50
                  "
                />
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div
              className="
                flex
                min-h-60
                items-center
                justify-center
                p-8
              "
            >
              <div className="text-center">
                <LoaderCircle
                  className="
                    mx-auto
                    h-7
                    w-7
                    animate-spin
                    text-indigo-600
                  "
                  strokeWidth={2}
                />

                <p
                  className="
                    mt-3
                    text-sm
                    font-bold
                    text-slate-700
                  "
                >
                  Memuat antrean verifikasi
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  Menyiapkan data pengguna yang perlu ditinjau.
                </p>
              </div>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            requests.length === 0 && (
              <div
                className="
                  flex
                  min-h-64
                  items-center
                  justify-center
                  px-6
                  py-12
                  text-center
                "
              >
                <div>
                  <div
                    className="
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-emerald-50
                      text-emerald-600
                    "
                  >
                    <CheckCircle2
                      className="h-7 w-7"
                      strokeWidth={2}
                    />
                  </div>

                  <h3
                    className="
                      mt-4
                      text-base
                      font-black
                      text-slate-900
                    "
                  >
                    Antrean sudah kosong
                  </h3>

                  <p
                    className="
                      mx-auto
                      mt-1
                      max-w-sm
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    Tidak ada permintaan verifikasi yang
                    menunggu pemeriksaan saat ini.
                  </p>
                </div>
              </div>
            )}

          {/* SEARCH EMPTY */}
          {!loading &&
            requests.length > 0 &&
            filteredRequests.length === 0 && (
              <div
                className="
                  flex
                  min-h-60
                  items-center
                  justify-center
                  px-6
                  py-12
                  text-center
                "
              >
                <div>
                  <Inbox
                    className="
                      mx-auto
                      h-8
                      w-8
                      text-slate-300
                    "
                    strokeWidth={1.8}
                  />

                  <h3
                    className="
                      mt-3
                      text-sm
                      font-black
                      text-slate-800
                    "
                  >
                    Permintaan tidak ditemukan
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Coba gunakan nama atau User ID lain.
                  </p>
                </div>
              </div>
            )}

          {/* REQUEST LIST */}
          {!loading &&
            filteredRequests.length > 0 && (
              <div
                className="
                  divide-y
                  divide-slate-100
                "
              >
                {filteredRequests.map(
                  (request) => (
                    <article
                      key={request.id}
                      className="
                        p-4
                        transition
                        hover:bg-slate-50/70
                        sm:p-5
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-4
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                      >
                        <div
                          className="
                            flex
                            min-w-0
                            items-center
                            gap-4
                          "
                        >
                          <div
                            className="
                              flex
                              h-12
                              w-12
                              shrink-0
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-2xl
                              border
                              border-slate-200
                              bg-slate-100
                              text-sm
                              font-black
                              text-slate-600
                            "
                          >
                            {request.users?.avatar_url ? (
                              <img
                                src={
                                  request
                                    .users
                                    .avatar_url
                                }
                                alt={`Foto ${request.users?.full_name || "pengguna"}`}
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                "
                              />
                            ) : (
                              request.users?.full_name
                                ?.charAt(0)
                                .toUpperCase() ||
                              "U"
                            )}
                          </div>

                          <div className="min-w-0">
                            <div
                              className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                              "
                            >
                              <p
                                className="
                                  truncate
                                  text-sm
                                  font-black
                                  text-slate-900
                                "
                              >
                                {request.users
                                  ?.full_name ||
                                  "Pengguna HelpMe"}
                              </p>

                              <span
                                className="
                                  inline-flex
                                  items-center
                                  gap-1
                                  rounded-full
                                  bg-amber-50
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-bold
                                  text-amber-700
                                "
                              >
                                <Clock3
                                  className="h-3 w-3"
                                  strokeWidth={2}
                                />

                                Pending
                              </span>
                            </div>

                            <div
                              className="
                                mt-1.5
                                flex
                                flex-wrap
                                items-center
                                gap-x-4
                                gap-y-1
                                text-[11px]
                                text-slate-400
                              "
                            >
                              <span
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                "
                              >
                                <CalendarClock
                                  className="h-3.5 w-3.5"
                                  strokeWidth={2}
                                />

                                {new Date(
                                  request.created_at,
                                ).toLocaleString(
                                  "id-ID",
                                  {
                                    dateStyle:
                                      "medium",
                                    timeStyle:
                                      "short",
                                  },
                                )}
                              </span>

                              <span
                                className="
                                  max-w-52
                                  truncate
                                  font-mono
                                "
                              >
                                ID: {request.user_id}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            const {
                              data: ktpSigned,
                              error: ktpError,
                            } =
                              await supabase.storage
                                .from(
                                  "verifications",
                                )
                                .createSignedUrl(
                                  request.ktp_url,
                                  3600,
                                );

                            const {
                              data:
                                selfieSigned,
                              error:
                                selfieError,
                            } =
                              await supabase.storage
                                .from(
                                  "verifications",
                                )
                                .createSignedUrl(
                                  request.selfie_url,
                                  3600,
                                );

                            if (ktpError) {
                              console.error(
                                ktpError,
                              );

                              return;
                            }

                            if (selfieError) {
                              console.error(
                                selfieError,
                              );

                              return;
                            }

                            setKtpImageUrl(
                              ktpSigned.signedUrl,
                            );

                            setSelfieImageUrl(
                              selfieSigned.signedUrl,
                            );

                            setRejectionReason(
                              "",
                            );

                            setSelectedRequest(
                              request,
                            );
                          }}
                          className="
                            inline-flex
                            h-10
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-indigo-600
                            px-4
                            text-xs
                            font-bold
                            text-white
                            shadow-[0_6px_18px_rgba(79,70,229,0.16)]
                            transition
                            hover:bg-indigo-700
                            active:scale-[0.98]
                          "
                        >
                          <FileText
                            className="h-4 w-4"
                            strokeWidth={2}
                          />

                          Tinjau Dokumen
                        </button>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
        </section>
      </div>

      {/* REVIEW MODAL */}
      {selectedRequest && (
        <div
          className="
            fixed
            inset-0
            z-50
            overflow-y-auto
            bg-slate-950/65
            p-3
            backdrop-blur-sm
            sm:p-5
          "
        >
          <div
            className="
              mx-auto
              my-3
              w-full
              max-w-6xl
              overflow-hidden
              rounded-[28px]
              border
              border-white/10
              bg-slate-50
              shadow-2xl
              sm:my-6
            "
          >
            {/* MODAL HEADER */}
            <header
              className="
                flex
                items-start
                justify-between
                gap-4
                border-b
                border-slate-200
                bg-white
                px-5
                py-5
                sm:px-6
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-indigo-50
                    text-indigo-600
                  "
                >
                  <UserCheck
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-[10px]
                      font-black
                      tracking-wide
                      text-indigo-600
                      uppercase
                    "
                  >
                    Review Verifikasi
                  </p>

                  <h2
                    className="
                      mt-0.5
                      truncate
                      text-lg
                      font-black
                      text-slate-900
                    "
                  >
                    {selectedRequest.users
                      ?.full_name ||
                      "Pengguna HelpMe"}
                  </h2>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-[10px]
                      text-slate-400
                    "
                  >
                    User ID:{" "}
                    {selectedRequest.user_id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={processing}
                onClick={closeModal}
                aria-label="Tutup review"
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  hover:text-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <X
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </button>
            </header>

            {/* MODAL BODY */}
            <div
              className="
                grid
                items-start
                lg:grid-cols-[minmax(0,1fr)_330px]
              "
            >
              {/* DOCUMENTS */}
              <div
                className="
                  min-w-0
                  p-4
                  sm:p-6
                "
              >
                <div
                  className="
                    rounded-2xl
                    border
                    border-indigo-100
                    bg-indigo-50/60
                    p-4
                  "
                >
                  <div className="flex gap-3">
                    <ShieldCheck
                      className="
                        mt-0.5
                        h-5
                        w-5
                        shrink-0
                        text-indigo-600
                      "
                      strokeWidth={2}
                    />

                    <div>
                      <p
                        className="
                          text-xs
                          font-black
                          text-indigo-900
                        "
                      >
                        Periksa dokumen dengan teliti
                      </p>

                      <p
                        className="
                          mt-1
                          text-[11px]
                          leading-5
                          text-indigo-700/80
                        "
                      >
                        Pastikan foto identitas dapat dibaca
                        dan wajah pada selfie tampak sesuai
                        sebelum mengambil keputusan.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    mt-5
                    grid
                    gap-4
                    md:grid-cols-2
                  "
                >
                  {/* KTP */}
                  <section
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        border-b
                        border-slate-100
                        px-4
                        py-3.5
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-indigo-50
                          text-indigo-600
                        "
                      >
                        <FileText
                          className="h-4 w-4"
                          strokeWidth={2}
                        />
                      </div>

                      <div>
                        <h3
                          className="
                            text-xs
                            font-black
                            text-slate-900
                          "
                        >
                          Foto KTP
                        </h3>

                        <p
                          className="
                            mt-0.5
                            text-[10px]
                            text-slate-400
                          "
                        >
                          Dokumen identitas pengguna
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        flex
                        min-h-80
                        items-center
                        justify-center
                        bg-slate-100
                        p-3
                      "
                    >
                      <img
                        src={ktpImageUrl}
                        alt="Dokumen KTP pengguna"
                        className="
                          max-h-125
                          w-full
                          rounded-xl
                          object-contain
                        "
                      />
                    </div>
                  </section>

                  {/* SELFIE */}
                  <section
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        border-b
                        border-slate-100
                        px-4
                        py-3.5
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-violet-50
                          text-violet-600
                        "
                      >
                        <Camera
                          className="h-4 w-4"
                          strokeWidth={2}
                        />
                      </div>

                      <div>
                        <h3
                          className="
                            text-xs
                            font-black
                            text-slate-900
                          "
                        >
                          Foto Selfie
                        </h3>

                        <p
                          className="
                            mt-0.5
                            text-[10px]
                            text-slate-400
                          "
                        >
                          Foto wajah untuk pencocokan
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        flex
                        min-h-80
                        items-center
                        justify-center
                        bg-slate-100
                        p-3
                      "
                    >
                      <img
                        src={selfieImageUrl}
                        alt="Foto selfie pengguna"
                        className="
                          max-h-125
                          w-full
                          rounded-xl
                          object-contain
                        "
                      />
                    </div>
                  </section>
                </div>
              </div>

              {/* DECISION PANEL */}
              <aside
                className="
                  border-t
                  border-slate-200
                  bg-white
                  p-5
                  lg:sticky
                  lg:top-0
                  lg:min-h-full
                  lg:border-l
                  lg:border-t-0
                  lg:p-6
                "
              >
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-amber-50
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    text-amber-700
                  "
                >
                  <Clock3
                    className="h-3.5 w-3.5"
                    strokeWidth={2}
                  />

                  Menunggu keputusan
                </div>

                <h3
                  className="
                    mt-4
                    text-lg
                    font-black
                    tracking-tight
                    text-slate-900
                  "
                >
                  Keputusan Verifikasi
                </h3>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Setujui hanya jika dokumen dan identitas
                  pengguna telah diperiksa dengan yakin.
                </p>

                {/* SUBMISSION */}
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
                      text-[10px]
                      font-bold
                      tracking-wide
                      text-slate-400
                      uppercase
                    "
                  >
                    Dikirim
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-bold
                      text-slate-700
                    "
                  >
                    {new Date(
                      selectedRequest.created_at,
                    ).toLocaleString(
                      "id-ID",
                      {
                        dateStyle:
                          "medium",
                        timeStyle:
                          "short",
                      },
                    )}
                  </p>
                </div>

                {/* REJECTION */}
                <div className="mt-6">
                  <label
                    htmlFor="rejection-reason"
                    className="
                      text-xs
                      font-black
                      text-slate-800
                    "
                  >
                    Alasan penolakan
                  </label>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      leading-4
                      text-slate-400
                    "
                  >
                    Wajib diisi jika verifikasi akan
                    ditolak. Pesan ini akan diterima
                    pengguna.
                  </p>

                  <textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) =>
                      setRejectionReason(
                        e.target.value,
                      )
                    }
                    placeholder="Contoh: Foto KTP kurang jelas. Mohon unggah ulang dengan pencahayaan yang lebih baik."
                    disabled={processing}
                    className="
                      mt-3
                      h-36
                      w-full
                      resize-none
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-3.5
                      text-xs
                      leading-5
                      text-slate-700
                      outline-none
                      transition
                      placeholder:text-slate-300
                      focus:border-indigo-300
                      focus:ring-4
                      focus:ring-indigo-50
                      disabled:bg-slate-50
                    "
                  />

                  <p
                    className="
                      mt-1.5
                      text-right
                      text-[9px]
                      text-slate-400
                    "
                  >
                    {
                      rejectionReason.trim()
                        .length
                    }{" "}
                    karakter
                  </p>
                </div>

                {/* ACTIONS */}
                <div
                  className="
                    mt-6
                    space-y-3
                    border-t
                    border-slate-100
                    pt-5
                  "
                >
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => {
                      if (
                        !selectedRequest
                      ) {
                        return;
                      }

                      if (
                        confirm(
                          "Yakin ingin memverifikasi user ini?",
                        )
                      ) {
                        void approveVerification(
                          selectedRequest,
                        );
                      }
                    }}
                    className="
                      flex
                      h-12
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-emerald-600
                      px-4
                      text-sm
                      font-bold
                      text-white
                      shadow-[0_8px_20px_rgba(5,150,105,0.16)]
                      transition
                      hover:bg-emerald-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {processing ? (
                      <>
                        <LoaderCircle
                          className="
                            h-4
                            w-4
                            animate-spin
                          "
                          strokeWidth={2}
                        />

                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          className="h-4 w-4"
                          strokeWidth={2}
                        />

                        Setujui Verifikasi
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={
                      processing ||
                      !rejectionReason.trim()
                    }
                    onClick={() => {
                      if (
                        !selectedRequest
                      ) {
                        return;
                      }

                      if (
                        !rejectionReason.trim()
                      ) {
                        alert(
                          "Masukkan alasan penolakan",
                        );

                        return;
                      }

                      if (
                        confirm(
                          "Yakin ingin menolak verifikasi ini?",
                        )
                      ) {
                        void rejectVerification(
                          selectedRequest,
                        );
                      }
                    }}
                    className="
                      flex
                      h-11
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-red-200
                      bg-red-50
                      px-4
                      text-xs
                      font-bold
                      text-red-600
                      transition
                      hover:bg-red-100
                      disabled:cursor-not-allowed
                      disabled:border-slate-100
                      disabled:bg-slate-50
                      disabled:text-slate-300
                    "
                  >
                    <XCircle
                      className="h-4 w-4"
                      strokeWidth={2}
                    />

                    Tolak Verifikasi
                  </button>
                </div>

                <div
                  className="
                    mt-5
                    flex
                    gap-2
                    rounded-2xl
                    bg-slate-50
                    p-3
                  "
                >
                  <ShieldCheck
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                      text-slate-400
                    "
                    strokeWidth={2}
                  />

                  <p
                    className="
                      text-[10px]
                      leading-4
                      text-slate-400
                    "
                  >
                    Dokumen ini bersifat privat dan hanya
                    digunakan untuk proses verifikasi
                    identitas HelpMe.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}