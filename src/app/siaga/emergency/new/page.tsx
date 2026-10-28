"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CarFront,
  Check,
  ChevronDown,
  HeartPulse,
  LifeBuoy,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  LocateFixed,
  MapPin,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

type EmergencyCategory = "MEDICAL" | "ACCIDENT" | "SECURITY" | "OTHER";

interface SelectedLocation {
  address: string;
  latitude: number;
  longitude: number;
}

const PHONE_PATTERN = /^[+0-9][0-9 +()\-]{6,22}$/;

const ProviderLocationPicker = dynamic(
  () => import("@/features/siaga/components/provider-location-picker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Memuat peta lokasi...
      </div>
    ),
  },
);

export default function CreateEmergencyHelpPage() {
  const router = useRouter();

  const [category, setCategory] = useState<EmergencyCategory>("MEDICAL");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [landmark, setLandmark] = useState("");
  const [sharePhone, setSharePhone] = useState(false);
  const [phone, setPhone] = useState("");

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [pickerSeed, setPickerSeed] = useState({
    version: 0,
    latitude: "",
    longitude: "",
    address: "",
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function requestGpsLocation() {
    setFormError(null);
    setSelectedLocation(null);

    if (!navigator.geolocation) {
      setLocationMessage(
        "Browser tidak mendukung GPS. Cari alamat atau pilih titik langsung di peta.",
      );
      return;
    }

    setGpsLoading(true);
    setLocationMessage("Meminta lokasi GPS...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickerSeed((current) => ({
          version: current.version + 1,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
          address: "Titik GPS terdeteksi",
        }));
        setLocationMessage(
          "GPS terdeteksi. Periksa pin peta lalu konfirmasi lokasi.",
        );
        setGpsLoading(false);
      },
      (error) => {
        setLocationMessage(
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Pilih titik di peta atau cari alamat secara manual."
            : error.code === error.TIMEOUT
              ? "GPS kehabisan waktu. Coba lagi atau pilih titik di peta."
              : "GPS belum tersedia. Pilih titik di peta atau cari alamat manual.",
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanLandmark = landmark.trim();
    const cleanPhone = phone.trim();

    if (cleanTitle.length < 6 || cleanTitle.length > 120) {
      setFormError("Judul harus berisi 6–120 karakter.");
      return;
    }

    if (cleanDescription.length < 8 || cleanDescription.length > 1000) {
      setFormError("Deskripsi harus berisi 8–1.000 karakter.");
      return;
    }

    if (!selectedLocation) {
      setFormError(
        "Konfirmasikan lokasi terlebih dahulu. Jika pin atau alamat berubah, konfirmasi ulang sebelum mengirim.",
      );
      return;
    }

    if (cleanLandmark.length > 180) {
      setFormError("Patokan lokasi maksimal 180 karakter.");
      return;
    }

    if (sharePhone && !PHONE_PATTERN.test(cleanPhone)) {
      setFormError("Nomor telepon untuk dibagikan belum valid.");
      return;
    }

    setSubmitting(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        setFormError("Silakan login terlebih dahulu.");
        router.push("/login");
        return;
      }

      const locationName =
        selectedLocation.address.trim().length >= 2
          ? selectedLocation.address.trim()
          : "Titik koordinat terpilih";

      const { data, error } = await supabase.rpc(
        "create_emergency_help_request",
        {
          p_category: category,
          p_title: cleanTitle,
          p_description: cleanDescription,
          p_latitude: selectedLocation.latitude,
          p_longitude: selectedLocation.longitude,
          p_location_name: locationName,
          p_landmark: cleanLandmark || null,
          p_share_phone: sharePhone,
          p_contact_phone: sharePhone ? cleanPhone : null,
        },
      );

      if (error) {
        if (
          error.code === "PGRST202" ||
          error.message.toLowerCase().includes("could not find the function")
        ) {
          setFormError(
            "Fitur permintaan bantuan belum diaktifkan di database. Permintaan belum dikirim.",
          );
        } else if (error.code === "23505") {
          setFormError(
            "Kamu masih memiliki permintaan bantuan aktif. Buka permintaan tersebut atau tunggu sampai kedaluwarsa.",
          );
        } else {
          setFormError(
            "Permintaan belum berhasil dikirim. Periksa data lalu coba lagi.",
          );
        }
        return;
      }

      if (typeof data !== "string" || data.length === 0) {
        setFormError(
          "Server belum mengembalikan identitas permintaan. Status pengiriman belum dapat dipastikan.",
        );
        return;
      }

      router.push(`/siaga/emergency/${data}`);
    } catch {
      setFormError("Terjadi kendala saat mengirim permintaan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-rose-50 via-white to-rose-50 px-3 py-4 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/siaga"
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-rose-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </Link>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-100 bg-white px-3 py-2 text-xs font-extrabold text-rose-700 shadow-sm sm:text-sm">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            HelpMe Siaga
          </span>
        </header>

        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 sm:p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <p className="text-[11px] leading-4.25 text-amber-900 sm:text-sm sm:leading-5">
            Community Emergency melengkapi, bukan menggantikan layanan resmi.
            Jika ada ancaman nyawa atau keselamatan, hubungi 112, 119, atau 110
            sesuai kebutuhan.
          </p>
        </div>

        <section className="mt-5">
          <div
            aria-label="Tahapan permintaan bantuan"
            className="mt-5 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-1.5 px-1 sm:gap-2"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 sm:gap-2 sm:text-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">1</span>
              Kebutuhan
            </div>
            <div className="h-px bg-indigo-500" />
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 sm:gap-2 sm:text-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-indigo-300 bg-white text-[10px] text-indigo-600">2</span>
              Lokasi
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 sm:gap-2 sm:text-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px]">3</span>
              Kirim
            </div>
          </div>
        </section>

        <form
          onSubmit={(event) => void submitRequest(event)}
          className="mt-4 space-y-3 pb-2"
        >
          <section
            aria-labelledby="emergency-details-title"
            className="rounded-[22px] border border-rose-100 bg-white p-4 shadow-[0_5px_20px_rgba(225,29,72,0.04)] sm:p-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 id="emergency-details-title" className="text-sm font-semibold text-[#142653] sm:text-base">
                Detail kebutuhan bantuan
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="emergency-category" className="block text-xs font-bold text-[#142653]">
                  Kategori bantuan
                </label>
                <div className="relative mt-2">
                  <button
                    type="button"
                    id="emergency-category"
                    aria-haspopup="listbox"
                    aria-expanded={categoryOpen}
                    aria-controls="emergency-category-options"
                    onClick={() => setCategoryOpen((open) => !open)}
                    className={`flex min-h-11 w-full items-center gap-2.5 rounded-xl border bg-white px-3 text-left text-sm outline-none transition focus:ring-2 focus:ring-rose-100 ${
                      categoryOpen
                        ? "border-rose-500 ring-2 ring-rose-100"
                        : "border-slate-200 hover:border-rose-300"
                    }`}
                  >
                    {category === "MEDICAL" && <HeartPulse className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />}
                    {category === "ACCIDENT" && <CarFront className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />}
                    {category === "SECURITY" && <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />}
                    {category === "OTHER" && <LifeBuoy className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />}

                    <span className="flex-1 font-medium text-slate-800">
                      {category === "MEDICAL" && "Medis"}
                      {category === "ACCIDENT" && "Kecelakaan"}
                      {category === "SECURITY" && "Keamanan"}
                      {category === "OTHER" && "Bantuan lainnya"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {categoryOpen && (
                    <div
                      id="emergency-category-options"
                      role="listbox"
                      aria-label="Pilih kategori bantuan"
                      className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={category === "MEDICAL"}
                        onClick={() => {
                          setCategory("MEDICAL");
                          setCategoryOpen(false);
                        }}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition ${
                          category === "MEDICAL" ? "bg-rose-50 font-bold text-rose-700" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <HeartPulse className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                        <span className="flex-1">Medis</span>
                        {category === "MEDICAL" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </button>

                      <button
                        type="button"
                        role="option"
                        aria-selected={category === "ACCIDENT"}
                        onClick={() => {
                          setCategory("ACCIDENT");
                          setCategoryOpen(false);
                        }}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition ${
                          category === "ACCIDENT" ? "bg-rose-50 font-bold text-rose-700" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <CarFront className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                        <span className="flex-1">Kecelakaan</span>
                        {category === "ACCIDENT" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </button>

                      <button
                        type="button"
                        role="option"
                        aria-selected={category === "SECURITY"}
                        onClick={() => {
                          setCategory("SECURITY");
                          setCategoryOpen(false);
                        }}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition ${
                          category === "SECURITY" ? "bg-rose-50 font-bold text-rose-700" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                        <span className="flex-1">Keamanan</span>
                        {category === "SECURITY" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </button>

                      <button
                        type="button"
                        role="option"
                        aria-selected={category === "OTHER"}
                        onClick={() => {
                          setCategory("OTHER");
                          setCategoryOpen(false);
                        }}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition ${
                          category === "OTHER" ? "bg-rose-50 font-bold text-rose-700" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <LifeBuoy className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                        <span className="flex-1">Bantuan lainnya</span>
                        {category === "OTHER" && <Check className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="emergency-title" className="block text-xs font-bold text-[#142653]">
                  Judul singkat
                </label>
                <input
                  id="emergency-title"
                  required
                  minLength={6}
                  maxLength={120}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: Membutuhkan bantuan setelah kecelakaan"
                  className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                />
                <p className="mt-1 text-right text-[12px] text-slate-400">
                  {title.length}/120
                </p>
              </div>

              <div>
                <label htmlFor="emergency-description" className="block text-xs font-bold text-[#142653]">
                  Ceritakan kebutuhan bantuan
                </label>
                <textarea
                  id="emergency-description"
                  required
                  minLength={8}
                  maxLength={1000}
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Jelaskan apa yang terjadi dan bantuan apa yang dibutuhkan..."
                  className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-[12px] leading-4 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                />
                <p className="mt-1 text-right text-[10px] text-slate-400">
                  {description.length}/1.000
                </p>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="emergency-location-title"
            className="rounded-[22px] border border-rose-100 bg-white p-3 shadow-[0_5px_20px_rgba(225,29,72,0.04)] sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 id="emergency-location-title" className="text-sm font-semibold text-[#142653] sm:text-base">
                    Lokasi kejadian
                  </h2>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs sm:leading-5">
                    Ketuk <span className="font-bold text-rose-600">Lokasi Saya</span> untuk memakai GPS, atau cari alamat dan pilih titik langsung pada peta. Periksa titik sebelum mengonfirmasi.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={requestGpsLocation}
                disabled={gpsLoading || submitting}
                aria-label="Gunakan lokasi GPS saya"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-extrabold text-rose-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
              >
                {gpsLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LocateFixed className="h-4 w-4" aria-hidden="true" />
                )}
                {gpsLoading ? "Mencari lokasi..." : "Lokasi Saya"}
              </button>
            </div>

            {locationMessage && (
              <p
                role="status"
                className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"
              >
                {locationMessage}
              </p>
            )}

            <div className="mt-3 min-w-0 overflow-hidden rounded-xl">
              <ProviderLocationPicker
                key={pickerSeed.version}
                title=""
                mapHeight="h-56 sm:h-64"
                latitude={pickerSeed.latitude}
                longitude={pickerSeed.longitude}
                address={pickerSeed.address}
                city=""
                district=""
                province=""
                onLocationChange={() => setSelectedLocation(null)}
                onConfirm={(location) => {
                  setSelectedLocation({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    address: location.address.trim(),
                  });
                  setLocationMessage("Lokasi dikonfirmasi. Konfirmasikan kembali jika pin atau alamat diubah.");
                  setFormError(null);
                }}
              />
            </div>

            {selectedLocation && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-emerald-800">
                    Lokasi terkonfirmasi
                  </p>
                  <p className="mt-1 wrap-break-word text-xs leading-5 text-emerald-800">
                    {selectedLocation.address || "Titik koordinat terpilih"}
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-emerald-700">
                    Koordinat presisi tidak ditampilkan pada feed umum.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label htmlFor="emergency-landmark" className="block text-xs font-semibold text-[#142653]">
                Patokan lokasi (opsional)
              </label>
              <input
                id="emergency-landmark"
                maxLength={180}
                value={landmark}
                onChange={(event) => setLandmark(event.target.value)}
                placeholder="Dekat gerbang utama atau seberang minimarket"
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </section>

          <section className="rounded-[22px] border border-rose-100 bg-white p-4 shadow-[0_5px_20px_rgba(225,29,72,0.04)] sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <PhoneCall className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#142653]">
                  Privasi kontak
                </p>
                <label className="mt-2 flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={sharePhone}
                    onChange={(event) => setSharePhone(event.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-rose-600"
                  />
                  <span className="text-[12px] font-medium leading-4 text-slate-800">
                    Saya setuju membagikan nomor telepon kepada penolong
                  </span>
                </label>
                <p className="mt-1.5 text-[10px] leading-4 text-slate-500">
                  Opsional. Nomor tidak dibagikan jika kotak tidak dicentang.
                </p>

                {sharePhone && (
                  <div className="mt-3">
                    <label htmlFor="emergency-phone" className="block text-xs font-bold text-[#142653]">
                      Nomor telepon
                    </label>
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 transition focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100">
                      <PhoneCall className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                      <input
                        id="emergency-phone"
                        type="tel"
                        required
                        maxLength={24}
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="min-h-11 w-full border-0 bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800 sm:text-sm"
            >
              {formError}
            </p>
          )}

          <div className="rounded-2xl bg-white/90 p-1 shadow-[0_6px_24px_rgba(225,29,72,0.08)]">
            <button
              type="submit"
              disabled={submitting || gpsLoading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <MapPin className="h-5 w-5" aria-hidden="true" />
              )}
              {submitting ? "Mengirim permintaan..." : "Kirim permintaan bantuan"}
              {!submitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
            <p className="px-3 pb-2 pt-2 text-center text-[10px] leading-4 text-slate-500">
              Masa aktif permintaan adalah 3 jam. Permintaan baru dianggap berhasil
              setelah server mengonfirmasi penyimpanannya.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}