interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    id: string;
    full_name: string;
  }[];
}

interface Props {
  review: Review;
}

export default function ReviewCard({ review }: Props) {
  const reviewer = review.reviewer?.[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="
                 font-semibold
                 text-sm  
                
                 "
                 >
            {reviewer?.full_name || "Pengguna"}
          </p>

          <p className="text-[10px] text-slate-500">
            {new Date(review.created_at).toLocaleDateString("id-ID")}
          </p>
        </div>

        <div className="font-bold text-amber-500">
          ⭐ {review.rating}/5
        </div>
      </div>

      {review.comment && (
        <p className="mt-2 text-sm leading-4 text-slate-600">
          {review.comment}
        </p>
      )}
    </div>
  );
}