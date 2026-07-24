import type {
    NotificationCategoryValue,
} from "../../notifications/constants/notification-category";

import type {
    NotificationTypeValue,
} from "../../notifications/constants/notification-type";

import type {
    CampaignStatusValue,
} from "../constants/campaign-status";

import type {
    CampaignTargetValue,
} from "../constants/campaign-target";

import type {
    CampaignActionValue,
} from "../constants/campaign-action";

export interface NotificationCampaign {

    id: string;

    title: string;

    message: string;

    image_url: string | null;

    redirect_url: string | null;

    category: NotificationCategoryValue;

    type: NotificationTypeValue;

    status: CampaignStatusValue;

    target_type: CampaignTargetValue;

    target_value: string | null;

    scheduled_at: string | null;

    published_at: string | null;

    expires_at: string | null;

    created_at: string;

    updated_at: string;

    created_by: string | null;

    total_sent: number;

    total_opened: number;

    total_clicked: number;

}

export interface CreateCampaignPayload {

    title: string;

    message: string;

    imageUrl?: string;

    redirectUrl?: string;

    category: NotificationCategoryValue;

    type: NotificationTypeValue;

    action: CampaignActionValue;

    targetType: CampaignTargetValue;

    targetValue?: string;

    scheduledAt?: string;

    expiresAt?: string;

}

export interface InsertCampaignPayload {

    title: string;

    message: string;

    image_url: string | null;

    redirect_url: string | null;

    category: NotificationCategoryValue;

    type: NotificationTypeValue;

    status: CampaignStatusValue;

    target_type: CampaignTargetValue;

    target_value: string | null;

    scheduled_at: string | null;

    published_at: string | null;

    expires_at: string | null;

}

export interface UpdateCampaignPayload {

    id: string;

    title?: string;

    message?: string;

    imageUrl?: string;

    redirectUrl?: string;

    status?: CampaignStatusValue;

    targetType?: CampaignTargetValue;

    targetValue?: string;

    scheduledAt?: string;

    expiresAt?: string;

}