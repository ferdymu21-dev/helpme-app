import { supabase } from "@/lib/supabase/client";

import { getSafeAuthRedirect } from "../utils/safe-auth-redirect";

interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

/* =========================
   REGISTER
========================= */

export async function register({
  full_name,
  email,
  password,
}: RegisterPayload) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   LOGIN
========================= */

export async function login({ email, password }: LoginPayload) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   LOGOUT
========================= */

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/* =========================
   GOOGLE OAUTH
========================= */

export async function signInWithGoogle(nextPath?: string | null) {
  const safeNextPath = getSafeAuthRedirect(nextPath);

  const callbackUrl = new URL("/auth/callback", window.location.origin);

  callbackUrl.searchParams.set("next", safeNextPath);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   GET CURRENT USER
========================= */

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
