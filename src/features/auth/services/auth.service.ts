import { supabase } from "@/lib/supabase/client";

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
  const { data, error } =
    await supabase.auth.signUp({
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

export async function login({
  email,
  password,
}: LoginPayload) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
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
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/* =========================
   GOOGLE OAUTH
========================= */

export async function signInWithGoogle() {
  const redirectTo =
    `${window.location.origin}/auth/callback`;

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
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