"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase }
  from "@/lib/supabase/client";

import {
  useRouter,
} from "next/navigation";

import {
  getMyNotifications,
  markNotificationAsRead,
} from "@/features/notifications/services/notification.service";

interface Notification {
  id: string;

  title: string;

  message: string;

  type: string;

  is_read: boolean;

  created_at: string;

  task_id?: string;

  redirect_url?: string;
}

function getNotificationIcon(
  type: string
) {

  switch (type) {

    case "APPLY_TASK":
      return "🙋";

    case "TASK_ACCEPTED":
      return "🤝";

    case "TASK_CANCELLED":
      return "❌";

    case "NEW_REVIEW":
      return "⭐";

    default:
      return "🔔";
  }
}

export default function NotificationsPage() {

  const router =
    useRouter();

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadNotifications() {

    try {

      const data =
        await getMyNotifications();

      setNotifications(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  async function handleRead(
    notification: Notification
  ) {

    try {

      await markNotificationAsRead(
        notification.id
      );

      setNotifications((prev) =>
        prev.map((item) => {

          if (
            item.id ===
            notification.id
          ) {
            return {
              ...item,
              is_read: true,
            };
          }

          return item;
        })
      );

      /* =========================
         REDIRECT
      ========================= */

      if (
        notification.redirect_url
      ) {

        router.push(
          notification.redirect_url
        );
      }

    } catch (error) {

      console.error(error);
    }
  }

  useEffect(() => {
    loadNotifications();

    /* =========================
       REALTIME NOTIFICATIONS
    ========================= */

    const channel =
      supabase.channel(
        "realtime-notifications"
      );

    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      async () => {

        await loadNotifications();
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };

  }, []);

  return (

    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-3xl px-6 py-8">

        {/* HEADER */}
        <div>

          <h1
            className="
              text-xl
              font-black
              tracking-tight
              text-slate-900
            "
          >
            Notifications
          </h1>

          <p
            className="
              text-base
              mt-1
              text-slate-500
            "
          >
            Semua aktivitas akun kamu
          </p>

        </div>

        {/* LOADING */}
        {loading && (

          <div className="mt-8">
            Memuat notifikasi...
          </div>

        )}

        {/* EMPTY */}
        {!loading &&
          notifications.length === 0 && (

            <div
              className="
              mt-8
              rounded-4xl
              border
              border-dashed
              border-slate-200
              bg-white
              p-10
              text-center
            "
            >

              <p className="text-slate-500">
                Belum ada notifikasi
              </p>

            </div>
          )}

        {/* LIST */}
        <div className="mt-8 grid gap-4">

          {notifications.map(
            (notification) => (

              <button
                key={notification.id}

                onClick={() =>
                  handleRead(
                    notification
                  )
                }

                className={`
                rounded-4xl
                border
                p-6
                text-left
                transition

                ${notification.is_read
                    ? `
                      border-slate-200
                      bg-white
                    `
                    : `
                      border-indigo-200
                      bg-indigo-50
                    `
                  }
              `}
              >

                {/* TOP */}
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="text-lg">

                      {getNotificationIcon(
                        notification.type
                      )}

                    </span>

                    <h2
                      className="
      text-sm
      font-bold
      text-slate-900
    "
                    >
                      {notification.title}
                    </h2>

                  </div>

                  {!notification.is_read && (

                    <div
                      className="
                      h-2
                      w-2
                      rounded-full
                      bg-indigo-600
                    "
                    />

                  )}

                </div>

                {/* MESSAGE */}
                <p
                  className="
                  text-sm
                  mt-2
                  leading-5
                  text-slate-600
                "
                >
                  {notification.message}
                </p>

                {/* DATE */}
                <p
                  className="
                  mt-3
                  text-xs
                  text-slate-400
                "
                >
                  {new Date(
                    notification.created_at
                  ).toLocaleString("id-ID")}
                </p>

              </button>
            ))}

        </div>

      </div>

    </main>
  );
}