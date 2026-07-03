import { createClient }
from "@supabase/supabase-js";

console.log(
  "SERVICE ROLE:",
  process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20)
);

export const adminSupabase = createClient(

  process.env.NEXT_PUBLIC_SUPABASE_URL!,

  process.env.SUPABASE_SERVICE_ROLE_KEY!,

  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }

);