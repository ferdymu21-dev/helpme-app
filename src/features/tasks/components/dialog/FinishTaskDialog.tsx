"use client";

import { Lock } from "lucide-react";

interface FinishTaskDialogProps {
  open: boolean;
  onClose: () => void;

  proofPreview: string;
  uploadingProof: boolean;

  handleProofChange: (file: File) => void;
  handleFinish: () => void;
}

export default function FinishTaskDialog({
  open,
  onClose,
  proofPreview,
  uploadingProof,
  handleProofChange,
  handleFinish,
}: FinishTaskDialogProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
    >
      <div
        className="
          w-full
          max-w-lg
          rounded-3xl
          bg-white
          p-6
          shadow-xl
        "
      >
        <h2 className="text-2xl font-bold text-slate-900">
  Upload Bukti Penyelesaian
</h2>

<p className="mt-2 text-sm leading-6 text-slate-500">
  Unggah foto sebagai bukti bahwa pekerjaan telah selesai.
  Pemilik task akan meninjau foto ini sebelum mengonfirmasi penyelesaian.
</p>

<div
  className="
    mt-5
    flex
    items-center
    gap-3
    rounded-2xl
    border
    border-blue-200
    bg-blue-50
    px-2
    py-1
  "
>
  <Lock
    className="h-4 w-4 shrink-0 text-blue-600"
    strokeWidth={2}
  />

  <p className="text-[12px] leading-4 text-blue-800">
    Bukti penyelesaian bersifat privat dan hanya dapat dilihat oleh Anda dan
    pemilik task.
  </p>
</div>

{proofPreview && (
  <img
    src={proofPreview}
    alt="Preview Bukti"
    className="
      mt-6
      h-72
      w-full
      rounded-2xl
      border
      object-cover
    "
  />
)}

<input
  type="file"
  accept="image/*"
  className="
    mt-6
    w-full
    rounded-2xl
    border
    border-slate-300
    bg-slate-50
    p-2
    text-sm
    text-slate-600

    file:mr-4
    file:rounded-xl
    file:border
    file:border-slate-300
    file:bg-white
    file:px-4
    file:py-2
    file:text-sm
    file:font-semibold
    file:text-slate-700
    file:transition
    file:hover:bg-slate-100
    cursor-pointer
  "
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    handleProofChange(file);
  }}
/>

<div className="mt-8 flex justify-end gap-3">

  <button
    onClick={onClose}
    className="
      rounded-xl
      border
      border-slate-300
      px-6
      py-3
      font-semibold
      text-slate-700
      hover:bg-slate-100
    "
  >
    Batal
  </button>

  <button
    onClick={handleFinish}
    disabled={uploadingProof}
    className="
      rounded-xl
      bg-emerald-600
      px-6
      py-3
      font-semibold
      text-white
      hover:bg-emerald-700
      disabled:opacity-50
    "
  >
    {uploadingProof
      ? "Mengirim..."
      : "Selesaikan Task"}
  </button>

</div>
      </div>
    </div>
  );
}