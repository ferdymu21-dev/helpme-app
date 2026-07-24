"use client";

import NotificationPageHeader
    from "./NotificationPageHeader";

import NotificationLoading from "./NotificationLoading";

import NotificationEmpty from "./NotificationEmpty";

import NotificationCard from "./NotificationCard";

import type {
    Notification,
} from "../types/notification.types";

import { useMemo, useState } from "react";

import NotificationFilterTabs
    from "./NotificationFilterTabs";

import type {
    NotificationCategoryValue,
} from "../constants/notification-category";

import {
    filterNotifications,
} from "../utils/filterNotifications";

import {
    NotificationCategory,
} from "../constants/notification-category";

interface Props {

    notifications: Notification[];

    loading: boolean;

    hasUnread: boolean;

    hasMore: boolean;

    onLoadMore: () => void;

    onMarkAllRead: () => Promise<void>;

    onRead: (
        notification: Notification
    ) => void;

}

export default function NotificationPageUI({

    notifications,

    loading,

    hasUnread,

    hasMore,

    onLoadMore,

    onMarkAllRead,

    onRead,

}: Props) {

    const [
        activeFilter,
        setActiveFilter,
    ] = useState<NotificationCategoryValue>(
        NotificationCategory.ALL
    );

    const [
        keyword,
        setKeyword,
    ] = useState("");

    const filteredNotifications =

        useMemo(() => {

            const filtered = filterNotifications(

                notifications,

                activeFilter,

            );

            if (!keyword.trim()) {

                return filtered;

            }

            const search = keyword.toLowerCase();

            return filtered.filter(

                (notification) =>

                    notification.title
                        .toLowerCase()
                        .includes(search)

                    ||

                    notification.message
                        .toLowerCase()
                        .includes(search)

            );

        }, [

            notifications,

            activeFilter,

            keyword,

        ]);

    const taskCount =
        notifications.filter(
            (notification) =>
                notification.category === NotificationCategory.TASK
        ).length;

    const paymentCount =
        notifications.filter(
            (notification) =>
                notification.category === NotificationCategory.PAYMENT
        ).length;

    const reviewCount =
        notifications.filter(
            (notification) =>
                notification.category === NotificationCategory.REVIEW
        ).length;

    const infoCount =
        notifications.filter(
            (notification) =>
                notification.category === NotificationCategory.INFO
        ).length;

    const systemCount =
        notifications.filter(
            (notification) =>
                notification.category === NotificationCategory.SYSTEM
        ).length;

    return (

        <main className="min-h-screen bg-slate-50">

            <div className="mx-auto max-w-3xl px-6 py-8">

                <NotificationPageHeader

                    totalNotifications={notifications.length}
                    keyword={keyword}
                    onKeywordChange={setKeyword}
                    hasUnread={hasUnread}
                    onMarkAllRead={onMarkAllRead}
                />

                <NotificationFilterTabs
                    value={activeFilter}
                    onChange={setActiveFilter}
                    total={notifications.length}
                    task={taskCount}
                    payment={paymentCount}
                    review={reviewCount}
                    info={infoCount}
                    system={systemCount}
                />

                {loading && (

                    <NotificationLoading />

                )}

                {!loading &&
                    filteredNotifications.length === 0 && (

                        <NotificationEmpty />

                    )}

                <div className="mt-8 grid gap-4">

                    {filteredNotifications.map(
                        (notification) => (

                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onRead={onRead}
                            />

                        )
                    )}

                </div>

                {!loading && hasMore && (

                    <div
                        className="
            mt-10
            flex
            justify-center
        "
                    >

                        <button

                            onClick={onLoadMore}

                            className="
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-xs
                font-semibold
                text-slate-700
                shadow-sm
                transition-all
                hover:-translate-y-0.5
                hover:border-indigo-300
                hover:bg-indigo-50
                hover:text-indigo-600
            "

                        >

                            lebih banyak

                        </button>

                    </div>

                )}

            </div>

        </main>

    );

}