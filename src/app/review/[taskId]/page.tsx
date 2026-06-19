"use client";

import {
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { supabase }
from "@/lib/supabase/client";

import {
  createNotification,
} from "@/features/notifications/services/notification.service";

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
            params.taskId
          )
          .single();

      if (!task) {
        alert("Task tidak ditemukan");
        return;
      }

      /* CURRENT USER */
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) return;

      /* INSERT REVIEW */
      const { error } =
        await supabase
          .from("reviews")
          .insert({
            task_id: task.id,

            reviewer_id:
              user.id,

            reviewer_user_id:
              task.selected_helper_id,

            rating,

            comment,
          });

      if (error) {
        console.error(error);

        alert(
          "Gagal mengirim review"
        );

        return;
      }

      /* ========================= 
         CREATE NOTIFICATION 
      ========================= */ 
      
      await createNotification({ 
        userId: 
          task.selected_helper_id, 
          
        title: "Review Baru", 
        message: 
          "Terima kasih! Anda menerima ulasan baru", 
        
        type: "NEW_REVIEW", 
      });


      alert(
        "Terima kasih atas ulasannya"
      );

      router.push("/home");

    } catch (error) {

      console.error(error);

      alert(
        "Terjadi kesalahan"
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-xl px-6 py-10">

        {/* HEADER */}
        <div>

          <h1
            className="
              text-4xl
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Beri Review
          </h1>

          <p
            className="
              mt-3
              text-slate-500
            "
          >
            Bagikan pengalamanmu
            dengan helper.
          </p>

        </div>

        {/* CARD */}
        <div
          className="
            mt-8
            rounded-4xl
            bg-white
            p-6
            shadow-[0_10px_30px_rgba(15,23,42,0.05)]
          "
        >

          {/* RATING */}
          <div>

            <label
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Rating
            </label>

            <div className="mt-4 flex gap-3">

              {[1,2,3,4,5].map((star) => (

                <button
                  key={star}
                  onClick={() =>
                    setRating(star)
                  }
                  className={`
                    text-4xl
                    transition

                    ${
                      rating >= star
                        ? "opacity-100"
                        : "opacity-30"
                    }
                  `}
                >
                  ⭐
                </button>
              ))}

            </div>

          </div>

          {/* COMMENT */}
          <div className="mt-8">

            <label
              className="
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Komentar
            </label>

            <textarea
              value={comment}
              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }
              placeholder="
               Bagaimana pengalamanmu?"
              className="
                mt-3
                h-36
                w-full
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-5
                outline-none
              "
            />

          </div>

          {/* BUTTON */}
          <button
            onClick={handleSubmitReview}
            disabled={loading}
            className="
              mt-8
              flex
              h-14
              w-full
              items-center
              justify-center
              rounded-2xl
              bg-slate-900
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-slate-800
              disabled:opacity-50
            "
          >
            {loading
              ? "Mengirim..."
              : "Kirim Review"}
          </button>

        </div>

      </div>

    </main>
  );
}