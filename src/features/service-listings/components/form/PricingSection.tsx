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
    rounded-2xl
    border
    border-slate-200
    bg-white
    p-5
    sm:p-6
  "
    >
      <div>
        <p
          className="
        text-[10px]
        font-black
        tracking-[0.14em]
        text-indigo-600
        uppercase
      "
        >
          Harga
        </p>

        <h2
          className="
        mt-1
        text-lg
        font-black
        tracking-tight
        text-slate-950
      "
        >
          Tentukan harga layanan
        </h2>

        <p
          className="
        mt-1
        text-sm
        leading-5
        text-slate-500
      "
        >
          Harga ini menjadi nilai awal yang ditampilkan kepada pelanggan.
        </p>
      </div>

      <div className="mt-6">
        <div
          className="
        rounded-2xl
        bg-slate-50
        p-4
      "
        >
          <CurrencyInput
            label="Harga mulai"
            value={priceFrom}
            onChange={onPriceFromChange}
            placeholder="50.000"
            prefix="Rp"
            required
          />

          <p
            className="
          mt-2
          text-[11px]
          leading-5
          text-slate-400
        "
          >
            Masukkan harga awal yang realistis untuk layanan ini.
          </p>
        </div>

        <label
          className={`
        mt-4
        flex
        cursor-pointer
        items-center
        justify-between
        gap-4
        rounded-2xl
        border
        p-4
        transition

        ${
          isNegotiable
            ? `
              border-indigo-200
              bg-indigo-50/60
            `
            : `
              border-slate-200
              bg-white
              hover:border-slate-300
              hover:bg-slate-50
            `
        }
      `}
        >
          <input
            type="checkbox"
            checked={isNegotiable}
            onChange={(event) => onNegotiableChange(event.target.checked)}
            className="sr-only"
          />

          <span className="min-w-0">
            <span
              className="
            block
            text-sm
            font-bold
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
              Pelanggan dapat mendiskusikan harga berdasarkan kebutuhan
              pekerjaan.
            </span>
          </span>

          <span
            aria-hidden="true"
            className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition

          ${isNegotiable ? "bg-indigo-600" : "bg-slate-300"}
        `}
          >
            <span
              className={`
            absolute
            top-0.5
            h-5
            w-5
            rounded-full
            bg-white
            shadow-sm
            transition-transform
            ${isNegotiable ? "translate-x-5" : "translate-x-0.5"}
          `}
            />
          </span>
        </label>
      </div>
    </section>
  );
}