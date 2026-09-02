import {
  BadgeCheck,
  Ban,
  Bell,
  CircleX,
  Clock3,
  Handshake,
  Star,
  UserRoundPlus,
} from "lucide-react";

import {
  NotificationType,
} from "../constants/notification-type";

import type {
  NotificationTypeValue,
} from "../constants/notification-type";

export function getNotificationIcon(
  type: NotificationTypeValue,
) {
  switch (type) {
    case NotificationType.APPLY_TASK:
      return (
        <UserRoundPlus
          size={22}
          className="text-blue-600"
        />
      );

    case NotificationType.TASK_ACCEPTED:
      return (
        <Handshake
          size={22}
          className="text-emerald-600"
        />
      );

    case NotificationType.TASK_CANCELLED:
      return (
        <CircleX
          size={22}
          className="text-rose-600"
        />
      );

    case NotificationType.NEW_REVIEW:
      return (
        <Star
          size={22}
          className="
            fill-amber-500
            text-amber-500
          "
        />
      );

    case NotificationType.DONATION_PAID:

    case NotificationType.URGENT_TASK_PAID:
      return (
        <BadgeCheck
          size={22}
          className="text-emerald-600"
        />
      );

    case NotificationType.DONATION_EXPIRED:

    case NotificationType.URGENT_TASK_EXPIRED:
      return (
        <Clock3
          size={22}
          className="text-amber-600"
        />
      );

    case NotificationType.DONATION_FAILED:

    case NotificationType.URGENT_TASK_FAILED:
      return (
        <CircleX
          size={22}
          className="text-rose-600"
        />
      );

    case NotificationType.DONATION_CANCELLED:

    case NotificationType.URGENT_TASK_CANCELLED:
      return (
        <Ban
          size={22}
          className="text-slate-500"
        />
      );

    default:
      return (
        <Bell
          size={22}
          className="text-slate-500"
        />
      );
  }
}