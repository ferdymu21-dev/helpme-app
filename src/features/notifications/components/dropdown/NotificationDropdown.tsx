"use client";

import Link from "next/link";

import type {
  Notification,
} from "../../types/notification.types";

import NotificationCard from "../NotificationCard";

interface Props {

  notifications: Notification[];

  onRead: (
    notification: Notification
  ) => void;

}

export default function NotificationDropdown({

  notifications,

  onRead,

}: Props) {

  return (

    <div
      className="
        absolute
        right-0
        top-14
        z-50
        w-95
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
          flex
          items-center
          justify-between
          border-b
          border-slate-200
          px-5
          py-4
        "
      >

        <h2
          className="
            text-base
            font-bold
          "
        >
          Notifikasi
        </h2>

        <Link

          href="/notifications"

          className="
            text-sm
            font-semibold
            text-indigo-600
          "

        >
          Lihat Semua
        </Link>

      </div>

      {/* LIST */}

      <div
        className="
          max-h-112.5
          overflow-y-auto
        "
      >

        {notifications.length === 0 && (

          <div
            className="
              py-12
              text-center
              text-sm
              text-slate-500
            "
          >
            Belum ada notifikasi
          </div>

        )}

        {notifications.map((notification) => (

          <div
            key={notification.id}
            className="border-b border-slate-100 last:border-none"
          >

            <NotificationCard

              notification={notification}

              onRead={onRead}

            />

          </div>

        ))}

      </div>

    </div>

  );

}