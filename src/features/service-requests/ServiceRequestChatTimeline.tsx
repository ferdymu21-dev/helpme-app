import { formatChatMessageTime } from "@/features/messages/utils/format-message-time";

import ServiceRequestChatProposalCard from "./ServiceRequestChatProposalCard";

import type { ServiceAgreement } from "./types/service-agreement.types";

interface ChatTimelineMessage {
  id: string;

  content: string;

  sender_id: string;

  created_at: string;
}

type ChatTimelineItem =
  | {
      type: "message";

      id: string;

      createdAt: string;

      message: ChatTimelineMessage;
    }
  | {
      type: "agreement";

      id: string;

      createdAt: string;

      agreement: ServiceAgreement;
    };

interface ServiceRequestChatTimelineProps {
  messages: ChatTimelineMessage[];

  agreements: ServiceAgreement[];

  currentUserId: string;

  requestId: string;

  variant:
    | "mobile"
    | "desktop";
}

function buildTimeline(
  messages: ChatTimelineMessage[],
  agreements: ServiceAgreement[],
): ChatTimelineItem[] {
  const items: ChatTimelineItem[] = [
    ...messages.map(
      (message): ChatTimelineItem => ({
        type: "message",

        id: `message-${message.id}`,

        createdAt:
          message.created_at,

        message,
      }),
    ),

    ...agreements.map(
      (agreement): ChatTimelineItem => ({
        type: "agreement",

        id: `agreement-${agreement.id}`,

        createdAt:
          agreement.createdAt,

        agreement,
      }),
    ),
  ];

  return items.sort(
    (first, second) =>
      new Date(
        first.createdAt,
      ).getTime() -
      new Date(
        second.createdAt,
      ).getTime(),
  );
}

export default function ServiceRequestChatTimeline({
  messages,
  agreements,
  currentUserId,
  requestId,
  variant,
}: ServiceRequestChatTimelineProps) {
  const timeline = buildTimeline(
    messages,
    agreements,
  );

  return (
    <div
      className={
        variant === "mobile"
          ? "space-y-2"
          : "space-y-4"
      }
    >
      {timeline.map((item) => {
        if (
          item.type ===
          "agreement"
        ) {
          return (
            <ServiceRequestChatProposalCard
              key={item.id}
              agreement={
                item.agreement
              }
              requestId={
                requestId
              }
            />
          );
        }

        const isMine =
          item.message.sender_id ===
          currentUserId;

        return (
          <div
            key={item.id}
            className={`
              flex
              ${
                isMine
                  ? "justify-end"
                  : "justify-start"
              }
            `}
          >
            <div
              className={`
                ${
                  variant ===
                  "mobile"
                    ? "max-w-[80%] rounded-2xl px-3 py-2 text-[14px]"
                    : "max-w-[65%] rounded-3xl px-3.5 py-2 text-sm shadow-sm"
                }

                ${
                  isMine
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }
              `}
            >
              <div
                className="
                  flex
                  items-end
                  gap-2
                "
              >
                <p
                  className={`
                    min-w-0
                    whitespace-pre-wrap
                    wrap-break-word

                    ${
                      variant ===
                      "mobile"
                        ? "leading-5"
                        : "leading-6"
                    }
                  `}
                >
                  {item.message.content}
                </p>

                <time
                  dateTime={
                    item.message
                      .created_at
                  }
                  className={`
                    mb-0.5
                    shrink-0
                    whitespace-nowrap
                    leading-none

                    ${
                      variant ===
                      "mobile"
                        ? "text-[8.5px]"
                        : "text-[10px]"
                    }

                    ${
                      isMine
                        ? "text-indigo-200"
                        : "text-slate-400"
                    }
                  `}
                >
                  {formatChatMessageTime(
                    item.message
                      .created_at,
                  )}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}