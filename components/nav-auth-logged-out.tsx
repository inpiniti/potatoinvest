'use client';
import * as React from 'react';
import { LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface NavAuthLoggedOutProps {
  onLogin: (credentials: {
    id: string;
    password: string;
  }) => Promise<void> | void;
}

export function NavAuthLoggedOut({ onLogin }: NavAuthLoggedOutProps) {
  const [open, setOpen] = React.useState(false);
  const idRef = React.useRef<HTMLInputElement | null>(null);
  const pwRef = React.useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const id = idRef.current?.value?.trim() || '';
    const password = pwRef.current?.value || '';
    setSubmitting(true);
    setError(null);
    try {
      await onLogin({ id, password });
      setOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '로그인 실패';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKakao = async () => {
    setError(null);
    try {
      // Allow override via environment variable (e.g. NEXT_PUBLIC_STUDIO_LOGIN_REDIRECT)
      // Fallback to /studio/home if not provided.
      const envRedirect = process.env.NEXT_PUBLIC_STUDIO_LOGIN_REDIRECT;
      const base = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = envRedirect ? (envRedirect.startsWith('http') ? envRedirect : base + envRedirect) : base + '/studio/home';
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (oauthError) setError(oauthError.message);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '카카오 로그인 실패';
      setError(msg);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <SidebarMenuButton size="lg" className="justify-start">
              <LogIn className="mr-2 h-4 w-4" />
              <span>로그인</span>
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>로그인</DialogTitle>
              <DialogDescription>
                카카오 소셜 로그인 또는 (비활성화된) 이메일 로그인
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleKakao}
                className="w-full !bg-[#FEE500] text-black hover:bg-[#FDD835]"
              >
                카카오로 로그인
              </Button>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="h-px w-full bg-border" />
              <form
                onSubmit={handleSubmit}
                className="space-y-4 opacity-60 pointer-events-none"
                data-disabled
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="login-id">
                    아이디 (비활성화)
                  </label>
                  <input
                    id="login-id"
                    ref={idRef}
                    type="text"
                    className="bg-surface-inset text-sm w-full rounded-md border px-3 py-2 outline-hidden"
                    placeholder="your-id"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="login-pw">
                    비밀번호 (비활성화)
                  </label>
                  <input
                    id="login-pw"
                    ref={pwRef}
                    type="password"
                    className="bg-surface-inset text-sm w-full rounded-md border px-3 py-2 outline-hidden"
                    placeholder="••••••"
                    disabled
                  />
                </div>
                <DialogFooter className="sm:justify-end gap-2">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={submitting}
                    >
                      닫기
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled className="cursor-not-allowed">
                    이메일 로그인
                  </Button>
                </DialogFooter>
              </form>
              <p className="text-[10px] text-muted-foreground">
                이메일 로그인은 준비 중입니다. 카카오 로그인을 사용해주세요.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
