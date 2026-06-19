import DesktopSidebar from "@/components/layout/desktop/DesktopSidebar";

interface Message {
  id: string;

  content: string;

  sender_id: string;

  created_at: string;
}

interface Props {
  loading: boolean;

  messages: Message[];

  currentUserId: string;

  otherUser: {
    full_name: string;
    avatar_url?: string;
  } | null;

  message: string;

  sending: boolean;

  bottomRef: React.RefObject<HTMLDivElement | null>;

  setMessage: (
    value: string
  ) => void;

  handleSendMessage: () => void;
}

export default function DesktopChatRoomView({
  loading,
  messages,
  currentUserId,
  otherUser,
  message,
  sending,
  bottomRef,
  setMessage,
  handleSendMessage,
}: Props) {
  return (
    <div className="hidden lg:flex">

      {/* SIDEBAR */}
      <DesktopSidebar />

      {/* CHAT AREA */}
      <main
        className="
          ml-70
          flex
          h-screen
          flex-1
          flex-col
          bg-slate-50
        "
      >

        {/* HEADER */}
        <div
          className="
    border-b
    border-slate-200
    bg-white
    px-8
    py-4
  "
        >

          <div className="flex items-center gap-4">

            {/* AVATAR */}

            {otherUser?.avatar_url ? (

              <img
                src={otherUser.avatar_url}
                alt={otherUser.full_name}
                className="
          h-12
          w-12
          rounded-full
          object-cover
          border
          border-slate-200
        "
              />

            ) : (

              <div
                className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-indigo-100
          text-sm
          font-bold
          text-indigo-700
        "
              >
                {otherUser?.full_name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

            )}

            {/* INFO */}

            <div>

              <h1
                className="
          text-lg
          font-bold
          text-slate-900
        "
              >
                {otherUser?.full_name ||
                  "Loading..."}
              </h1>

              <p
                className="
          text-sm
          text-slate-500
        "
              >
                Percakapan
              </p>

            </div>

          </div>

        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-8 py-8">

          {loading ? (
            <div>
              Memuat pesan...
            </div>
          ) : (
            <div className="space-y-4">

              {messages.map((item) => {
                const isMine =
                  item.sender_id ===
                  currentUserId;

                return (
                  <div
                    key={item.id}
                    className={`
                      flex
                      ${isMine
                        ? "justify-end"
                        : "justify-start"
                      }
                    `}
                  >

                    <div
                      className={`
                        max-w-[65%]
                        rounded-3xl
                        px-5
                        py-4
                        text-sm
                        leading-7
                        shadow-sm

                        ${isMine
                          ? "bg-indigo-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                        }
                      `}
                    >
                      {item.content}
                    </div>

                  </div>
                );
              })}

              <div ref={bottomRef} />

            </div>
          )}

        </div>

        {/* INPUT */}
        <div
          className="
            border-t
            border-slate-200
            bg-white
            px-8
            py-5
          "
        >

          <div className="flex gap-4">

            <input
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              placeholder="Tulis pesan..."
              className="
                h-14
                flex-1
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-5
                outline-none
                transition
                focus:border-indigo-400
                focus:bg-white
              "
            />

            <button
              onClick={
                handleSendMessage
              }
              disabled={sending}
              className="
                rounded-2xl
                bg-indigo-600
                px-8
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-indigo-700
                disabled:opacity-50
              "
            >
              Kirim
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}