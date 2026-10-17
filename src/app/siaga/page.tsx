import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CircleHelp,
  Globe,
  HeartPulse,
  MapPin,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

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
    <main className="min-h-screen bg-[#f7f9fd] text-[#142653]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-18 max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
            aria-label="HelpMe Siaga, kembali ke beranda HelpMe"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <ShieldAlert className="h-7 w-7" aria-hidden="true" />
            </span>
            <span className="whitespace-nowrap text-base font-black tracking-tight text-[#142653] sm:text-2xl">
              HelpMe <span className="text-rose-600">Siaga</span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <div className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-2 text-[11px] font-bold text-emerald-900 sm:min-h-10 sm:gap-2 sm:px-4 sm:text-sm">
              <MapPin className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <span>Surabaya</span>
              <span className="hidden text-emerald-700 sm:inline">· Wilayah pilot</span>
            </div>
            <a
              href="#panduan-keselamatan"
              className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-[#142653] transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 max-[359px]:hidden sm:h-10 sm:w-10"
              aria-label="Lihat panduan keselamatan"
            >
              <CircleHelp className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
        <section className="mb-6 sm:mb-8" aria-labelledby="siaga-hero-title">
          <h1
            id="siaga-hero-title"
            className="max-w-4xl text-[20px] leading-[1.08] font-black tracking-[-0.045em] text-[#142653] sm:text-4xl md:text-5xl"
          >
            Butuh bantuan sekarang?
          </h1>
          <p className="mt-2 max-w-3xl text-[12px] leading-5 text-slate-600 sm:text-base sm:leading-7">
            Akses cepat bantuan darurat dan layanan terverifikasi di sekitar Anda.
          </p>
        </section>

        <section
          id="layanan-darurat"
          className="scroll-mt-24 rounded-[28px] border border-rose-200 bg-linear-to-br from-rose-50 via-white to-rose-50/80 p-3 shadow-[0_12px_35px_rgba(225,29,72,0.08)] sm:p-5"
          aria-labelledby="siaga-emergency-title"
        >
          <div className="flex items-center gap-3 px-1 py-1 sm:px-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm shadow-rose-900/10">
              <PhoneCall className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="siaga-emergency-title" className="text-[14px] font-black tracking-tight text-[#142653] sm:text-xl">
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
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  </span>
                  <span id={`emergency-description-${service.number}`} className="sr-only">
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



        <section className="mt-4 overflow-hidden rounded-3xl border border-blue-100 bg-linear-to-br from-blue-50 to-white p-4 sm:p-5" aria-labelledby="siaga-guide-title">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm sm:h-14 sm:w-14">
              <Bot className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="siaga-guide-title" className="text-sm font-black text-[#142653] sm:text-lg">
                Bingung memilih bantuan?
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                Cari penyedia berdasarkan nama atau kategori. Untuk keadaan yang mengancam nyawa, hubungi layanan darurat resmi di atas.
              </p>
            </div>
            <Link
              href="#layanan-darurat"
              aria-label="Lihat kembali layanan darurat resmi"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section id="panduan-keselamatan" className="mt-4 scroll-mt-24 rounded-3xl border border-rose-200 bg-linear-to-br from-rose-50 to-white p-4 sm:p-5" aria-labelledby="siaga-safety-title">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm sm:h-14 sm:w-14">
              <ShieldAlert className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="siaga-safety-title" className="text-sm leading-5 font-black text-rose-700 sm:text-base sm:leading-6">
                Jika nyawa atau keselamatan terancam
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                Segera hubungi layanan darurat resmi di atas. HelpMe tidak mengirim petugas secara otomatis, tidak memastikan panggilan dijawab, dan tidak menjamin ketersediaan atau waktu kedatangan layanan.
              </p>
            </div>
          </div>
        </section>

        <footer className="pb-4 pt-7 text-center text-[11px] leading-5 text-slate-500 sm:text-xs">
          <p className="font-bold text-slate-600">HelpMe Siaga · Pilot Surabaya</p>
          <p className="mt-1">Akses nomor darurat resmi tersedia tanpa login.</p>
        </footer>
      </div>
    </main>
  );
}
