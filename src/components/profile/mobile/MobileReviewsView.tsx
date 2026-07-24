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

export default function MobileReviewsView({
    reviews,
}: Props) {

    return (

        <div className="min-h-screen bg-slate-50 pb-32 lg:hidden">

            <div className="px-6 py-7">

                {/* REVIEWS */}
                <div className="mt-1">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2
                                className="
                   text-sm
                   font-bold
                 text-slate-900
                "
                            >
                                Reviews
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Feedback dari user lain
                            </p>

                        </div>

                        <div
                            className="
                rounded-xl
              bg-amber-100
                px-3
                py-2
                text-xs
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
        mt-4
        rounded-3xl
        border
        border-dashed
        border-slate-200
        bg-white
        p-8
        text-center
      "
                        >

                            <p className="text-sm text-slate-500">
                                Belum ada review
                            </p>

                        </div>

                    )}

                    {/* REVIEW LIST */}
                    <div className="mt-3 grid gap-4">

                        {reviews.map((review) => (

                            <div
                                key={review.id}
                                className="
          rounded-2xl
          bg-white
          p-5
          shadow-sm
        "
                            >

                                {/* TOP */}
                                <div className="flex items-center justify-between">

                                    <div>

                                        <h3
                                            className="
                      text-sm
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
                text-[10px]
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
              rounded-xl
            bg-amber-100
              px-3
              py-2
              text-xs
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
            mt-2
            text-sm
            leading-3
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

        </div>

    );

}