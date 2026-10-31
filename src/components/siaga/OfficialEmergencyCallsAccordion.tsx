
"use client";

import { useState } from "react";
import {
  ChevronDown,
  Globe,
  HeartPulse,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

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

export default function OfficialEmergencyCallsAccordion() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      id="layanan-darurat"
      className="
        scroll-mt-21 rounded-[20px] border border-slate-200
        bg-white p-2 shadow-[0_12px_35px_rgba(225,29,72,0.08)]
        sm:p-5
      "
      aria-labelledby="siaga-emergency-title"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="official-emergency-services-panel"
        onClick={() => setIsOpen((previous) => !previous)}
        className="
          group flex min-h-12 w-full items-center gap-3
          rounded-2xl px-1 py-1 text-left
          outline-none transition-colors duration-200
          hover:bg-rose-50/60
          focus-visible:ring-2 focus-visible:ring-rose-400
          focus-visible:ring-offset-2
          sm:min-h-14 sm:px-2
        "
      >
        <span
          className="
            flex h-8 w-8 shrink-0 items-center justify-center
            rounded-xl bg-red-600 text-white shadow-sm
            shadow-rose-900/10
            transition-transform duration-200
            group-hover:scale-105
            sm:h-10 sm:w-10
          "
        >
          <PhoneCall
            className="h-4 w-4 sm:h-5 sm:w-5"
            aria-hidden="true"
          />
        </span>

        <span className="min-w-0 flex-1">
          <span
            id="siaga-emergency-title"
            className="
              block text-[15px] font-black tracking-tight
              text-[#142653] sm:text-xl
            "
          >
            Panggilan darurat resmi
          </span>

          <span className="sr-only">
            {isOpen
              ? "Tutup daftar nomor darurat"
              : "Buka daftar nomor darurat"}
          </span>
        </span>

        {/* Indikator jumlah nomor */}
        <span
          className="
            hidden rounded-full border border-rose-100
            bg-white px-3 py-1.5 text-[10px]
            font-bold text-rose-700 sm:inline-flex sm:text-xs
          "
        >
          3 nomor resmi
        </span>

        {/* Indikator buka/tutup */}
        <span
          className="
            flex h-9 w-9 shrink-0 items-center justify-center
            rounded-full border border-rose-100 bg-rose-50
            text-rose-600 transition-all duration-300
            group-hover:bg-rose-100
            sm:h-10 sm:w-10
          "
        >
          <ChevronDown
            className={`
              h-4 w-4 transition-transform duration-300
              ease-in-out sm:h-5 sm:w-5
              ${isOpen ? "rotate-180" : "rotate-0"}
            `}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Konten accordion dengan animasi ekspansi */}
      <div
        id="official-emergency-services-panel"
        aria-hidden={!isOpen}
        className={`
          grid overflow-hidden transition-[grid-template-rows]
          duration-300 ease-in-out
          motion-reduce:transition-none
          ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}
        `}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-3 sm:pt-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {emergencyServices.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    id={`emergency-${service.number}`}
                    key={service.number}
                    className="
                      flex min-w-0 scroll-mt-28 flex-col
                      items-center rounded-[20px] border
                      border-rose-100 bg-white px-2 py-3
                      text-center
                      shadow-[0_4px_14px_rgba(15,23,42,0.04)]
                      sm:rounded-3xl sm:px-4 sm:py-4
                    "
                  >
                    {/* Ikon layanan */}
                    <span
                      className="
                        flex h-9 w-9 items-center justify-center
                        rounded-full bg-rose-50 text-rose-600
                        sm:h-12 sm:w-12
                      "
                    >
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

                    {/* Nomor */}
                    <p
                      className="
                        mt-1 text-base leading-none font-black
                        tracking-tight text-rose-600
                        sm:mt-3 sm:text-4xl
                      "
                    >
                      {service.number}
                    </p>

                    {/* Nama layanan */}
                    <p
                      className="
                        mt-1 min-h-8 text-[9px] leading-4
                        font-extrabold text-[#142653]
                        sm:min-h-0 sm:text-sm
                      "
                    >
                      {service.name}
                    </p>

                    {/* Tombol telepon dan sumber resmi */}
                    <div
                      className="
                        mt-1.5 flex w-full items-center
                        justify-center gap-2 sm:mt-4
                      "
                    >
                      <a
                        href={`tel:${service.number}`}
                        tabIndex={isOpen ? 0 : -1}
                        aria-label={`Hubungi ${service.name} melalui nomor ${service.number}`}
                        aria-describedby={`emergency-description-${service.number}`}
                        title={`Hubungi ${service.number}`}
                        className="
                          inline-flex h-8 w-8 shrink-0
                          items-center justify-center rounded-xl
                          bg-red-600 text-white shadow-sm
                          transition hover:bg-rose-700
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-rose-400
                          focus-visible:ring-offset-2
                          active:scale-[0.97]
                          sm:h-10 sm:w-10
                        "
                      >
                        <PhoneCall
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </a>

                      <a
                        href={service.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={isOpen ? 0 : -1}
                        aria-label={`Buka situs resmi: ${service.sourceLabel}`}
                        title="Buka sumber resmi"
                        className="
                          inline-flex h-8 w-8 shrink-0
                          items-center justify-center rounded-xl
                          border border-slate-200 bg-white
                          text-slate-600 shadow-sm
                          transition hover:border-blue-200
                          hover:bg-blue-50 hover:text-blue-700
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-blue-500
                          focus-visible:ring-offset-2
                          active:scale-[0.97]
                          sm:h-10 sm:w-10
                        "
                      >
                        <Globe
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}