"use client";

import { useState } from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  CheckCircle2,
  HeartHandshake,
  LoaderCircle,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

import { submitReviewAction } from "@/features/reviews/actions/server";

const RATING_LABELS: Record<
  number,
  {
    label: string;
    description: string;
  }
> = {
  1: {
    label: "Kurang baik",
    description:
      "Pengalaman Anda masih jauh dari harapan.",
  },

  2: {
    label: "Perlu diperbaiki",
    description:
      "Ada beberapa hal yang sebaiknya ditingkatkan.",
  },

  3: {
    label: "Cukup baik",
    description:
      "Pengalaman berjalan cukup baik secara keseluruhan.",
  },

  4: {
    label: "Sangat baik",
    description:
      "Pengalaman Anda bersama helper berjalan dengan baik.",
  },

  5: {
    label: "Luar biasa",
    description:
      "Helper memberikan pengalaman yang sangat memuaskan.",
  },
};

export default function ReviewPage() {
  const params = useParams();

  const router = useRouter();

  const [rating, setRating] =
    useState(5);

  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmitReview() {
    try {
      setLoading(true);

      /* GET TASK */
      const { data: task } =
        await supabase
          .from("tasks")
          .select("*")
          .eq(
            "id",
            params.taskId,
          )
          .single();

      if (!task) {
        alert(
          "Task tidak ditemukan",
        );

        return;
      }

      /* INSERT REVIEW */
      await submitReviewAction({
        taskId: task.id,

        rating,

        comment,
      });

      alert(
        "Terima kasih atas ulasannya",
      );

      router.push("/home");
    } catch (error) {
      console.error(error);

      alert(
        "Terjadi kesalahan",
      );
    } finally {
      setLoading(false);
    }
  }

  const ratingPresentation =
    RATING_LABELS[rating];

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-slate-50
        px-5
        py-8
        sm:px-6
        lg:px-8
        lg:py-12
      "
    >
      {/* DESKTOP BACKGROUND */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          hidden
          h-105
          bg-linear-to-b
          from-indigo-50
          via-violet-50/40
          to-transparent
          lg:block
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -top-32
          right-10
          hidden
          h-96
          w-96
          rounded-full
          bg-indigo-100/50
          blur-3xl
          lg:block
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-5xl
        "
      >
        {/* HEADER */}
        <header
          className="
            mx-auto
            max-w-2xl
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-emerald-50
              text-emerald-600
              shadow-sm
            "
          >
            <CheckCircle2
              className="h-7 w-7"
              strokeWidth={2}
            />
          </div>

          <div
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-emerald-100
              bg-white/90
              px-3.5
              py-2
              text-xs
              font-bold
              text-emerald-700
              shadow-sm
              backdrop-blur
            "
          >
            <Sparkles
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />

            Task Selesai
          </div>

          <h1
            className="
              mt-4
              text-3xl
              font-black
              tracking-[-0.03em]
              text-slate-950
              sm:text-4xl
            "
          >
            Bagaimana pengalaman Anda?
          </h1>

          <p
            className="
              mx-auto
              mt-3
              max-w-xl
              text-sm
              leading-6
              text-slate-500
              sm:text-[15px]
              sm:leading-7
            "
          >
            Bagikan pengalaman Anda bersama helper.
            Review yang jujur membantu membangun
            reputasi dan kepercayaan di komunitas
            HelpMe.
          </p>
        </header>

        {/* MAIN */}
        <div
          className="
            mt-8
            grid
            items-start
            gap-5
            lg:grid-cols-[minmax(0,1fr)_300px]
            lg:gap-6
          "
        >
          {/* REVIEW FORM */}
          <section
            className="
              rounded-[28px]
              border
              border-slate-200
              bg-white
              p-5
              shadow-[0_12px_32px_rgba(15,23,42,0.05)]
              sm:p-7
            "
          >
            {/* RATING */}
            <div>
              <div
                className="
                  flex
                  items-start
                  gap-3
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
                    bg-amber-50
                    text-amber-500
                  "
                >
                  <Star
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <h2
                    className="
                      text-xs
                      font-black
                      text-slate-900
                    "
                  >
                    Berikan rating
                  </h2>

                  <p
                    className="
                      mt-0.5
                      text-sm
                      leading-5
                      text-slate-500
                    "
                  >
                    Pilih nilai yang paling menggambarkan
                    pengalaman Anda.
                  </p>
                </div>
              </div>

              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-center
                  gap-2
                  sm:gap-3
                "
              >
                {[1, 2, 3, 4, 5].map(
                  (star) => {
                    const selected =
                      rating >= star;

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setRating(
                            star,
                          )
                        }
                        aria-label={`${star} dari 5 bintang`}
                        aria-pressed={
                          rating ===
                          star
                        }
                        className="
                          group
                          flex
                          h-12
                          w-12
                          items-center
                          justify-center
                          rounded-2xl
                          transition
                          hover:bg-amber-50
                          focus-visible:outline-none
                          focus-visible:ring-4
                          focus-visible:ring-amber-100
                          active:scale-95
                          sm:h-14
                          sm:w-14
                        "
                      >
                        <Star
                          className={`
                            h-8
                            w-8
                            transition
                            sm:h-9
                            sm:w-9

                            ${
                              selected
                                ? "fill-amber-400 text-amber-400"
                                : "fill-transparent text-slate-200 group-hover:text-amber-300"
                            }
                          `}
                          strokeWidth={
                            1.8
                          }
                        />
                      </button>
                    );
                  },
                )}
              </div>

              {/* RATING DESCRIPTION */}
              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-amber-100
                  bg-amber-50/60
                  px-4
                  py-3.5
                  text-center
                "
              >
                <p
                  className="
                    text-sm
                    font-black
                    text-amber-800
                  "
                >
                  {
                    ratingPresentation.label
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-amber-700/80
                  "
                >
                  {
                    ratingPresentation.description
                  }
                </p>
              </div>
            </div>

            {/* COMMENT */}
            <div
              className="
                mt-7
                border-t
                border-slate-100
                pt-7
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
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
                  <MessageSquareText
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <label
                      htmlFor="review-comment"
                      className="
                        text-xs
                        font-black
                        text-slate-900
                      "
                    >
                      Ceritakan pengalaman Anda
                    </label>

                    <span
                      className="
                        rounded-full
                        bg-slate-100
                        px-2
                        py-1
                        text-[9px]
                        font-bold
                        text-slate-400
                      "
                    >
                      Opsional
                    </span>
                  </div>

                  <p
                    className="
                      mt-0.5
                      text-sm
                      leading-5
                      text-slate-500
                    "
                  >
                    Ulasan yang jelas akan membantu
                    pengguna lain mengenal kualitas
                    helper.
                  </p>
                </div>
              </div>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value,
                  )
                }
                disabled={loading}
                placeholder="Contoh: Helper datang tepat waktu, komunikatif, dan menyelesaikan task dengan baik."
                className="
                  mt-5
                  min-h-38
                  w-full
                  resize-y
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-4
                  text-sm
                  leading-6
                  text-slate-700
                  outline-none
                  transition
                  placeholder:text-slate-300
                  focus:border-indigo-300
                  focus:bg-white
                  focus:ring-4
                  focus:ring-indigo-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <p
                  className="
                    text-[10px]
                    leading-4
                    text-slate-400
                  "
                >
                  Hindari membagikan informasi pribadi
                  atau sensitif.
                </p>

                <p
                  className="
                    shrink-0
                    text-[10px]
                    font-medium
                    text-slate-400
                  "
                >
                  {
                    comment.length
                  }{" "}
                  karakter
                </p>
              </div>
            </div>

            {/* SUBMIT */}
            <div
              className="
                mt-7
                border-t
                border-slate-100
                pt-6
              "
            >
              <button
                type="button"
                onClick={
                  handleSubmitReview
                }
                disabled={loading}
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-indigo-600
                  px-5
                  text-sm
                  font-bold
                  text-white
                  shadow-[0_8px_20px_rgba(79,70,229,0.2)]
                  transition
                  hover:bg-indigo-700
                  active:scale-[0.995]
                  disabled:cursor-not-allowed
                  disabled:bg-indigo-300
                  disabled:shadow-none
                "
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                      strokeWidth={2}
                    />

                    Mengirim review...
                  </>
                ) : (
                  <>
                    <HeartHandshake
                      className="h-4 w-4"
                      strokeWidth={2}
                    />

                    Kirim Review
                  </>
                )}
              </button>

              <p
                className="
                  mt-3
                  text-center
                  text-[10px]
                  leading-4
                  text-slate-400
                "
              >
                Pastikan rating sudah sesuai sebelum
                mengirim review.
              </p>
            </div>
          </section>

          {/* SIDEBAR */}
          <aside
            className="
              space-y-4
              lg:sticky
              lg:top-6
            "
          >
            <section
              className="
                rounded-[28px]
                border
                border-indigo-100
                bg-white
                p-5
                shadow-[0_10px_28px_rgba(15,23,42,0.04)]
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-indigo-50
                  text-indigo-600
                "
              >
                <ShieldCheck
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </div>

              <h3
                className="
                  mt-4
                  text-sm
                  font-black
                  text-slate-900
                "
              >
                Review membangun kepercayaan
              </h3>

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Rating dan ulasan membantu komunitas
                HelpMe memahami pengalaman nyata dari
                task yang telah selesai.
              </p>

              <div
                className="
                  mt-4
                  space-y-3
                  border-t
                  border-slate-100
                  pt-4
                "
              >
                {[
                  "Berikan rating sesuai pengalaman sebenarnya.",
                  "Gunakan bahasa yang jelas dan sopan.",
                  "Fokus pada pengalaman selama task berlangsung.",
                ].map(
                  (item) => (
                    <div
                      key={item}
                      className="
                        flex
                        items-start
                        gap-2
                      "
                    >
                      <CheckCircle2
                        className="
                          mt-0.5
                          h-4
                          w-4
                          shrink-0
                          text-emerald-500
                        "
                        strokeWidth={2}
                      />

                      <p
                        className="
                          text-[11px]
                          leading-5
                          text-slate-500
                        "
                      >
                        {item}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>

            <section
              className="
                rounded-[28px]
                border
                border-slate-200
                bg-white
                p-5
                shadow-[0_10px_28px_rgba(15,23,42,0.035)]
              "
            >
              <div className="flex gap-3">
                <Sparkles
                  className="
                    mt-0.5
                    h-5
                    w-5
                    shrink-0
                    text-amber-500
                  "
                  strokeWidth={2}
                />

                <div>
                  <p
                    className="
                      text-xs
                      font-black
                      text-slate-800
                    "
                  >
                    Terima kasih
                  </p>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      leading-5
                      text-slate-500
                    "
                  >
                    Kontribusi kecil melalui review membantu
                    menciptakan marketplace jasa yang lebih
                    terpercaya untuk semua pengguna HelpMe.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}