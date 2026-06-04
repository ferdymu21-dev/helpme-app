import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * 🔥 SINGLE SOURCE CLIENT (recommended)
 */
export const supabase = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

/**
 * OPTIONAL factory (ONLY if needed)
 */
export const createBrowserSupabaseClient = () =>
  createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);