"use client";
import { useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export interface KakaoAuthData {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
}

interface UseKakaoReturn {
  data: KakaoAuthData;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export function useKakao(): UseKakaoReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
      })
      .finally(() => mounted && setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const envRedirect = process.env.NEXT_PUBLIC_STUDIO_LOGIN_REDIRECT;
    const redirectTo = envRedirect
      ? envRedirect.startsWith("http")
        ? envRedirect
        : `${origin}${envRedirect}`
      : `${origin}/studio2`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    data: {
      session,
      user: session?.user ?? null,
      loading,
      isLoggedIn: !!session,
    },
    login,
    logout,
  };
}

export default useKakao;