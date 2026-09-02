"use client";

import { useState } from "react";

import {
  CheckCircle2,
  Circle,
  Flag,
  Loader2,
  LockKeyhole,
  TriangleAlert,
  X,
} from "lucide-react";

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

  function handleClose() {
    if (loading) {
      return;
    }

    setReason("");

    setDescription("");

    onClose();
  }

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
      role="presentation"
      onClick={handleClose}
      className="
    fixed
    inset-0
    z-50
    flex
    items-end
    justify-center
    overflow-hidden
    bg-slate-950/50
    backdrop-blur-[2px]
    sm:items-center
    sm:p-6
  "
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-task-title"
        onClick={(event) => event.stopPropagation()}
        className="
  flex
  h-[90dvh]
  min-h-0
  w-full
  flex-col
  overflow-hidden
  rounded-t-[28px]
  bg-white
  shadow-[0_-12px_40px_rgba(15,23,42,0.16)]

  sm:h-auto
  sm:max-h-[90dvh]
  sm:max-w-lg
  sm:rounded-3xl
  sm:shadow-[0_24px_70px_rgba(15,23,42,0.22)]
"
      >
        {/* HANDLE - MOBILE */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* HEADER */}
        <header
          className="
            flex
            shrink-0
            items-start
            justify-between
            gap-4
            border-b
            border-slate-100
            px-5
            py-5
            sm:px-6
          "
        >
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-red-50
                text-red-600
              "
            >
              <TriangleAlert className="h-5 w-5" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <h2
                id="report-task-title"
                className="
                  text-lg
                  font-black
                  tracking-tight
                  text-slate-900
                "
              >
                Laporkan Task
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Laporkan task yang mencurigakan, tidak sesuai, atau berpotensi
                merugikan pengguna.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Tutup modal"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        {/* CONTENT */}
        <div
          className="
    min-h-0
    flex-1
    overflow-y-auto
    overscroll-contain
    px-5
    py-5
    sm:px-6
  "
        >
          {/* PRIVACY */}
          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-indigo-100
              bg-indigo-50/70
              p-4
            "
          >
            <LockKeyhole
              className="
                mt-0.5
                h-4
                w-4
                shrink-0
                text-indigo-600
              "
              strokeWidth={2.1}
            />

            <div>
              <p
                className="
                  text-xs
                  font-bold
                  text-indigo-950
                "
              >
                Laporan akan ditinjau admin
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-5
                  text-indigo-700
                "
              >
                Berikan informasi yang relevan agar tim HelpMe dapat melakukan
                pemeriksaan dengan tepat.
              </p>
            </div>
          </div>

          {/* REASON */}
          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <label
                  className="
                    text-sm
                    font-black
                    text-slate-900
                  "
                >
                  Alasan laporan
                </label>

                <p className="mt-1 text-xs text-slate-500">
                  Pilih alasan yang paling sesuai dengan task ini.
                </p>
              </div>

              <span
                className="
                  text-[10px]
                  font-bold
                  tracking-wide
                  text-red-500
                  uppercase
                "
              >
                Wajib
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {REPORT_REASONS.map((item) => {
                const selected = reason === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={loading}
                    onClick={() => setReason(item.value)}
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-4
                      rounded-2xl
                      border
                      px-4
                      py-3.5
                      text-left
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-60

                      ${
                        selected
                          ? `
                              border-red-200
                              bg-red-50
                              shadow-[0_4px_14px_rgba(239,68,68,0.06)]
                            `
                          : `
                              border-slate-200
                              bg-white
                              hover:border-slate-300
                              hover:bg-slate-50
                            `
                      }
                    `}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl

                          ${
                            selected
                              ? "bg-red-100 text-red-600"
                              : "bg-slate-100 text-slate-500"
                          }
                        `}
                      >
                        <Flag className="h-4 w-4" strokeWidth={2} />
                      </div>

                      <span
                        className={`
                          text-sm
                          font-semibold

                          ${selected ? "text-red-700" : "text-slate-700"}
                        `}
                      >
                        {item.label}
                      </span>
                    </div>

                    {selected ? (
                      <CheckCircle2
                        className="
                          h-5
                          w-5
                          shrink-0
                          text-red-600
                        "
                        strokeWidth={2.2}
                      />
                    ) : (
                      <Circle
                        className="
                          h-5
                          w-5
                          shrink-0
                          text-slate-300
                        "
                        strokeWidth={1.8}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <label
                  htmlFor="report-task-description"
                  className="
                    text-sm
                    font-black
                    text-slate-900
                  "
                >
                  Detail tambahan
                </label>

                <p className="mt-1 text-xs text-slate-500">
                  Jelaskan bagian task yang menurut Anda bermasalah.
                </p>
              </div>

              <span className="shrink-0 text-[10px] text-slate-400">
                {description.length} karakter
              </span>
            </div>

            <textarea
              id="report-task-description"
              value={description}
              disabled={loading}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Contoh: task berisi permintaan yang mencurigakan atau informasi yang tidak sesuai..."
              className="
                mt-3
                min-h-32
                w-full
                resize-none
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-4
                text-sm
                leading-6
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-red-300
                focus:bg-white
                focus:ring-4
                focus:ring-red-50
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          <div
            className="
              mt-5
              rounded-2xl
              bg-slate-50
              px-4
              py-3
              text-[11px]
              leading-5
              text-slate-500
            "
          >
            Laporan tidak otomatis menghapus task. Admin akan meninjau laporan
            dan menentukan tindakan berdasarkan hasil pemeriksaan.
          </div>
        </div>

        {/* ACTIONS */}
        <footer
          className="
    grid
    shrink-0
    grid-cols-2
    gap-3
    border-t
    border-slate-100
    bg-white
    px-5
    py-4
    sm:px-6
  "
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="
              h-12
              rounded-2xl
              border
              border-slate-200
              bg-white
              text-sm
              font-bold
              text-slate-700
              transition
              hover:bg-slate-50
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="
              flex
              h-12
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-red-600
              px-4
              text-sm
              font-bold
              text-white
              shadow-[0_8px_20px_rgba(220,38,38,0.18)]
              transition
              hover:bg-red-700
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Flag className="h-4 w-4" strokeWidth={2.2} />
                Laporkan
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}