"use client";

import { useState } from "react";

import { REPORT_REASONS } from "../constants/report-reasons";

import { submitTaskReport } from "../services/report.service";

import { supabase } from "@/lib/supabase/client";

interface ReportTaskModalProps {
  open: boolean;

  onClose: () => void;

  taskId: string;

  taskOwnerId: string;
}

export default function ReportTaskModal({
  open,

  onClose,

  taskId,

  taskOwnerId,
}: ReportTaskModalProps) {
  const [reason, setReason] = useState("");

  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Silakan login terlebih dahulu");

        return;
      }

      if (!reason.trim()) {
        alert("Pilih alasan laporan");

        return;
      }

      await submitTaskReport({
        reporterId: user.id,

        reportedUserId: taskOwnerId,

        taskId,

        reason,

        description,
      });

      alert("Laporan berhasil dikirim");

      setReason("");

      setDescription("");

      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengirim laporan.";

      alert(message);

      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      onClick={() => {
        setReason("");

        setDescription("");

        onClose();
      }}
      className="
               fixed
               inset-0
               z-50
             bg-black/50
               p-4
            "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
                    mx-auto
                    mt-20
                    max-w-md
                    rounded-3xl
                    bg-white
                    p-6
                "
      >
        <h2
          className="
                        text-lg
                        font-black
                    "
        >
          Laporkan Task
        </h2>

        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="
                        mt-4
                        w-full
                        rounded-xl
                        border
                        p-3
                    "
        >
          <option value="">Pilih alasan</option>

          {REPORT_REASONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="
Jelaskan laporan Anda
"
          className="
                        mt-4
                        h-32
                        w-full
                        rounded-xl
                        border
                        p-3
                    "
        />

        <div
          className="
                        mt-4
                        flex
                        gap-3
                    "
        >
          <button
            onClick={onClose}
            className="
                            flex-1
                            rounded-xl
                            border
                            py-3
                        "
          >
            Batal
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="
                            flex-1
                            rounded-xl
                            bg-red-600
                            py-3
                            font-bold
                            text-white
                        "
          >
            {loading ? "Mengirim..." : "Kirim"}
          </button>
        </div>
      </div>
    </div>
  );
}