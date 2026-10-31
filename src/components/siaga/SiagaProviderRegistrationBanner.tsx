
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileCheck2,
  UsersRound,
} from "lucide-react";

const destination = "/siaga/provider";

export default function SiagaProviderRegistrationBanner() {
  return (
    <Link
      href={destination}
      aria-labelledby="siaga-provider-banner-title"
      className="
        group relative isolate mt-2 block w-full overflow-hidden
        rounded-[22px] border border-rose-200/90
        bg-linear-to-r from-white via-rose-50 to-rose-100/90
        shadow-[0_8px_24px_rgba(225,20,68,0.08)]
        outline-none transition-all duration-200
        hover:-translate-y-0.5 hover:border-rose-300
        hover:shadow-[0_12px_30px_rgba(225,20,68,0.14)]
        focus-visible:ring-4 focus-visible:ring-rose-300
        focus-visible:ring-offset-2
        sm:mt-4 sm:rounded-[26px]
      "
    >
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-12 -top-20
          h-48 w-48 rounded-full border-22
          border-rose-100/70
          sm:-right-16 sm:-top-28 sm:h-64 sm:w-64
          sm:border-28
        "
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-20 right-1/4
          h-36 w-36 rounded-full bg-rose-200/30 blur-3xl
          sm:-bottom-28 sm:h-52 sm:w-52
        "
      />
      <span
        className="
          relative flex min-h-37 items-center
          gap-2.5 px-3 py-3.5
          sm:min-h-47.5 sm:gap-5 sm:px-5 sm:py-5
          md:min-h-54.5 md:gap-6 md:px-7 md:py-6
        "
      >
        <span
          className="
            relative z-10 flex min-w-0 flex-1
            flex-col items-start
          "
        >
          <span
            className="
              inline-flex items-center gap-1.5
              rounded-full border border-rose-200/90
              bg-white/90 px-2 py-1
              text-[8px] font-bold uppercase
              tracking-[0.07em] text-rose-700
              sm:px-3 sm:py-1.5 sm:text-[10px]
            "
          >
            <UsersRound className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            Untuk penyedia layanan
          </span>

          <span
            id="siaga-provider-banner-title"
            className="
              mt-1.5 block text-[14px] font-bold
              leading-[1.2] tracking-tight text-[#142653]
              sm:mt-2.5 sm:text-xl md:text-2xl
            "
          >
            Daftarkan layanan Anda
          </span>

          <span
            className="
              mt-1 block max-w-155
              text-[9px] leading-[1.35] text-slate-600
              sm:mt-2 sm:text-sm sm:leading-4
              md:text-[15px]
            "
          >
            Daftarkan organisasi dan layanan Anda agar dapat diverifikasi dan dipublikasikan pada direktori Siaga.
          </span>

          <span
            className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[8px] font-semibold text-rose-700 sm:mt-4 sm:gap-x-4 sm:gap-y-2 sm:text-[11px] md:text-xs"
          >
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <BadgeCheck
                className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
                aria-hidden="true"
              />
              Terverifikasi
            </span>

            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Building2
                className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
                aria-hidden="true"
              />
              <span className="sm:hidden">Terlihat</span>
              <span className="hidden sm:inline">Tampil di direktori</span>
            </span>

            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <FileCheck2
                className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
                aria-hidden="true"
              />
              <span className="sm:hidden">Jangkauan</span>
              <span className="hidden sm:inline">
                Jangkau lebih banyak orang
              </span>
            </span>
          </span>

          <span
            className="
              mt-2 inline-flex items-center gap-1
              text-[10px] font-bold text-rose-700
              sm:mt-3 sm:text-xs
            "
          >
            Mulai pendaftaran
            <ArrowRight
              className="
                h-3.5 w-3.5 transition-transform
                duration-200 group-hover:translate-x-1
                sm:h-4 sm:w-4
              "
              aria-hidden="true"
            />
          </span>
        </span>

        <span
          aria-hidden="true"
          className="
            relative z-10 mr-0.5 block
            h-27 w-28 shrink-0
            sm:h-41 sm:w-55
            md:h-47.5 md:w-[320px]
          "
        >
          <Image
            src="/images/penyedia_ilustrator.webp"
            alt=""
            fill
            sizes="
              (max-width: 639px) 112px,
              (max-width: 1023px) 220px,
              320px
            "
            className="
              object-contain transition-transform
              duration-200 group-hover:scale-[1.035]
            "
          />
        </span>
      </span>
    </Link>
  );
}