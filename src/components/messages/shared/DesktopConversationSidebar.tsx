import Link from "next/link";

interface Conversation {
  id: string;

  owner_id: string;

  helper_id: string;

  created_at: string;

  last_message: string;

  last_message_at: string;

  owner_unread_count: number;

  helper_unread_count: number;

  tasks: {
    title: string;
  };

  owner: {
    full_name: string;
    avatar_url?: string;
  };

  helper: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Props {
  conversations: Conversation[];

  currentUserId: string;
}

export default function DesktopConversationSidebar({
  conversations,
  currentUserId,
}: Props) {
  return (
    <div
      className="
        w-95
        border-r
        border-slate-200
        bg-white
      "
    >

      {/* HEADER */}
      <div
        className="
          border-b
          border-slate-200
          px-6
          py-6
        "
      >

        <h1
          className="
            text-3xl
            font-black
            tracking-tight
            text-slate-900
          "
        >
          Messages
        </h1>

      </div>

      {/* LIST */}
      <div className="overflow-y-auto p-4">

        <div className="space-y-3">

          {conversations.map(
            (conversation) => {
              const otherUser =
                conversation.owner_id ===
                  currentUserId
                  ? conversation.helper
                  : conversation.owner;

              const unreadCount =
                conversation.owner_id ===
                  currentUserId
                  ? conversation.owner_unread_count
                  : conversation.helper_unread_count;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="
                    flex
                    items-center
                    gap-4
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                    transition
                    hover:bg-slate-50
                  "
                >

                  {/* AVATAR */}

                  {otherUser?.avatar_url ? (

                    <img
                      src={otherUser.avatar_url}
                      alt={otherUser.full_name}
                      className="
      h-14
      w-14
      rounded-full
      object-cover
      border
      border-slate-200
      shrink-0
    "
                    />

                  ) : (

                    <div
                      className="
      flex
      h-14
      w-14
      items-center
      justify-center
      rounded-full
      bg-indigo-100
      text-lg
      font-bold
      text-indigo-700
      shrink-0
    "
                    >
                      {otherUser?.full_name?.charAt(0) || "U"}
                    </div>

                  )}

                  {/* INFO */}
                  <div className="flex-1">

                    <div className="flex items-center justify-between">

                      <h2
                        className="
                         text-sm
                         font-bold
                       text-slate-900
                       "
                      >
                        {
                          otherUser?.full_name
                        }
                      </h2>

                      {unreadCount > 0 && (

                        <div
                          className="
                           flex
                           h-6
                           min-w-6
                           items-center
                           justify-center
                           rounded-full
                         bg-indigo-600
                           px-2
                           text-xs
                           font-bold
                         text-white
                        "
                        >
                          {unreadCount}
                        </div>

                      )}

                    </div>

                    <p
                      className="
                      mt-1
                      truncate
                      text-xs
                    text-slate-500
                    "
                    >
                      {conversation.last_message ||
                        "Belum ada pesan"}
                    </p>

                    <p
                      className="
                      mt-1
                      text-[11px]
                    text-slate-400
                    "
                    >
                      {
                        conversation.tasks
                          ?.title
                      }

                    </p>

                  </div>

                </Link>
              );
            }
          )}

        </div>

      </div>

    </div>
  );
}