"use client";

import {
    useMemo,
    useState,
} from "react";

import {
    NotificationFilter,
    NotificationFilterValue,
} from "../constants/notification-filter";

import {
    filterNotifications,
} from "../utils/filterNotifications";

import type {
    Notification,
} from "../types/notification.types";

export function useNotificationFilter(

    notifications: Notification[],

) {

    const [

        filter,

        setFilter,

    ] = useState<NotificationFilterValue>(

        NotificationFilter.ALL

    );

    const filteredNotifications =

        useMemo(

            () =>

                filterNotifications(

                    notifications,

                    filter,

                ),

            [

                notifications,

                filter,

            ],

        );

    return {

        filter,

        setFilter,

        filteredNotifications,

    };

}