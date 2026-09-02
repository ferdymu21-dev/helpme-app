import {
  Heart,
  X,
} from "lucide-react";

interface Props {
  onClose?: () => void;
}

export default function DonationHeader({
  onClose,
}: Props) {
  return (
    <header
      className="
        shrink-0
        border-b
        border-slate-100
        bg-white
        px-5
        pb-4
        pt-3
        sm:px-6
        sm:pb-5
        sm:pt-5
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div
          className="
            flex
            min-w-0
            items-start
            gap-3
          "
        >
          <div
            className="
              hidden
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-rose-50
              text-rose-500
              sm:flex
            "
          >
            <Heart
              className="h-5 w-5"
              strokeWidth={2}
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.14em]
                text-indigo-600
              "
            >
              Support HelpMe
            </p>

            <h2
              id="support-modal-title"
              className="
                mt-1
                text-xl
                font-black
                tracking-tight
                text-slate-950
                sm:text-2xl
              "
            >
              Dukung perkembangan HelpMe
            </h2>

            <p
              className="
                mt-1
                max-w-md
                text-[11px]
                leading-5
                text-slate-500
                sm:text-xs
              "
            >
              Pilih nominal dukungan yang
              nyaman untuk Anda.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dukungan HelpMe"
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-400
            transition
            hover:border-slate-300
            hover:bg-slate-50
            hover:text-slate-700
          "
        >
          <X
            className="h-4 w-4"
            strokeWidth={2}
          />
        </button>
      </div>
    </header>
  );
}