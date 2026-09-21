interface DeliverablesSectionProps {
  deliverables: string;

  customerPreparation: string;

  onDeliverablesChange: (value: string) => void;

  onCustomerPreparationChange: (value: string) => void;
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
    rounded-2xl
    border
    border-slate-200
    bg-white
    p-5
    sm:p-6
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
          Detail Layanan
        </p>

        <h2
          className="
        mt-1
        text-base
        font-black
        tracking-tight
        text-slate-950
      "
        >
          Hasil dan kebutuhan pelanggan
        </h2>

        <p
          className="
        mt-0.5
        text-[11px]
        leading-4
        text-slate-500
      "
        >
          Jelaskan hasil yang diterima dan apa yang perlu disiapkan sebelum
          pekerjaan dimulai.
        </p>
      </div>

      <div
        className="
      mt-6
      space-y-4
    "
      >
        <label
          className="
        block
        rounded-2xl
        bg-slate-50
        p-4
      "
        >
          <div
            className="
          flex
          items-start
          justify-between
          gap-3
        "
          >
            <div>
              <span
                className="
              block
              text-sm
              font-bold
              text-slate-900
            "
              >
                Yang pelanggan dapatkan
              </span>

              <p
                className="
              mt-1
              text-[11px]
              leading-5
              text-slate-500
            "
              >
                Sebutkan hasil, jumlah, format, cakupan, atau benefit layanan.
              </p>
            </div>

            <span
              className="
            shrink-0
            text-[10px]
            font-medium
            text-slate-400
          "
            >
              Wajib
            </span>
          </div>

          <textarea
            value={deliverables}
            onChange={(event) => onDeliverablesChange(event.target.value)}
            required
            rows={5}
            placeholder="Contoh: 1 desain poster final, file JPG/PNG, dan 2 kali revisi."
            className="
          mt-3
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
        </label>

        <label
          className="
        block
        rounded-2xl
        border
        border-slate-100
        p-4
      "
        >
          <div
            className="
          flex
          items-start
          justify-between
          gap-3
        "
          >
            <div>
              <span
                className="
              block
              text-sm
              font-bold
              text-slate-900
            "
              >
                Yang perlu disiapkan pelanggan
              </span>

              <p
                className="
              mt-1
              text-[11px]
              leading-5
              text-slate-500
            "
              >
                Contohnya bahan, referensi, informasi, atau akses yang Anda
                perlukan.
              </p>
            </div>

            <span
              className="
            shrink-0
            rounded-lg
            bg-slate-100
            px-2
            py-1
            text-[9px]
            font-bold
            text-slate-500
          "
            >
              Opsional
            </span>
          </div>

          <textarea
            value={customerPreparation}
            onChange={(event) =>
              onCustomerPreparationChange(event.target.value)
            }
            rows={4}
            placeholder="Contoh: Kirim logo, referensi desain, dan materi tulisan."
            className="
          mt-3
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
        </label>
      </div>
    </section>
  );
}