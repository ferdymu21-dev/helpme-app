import {
  ChevronDown,
  CircleHelp,
} from "lucide-react";

const faqs = [
  {
    question: "Apa itu HelpMe?",
    answer:
      "HelpMe adalah platform yang membantu menghubungkan orang yang membutuhkan bantuan untuk task harian dengan helper yang bersedia mengerjakannya.",
  },
  {
    question: "Bagaimana cara membuat task?",
    answer:
      "Daftar atau masuk ke HelpMe, kemudian buat task dengan menjelaskan kebutuhan, menentukan lokasi, jadwal, kategori, serta budget yang sesuai.",
  },
  {
    question: "Bagaimana saya memilih Helper?",
    answer:
      "Helper dapat mengajukan lamaran pada task yang tersedia. Kamu dapat melihat profil dan reputasi pelamar, berkomunikasi melalui chat, lalu memilih helper yang paling sesuai.",
  },
  {
    question: "Apakah pengguna HelpMe dapat diverifikasi?",
    answer:
      "Ya. HelpMe menyediakan proses pengajuan verifikasi identitas. Status verifikasi membantu pengguna mengenali profil yang telah melalui proses tersebut.",
  },
  {
    question: "Bagaimana pembayaran di HelpMe?",
    answer:
      "Untuk transaksi yang menggunakan sistem pembayaran HelpMe, proses pembayaran dilakukan melalui layanan pembayaran yang terintegrasi dan status transaksinya tercatat di sistem.",
  },
  {
    question: "Bagaimana jika terjadi masalah pada task?",
    answer:
      "Pengguna dapat menggunakan fitur laporan untuk melaporkan aktivitas atau permasalahan yang perlu ditinjau melalui sistem moderasi HelpMe.",
  },
];

export default function DesktopFAQSection() {
  return (
    <section
      id="faq"
      className="
        bg-slate-50
        px-8
        py-24
      "
    >
      <div
        className="
          mx-auto
          grid
          max-w-7xl
          grid-cols-[0.75fr_1.25fr]
          gap-16
        "
      >
        {/* =========================
            LEFT
        ========================= */}
        <div>
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-indigo-100
              bg-indigo-50
              px-4
              py-2
              text-xs
              font-bold
              text-indigo-700
            "
          >
            <CircleHelp
              className="h-4 w-4"
              strokeWidth={2}
            />

            Pertanyaan Umum
          </div>

          <h2
            className="
              mt-5
              max-w-lg
              text-4xl
              font-black
              leading-tight
              tracking-[-0.035em]
              text-slate-950
            "
          >
            Masih punya{" "}
            <span className="text-indigo-600">
              pertanyaan?
            </span>
          </h2>

          <p
            className="
              mt-4
              max-w-md
              text-sm
              leading-7
              text-slate-500
            "
          >
            Beberapa hal penting yang perlu diketahui
            sebelum mulai menggunakan HelpMe.
          </p>

          {/* SUPPORT BOX */}
          <div
            className="
              mt-8
              rounded-[26px]
              border
              border-slate-200
              bg-white
              p-6
              shadow-[0_12px_35px_rgba(15,23,42,0.04)]
            "
          >
            <p
              className="
                text-sm
                font-black
                text-slate-900
              "
            >
              HelpMe dibuat untuk proses yang sederhana.
            </p>

            <p
              className="
                mt-2
                text-xs
                leading-6
                text-slate-500
              "
            >
              Buat task, temukan helper, komunikasikan
              kebutuhan, selesaikan pekerjaan, kemudian
              bangun reputasi melalui rating dan review.
            </p>
          </div>
        </div>

        {/* =========================
            FAQ LIST
        ========================= */}
        <div className="space-y-3">
          {faqs.map(
            ({
              question,
              answer,
            }) => (
              <details
                key={question}
                className="
                  group
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  transition
                  open:border-indigo-200
                  open:shadow-[0_14px_35px_rgba(15,23,42,0.05)]
                "
              >
                <summary
                  className="
                    flex
                    cursor-pointer
                    list-none
                    items-center
                    justify-between
                    gap-6
                    px-6
                    py-5
                    [&::-webkit-details-marker]:hidden
                  "
                >
                  <span
                    className="
                      text-sm
                      font-black
                      text-slate-900
                    "
                  >
                    {question}
                  </span>

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-slate-50
                      text-slate-400
                      transition
                      group-open:bg-indigo-50
                      group-open:text-indigo-600
                    "
                  >
                    <ChevronDown
                      className="
                        h-4
                        w-4
                        transition-transform
                        duration-200
                        group-open:rotate-180
                      "
                      strokeWidth={2}
                    />
                  </div>
                </summary>

                <div
                  className="
                    border-t
                    border-slate-100
                    px-6
                    pb-6
                    pt-4
                  "
                >
                  <p
                    className="
                      max-w-2xl
                      text-sm
                      leading-7
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
      </div>
    </section>
  );
}