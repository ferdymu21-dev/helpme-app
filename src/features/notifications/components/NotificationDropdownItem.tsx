"use client";

import type {
    Notification,
} from "../types/notification.types";

import {
    getNotificationIcon,
} from "../utils/getNotificationIcon";

interface Props {

    notification: Notification;

    onClick: (
        notification: Notification
    ) => void;

}

export default function NotificationDropdownItem({

    notification,

    onClick,

}: Props) {

    return (

        <button

            onClick={() => onClick(notification)}

            className={`
                w-full
                border-b
                border-slate-100
                px-4
                py-3
                text-left
                transition
                hover:bg-slate-50

                ${
                    notification.is_read
                        ? "bg-white"
                        : "bg-indigo-50"
                }
            `}
        >

            <div className="flex items-start gap-3">

                <span className="text-lg">

                    {getNotificationIcon(notification.type)}

                </span>

                <div className="min-w-0 flex-1">

                    <p
                        className="
                            truncate
                            text-sm
                            font-semibold
                            text-slate-900
                        "
                    >

                        {notification.title}

                    </p>

                    <p
                        className="
                            mt-1
                            line-clamp-2
                            text-xs
                            text-slate-500
                        "
                    >

                        {notification.message}

                    </p>

                    <p
                        className="
                            mt-2
                            text-[11px]
                            text-slate-400
                        "
                    >

                        {new Date(
                            notification.created_at
                        ).toLocaleString("id-ID")}

                    </p>

                </div>

                {!notification.is_read && (

                    <span
                        className="
                            mt-2
                            h-2
                            w-2
                            rounded-full
                            bg-indigo-600
                        "
                    />

                )}

            </div>

        </button>

    );

}