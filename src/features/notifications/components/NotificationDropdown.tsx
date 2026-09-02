"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { useNotifications } from "../hooks/useNotifications";

import { getNotificationIcon } from "../utils/getNotificationIcon";

import { recordCampaignClickAction } from "@/features/campaigns/actions";

export default function NotificationDropdown() {
  const router = useRouter();

  const {
    notifications,

    loading,

    readNotification,
  } = useNotifications();

  async function handleClick(notification: (typeof notifications)[number]) {
    try {
      await readNotification(notification.id);
    } catch (error) {
      console.error("Gagal menandai notification sebagai read:", error);

      return;
    }

    try {
      await recordCampaignClickAction(notification.id);
    } catch (error) {
      console.error("Gagal mencatat campaign click:", error);
    }

    router.push(notification.redirect_url ?? "/notifications");
  }

  const latestNotifications = notifications.slice(0, 5);

  return (
    <div
      className="
        absolute
        right-0
        top-14
        z-50
        w-96
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-2xl
      "
    >
      {/* HEADER */}

      <div
        className="
          border-b
          p-5
        "
      >
        <h2
          className="
            text-lg
            font-bold
          "
        >
          Notifications
        </h2>
      </div>

      {/* CONTENT */}

      <div
        className="
          max-h-96
          overflow-y-auto
        "
      >
        {loading && (
          <div
            className="
              p-6
              text-center
              text-sm
              text-slate-500
            "
          >
            Memuat...
          </div>
        )}

        {!loading && latestNotifications.length === 0 && (
          <div
            className="
              p-6
              text-center
              text-sm
              text-slate-500
            "
          >
            Belum ada notifikasi.
          </div>
        )}

        {latestNotifications.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={`
                flex
                w-full
                gap-3
                border-b
                p-4
                text-left
                transition
                hover:bg-slate-50

                ${item.is_read ? "bg-white" : "bg-indigo-50"}
              `}
          >
            <div className="text-xl">{getNotificationIcon(item.type)}</div>

            <div className="flex-1">
              <p
                className="text-sm font-semibold">
                {item.title}
              </p>

              <p
                className="
                    mt-1
                    line-clamp-2
                    text-xs
                    text-slate-500
                  "
              >
                {item.message}
              </p>
            </div>

            {!item.is_read && (
              <div
                className="
                    mt-2
                    h-2
                    w-2
                    rounded-full
                    bg-indigo-600
                  "
              />
            )}
          </button>
        ))}
      </div>

      {/* FOOTER */}

      <Link
        href="/notifications"
        className="
          block
          border-t
          p-4
          text-center
          font-semibold
          text-indigo-600
          hover:bg-slate-50
        "
      >
        Lihat Semua →
      </Link>
    </div>
  );
}