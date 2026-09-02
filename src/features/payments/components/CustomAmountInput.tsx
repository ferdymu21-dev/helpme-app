import {
  CircleAlert,
  WalletCards,
} from "lucide-react";

interface Props {
  value: string;

  error: string | null;

  onChange: (
    value: string,
  ) => void;
}

export default function CustomAmountInput({
  value,
  error,
  onChange,
}: Props) {
  return (
    <section
      className="
        px-5
        pb-5
        sm:px-6
      "
    >
      <label
        htmlFor="donation-custom-amount"
        className="
          block
          text-xs
          font-black
          text-slate-800
        "
      >
        Nominal lainnya
      </label>

      <div
        className={`
          mt-2
          flex
          h-12
          items-center
          rounded-2xl
          border
          bg-white
          transition

          ${
            error
              ? `
                border-red-200
                ring-4
                ring-red-50
              `
              : `
                border-slate-200
                focus-within:border-indigo-300
                focus-within:ring-4
                focus-within:ring-indigo-50
              `
          }
        `}
      >
        <div
          className="
            flex
            h-full
            items-center
            gap-2
            border-r
            border-slate-100
            px-3.5
            text-slate-500
          "
        >
          <WalletCards
            className="h-4 w-4"
            strokeWidth={2}
          />

          <span
            className="
              text-xs
              font-bold
            "
          >
            Rp
          </span>
        </div>

        <input
          id="donation-custom-amount"
          type="number"
          inputMode="numeric"
          min={2000}
          max={5000000}
          value={value}
          placeholder="Masukkan nominal"
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="
            min-w-0
            flex-1
            bg-transparent
            px-3.5
            text-sm
            font-bold
            text-slate-800
            outline-none
            placeholder:font-medium
            placeholder:text-slate-400
          "
        />
      </div>

      {error ? (
        <div
          className="
            mt-2
            flex
            items-start
            gap-1.5
            text-[10px]
            leading-4
            text-red-500
          "
        >
          <CircleAlert
            className="
              mt-0.5
              h-3
              w-3
              shrink-0
            "
          />

          <span>{error}</span>
        </div>
      ) : (
        <p
          className="
            mt-2
            text-[10px]
            text-slate-400
          "
        >
          Minimum Rp1.000 • Maksimum Rp5.000.000
        </p>
      )}
    </section>
  );
}