"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Plus,
  User,
  Users,
  Siren,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

type PortalRole = "OWNER" | "HELPER";

interface EmergencyPortalItem {
  id: string;
  category: string;
  title: string;
  status: "ACTIVE";
  role: PortalRole;
  created_at: string;
  expires_at: string;
  helper_count: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function parsePortalItem(value: unknown): EmergencyPortalItem | null {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isString(value.category) ||
    !isString(value.title) ||
    value.status !== "ACTIVE" ||
    (value.role !== "OWNER" && value.role !== "HELPER") ||
    !isString(value.created_at) ||
    !isString(value.expires_at) ||
    typeof value.helper_count !== "number" ||
    !Number.isInteger(value.helper_count) ||
    value.helper_count < 0 ||
    !Number.isFinite(Date.parse(value.created_at)) ||
    !Number.isFinite(Date.parse(value.expires_at))
  ) {
    return null;
  }

  return {
    id: value.id,
    category: value.category,
    title: value.title,
    status: "ACTIVE",
    role: value.role,
    created_at: value.created_at,
    expires_at: value.expires_at,
    helper_count: value.helper_count,
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
    case "OTHER":
      return "Lainnya";
    default:
      return "Bantuan darurat";
  }
}

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EmergencyActivityPortal() {
  const [items, setItems] = useState<EmergencyPortalItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadPortal() {
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData.user) {
          if (!cancelled) setItems([]);
          return;
        }

        const { data, error } = await supabase.rpc(
          "get_my_emergency_help_portal",
        );

        if (error) {
          console.error(
            "Gagal memuat portal aktivitas emergency:",
            error.message,
          );
          if (!cancelled) setItems([]);
          return;
        }

        const parsedItems = Array.isArray(data)
          ? data
              .map(parsePortalItem)
              .filter((item): item is EmergencyPortalItem => item !== null)
          : [];

        if (!cancelled) setItems(parsedItems);
      } catch (error) {
        console.error("Gagal memuat portal aktivitas emergency:", error);
        if (!cancelled) setItems([]);
      }
    }

    void loadPortal();

    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section
      className="mb-3 sm:mb-4"
      aria-labelledby="emergency-activity-portal-title"
    >
      <div className="overflow-hidden rounded-2xl border border-red-600 bg-rose-50 p-3 shadow-[0_4px_14px_rgba(15,23,42,0.035)] sm:rounded-3xl sm:p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-rose-700">
            <Siren className="h-5 w-5" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <h2
              id="emergency-activity-portal-title"
              className="text-[12px] font-semibold text-[#142653] sm:text-base"
            >
              Aktivitas Emergency Saya
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-500 sm:text-sm">
              Akses cepat ke permintaan darurat yang terkait denganmu.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const isOwner = item.role === "OWNER";

            return (
              <Link
                key={item.id}
                href={`/siaga/emergency/${encodeURIComponent(item.id)}`}
                aria-label={`Buka detail ${item.title}`}
                className="group flex flex-col gap-1 rounded-xl border border-red-600 bg-white p-2 transition hover:border-teal-200 hover:bg-teal-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white uppercase shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      AKTIF
                    </span>

                    <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                      Bantuan dibutuhkan
                    </span>
                  </div>

                  <span className="text-[9px] font-medium text-slate-500">
                    {formatCreatedAt(item.created_at)}
                  </span>
                </div>

                <h3 className="text-[15px] font-bold tracking-tight p-1 text-slate-900 sm:text-base">
                  {item.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 pt-0.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-md bg-rose-50 text-rose-600">
                      <Plus className="h-3 w-3" />
                    </span>
                    <span className="font-semibold text-slate-900">
                      {categoryLabel(item.category)}
                    </span>
                  </span>

                  <span className="text-slate-300">|</span>

                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-600">
                      {isOwner ? "Pemohon" : "Relawan"}
                    </span>
                  </span>

                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3 text-slate-500" />
                    <span className="text-slate-600">
                      {item.helper_count} Relawan bergabung
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}