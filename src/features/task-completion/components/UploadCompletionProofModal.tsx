"use client";

import { useState } from "react";

interface Props {
  open: boolean;

  onClose: () => void;

  onSubmit: (
    file: File,
    note: string,
  ) => Promise<void>;
}

export default function UploadCompletionProofModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [file, setFile] =
    useState<File | null>(null);

  const [note, setNote] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  if (!open) return null;

  async function submit() {
    if (!file) {
      alert("Upload foto bukti dahulu");
      return;
    }

    try {
      setLoading(true);

      await onSubmit(file, note);

      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-6">

        <h2 className="text-xl font-bold">
          Upload Bukti Penyelesaian
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Foto akan dikirim kepada pemilik task.
        </p>

        <input
          type="file"
          accept="image/*"
          className="mt-5"
          onChange={(e)=>{
            if(e.target.files?.length){
              setFile(e.target.files[0]);
            }
          }}
        />

        <textarea
          value={note}
          onChange={(e)=>setNote(e.target.value)}
          placeholder="Catatan (opsional)"
          className="mt-4 h-32 w-full rounded-xl border p-3"
        />

        <div className="mt-6 flex gap-3">

          <button
            onClick={onClose}
            className="flex-1 rounded-xl border py-3"
          >
            Batal
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-white"
          >
            {loading
              ? "Mengirim..."
              : "Kirim Bukti"}
          </button>

        </div>

      </div>
    </div>
  );
}