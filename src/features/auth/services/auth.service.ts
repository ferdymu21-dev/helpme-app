import { supabase } from "@/lib/supabase/client";

import {
  LoginData,
  RegisterData,
} from "../types/auth.types";

/**
 * REGISTER
 */
export async function registerUser(
  data: RegisterData
) {
  const response = await supabase.auth.signUp({
    email: data.email,

    password: data.password,

    options: {
      data: {
        full_name: data.full_name,
      },
    },
  });

  return response;
}

/**
 * LOGIN
 */
export async function loginUser(
  data: LoginData
) {
  const response =
    await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

  return response;
}

/**
 * LOGOUT
 */
export async function logoutUser() {
  return await supabase.auth.signOut();
}