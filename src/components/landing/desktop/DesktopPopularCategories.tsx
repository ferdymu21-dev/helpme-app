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
    description:
      "Bantu antre makanan, tiket, layanan, atau kebutuhan lainnya.",
    iconClass:
      "bg-rose-50 text-rose-600",
  },
  {
    icon: ShoppingBag,
    title: "Titip Belanja",
    description:
      "Titip beli kebutuhan harian tanpa harus keluar rumah.",
    iconClass:
      "bg-emerald-50 text-emerald-600",
  },
  {
    icon: FileText,
    title: "Ambil Dokumen",
    description:
      "Bantu mengambil atau mengantarkan dokumen penting.",
    iconClass:
      "bg-blue-50 text-blue-600",
  },
  {
    icon: PackageOpen,
    title: "Pindahan Ringan",
    description:
      "Bantuan untuk memindahkan barang kecil atau kebutuhan kos.",
    iconClass:
      "bg-amber-50 text-amber-600",
  },
  {
    icon: GraduationCap,
    title: "Bantuan Kampus",
    description:
      "Print, survey, kebutuhan organisasi, dan aktivitas kampus.",
    iconClass:
      "bg-violet-50 text-violet-600",
  },
  {
    icon: MapPinned,
    title: "Survey Lokasi",
    description:
      "Minta bantuan mengecek lokasi atau kondisi suatu tempat.",
    iconClass:
      "bg-cyan-50 text-cyan-600",
  },
  {
    icon: Binoculars,
    title: "Cari Hewan",
    description:
      "Dapatkan bantuan dari orang sekitar untuk pencarian.",
    iconClass:
      "bg-orange-50 text-orange-600",
  },
  {
    icon: Sparkles,
    title: "Lainnya",
    description:
      "Punya kebutuhan berbeda? Buat task sesuai kebutuhanmu.",
    iconClass:
      "bg-indigo-50 text-indigo-600",
  },
];

export default function PopularServicesSection() {
  return (
    <section
      id="kategori"
      className="
        bg-white
        px-8
        py-24
      "
    >
      <div className="mx-auto max-w-7xl">
        {/* =========================
            HEADER
        ========================= */}
        <div
          className="
            flex
            items-end
            justify-between
            gap-10
          "
        >
          <div className="max-w-2xl">
            <span
              className="
                text-xs
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
                mt-3
                text-4xl
                font-black
                tracking-[-0.03em]
                text-slate-950
              "
            >
              Bantuan untuk berbagai{" "}
              <span className="text-indigo-600">
                kebutuhan harian
              </span>
            </h2>

            <p
              className="
                mt-4
                max-w-xl
                text-base
                leading-7
                text-slate-500
              "
            >
              Dari kebutuhan sederhana sampai bantuan
              di sekitar, buat task dan temukan helper
              yang sesuai dengan kebutuhanmu.
            </p>
          </div>

          <Link
            href="/register"
            className="
              inline-flex
              shrink-0
              items-center
              gap-2
              text-sm
              font-bold
              text-indigo-600
              transition
              hover:text-indigo-700
            "
          >
            Mulai buat task

            <ArrowRight
              className="h-4 w-4"
              strokeWidth={2}
            />
          </Link>
        </div>

        {/* =========================
            CATEGORY GRID
        ========================= */}
        <div
          className="
            mt-12
            grid
            grid-cols-4
            gap-4
          "
        >
          {categories.map(
            ({
              icon: Icon,
              title,
              description,
              iconClass,
            }) => (
              <Link
                key={title}
                href="/register"
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-slate-200
                  bg-white
                  p-6
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-indigo-200
                  hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]
                "
              >
                {/* ICON */}
                <div
                  className={`
                    flex
                    h-13
                    w-13
                    items-center
                    justify-center
                    rounded-2xl
                    ${iconClass}
                  `}
                >
                  <Icon
                    className="h-6 w-6"
                    strokeWidth={1.9}
                  />
                </div>

                {/* CONTENT */}
                <h3
                  className="
                    mt-6
                    text-base
                    font-black
                    text-slate-900
                  "
                >
                  {title}
                </h3>

                <p
                  className="
                    mt-2
                    min-h-12
                    text-xs
                    leading-6
                    text-slate-500
                  "
                >
                  {description}
                </p>

                {/* FOOTER */}
                <div
                  className="
                    mt-5
                    flex
                    items-center
                    gap-1.5
                    text-xs
                    font-bold
                    text-slate-400
                    transition
                    group-hover:text-indigo-600
                  "
                >
                  Buat task

                  <ArrowRight
                    className="
                      h-3.5
                      w-3.5
                      transition-transform
                      group-hover:translate-x-1
                    "
                    strokeWidth={2}
                  />
                </div>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}