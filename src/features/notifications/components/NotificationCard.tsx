import Image from "next/image";

import type { Notification } from "../types/notification.types";


import { getNotificationConfig } from "../utils/getNotificationConfig";

interface Props {
  notification: Notification;

  onRead: (notification: Notification) => void;
}

export default function NotificationCard({
  notification,

  onRead,
}: Props) {
  const {
    icon: Icon,
    iconColor,
    backgroundColor,
    badge,
    badgeColor,
  } = getNotificationConfig(notification.category, notification.type);

  return (
    <button
      type="button"
      onClick={() => onRead(notification)}
      className={`
                group
                relative
                w-full
                overflow-hidden
                rounded-3xl
                border
                bg-white
                p-5
                text-left
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-indigo-200
                hover:shadow-lg

                ${
                  notification.is_read
                    ? `
                            border-slate-200
                          `
                    : `
                            border-indigo-200
                          `
                }
            `}
    >
      {/* LEFT ACCENT */}

      {!notification.is_read && (
        <div
          className="
                        absolute
                        left-0
                        top-5
                        h-16
                        w-1
                        rounded-r-full
                        bg-indigo-600
                    "
        />
      )}

      <div
        className="
                    flex
                    items-start
                    gap-4
                "
      >
        {/* ICON */}

        <div
          className="
                        flex
                        w-4
                        shrink-0
                        flex-col
                        items-center
                        gap-1
                    "
        >
          <div
            className={`
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-2xl
                            ${backgroundColor}
                        `}
          >
            <Icon size={16} className={iconColor} />
          </div>

          {!notification.is_read && (
            <span
              className="
                                absolute
                                -right-1
                                -top-1
                                h-3
                                w-3
                                rounded-full
                                border-2
                              border-white
                              bg-red-500
                            "
            />
          )}
        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">
          <div
            className="
                            flex
                            items-start
                            justify-between
                            gap-3
                        "
          >
            <div className="w-full min-w-0">

              {/* META */}

              <div
                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                    text-[11px]
                                    font-medium

                                "
              >
                <span
                  className={`
                                        text-[10px]
                                        font-semibold
                                        ${badgeColor}
                                    `}
                >
                  {badge}
                </span>

                <span></span>

                <div
                  className="
                                      
                                        text-[9px]
                                        font-semibold
                                      text-slate-600
                                    "
                >
                  <time>
                    {new Date(notification.created_at).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </time>

                  <span className="mx-0.5 text-slate-400">•</span>

                  <time>
                    {new Date(notification.created_at).toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </time>
                </div>
              </div>

              {/* TITLE */}

              <h2
                className="
                                    mt-1
                                    text-[15.5px]
                                    font-semibold
                                    leading-5
                                  text-slate-900
                                "
              >
                {notification.title}
              </h2>
            </div>

            
          </div>

          <p
            className="
                            mt-1
                            line-clamp-2
                            text-[11px]
                            leading-4
                            text-slate-600
                        "
          >
            {notification.message}
          </p>
         {notification.image_url && (
  <div className="mt-3 flex justify-center">
    <div
      className="
        relative
        h-28
        w-full
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-slate-100
        shadow-sm
      "
    >
      <Image
        src={notification.image_url}
        alt={notification.title}
        fill
        unoptimized
        className="
          object-cover
          transition-transform
          duration-500
          group-hover:scale-105
        "
      />
    </div>
  </div>
)}
        </div>
      </div>
    </button>
  );
}