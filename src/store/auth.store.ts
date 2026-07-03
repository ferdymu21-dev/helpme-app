import { create } from "zustand";

import { User } from "@supabase/supabase-js";

interface AuthState {

  user: User | null;

  role: string | null;

  loading: boolean;

  setUser: (
    user: User | null
  ) => void;

  setRole: (
    role: string | null
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

}

export const useAuthStore =
  create<AuthState>((set) => ({

    user: null,

    role: null,

    loading: true,

    setUser: (user) =>
      set({ user }),

    setRole: (role) =>
      set({ role }),

    setLoading: (loading) =>
      set({ loading }),

  }));