type Props = {
  title: string;
  description: string;

  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export default function BasicInformationSection({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: Props) {
  return (
    <>
      <div>
        <p
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-indigo-600
          "
        >
          Detail bantuan
        </p>

        <h2 className="mt-1 text-lg font-bold text-slate-900">
          Apa yang perlu dibantu?
        </h2>
      </div>

      {/* TITLE */}
      <div className="mt-5">
        <label className="text-sm font-semibold text-slate-700">
          Judul Task
        </label>

        <input
          type="text"
          required
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Contoh: Ambil dokumen di kampus"
          className="
            mt-2.5
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
            focus:border-indigo-500
            focus:bg-white
            focus:ring-4
            focus:ring-indigo-100
          "
        />
      </div>

      {/* DESCRIPTION */}
      <div className="mt-5">
        <label className="text-sm font-semibold text-slate-700">
          Deskripsi
        </label>

        <textarea
          required
          rows={5}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Jelaskan kebutuhan, detail pekerjaan, dan informasi penting lainnya..."
          className="
            mt-2.5
            w-full
            resize-none
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
            focus:border-indigo-500
            focus:bg-white
            focus:ring-4
            focus:ring-indigo-100
          "
        />
      </div>
    </>
  );
}