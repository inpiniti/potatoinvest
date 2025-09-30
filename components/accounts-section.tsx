'use client';
import * as React from 'react';
import { Plus, LogIn, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useStudioData } from '@/hooks/useStudioData';

interface AccountItem {
  id: number;
  account_number: string;
  created_at?: string;
  alias?: string | null;
  max_positions?: number | null;
  target_cash_ratio?: number | null;
}

export function AccountsSection({ disabled }: { disabled?: boolean }) {
  const {
    session,
    accounts,
    accountsLoading,
    accountsError,
    activeAccountId,
    hasHydrated,
    mutations,
  } = useStudioData();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loggingInId, setLoggingInId] = React.useState<number | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const accountRef = React.useRef<HTMLInputElement | null>(null);
  const keyRef = React.useRef<HTMLInputElement | null>(null);
  const secretRef = React.useRef<HTMLInputElement | null>(null);
  const aliasRef = React.useRef<HTMLInputElement | null>(null);

  const handleResetForm = React.useCallback(() => {
    if (accountRef.current) accountRef.current.value = '';
    if (keyRef.current) keyRef.current.value = '';
    if (secretRef.current) secretRef.current.value = '';
    if (aliasRef.current) aliasRef.current.value = '';
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const accountNumber = accountRef.current?.value.trim();
    const apiKey = keyRef.current?.value.trim();
    const apiSecret = secretRef.current?.value.trim();
    const alias = aliasRef.current?.value.trim();
    if (!accountNumber || !apiKey || !apiSecret) {
      setFormError('모든 필드를 입력하세요');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await mutations.addAccount({
        accountNumber,
        apiKey,
        apiSecret,
        alias,
      });
      handleResetForm();
      setOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : '계좌 추가 중 오류'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    ) {
      return;
    }
    try {
      await mutations.deleteAccount(id);
    } catch (error) {
      // 이미 토스트로 처리되지만, 필요시 콘솔 로깅 유지
      console.error(error);
    }
  };

  const handleLogin = async (id: number) => {
    if (disabled) return;
    setLoggingInId(id);
    try {
      await mutations.loginAccount(id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoggingInId((current) => (current === id ? null : current));
    }
  };

  const accountsList: AccountItem[] = accounts;
  const listEmpty = accountsList.length === 0;
  const loading = accountsLoading;
  const requestErrored = accountsError;

  return (
    <div className="mt-2 space-y-2 pb-2 border-b">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide">
          계좌
        </h4>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              disabled={disabled}
              className="h-6 w-6"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">계좌 추가</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>계좌 추가</DialogTitle>
              <DialogDescription>
                API 호출에 사용할 계좌/키 정보를 안전하게 저장합니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="acc-account" className="text-sm font-medium">
                  계좌
                </label>
                <input
                  id="acc-account"
                  ref={accountRef}
                  className="w-full rounded-md border bg-surface-inset px-3 py-2 text-sm"
                  placeholder="123-456-789"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="acc-alias" className="text-sm font-medium">
                  닉네임
                </label>
                <input
                  id="acc-alias"
                  ref={aliasRef}
                  className="w-full rounded-md border bg-surface-inset px-3 py-2 text-sm"
                  placeholder="내 메인 계좌"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="acc-key" className="text-sm font-medium">
                  키
                </label>
                <input
                  id="acc-key"
                  ref={keyRef}
                  className="w-full rounded-md border bg-surface-inset px-3 py-2 text-sm"
                  placeholder="API KEY"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="acc-secret" className="text-sm font-medium">
                  비밀키
                </label>
                <input
                  id="acc-secret"
                  ref={secretRef}
                  className="w-full rounded-md border bg-surface-inset px-3 py-2 text-sm"
                  placeholder="SECRET"
                  type="password"
                />
              </div>
              {formError && <p className="text-xs text-red-500">{formError}</p>}
              <DialogFooter className="gap-2 sm:justify-end">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={saving}>
                    취소
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={saving}>
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="max-h-40 overflow-auto px-2 pb-1">
        {disabled && !session && (
          <p className="text-[10px] text-muted-foreground">
            로그인 후 계좌를 관리할 수 있습니다.
          </p>
        )}
        {hasHydrated && !activeAccountId && !disabled && (
          <p className="text-[10px] text-red-500 mb-1">
            계좌 로그인이 되어야 계좌정보 조회가 가능합니다. 계좌 옆 로그인
            버튼을 눌러주세요.
          </p>
        )}
        {!!requestErrored && (
          <p className="text-xs text-destructive">
            {requestErrored instanceof Error
              ? requestErrored.message
              : '계좌 정보를 불러오지 못했습니다.'}
          </p>
        )}
        {!session || disabled ? (
          <p className="text-xs text-muted-foreground">
            로그인 후 계좌 목록을 확인할 수 있습니다.
          </p>
        ) : loading ? (
          <p className="text-xs text-muted-foreground">불러오는 중...</p>
        ) : listEmpty ? (
          <p className="text-xs text-muted-foreground">등록된 계좌 없음</p>
        ) : (
          <ul className="space-y-1">
            {accountsList.map((a) => {
              const date = a.created_at ? new Date(a.created_at) : null;
              const dateStr = date ? date.toLocaleDateString() : '';
              return (
                <li
                  key={a.id}
                  className="rounded-md border bg-surface-inset px-2 py-1 text-[11px] leading-tight"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <button
                        onClick={() => handleLogin(a.id)}
                        disabled={disabled || loggingInId === a.id}
                        className="h-4 w-4 flex items-center justify-center rounded border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                        title={activeAccountId === a.id ? '로그인됨' : '로그인'}
                        aria-label={
                          activeAccountId === a.id ? '로그인됨' : '로그인'
                        }
                      >
                        {loggingInId === a.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : activeAccountId === a.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <LogIn className="h-3 w-3" />
                        )}
                      </button>
                      <div
                        className="font-medium truncate"
                        title={a.alias || '(무닉네임)'}
                      >
                        {a.alias || '(무닉네임)'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted-foreground">
                        {dateStr}
                      </span>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="삭제"
                        title="삭제"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 break-all">
                    {a.account_number}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
