const categories = [
  {
    emoji: "🛒",
    title: "Jasa Antri",
    color: "bg-emerald-100",
  },

  {
    emoji: "📄",
    title: "Ambil Dokumen",
    color: "bg-indigo-100",
  },

  {
    emoji: "🚗",
    title: "Antar Jemput",
    color: "bg-pink-100",
  },

  {
    emoji: "📦",
    title: "Pindahan",
    color: "bg-cyan-100",
  },

  {
    emoji: "🐶",
    title: "Cari Hewan",
    color: "bg-amber-100",
  },

  {
    emoji: "🎓",
    title: "Bantuan Kampus",
    color: "bg-violet-100",
  },

  {
    emoji: "⏳",
    title: "Lainnya",
    color: "bg-orange-100",
  },
];

export default function MobilePopularCategories() {
  return (
    <section className="px-2 pt-8">

      {/* HEADER */}
      <div>

        <h2
          className="
            text-base
            font-black
            tracking-tight
            text-slate-900
          "
        >
          Kategori Populer
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-slate-500
          "
        >
          Temukan bantuan sesuai kebutuhanmu
        </p>

      </div>

      {/* CATEGORIES */}
      <div
        className="
          mt-3
          flex
          gap-4
          overflow-x-auto
          pb-2
          scrollbar-hide
        "
      >

        {categories.map((item) => (
          <button
            key={item.title}
            className="
              min-w-23
              rounded-[28px]
              border
              border-slate-100
              bg-white
              p-2
              text-left
              shadow-[0_10px_30px_rgba(15,23,42,0.04)]
            "
          >

            {/* ICON */}
            <div
              className={`
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-2xl
                ${item.color}
              `}
            >
              {item.emoji}
            </div>

            {/* TITLE */}
            <p
              className="
                mt-3
                text-xs
                font-bold
                leading-5
                text-slate-800
              "
            >
              {item.title}
            </p>

          </button>
        ))}

      </div>

    </section>
  );
}