import SiagaEmergencyBanner from "@/components/siaga/SiagaEmergencyBanner";

import OfficialEmergencyCallsAccordion from "@/components/siaga/OfficialEmergencyCallsAccordion";

import SiagaProviderRegistrationBanner from "@/components/siaga/SiagaProviderRegistrationBanner";

import Link from "next/link";

import {
  Bot,
  ShieldAlert,
} from "lucide-react";

import SiagaHeader from "@/features/siaga/components/siaga-header";

import EmergencyActivityPortal from "@/features/siaga/components/emergency-activity-portal";

import SiagaDirectory from "@/features/siaga/components/siaga-directory";

export const metadata = {
  title: "HelpMe Siaga | Akses Layanan Darurat",
  description:
    "Akses cepat ke layanan darurat resmi dan informasi bantuan untuk wilayah pilot Surabaya.",
};

export default function SiagaPage() {
  return (
    <main className="min-h-screen bg-rose-50 text-[#142653]">
      <SiagaHeader />

      <div className="-mt-8 mx-auto max-w-5xl px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32 lg:px-8">
        <EmergencyActivityPortal />

        <section
          className="mb-3 sm:mb-4"
          aria-labelledby="siaga-emergency-notice-title"
        >
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-white p-3.5 shadow-[0_4px_14px_rgba(15,23,42,0.035)] sm:gap-4 sm:p-4">
            <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 sm:h-11 sm:w-11">
              <ShieldAlert
                className="h-4 w-4 sm:h-5 sm:w-5"
                aria-hidden="true"
              />
            </span>

            <div className="-mt-1 min-w-0 flex-1">
              <span className="inline-flex rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold tracking-wide text-rose-700 sm:text-[10px]">
                PENGGUNAAN DARURAT
              </span>

              <p className="mt-1 text-[10px] leading-3.5 text-slate-600 sm:text-sm sm:leading-4">
                Gunakan HelpMe Siaga saat ada keadaan darurat. Hubungi nomor
                darurat di bawah hanya untuk kejadian nyata yang membutuhkan
                penanganan - bukan untuk uji coba, lelucon, atau laporan palsu.
              </p>
            </div>
          </div>
        </section>

        <OfficialEmergencyCallsAccordion />

        <div className="mt-3 sm:mt-4">
          <SiagaEmergencyBanner />
        </div>

        <SiagaDirectory />

        <section
          className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 sm:p-5"
          aria-labelledby="siaga-guide-title"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm sm:h-14 sm:w-14">
              <Bot className="h-6 w-6 sm:h-8 sm:w-8" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                id="siaga-guide-title"
                className="text-[13px] font-black text-[#142653] sm:text-lg"
              >
                Bingung memilih bantuan?
              </h2>
              <p className="mt-1 text-[11.5px] leading-4 text-slate-600 sm:text-sm sm:leading-6">
                Cari penyedia berdasarkan nama atau kategori. Untuk keadaan yang
                mengancam nyawa, hubungi layanan darurat resmi di atas.
              </p>
            </div>
            <Link
              href="#layanan-darurat"
              aria-label="Lihat kembali layanan darurat resmi"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            ></Link>
          </div>
        </section>

        <SiagaProviderRegistrationBanner />
        <section
          id="panduan-keselamatan"
          className="mt-2 scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-3 sm:p-5"
          aria-labelledby="siaga-safety-title"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm sm:h-14 sm:w-14">
              <ShieldAlert
                className="h-6 w-6 sm:h-8 sm:w-8"
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              <h2
                id="siaga-safety-title"
                className="text-[13px] leading-4 font-black text-rose-700 sm:text-base sm:leading-6"
              >
                Jika nyawa atau keselamatan terancam
              </h2>
              <p className="mt-1 text-[11.5px] leading-4 text-slate-600 sm:text-sm sm:leading-6">
                Segera hubungi layanan darurat resmi di atas. HelpMe tidak
                mengirim petugas secara otomatis, tidak memastikan panggilan
                dijawab, dan tidak menjamin ketersediaan atau waktu kedatangan
                layanan.
              </p>
            </div>
          </div>
        </section>

        <footer className="pb-4 pt-7 text-center text-[11px] leading-5 text-slate-500 sm:text-xs">
          <p className="font-bold text-slate-600">HelpMe Siaga</p>
          <p className="mt-1">
            Akses nomor darurat resmi tersedia tanpa login.
          </p>
        </footer>
      </div>
    </main>
  );
}