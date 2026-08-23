"use client";

type Props = {
  manualAddress: string;

  onManualAddressChange: (value: string) => void;
};

export default function ManualAddressInput({
  manualAddress,

  onManualAddressChange,
}: Props) {
  return (
    <textarea
      rows={4}
      required
      value={manualAddress}
      onChange={(e) => onManualAddressChange(e.target.value)}
      placeholder="Contoh: Jl. Sudirman No.10, dekat Indomaret..."
      className="
        mt-4
        w-full
        resize-none
        rounded-2xl
        border
        border-slate-200
        bg-slate-50/70
        px-4
        py-3.5
        text-sm
        leading-6
        text-slate-900
        outline-none
        transition
        placeholder:text-slate-400
        focus:border-indigo-500
        focus:bg-white
        focus:ring-4
        focus:ring-indigo-100
      "
    />
  );
}