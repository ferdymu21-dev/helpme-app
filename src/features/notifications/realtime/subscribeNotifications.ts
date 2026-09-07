import { supabase } from "@/lib/supabase/client";

export async function subscribeNotifications(
  onNotification: () => void,
  userId?: string | null,
) {
  let resolvedUserId =
    userId ?? null;

  /*
   * Caller baru sebaiknya memberikan
   * userId dari AuthProvider/Zustand.
   *
   * Fallback dipertahankan agar caller
   * notification lama tidak rusak.
   */
  if (!resolvedUserId) {
    try {
      const {
        data: { user },
        error,
      } =
        await supabase.auth.getUser();

      if (
        error ||
        !user
      ) {
        return () => {};
      }

      resolvedUserId =
        user.id;
    } catch {
      /*
       * Session dapat hilang ketika
       * logout berlangsung.
       *
       * Kondisi tersebut normal dan
       * tidak perlu menghasilkan
       * unhandled AuthSessionMissingError.
       */
      return () => {};
    }
  }

  const channel =
    supabase.channel(
      `notifications-${resolvedUserId}-${Date.now()}`,
    );

  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notifications",
      filter:
        `user_id=eq.${resolvedUserId}`,
    },
    () => {
      onNotification();
    },
  );

  channel.subscribe();

  return () => {
    void supabase.removeChannel(
      channel,
    );
  };
}