type Props = {
  loading: boolean;
  isUrgent: boolean;
};

export default function ActionBar({
  loading,
  isUrgent,
}: Props) {
  const buttonLabel = isUrgent
    ? "+ Rp 1.000 & Cari Bantuan"
    : "Cari Bantuan";

  const loadingLabel = isUrgent
    ? "Memproses pembayaran..."
    : "Mencari helper...";

  const desktopButtonColor = isUrgent
    ? `
      bg-emerald-600
      shadow-emerald-600/20
      hover:bg-emerald-700
    `
    : `
      bg-indigo-600
      shadow-indigo-600/20
      hover:bg-indigo-700
    `;

  const mobileButtonColor = isUrgent
    ? `
      bg-emerald-600
      shadow-emerald-600/20
    `
    : `
      bg-indigo-600
      shadow-indigo-600/20
    `;

  return (
    <>
      {/* Desktop */}
      <button
        type="submit"
        disabled={loading}
        className={`
          hidden
          h-14
          w-full
          items-center
          justify-center
          rounded-2xl
          text-sm
          font-bold
          text-white
          shadow-lg
          transition
          disabled:cursor-not-allowed
          disabled:bg-slate-300
          disabled:shadow-none
          sm:flex

          ${desktopButtonColor}
        `}
      >
        {loading
          ? loadingLabel
          : buttonLabel}
      </button>

      {/* Mobile */}
      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-40
          border-t
          border-slate-200
          bg-white/95
          p-4
          backdrop-blur-xl
          sm:hidden
        "
      >
        <div className="mx-auto max-w-3xl">
          <button
            type="submit"
            form="create-task-form"
            disabled={loading}
            className={`
              flex
              h-13
              w-full
              items-center
              justify-center
              rounded-2xl
              text-sm
              font-bold
              text-white
              shadow-lg
              transition
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:bg-slate-300
              disabled:shadow-none

              ${mobileButtonColor}
            `}
          >
            {loading
              ? loadingLabel
              : buttonLabel}
          </button>
        </div>
      </div>
    </>
  );
}