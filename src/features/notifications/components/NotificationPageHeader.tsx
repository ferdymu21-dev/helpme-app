"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCheck,
  Search,
} from "lucide-react";

interface Props {
  totalNotifications?: number;
  keyword: string;
  onKeywordChange: (value: string) => void;
  hasUnread: boolean;
  onMarkAllRead: () => void | Promise<void>;
}

export default function NotificationPageHeader({
  totalNotifications = 0,
  keyword,
  onKeywordChange,
  hasUnread,
  onMarkAllRead,
}: Props) {
  const router = useRouter();

  return (
    <header className="mb-8">
      {/* TOP HEADER */}
      <div
        className="
          grid
          grid-cols-[2.5rem_1fr_2.5rem]
          items-center
          gap-3
        "
      >
        {/* BACK */}
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Kembali"
          className="
            relative
            z-10
            inline-flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-700
            shadow-sm
            transition
            hover:bg-slate-50
            active:scale-95
          "
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>

        {/* TITLE */}
        <div className="min-w-0 text-center">
          <h1
            className="
              text-base
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Notifikasi
          </h1>

          <p
            className="
              mt-1
              truncate
              text-xs
              text-slate-500
            "
          >
            Semua aktivitas akun kamu
          </p>
        </div>

        {/* MARK ALL READ */}
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={!hasUnread}
          aria-label="Tandai semua sebagai dibaca"
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            transition-all
            duration-150
            active:scale-[0.95]
            active:brightness-95

            ${
              hasUnread
                ? `
                    bg-indigo-600
                    text-white
                    hover:bg-indigo-700
                  `
                : `
                    cursor-not-allowed
                    bg-slate-100
                    text-slate-400
                  `
            }
          `}
        >
          <CheckCheck size={18} />
        </button>
      </div>

      {/* SEARCH */}
      <div className="mt-4 w-full max-w-sm">
        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            shadow-sm
          "
        >
          <Search
            size={18}
            className="shrink-0 text-slate-400"
          />

          <input
            value={keyword}
            onChange={(event) =>
              onKeywordChange(event.target.value)
            }
            placeholder="Cari notifikasi..."
            className="
              w-full
              bg-transparent
              text-sm
              text-slate-900
              outline-none
              placeholder:text-slate-400
            "
          />
        </div>
      </div>
    </header>
  );
}