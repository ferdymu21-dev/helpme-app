"use client";

import {
  BriefcaseBusiness,
  ListChecks,
} from "lucide-react";

export type HomeFeedValue =
  | "tasks"
  | "services";

interface HomeFeedSelectorProps {
  activeFeed: HomeFeedValue;

  onFeedChange: (
    feed: HomeFeedValue,
  ) => void;
}

export default function HomeFeedSelector({
  activeFeed,
  onFeedChange,
}: HomeFeedSelectorProps) {
  return (
    <section
      className="
        px-5
        pt-5
        lg:px-8
        lg:pt-7
        xl:px-10
      "
    >
      <div className="mx-auto max-w-360">
        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-black
                tracking-[0.14em]
                text-indigo-600
                uppercase
              "
            >
              Eksplorasi
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Pilih jenis bantuan"
            className="
              grid
              w-full
              grid-cols-2
              rounded-xl
              border
              border-slate-200
              bg-slate-100
              p-0.5
              sm:w-60
            "
          >
            <button
              type="button"
              role="tab"
              aria-selected={
                activeFeed === "tasks"
              }
              onClick={() =>
                onFeedChange("tasks")
              }
              className={`
                inline-flex
                min-h-8
                items-center
                justify-center
                gap-1.5
                rounded-xl
                px-3
                text-[11px]
                font-black
                transition
                ${
                  activeFeed ===
                  "tasks"
                    ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }
              `}
            >
              <ListChecks
                aria-hidden="true"
                className="h-4 w-4"
                strokeWidth={2.2}
              />

              Task
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={
                activeFeed ===
                "services"
              }
              onClick={() =>
                onFeedChange(
                  "services",
                )
              }
              className={`
                inline-flex
                min-h-8
                items-center
                justify-center
                gap-1.5
                rounded-xl
                px-3
                text-[11px]
                font-black
                transition
                ${
                  activeFeed ===
                  "services"
                    ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }
              `}
            >
              <BriefcaseBusiness
                aria-hidden="true"
                className="h-3.5 w-3.5"
                strokeWidth={2.1}
              />

              Jasa
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}