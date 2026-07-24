"use client";

interface Props {
    reviews: {
        id: string;
        rating: number;
        comment: string;
        created_at: string;
        reviewer: {
            id: string;
            full_name: string;
        }[];
    }[];
}

export default function DesktopReviewsView({
    reviews,
}: Props) {

    return (

        <div className="mt-5">

            {/* REVIEWS */}
            <div
                className="
    rounded-4xl
    bg-white
    p-6
    shadow-[0_10px_30px_rgba(15,23,42,0.05)]
  "
            >

                <div className="flex items-center justify-between">

                    <div>

                        <h2
                            className="
          text-2xl
          font-black
          tracking-tight
          text-slate-900
        "
                        >
                            Reviews
                        </h2>

                        <p className="mt-1 text-slate-500">
                            Feedback dari user lain
                        </p>

                    </div>

                    <div
                        className="
        rounded-2xl
        bg-amber-100
        px-4
        py-2
        text-sm
        font-bold
        text-amber-600
      "
                    >
                        {reviews.length} Reviews
                    </div>

                </div>

                {/* EMPTY */}
                {reviews.length === 0 && (

                    <div
                        className="
        mt-6
        rounded-3xl
        border
        border-dashed
        border-slate-200
        p-10
        text-center
      "
                    >

                        <p className="text-slate-500">
                            Belum ada review
                        </p>

                    </div>

                )}

                {/* REVIEW LIST */}
                <div className="mt-6 grid gap-4">

                    {reviews.map((review) => (

                        <div
                            key={review.id}
                            className="
          rounded-3xl
          border
          border-slate-200
          bg-slate-50
          p-5
        "
                        >

                            {/* TOP */}
                            <div className="flex items-center justify-between">

                                <div>

                                    <h3
                                        className="
                font-semibold
                text-slate-900
              "
                                    >
                                        {review.reviewer?.[0]
                                            ?.full_name ||
                                            "Anonymous"}
                                    </h3>

                                    <p
                                        className="
                mt-1
                text-sm
                text-slate-400
              "
                                    >
                                        {new Date(
                                            review.created_at
                                        ).toLocaleDateString(
                                            "id-ID"
                                        )}
                                    </p>

                                </div>

                                <div
                                    className="
              rounded-2xl
              bg-amber-100
              px-3
              py-2
              text-sm
              font-bold
              text-amber-600
            "
                                >
                                    ⭐ {review.rating}/5
                                </div>

                            </div>

                            {/* COMMENT */}
                            <p
                                className="
            mt-4
            leading-8
            text-slate-600
          "
                            >
                                {review.comment}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}