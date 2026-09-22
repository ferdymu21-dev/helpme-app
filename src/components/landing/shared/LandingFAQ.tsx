"use client";

import { useState } from "react";

import {
  ChevronDown,
  CircleHelp,
  MessageCircleQuestion,
  ShieldCheck,
} from "lucide-react";

const faqs = [
  {
    question: "Apa itu HelpMe?",
    answer:
      "HelpMe adalah platform yang menghubungkan orang yang membutuhkan bantuan dengan orang atau penyedia jasa. Kamu dapat membuat Permintaan Bantuan untuk kebutuhan yang spesifik atau mencari Jasa yang sudah tersedia.",
  },
  {
    question:
      "Apa bedanya Permintaan Bantuan dan Jasa?",
    answer:
      "Permintaan Bantuan dibuat ketika kamu ingin menjelaskan kebutuhanmu sendiri dan mencari orang yang dapat membantu. Jasa adalah layanan yang sudah ditawarkan oleh penyedia sehingga kamu dapat melihat detailnya terlebih dahulu lalu mengirim Permintaan Jasa.",
  },
  {
    question:
      "Bagaimana memilih orang yang membantu?",
    answer:
      "Periksa informasi profil dan layanan yang tersedia, lalu gunakan chat untuk membahas kebutuhan, waktu, lokasi, harga, dan detail pekerjaan. Pastikan kedua pihak memahami kesepakatan sebelum pekerjaan dimulai.",
  },
  {
    question:
      "Apakah pengguna HelpMe dapat diverifikasi?",
    answer:
      "HelpMe menyediakan proses verifikasi identitas untuk membantu memberikan konteks identitas yang lebih jelas. Status verifikasi dapat menjadi salah satu informasi yang dipertimbangkan sebelum berinteraksi, tetapi tetap periksa detail profil dan komunikasikan kebutuhan dengan baik.",
  },
  {
    question:
      "Bagaimana pembayaran dilakukan?",
    answer:
      "Nominal, metode, dan waktu pembayaran ditentukan berdasarkan kesepakatan antara pengguna dan penyedia jasa. HelpMe saat ini tidak menyimpan atau menahan dana transaksi (escrow), sehingga pembayaran dilakukan langsung antara kedua pihak.",
  },
  {
    question:
      "Bagaimana jika terjadi masalah?",
    answer:
      "Jika kamu menemukan aktivitas atau perilaku yang perlu ditinjau, gunakan fitur laporan di HelpMe. Sertakan informasi yang relevan agar laporan dapat diperiksa dengan lebih jelas.",
  },
];

interface LandingFAQProps {
  sectionId: string;
}

export default function LandingFAQ({
  sectionId,
}: LandingFAQProps) {
  const [
    activeIndex,
    setActiveIndex,
  ] = useState<number | null>(0);

  return (
    <section
      id={sectionId}
      className="
        scroll-mt-20
        bg-slate-50/70
        px-4
        py-7
        sm:px-5
        lg:px-8
        lg:py-20
      "
    >
      <div
        className="
          mx-auto
          grid
          max-w-7xl
          gap-5
          lg:grid-cols-[0.72fr_1.28fr]
          lg:gap-8
        "
      >
        {/* INTRO */}
        <div
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-indigo-950
            p-5
            sm:p-6
            lg:rounded-4xl
            lg:p-8
          "
        >
          <div
            aria-hidden="true"
            className="
              absolute
              -right-16
              -top-16
              h-48
              w-48
              rounded-full
              border
              border-white/10
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute
              right-5
              top-6
              h-24
              w-24
              rounded-full
              border
              border-white/5
            "
          />

          <div className="relative">
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/10
                bg-white/5
                px-3
                py-1.5
              "
            >
              <CircleHelp
                aria-hidden="true"
                className="
                  h-3.5
                  w-3.5
                  text-indigo-300
                "
                strokeWidth={2}
              />

              <span
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.13em]
                  text-indigo-300
                "
              >
                Pertanyaan umum
              </span>
            </div>

            <h2
              className="
                mt-5
                max-w-md
                text-2xl
                font-black
                leading-[1.12]
                tracking-[-0.04em]
                text-white
                sm:text-3xl
                lg:text-[38px]
              "
            >
              Ada yang masih ingin kamu
              ketahui?
            </h2>

            <p
              className="
                mt-4
                max-w-sm
                text-sm
                leading-6
                text-slate-400
                lg:text-base
                lg:leading-7
              "
            >
              Temukan jawaban singkat tentang
              cara menggunakan HelpMe,
              verifikasi, pembayaran, dan
              pelaporan.
            </p>

            <div
              className="
                mt-8
                grid
                grid-cols-2
                gap-2
              "
            >
              {[
                "Permintaan",
                "Jasa",
                "Verifikasi",
                "Pembayaran",
              ].map((topic) => (
                <div
                  key={topic}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    px-3
                    py-2.5
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-indigo-400
                    "
                  />

                  <span
                    className="
                      text-[10px]
                      font-bold
                      text-slate-300
                    "
                  >
                    {topic}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="
                mt-6
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-3.5
              "
            >
              <ShieldCheck
                aria-hidden="true"
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-indigo-300
                "
                strokeWidth={2}
              />

              <p
                className="
                  text-[10px]
                  leading-5
                  text-slate-400
                "
              >
                Tetap periksa informasi profil
                dan sepakati detail pekerjaan
                sebelum bantuan dimulai.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ LIST */}
        <div
          className="
            rounded-[28px]
            border
            border-slate-200
            bg-white
            p-3
            shadow-[0_18px_50px_rgba(15,23,42,0.05)]
            sm:p-4
            lg:rounded-4xl
            lg:p-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              px-2
              pb-4
              pt-2
              lg:px-3
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-indigo-50
                text-indigo-600
              "
            >
              <MessageCircleQuestion
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={2}
              />
            </div>

            <div>
              <p
                className="
                  text-sm
                  font-black
                  text-slate-900
                  lg:text-base
                "
              >
                Yang sering ditanyakan
              </p>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-slate-500
                  lg:text-xs
                "
              >
                Tekan pertanyaan untuk melihat
                jawabannya.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {faqs.map(
              (
                {
                  question,
                  answer,
                },
                index,
              ) => {
                const isOpen =
                  activeIndex === index;

                return (
                  <article
                    key={question}
                    className={`
                      overflow-hidden
                      rounded-2xl
                      border
                      transition
                      duration-200

                      ${
                        isOpen
                          ? `
                            border-indigo-200
                            bg-indigo-50/45
                          `
                          : `
                            border-slate-200
                            bg-white
                            hover:border-slate-300
                          `
                      }
                    `}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setActiveIndex(
                          isOpen
                            ? null
                            : index,
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-4
                        px-4
                        py-4
                        text-left
                        sm:px-5
                      "
                    >
                      <span
                        className="
                          text-xs
                          font-black
                          leading-5
                          text-slate-900
                          sm:text-sm
                          lg:text-[15px]
                        "
                      >
                        {question}
                      </span>

                      <span
                        className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          transition
                          duration-200

                          ${
                            isOpen
                              ? `
                                bg-indigo-600
                                text-white
                              `
                              : `
                                bg-slate-50
                                text-slate-500
                              `
                          }
                        `}
                      >
                        <ChevronDown
                          aria-hidden="true"
                          className={`
                            h-4
                            w-4
                            transition-transform
                            duration-200

                            ${
                              isOpen
                                ? "rotate-180"
                                : ""
                            }
                          `}
                          strokeWidth={2}
                        />
                      </span>
                    </button>

                    <div
                      className={`
                        grid
                        transition-[grid-template-rows]
                        duration-200

                        ${
                          isOpen
                            ? "grid-rows-[1fr]"
                            : "grid-rows-[0fr]"
                        }
                      `}
                    >
                      <div className="overflow-hidden">
                        <p
                          className="
                            px-4
                            pb-4
                            text-[11px]
                            leading-5
                            text-slate-600
                            sm:px-5
                            sm:pb-5
                            sm:text-xs
                            lg:text-sm
                            lg:leading-6
                          "
                        >
                          {answer}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
}