"use client";

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
    </div>
  );
}