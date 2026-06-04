export default function PopularServicesSection() {
  const categories = [
    {
      icon: "🛒",
      title: "Titip Belanja",
      bg: "bg-emerald-50",
    },
    {
      icon: "👥",
      title: "Jasa Antri",
      bg: "bg-pink-50",
    },
    {
      icon: "📄",
      title: "Ambil Dokumen",
      bg: "bg-blue-50",
    },
    {
      icon: "📦",
      title: "Pindahan Kecil",
      bg: "bg-amber-50",
    },
    {
      icon: "🐾",
      title: "Cari Hewan Hilang",
      bg: "bg-violet-50",
    },
    {
      icon: "🎓",
      title: "Bantuan Kampus",
      bg: "bg-emerald-50",
    },
    {
      icon: "📍",
      title: "Survey Lokasi",
      bg: "bg-rose-50",
    },
    {
      icon: "⬜",
      title: "Lainnya",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <section className="border-t border-slate-200 pt-10">

      <div className="mx-auto max-w-300 px-3">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-xl font-bold text-slate-900">
            Jasa Populer
          </h2>

          <button
            className="
              text-sm
              font-semibold
              text-indigo-600
            "
          >
            Lihat Semua →
          </button>

        </div>

        <div
          className="
            flex
            gap-3
            overflow-x-auto
            pb-4
          "
        >
          {categories.map((item) => (
            <div
              key={item.title}
              className={`
                ${item.bg}
                min-w-33
                rounded-[20px]
                p-4
                text-center
                transition
                hover:-translate-y-1
                hover:shadow-lg
                cursor-pointer
              `}
            >

              <div className="text-2xl">
                {item.icon}
              </div>

              <p
                className="
                  mt-5
                  text-xs
                  font-medium
                  text-slate-700
                "
              >
                {item.title}
              </p>

            </div>
          ))}
        </div>

      </div>

    </section>
  );
}