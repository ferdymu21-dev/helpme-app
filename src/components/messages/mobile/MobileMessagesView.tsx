import Link from "next/link";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

interface Conversation {
  id: string;

  task_id: string;

  owner_id: string;

  helper_id: string;

  created_at: string;

  last_message: string;

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
  loading: boolean;

  conversations: Conversation[];

  currentUserId: string;
}

export default function MobileMessagesView({
  loading,
  conversations,
  currentUserId,
}: Props) {
  return (
    <main className="min-h-screen bg-slate-50 pb-32 lg:hidden">

      {/* CONTAINER */}
      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* HEADER */}
        <div>

          <div
            className="
              inline-flex
              rounded-full
              bg-indigo-50
              px-4
              py-2
              text-xs
              font-semibold
              text-indigo-600
            "
          >
            Realtime Messages
          </div>

          <h1
            className="
              mt-6
              text-xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Pesan
          </h1>

        </div>

        {/* LIST */}
        <div className="mt-4 grid gap-1.5">

          {loading ? (
            <div>
              Memuat pesan...
            </div>
          ) : conversations.length === 0 ? (
            <div
              className="
                rounded-4xl
                border
                border-dashed
                border-slate-300
                bg-white
                p-10
                text-center
              "
            >
              Belum ada pesan
            </div>
          ) : (
            conversations.map(
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
                      rounded-4xl
                      border
                      border-slate-200
                      bg-white
                      p-6
                    "
                  >

                    <div className="flex items-center gap-4">

                      {/* AVATAR */}

                      {otherUser?.avatar_url ? (

                        <img
                          src={otherUser.avatar_url}
                          alt={otherUser.full_name}
                          className="
      h-10
      w-10
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
      h-10
      w-10
      items-center
      justify-center
      rounded-full
      bg-indigo-100
      text-xs
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
                            {otherUser?.full_name}
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
      mt-2
      truncate
      text-sm
      text-slate-500
    "
                        >
                          {conversation.last_message ||
                            "Belum ada pesan"}
                        </p>

                      </div>

                    </div>

                  </Link>
                );
              }
            )
          )}

        </div>

      </div>

      <MobileBottomNavbar />

    </main>
  );
}