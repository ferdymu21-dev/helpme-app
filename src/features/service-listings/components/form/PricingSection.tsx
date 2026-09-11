import CurrencyInput from "@/components/ui/CurrencyInput";

interface PricingSectionProps {
  priceFrom: string;

  isNegotiable: boolean;

  onPriceFromChange:
    (value: string) => void;

  onNegotiableChange:
    (value: boolean) => void;
}

export default function PricingSection({
  priceFrom,
  isNegotiable,
  onPriceFromChange,
  onNegotiableChange,
}: PricingSectionProps) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-slate-200/80
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <div>
        <p
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-indigo-600
          "
        >
          Harga
        </p>

        <h2
          className="
            mt-1
            text-lg
            font-bold
            tracking-tight
            text-slate-950
          "
        >
          Tentukan harga mulai
        </h2>

        <p
          className="
            mt-1
            text-sm
            leading-5
            text-slate-500
          "
        >
          Cantumkan harga awal yang realistis
          untuk membantu pelanggan menilai
          layanan Anda.
        </p>
      </div>

      <div className="mt-6">
        <CurrencyInput
          label="Harga mulai"
          value={priceFrom}
          onChange={onPriceFromChange}
          placeholder="50.000"
          prefix="Rp"
          required
        />

        <label
          className="
            mt-5
            flex
            cursor-pointer
            items-start
            gap-3
            rounded-2xl
            border
            border-slate-200
            bg-slate-50/70
            p-4
            transition
            hover:border-indigo-200
            hover:bg-indigo-50/40
          "
        >
          <input
            type="checkbox"
            checked={isNegotiable}
            onChange={(event) =>
              onNegotiableChange(
                event.target.checked,
              )
            }
            className="
              mt-0.5
              h-4
              w-4
              rounded
              border-slate-300
              text-indigo-600
              accent-indigo-600
            "
          />

          <span>
            <span
              className="
                block
                text-sm
                font-semibold
                text-slate-800
              "
            >
              Harga dapat dinegosiasikan
            </span>

            <span
              className="
                mt-1
                block
                text-xs
                leading-5
                text-slate-500
              "
            >
              Pelanggan dapat mendiskusikan
              harga berdasarkan kebutuhan
              pekerjaan.
            </span>
          </span>
        </label>
      </div>
    </section>
  );
}