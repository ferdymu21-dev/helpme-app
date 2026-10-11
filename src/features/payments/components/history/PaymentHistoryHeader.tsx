import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PaymentHistoryHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          aria-label="Kembali ke halaman sebelumnya"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-black tracking-tight text-text-main">
            Riwayat Transaksi
          </h1>
          <p className="mt-0.5 text-xs leading-4 text-text-soft">
            Semua transaksi pembayaran Anda tersimpan di sini.
          </p>
        </div>
      </div>
    </div>
  );
}