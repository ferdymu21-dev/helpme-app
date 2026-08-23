interface Props {
  loading: boolean;

  onClick: () => void;
}

export default function SimulatorButton({
  loading,

  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="
                w-full
                rounded-xl
                bg-indigo-600
                py-4
                font-semibold
                text-white
                transition
                disabled:cursor-not-allowed
                disabled:opacity-50
                hover:bg-indigo-700
            "
    >
      {loading ? "Sending..." : "Send Webhook"}
    </button>
  );
}