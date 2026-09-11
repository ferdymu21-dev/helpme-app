interface BasicInformationSectionProps {
  title: string;

  category: string;

  description: string;

  onTitleChange:
    (value: string) => void;

  onCategoryChange:
    (value: string) => void;

  onDescriptionChange:
    (value: string) => void;
}

export default function BasicInformationSection({
  title,
  category,
  description,
  onTitleChange,
  onCategoryChange,
  onDescriptionChange,
}: BasicInformationSectionProps) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-slate-200/80
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <div>
        <p
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-indigo-600
          "
        >
          Informasi Jasa
        </p>

        <h2
          className="
            mt-1
            text-lg
            font-bold
            tracking-tight
            text-slate-950
          "
        >
          Ceritakan jasa yang Anda tawarkan
        </h2>

        <p
          className="
            mt-1
            text-sm
            leading-5
            text-slate-500
          "
        >
          Berikan informasi yang jelas agar
          calon pelanggan mudah memahami
          layanan Anda.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <label className="block">
          <span
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Nama jasa
          </span>

          <input
            type="text"
            value={title}
            onChange={(event) =>
              onTitleChange(
                event.target.value,
              )
            }
            required
            autoComplete="off"
            placeholder="Contoh: Jasa desain poster dan konten Instagram"
            className="
              h-13
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-slate-50/70
              px-4
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-indigo-400
              focus:bg-white
              focus:ring-4
              focus:ring-indigo-100
            "
          />
        </label>

        <label className="block">
          <span
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Kategori
          </span>

          <input
            type="text"
            value={category}
            onChange={(event) =>
              onCategoryChange(
                event.target.value,
              )
            }
            required
            autoComplete="off"
            placeholder="Contoh: Desain & Kreatif"
            className="
              h-13
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-slate-50/70
              px-4
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-indigo-400
              focus:bg-white
              focus:ring-4
              focus:ring-indigo-100
            "
          />

          <p
            className="
              mt-2
              text-xs
              leading-5
              text-slate-400
            "
          >
            Gunakan kategori yang paling
            menggambarkan jasa Anda.
          </p>
        </label>

        <label className="block">
          <span
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Deskripsi jasa
          </span>

          <textarea
            value={description}
            onChange={(event) =>
              onDescriptionChange(
                event.target.value,
              )
            }
            required
            rows={6}
            placeholder="Jelaskan layanan, pengalaman, cara kerja, dan informasi penting lainnya."
            className="
              w-full
              resize-y
              rounded-2xl
              border
              border-slate-200
              bg-slate-50/70
              px-4
              py-3.5
              text-sm
              leading-6
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-indigo-400
              focus:bg-white
              focus:ring-4
              focus:ring-indigo-100
            "
          />
        </label>
      </div>
    </section>
  );
}