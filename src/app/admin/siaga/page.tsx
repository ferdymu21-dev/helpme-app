"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowDownUp,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  FileClock,
  Globe,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

type QueueStatus =
  | "PENDING"
  | "NEEDS_CORRECTION"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED"
  | "DRAFT";

type ReviewDecision =
  | "VERIFIED"
  | "NEEDS_CORRECTION"
  | "REJECTED"
  | "SUSPENDED"
  | "REACTIVATED";

type VerificationMethod =
  | "OFFICIAL_WEBSITE"
  | "PHONE_CONFIRMATION"
  | "PUBLIC_RECORD"
  | "DOCUMENT_REVIEW"
  | "IN_PERSON"
  | "OTHER";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  reviewStatus: string;
  isActive: boolean;
  description?: string | null;
  serviceArea?: string | null;
  publicPhone?: string | null;
  publicWhatsapp?: string | null;
}

interface OrganizationItem {
  id: string;
  organizationName: string;
  organizationType?: string | null;
  description?: string | null;
  publicAddress?: string | null;
  city?: string | null;
  province?: string | null;
  officialPhone?: string | null;
  officialWhatsapp?: string | null;
  contactEmail?: string | null;
  websiteUrl?: string | null;
  verificationStatus: string;
  createdAt: string;
  services?: ServiceItem[];
}

interface QueueResponse {
  items: OrganizationItem[];
}

interface ReviewFormState {
  decision: ReviewDecision;
  reason: string;
  verificationMethod: VerificationMethod;
  sourceName: string;
  sourceUrl: string;
  publicSourceLabel: string;
  publicSourceUrl: string;
  evidenceSummary: string;
  adminNotes: string;
}

const queueStatuses: Array<{ value: QueueStatus; label: string }> = [
  { value: "PENDING", label: "Menunggu ditinjau" },
  { value: "NEEDS_CORRECTION", label: "Perlu perbaikan" },
  { value: "VERIFIED", label: "Terverifikasi" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "SUSPENDED", label: "Ditangguhkan" },
  { value: "DRAFT", label: "Draft" },
];

const allQueueStatuses: Array<{ value: QueueStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Semua" },
  ...queueStatuses,
];

const verificationMethods: Array<{ value: VerificationMethod; label: string }> = [
  { value: "OFFICIAL_WEBSITE", label: "Situs resmi" },
  { value: "PHONE_CONFIRMATION", label: "Konfirmasi telepon" },
  { value: "PUBLIC_RECORD", label: "Catatan publik" },
  { value: "DOCUMENT_REVIEW", label: "Pemeriksaan dokumen" },
  { value: "IN_PERSON", label: "Verifikasi langsung" },
  { value: "OTHER", label: "Lainnya" },
];

const initialForm: ReviewFormState = {
  decision: "VERIFIED",
  reason: "",
  verificationMethod: "OFFICIAL_WEBSITE",
  sourceName: "",
  sourceUrl: "",
  publicSourceLabel: "",
  publicSourceUrl: "",
  evidenceSummary: "",
  adminNotes: "",
};

function readableStatus(status: string): string {
  return queueStatuses.find((option) => option.value === status)?.label ?? status;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "NEEDS_CORRECTION":
      return "border-orange-200 bg-orange-50 text-orange-800";
    case "VERIFIED":
    case "APPROVED":
    case "REACTIVATED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "REJECTED":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "SUSPENDED":
      return "border-slate-300 bg-slate-100 text-slate-700";
    case "DRAFT":
      return "border-blue-200 bg-blue-50 text-blue-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function serviceStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Menunggu review";
    case "APPROVED":
      return "Disetujui";
    case "REJECTED":
      return "Ditolak";
    default:
      return status;
  }
}
function readableCategory(value: string): string {
  const labels: Record<string, string> = {
    DISASTER_RELIEF: "Bantuan bencana",
    COMMUNITY_SUPPORT: "Dukungan komunitas",
    COMMUNITY_ORGANIZATION: "Organisasi komunitas",
  };

  if (labels[value]) return labels[value];

  return value
    .replace(/_/g, " ")
    .toLocaleLowerCase("id-ID")
    .split(" ")
    .map((part) => part ? part[0].toLocaleUpperCase("id-ID") + part.slice(1) : part)
    .join(" ");
}

function dateLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Tanggal tidak tersedia" : date.toLocaleString("id-ID");
}

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "text" | "url";
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
      <span>{label}{required ? " *" : ""}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

export default function AdminSiagaPage() {
  const [status, setStatus] = useState<QueueStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");
  const [items, setItems] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [serviceDecision, setServiceDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [serviceReason, setServiceReason] = useState("");
  const [serviceSaving, setServiceSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const groups = await Promise.all(
        queueStatuses.map(async ({ value }) => {
          const response = await fetch(
            `/api/admin/siaga/organizations?status=${encodeURIComponent(value)}`,
            { method: "GET", cache: "no-store" },
          );

          if (!response.ok) {
            throw new Error(
              response.status === 503
                ? "Data workflow Siaga belum tersedia pada database yang terhubung."
                : response.status === 401
                  ? "Silakan login kembali."
                  : response.status === 403
                    ? "Anda tidak memiliki akses admin."
                    : "Antrean organisasi tidak dapat dimuat. Pastikan akun admin masih aktif.",
            );
          }

          const result: QueueResponse = await response.json();
          return Array.isArray(result.items) ? result.items : [];
        }),
      );

      const uniqueItems = new Map<string, OrganizationItem>();
      for (const group of groups) {
        for (const organization of group) {
          uniqueItems.set(organization.id, organization);
        }
      }

      setItems(Array.from(uniqueItems.values()));
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      setItems([]);
      setLastUpdated(null);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memuat antrean.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadQueue(), 0);
    return () => window.clearTimeout(timer);
  }, [loadQueue]);

  const updateForm = <K extends keyof ReviewFormState>(key: K, value: ReviewFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeId || saving) return;
    setSaving(true);
    setNotice(null);
    setLoadError(null);
    try {
      const response = await fetch(`/api/admin/siaga/organizations/${activeId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: form.decision,
          reason: form.reason,
          verificationMethod: form.verificationMethod,
          sourceName: form.sourceName,
          sourceUrl: form.sourceUrl,
          publicSourceLabel: form.publicSourceLabel,
          publicSourceUrl: form.publicSourceUrl,
          evidenceSummary: form.evidenceSummary,
          adminNotes: form.adminNotes,
        }),
      });
      const result: { error?: string; message?: string } = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? result.error ?? "Keputusan review gagal disimpan.");
      }
      setNotice("Keputusan review berhasil disimpan.");
      setActiveId(null);
      setForm(initialForm);
      await loadQueue();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Keputusan review gagal disimpan.");
    } finally {
      setSaving(false);
    }
  };

  const submitServiceReview = async (
    event: FormEvent<HTMLFormElement>,
    serviceId: string,
  ) => {
    event.preventDefault();
    if (serviceSaving) return;

    setServiceSaving(true);
    setNotice(null);
    setLoadError(null);
    try {
      const response = await fetch(`/api/admin/siaga/services/${serviceId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: serviceDecision,
          reason: serviceReason,
        }),
      });
      const result: { message?: string } = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? "Keputusan review layanan gagal disimpan.");
      }

      setNotice(
        serviceDecision === "APPROVED"
          ? "Layanan berhasil disetujui. Penyedia perlu mengaktifkannya secara terpisah."
          : "Layanan berhasil ditolak.",
      );
      setActiveServiceId(null);
      setServiceDecision("APPROVED");
      setServiceReason("");
      await loadQueue();
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Keputusan review layanan gagal disimpan.",
      );
    } finally {
      setServiceSaving(false);
    }
  };

  const evidenceRequired = form.decision === "VERIFIED" || form.decision === "REACTIVATED";
  const reasonRequired = form.decision === "NEEDS_CORRECTION" || form.decision === "REJECTED" || form.decision === "SUSPENDED";
  const statusCounts = items.reduce(
    (counts, item) => {
      const itemStatus = item.verificationStatus as QueueStatus;
      if (Object.prototype.hasOwnProperty.call(counts, itemStatus)) {
        counts[itemStatus] += 1;
      }
      return counts;
    },
    {
      PENDING: 0,
      NEEDS_CORRECTION: 0,
      VERIFIED: 0,
      REJECTED: 0,
      SUSPENDED: 0,
      DRAFT: 0,
    },
  );

  const statusScopedCount = status === "ALL" ? items.length : statusCounts[status];

  const categoryOptions = Array.from(
    new Set(
      items
        .flatMap((organization) =>
          (organization.services ?? []).map((service) => service.category),
        )
        .filter((value) => typeof value === "string" && value.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b, "id-ID"));

  const cityOptions = Array.from(
    new Set(
      items
        .map((organization) => organization.city)
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b, "id-ID"));

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase("id-ID");

  const filteredItems = items
    .filter((organization) => {
      const services = organization.services ?? [];
      const statusMatches =
        status === "ALL" || organization.verificationStatus === status;
      const categoryMatches =
        categoryFilter === "ALL" ||
        services.some((service) => service.category === categoryFilter);
      const cityMatches =
        cityFilter === "ALL" || organization.city === cityFilter;

      if (!statusMatches || !categoryMatches || !cityMatches) {
        return false;
      }

      if (!normalizedSearch) return true;

      const serviceFields = services.flatMap((service) => [
        service.name,
        service.category,
        service.description,
        service.serviceArea,
        service.publicPhone,
        service.publicWhatsapp,
      ]);

      const searchableText = [
        organization.organizationName,
        organization.organizationType,
        organization.description,
        organization.publicAddress,
        organization.city,
        organization.province,
        organization.officialPhone,
        organization.officialWhatsapp,
        organization.contactEmail,
        organization.websiteUrl,
        ...serviceFields,
      ]
        .filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        )
        .join(" ")
        .toLocaleLowerCase("id-ID");

      return searchableText.includes(normalizedSearch);
    })
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      const difference = bTime - aTime;

      if (!Number.isFinite(difference)) return 0;
      return sortOrder === "NEWEST" ? difference : -difference;
    });


  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-5 pb-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Antrean organisasi
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p>Terakhir diperbarui</p>
              <p className="mt-0.5 font-medium text-slate-700">
                {lastUpdated ? dateLabel(lastUpdated) : "Belum diperbarui"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadQueue()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Muat ulang
          </button>
        </div>
      </div>

      <section aria-label="Ringkasan antrean" className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <button
          type="button"
          aria-pressed={status === "PENDING"}
          onClick={() => setStatus("PENDING")}
          className={`flex min-w-0 items-center gap-4 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${status === "PENDING" ? "ring-2 ring-amber-200" : ""}`}
        >
          <span className="rounded-xl bg-amber-100 p-3 text-amber-700">
            <Clock3 className="h-6 w-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm text-slate-600">Menunggu ditinjau</span>
            <span className="mt-0.5 block text-2xl font-black tabular-nums text-slate-950">{statusCounts.PENDING}</span>
          </span>
        </button>

        <button
          type="button"
          aria-pressed={status === "NEEDS_CORRECTION"}
          onClick={() => setStatus("NEEDS_CORRECTION")}
          className={`flex min-w-0 items-center gap-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${status === "NEEDS_CORRECTION" ? "ring-2 ring-blue-200" : ""}`}
        >
          <span className="rounded-xl bg-blue-100 p-3 text-blue-700">
            <FileClock className="h-6 w-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm text-slate-600">Perlu perbaikan</span>
            <span className="mt-0.5 block text-2xl font-black tabular-nums text-slate-950">{statusCounts.NEEDS_CORRECTION}</span>
          </span>
        </button>

        <button
          type="button"
          aria-pressed={status === "VERIFIED"}
          onClick={() => setStatus("VERIFIED")}
          className={`flex min-w-0 items-center gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${status === "VERIFIED" ? "ring-2 ring-emerald-200" : ""}`}
        >
          <span className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
            <BadgeCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm text-slate-600">Terverifikasi</span>
            <span className="mt-0.5 block text-2xl font-black tabular-nums text-slate-950">{statusCounts.VERIFIED}</span>
          </span>
        </button>

        <button
          type="button"
          aria-pressed={status === "SUSPENDED"}
          onClick={() => setStatus("SUSPENDED")}
          className={`flex min-w-0 items-center gap-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${status === "SUSPENDED" ? "ring-2 ring-rose-200" : ""}`}
        >
          <span className="rounded-xl bg-rose-100 p-3 text-rose-700">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm text-slate-600">Ditangguhkan</span>
            <span className="mt-0.5 block text-2xl font-black tabular-nums text-slate-950">{statusCounts.SUSPENDED}</span>
          </span>
        </button>
      </section>

      <section aria-label="Pencarian dan filter antrean" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_200px]">
          <label className="block min-w-0">
            <span className="sr-only">Cari organisasi atau layanan</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                maxLength={100}
                placeholder="Cari organisasi, kota, kontak, atau layanan..."
                aria-label="Cari organisasi atau layanan"
                autoComplete="off"
                className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </span>
          </label>

          <label className="block">
            <span className="sr-only">Filter kategori</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter kategori layanan"
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            >
              <option value="ALL">Semua kategori</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{readableCategory(category)}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Filter kota</span>
            <select
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              aria-label="Filter kota"
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            >
              <option value="ALL">Semua kota</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>
        </div>

        <div role="group" aria-label="Filter status organisasi" className="mt-4 flex gap-2 overflow-x-auto border-b border-slate-100 pb-3">
          {allQueueStatuses.map((option) => {
            const count = option.value === "ALL" ? items.length : statusCounts[option.value];

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={status === option.value}
                onClick={() => setStatus(option.value)}
                className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${status === option.value ? "border-indigo-600 bg-indigo-600 text-white shadow-sm" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800"}`}
              >
                {option.label}
                <span className={`rounded-full px-1.5 py-0.5 text-xs tabular-nums ${status === option.value ? "bg-white/20 text-white" : "bg-white text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Menampilkan <strong className="font-bold text-slate-950">{filteredItems.length}</strong> dari{" "}
          <strong className="font-bold text-slate-950">{statusScopedCount}</strong> organisasi
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Urutkan:
          <span className="relative">
            <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as "NEWEST" | "OLDEST")}
              className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            >
              <option value="NEWEST">Terbaru</option>
              <option value="OLDEST">Terlama</option>
            </select>
          </span>
        </label>
      </div>

      {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />{notice}</div>}
      {loadError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />{loadError}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600" aria-hidden="true" />
          Memuat antrean...
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-5 py-10 text-center text-sm text-slate-600">
          Antrean belum dapat ditampilkan. Periksa pesan error di atas lalu muat ulang.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <ClipboardCheck className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
          <h3 className="mt-3 font-bold text-slate-800">Belum ada organisasi</h3>
          <p className="mt-1 text-sm text-slate-500">Tidak ada pengajuan pada status ini.</p>
        </div>
      ) : items.length > 0 && filteredItems.length === 0 ? (
        <div role="status" className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <Search className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
          <h3 className="mt-3 font-bold text-slate-900">Tidak ada hasil yang cocok</h3>
          <p className="mt-1 text-sm text-slate-500">Coba kata kunci atau filter lain, atau tampilkan semua pengajuan.</p>
          <button type="button" onClick={() => { setSearchQuery(""); setCategoryFilter("ALL"); setCityFilter("ALL"); setStatus("ALL"); }} className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Hapus semua filter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
        {filteredItems.map((organization) => {
          const serviceItems = Array.isArray(organization.services) ? organization.services : [];
          const editing = activeId === organization.id;
          return <article key={organization.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="p-4 sm:p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_250px_auto] lg:items-start">
                <div className="flex min-w-0 gap-3 sm:gap-4">
                  <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 sm:flex">
                    <Building2 className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-base font-bold text-slate-950 sm:text-lg">{organization.organizationName}</h3>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(organization.verificationStatus)}`}>
                        {readableStatus(organization.verificationStatus)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {readableCategory(organization.organizationType ?? "Jenis organisasi belum diisi")}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 sm:text-sm">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                        {organization.city ?? "Kota belum diisi"}{organization.province ? `, ${organization.province}` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                        {dateLabel(organization.createdAt)}
                      </span>
                    </div>
                    {organization.publicAddress && (
                      <p className="mt-3 text-sm leading-5 text-slate-600">
                        <span className="font-semibold text-slate-500">Alamat:</span>{" "}
                        {organization.publicAddress}
                      </p>
                    )}
                    {organization.description && (
                      <p className="mt-3 line-clamp-2 whitespace-pre-wrap text-sm leading-5 text-slate-500">
                        {organization.description}
                      </p>
                    )}
                  </div>
                </div>

                {(organization.officialPhone || organization.officialWhatsapp || organization.contactEmail || organization.websiteUrl) ? (
                  <dl className="grid content-start gap-3 border-t border-slate-100 pt-4 text-sm lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    {organization.officialPhone && (
                      <div>
                        <dt className="inline-flex items-center gap-2 text-xs text-slate-400">
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Telepon
                        </dt>
                        <dd className="mt-0.5 break-words text-slate-700">{organization.officialPhone}</dd>
                      </div>
                    )}
                    {organization.officialWhatsapp && (
                      <div>
                        <dt className="inline-flex items-center gap-2 text-xs text-slate-400">
                          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> WhatsApp
                        </dt>
                        <dd className="mt-0.5 break-words text-slate-700">{organization.officialWhatsapp}</dd>
                      </div>
                    )}
                    {organization.contactEmail && (
                      <div>
                        <dt className="inline-flex items-center gap-2 text-xs text-slate-400">
                          <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Email
                        </dt>
                        <dd className="mt-0.5 break-all text-slate-700">{organization.contactEmail}</dd>
                      </div>
                    )}
                    {organization.websiteUrl && (
                      <div>
                        <dt className="inline-flex items-center gap-2 text-xs text-slate-400">
                          <Globe className="h-3.5 w-3.5" aria-hidden="true" /> Situs
                        </dt>
                        <dd className="mt-0.5 break-all">
                          <a className="text-indigo-700 underline underline-offset-2" href={organization.websiteUrl} target="_blank" rel="noreferrer">
                            {organization.websiteUrl}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="border-t border-slate-100 pt-4 text-sm text-slate-400 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    Kontak belum diisi
                  </p>
                )}

                <div className="flex items-start border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                  <button
                    type="button"
                    aria-expanded={editing}
                    onClick={() => {
                      setActiveId(editing ? null : organization.id);
                      setForm(initialForm);
                      setLoadError(null);
                    }}
                    className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 lg:w-44"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    {editing ? "Tutup review" : "Tinjau organisasi"}
                  </button>
                </div>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-800">Layanan terdaftar</h4>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {serviceItems.length} layanan
                  </span>
                </div>
                {serviceItems.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">Organisasi ini belum memiliki layanan.</p>
                ) : (
                  <div className="mt-3 grid gap-3">
                    {serviceItems.map((service) => {
                      const canReviewService =
                        organization.verificationStatus === "VERIFIED" &&
                        service.reviewStatus === "PENDING";
                      const reviewingService = activeServiceId === service.id;

                      return (
                        <div key={service.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 sm:p-5">
                          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <div className="min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-slate-900">{service.name}</p>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(service.reviewStatus)}`}>
                              {serviceStatusLabel(service.reviewStatus)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">{service.category}</p>
                          {service.description && (
                            <p className="mt-2 text-sm text-slate-600">{service.description}</p>
                          )}
                          {service.serviceArea && (
                            <p className="mt-2 text-xs text-slate-500">Wilayah: {service.serviceArea}</p>
                          )}
                          </div>
                          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:min-w-40 sm:flex-col sm:items-end sm:justify-start sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                            <p className="mt-0 flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium text-slate-500">Publik aktif</span>
                            <span className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${service.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                              {service.isActive ? "Ya" : "Tidak"}
                            </span>
                          </p>

                          {canReviewService && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveServiceId(reviewingService ? null : service.id);
                                setServiceDecision("APPROVED");
                                setServiceReason("");
                                setLoadError(null);
                              }}
                              className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                            >
                              {reviewingService ? "Tutup review layanan" : "Tinjau layanan"}
                            </button>
                          )}

                          </div>
                        </div>
                        {reviewingService && canReviewService && (
                            <form
                              onSubmit={(event) => void submitServiceReview(event, service.id)}
                              className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-3"
                            >
                              <label className="block space-y-1 text-sm font-medium text-slate-700">
                                <span>Keputusan layanan *</span>
                                <select
                                  required
                                  value={serviceDecision}
                                  onChange={(event) => setServiceDecision(event.target.value as "APPROVED" | "REJECTED")}
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                >
                                  <option value="APPROVED">Setujui layanan</option>
                                  <option value="REJECTED">Tolak layanan</option>
                                </select>
                              </label>
                              {serviceDecision === "REJECTED" && (
                                <label className="block space-y-1 text-sm font-medium text-slate-700">
                                  <span>Alasan penolakan *</span>
                                  <textarea
                                    required
                                    minLength={3}
                                    maxLength={2000}
                                    value={serviceReason}
                                    onChange={(event) => setServiceReason(event.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                                    placeholder="Jelaskan alasan penolakan layanan."
                                  />
                                </label>
                              )}
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveServiceId(null)}
                                  disabled={serviceSaving}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                                >
                                  Batal
                                </button>
                                <button
                                  type="submit"
                                  disabled={serviceSaving}
                                  className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                >
                                  {serviceSaving ? "Menyimpan..." : "Simpan keputusan"}
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            {editing && <form onSubmit={submitReview} className="space-y-6 border-t border-slate-200 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-5 sm:p-7">
              <div><h4 className="font-bold text-slate-900">Keputusan moderator</h4><p className="mt-1 text-sm text-slate-600">Bukti verifikasi diperlukan untuk menyetujui atau mengaktifkan kembali organisasi.</p></div>
              <label className="block space-y-1.5 text-sm font-medium text-slate-700">Keputusan *<select required value={form.decision} onChange={(event) => updateForm("decision", event.target.value as ReviewDecision)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"><option value="VERIFIED">Verifikasi</option><option value="NEEDS_CORRECTION">Minta perbaikan</option><option value="REJECTED">Tolak</option><option value="SUSPENDED">Tangguhkan</option><option value="REACTIVATED">Aktifkan kembali organisasi</option></select></label>
              {reasonRequired && <label className="block space-y-1.5 text-sm font-medium text-slate-700">Alasan keputusan *<textarea required minLength={3} maxLength={2000} value={form.reason} onChange={(event) => updateForm("reason", event.target.value)} rows={3} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal" placeholder="Jelaskan alasan keputusan secara spesifik." /></label>}
              {evidenceRequired && <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4"><h5 className="text-sm font-bold text-slate-800">Bukti verifikasi</h5>
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">Metode verifikasi *<select required value={form.verificationMethod} onChange={(event) => updateForm("verificationMethod", event.target.value as VerificationMethod)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">{verificationMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}</select></label>
                <div className="grid gap-4 sm:grid-cols-2"><Field label="Nama sumber" value={form.sourceName} onChange={(value) => updateForm("sourceName", value)} required placeholder="Contoh: Situs resmi instansi" /><Field label="URL sumber internal" value={form.sourceUrl} onChange={(value) => updateForm("sourceUrl", value)} type="url" placeholder="https://..." /><Field label="Label sumber publik" value={form.publicSourceLabel} onChange={(value) => updateForm("publicSourceLabel", value)} required placeholder="Contoh: Situs resmi" /><Field label="URL sumber publik" value={form.publicSourceUrl} onChange={(value) => updateForm("publicSourceUrl", value)} type="url" placeholder="https://..." /></div>
                <label className="block space-y-1.5 text-sm font-medium text-slate-700">Ringkasan bukti *<textarea required minLength={3} maxLength={4000} value={form.evidenceSummary} onChange={(event) => updateForm("evidenceSummary", event.target.value)} rows={3} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal" placeholder="Apa yang diperiksa dan bagaimana sumber mendukung identitas organisasi?" /></label>
              </div>}
              <label className="block space-y-1.5 text-sm font-medium text-slate-700">Catatan internal admin<textarea maxLength={4000} value={form.adminNotes} onChange={(event) => updateForm("adminNotes", event.target.value)} rows={2} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal" placeholder="Opsional; tidak ditampilkan di direktori publik." /></label>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setActiveId(null)} disabled={saving} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50">Batal</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}Simpan keputusan</button></div>
            </form>}
          </article>;
        })}
        </div>
      )}
    </main>
  );
}
