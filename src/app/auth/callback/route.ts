import { NextResponse } from "next/server";

import { getSafeAuthRedirect } from "@/features/auth/utils/safe-auth-redirect";

import { createServerSupabaseClient } from "@/lib/supabase/server";

function getRedirectOrigin(requestUrl: URL) {
  if (process.env.NODE_ENV === "development") {
    return requestUrl.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin;
}

function createLoginRedirectUrl(origin: string, nextPath: string): URL {
  const loginUrl = new URL("/login", origin);

  loginUrl.searchParams.set("next", nextPath);

  return loginUrl;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const origin = getRedirectOrigin(requestUrl);

  const nextPath = getSafeAuthRedirect(requestUrl.searchParams.get("next"));

  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(createLoginRedirectUrl(origin, nextPath));
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback exchange failed:", error.message);

    return NextResponse.redirect(createLoginRedirectUrl(origin, nextPath));
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}
