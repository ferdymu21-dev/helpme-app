import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { TASK_CATEGORIES } from "@/features/tasks/constants/task-categories";

const CATEGORY_ICON_CLASSES: Record<string, string> = {
  Antri: "bg-rose-50 text-rose-600",

  Kurir: "bg-sky-50 text-sky-600",

  Dokumen: "bg-blue-50 text-blue-600",

  Belanja: "bg-emerald-50 text-emerald-600",

  "Rumah & Pindahan": "bg-amber-50 text-amber-600",

  "Cari & Cek": "bg-cyan-50 text-cyan-600",

  Kondangan: "bg-violet-50 text-violet-600",

  Lainnya: "bg-indigo-50 text-indigo-600",
};

const categories = TASK_CATEGORIES.map((category) => ({
  ...category,

  iconClass:
    CATEGORY_ICON_CLASSES[category.value] ?? "bg-indigo-50 text-indigo-600",
}));

export default function MobilePopularCategories() {
  return (
    <section
      id="kategori-mobile"
      className="
        bg-white
        px-5
        py-12
      "
    >
      {/* =========================
          HEADER
      ========================= */}
      <div>
        <span
          className="
            text-[11px]
            font-black
            uppercase
            tracking-[0.18em]
            text-indigo-600
          "
        >
          Kategori Populer
        </span>

        <h2
          className="
            mt-2
            max-w-xs
            text-2xl
            font-black
            leading-tight
            tracking-[-0.03em]
            text-slate-950
          "
        >
          Temukan bantuan sesuai{" "}
          <span className="text-indigo-600">kebutuhanmu</span>
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-slate-500
          "
        >
          Pilih kebutuhan yang paling sesuai atau buat task khusus untuk bantuan
          lainnya.
        </p>
      </div>

      {/* =========================
          GRID
      ========================= */}
      <div
        className="
          mt-7
          grid
          grid-cols-2
          gap-3
        "
      >
        {categories.map(({ icon: Icon, value, label, iconClass }) => (
          <Link
            key={value}
            href="/register"
            className="
                group
                rounded-[22px]
                border
                border-slate-200
                bg-white
                p-4
                shadow-[0_8px_24px_rgba(15,23,42,0.035)]
                transition
                active:scale-[0.98]
              "
          >
            <div
              className={`
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  ${iconClass}
                `}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>

            <div
              className="
                  mt-4
                  flex
                  items-end
                  justify-between
                  gap-2
                "
            >
              <p
                className="
                    min-w-0
                    text-xs
                    font-black
                    leading-5
                    text-slate-800
                  "
              >
                {label}
              </p>

              <ArrowRight
                className="
                    h-3.5
                    w-3.5
                    shrink-0
                    text-slate-300
                    transition
                    group-hover:text-indigo-600
                  "
                strokeWidth={2}
              />
            </div>
          </Link>
        ))}
      </div>

      {/* =========================
          CTA
      ========================= */}
      <Link
        href="/register"
        className="
          mt-5
          flex
          h-11
          w-full
          items-center
          justify-center
          gap-2
          rounded-2xl
          border
          border-indigo-100
          bg-indigo-50
          text-xs
          font-bold
          text-indigo-700
          transition
          active:scale-[0.99]
        "
      >
        Punya kebutuhan lainnya?
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </section>
  );
}
