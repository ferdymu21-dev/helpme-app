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
    rounded-2xl
    border
    border-slate-200
    bg-white
    p-5
    sm:p-6
  "
    >
      <div
        className="
      flex
      items-start
      justify-between
      gap-4
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
            Informasi Jasa
          </p>

          <h2
            className="
          mt-1
          text-lg
          font-black
          tracking-tight
          text-slate-950
        "
          >
            Informasi utama layanan
          </h2>

          <p
            className="
          mt-1
          text-sm
          leading-5
          text-slate-500
        "
          >
            Informasi ini menjadi bagian pertama yang dilihat calon pelanggan.
          </p>
        </div>
      </div>

      <div
        className="
      mt-6
      space-y-5
    "
      >
        <label className="block">
          <div
            className="
          mb-2
          flex
          items-center
          justify-between
          gap-3
        "
          >
            <span
              className="
            text-sm
            font-bold
            text-slate-800
          "
            >
              Judul jasa
            </span>

            <span
              className="
            text-[10px]
            font-medium
            text-slate-400
          "
            >
              Wajib
            </span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            required
            autoComplete="off"
            placeholder="Contoh: Jasa desain poster dan konten Instagram"
            className="
          h-14
          w-full
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          text-base
          font-semibold
          text-slate-950
          outline-none
          transition
          placeholder:text-sm
          placeholder:font-normal
          placeholder:text-slate-400
          focus:border-indigo-400
          focus:ring-4
          focus:ring-indigo-100
        "
          />

          <p
            className="
          mt-2
          text-[11px]
          leading-5
          text-slate-400
        "
          >
            Buat judul yang langsung menjelaskan layanan yang Anda tawarkan.
          </p>
        </label>

        <label className="block">
          <span
            className="
          mb-2
          block
          text-sm
          font-bold
          text-slate-800
        "
          >
            Kategori
          </span>

          <input
            type="text"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            required
            autoComplete="off"
            placeholder="Contoh: Desain & Kreatif"
            className="
          h-12
          w-full
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          text-sm
          text-slate-950
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-indigo-400
          focus:ring-4
          focus:ring-indigo-100
        "
          />

          <p
            className="
          mt-2
          text-[11px]
          leading-5
          text-slate-400
        "
          >
            Pilih istilah yang paling menggambarkan jenis layanan Anda.
          </p>
        </label>

        <label className="block">
          <span
            className="
          mb-2
          block
          text-sm
          font-bold
          text-slate-800
        "
          >
            Tentang jasa
          </span>

          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            required
            rows={6}
            placeholder="Jelaskan layanan, cara kerja, pengalaman, dan informasi penting yang perlu diketahui pelanggan."
            className="
          w-full
          resize-y
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          py-3.5
          text-sm
          leading-6
          text-slate-950
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-indigo-400
          focus:ring-4
          focus:ring-indigo-100
        "
          />

          <p
            className="
          mt-2
          text-[11px]
          leading-5
          text-slate-400
        "
          >
            Jelaskan dengan cukup detail agar pelanggan memahami layanan sebelum
            membuat permintaan.
          </p>
        </label>
      </div>
    </section>
  );
}