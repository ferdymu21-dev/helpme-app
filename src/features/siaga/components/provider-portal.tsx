"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Camera,
  CheckCircle2,
  Clock3,
  Globe,
  LoaderCircle,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Store,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
const ProviderLocationPicker = dynamic(
  () => import("@/features/siaga/components/provider-location-picker"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-slate-200 p-5 text-sm text-slate-500">
        Memuat peta lokasi...
      </div>
    ),
  },
);

const ORGANIZATION_TYPES = [
  ["GOVERNMENT_AGENCY", "Instansi pemerintah"],
  ["FOUNDATION", "Yayasan"],
  ["SOCIAL_ORGANIZATION", "Organisasi sosial"],
  ["HEALTHCARE_FACILITY", "Fasilitas kesehatan"],
  ["COMMUNITY_ORGANIZATION", "Organisasi komunitas"],
  ["OTHER", "Lainnya"],
] as const;

const LEGACY_ORGANIZATION_TYPES = [
  ["AMBULANCE_PROVIDER", "Penyedia ambulans"],
  ["DISASTER_RELIEF", "Bantuan kebencanaan"],
  ["SEARCH_AND_RESCUE", "Pencarian dan penyelamatan"],
] as const;

const ORGANIZATION_TYPE_LABELS = [
  ...ORGANIZATION_TYPES,
  ...LEGACY_ORGANIZATION_TYPES,
] as const;

const SERVICE_CATEGORIES = [
  ["AMBULANCE", "Ambulans"],
  ["MEDICAL", "Layanan medis"],
  ["FIRE_RESCUE", "Pemadam kebakaran"],
  ["DISASTER_RELIEF", "Bantuan kebencanaan"],
  ["SEARCH_RESCUE", "Pencarian dan penyelamatan"],
  ["COMMUNITY_SUPPORT", "Dukungan komunitas"],
  ["SECURITY", "Keamanan"],
  ["OTHER", "Lainnya"],
] as const;

const COST_TYPES = [
  ["UNKNOWN", "Belum diketahui"],
  ["FREE", "Gratis"],
  ["PAID", "Berbayar"],
  ["DONATION", "Donasi"],
  ["VARIES", "Bervariasi"],
] as const;

interface ProviderForm {
  organizationName: string;
  organizationType: string;
  registrationIdentifier: string;
  description: string;
  officialPhone: string;
  officialWhatsapp: string;
  contactEmail: string;
  websiteUrl: string;
  publicAddress: string;
  district: string;
  city: string;
  province: string;
  coverageDescription: string;
  latitude: string;
  longitude: string;
  coordinatesPublic: boolean;
  serviceName: string;
  serviceCategory: string;
  serviceDescription: string;
  servicePhone: string;
  serviceWhatsapp: string;
  serviceArea: string;
  costType: string;
  operatingHours: string;
}

interface ProviderService {
  id: string;
  name: string;
  category: string;
  description: string;
  publicPhone: string;
  publicWhatsapp: string;
  serviceArea: string;
  costType: string;
  operatingHours: string;
  reviewStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServiceEditForm {
  serviceName: string;
  serviceCategory: string;
  serviceDescription: string;
  servicePhone: string;
  serviceWhatsapp: string;
  serviceArea: string;
  costType: string;
  operatingHours: string;
}

const EMPTY_SERVICE_EDIT_FORM: ServiceEditForm = {
  serviceName: "",
  serviceCategory: "AMBULANCE",
  serviceDescription: "",
  servicePhone: "",
  serviceWhatsapp: "",
  serviceArea: "",
  costType: "UNKNOWN",
  operatingHours: "",
};

interface ProviderOrganization {
  id: string;
  organizationName: string;
  organizationType: string;
  registrationIdentifier: string;
  description: string;
  officialPhone: string;
  officialWhatsapp: string;
  contactEmail: string;
  websiteUrl: string;
  publicAddress: string;
  district: string;
  city: string;
  province: string;
  coverageDescription: string;
  latitude: number | null;
  longitude: number | null;
  coordinatesPublic: boolean;
  profileImageUrl: string;
  coverImageUrl: string;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
  services: ProviderService[];
}

interface OrganizationEditForm {
  organizationName: string;
  organizationType: string;
  registrationIdentifier: string;
  description: string;
  officialPhone: string;
  officialWhatsapp: string;
  contactEmail: string;
  websiteUrl: string;
  publicAddress: string;
  district: string;
  city: string;
  province: string;
  coverageDescription: string;
  latitude: string;
  longitude: string;
  coordinatesPublic: boolean;
}

const EMPTY_ORGANIZATION_EDIT_FORM: OrganizationEditForm = {
  organizationName: "",
  organizationType: "COMMUNITY_ORGANIZATION",
  registrationIdentifier: "",
  description: "",
  officialPhone: "",
  officialWhatsapp: "",
  contactEmail: "",
  websiteUrl: "",
  publicAddress: "",
  district: "",
  city: "Surabaya",
  province: "Jawa Timur",
  coverageDescription: "",
  latitude: "",
  longitude: "",
  coordinatesPublic: false,
};

interface SubmissionResult {
  organization: {
    id: string;
    verificationStatus: "PENDING";
  };
  service: {
    id: string;
    reviewStatus: "PENDING";
    isActive: false;
  };
  submittedAt: string;
}

const EMPTY_FORM: ProviderForm = {
  organizationName: "",
  organizationType: "AMBULANCE_PROVIDER",
  registrationIdentifier: "",
  description: "",
  officialPhone: "",
  officialWhatsapp: "",
  contactEmail: "",
  websiteUrl: "",
  publicAddress: "",
  district: "",
  city: "",
  province: "",
  coverageDescription: "",
  latitude: "",
  longitude: "",
  coordinatesPublic: false,
  serviceName: "",
  serviceCategory: "AMBULANCE",
  serviceDescription: "",
  servicePhone: "",
  serviceWhatsapp: "",
  serviceArea: "",
  costType: "UNKNOWN",
  operatingHours: "",
};

const ORGANIZATION_STATUS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Menunggu verifikasi",
  NEEDS_CORRECTION: "Perlu perbaikan",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  SUSPENDED: "Ditangguhkan",
};

const SERVICE_STATUS: Record<string, string> = {
  PENDING: "Menunggu persetujuan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getString(
  value: unknown,
): string | null {
  return typeof value === "string" ? value : null;
}

function getNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "number" && typeof value !== "string") {
    throw new Error("Koordinat organisasi tidak valid.");
  }

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error("Koordinat organisasi tidak valid.");
  }

  return parsed;
}

function parseOrganizations(
  value: unknown,
): ProviderOrganization[] {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new Error("Format daftar organisasi tidak valid.");
  }

  return value.items.map((item): ProviderOrganization => {
    if (!isRecord(item) || !Array.isArray(item.services)) {
      throw new Error("Data organisasi tidak valid.");
    }

    const id = getString(item.id);
    const organizationName = getString(item.organizationName);
    const organizationType = getString(item.organizationType);
    const description = getString(item.description);
    const city = getString(item.city);
    const province = getString(item.province);
    const registrationIdentifier = getString(item.registrationIdentifier) ?? "";
    const officialPhone = getString(item.officialPhone) ?? "";
    const officialWhatsapp = getString(item.officialWhatsapp) ?? "";
    const contactEmail = getString(item.contactEmail) ?? "";
    const websiteUrl = getString(item.websiteUrl) ?? "";
    const publicAddress = getString(item.publicAddress) ?? "";
    const district = getString(item.district) ?? "";
    const coverageDescription = getString(item.coverageDescription) ?? "";
    const latitude = getNullableNumber(item.latitude);
    const longitude = getNullableNumber(item.longitude);
    const coordinatesPublic = item.coordinatesPublic;
    const profileImageUrl = getString(item.profileImageUrl) ?? "";
    const coverImageUrl = getString(item.coverImageUrl) ?? "";
    const verificationStatus = getString(item.verificationStatus);
    const createdAt = getString(item.createdAt);
    const updatedAt = getString(item.updatedAt);

    if (
      !id ||
      organizationName === null ||
      organizationType === null ||
      description === null ||
      city === null ||
      province === null ||
      typeof coordinatesPublic !== "boolean" ||
      verificationStatus === null ||
      createdAt === null ||
      updatedAt === null
    ) {
      throw new Error("Data organisasi tidak lengkap.");
    }

    const services = item.services.map(
      (service): ProviderService => {
        if (!isRecord(service)) {
          throw new Error("Data layanan tidak valid.");
        }

        const serviceId = getString(service.id);
        const name = getString(service.name);
        const category = getString(service.category);
        const serviceDescription = getString(service.description);
        const publicPhone = getString(service.publicPhone) ?? "";
        const publicWhatsapp = getString(service.publicWhatsapp) ?? "";
        const serviceArea = getString(service.serviceArea) ?? "";
        const costType = getString(service.costType) ?? "UNKNOWN";
        const operatingHours = getString(service.operatingHours) ?? "";
        const reviewStatus = getString(service.reviewStatus);
        const serviceCreatedAt = getString(service.createdAt);
        const serviceUpdatedAt = getString(service.updatedAt);

        if (
          !serviceId ||
          name === null ||
          category === null ||
          serviceDescription === null ||
          reviewStatus === null ||
          serviceCreatedAt === null ||
          serviceUpdatedAt === null ||
          typeof service.isActive !== "boolean"
        ) {
          throw new Error("Data layanan tidak lengkap.");
        }

        return {
          id: serviceId,
          name,
          category,
          description: serviceDescription,
          publicPhone,
          publicWhatsapp,
          serviceArea,
          costType,
          operatingHours,
          reviewStatus,
          isActive: service.isActive,
          createdAt: serviceCreatedAt,
          updatedAt: serviceUpdatedAt,
        };
      },
    );

    return {
      id,
      organizationName,
      organizationType,
      registrationIdentifier,
      description,
      officialPhone,
      officialWhatsapp,
      contactEmail,
      websiteUrl,
      publicAddress,
      district,
      city,
      province,
      coverageDescription,
      latitude,
      longitude,
      coordinatesPublic,
      profileImageUrl,
      coverImageUrl,
      verificationStatus,
      createdAt,
      updatedAt,
      services,
    };
  });
}

function parseSubmissionResult(
  value: unknown,
): SubmissionResult {
  if (
    !isRecord(value) ||
    !isRecord(value.organization) ||
    !isRecord(value.service)
  ) {
    throw new Error("Respons pengajuan tidak valid.");
  }

  const organizationId = getString(value.organization.id);
  const serviceId = getString(value.service.id);
  const submittedAt = getString(value.submittedAt);

  if (
    !organizationId ||
    value.organization.verificationStatus !== "PENDING" ||
    !serviceId ||
    value.service.reviewStatus !== "PENDING" ||
    value.service.isActive !== false ||
    !submittedAt ||
    !Number.isFinite(Date.parse(submittedAt))
  ) {
    throw new Error("Format hasil pengajuan tidak valid.");
  }

  return {
    organization: {
      id: organizationId,
      verificationStatus: "PENDING",
    },
    service: {
      id: serviceId,
      reviewStatus: "PENDING",
      isActive: false,
    },
    submittedAt,
  };
}

async function readResponseMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);

  if (isRecord(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
  }

  return data.session.access_token;
}

function statusLabel(
  status: string,
  labels: Record<string, string>,
): string {
  return labels[status] ?? status;
}

function formatDate(value: string): string {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

async function fetchProviderOrganizations(): Promise<
  ProviderOrganization[]
> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    "/api/siaga/provider/organizations",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readResponseMessage(
        response,
        "Gagal memuat daftar organisasi.",
      ),
    );
  }

  const payload: unknown = await response.json();

  return parseOrganizations(payload);
}

function Field({
  label,
  required = false,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="block text-xs leading-5 text-slate-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

const inputClassName =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function SiagaProviderPage({ mode = "registration" }: { mode?: "registration" | "profile" }) {
  const [form, setForm] = useState<ProviderForm>({ ...EMPTY_FORM });
  const [organizations, setOrganizations] = useState<ProviderOrganization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [organizationEditId, setOrganizationEditId] = useState<string | null>(null);
  const [organizationForm, setOrganizationForm] =
    useState<OrganizationEditForm>({ ...EMPTY_ORGANIZATION_EDIT_FORM });
  const [savingOrganizationId, setSavingOrganizationId] = useState<string | null>(null);
  const [serviceEditId, setServiceEditId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] =
    useState<ServiceEditForm>({ ...EMPTY_SERVICE_EDIT_FORM });
  const [savingServiceId, setSavingServiceId] = useState<string | null>(null);
  const [newServiceOrganizationId, setNewServiceOrganizationId] = useState<string | null>(null);
  const [newServiceForm, setNewServiceForm] =
    useState<ServiceEditForm>({ ...EMPTY_SERVICE_EDIT_FORM });
  const [creatingServiceOrganizationId, setCreatingServiceOrganizationId] =
    useState<string | null>(null);
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(null);

  const updateForm = <K extends keyof ProviderForm>(
    key: K,
    value: ProviderForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const [uploadingMediaKey, setUploadingMediaKey] = useState<string | null>(null);
  const [organizationTabs, setOrganizationTabs] = useState<
    Record<string, "about" | "services">
  >({});

  const loadOrganizations = useCallback(async () => {
    setLoadingOrganizations(true);
    setPageError("");

    try {
      const items = await fetchProviderOrganizations();
      setOrganizations(items);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Gagal memuat daftar organisasi.",
      );
    } finally {
      setLoadingOrganizations(false);
    }
  }, []);

  const uploadOrganizationMedia = async (
    organizationId: string,
    mediaKind: "profile" | "cover",
    file: File,
  ) => {
    if (uploadingMediaKey !== null) return;

    const mediaKey = `${organizationId}:${mediaKind}`;
    setUploadingMediaKey(mediaKey);
    setPageError("");
    setNotice("");

    try {
      if (file.size <= 0 || file.size > 5 * 1024 * 1024) {
        throw new Error("Ukuran gambar maksimal 5 MB.");
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        throw new Error("Gunakan gambar JPG, PNG, atau WebP.");
      }

      const accessToken = await getAccessToken();
      const formData = new FormData();
      formData.set("kind", mediaKind);
      formData.set("file", file);

      const response = await fetch(
        `/api/siaga/provider/organizations/${organizationId}/media`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Gagal mengunggah gambar organisasi."),
        );
      }

      const payload: unknown = await response.json();
      setNotice(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : mediaKind === "profile"
            ? "Foto profil organisasi berhasil diperbarui."
            : "Foto sampul organisasi berhasil diperbarui.",
      );
      await loadOrganizations();
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Gagal mengunggah gambar organisasi.",
      );
    } finally {
      setUploadingMediaKey(null);
    }
  };

  const submitOrganizationEdit = async (
    event: FormEvent<HTMLFormElement>,
    organizationId: string,
  ) => {
    event.preventDefault();

    if (
      savingOrganizationId !== null ||
      savingServiceId !== null ||
      updatingServiceId !== null
    ) {
      return;
    }

    const latitudeText = organizationForm.latitude.trim();
    const longitudeText = organizationForm.longitude.trim();

    if (Boolean(latitudeText) !== Boolean(longitudeText)) {
      setPageError("Latitude dan longitude harus diisi berpasangan.");
      return;
    }

    const latitude = latitudeText ? Number(latitudeText) : null;
    const longitude = longitudeText ? Number(longitudeText) : null;

    if (
      latitude !== null &&
      longitude !== null &&
      (!Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180)
    ) {
      setPageError("Koordinat di luar rentang yang valid.");
      return;
    }

    if (organizationForm.coordinatesPublic && latitude === null) {
      setPageError(
        "Isi koordinat terlebih dahulu sebelum mengaktifkan publikasi koordinat.",
      );
      return;
    }

    setSavingOrganizationId(organizationId);
    setPageError("");
    setNotice("");

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `/api/siaga/provider/organizations/${organizationId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...organizationForm,
            latitude,
            longitude,
          }),
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Gagal memperbarui profil organisasi."),
        );
      }

      const payload: unknown = await response.json();
      setNotice(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : "Profil organisasi berhasil diperbarui.",
      );
      setOrganizationEditId(null);
      setOrganizationForm({ ...EMPTY_ORGANIZATION_EDIT_FORM });
      await loadOrganizations();
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui profil organisasi.",
      );
    } finally {
      setSavingOrganizationId(null);
    }
  };

  const submitNewService = async (
    event: FormEvent<HTMLFormElement>,
    organizationId: string,
  ) => {
    event.preventDefault();

    if (
      creatingServiceOrganizationId !== null ||
      savingServiceId !== null ||
      savingOrganizationId !== null ||
      updatingServiceId !== null
    ) {
      return;
    }

    setCreatingServiceOrganizationId(organizationId);
    setPageError("");
    setNotice("");

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `/api/siaga/provider/organizations/${organizationId}/services`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newServiceForm),
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Gagal mendaftarkan layanan."),
        );
      }

      const payload: unknown = await response.json();
      setNotice(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : "Layanan berhasil diajukan dan menunggu review admin.",
      );
      setNewServiceOrganizationId(null);
      setNewServiceForm({ ...EMPTY_SERVICE_EDIT_FORM });
      await loadOrganizations();
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Gagal mendaftarkan layanan.",
      );
    } finally {
      setCreatingServiceOrganizationId(null);
    }
  };

  const submitServiceEdit = async (
    event: FormEvent<HTMLFormElement>,
    serviceId: string,
  ) => {
    event.preventDefault();
    if (savingServiceId !== null || updatingServiceId !== null) return;

    setSavingServiceId(serviceId);
    setPageError("");
    setNotice("");

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `/api/siaga/provider/services/${serviceId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(serviceForm),
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Gagal memperbarui layanan."),
        );
      }

      const payload: unknown = await response.json();
      setNotice(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : "Profil layanan diperbarui. Menunggu review ulang.",
      );
      setServiceEditId(null);
      setServiceForm({ ...EMPTY_SERVICE_EDIT_FORM });
      await loadOrganizations();
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Gagal memperbarui layanan.",
      );
    } finally {
      setSavingServiceId(null);
    }
  };

  const handleServiceActivation = async (
    serviceId: string,
    isActive: boolean,
  ) => {
    if (savingServiceId !== null || updatingServiceId !== null) return;

    setUpdatingServiceId(serviceId);
    setPageError("");
    setNotice("");

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `/api/siaga/provider/services/${serviceId}/active`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive }),
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(response, "Gagal mengubah status layanan."),
        );
      }

      const payload: unknown = await response.json();
      setNotice(
        isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : "Status layanan berhasil diperbarui.",
      );
      await loadOrganizations();
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Gagal mengubah status layanan.",
      );
    } finally {
      setUpdatingServiceId(null);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadInitialOrganizations() {
      try {
        const items = await fetchProviderOrganizations();

        if (!cancelled) {
          setOrganizations(items);
        }
      } catch (error) {
        if (!cancelled) {
          setPageError(
            error instanceof Error
              ? error.message
              : "Gagal memuat daftar organisasi.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOrganizations(false);
        }
      }
    }

    void loadInitialOrganizations();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleTextChange =
    (key: keyof ProviderForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [key]: value }));
    };

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    if (!form.officialPhone.trim() && !form.officialWhatsapp.trim()) {
      setFormError(
        "Isi minimal satu kontak resmi organisasi: telepon atau WhatsApp.",
      );
      return;
    }

    const hasLatitude = form.latitude.trim() !== "";
    const hasLongitude = form.longitude.trim() !== "";

    if (hasLatitude !== hasLongitude) {
      setFormError(
        "Latitude dan longitude harus diisi berpasangan.",
      );
      return;
    }

    if (
      hasLatitude &&
      (
        !Number.isFinite(Number(form.latitude)) ||
        !Number.isFinite(Number(form.longitude)) ||
        Number(form.latitude) < -90 ||
        Number(form.latitude) > 90 ||
        Number(form.longitude) < -180 ||
        Number(form.longitude) > 180
      )
    ) {
      setFormError("Koordinat lokasi tidak valid.");
      return;
    }

    if (form.coordinatesPublic && !hasLatitude) {
      setFormError(
        "Isi koordinat sebelum memilih untuk menampilkannya secara publik.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const accessToken = await getAccessToken();
      const response = await fetch("/api/siaga/provider/organizations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organizationName: form.organizationName.trim(),
          organizationType: form.organizationType,
          registrationIdentifier: form.registrationIdentifier.trim() || null,
          description: form.description.trim(),
          officialPhone: form.officialPhone.trim() || null,
          officialWhatsapp: form.officialWhatsapp.trim() || null,
          contactEmail: form.contactEmail.trim() || null,
          websiteUrl: form.websiteUrl.trim() || null,
          publicAddress: form.publicAddress.trim() || null,
          district: form.district.trim() || null,
          city: form.city.trim(),
          province: form.province.trim(),
          coverageDescription: form.coverageDescription.trim(),
          latitude: hasLatitude ? Number(form.latitude) : null,
          longitude: hasLongitude ? Number(form.longitude) : null,
          coordinatesPublic: form.coordinatesPublic,
          serviceName: form.serviceName.trim(),
          serviceCategory: form.serviceCategory,
          serviceDescription: form.serviceDescription.trim(),
          servicePhone: form.servicePhone.trim() || null,
          serviceWhatsapp: form.serviceWhatsapp.trim() || null,
          serviceArea: form.serviceArea.trim(),
          costType: form.costType,
          operatingHours: form.operatingHours.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readResponseMessage(
            response,
            "Pengajuan belum berhasil dikirim.",
          ),
        );
      }

      const payload: unknown = await response.json();
      const result = parseSubmissionResult(payload);

      setNotice(
        `Pengajuan berhasil dikirim. Organisasi dan layanan berstatus menunggu verifikasi. ID pengajuan: ${result.organization.id}`,
      );
      setForm({ ...EMPTY_FORM });
      await loadOrganizations();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Pengajuan belum berhasil dikirim.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-[#f7f9fd] to-white text-[#142653]">
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/siaga"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Organisasi & layanan
          </Link>

        </div>

        {mode === "registration" && (
        <header className="relative isolate mt-5 overflow-hidden rounded-4xl bg-linear-to-br from-sky-700 via-[#0369a1] to-indigo-800 p-5 text-white shadow-[0_20px_55px_rgba(3,105,161,0.22)] sm:p-8 lg:p-9">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-white/10 bg-white/5"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 right-1/4 h-48 w-48 rounded-full bg-cyan-300/10 blur-2xl"
          />
          <div className="relative z-10 flex items-start gap-4 sm:gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner backdrop-blur sm:h-16 sm:w-16">
              <Store className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-100 sm:text-sm">
                Portal Penyedia HelpMe Siaga
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                Daftarkan layanan Siaga
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-sky-50/90 sm:text-base">
                Ajukan organisasi dan layanan untuk ditinjau admin. Pengajuan baru tidak langsung tampil di direktori publik.
              </p>
            </div>
          </div>
        </header>
        )}

        {mode === "registration" && (
        <section
          className="mt-6 rounded-2xl border border-sky-100/80 bg-white p-4 shadow-sm sm:p-5"
          aria-label="Informasi verifikasi"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1 text-sm leading-5 text-slate-600">
              <p className="font-bold">Bagaimana proses verifikasi?</p>
              <p className="mt-1 text-[11.5px] leading-4">
                Dokumen tidak wajib saat pengajuan awal. Admin akan memeriksa
                organisasi dan sumber informasi yang kredibel. Organisasi
                harus terverifikasi dan layanannya disetujui serta diaktifkan
                sebelum dapat muncul di direktori Siaga.
              </p>
            </div>
          </div>
        </section>
        )}

{mode === "profile" && (
        <section className="mt-0" aria-labelledby="organizations-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                id="organizations-heading"
                className="text-[14px] font-semibold tracking-tight"
              >
                {mode === "profile" ? "" : "Pengajuan saya"}
              </h2>
              <p className="mt-0.5 text-[11.5px] text-slate-500">
                {mode === "profile"
                  ? ""
                  : "Pantau status organisasi dan layanan yang pernah Anda ajukan."}
              </p>
            </div>
          </div>

          {pageError ? (
            <div
              className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
              role="status"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold">Daftar pengajuan belum tersedia</p>
                <p className="mt-1 leading-6">{pageError}</p>
              </div>
            </div>
          ) : null}

          {loadingOrganizations ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Memuat pengajuan Anda...
            </div>
          ) : null}

          {!loadingOrganizations && !pageError && organizations.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <Store className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="mt-3 font-bold text-slate-800">
                Belum ada pengajuan
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Isi formulir di bawah untuk mendaftarkan organisasi dan layanan pertama Anda.
              </p>
            </div>
          ) : null}

          <div className="mt-4 grid gap-4">
            {organizations.map((organization) => (
              <article
                key={organization.id}
                className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition hover:border-sky-200 sm:p-6"
              >
                <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
                  <div className="relative h-44 overflow-hidden bg-linear-to-br from-sky-800 via-sky-900 to-indigo-950 sm:h-60">
                    {organization.coverImageUrl ? (
                      <Image
                        src={organization.coverImageUrl}
                        alt=""
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, 1200px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-sky-800 via-sky-900 to-indigo-950">
                        <Store className="h-20 w-20 text-white/15 sm:h-28 sm:w-28" aria-hidden="true" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/10 to-slate-950/15" />
                    <input
                      id={`org-cover-${organization.id}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      aria-label={`Unggah foto sampul ${organization.organizationName}`}
                      disabled={uploadingMediaKey !== null}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";
                        if (file) void uploadOrganizationMedia(organization.id, "cover", file);
                      }}
                    />
                    <label
                      htmlFor={`org-cover-${organization.id}`}
                      className={`absolute right-4 top-4 inline-flex min-h-0 cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-slate-950/35 px-1.5 py-1.5 text-[10px] font-bold text-white shadow-lg backdrop-blur transition hover:bg-slate-950/55 focus-within:ring-2 focus-within:ring-white ${uploadingMediaKey !== null ? "pointer-events-none opacity-60" : ""}`}
                    >
                      <Camera className="h-4 w-4" aria-hidden="true" />
                      {uploadingMediaKey === `${organization.id}:cover` ? "Mengunggah..." : ""}
                    </label>
                  </div>

                  <div className="relative flex flex-col gap-4 border-b border-slate-100 px-4 pb-5 sm:flex-row sm:items-center sm:px-7 sm:pb-6">
                    <div className="relative -mt-11 h-24 w-24 shrink-0 rounded-2xl border-4 border-white bg-white shadow-lg sm:-mt-14 sm:h-28 sm:w-28">
                      <div className="relative h-full w-full overflow-hidden rounded-xl bg-sky-50">
                        {organization.profileImageUrl ? (
                          <Image
                            src={organization.profileImageUrl}
                            alt={`Foto profil ${organization.organizationName}`}
                            fill
                            unoptimized
                            sizes="112px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-sky-50 to-indigo-100 text-sky-800">
                            <Store className="h-10 w-10 sm:h-12 sm:w-12" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <input
                        id={`org-profile-${organization.id}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        aria-label={`Unggah foto profil ${organization.organizationName}`}
                        disabled={uploadingMediaKey !== null}
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];
                          event.currentTarget.value = "";
                          if (file) void uploadOrganizationMedia(organization.id, "profile", file);
                        }}
                      />
                      <label
                        htmlFor={`org-profile-${organization.id}`}
                        title="Ubah foto profil organisasi"
                        className={`absolute -bottom-2 -right-2 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-sky-700 text-white shadow-md transition hover:bg-sky-800 ${uploadingMediaKey !== null ? "pointer-events-none opacity-60" : ""}`}
                      >
                        <Camera className="h-4 w-4" aria-hidden="true" />
                      </label>
                    </div>

                    <div className="min-w-0 flex-1 pt-1 sm:pt-3">
                      <h3 className="wrap-break-word text-[14px] font-black tracking-tight text-slate-950 sm:text-2xl">
                        {organization.organizationName}
                      </h3>
                      <p className="mt-1 text-[12px] font-semibold text-slate-700">
                        {ORGANIZATION_TYPE_LABELS.find(([value]) => value === organization.organizationType)?.[1] ?? organization.organizationType}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-700">
                        {[organization.district, organization.city, organization.province].filter(Boolean).join(", ") || "Lokasi belum dilengkapi"}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-700">Terdaftar sejak {formatDate(organization.createdAt)}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3" aria-label="Ringkasan penyedia">
                        <div className="inline-flex min-w-0 items-center gap-1.5">
                          <Store className="h-3 w-3 shrink-0 text-sky-600" aria-hidden="true" />
                          <span className="text-[10px] font-black leading-tight text-slate-950">{organizations.length}</span>
                          <span className="text-[9px] font-semibold text-slate-500">Organisasi Saya |</span>
                        </div>
                        <div className="inline-flex min-w-0 items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" aria-hidden="true" />
                          <span className="text-[10px] font-black leading-tight text-slate-950">{organizations.reduce((total, item) => total + item.services.filter((service) => service.isActive).length, 0)}</span>
                          <span className="text-[9px] font-semibold text-slate-500">Layanan Aktif |</span>
                        </div>
                        <div className="inline-flex min-w-0 items-center gap-1.5">
                          <Clock3 className="h-3 w-3 shrink-0 text-amber-600" aria-hidden="true" />
                          <span className="text-[10px] font-black leading-tight text-amber-700">{organizations.filter((item) => item.verificationStatus === "PENDING").length + organizations.reduce((total, item) => total + item.services.filter((service) => service.reviewStatus === "PENDING").length, 0)}</span>
                          <span className="text-[9px] font-semibold text-slate-500">Review |</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <span className={`inline-flex min-h-0 items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold ${organization.verificationStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200" : organization.verificationStatus === "REJECTED" || organization.verificationStatus === "SUSPENDED" ? "bg-rose-50 text-rose-800 ring-1 ring-rose-200" : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"}`}>
                        {organization.verificationStatus === "VERIFIED" ? (
                          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Clock3 className="h-4 w-4" aria-hidden="true" />
                        )}
                        {statusLabel(organization.verificationStatus, ORGANIZATION_STATUS)}
                      </span>
                      {organization.verificationStatus !== "SUSPENDED" ? (
                        <button
                          type="button"
                          disabled={savingOrganizationId !== null || savingServiceId !== null || updatingServiceId !== null}
                          onClick={() => {
                            setOrganizationEditId(organizationEditId === organization.id ? null : organization.id);
                            setOrganizationForm({
                              organizationName: organization.organizationName,
                              organizationType: organization.organizationType,
                              registrationIdentifier: organization.registrationIdentifier,
                              description: organization.description,
                              officialPhone: organization.officialPhone,
                              officialWhatsapp: organization.officialWhatsapp,
                              contactEmail: organization.contactEmail,
                              websiteUrl: organization.websiteUrl,
                              publicAddress: organization.publicAddress,
                              district: organization.district,
                              city: organization.city,
                              province: organization.province,
                              coverageDescription: organization.coverageDescription,
                              latitude: organization.latitude === null ? "" : String(organization.latitude),
                              longitude: organization.longitude === null ? "" : String(organization.longitude),
                              coordinatesPublic: organization.coordinatesPublic,
                            });
                            setPageError("");
                            setNotice("");
                          }}
                          className="inline-flex min-h-0 items-center justify-center gap-2 rounded-xl bg-sky-700 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Pencil className="h-3 w-3" aria-hidden="true" />
                          {organizationEditId === organization.id ? "Tutup Editor" : "Ubah Profil"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <nav
                  className="flex gap-6 border-b border-slate-100 px-4 sm:px-7"
                  role="tablist"
                  aria-label={`Bagian ${organization.organizationName}`}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={(organizationTabs[organization.id] ?? "about") === "about"}
                    aria-controls={`organization-panel-${organization.id}`}
                    onClick={() =>
                      setOrganizationTabs((current) => ({
                        ...current,
                        [organization.id]: "about",
                      }))
                    }
                    className={`relative min-h-8 border-b-2 px-1 text-sm font-bold transition ${
                      (organizationTabs[organization.id] ?? "about") === "about"
                        ? "border-sky-600 text-sky-700"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Tentang
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={(organizationTabs[organization.id] ?? "about") === "services"}
                    aria-controls={`organization-panel-${organization.id}`}
                    onClick={() =>
                      setOrganizationTabs((current) => ({
                        ...current,
                        [organization.id]: "services",
                      }))
                    }
                    className={`relative min-h-8 border-b-2 px-1 text-sm font-bold transition ${
                      (organizationTabs[organization.id] ?? "about") === "services"
                        ? "border-sky-600 text-sky-700"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Layanan
                  </button>
                </nav>

                {(organizationTabs[organization.id] ?? "about") === "about" && (
                  <div
                    id={`organization-panel-${organization.id}`}
                    role="tabpanel"
                    aria-label="Tentang organisasi"
                    className="mt-5 grid gap-4 lg:grid-cols-12"
                  >
                  <div className="space-y-4 lg:col-span-7">
                    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5" aria-label="Tentang organisasi">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700"><Building2 className="h-4 w-4" aria-hidden="true" /></span>
                        <div>
                          <h4 className="-ml-1 text-[13px] font-black tracking-tight text-slate-900">Tentang organisasi</h4>
                        </div>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-[11px] leading-4 text-slate-600">
                        {organization.description || "Deskripsi organisasi belum dilengkapi."}
                      </p>
                      <div className="mt-2 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold tracking-wide text-black/80">Jenis organisasi</p>
                          <p className="mt-1 wrap-break-word text-[11px] text-slate-800">
                            {ORGANIZATION_TYPE_LABELS.find(([value]) => value === organization.organizationType)?.[1] ?? organization.organizationType}
                          </p>
                        </div>
                        {organization.registrationIdentifier ? (
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold tracking-wide text-black/80">Nomor registrasi</p>
                            <p className="mt-1 wrap-break-word text-[11px] text-slate-800">{organization.registrationIdentifier}</p>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5" aria-label="Informasi kontak organisasi">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700"><Phone className="h-4 w-4" aria-hidden="true" /></span>
                        <div>
                          <h4 className="-ml-1 text-[13px] font-black tracking-tight text-slate-900">Informasi kontak</h4>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {organization.officialPhone ? (
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold tracking-wide text-black/80">Telepon resmi</p>
                            <a href={`tel:${organization.officialPhone}`} className="mt-1 block wrap-break-word text-[11px] text-slate-800 hover:text-sky-700">{organization.officialPhone}</a>
                          </div>
                        ) : null}
                        {organization.officialWhatsapp ? (
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold tracking-wide text-black/800">WhatsApp resmi</p>
                            <p className="mt-1 wrap-break-word text-[11px] text-slate-800">{organization.officialWhatsapp}</p>
                          </div>
                        ) : null}
                        {organization.contactEmail ? (
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold tracking-wide text-black/80">Email kontak</p>
                            <a href={`mailto:${organization.contactEmail}`} className="mt-1 block wrap-break-word text-[11px] text-slate-800 hover:text-sky-700">{organization.contactEmail}</a>
                          </div>
                        ) : null}
                        {organization.websiteUrl ? (
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold tracking-wide text-black/80">Situs web</p>
                            <a href={organization.websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-[11px] font-semibold text-sky-700 hover:underline">{organization.websiteUrl}</a>
                          </div>
                        ) : null}
                        {!organization.officialPhone && !organization.officialWhatsapp && !organization.contactEmail && !organization.websiteUrl ? (
                          <p className="text-[11px] text-slate-500 sm:col-span-2">Informasi kontak belum dilengkapi.</p>
                        ) : null}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-3 lg:col-span-5">
                    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5" aria-label="Alamat dan lokasi organisasi">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700"><MapPin className="h-4 w-4" aria-hidden="true" /></span>
                        <div>
                          <h4 className="-ml-1 text-[13px] font-black tracking-tight text-slate-900">Alamat & lokasi</h4>
                        </div>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div>
                          <p className="text-[12px] font-bold tracking-wide text-black/80">Alamat publik</p>
                          <p className="mt-1 whitespace-pre-wrap text-[11px] leading-3.5 text-slate-800">{organization.publicAddress || "Alamat publik belum dilengkapi."}
                          </p>
                        </div>
                        <div className="border-t border-slate-100 pt-2">
                          <p className="text-[12px] font-bold tracking-wide text-black/80">Cakupan wilayah</p>
                          <p className="mt-1 whitespace-pre-wrap text-[11px] leading-3 text-slate-800">{organization.coverageDescription || "Cakupan wilayah belum dilengkapi."}</p>
                        </div>
                        {organization.coordinatesPublic && organization.latitude !== null && organization.longitude !== null ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${organization.latitude},${organization.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-5 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-2 py-1.5 text-[10px] font-bold text-sky-800 transition hover:bg-sky-100"
                          >
                            Lihat lokasi di peta
                          </a>
                        ) : (
                          <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-4 text-slate-500">
                            {organization.coordinatesPublic ? "Koordinat publik belum tersedia." : "Koordinat tidak dipublikasikan."}
                          </p>
                        )}
                      </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200/80 bg-linear-to-br from-white to-sky-50/70 p-4 shadow-sm sm:p-5" aria-label="Informasi publikasi layanan">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-100 bg-white text-sky-700"><Globe className="h-4 w-4" aria-hidden="true" /></span>
                        <div>
                          <h4 className="-ml-1 text-[13px] font-black tracking-tight text-slate-900">Publikasi di Siaga</h4>
                        </div>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-slate-800">
                        Organisasi harus terverifikasi, lalu layanan perlu disetujui admin dan diaktifkan sebelum memenuhi syarat utama untuk ditampilkan di direktori Siaga.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-200">
                          {organization.services.length} layanan terdaftar
                        </span>
                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 ring-1 ring-slate-200">
                          {organization.services.filter((service) => service.reviewStatus === "PENDING").length} menunggu review
                        </span>
                      </div>
                    </section>
                  </div>
                  </div>
                )}

                {mode === "profile" &&
                  organizationEditId === organization.id &&
                  (organizationTabs[organization.id] ?? "about") === "about" ? (
                  <form
                    onSubmit={(event) =>
                      void submitOrganizationEdit(event, organization.id)
                    }
                    className="mt-4 space-y-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4"
                  >
                    <h4 className="font-bold text-slate-900">
                      Edit profil organisasi
                    </h4>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Nama organisasi
                        <input
                          required
                          maxLength={200}
                          value={organizationForm.organizationName}
                          onChange={(event) =>
                            setOrganizationForm((current) => ({
                              ...current,
                              organizationName: event.target.value,
                            }))
                          }
                          className={inputClassName}
                        />
                      </label>

                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Jenis organisasi
                        <select
                          required
                          value={organizationForm.organizationType}
                          onChange={(event) =>
                            setOrganizationForm((current) => ({
                              ...current,
                              organizationType: event.target.value,
                            }))
                          }
                          className={inputClassName}
                        >
                          {LEGACY_ORGANIZATION_TYPES.map(([value, label]) =>
                            value === organizationForm.organizationType ? (
                              <option key={value} value={value}>
                                {label} (jenis lama)
                              </option>
                            ) : null,
                          )}
                          {ORGANIZATION_TYPES.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block space-y-1 text-sm font-medium text-slate-700">
                      Nomor registrasi (opsional)
                      <input
                        maxLength={200}
                        value={organizationForm.registrationIdentifier}
                        onChange={(event) =>
                          setOrganizationForm((current) => ({
                            ...current,
                            registrationIdentifier: event.target.value,
                          }))
                        }
                        className={inputClassName}
                      />
                    </label>

                    <label className="block space-y-1 text-sm font-medium text-slate-700">
                      Deskripsi organisasi
                      <textarea
                        required
                        maxLength={4000}
                        rows={3}
                        value={organizationForm.description}
                        onChange={(event) =>
                          setOrganizationForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        className={inputClassName}
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Telepon resmi
                        <input
                          maxLength={80}
                          value={organizationForm.officialPhone}
                          onChange={(event) =>
                            setOrganizationForm((current) => ({
                              ...current,
                              officialPhone: event.target.value,
                            }))
                          }
                          className={inputClassName}
                        />
                      </label>
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        WhatsApp resmi
                        <input
                          maxLength={80}
                          value={organizationForm.officialWhatsapp}
                          onChange={(event) =>
                            setOrganizationForm((current) => ({
                              ...current,
                              officialWhatsapp: event.target.value,
                            }))
                          }
                          className={inputClassName}
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Email kontak
                        <input
                          type="email"
                          maxLength={254}
                          value={organizationForm.contactEmail}
                          onChange={(event) =>
                            setOrganizationForm((current) => ({
                              ...current,
                              contactEmail: event.target.value,
                            }))
                          }
                          className={inputClassName}
                        />
                      </label>
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Situs web
                        <input
                          type="url"
                          maxLength={500}
                          placeholder="https://..."
                          value={organizationForm.websiteUrl}
                          onChange={(event) =>
                            setOrganizationForm((current) => ({
                              ...current,
                              websiteUrl: event.target.value,
                            }))
                          }
                          className={inputClassName}
                        />
                      </label>
                    </div>

                    <label className="block space-y-1 text-sm font-medium text-slate-700">
                      Alamat publik
                      <input
                        maxLength={500}
                        value={organizationForm.publicAddress}
                        onChange={(event) =>
                          setOrganizationForm((current) => ({
                            ...current,
                            publicAddress: event.target.value,
                          }))
                        }
                        className={inputClassName}
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Kecamatan
                        <input
                          maxLength={120}
                          value={organizationForm.district}
                          onChange={(event) =>
                            setOrganizationForm((current) => ({
                              ...current,
                              district: event.target.value,
                            }))
                          }
                          className={inputClassName}
                        />
                      </label>
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Kota
                        <input
                          maxLength={100}
                          value={organizationForm.city}
                          onChange={(event) =>
                            setOrganizationForm((current) => ({
                              ...current,
                              city: event.target.value,
                            }))
                          }
                          className={inputClassName}
                        />
                      </label>
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Provinsi
                        <input
                          maxLength={100}
                          value={organizationForm.province}
                          onChange={(event) =>
                            setOrganizationForm((current) => ({
                              ...current,
                              province: event.target.value,
                            }))
                          }
                          className={inputClassName}
                        />
                      </label>
                    </div>

                    <label className="block space-y-1 text-sm font-medium text-slate-700">
                      Cakupan wilayah layanan
                      <textarea
                        required
                        maxLength={1000}
                        rows={2}
                        value={organizationForm.coverageDescription}
                        onChange={(event) =>
                          setOrganizationForm((current) => ({
                            ...current,
                            coverageDescription: event.target.value,
                          }))
                        }
                        className={inputClassName}
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Latitude
                        <input
                          type="number"
                          step="any"
                          min="-90"
                          max="90"
                          value={organizationForm.latitude}
                          onChange={(event) =>
                            setOrganizationForm((current) => ({
                              ...current,
                              latitude: event.target.value,
                            }))
                          }
                          className={inputClassName}
                        />
                      </label>
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Longitude
                        <input
                          type="number"
                          step="any"
                          min="-180"
                          max="180"
                          value={organizationForm.longitude}
                          onChange={(event) =>
                            setOrganizationForm((current) => ({
                              ...current,
                              longitude: event.target.value,
                            }))
                          }
                          className={inputClassName}
                        />
                      </label>
                    </div>

                    <label className="flex items-start gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={organizationForm.coordinatesPublic}
                        onChange={(event) =>
                          setOrganizationForm((current) => ({
                            ...current,
                            coordinatesPublic: event.target.checked,
                          }))
                        }
                        disabled={
                          !organizationForm.latitude.trim() ||
                          !organizationForm.longitude.trim()
                        }
                        className="mt-1"
                      />
                      <span>
                        Publikasikan koordinat organisasi pada direktori dan peta publik.
                        Pilihan ini harus diaktifkan secara eksplisit.
                      </span>
                    </label>

                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        disabled={savingOrganizationId !== null}
                        onClick={() => setOrganizationEditId(null)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={
                          savingOrganizationId !== null ||
                          savingServiceId !== null ||
                          updatingServiceId !== null
                        }
                        className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {savingOrganizationId === organization.id
                          ? "Menyimpan..."
                          : "Simpan profil"}
                      </button>
                    </div>

                    <p className="text-xs leading-5 text-amber-800">
                      Menyimpan profil akan mengembalikan organisasi ke status
                      menunggu verifikasi dan menonaktifkan layanan yang sebelumnya aktif.
                    </p>
                  </form>
                ) : null}

                {(organizationTabs[organization.id] ?? "about") === "services" && (
                  <div
                    id={`organization-panel-${organization.id}`}
                    role="tabpanel"
                    aria-label="Layanan"
                  >
                {mode === "profile" &&
                  ["PENDING", "VERIFIED"].includes(organization.verificationStatus) && (
                    <div className="mt-5">
                      <button
                        type="button"
                        disabled={creatingServiceOrganizationId !== null}
                        onClick={() => {
                          setNewServiceOrganizationId(
                            newServiceOrganizationId === organization.id ? null : organization.id,
                          );
                          setNewServiceForm({ ...EMPTY_SERVICE_EDIT_FORM });
                          setPageError("");
                          setNotice("");
                        }}
                        className="inline-flex min-h-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-2 py-2 text-[12px] font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50"
                      >
                        <Store className="h-3.5 w-3.5" aria-hidden="true" />
                        {newServiceOrganizationId === organization.id
                          ? "Tutup formulir layanan"
                          : "+ Daftarkan layanan"}
                      </button>
                    </div>
                  )}

                {mode === "profile" && newServiceOrganizationId === organization.id && (
                  <form
                    onSubmit={(event) => void submitNewService(event, organization.id)}
                    className="mt-4 space-y-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">Daftarkan layanan baru</h4>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        Layanan baru akan menunggu persetujuan admin dan tidak langsung aktif.
                      </p>
                    </div>

                    <label className="block space-y-1 text-sm font-medium text-slate-700">
                      Nama layanan
                      <input
                        required
                        maxLength={200}
                        value={newServiceForm.serviceName}
                        onChange={(event) => setNewServiceForm((current) => ({
                          ...current,
                          serviceName: event.target.value,
                        }))}
                        className={inputClassName}
                      />
                    </label>

                    <label className="block space-y-1 text-sm font-medium text-slate-700">
                      Kategori layanan
                      <select
                        required
                        value={newServiceForm.serviceCategory}
                        onChange={(event) => setNewServiceForm((current) => ({
                          ...current,
                          serviceCategory: event.target.value,
                        }))}
                        className={inputClassName}
                      >
                        {SERVICE_CATEGORIES.map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block space-y-1 text-sm font-medium text-slate-700">
                      Deskripsi layanan
                      <textarea
                        required
                        maxLength={4000}
                        rows={3}
                        value={newServiceForm.serviceDescription}
                        onChange={(event) => setNewServiceForm((current) => ({
                          ...current,
                          serviceDescription: event.target.value,
                        }))}
                        className={inputClassName}
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Telepon layanan
                        <input
                          maxLength={80}
                          value={newServiceForm.servicePhone}
                          onChange={(event) => setNewServiceForm((current) => ({
                            ...current,
                            servicePhone: event.target.value,
                          }))}
                          className={inputClassName}
                        />
                      </label>
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        WhatsApp layanan
                        <input
                          maxLength={80}
                          value={newServiceForm.serviceWhatsapp}
                          onChange={(event) => setNewServiceForm((current) => ({
                            ...current,
                            serviceWhatsapp: event.target.value,
                          }))}
                          className={inputClassName}
                        />
                      </label>
                    </div>

                    <label className="block space-y-1 text-sm font-medium text-slate-700">
                      Wilayah layanan
                      <input
                        required
                        maxLength={500}
                        value={newServiceForm.serviceArea}
                        onChange={(event) => setNewServiceForm((current) => ({
                          ...current,
                          serviceArea: event.target.value,
                        }))}
                        className={inputClassName}
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Jenis biaya
                        <select
                          required
                          value={newServiceForm.costType}
                          onChange={(event) => setNewServiceForm((current) => ({
                            ...current,
                            costType: event.target.value,
                          }))}
                          className={inputClassName}
                        >
                          {COST_TYPES.map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block space-y-1 text-sm font-medium text-slate-700">
                        Jam operasional
                        <input
                          maxLength={500}
                          value={newServiceForm.operatingHours}
                          onChange={(event) => setNewServiceForm((current) => ({
                            ...current,
                            operatingHours: event.target.value,
                          }))}
                          className={inputClassName}
                        />
                      </label>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={creatingServiceOrganizationId !== null}
                        onClick={() => setNewServiceOrganizationId(null)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={creatingServiceOrganizationId !== null}
                        className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                      >
                        {creatingServiceOrganizationId === organization.id
                          ? "Mengirim..."
                          : "Kirim untuk review"}
                      </button>
                    </div>
                  </form>
                )}

                {organization.services.length > 0 ? (
                  <div className="mt-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-[13px] font-black tracking-tight text-slate-900">
                          Layanan & aktivasi
                        </h4>
                        <p className="mt-1 text-[11px] leading-3 text-slate-500">
                          Kelola layanan, status persetujuan, dan atur aktivasi.
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                        {organization.services.length} layanan
                      </span>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {organization.services.map((service) => (
                        <div
                          key={service.id}
                          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-sky-200"
                        >
                          <p className="text-[12px] font-semibold text-slate-900">
                            {service.name}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {service.category.replaceAll("_", " ")}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                              {statusLabel(service.reviewStatus, SERVICE_STATUS)}
                            </span>
                            <span
                              className={
                                service.isActive
                                  ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                                  : "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
                              }
                            >
                              {service.isActive ? "Aktif" : "Belum aktif"}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {mode === "profile" && (organization.verificationStatus === "PENDING" ||
                              organization.verificationStatus === "VERIFIED") && (
                              <button
                                type="button"
                                disabled={savingServiceId !== null || updatingServiceId !== null}
                                onClick={() => {
                                  setServiceEditId(
                                    serviceEditId === service.id ? null : service.id,
                                  );
                                  setServiceForm({
                                    serviceName: service.name,
                                    serviceCategory: service.category,
                                    serviceDescription: service.description,
                                    servicePhone: service.publicPhone,
                                    serviceWhatsapp: service.publicWhatsapp,
                                    serviceArea: service.serviceArea,
                                    costType: service.costType,
                                    operatingHours: service.operatingHours,
                                  });
                                  setPageError("");
                                  setNotice("");
                                }}
                                className="rounded-[11px] border border-slate-300 bg-white px-2 py-1 text-[12px] font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
                              >
                                {serviceEditId === service.id ? "Tutup edit" : "Edit layanan"}
                              </button>
                            )}

                            {mode === "profile" && (service.isActive ||
                              (organization.verificationStatus === "VERIFIED" &&
                                service.reviewStatus === "APPROVED")) && (
                              <button
                                type="button"
                                disabled={savingServiceId !== null || updatingServiceId !== null}
                                onClick={() =>
                                  void handleServiceActivation(
                                    service.id,
                                    !service.isActive,
                                  )
                                }
                                className="rounded-[11px] bg-blue-700 px-2 py-1 text-[12px] font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                              >
                                {updatingServiceId === service.id ? (
                                  <LoaderCircle className="inline h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : null}
                                {service.isActive ? "Nonaktifkan layanan" : "Aktifkan layanan"}
                              </button>
                            )}
                          </div>

                          {mode === "profile" && serviceEditId === service.id && (
                            <form
                              onSubmit={(event) => void submitServiceEdit(event, service.id)}
                              className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-4"
                            >
                              <h5 className="font-bold text-slate-900">Edit profil layanan</h5>

                              <label className="block space-y-1 text-sm font-medium text-slate-700">
                                Nama layanan
                                <input
                                  required
                                  maxLength={200}
                                  value={serviceForm.serviceName}
                                  onChange={(event) => setServiceForm((current) => ({
                                    ...current,
                                    serviceName: event.target.value,
                                  }))}
                                  className={inputClassName}
                                />
                              </label>

                              <label className="block space-y-1 text-sm font-medium text-slate-700">
                                Kategori
                                <select
                                  required
                                  value={serviceForm.serviceCategory}
                                  onChange={(event) => setServiceForm((current) => ({
                                    ...current,
                                    serviceCategory: event.target.value,
                                  }))}
                                  className={inputClassName}
                                >
                                  {SERVICE_CATEGORIES.map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                  ))}
                                </select>
                              </label>

                              <label className="block space-y-1 text-sm font-medium text-slate-700">
                                Deskripsi
                                <textarea
                                  required
                                  maxLength={4000}
                                  rows={3}
                                  value={serviceForm.serviceDescription}
                                  onChange={(event) => setServiceForm((current) => ({
                                    ...current,
                                    serviceDescription: event.target.value,
                                  }))}
                                  className={inputClassName}
                                />
                              </label>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <label className="block space-y-1 text-sm font-medium text-slate-700">
                                  Telepon layanan
                                  <input
                                    maxLength={80}
                                    value={serviceForm.servicePhone}
                                    onChange={(event) => setServiceForm((current) => ({
                                      ...current,
                                      servicePhone: event.target.value,
                                    }))}
                                    className={inputClassName}
                                  />
                                </label>
                                <label className="block space-y-1 text-sm font-medium text-slate-700">
                                  WhatsApp layanan
                                  <input
                                    maxLength={80}
                                    value={serviceForm.serviceWhatsapp}
                                    onChange={(event) => setServiceForm((current) => ({
                                      ...current,
                                      serviceWhatsapp: event.target.value,
                                    }))}
                                    className={inputClassName}
                                  />
                                </label>
                              </div>

                              <label className="block space-y-1 text-sm font-medium text-slate-700">
                                Wilayah layanan
                                <input
                                  required
                                  maxLength={500}
                                  value={serviceForm.serviceArea}
                                  onChange={(event) => setServiceForm((current) => ({
                                    ...current,
                                    serviceArea: event.target.value,
                                  }))}
                                  className={inputClassName}
                                />
                              </label>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <label className="block space-y-1 text-sm font-medium text-slate-700">
                                  Jenis biaya
                                  <select
                                    required
                                    value={serviceForm.costType}
                                    onChange={(event) => setServiceForm((current) => ({
                                      ...current,
                                      costType: event.target.value,
                                    }))}
                                    className={inputClassName}
                                  >
                                    {COST_TYPES.map(([value, label]) => (
                                      <option key={value} value={value}>{label}</option>
                                    ))}
                                  </select>
                                </label>
                                <label className="block space-y-1 text-sm font-medium text-slate-700">
                                  Jam operasional
                                  <input
                                    maxLength={500}
                                    value={serviceForm.operatingHours}
                                    onChange={(event) => setServiceForm((current) => ({
                                      ...current,
                                      operatingHours: event.target.value,
                                    }))}
                                    className={inputClassName}
                                  />
                                </label>
                              </div>

                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={savingServiceId !== null}
                                  onClick={() => setServiceEditId(null)}
                                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                                >
                                  Batal
                                </button>
                                <button
                                  type="submit"
                                  disabled={savingServiceId !== null || updatingServiceId !== null}
                                  className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                  {savingServiceId === service.id ? "Menyimpan..." : "Simpan perubahan"}
                                </button>
                              </div>

                              <p className="text-xs leading-5 text-amber-700">
                                Menyimpan perubahan akan mengirim layanan untuk ditinjau ulang dan menonaktifkannya sementara.
                              </p>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
        )}

        {mode === "registration" && (
        <section
          className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          aria-labelledby="provider-form-heading"
        >
          <div className="mb-6">
            <p className="text-sm font-bold text-blue-700">
              Pendaftaran penyedia
            </p>
            <h2
              id="provider-form-heading"
              className="mt-1 text-xl font-black tracking-tight sm:text-2xl"
            >
              Data organisasi dan layanan
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kolom bertanda bintang wajib diisi. Pastikan informasi dapat diperiksa oleh tim verifikasi.
            </p>
          </div>

          {notice ? (
            <div
              role="status"
              className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="leading-6">{notice}</p>
            </div>
          ) : null}

          {formError ? (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="leading-6">{formError}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8">
            <fieldset className="space-y-4">
              <legend className="mb-4 text-base font-bold text-slate-900">
                1. Informasi organisasi
              </legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <p className="text-xs leading-5 text-slate-500 sm:col-span-2">
                  Kecamatan, kota, dan provinsi mengikuti lokasi yang dipilih. Periksa atau koreksi jika diperlukan.
                </p>
                <Field label="Nama organisasi" required>
                  <input
                    className={inputClassName}
                    value={form.organizationName}
                    onChange={handleTextChange("organizationName")}
                    maxLength={200}
                    autoComplete="organization"
                    required
                    placeholder="Nama resmi organisasi"
                  />
                </Field>

                <Field label="Jenis organisasi" required>
                  <select
                    className={inputClassName}
                    value={form.organizationType}
                    onChange={handleTextChange("organizationType")}
                    required
                  >
                    {ORGANIZATION_TYPES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Nomor registrasi atau izin"
                  hint="Opsional pada tahap pengajuan."
                >
                  <input
                    className={inputClassName}
                    value={form.registrationIdentifier}
                    onChange={handleTextChange("registrationIdentifier")}
                    maxLength={150}
                    placeholder="Nomor registrasi atau izin"
                  />
                </Field>

                <Field label="Email kontak" >
                  <input
                    type="email"
                    className={inputClassName}
                    value={form.contactEmail}
                    onChange={handleTextChange("contactEmail")}
                    maxLength={320}
                    autoComplete="email"
                    placeholder="kontak@organisasi.id"
                  />
                </Field>

                <Field label="Telepon resmi" hint="Isi telepon atau WhatsApp resmi organisasi.">
                  <input
                    type="tel"
                    className={inputClassName}
                    value={form.officialPhone}
                    onChange={handleTextChange("officialPhone")}
                    maxLength={80}
                    autoComplete="tel"
                    placeholder="Nomor telepon"
                  />
                </Field>

                <Field label="WhatsApp resmi">
                  <input
                    type="tel"
                    className={inputClassName}
                    value={form.officialWhatsapp}
                    onChange={handleTextChange("officialWhatsapp")}
                    maxLength={80}
                    placeholder="Nomor WhatsApp"
                  />
                </Field>

                <Field label="Situs web resmi">
                  <input
                    type="url"
                    className={inputClassName}
                    value={form.websiteUrl}
                    onChange={handleTextChange("websiteUrl")}
                    maxLength={500}
                    placeholder="https://"
                  />
                </Field>

              <ProviderLocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                address={form.publicAddress}
                city={form.city}
                district={form.district}
                province={form.province}
                onConfirm={(location) => {
                  updateForm("latitude", location.latitude.toFixed(6));
                  updateForm("longitude", location.longitude.toFixed(6));
                  updateForm("publicAddress", location.address);
                  updateForm("district", location.district ?? "");
                  updateForm("city", location.city ?? "");
                  updateForm("province", location.province ?? "");
                  setNotice("Lokasi berhasil dikonfirmasi dan koordinat terisi otomatis.");
                }}
              />

                <Field label="Alamat publik" hint="Terisi otomatis dari peta. Tambahkan nomor bangunan, RT/RW, atau patokan bila perlu.">
                  <input
                    className={inputClassName}
                    value={form.publicAddress}
                    onChange={handleTextChange("publicAddress")}
                    maxLength={300}
                    placeholder="Alamat organisasi"
                  />
                </Field>


                <Field label="Kecamatan">
                  <input
                    className={inputClassName}
                    value={form.district}
                    onChange={handleTextChange("district")}
                    maxLength={100}
                    placeholder="Nama kecamatan"
                  />
                </Field>

                <Field label="Kota" required>
                  <input
                    className={inputClassName}
                    value={form.city}
                    onChange={handleTextChange("city")}
                    maxLength={100}
                    required
                    placeholder="Nama kota"
                  />
                </Field>

                <Field label="Provinsi" required>
                  <input
                    className={inputClassName}
                    value={form.province}
                    onChange={handleTextChange("province")}
                    maxLength={100}
                    required
                    placeholder="Nama provinsi"
                  />
                </Field>
              </div>

              <Field label="Deskripsi organisasi" required>
                <textarea
                  className={inputClassName}
                  value={form.description}
                  onChange={handleTextChange("description")}
                  rows={3}
                  maxLength={3000}
                  required
                  placeholder="Jelaskan organisasi dan layanan yang ditangani."
                />
              </Field>

              <Field
                label="Cakupan wilayah organisasi"
              >
                <textarea
                  className={inputClassName}
                  value={form.coverageDescription}
                  onChange={handleTextChange("coverageDescription")}
                  rows={2}
                  maxLength={500}
                  required
                  placeholder="Contoh: Surabaya Barat dan Surabaya Pusat."
                />
              </Field>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-blue-700"
                  checked={form.coordinatesPublic}
                  onChange={(event) =>
                    updateForm("coordinatesPublic", event.target.checked)
                  }
                />
                <span className="text-[12px] leading-4 text-slate-700">
                  <span className="font-semibold text-slate-900">
                    Izinkan koordinat tampil di direktori publik
                  </span>
                  <span className="mt-1 block text-[11.5px] text-slate-500">
                    Jika tidak dicentang, koordinat tidak dipublikasikan. Centang hanya jika organisasi menyetujui lokasi persis ditampilkan.
                  </span>
                </span>
              </label>
            </fieldset>

            <fieldset className="space-y-4 border-t border-slate-100 pt-4">
              <legend className="mb-4 text-base font-bold text-slate-900">
                2. Layanan yang diajukan
              </legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama layanan" required>
                  <input
                    className={inputClassName}
                    value={form.serviceName}
                    onChange={handleTextChange("serviceName")}
                    maxLength={200}
                    required
                    placeholder="Nama layanan"
                  />
                </Field>

                <Field label="Kategori layanan" required>
                  <select
                    className={inputClassName}
                    value={form.serviceCategory}
                    onChange={handleTextChange("serviceCategory")}
                    required
                  >
                    {SERVICE_CATEGORIES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Telepon layanan">
                  <input
                    type="tel"
                    className={inputClassName}
                    value={form.servicePhone}
                    onChange={handleTextChange("servicePhone")}
                    maxLength={80}
                    placeholder="Nomor kontak layanan"
                  />
                </Field>

                <Field label="WhatsApp layanan">
                  <input
                    type="tel"
                    className={inputClassName}
                    value={form.serviceWhatsapp}
                    onChange={handleTextChange("serviceWhatsapp")}
                    maxLength={80}
                    placeholder="Nomor WhatsApp layanan"
                  />
                </Field>

                <Field label="Jenis biaya" required>
                  <select
                    className={inputClassName}
                    value={form.costType}
                    onChange={handleTextChange("costType")}
                    required
                  >
                    {COST_TYPES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Jam operasional" hint="Opsional. Jangan mengisi perkiraan yang belum terkonfirmasi.">
                  <input
                    className={inputClassName}
                    value={form.operatingHours}
                    onChange={handleTextChange("operatingHours")}
                    maxLength={500}
                    placeholder="Contoh: Senin–Jumat, 08.00–16.00"
                  />
                </Field>
              </div>

              <Field label="Deskripsi layanan" required>
                <textarea
                  className={inputClassName}
                  value={form.serviceDescription}
                  onChange={handleTextChange("serviceDescription")}
                  rows={3}
                  maxLength={3000}
                  required
                  placeholder="Jelaskan jenis bantuan dan layanan yang diberikan."
                />
              </Field>

              <Field
                label="Area layanan"
                required
                hint="Jelaskan wilayah yang benar-benar dilayani."
              >
                <textarea
                  className={inputClassName}
                  value={form.serviceArea}
                  onChange={handleTextChange("serviceArea")}
                  rows={2}
                  maxLength={500}
                  required
                />
              </Field>
            </fieldset>

            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Setelah pengajuan terkirim, organisasi berstatus{" "}
              <strong>PENDING</strong> dan layanan berstatus{" "}
              <strong>PENDING serta nonaktif</strong>. Pengiriman formulir
              tidak menjamin layanan akan disetujui atau tersedia saat dibutuhkan.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#142653] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#20386d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Store className="h-4 w-4" aria-hidden="true" />
              )}
              {submitting ? "Mengirim pengajuan..." : "Kirim pengajuan"}
            </button>
          </form>
        </section>
        )}

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          HelpMe Siaga · Wilayah pilot Surabaya
        </p>
      </div>
    </main>
  );
}