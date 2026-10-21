"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
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
  const [status, setStatus] = useState<QueueStatus>("PENDING");
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

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(
        `/api/admin/siaga/organizations?status=${encodeURIComponent(status)}`,
        { method: "GET", cache: "no-store" },
      );
      if (!response.ok) {
        throw new Error(response.status === 503
          ? "Data workflow Siaga belum tersedia pada database yang terhubung."
          : "Antrean organisasi tidak dapat dimuat. Pastikan akun admin masih aktif.");
      }
      const result: QueueResponse = await response.json();
      setItems(Array.isArray(result.items) ? result.items : []);
    } catch (error) {
      setItems([]);
      setLoadError(error instanceof Error ? error.message : "Terjadi kesalahan saat memuat antrean.");
    } finally {
      setLoading(false);
    }
  }, [status]);

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

  return (
    <main className="mx-auto max-w-7xl space-y-6 pb-12">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="rounded-2xl bg-indigo-50 p-3 text-indigo-700"><ShieldCheck className="h-7 w-7" /></span>
            <div>
              <p className="text-sm font-semibold text-indigo-700">Panel administrasi</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">HelpMe Siaga</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Tinjau organisasi dan layanan darurat. Pastikan keputusan verifikasi didukung sumber yang dapat diperiksa; catatan internal tidak ditampilkan ke publik.</p>
            </div>
          </div>
          <button type="button" onClick={() => void loadQueue()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Muat ulang
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-bold text-slate-900">Antrean organisasi</h2><p className="mt-1 text-sm text-slate-500">{items.length} organisasi pada status yang dipilih</p></div>
          <label className="text-sm font-semibold text-slate-700">Filter status
            <select value={status} onChange={(event) => setStatus(event.target.value as QueueStatus)} className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 sm:min-w-56">
              {queueStatuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />{notice}</div>}
      {loadError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />{loadError}</div>}

      {loading ? <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" />Memuat antrean...</div> : items.length === 0 && !loadError ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><ClipboardCheck className="mx-auto h-8 w-8 text-slate-400" /><h3 className="mt-3 font-bold text-slate-800">Belum ada organisasi</h3><p className="mt-1 text-sm text-slate-500">Tidak ada data pada filter status ini.</p></div> : <div className="space-y-4">
        {items.map((organization) => {
          const serviceItems = Array.isArray(organization.services) ? organization.services : [];
          const editing = activeId === organization.id;
          return <article key={organization.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold text-slate-950">{organization.organizationName}</h3><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{readableStatus(organization.verificationStatus)}</span></div>
                  <p className="mt-1 text-sm text-slate-500">{organization.organizationType ?? "Jenis organisasi belum diisi"} Â· {organization.city ?? "Kota belum diisi"}{organization.province ? `, ${organization.province}` : ""}</p>
                  <p className="mt-2 text-xs text-slate-400">Diajukan: {dateLabel(organization.createdAt)}</p>
                </div>
                <button type="button" onClick={() => { setActiveId(editing ? null : organization.id); setForm(initialForm); setLoadError(null); }} className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">{editing ? "Tutup review" : "Tinjau organisasi"}</button>
              </div>
              {organization.description && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{organization.description}</p>}
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {organization.publicAddress && <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alamat</dt><dd className="mt-1 text-slate-700">{organization.publicAddress}</dd></div>}
                {organization.officialPhone && <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Telepon</dt><dd className="mt-1 text-slate-700">{organization.officialPhone}</dd></div>}
                {organization.officialWhatsapp && <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">WhatsApp</dt><dd className="mt-1 text-slate-700">{organization.officialWhatsapp}</dd></div>}
                {organization.contactEmail && <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</dt><dd className="mt-1 break-all text-slate-700">{organization.contactEmail}</dd></div>}
                {organization.websiteUrl && <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Situs</dt><dd className="mt-1 break-all"><a className="text-indigo-700 underline" href={organization.websiteUrl} target="_blank" rel="noreferrer">{organization.websiteUrl}</a></dd></div>}
              </dl>
              <div className="mt-5 border-t border-slate-100 pt-4"><h4 className="text-sm font-bold text-slate-800">Layanan terdaftar ({serviceItems.length})</h4>
                {serviceItems.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">Organisasi ini belum memiliki layanan.</p>
                ) : (
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    {serviceItems.map((service) => {
                      const canReviewService =
                        organization.verificationStatus === "VERIFIED" &&
                        service.reviewStatus === "PENDING";
                      const reviewingService = activeServiceId === service.id;

                      return (
                        <div key={service.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-slate-900">{service.name}</p>
                            <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600">
                              {service.reviewStatus}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">{service.category}</p>
                          {service.description && (
                            <p className="mt-2 text-sm text-slate-600">{service.description}</p>
                          )}
                          {service.serviceArea && (
                            <p className="mt-2 text-xs text-slate-500">Wilayah: {service.serviceArea}</p>
                          )}
                          <p className="mt-2 text-xs text-slate-500">
                            Publik aktif: {service.isActive ? "Ya" : "Tidak"}
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
            {editing && <form onSubmit={submitReview} className="space-y-5 border-t border-indigo-100 bg-indigo-50/40 p-5 sm:p-6">
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
      </div>}
    </main>
  );
}