import {
  CreditCard,
  Landmark,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export default function PaymentMethodCard() {
  return (
    <section>
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div>
          <h3
            className="
              text-xs
              font-black
              text-slate-800
            "
          >
            Metode pembayaran
          </h3>

          <p
            className="
              mt-1
              text-[10px]
              leading-4
              text-slate-500
            "
          >
            Pilih metode yang tersedia
            setelah halaman pembayaran
            dibuka.
          </p>
        </div>

        <div
          className="
            inline-flex
            shrink-0
            items-center
            gap-1
            rounded-full
            border
            border-emerald-100
            bg-emerald-50
            px-2
            py-1
            text-[9px]
            font-bold
            text-emerald-700
          "
        >
          <ShieldCheck
            className="h-3 w-3"
            strokeWidth={2}
          />

          Aman
        </div>
      </div>

      <div
        className="
          mt-3
          overflow-hidden
          rounded-[20px]
          border
          border-indigo-100
          bg-linear-to-br
          from-indigo-50/80
          via-white
          to-violet-50/50
        "
      >
        {/* MAIN INFO */}
        <div
          className="
            flex
            items-start
            gap-3
            p-4
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-indigo-600
              text-white
              shadow-[0_8px_20px_rgba(79,70,229,0.16)]
            "
          >
            <CreditCard
              className="h-5 w-5"
              strokeWidth={2}
            />
          </div>

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <p
                className="
                  text-sm
                  font-black
                  text-slate-900
                "
              >
                Pembayaran via Midtrans
              </p>

              <span
                className="
                  rounded-full
                  bg-indigo-100
                  px-2
                  py-0.5
                  text-[8px]
                  font-bold
                  text-indigo-700
                "
              >
                Fleksibel
              </span>
            </div>

            <p
              className="
                mt-1
                text-[10px]
                leading-4
                text-slate-500
              "
            >
              Setelah melanjutkan,
              halaman pembayaran Midtrans
              akan terbuka. Anda dapat
              memilih metode pembayaran
              yang tersedia untuk transaksi
              Anda.
            </p>
          </div>
        </div>

        {/* METHOD TYPES */}
        <div
          className="
            border-t
            border-indigo-100/80
            bg-white/70
            px-4
            py-3
          "
        >
          <p
            className="
              text-[9px]
              font-semibold
              text-slate-400
            "
          >
            Opsi pembayaran dapat mencakup
          </p>

          <div
            className="
              mt-2
              grid
              grid-cols-3
              gap-2
            "
          >
            <div
              className="
                flex
                min-w-0
                flex-col
                items-center
                justify-center
                rounded-xl
                border
                border-slate-100
                bg-white
                px-2
                py-2.5
                text-center
              "
            >
              <QrCode
                className="
                  h-4
                  w-4
                  text-indigo-500
                "
                strokeWidth={2}
              />

              <span
                className="
                  mt-1.5
                  text-[8px]
                  font-bold
                  text-slate-600
                "
              >
                QR
              </span>
            </div>

            <div
              className="
                flex
                min-w-0
                flex-col
                items-center
                justify-center
                rounded-xl
                border
                border-slate-100
                bg-white
                px-2
                py-2.5
                text-center
              "
            >
              <Smartphone
                className="
                  h-4
                  w-4
                  text-indigo-500
                "
                strokeWidth={2}
              />

              <span
                className="
                  mt-1.5
                  text-[8px]
                  font-bold
                  text-slate-600
                "
              >
                Dompet Digital
              </span>
            </div>

            <div
              className="
                flex
                min-w-0
                flex-col
                items-center
                justify-center
                rounded-xl
                border
                border-slate-100
                bg-white
                px-2
                py-2.5
                text-center
              "
            >
              <Landmark
                className="
                  h-4
                  w-4
                  text-indigo-500
                "
                strokeWidth={2}
              />

              <span
                className="
                  mt-1.5
                  text-[8px]
                  font-bold
                  text-slate-600
                "
              >
                Perbankan
              </span>
            </div>
          </div>

          <p
            className="
              mt-2.5
              text-[9px]
              leading-4
              text-slate-400
            "
          >
            Ketersediaan metode pembayaran
            mengikuti konfigurasi dan layanan
            yang tersedia pada halaman
            pembayaran Midtrans.
          </p>
        </div>
      </div>
    </section>
  );
}