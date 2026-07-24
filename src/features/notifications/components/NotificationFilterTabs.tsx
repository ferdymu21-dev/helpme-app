"use client";

import clsx from "clsx";

import {
    NotificationCategory,
} from "../constants/notification-category";

import type {
    NotificationCategoryValue,
} from "../constants/notification-category";

interface Props {

    value: NotificationCategoryValue;

    onChange: (
        value: NotificationCategoryValue
    ) => void;

    total: number;

    task: number;

    payment: number;

    review: number;

    info: number;

    system: number;

}

export default function NotificationFilterTabs({

    value,

    onChange,

    total,

    task,

    payment,

    review,

    info,

    system,

}: Props) {

    const tabs = [

        {
            key: NotificationCategory.ALL,
            label: `Semua (${total})`,
        },

        {
            key: NotificationCategory.TASK,
            label: `Task (${task})`,
        },

        {
            key: NotificationCategory.PAYMENT,
            label: `Pembayaran (${payment})`,
        },

        {
            key: NotificationCategory.REVIEW,
            label: `Review (${review})`,
        },

        {
            key: NotificationCategory.INFO,
            label: `Info (${info})`,
        },

        {
            key: NotificationCategory.SYSTEM,
            label: `System (${system})`,
        },

    ] as const;

    return (

        <div
            className="
                mt-6
                flex
                gap-2
                overflow-x-auto
                pb-1
            "
        >

            {tabs.map((tab) => (

                <button

                    key={tab.key}

                    onClick={() =>
                        onChange(tab.key)
                    }

                    className={clsx(

                        `
                        whitespace-nowrap
                        rounded-xl
                        px-5
                        py-2.5
                        text-[12px]
                        font-semibold
                        transition
                        `,

                        value === tab.key

                            ? `
                                bg-indigo-600
                                text-white
                              `

                            : `
                                bg-slate-100
                                text-slate-600
                                hover:bg-slate-200
                              `

                    )}

                >

                    {tab.label}

                </button>

            ))}

        </div>

    );

}