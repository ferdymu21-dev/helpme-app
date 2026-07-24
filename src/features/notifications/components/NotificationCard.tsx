import type {
    Notification,
} from "../types/notification.types";

import {
    ChevronRight,
} from "lucide-react";

import {
    getNotificationConfig,
} from "../utils/getNotificationConfig";

interface Props {

    notification: Notification;

    onRead: (
        notification: Notification
    ) => void;

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
    } = getNotificationConfig(
        notification.category,
        notification.type,
    );

    return (

        <button
            type="button"
            onClick={() =>
                onRead(notification)
            }
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

                ${notification.is_read

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
                        w-8
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

                        <Icon
                            size={15}
                            className={iconColor}
                        />

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

                        <div className="min-w-0">

                            {/* META */}

                            <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                    text-[11px]
                                    font-medium
                                 text-slate-500
                                "
                            >

                                <span
                                    className={`
                                        rounded-2xl
                                        px-1
                                        
                                        text-[10px]
                                        font-semibold
                                        ${badgeColor}
                                    `}
                                >
                                    {badge}

                                </span>

                                <span>

                                </span>

                                <div
                                    className="
                                        ml-14
                                        text-[8px]
                                        font-semibold
                                      text-slate-600
                                    "
                                >
                                    <time>
                                        {new Date(
                                            notification.created_at
                                        ).toLocaleDateString(
                                            "id-ID",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )}
                                    </time>

                                    <span className="mx-0.5 text-slate-400">•</span>

                                    <time>
                                        {new Date(
                                            notification.created_at
                                        ).toLocaleTimeString(
                                            "id-ID",
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}
                                    </time>
                                </div>

                            </div>

                            {/* TITLE */}

                            <h2
                                className="
                                    mt-2
                                    text-[14px]
                                    font-semibold
                                    leading-4
                                  text-slate-900
                                "
                            >
                                {notification.title}
                            </h2>

                        </div>

                        <ChevronRight
                            size={18}
                            className="
                                mt-1
                                shrink-0
                              text-slate-400
                                transition-all
                                duration-300
                                group-hover:translate-x-1
                              group-hover:text-red-600
                            "
                        />

                    </div>

                    <p
                        className="
                            mt-0.5
                            line-clamp-2
                            text-[11px]
                            leading-4
                            text-slate-600
                        "
                    >
                        {notification.message}
                    </p>

                </div>

            </div>

        </button>

    );

}