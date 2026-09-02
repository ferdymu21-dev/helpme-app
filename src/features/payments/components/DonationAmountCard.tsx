import {
  Check,
} from "lucide-react";

interface Props {
  amount: number;

  selected: boolean;

  onSelect: (
    amount: number,
  ) => void;
}

export default function DonationAmountCard({
  amount,
  selected,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() =>
        onSelect(amount)
      }
      className={`
        group
        relative
        flex
        min-h-16
        items-center
        justify-center
        rounded-2xl
        border
        px-3
        py-3
        text-center
        transition
        duration-200
        active:scale-[0.98]

        ${
          selected
            ? `
              border-indigo-500
              bg-indigo-50
              shadow-[0_6px_18px_rgba(79,70,229,0.09)]
              ring-1
              ring-indigo-500/10
            `
            : `
              border-slate-200
              bg-white
              hover:border-indigo-200
              hover:bg-slate-50
            `
        }
      `}
    >
      {selected && (
        <span
          className="
            absolute
            right-2
            top-2
            flex
            h-4
            w-4
            items-center
            justify-center
            rounded-full
            bg-indigo-600
            text-white
          "
        >
          <Check
            className="h-2.5 w-2.5"
            strokeWidth={3}
          />
        </span>
      )}

      <div>
        <p
          className={`
            text-[10px]
            font-semibold
            ${
              selected
                ? "text-indigo-500"
                : "text-slate-400"
            }
          `}
        >
          Rp
        </p>

        <p
          className={`
            mt-0.5
            text-sm
            font-black
            tracking-tight

            ${
              selected
                ? "text-indigo-700"
                : "text-slate-800"
            }
          `}
        >
          {amount.toLocaleString(
            "id-ID",
          )}
        </p>
      </div>
    </button>
  );
}