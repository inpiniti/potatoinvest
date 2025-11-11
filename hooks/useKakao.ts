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
    supabase?.auth
      ?.getSession()
      ?.then(({ data }) => {
        if (!mounted) return;
        setSession(data?.session);
      })
      ?.finally(() => mounted && setLoading(false));

    const { data } = supabase?.auth?.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      }
    );
    return () => {
      mounted = false;
      data?.subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async () => {
    // 환경 변수가 설정되어 있으면 우선 사용
    let redirectTo = process?.env?.NEXT_PUBLIC_STUDIO_LOGIN_REDIRECT;

    // 환경 변수가 없으면 현재 origin 사용 (폴백)
    if (!redirectTo) {
      const origin =
        typeof window !== "undefined" ? window?.location?.origin : "";
      redirectTo = `${origin}/login`;
      console.warn(
        "⚠️ NEXT_PUBLIC_STUDIO_LOGIN_REDIRECT not set, using fallback:",
        redirectTo
      );
    }

    // 상대 경로인 경우 절대 경로로 변환
    if (redirectTo && !redirectTo.startsWith("http")) {
      const origin =
        typeof window !== "undefined" ? window?.location?.origin : "";
      redirectTo = `${origin}${redirectTo}`;
    }

    const { error } = await supabase?.auth?.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase?.auth?.signOut();
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
