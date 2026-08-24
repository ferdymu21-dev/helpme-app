import Link from "next/link";

import {
  ArrowRight,
  Binoculars,
  FileText,
  GraduationCap,
  MapPinned,
  PackageOpen,
  ShoppingBag,
  Sparkles,
  UsersRound,
} from "lucide-react";

const categories = [
  {
    icon: UsersRound,
    title: "Jasa Antri",
    iconClass:
      "bg-rose-50 text-rose-600",
  },
  {
    icon: ShoppingBag,
    title: "Titip Belanja",
    iconClass:
      "bg-emerald-50 text-emerald-600",
  },
  {
    icon: FileText,
    title: "Ambil Dokumen",
    iconClass:
      "bg-blue-50 text-blue-600",
  },
  {
    icon: PackageOpen,
    title: "Pindahan",
    iconClass:
      "bg-amber-50 text-amber-600",
  },
  {
    icon: GraduationCap,
    title: "Bantuan Kampus",
    iconClass:
      "bg-violet-50 text-violet-600",
  },
  {
    icon: MapPinned,
    title: "Survey Lokasi",
    iconClass:
      "bg-cyan-50 text-cyan-600",
  },
  {
    icon: Binoculars,
    title: "Cari Hewan",
    iconClass:
      "bg-orange-50 text-orange-600",
  },
  {
    icon: Sparkles,
    title: "Lainnya",
    iconClass:
      "bg-indigo-50 text-indigo-600",
  },
];

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
          <span className="text-indigo-600">
            kebutuhanmu
          </span>
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-slate-500
          "
        >
          Pilih kebutuhan yang paling sesuai atau
          buat task khusus untuk bantuan lainnya.
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
        {categories.map(
          ({
            icon: Icon,
            title,
            iconClass,
          }) => (
            <Link
              key={title}
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
                <Icon
                  className="h-5 w-5"
                  strokeWidth={2}
                />
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
                  {title}
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
          ),
        )}
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

        <ArrowRight
          className="h-4 w-4"
          strokeWidth={2}
        />
      </Link>
    </section>
  );
}