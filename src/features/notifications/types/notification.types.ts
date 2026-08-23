import type {
    NotificationTypeValue,
} from "../constants/notification-type";

import type {
    NotificationCategoryValue,
} from "../constants/notification-category";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationTypeValue;
    category: NotificationCategoryValue;
    is_read: boolean;
    created_at: string;
    task_id?: string;
    campaign_id?: string;
    image_url?: string;
    redirect_url?: string;
}

export interface CreateNotificationPayload {
    userId: string;
    title: string;
    message: string;
    type: NotificationTypeValue;
    taskId?: string;
    campaignId?: string;
    imageUrl?: string;
    redirectUrl?: string;
}