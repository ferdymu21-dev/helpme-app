import {
    NotificationCategory,
    NotificationCategoryValue,
} from "../constants/notification-category";

import type {
    Notification,
} from "../types/notification.types";

export function filterNotifications(

    notifications: Notification[],

    filter: NotificationCategoryValue,

) {

    if (

        filter === NotificationCategory.ALL

    ) {

        return notifications;

    }

    return notifications.filter(

        (notification) =>

            notification.category === filter

    );

}