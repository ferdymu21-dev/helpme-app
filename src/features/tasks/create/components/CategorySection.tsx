"use client";

import Image from "next/image";

import { taskCategories } from "../constants/taskCategories";

type Props = {
  category: string;
  onCategoryChange: (value: string) => void;
};

export default function CategorySection({
  category,
  onCategoryChange,
}: Props) {
  return (
    <div className="mt-5">
      <label className="text-sm font-semibold text-slate-700">
        Kategori
      </label>

      <div
        className="
          -mx-1
          mt-3
          flex
          gap-2.5
          overflow-x-auto
          px-1
          pb-2
          scrollbar-hide
          sm:flex-wrap
          sm:overflow-visible
        "
      >
        {taskCategories.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() =>
              onCategoryChange(item.name)
            }
            className={`
              flex
              shrink-0
              items-center
              gap-2
              rounded-xl
              border
              px-3.5
              py-2.5
              text-xs
              font-semibold
              transition-all

              ${
                category === item.name
                  ? `
                    border-indigo-600
                    bg-indigo-600
                    text-white
                    shadow-md
                    shadow-indigo-600/20
                  `
                  : `
                    border-slate-200
                    bg-white
                    text-slate-600
                    hover:border-indigo-200
                    hover:bg-indigo-50
                  `
              }
            `}
          >
            <span
              className={`
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg

                ${
                  category === item.name
                    ? "bg-white/15"
                    : "bg-slate-50"
                }
              `}
            >
              <Image
                src={item.icon}
                alt={item.name}
                width={17}
                height={17}
              />
            </span>

            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}