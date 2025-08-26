"use client";
import * as React from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface AccountItem {
  id: number;
  account_number: string;
  created_at?: string;
  alias?: string | null;
}

export function AccountsSection({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [accounts, setAccounts] = React.useState<AccountItem[]>([]);
  const [fetching, setFetching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const accountRef = React.useRef<HTMLInputElement | null>(null);
  const keyRef = React.useRef<HTMLInputElement | null>(null);
  const secretRef = React.useRef<HTMLInputElement | null>(null);
  const aliasRef = React.useRef<HTMLInputElement | null>(null);

  const loadAccounts = React.useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/accounts', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('계좌 조회 실패');
      const json = await res.json();
  setAccounts(json.accounts || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setFetching(false);
    }
  }, []);

  React.useEffect(() => {
    if (!disabled) loadAccounts();
  }, [disabled, loadAccounts]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const account = accountRef.current?.value.trim();
  const apiKey = keyRef.current?.value.trim();
  const apiSecret = secretRef.current?.value.trim();
  const alias = aliasRef.current?.value.trim();
    if (!account || !apiKey || !apiSecret) {
      setError('모든 필드를 입력하세요');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('세션 만료');
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
  body: JSON.stringify({ accountNumber: account, apiKey, apiSecret, alias }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || '저장 실패');
      }
      setOpen(false);
      if (accountRef.current) accountRef.current.value = '';
      if (keyRef.current) keyRef.current.value = '';
      if (secretRef.current) secretRef.current.value = '';
      if (aliasRef.current) aliasRef.current.value = '';
      await loadAccounts();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 중 오류');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('세션 만료');
      const res = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('삭제 실패');
      await loadAccounts();
    } catch (e) {
      alert(e instanceof Error ? e.message : '삭제 중 오류');
    }
  };

  return (
  <div className="mt-2 space-y-2 pb-2 border-b">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide">계좌</h4>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" disabled={disabled} className="h-6 w-6">
              <Plus className="h-4 w-4" />
              <span className="sr-only">계좌 추가</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>계좌 추가</DialogTitle>
              <DialogDescription>API 호출에 사용할 계좌/키 정보를 안전하게 저장합니다.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="acc-account" className="text-sm font-medium">계좌</label>
                <input id="acc-account" ref={accountRef} className="w-full rounded-md border bg-surface-inset px-3 py-2 text-sm" placeholder="123-456-789" autoFocus />
              </div>
              <div className="space-y-2">
                <label htmlFor="acc-alias" className="text-sm font-medium">닉네임</label>
                <input id="acc-alias" ref={aliasRef} className="w-full rounded-md border bg-surface-inset px-3 py-2 text-sm" placeholder="내 메인 계좌" />
              </div>
              <div className="space-y-2">
                <label htmlFor="acc-key" className="text-sm font-medium">키</label>
                <input id="acc-key" ref={keyRef} className="w-full rounded-md border bg-surface-inset px-3 py-2 text-sm" placeholder="API KEY" />
              </div>
              <div className="space-y-2">
                <label htmlFor="acc-secret" className="text-sm font-medium">비밀키</label>
                <input id="acc-secret" ref={secretRef} className="w-full rounded-md border bg-surface-inset px-3 py-2 text-sm" placeholder="SECRET" type="password" />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <DialogFooter className="gap-2 sm:justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={loading}>취소</Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>{loading ? '저장 중...' : '저장'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="max-h-40 overflow-auto px-2 pb-1">
        {fetching ? (
          <p className="text-xs text-muted-foreground">불러오는 중...</p>
        ) : accounts.length === 0 ? (
          <p className="text-xs text-muted-foreground">등록된 계좌 없음</p>
        ) : (
          <ul className="space-y-1">
            {accounts.map(a => {
              const date = a.created_at ? new Date(a.created_at) : null;
              const dateStr = date ? date.toLocaleDateString() : '';
              return (
                <li key={a.id} className="rounded-md border bg-surface-inset px-2 py-1 text-[11px] leading-tight">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium truncate">{a.alias || '(무닉네임)'}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{dateStr}</span>
                      <button onClick={() => handleDelete(a.id)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="삭제" title="삭제">×</button>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 break-all">{a.account_number}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
