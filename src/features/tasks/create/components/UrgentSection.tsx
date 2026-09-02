"use client";

import {
  CircleDollarSign,
  Flame,
} from "lucide-react";

import { URGENT_TASK_FEE } from "../constants/premiumServices";

type Props = {
  isUrgent: boolean;
  onUrgentChange: (value: boolean) => void;
};

export default function UrgentSection({
  isUrgent,
  onUrgentChange,
}: Props) {
  const formattedUrgentFee =
    URGENT_TASK_FEE.toLocaleString("id-ID");

  return (
    <button
      type="button"
      aria-pressed={isUrgent}
      onClick={() =>
        onUrgentChange(!isUrgent)
      }
      className={`
        w-full
        rounded-3xl
        border
        p-4
        text-left
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        transition-all
        sm:p-5

        ${
          isUrgent
            ? `
              border-rose-200
              bg-rose-50/70
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
      <div className="flex items-start gap-3.5">
        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-2xl
            transition-colors

            ${
              isUrgent
                ? "bg-rose-500 text-white"
                : "bg-rose-50 text-rose-500"
            }
          `}
        >
          <Flame
            size={21}
            strokeWidth={2.2}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
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
            Task akan mendapatkan prioritas lebih
            tinggi agar lebih mudah terlihat oleh
            helper.
          </p>
        </div>

        <div
          className={`
            relative
            mt-1
            h-6
            w-11
            shrink-0
            rounded-full
            transition-colors

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
      </div>

      <div
        className={`
          mt-4
          flex
          items-start
          gap-3
          rounded-2xl
          border
          px-3.5
          py-3
          transition-colors

          ${
            isUrgent
              ? `
                border-rose-200
                bg-white/80
              `
              : `
                border-slate-200
                bg-slate-50/70
              `
          }
        `}
      >
        <CircleDollarSign
          size={18}
          className={
            isUrgent
              ? "mt-0.5 shrink-0 text-rose-500"
              : "mt-0.5 shrink-0 text-slate-500"
          }
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Biaya tambahan
            </span>

            <span className="text-sm font-bold text-slate-900">
              Rp {formattedUrgentFee}
            </span>
          </div>

          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
            Jika diaktifkan, Anda akan diarahkan
            ke pembayaran untuk menggunakan
            prioritas ini.
          </p>
        </div>
      </div>
    </button>
  );
}