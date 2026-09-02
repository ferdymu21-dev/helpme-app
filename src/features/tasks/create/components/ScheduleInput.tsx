"use client";

import { Info } from "lucide-react";

type Props = {
  taskDate: string;
  taskTime: string;

  onTaskDateChange: (
    value: string
  ) => void;

  onTaskTimeChange: (
    value: string
  ) => void;
};

export default function ScheduleInput({
  taskDate,
  taskTime,
  onTaskDateChange,
  onTaskTimeChange,
}: Props) {
  return (
    <div className="mt-5">
      <label className="text-sm font-semibold text-slate-700">
        Jadwal Pelaksanaan
      </label>

      <div className="mt-2.5 grid grid-cols-2 gap-3">
        <input
          type="date"
          required
          value={taskDate}
          onChange={(e) =>
            onTaskDateChange(e.target.value)
          }
          className="
            h-13
            min-w-0
            rounded-2xl
            border
            border-slate-200
            bg-slate-50/70
            px-3
            text-xs
            text-slate-700
            outline-none
            focus:border-indigo-500
            focus:bg-white
            focus:ring-4
            focus:ring-indigo-100
          "
        />

        <input
          type="time"
          required
          value={taskTime}
          onChange={(e) =>
            onTaskTimeChange(e.target.value)
          }
          className="
            h-13
            min-w-0
            rounded-2xl
            border
            border-slate-200
            bg-slate-50/70
            px-3
            text-xs
            text-slate-700
            outline-none
            focus:border-indigo-500
            focus:bg-white
            focus:ring-4
            focus:ring-indigo-100
          "
        />
      </div>

      <div
        className="
          mt-3
          flex
          items-start
          gap-2.5
          rounded-2xl
          border
          border-indigo-100
          bg-indigo-50/60
          px-3.5
          py-3
        "
      >
        <Info
          size={17}
          className="
            mt-0.5
            shrink-0
            text-indigo-500
          "
        />

        <p className="text-[11px] leading-4.5 text-slate-600">
          Jika task masih berstatus{" "}
          <span className="font-semibold text-slate-700">
            Terbuka
          </span>{" "}
          setelah waktu ini terlewati, task akan
          otomatis kedaluwarsa.
        </p>
      </div>
    </div>
  );
}