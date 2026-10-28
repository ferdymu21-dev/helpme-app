"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldAlert,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

interface ChatMember {
  user_id: string;
  member_role: "REQUESTER" | "HELPER";
  display_name: string;
  participant_status: string | null;
  joined_at: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message_type: "USER" | "SYSTEM";
  content: string;
  created_at: string;
}

interface EmergencyChat {
  chat_id: string;
  request_id: string;
  title: string;
  members: ChatMember[];
  messages: ChatMessage[];
}

type ParticipantStatus =
  | "WILL_HELP"
  | "EN_ROUTE"
  | "ARRIVED"
  | "COMPLETED"
  | "WITHDRAWN";

type ParticipantAction = "EN_ROUTE" | "ARRIVED" | "WITHDRAWN";

interface OwnEmergencyParticipant {
  id: string;
  status: ParticipantStatus;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMember(value: unknown): ChatMember | null {
  if (
    !isRecord(value) ||
    typeof value.user_id !== "string" ||
    (value.member_role !== "REQUESTER" && value.member_role !== "HELPER") ||
    typeof value.display_name !== "string" ||
    !(value.participant_status === null ||
      typeof value.participant_status === "string") ||
    typeof value.joined_at !== "string"
  ) {
    return null;
  }

  return {
    user_id: value.user_id,
    member_role: value.member_role,
    display_name: value.display_name,
    participant_status: value.participant_status,
    joined_at: value.joined_at,
  };
}

function parseMessage(value: unknown): ChatMessage | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.sender_id !== "string" ||
    (value.message_type !== "USER" && value.message_type !== "SYSTEM") ||
    typeof value.sender_name !== "string" ||
    typeof value.content !== "string" ||
    typeof value.created_at !== "string"
  ) {
    return null;
  }

  return {
    id: value.id,
    sender_id: value.sender_id,
    sender_name: value.sender_name,
    message_type: value.message_type,
    content: value.content,
    created_at: value.created_at,
  };
}

function parseChat(value: unknown): EmergencyChat | null {
  if (
    !isRecord(value) ||
    typeof value.chat_id !== "string" ||
    typeof value.request_id !== "string" ||
    typeof value.title !== "string" ||
    !Array.isArray(value.members) ||
    !Array.isArray(value.messages)
  ) {
    return null;
  }

  const members = value.members
    .map(parseMember)
    .filter((member): member is ChatMember => member !== null);

  const messages = value.messages
    .map(parseMessage)
    .filter((message): message is ChatMessage => message !== null);

  if (members.length !== value.members.length ||
      messages.length !== value.messages.length) {
    return null;
  }

  return {
    chat_id: value.chat_id,
    request_id: value.request_id,
    title: value.title,
    members,
    messages,
  };
}

function isParticipantStatus(value: unknown): value is ParticipantStatus {
  return (
    value === "WILL_HELP" ||
    value === "EN_ROUTE" ||
    value === "ARRIVED" ||
    value === "COMPLETED" ||
    value === "WITHDRAWN"
  );
}

function parseOwnParticipant(
  value: unknown,
  userId: string,
): OwnEmergencyParticipant | null {
  if (!isRecord(value) || !Array.isArray(value.participants)) {
    return null;
  }

  for (const item of value.participants) {
    if (
      isRecord(item) &&
      typeof item.id === "string" &&
      item.helper_id === userId &&
      isParticipantStatus(item.status)
    ) {
      return {
        id: item.id,
        status: item.status,
      };
    }
  }

  return null;
}

function participantStatusLabel(status: ParticipantStatus): string {
  switch (status) {
    case "WILL_HELP":
      return "Siap membantu";
    case "EN_ROUTE":
      return "Dalam perjalanan";
    case "ARRIVED":
      return "Sudah tiba";
    case "COMPLETED":
      return "Bantuan selesai";
    case "WITHDRAWN":
      return "Mengundurkan diri";
  }
}
function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EmergencyHelpGroupChatPage() {
  const params = useParams<{ id: string }>();
  const requestId = params.id;

  const [userId, setUserId] = useState<string | null>(null);
  const [chat, setChat] = useState<EmergencyChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [statusPanelOpen, setStatusPanelOpen] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);
  const [statusActionMessage, setStatusActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | null = null;

    async function fetchRoom() {
      try {
        const { data, error } = await supabase.rpc(
          "get_emergency_help_chat",
          { p_request_id: requestId },
        );

        if (cancelled) return;

        if (error) {
          setChat(null);
          setLoadError(
            "Grup chat tidak tersedia. Permintaan mungkin sudah berakhir atau kamu bukan anggota grup.",
          );
          return;
        }

        const parsed = parseChat(data);

        if (!parsed) {
          setChat(null);
          setLoadError("Data grup chat tidak sesuai format yang diharapkan.");
          return;
        }

        setChat(parsed);
        setLoadError(null);
      } catch {
        if (!cancelled) {
          setChat(null);
          setLoadError("Tidak dapat memuat grup chat. Coba lagi.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    async function start() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !authData.user) {
          setUserId(null);
          setLoadError("Silakan login untuk membuka grup bantuan.");
          setLoading(false);
          return;
        }

        setUserId(authData.user.id);

        await fetchRoom();

        if (!cancelled) {
          intervalId = window.setInterval(() => {
            void fetchRoom();
          }, 5000);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Sesi login tidak dapat diverifikasi. Silakan coba lagi.");
          setLoading(false);
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [requestId, refreshVersion]);

  useEffect(() => {
    if (!notice) return;

    const timeoutId = window.setTimeout(() => {
      setNotice(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice]);


  const currentMember = chat?.members.find(
    (member) => member.user_id === userId,
  );

  const currentParticipantStatus =
    currentMember?.member_role === "HELPER" &&
    isParticipantStatus(currentMember.participant_status)
      ? currentMember.participant_status
      : null;

  async function updateMyParticipantStatus(nextStatus: ParticipantAction) {
    if (
      !requestId ||
      !userId ||
      !currentParticipantStatus ||
      statusBusy
    ) {
      return;
    }

    const allowed =
      (currentParticipantStatus === "WILL_HELP" &&
        (nextStatus === "EN_ROUTE" || nextStatus === "WITHDRAWN")) ||
      (currentParticipantStatus === "EN_ROUTE" &&
        (nextStatus === "ARRIVED" || nextStatus === "WITHDRAWN")) ||
      (currentParticipantStatus === "ARRIVED" && nextStatus === "WITHDRAWN");

    if (!allowed) {
      setStatusActionError("Status bantuan sudah berubah. Muat ulang chat lalu coba lagi.");
      setRefreshVersion((value) => value + 1);
      return;
    }

    setStatusBusy(true);
    setStatusActionError(null);
    setStatusActionMessage(null);

    try {
      const { data: detailData, error: detailError } = await supabase.rpc(
        "get_emergency_help_detail",
        { p_request_id: requestId },
      );

      if (detailError) {
        setStatusActionError("Detail status belum dapat dimuat. Coba lagi.");
        return;
      }

      const ownParticipant = parseOwnParticipant(detailData, userId);

      if (!ownParticipant) {
        setStatusActionError(
          "Data keikutsertaanmu tidak ditemukan. Muat ulang chat lalu coba lagi.",
        );
        setRefreshVersion((value) => value + 1);
        return;
      }

      const { error: statusError } = await supabase.rpc(
        "set_emergency_help_participant_status",
        {
          p_participant_id: ownParticipant.id,
          p_new_status: nextStatus,
        },
      );

      if (statusError) {
        setStatusActionError(
          "Status belum berhasil diperbarui. Permintaan mungkin sudah ditutup.",
        );
        return;
      }

      setStatusActionMessage("Status bantuan berhasil diperbarui.");
      setRefreshVersion((value) => value + 1);
    } catch {
      setStatusActionError("Terjadi kendala saat memperbarui status bantuan.");
    } finally {
      setStatusBusy(false);
    }
  }
  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = messageDraft.trim();
    if (!content || sending || !chat) return;

    setSending(true);
    setSendError(null);
    setNotice(null);

    try {
      const { data, error } = await supabase.rpc(
        "send_emergency_help_chat_message",
        {
          p_request_id: requestId,
          p_content: content,
        },
      );

      if (error) {
        setSendError(
          "Pesan tidak terkirim. Grup mungkin sudah ditutup atau aksesmu sudah berakhir.",
        );
        return;
      }

      if (typeof data !== "string" || data.length === 0) {
        setSendError("Server belum mengonfirmasi pengiriman pesan.");
        return;
      }

      setMessageDraft("");
      setNotice("Pesan terkirim.");
      setRefreshVersion((value) => value + 1);
    } catch {
      setSendError("Terjadi kendala saat mengirim pesan. Coba lagi.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-rose-50 px-4">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Memuat grup chat...
        </div>
      </main>
    );
  }

  if (!userId || !chat) {
    return (
      <main className="min-h-screen bg-rose-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:p-8">
          <ShieldAlert className="h-10 w-10 text-rose-600" />
          <h1 className="mt-4 text-xl font-black text-slate-900">
            Grup chat tidak tersedia
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {loadError ?? "Grup sudah ditutup atau aksesmu tidak tersedia."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {!userId ? (
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white"
              >
                Masuk ke HelpMe
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setRefreshVersion((value) => value + 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Coba lagi
              </button>
            )}
            <Link
              href={`/siaga/emergency/${requestId}`}
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700"
            >
              Kembali ke detail
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-rose-50 px-3 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Link
          href={`/siaga/emergency/${requestId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-rose-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke detail bantuan
        </Link>

        <section className="overflow-hidden rounded-3xl border border-rose-200 bg-white shadow-sm">
          <header className="bg-linear-to-r from-rose-600 to-red-500 p-3 text-white sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-widest text-rose-100 uppercase block">
                  ROOM CHAT COMMUNITY EMERGENCY
                </p>
                <p className="mt-0.5 leading-2 text-[9px] text-rose-100/90">
                  Ruang koordinasi untuk pemohon dan semua relawan
                </p>
                <h1 className="mt-2 wrap-break-word text-[15px] font-semibold sm:text-xl">
                  {chat.title}
                </h1>
              </div>
            </div>
          </header>

          <div className="border-b border-slate-100 p-2 sm:p-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-700">
              <Users className="h-3 w-3 text-rose-600" />
              Pemohon & Relawan ({chat.members.length})
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chat.members.map((member) => (
                <span
                  key={member.user_id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-1.5 py-1 font-medium text-[10px] text-rose-700"
                >
                  {member.user_id === userId ? "Kamu" : member.display_name}
                  <span className="text-rose-800">
                    · {member.member_role === "REQUESTER" ? "Pemohon" : "Relawan"}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4 bg-slate-50 p-3 sm:p-5">
            <div className="max-h-[55vh] min-h-72 space-y-3 overflow-y-auto rounded-2xl bg-white p-3 sm:p-4">
              {chat.messages.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <MessageCircle className="h-9 w-9 text-slate-300" />
                  <p className="mt-3 text-sm font-bold text-slate-600">
                    Belum ada pesan
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Mulai koordinasi bantuan di grup ini.
                  </p>
                </div>
              ) : (
                chat.messages.map((message) => {
                  if (message.message_type === "SYSTEM") {
                    return (
                      <div
                        key={message.id}
                        className="flex justify-center py-1"
                      >
                        <div className="max-w-[92%] rounded-2xl border border-amber-100 bg-amber-50 px-2 py-1 text-center">
                          <p className="whitespace-pre-wrap wrap-break-word text-[10px] font-medium leading-4 text-amber-900">
                            {message.content}
                          </p>
                          <p className="mt-0.5 text-[8px] text-amber-700">
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const ownMessage = message.sender_id === userId;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-[17px] px-2.5 py-1 sm:max-w-[80%] ${
                          ownMessage
                            ? "rounded-br-sm bg-rose-100 text-slate-800"
                            : "rounded-bl-sm border border-slate-100 bg-slate-50 text-slate-800"
                        }`}
                      >
                        <p className={`text-[9.5px] font-semibold ${ownMessage ? "text-slate-700" : "text-slate-700"}`}>
                          {ownMessage ? "Kamu" : message.sender_name}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-4.5">
                          {message.content}
                        </p>
                        <p className={`mt-1 p-0 text-right text-[8px] ${ownMessage ? "text-slate-700" : "text-slate-700"}`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {loadError && (
              <p role="alert" className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                {loadError}
              </p>
            )}
            {sendError && (
              <p role="alert" className="rounded-xl bg-rose-100 p-3 text-xs leading-5 text-rose-800">
                {sendError}
              </p>
            )}
            {notice && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 self-center rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 shadow-md"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{notice}</span>
              </div>
            )}

            {currentMember?.member_role === "HELPER" &&
              currentParticipantStatus !== null && (
                <div className="space-y-2">
                  <button
                    type="button"
                    aria-expanded={statusPanelOpen}
                    onClick={() => {
                      setStatusPanelOpen((open) => !open);
                      setStatusActionError(null);
                      setStatusActionMessage(null);
                    }}
                    className="flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border border-rose-100 bg-white px-3 py-2.5 text-left shadow-sm transition hover:bg-rose-50/60"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Activity className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800">
                          Status bantuan saya:
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                          {participantStatusLabel(currentParticipantStatus)}
                        </span>
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${statusPanelOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {statusPanelOpen && (
                    <section
                      aria-label="Perbarui status bantuan"
                      className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <p className="text-xs leading-5 text-slate-600">
                        Status saat ini:{" "}
                        <span className="font-bold text-slate-900">
                          {participantStatusLabel(currentParticipantStatus)}
                        </span>
                      </p>

                      {statusActionMessage && (
                        <p
                          role="status"
                          className="rounded-lg bg-emerald-50 p-2 text-xs font-medium text-emerald-700"
                        >
                          {statusActionMessage}
                        </p>
                      )}

                      {statusActionError && (
                        <p
                          role="alert"
                          className="rounded-lg bg-rose-50 p-2 text-xs font-medium text-rose-700"
                        >
                          {statusActionError}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {currentParticipantStatus === "WILL_HELP" && (
                          <button
                            type="button"
                            disabled={statusBusy}
                            onClick={() => void updateMyParticipantStatus("EN_ROUTE")}
                            className="min-h-9 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                          >
                            Dalam perjalanan
                          </button>
                        )}

                        {currentParticipantStatus === "EN_ROUTE" && (
                          <button
                            type="button"
                            disabled={statusBusy}
                            onClick={() => void updateMyParticipantStatus("ARRIVED")}
                            className="min-h-9 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                          >
                            Saya sudah tiba
                          </button>
                        )}

                        {(currentParticipantStatus === "WILL_HELP" ||
                          currentParticipantStatus === "EN_ROUTE" ||
                          currentParticipantStatus === "ARRIVED") && (
                          <>

                            <button
                              type="button"
                              disabled={statusBusy}
                              onClick={() => void updateMyParticipantStatus("WITHDRAWN")}
                              className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                              Mengundurkan diri
                            </button>
                          </>
                        )}

                        {statusBusy && (
                          <LoaderCircle className="h-4 w-4 animate-spin text-rose-600" aria-label="Memperbarui status" />
                        )}
                      </div>
                    </section>
                  )}
                </div>
              )}
            <form onSubmit={(event) => void sendMessage(event)} className="flex items-end gap-2">
              <textarea
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                maxLength={2000}
                rows={2}
                required
                placeholder="Tulis pesan untuk grup..."
                aria-label="Pesan untuk grup bantuan"
                className="min-h-12 min-w-0 flex-1 resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm leading-4.5 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
              <button
                type="submit"
                disabled={sending || !messageDraft.trim()}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-black text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </form>
            <p className="text-[10px] leading-4 text-slate-500">
              Pesan dimuat ulang otomatis setiap beberapa detik. Akses grup akan dihentikan saat permintaan ditutup atau kedaluwarsa.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}