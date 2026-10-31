
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type HelpMeSiagaHomeCardProps = {
  className?: string;
};

const destination = "/siaga";

export default function HelpMeSiagaHomeCard({
  className = "mt-3",
}: HelpMeSiagaHomeCardProps) {
  return (
    <Link
      href={destination}
      aria-label="Buka HelpMe Siaga untuk mengakses layanan darurat"
      className={`
        group relative isolate flex w-full min-w-0
        items-center gap-2 overflow-hidden
        rounded-[22px] border border-rose-400/50
        bg-linear-to-r from-red-600 via-rose-600 to-rose-500
        px-3 py-3 text-left
        shadow-[0_8px_24px_rgba(225,29,72,0.16)]
        outline-none transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_12px_30px_rgba(225,29,72,0.24)]
        focus-visible:ring-4 focus-visible:ring-rose-300
        focus-visible:ring-offset-2
        sm:gap-4 sm:rounded-[26px] sm:px-5 sm:py-4
        md:gap-5 md:py-5
        ${className}
      `}
    >
      {/* Dekorasi lingkaran kanan atas */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-12 -top-20
          h-48 w-48 rounded-full
          border-22 border-white/10
          sm:-right-16 sm:-top-28
          sm:h-64 sm:w-64 sm:border-30
        "
      />

      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-16
          left-1/3 h-32 w-32 rounded-full
          bg-white/70 blur-3xl
          sm:-bottom-24 sm:h-48 sm:w-48
        "
      />

      <span
        className="
          relative z-10 flex min-w-0 flex-1
          flex-col items-start
        "
      >

        <span
          className="mt-1 block max-w-full text-[13px] font-bold leading-[1.2] tracking-tight text-white sm:mt-1 sm:text-xl md:text-[14px]"
        >
          Akses cepat ke layanan darurat
        </span>

        <span
          className="
            mt-1 block max-w-full
            text-[10px] leading-tight
            text-white/90
            sm:mt-1 sm:max-w-full
            sm:text-[11px] sm:leading-3.5
            md:text-[12px]
          "
        >
          Akses nomor darurat resmi, layanan dan relawan di sekitar Anda.
        </span>

        <span
          className="
            mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-50 transition-all duration-200
            group-hover:gap-1 sm:mt-2 sm:text-[11px"
        >
          Buka Siaga
          <ArrowRight
            className="h-3.5 w-3.5 sm:h-4 sm:w-4"
            aria-hidden="true"
          />
        </span>
      </span>

      <span
        aria-hidden="true"
        className="
          relative z-10 block shrink-0
          aspect-2/1
          w-[36%] min-w-27 max-w-75
        "
      >
        <Image
          src="/images/helpme_siaga.webp"
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 480px) 140px, (max-width: 767px) 160px, (max-width: 1199px) 240px, 300px"
          className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </span>
    </Link>
  );
}