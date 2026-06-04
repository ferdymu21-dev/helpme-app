import Link from "next/link";

import MobileBottomNavbar from "@/components/layout/mobile/MobileBottomNavbar";

interface Conversation {
  id: string;

  task_id: string;

  owner_id: string;

  helper_id: string;

  created_at: string;

  tasks: {
    title: string;
  };

  owner: {
    full_name: string;
  };

  helper: {
    full_name: string;
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
              text-sm
              font-semibold
              text-indigo-600
            "
          >
            Realtime Messages
          </div>

          <h1
            className="
              mt-6
              text-4xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Pesan
          </h1>

        </div>

        {/* LIST */}
        <div className="mt-10 grid gap-5">

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
                        "
                      >
                        {otherUser?.full_name?.charAt(
                          0
                        ) || "U"}
                      </div>

                      {/* INFO */}
                      <div className="flex-1">

                        <h2
                          className="
                            text-lg
                            font-bold
                            text-slate-900
                          "
                        >
                          {
                            otherUser?.full_name
                          }
                        </h2>

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