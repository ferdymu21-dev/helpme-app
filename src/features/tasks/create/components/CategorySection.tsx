"use client";

import {
  Check,
  Info,
} from "lucide-react";

import { taskCategories } from "../constants/taskCategories";

type Props = {
  category: string;
  onCategoryChange: (
    value: string,
  ) => void;
};

export default function CategorySection({
  category,
  onCategoryChange,
}: Props) {
  const selectedCategory =
    taskCategories.find(
      (item) =>
        item.value === category,
    ) ?? taskCategories[0];

  return (
    <section className="mt-5">
      {/* HEADER */}
      <div>
        <label
          className="
            text-sm
            font-black
            text-slate-800
          "
        >
          Pilih Kategori
        </label>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-slate-500
          "
        >
          Pilih jenis bantuan yang paling sesuai.
        </p>
      </div>

      {/* CATEGORY GRID */}
      <div
        className="
          mt-3
          grid
          grid-cols-2
          gap-2
          lg:grid-cols-4
        "
      >
        {taskCategories.map(
          (item) => {
            const selected =
              category === item.value;

            const Icon = item.icon;

            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onCategoryChange(
                    item.value,
                  )
                }
                className={`
                  group
                  relative
                  flex
                  min-h-16
                  items-center
                  gap-2.5
                  rounded-2xl
                  border
                  px-3
                  py-2.5
                  text-left
                  transition
                  duration-200
                  active:scale-[0.98]

                  ${
                    selected
                      ? `
                        border-indigo-500
                        bg-indigo-50
                        shadow-[0_5px_16px_rgba(79,70,229,0.08)]
                        ring-1
                        ring-indigo-500/10
                      `
                      : `
                        border-slate-200
                        bg-white
                        hover:border-indigo-200
                        hover:bg-slate-50
                      `
                  }
                `}
              >
                {/* ICON */}
                <div
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    transition-colors

                    ${
                      selected
                        ? `
                          bg-indigo-600
                          text-white
                        `
                        : `
                          bg-slate-100
                          text-slate-600
                          group-hover:bg-indigo-50
                          group-hover:text-indigo-600
                        `
                    }
                  `}
                >
                  <Icon
                    className="h-4.5 w-4.5"
                    strokeWidth={2}
                  />
                </div>

                {/* LABEL */}
                <p
                  className={`
                    min-w-0
                    flex-1
                    text-[11px]
                    font-bold
                    leading-4

                    ${
                      selected
                        ? "text-indigo-900"
                        : "text-slate-700"
                    }
                  `}
                >
                  {item.label}
                </p>

                {/* SELECTED */}
                {selected && (
                  <div
                    className="
                      flex
                      h-5
                      w-5
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-indigo-600
                      text-white
                    "
                  >
                    <Check
                      className="h-3 w-3"
                      strokeWidth={2.8}
                    />
                  </div>
                )}
              </button>
            );
          },
        )}
      </div>

      {/* ACTIVE CATEGORY DESCRIPTION */}
      {selectedCategory && (
        <div
          className="
            mt-2.5
            flex
            items-start
            gap-2
            rounded-xl
            bg-slate-50
            px-3
            py-2.5
          "
        >
          <Info
            className="
              mt-0.5
              h-3.5
              w-3.5
              shrink-0
              text-indigo-500
            "
            strokeWidth={2}
          />

          <p
            className="
              text-[10px]
              leading-4
              text-slate-500
            "
          >
            <span
              className="
                font-bold
                text-slate-700
              "
            >
              {selectedCategory.label}
              :{" "}
            </span>

            {selectedCategory.description}
          </p>
        </div>
      )}
    </section>
  );
}