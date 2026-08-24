import {
  ChevronDown,
  CircleHelp,
} from "lucide-react";

const faqs = [
  {
    question: "Apa itu HelpMe?",
    answer:
      "HelpMe menghubungkan orang yang membutuhkan bantuan untuk task harian dengan helper yang bersedia membantu.",
  },
  {
    question: "Bagaimana cara membuat task?",
    answer:
      "Daftar atau masuk, kemudian jelaskan kebutuhan, lokasi, jadwal, kategori, dan budget task kamu.",
  },
  {
    question: "Bagaimana memilih Helper?",
    answer:
      "Lihat pelamar, profil, reputasi, komunikasikan detail melalui chat, lalu pilih helper yang paling sesuai.",
  },
  {
    question: "Apakah ada verifikasi pengguna?",
    answer:
      "HelpMe menyediakan proses pengajuan verifikasi identitas untuk membantu membangun profil yang lebih terpercaya.",
  },
  {
    question: "Bagaimana pembayaran dilakukan?",
    answer:
      "Transaksi yang menggunakan sistem pembayaran HelpMe diproses melalui layanan pembayaran terintegrasi dan statusnya tercatat di sistem.",
  },
  {
    question: "Bagaimana jika ada masalah?",
    answer:
      "Gunakan fitur laporan untuk melaporkan aktivitas atau masalah yang perlu ditinjau melalui sistem moderasi HelpMe.",
  },
];

export default function MobileFAQSection() {
  return (
    <section
      id="faq-mobile"
      className="
        bg-slate-50
        px-5
        py-12
      "
    >
      {/* HEADER */}
      <div>
        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-indigo-100
            px-3
            py-2
            text-[10px]
            font-black
            text-indigo-700
          "
        >
          <CircleHelp
            className="h-4 w-4"
          />

          FAQ
        </div>

        <h2
          className="
            mt-4
            text-2xl
            font-black
            leading-tight
            tracking-[-0.03em]
            text-slate-950
          "
        >
          Pertanyaan yang sering{" "}
          <span className="text-indigo-600">
            ditanyakan
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
          Kenali cara HelpMe bekerja sebelum mulai
          menggunakan platform.
        </p>
      </div>

      {/* FAQ */}
      <div className="mt-7 space-y-2.5">
        {faqs.map(
          ({
            question,
            answer,
          }) => (
            <details
              key={question}
              className="
                group
                rounded-[20px]
                border
                border-slate-200
                bg-white
                open:border-indigo-200
              "
            >
              <summary
                className="
                  flex
                  cursor-pointer
                  list-none
                  items-center
                  justify-between
                  gap-4
                  px-4
                  py-4
                  [&::-webkit-details-marker]:hidden
                "
              >
                <span
                  className="
                    text-xs
                    font-black
                    leading-5
                    text-slate-900
                  "
                >
                  {question}
                </span>

                <div
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-50
                    text-slate-400
                    group-open:bg-indigo-50
                    group-open:text-indigo-600
                  "
                >
                  <ChevronDown
                    className="
                      h-3.5
                      w-3.5
                      transition-transform
                      group-open:rotate-180
                    "
                  />
                </div>
              </summary>

              <div
                className="
                  border-t
                  border-slate-100
                  px-4
                  pb-4
                  pt-3
                "
              >
                <p
                  className="
                    text-[11px]
                    leading-5
                    text-slate-500
                  "
                >
                  {answer}
                </p>
              </div>
            </details>
          ),
        )}
      </div>
    </section>
  );
}