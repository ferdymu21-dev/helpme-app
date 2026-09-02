import {
  HeartHandshake,
  LoaderCircle,
} from "lucide-react";

interface Props {
  amount: number;

  loading: boolean;

  disabled: boolean;

  onClick: () => void;
}

export default function DonationButton({
  amount,
  loading,
  disabled,
  onClick,
}: Props) {
  const formattedAmount =
    Number.isFinite(amount) &&
    amount > 0
      ? `Rp${amount.toLocaleString(
          "id-ID",
        )}`
      : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={
        loading ||
        disabled
      }
      className="
        flex
        h-12
        w-full
        items-center
        justify-center
        gap-2
        rounded-2xl
        bg-indigo-600
        px-4
        text-sm
        font-black
        text-white
        shadow-[0_8px_24px_rgba(79,70,229,0.20)]
        transition
        hover:bg-indigo-700
        active:scale-[0.99]
        disabled:cursor-not-allowed
        disabled:bg-slate-300
        disabled:shadow-none
      "
    >
      {loading ? (
        <>
          <LoaderCircle
            className="
              h-4
              w-4
              animate-spin
            "
          />

          Membuka pembayaran...
        </>
      ) : (
        <>
          <HeartHandshake
            className="h-4 w-4"
            strokeWidth={2}
          />

          <span>Dukung HelpMe</span>

          {formattedAmount && (
            <>
              <span
                className="
                  text-indigo-300
                "
              >
                •
              </span>

              <span>
                {formattedAmount}
              </span>
            </>
          )}
        </>
      )}
    </button>
  );
}