import DonationButton from "./DonationButton";

interface Props {
  amount: number;

  loading: boolean;

  disabled: boolean;

  onDonate: () => void;

  onClose: () => void;
}

export default function DonationFooter({
  amount,
  loading,
  disabled,
  onDonate,
  onClose,
}: Props) {
  return (
    <footer
      className="
        shrink-0
        border-t
        border-slate-100
        bg-white/95
        px-5
        pb-5
        pt-4
        backdrop-blur
        sm:px-6
      "
    >
      <DonationButton
        amount={amount}
        loading={loading}
        disabled={disabled}
        onClick={onDonate}
      />

      <button
        type="button"
        disabled={loading}
        onClick={onClose}
        className="
          mt-2
          w-full
          rounded-xl
          py-2
          text-[11px]
          font-semibold
          text-slate-400
          transition
          hover:bg-slate-50
          hover:text-slate-600
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        Mungkin lain kali
      </button>
    </footer>
  );
}