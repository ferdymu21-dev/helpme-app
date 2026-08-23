import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PaymentHistoryHeader() {
  return (
    <div className="mb-8">
      {/* =========================
          MOBILE HEADER
      ========================= */}
      <div className="lg:hidden">
        <div className="relative flex h-10 items-center">
          {/* BACK */}
          <Link
            href="/profile"
            aria-label="Kembali ke halaman sebelumnya"
            className="
              relative
              z-10
              inline-flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              bg-white
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
              active:scale-95
            "
          >
            <ArrowLeft
              className="h-5 w-5"
              strokeWidth={2}
            />
          </Link>

          {/* TITLE */}
          <h1
            className="
              pointer-events-none
              absolute
              left-1/2
              -translate-x-1/2
              whitespace-nowrap
              text-base
              font-black
              tracking-tight
              text-text-main
            "
          >
            Riwayat Transaksi
          </h1>
        </div>

        <p
          className="
            mt-4
            text-center
            text-xs
            leading-5
            text-text-soft
          "
        >
          Semua transaksi pembayaran Anda tersimpan di sini.
        </p>
      </div>

      {/* =========================
          DESKTOP HEADER
      ========================= */}
      <div className="hidden lg:block">
        <h1 className="text-xl font-bold text-text-main">
          Riwayat Transaksi
        </h1>

        <p className="mt-2 text-sm text-text-soft">
          Semua transaksi pembayaran Anda tersimpan di sini.
        </p>
      </div>
    </div>
  );
}