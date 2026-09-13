"use client";

export type HomeFeedValue = "tasks" | "services";

interface HomeFeedSelectorProps {
  activeFeed: HomeFeedValue;

  onFeedChange: (feed: HomeFeedValue) => void;
}

export default function HomeFeedSelector({
  activeFeed,
  onFeedChange,
}: HomeFeedSelectorProps) {
  return (
    <section
      className="
        px-5
        pt-6
        lg:px-8
        lg:pt-8
        xl:px-10
      "
    >
      <div className="mx-auto max-w-360">
        <div
          role="tablist"
          aria-label="Pilih jenis bantuan"
          className="
            grid
            w-full
            grid-cols-2
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-1.5
            shadow-sm
            sm:max-w-md
          "
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeFeed === "tasks"}
            onClick={() => onFeedChange("tasks")}
            className={`
              min-h-11
              rounded-xl
              px-4
              text-sm
              font-black
              transition
              ${
                activeFeed === "tasks"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }
            `}
          >
            Task
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeFeed === "services"}
            onClick={() => onFeedChange("services")}
            className={`
              min-h-11
              rounded-xl
              px-4
              text-sm
              font-black
              transition
              ${
                activeFeed === "services"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }
            `}
          >
            Jasa
          </button>
        </div>
      </div>
    </section>
  );
}
