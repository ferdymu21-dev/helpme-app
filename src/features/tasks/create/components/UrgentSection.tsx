"use client";

type Props = {
  isUrgent: boolean;
  onUrgentChange: (value: boolean) => void;
};

export default function UrgentSection({
  isUrgent,
  onUrgentChange,
}: Props) {
  return (
    <button
      type="button"
      onClick={() =>
        onUrgentChange(!isUrgent)
      }
      className={`
        flex
        w-full
        items-center
        gap-4
        rounded-3xl
        border
        p-4
        text-left
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        transition-all

        ${
          isUrgent
            ? `
              border-rose-200
              bg-rose-50
              ring-4
              ring-rose-50
            `
            : `
              border-slate-200
              bg-white
              hover:border-rose-200
            `
        }
      `}
    >
      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-2xl
          text-lg

          ${
            isUrgent
              ? "bg-rose-500"
              : "bg-rose-50"
          }
        `}
      >
        🔥
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-900">
            Prioritas Tinggi
          </p>

          {isUrgent && (
            <span
              className="
                rounded-full
                bg-rose-500
                px-2
                py-0.5
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-white
              "
            >
              Aktif
            </span>
          )}
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Task akan mendapatkan prioritas lebih tinggi
          di feed helper.
        </p>
      </div>

      <div
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition

          ${
            isUrgent
              ? "bg-rose-500"
              : "bg-slate-200"
          }
        `}
      >
        <span
          className={`
            absolute
            top-1
            h-4
            w-4
            rounded-full
            bg-white
            shadow-sm
            transition-transform

            ${
              isUrgent
                ? "translate-x-6"
                : "translate-x-1"
            }
          `}
        />
      </div>
    </button>
  );
}