"use client";
import * as React from "react";
import { LogIn } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface NavAuthLoggedOutProps {
  onLogin: (credentials: { id: string; password: string }) => Promise<void> | void;
}

export function NavAuthLoggedOut({ onLogin }: NavAuthLoggedOutProps) {
  const [open, setOpen] = React.useState(false);
  const idRef = React.useRef<HTMLInputElement | null>(null);
  const pwRef = React.useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const id = idRef.current?.value?.trim() || "";
    const password = pwRef.current?.value || "";
    setSubmitting(true);
    try {
      await onLogin({ id, password });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <SidebarMenuButton size="lg" className="justify-start">
              <LogIn />
              <span>로그인</span>
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>로그인</DialogTitle>
              <DialogDescription>계정 정보를 입력하세요.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="login-id">아이디</label>
                <input
                  id="login-id"
                  ref={idRef}
                  type="text"
                  required
                  className="bg-surface-inset text-sm w-full rounded-md border px-3 py-2 outline-hidden ring-primary/30 focus:ring-2"
                  placeholder="your-id"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="login-pw">비밀번호</label>
                <input
                  id="login-pw"
                  ref={pwRef}
                  type="password"
                  required
                  className="bg-surface-inset text-sm w-full rounded-md border px-3 py-2 outline-hidden ring-primary/30 focus:ring-2"
                  placeholder="••••••"
                />
              </div>
              <DialogFooter className="sm:justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={submitting}>
                    취소
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "로그인 중..." : "로그인"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
