"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { ArrowLeft, Handshake } from "lucide-react";

import { useParams } from "next/navigation";

interface Participant {
  id: string;

  fullName: string | null;

  username: string | null;
}

interface ListingSummary {
  id: string;
  title: string;
}

interface RequestDetail {
  id: string;

  status: string;

  requestDescription: string;

  neededAt: string | null;

  serviceMode: string;

  locationName: string | null;

  budget: number | null;

  createdAt: string;
  updatedAt: string;

  agreedAt: string | null;

  startedAt: string | null;

  submittedAt: string | null;

  completedAt: string | null;

  declinedAt: string | null;

  declinedReason: string | null;

  cancelledAt: string | null;

  cancelledBy: string | null;

  cancellationReason: string | null;

  listing: ListingSummary | null;

  customer: Participant | null;

  provider: Participant | null;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("id-ID") : "-";
}

export default function AdminServiceRequestDetailPage() {
  const params = useParams();

  const requestId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [request, setRequest] = useState<RequestDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const loadRequest = useCallback(async () => {
    if (!requestId) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/service-requests/${encodeURIComponent(requestId)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        setRequest(null);

        return;
      }

      const data: RequestDetail = await response.json();

      setRequest(data);
    } catch (error) {
      console.error(error);

      setRequest(null);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequest();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRequest]);

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        Memuat detail Permintaan Jasa...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
        Permintaan Jasa tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/admin/service-requests"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Permintaan Jasa
      </Link>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Handshake className="h-6 w-6 text-indigo-600" />

          <div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {request.status}
            </span>

            <h1 className="mt-3 text-2xl font-black text-slate-950">
              {request.listing?.title || "Permintaan Jasa"}
            </h1>
          </div>
        </div>

        <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
          {request.requestDescription}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-black text-slate-900">Pihak Terkait</h2>

          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400">
                Customer
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {request.customer?.fullName ||
                  request.customer?.username ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-slate-400">
                Provider
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {request.provider?.fullName ||
                  request.provider?.username ||
                  "-"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-black text-slate-900">Kebutuhan</h2>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>Mode: {request.serviceMode}</p>

            <p>Lokasi: {request.locationName || "-"}</p>

            <p>Dibutuhkan: {formatDate(request.neededAt)}</p>

            <p>
              Budget:{" "}
              {request.budget === null
                ? "-"
                : new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(request.budget)}
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="font-black text-slate-900">Lifecycle</h2>

        <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
          <p>Dibuat: {formatDate(request.createdAt)}</p>

          <p>Disepakati: {formatDate(request.agreedAt)}</p>

          <p>Dimulai: {formatDate(request.startedAt)}</p>

          <p>Submitted: {formatDate(request.submittedAt)}</p>

          <p>Selesai: {formatDate(request.completedAt)}</p>

          <p>Declined: {formatDate(request.declinedAt)}</p>

          <p>Cancelled: {formatDate(request.cancelledAt)}</p>
        </div>

        {request.declinedReason && (
          <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            Alasan decline: {request.declinedReason}
          </p>
        )}

        {request.cancellationReason && (
          <p className="mt-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            Alasan pembatalan: {request.cancellationReason}
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5 text-sm leading-6 text-indigo-800">
        Monitoring ini bersifat read-only. Admin tidak dapat bertindak sebagai
        Customer atau Provider dan tidak dapat memaksa perubahan lifecycle
        Permintaan Jasa.
      </section>
    </div>
  );
}
