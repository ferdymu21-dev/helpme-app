"use client";

import {
    useEffect,
    useState,
} from "react";

import { supabase }
    from "@/lib/supabase/client";

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

    const [
        requests,
        setRequests,
    ] = useState<
        VerificationRequest[]
    >([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        selectedRequest,
        setSelectedRequest,
    ] = useState<
        VerificationRequest | null
    >(
        null
    );

    const [
        ktpImageUrl,
        setKtpImageUrl,
    ] = useState("");

    const [
        selfieImageUrl,
        setSelfieImageUrl,
    ] = useState("");

    const [
        rejectionReason,
        setRejectionReason,
    ] = useState("");

    const [
        processing,
        setProcessing,
    ] = useState(false);

    function closeModal() {

        setSelectedRequest(
            null
        );

        setKtpImageUrl("");

        setSelfieImageUrl("");

        setRejectionReason("");

    }

    async function approveVerification(
        request: VerificationRequest
    ) {

        try {

            setProcessing(true);

            const {
                error: requestError,
            } = await supabase
                .from("verification_requests")
                .update({
                    status: "APPROVED",
                    reviewed_at:
                        new Date().toISOString(),
                })
                .eq("id", request.id);

            if (requestError) {

                console.error(
                    requestError
                );

                return;
            }

            const {
                error: userError,
            } = await supabase
                .from("users")
                .update({
                    verification_status:
                        "VERIFIED",
                })
                .eq(
                    "id",
                    request.user_id
                )
                .select();

            if (userError) {

                console.error(
                    userError
                );

                return;
            }

            alert(
                "User berhasil diverifikasi"
            );

            await supabase
                .from("notifications")
                .insert({

                    user_id:
                        request.user_id,

                    title:
                        "Verifikasi Disetujui",

                    message:
                        "Selamat! Akun Anda berhasil diverifikasi.",

                    type:
                        "VERIFICATION_APPROVED",

                });

            await supabase
                .from("notifications")
                .insert({

                    user_id:
                        request.user_id,

                    title:
                        "Verifikasi Ditolak",

                    message:
                        rejectionReason,

                    type:
                        "VERIFICATION_REJECTED",

                });

            await loadRequests();

            closeModal();

        } catch (error) {

            console.error(error);

        }
        finally {

            setProcessing(false);

        }

    }

    async function rejectVerification(
        request: VerificationRequest
    ) {

        try {

            setProcessing(true);

            const {
                error: requestError,
            } = await supabase
                .from(
                    "verification_requests"
                )
                .update({
                    status: "REJECTED",
                    rejection_reason:
                        rejectionReason,
                    reviewed_at:
                        new Date().toISOString(),
                })
                .eq(
                    "id",
                    request.id
                );

            if (requestError) {

                console.error(
                    requestError
                );

                return;
            }

            const {
                error: userError,
            } = await supabase
                .from("users")
                .update({
                    verification_status:
                        "REJECTED",
                })
                .eq(
                    "id",
                    request.user_id
                );

            if (userError) {

                console.error(
                    userError
                );

                return;
            }

            alert(
                "Verifikasi ditolak"
            );

            await loadRequests();

            closeModal();

        } catch (error) {

            console.error(error);

        }
        finally {

            setProcessing(false);

        }

    }

    useEffect(() => {

        loadRequests();

    }, []);

    async function loadRequests() {

        try {

            setLoading(true);

            const {
                data = [],
                error,
            } = await supabase
                .from(
                    "verification_requests"
                )
                .select(`
                *,
                users (
                    full_name,
                    avatar_url
                )
            `)
                .eq(
                    "status",
                    "PENDING"
                )
                .order(
                    "created_at",
                    {
                        ascending: false,
                    }
                );

            if (error) {

                console.error(error);

                return;
            }

            setRequests(data || []);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    return (

        <main className="p-8">

            <h1
                className="
          text-3xl
          font-black
          text-slate-900
        "
            >
                Verification Requests
            </h1>

            {loading && (

                <p className="mt-6">
                    Loading...
                </p>

            )}

            <div className="mt-8 space-y-6">

                {requests.map(
                    (request) => (

                        <div
                            key={request.id}
                            className="
                rounded-3xl
                bg-white
                p-6
                shadow-sm
              "
                        >

                            <div
                                className="
                  flex
                  items-center
                  gap-4
                "
                            >

                                <img
                                    src={
                                        request.users
                                            ?.avatar_url ||
                                        "/avatar.png"
                                    }
                                    alt=""
                                    className="
                    h-14
                    w-14
                    rounded-full
                    object-cover
                  "
                                />

                                <div>

                                    <p
                                        className="
                      font-bold
                    "
                                    >
                                        {
                                            request.users
                                                ?.full_name
                                        }
                                    </p>

                                    <p
                                        className="
    text-xs
    text-slate-500
  "
                                    >
                                        {new Date(
                                            request.created_at
                                        ).toLocaleString()}
                                    </p>

                                    <p
                                        className="
                      text-sm
                      text-slate-500
                    "
                                    >
                                        {request.status}
                                    </p>

                                    <div
                                        className="
    mt-5
  "
                                    >

                                        <button
                                            onClick={async () => {

                                                const {
                                                    data: ktpSigned,
                                                    error: ktpError,
                                                } =
                                                    await supabase
                                                        .storage
                                                        .from("verifications")
                                                        .createSignedUrl(
                                                            request.ktp_url,
                                                            3600
                                                        );

                                                const {
                                                    data: selfieSigned,
                                                    error: selfieError,
                                                } =
                                                    await supabase
                                                        .storage
                                                        .from("verifications")
                                                        .createSignedUrl(
                                                            request.selfie_url,
                                                            3600
                                                        );

                                                if (ktpError) {

                                                    console.error(
                                                        ktpError
                                                    );

                                                    return;
                                                }

                                                if (selfieError) {

                                                    console.error(
                                                        selfieError
                                                    );

                                                    return;
                                                }

                                                setKtpImageUrl(
                                                    ktpSigned.signedUrl
                                                );

                                                setSelfieImageUrl(
                                                    selfieSigned.signedUrl
                                                );

                                                setRejectionReason("");

                                                setSelectedRequest(
                                                    request
                                                );

                                            }}

                                            className="
      rounded-xl
      bg-slate-100
      px-4
      py-2
      text-sm
      font-semibold
      transition
      hover:bg-slate-200
    "
                                        >
                                            Lihat Dokumen
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )
                )}

            </div>

            {selectedRequest && (

                <div
                    className="
                      fixed
                      inset-0
                      z-50
                      overflow-y-auto
                    bg-black/60
                      p-4
                    "
                >

                    <div
                        className="
                          mx-auto
                          my-10
                          w-full
                          max-w-3xl
                          rounded-3xl
                        bg-white
                          p-6
                        "
                    >

                        {/* HEADER */}

                        <div
                            className="
          flex
          items-center
          justify-between
        "
                        >

                            <div>

                                <h2
                                    className="
              text-xl
              font-black
            "
                                >
                                    {
                                        selectedRequest
                                            .users
                                            ?.full_name
                                    }
                                </h2>

                                <p
                                    className="
              text-sm
              text-slate-500
            "
                                >
                                    {
                                        selectedRequest
                                            .status
                                    }
                                </p>

                            </div>

                            <button
                                disabled={processing}
                                onClick={() =>
                                    closeModal()
                                }
                                className="
            rounded-xl
            bg-slate-100
            px-4
            py-2
            disabled:opacity-50
          "
                            >
                                Tutup
                            </button>

                        </div>

                        {/* KTP */}

                        <div className="mt-8">

                            <h3
                                className="
            mb-3
            font-bold
          "
                            >
                                Foto KTP
                            </h3>

                            <img
                                src={
                                    ktpImageUrl
                                }

                                alt="KTP"
                                className="
            w-full
            rounded-2xl
            border
            object-contain
          "
                            />

                        </div>

                        {/* SELFIE */}

                        <div className="mt-8">

                            <h3
                                className="
                                  mb-3
                                  font-bold
                                "
                            >
                                Foto Selfie
                            </h3>

                            <img
                                src={
                                    selfieImageUrl
                                }

                                alt="Selfie"
                                className="
            w-full
            rounded-2xl
            border
            object-contain
          "
                            />

                            <div className="mt-8">

                                <div className="
                                       mt-8
                                       w-full           
                                     "
                                >

                                    <p
                                        className="
            mb-2
            text-sm
            font-semibold
            text-slate-700
        "
                                    >
                                        Alasan Penolakan
                                    </p>

                                    <textarea
                                        value={
                                            rejectionReason
                                        }
                                        onChange={(e) =>
                                            setRejectionReason(
                                                e.target.value
                                            )
                                        }
                                        placeholder="
Masukkan alasan jika verifikasi ditolak...
"
                                        className="
            h-32
            w-full
            rounded-2xl
            border
            border-slate-200
            p-4
            outline-none
        "
                                    />

                                </div>

                                <div
                                    className="
        mt-6
        flex
        gap-4
    "
                                >

                                    <button
                                        disabled={processing}
                                        onClick={() => {

                                            if (!selectedRequest)
                                                return;

                                            if (
                                                confirm(
                                                    "Yakin ingin memverifikasi user ini?"
                                                )
                                            ) {

                                                approveVerification(
                                                    selectedRequest
                                                );

                                            }

                                        }}

                                        className="
            flex-1
            rounded-2xl
            bg-emerald-600
            py-4
            font-bold
            text-white
        "
                                    >
                                        {
                                            processing
                                                ? "Memproses..."
                                                : "Approve"
                                        }
                                    </button>

                                    <button
                                        disabled={processing}
                                        onClick={() => {

                                            if (!selectedRequest)
                                                return;

                                            if (
                                                !rejectionReason.trim()
                                            ) {

                                                alert(
                                                    "Masukkan alasan penolakan"
                                                );

                                                return;
                                            }

                                            if (
                                                confirm(
                                                    "Yakin ingin menolak verifikasi ini?"
                                                )
                                            ) {

                                                rejectVerification(
                                                    selectedRequest
                                                );

                                            }

                                        }}

                                        className="
            flex-1
            rounded-2xl
            bg-red-600
            py-4
            font-bold
            text-white
        "
                                    >
                                        {
                                            processing
                                                ? "Memproses..."
                                                : "Reject"
                                        }
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </main>

    );
}