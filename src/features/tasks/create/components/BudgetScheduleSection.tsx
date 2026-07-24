"use client";

import BudgetInput from "./BudgetInput";

import ScheduleInput from "./ScheduleInput";

type Props = {
  budget: string;

  taskDate: string;
  taskTime: string;

  onBudgetChange: (
    value: string
  ) => void;

  onTaskDateChange: (
    value: string
  ) => void;

  onTaskTimeChange: (
    value: string
  ) => void;
};

export default function BudgetScheduleSection({
  budget,
  taskDate,
  taskTime,
  onBudgetChange,
  onTaskDateChange,
  onTaskTimeChange,
}: Props) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-slate-200/80
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        sm:p-6
      "
    >
      <p
        className="
          text-[11px]
          font-bold
          uppercase
          tracking-[0.14em]
          text-indigo-600
        "
      >
        Budget & waktu
      </p>

      <h2 className="mt-1 text-lg font-bold text-slate-900">
        Atur pelaksanaan
      </h2>

      <BudgetInput
        budget={budget}
        onBudgetChange={onBudgetChange}
      />

      <ScheduleInput
        taskDate={taskDate}
        taskTime={taskTime}
        onTaskDateChange={onTaskDateChange}
        onTaskTimeChange={onTaskTimeChange}
      />
    </section>
  );
}