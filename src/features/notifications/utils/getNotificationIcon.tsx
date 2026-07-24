import {
    Bell,
    Handshake,
    Star,
    UserRoundPlus,
    CircleX,
} from "lucide-react";

export function getNotificationIcon(
    type: string,
) {

    switch (type) {

        case "APPLY_TASK":

            return (

                <UserRoundPlus
                    size={22}
                    className="
                        text-blue-600
                    "
                />

            );

        case "TASK_ACCEPTED":

            return (

                <Handshake
                    size={22}
                    className="
                        text-emerald-600
                    "
                />

            );

        case "TASK_CANCELLED":

            return (

                <CircleX
                    size={22}
                    className="
                        text-rose-600
                    "
                />

            );

        case "NEW_REVIEW":

            return (

                <Star
                    size={22}
                    className="
                        fill-amber-500
                        text-amber-500
                    "
                />

            );

        default:

            return (

                <Bell
                    size={22}
                    className="
                        text-slate-500
                    "
                />

            );

    }

}