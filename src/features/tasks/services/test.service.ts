import { supabase } from "@/lib/supabase/client";

export async function testConnection() {
  const { data, error } =
    await supabase.auth.getSession();

  console.log(data);

  if (error) {
    console.error(error);
  }
}