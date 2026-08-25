import { NextResponse } from "next/server";

import {
  createServerSupabaseClient,
} from "@/lib/supabase/server";

function getRedirectOrigin(
  requestUrl: URL,
) {
  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    return requestUrl.origin;
  }

  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    requestUrl.origin
  );
}

export async function GET(
  request: Request,
) {
  const requestUrl =
    new URL(request.url);

  const origin =
    getRedirectOrigin(
      requestUrl,
    );

  const code =
    requestUrl.searchParams.get(
      "code",
    );

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/login",
        origin,
      ),
    );
  }

  const supabase =
    await createServerSupabaseClient();

  const {
    error,
  } =
    await supabase.auth.exchangeCodeForSession(
      code,
    );

  if (error) {
    console.error(
      "OAuth callback exchange failed:",
      error.message,
    );

    return NextResponse.redirect(
      new URL(
        "/login",
        origin,
      ),
    );
  }

  return NextResponse.redirect(
    new URL(
      "/home",
      origin,
    ),
  );
}