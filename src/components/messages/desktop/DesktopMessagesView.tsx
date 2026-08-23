import DesktopSidebar from "@/components/layout/desktop/DesktopSidebar";

import DesktopConversationSidebar from "@/components/messages/shared/DesktopConversationSidebar";

import type { Conversation } from "@/features/messages/types/conversation.types";

interface Props {
  conversations: Conversation[];

  currentUserId: string;
}

export default function DesktopMessagesView({
  conversations,
  currentUserId,
}: Props) {
  return (
    <div className="hidden lg:flex">
      {/* SIDEBAR */}
      <DesktopSidebar />

      {/* CONTENT */}
      <main
  className="
    ml-70
    flex
    h-screen
    min-h-0
    flex-1
    overflow-hidden
    bg-slate-50
  "
>
        <DesktopConversationSidebar
          conversations={conversations}
          currentUserId={currentUserId}
        />

        {/* EMPTY PANEL */}
        <div
          className="
            flex
            flex-1
            items-center
            justify-center
          "
        >
          <div className="text-center">
            <h2
              className="
                text-3xl
                font-black
                text-slate-900
              "
            >
              Pilih Percakapan
            </h2>

            <p
              className="
                mt-3
                text-slate-500
              "
            >
              Mulai chat dengan helper atau pemilik task.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}