import Link from "next/link";

import {
  ArrowRight,
  Bot,
  Globe,
  HeartPulse,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import SiagaHeader from "@/features/siaga/components/siaga-header";

import SiagaDirectory from "@/features/siaga/components/siaga-directory";

export const metadata = {
  title: "HelpMe Siaga | Akses Layanan Darurat",
  description:
    "Akses cepat ke layanan darurat resmi dan informasi bantuan untuk wilayah pilot Surabaya.",
};

const emergencyServices = [
  {
    number: "112",
    name: "Darurat Umum",
    description:
      "Command Center 112 Surabaya untuk laporan kedaruratan, termasuk kecelakaan, kebakaran, dan kondisi darurat lainnya.",
    sourceLabel: "Sumber resmi: BPBD Kota Surabaya",
    sourceUrl: "https://bpbd.surabaya.go.id/view/pusdalops",
    icon: ShieldAlert,
  },
  {
    number: "119",
    name: "Ambulans & Medis",
    description:
      "Layanan cepat tanggap darurat kesehatan. Jelaskan kondisi dan lokasi kejadian kepada operator.",
    sourceLabel: "Sumber resmi: Kementerian Kesehatan",
    sourceUrl:
      "https://kemkes.go.id/id/akses-darurat-medis-119-kini-bisa-melalui-satusehat-mobile",
    icon: HeartPulse,
  },
  {
    number: "110",
    name: "Kepolisian",
    description:
      "Saluran resmi kepolisian untuk informasi, laporan, dan pengaduan terkait keamanan masyarakat.",
    sourceLabel: "Sumber resmi: Polri",
    sourceUrl: "https://polri.go.id/kontak/call-center-110",
    icon: ShieldCheck,
  },
];

export default function SiagaPage() {
  return (
    <main className="min-h-screen bg-rose-50 text-[#142653]">
      <SiagaHeader />

      <div className="-mt-8 mx-auto max-w-5xl px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32 lg:px-8">
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
                Gunakan HelpMe Siaga saat ada keadaan darurat. Hubungi nomor darurat di bawah hanya
                untuk kejadian nyata yang membutuhkan penanganan - bukan untuk
                uji coba, lelucon, atau laporan palsu.
              </p>
            </div>
          </div>
        </section>

        <section
          id="layanan-darurat"
          className="scroll-mt-24 rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_12px_35px_rgba(225,29,72,0.08)] sm:p-5"
          aria-labelledby="siaga-emergency-title"
        >
          <div className="flex items-center gap-3 px-1 py-1 sm:px-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm shadow-rose-900/10">
              <PhoneCall className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                id="siaga-emergency-title"
                className="text-[14px] font-black tracking-tight text-[#142653] sm:text-xl"
              >
                Panggilan darurat resmi
              </h2>
            </div>
            <span className="hidden rounded-full border border-rose-100 bg-white px-3 py-1.5 text-[10px] font-bold text-rose-700 sm:inline-flex sm:text-xs">
              Nomor resmi
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
            {emergencyServices.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  id={`emergency-${service.number}`}
                  key={service.number}
                  className="flex min-w-0 scroll-mt-28 flex-col items-center rounded-[20px] border border-rose-100 bg-white px-2 py-3 text-center shadow-[0_4px_14px_rgba(15,23,42,0.04)] sm:rounded-3xl sm:px-4 sm:py-4"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 sm:h-12 sm:w-12">
                    <Icon
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    id={`emergency-description-${service.number}`}
                    className="sr-only"
                  >
                    {service.description}
                  </span>
                  <p className="mt-0.5 text-base leading-none font-black tracking-tight text-rose-600 sm:mt-3 sm:text-4xl">
                    {service.number}
                  </p>
                  <p className="mt-1 min-h-8 text-[9px] leading-4 font-extrabold text-[#142653] sm:min-h-0 sm:text-sm">
                    {service.name}
                  </p>
                  <div className="mt-1.5 flex w-full items-center justify-center gap-2 sm:mt-4">
                    <a
                      href={`tel:${service.number}`}
                      aria-label={`Hubungi ${service.name} melalui nomor ${service.number}`}
                      aria-describedby={`emergency-description-${service.number}`}
                      title={`Hubungi ${service.number}`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 active:scale-[0.97] sm:h-10 sm:w-10"
                    >
                      <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                    <a
                      href={service.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Buka situs resmi: ${service.sourceLabel}`}
                      title="Buka sumber resmi"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.97] sm:h-10 sm:w-10"
                    >
                      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

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

        <Link
          href="/siaga/provider"
          className="group mt-2 block overflow-hidden rounded-3xl border border-slate-200 bg-red-100 p-3 transition hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:p-5"
          aria-labelledby="siaga-provider-cta-title"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-rose-600 shadow-sm sm:h-14 sm:w-14">
              <ShieldCheck
                className="h-6 w-6 sm:h-7 sm:w-7"
                aria-hidden="true"
              />
            </span>

            <div className="min-w-0 flex-1">
              <h2
                id="siaga-provider-cta-title"
                className="text-[13px] leading-4 font-black text-[#142653] sm:text-lg"
              >
                Daftarkan layanan
              </h2>
              <p className="mt-1 text-[11.5px] leading-4 text-slate-600 sm:text-sm sm:leading-5">
                Daftarkan organisasi serta layanan Anda agar dapat diverifikasi
                oleh tim HelpMe dan dipublikasikan secara resmi pada direktori
                Siaga.
              </p>
            </div>

            <ArrowRight
              className="h-5 w-5 shrink-0 text-rose-600 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </div>
        </Link>
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
          <p className="font-bold text-slate-600">
            HelpMe Siaga
          </p>
          <p className="mt-1">
            Akses nomor darurat resmi tersedia tanpa login.
          </p>
        </footer>
      </div>
    </main>
  );
}