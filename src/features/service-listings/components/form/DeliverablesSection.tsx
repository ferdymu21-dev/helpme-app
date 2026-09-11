interface DeliverablesSectionProps {
  deliverables: string;

  customerPreparation: string;

  onDeliverablesChange:
    (value: string) => void;

  onCustomerPreparationChange:
    (value: string) => void;
}

export default function DeliverablesSection({
  deliverables,
  customerPreparation,
  onDeliverablesChange,
  onCustomerPreparationChange,
}: DeliverablesSectionProps) {
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
          Hasil & Persiapan
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
          Jelaskan apa yang akan diterima
        </h2>

        <p
          className="
            mt-1
            text-sm
            leading-5
            text-slate-500
          "
        >
          Informasi ini membantu pelanggan
          memahami hasil akhir dan apa yang
          perlu mereka siapkan.
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
            Yang didapat pelanggan
          </span>

          <textarea
            value={deliverables}
            onChange={(event) =>
              onDeliverablesChange(
                event.target.value,
              )
            }
            required
            rows={5}
            placeholder="Contoh: 1 desain poster final, file JPG/PNG, dan 2 kali revisi."
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

          <p
            className="
              mt-2
              text-xs
              leading-5
              text-slate-400
            "
          >
            Sebutkan hasil, jumlah, cakupan,
            atau bentuk layanan secara jelas.
          </p>
        </label>

        <label className="block">
          <span
            className="
              mb-2
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-slate-800
            "
          >
            Yang perlu disiapkan pelanggan

            <span
              className="
                rounded-full
                bg-slate-100
                px-2
                py-0.5
                text-[10px]
                font-semibold
                text-slate-500
              "
            >
              Opsional
            </span>
          </span>

          <textarea
            value={customerPreparation}
            onChange={(event) =>
              onCustomerPreparationChange(
                event.target.value,
              )
            }
            rows={4}
            placeholder="Contoh: Kirim logo, referensi desain, dan materi tulisan."
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