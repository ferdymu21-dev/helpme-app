"use client";

import {
    Search,
    CheckCheck,
} from "lucide-react";

interface Props {
    totalNotifications?: number;
    keyword: string;
    onKeywordChange: (
        value: string
    ) => void;
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

    return (

        <header
            className="
                mb-8
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

                {/* LEFT */}

                <div>

                    <h1
                        className="
                            text-xl
                            font-black
                            tracking-tight
                            text-slate-900
                        "
                    >
                        Notifikasi
                    </h1>

                    <p
                        className="
                            mt-2
                            text-xs
                            text-slate-500
                        "
                    >
                        Semua aktivitas akun kamu
                    </p>

                </div>

                <button

                    onClick={onMarkAllRead}
                    disabled={!hasUnread}
                    className={`
            flex
            items-center
            gap-2
            rounded-xl
            px-2
            py-2
            text-sm
            font-semibold
            transition-all
            active:brightness-95
            duration-150
            active:scale-[0.97]

            ${hasUnread

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

            {/* RIGHT */}

            <div
                className="
                       w-full
                       max-w-sm
                    "
            >

                <div
                    className="
                            mt-2.5
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
                        className="text-slate-400"
                    />

                    <input
                        value={keyword}
                        onChange={(e) =>
                            onKeywordChange(
                                e.target.value
                            )
                        }
                        placeholder="Cari notifikasi..."
                        className="
                                w-full
                                bg-transparent
                                text-sm
                                outline-none
                              placeholder:text-slate-400
                            "
                    />

                </div>

            </div>

        </header>

    );

}