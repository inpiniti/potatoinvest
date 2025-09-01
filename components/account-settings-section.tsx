'use client';
import * as React from 'react';
import { accountTokenStore } from '@/store/accountTokenStore';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AccountMetaSettings {
  id: number;
  max_positions?: number | null;
  target_cash_ratio?: number | null;
}

export function AccountSettingsSection() {
  const { activeAccountId } = accountTokenStore();
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [values, setValues] = React.useState<{
    max_positions: number;
    target_cash_ratio: number;
  }>({ max_positions: 20, target_cash_ratio: 10 });
  const [dirty, setDirty] = React.useState(false);

  // Centralized fetch function (discard local unsaved changes when reloading from server)
  const fetchSettings = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!activeAccountId) return;
      const silent = opts?.silent;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error('세션 만료');
        const res = await fetch('/api/accounts', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('계좌 조회 실패');
        const json = await res.json();
        const target: AccountMetaSettings | undefined = (
          json.accounts || []
        ).find((a: AccountMetaSettings) => a.id === activeAccountId);
        if (target) {
          setValues({
            max_positions:
              typeof target.max_positions === 'number'
                ? target.max_positions
                : 20,
            target_cash_ratio:
              typeof target.target_cash_ratio === 'number'
                ? target.target_cash_ratio
                : 10,
          });
          // Treat freshly loaded server values as saved state
          setDirty(false);
          try {
            const mp =
              typeof target.max_positions === 'number'
                ? target.max_positions
                : 20;
            const tc =
              typeof target.target_cash_ratio === 'number'
                ? target.target_cash_ratio
                : 10;
            window.dispatchEvent(
              new CustomEvent('account-settings-changed', {
                detail: {
                  accountId: activeAccountId,
                  max_positions: mp,
                  target_cash_ratio: tc,
                  dirty: false,
                  source: 'fetch',
                },
              })
            );
          } catch {}
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '불러오기 오류');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [activeAccountId]
  );

  // Initial load & when active account changes
  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Listen for account-token-issued to refresh settings even if same account re-logged
  React.useEffect(() => {
    function handleTokenIssued(ev: Event) {
      const detail = (ev as CustomEvent).detail;
      if (!detail) return;
      if (detail.accountId === activeAccountId) {
        // Force refresh (silent to avoid flicker) and clear dirty
        fetchSettings({ silent: true });
      }
    }
    window.addEventListener('account-token-issued', handleTokenIssued);
    return () =>
      window.removeEventListener('account-token-issued', handleTokenIssued);
  }, [activeAccountId, fetchSettings]);

  const updateField = (
    key: 'max_positions' | 'target_cash_ratio',
    val: number
  ) => {
    setValues((v) => {
      const next = { ...v, [key]: val };
      // fire event for live simulation updates
      try {
        window.dispatchEvent(
          new CustomEvent('account-settings-changed', {
            detail: {
              accountId: activeAccountId,
              max_positions: key === 'max_positions' ? val : next.max_positions,
              target_cash_ratio:
                key === 'target_cash_ratio' ? val : next.target_cash_ratio,
              dirty: true,
              source: 'change',
            },
          })
        );
      } catch {}
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    if (!activeAccountId) return;
    setSaving(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('세션 만료');
      const res = await fetch('/api/accounts/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          accountId: activeAccountId,
          max_positions: values.max_positions,
          target_cash_ratio: values.target_cash_ratio,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '저장 실패');
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 오류');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 space-y-2 pb-2 border-b">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-xs font-semibold tracking-wide text-muted-foreground">
          설정
        </h4>
        {dirty && <span className="text-[9px] text-amber-500">미저장</span>}
      </div>
      <div className="px-2 space-y-3">
        {!activeAccountId && (
          <p className="text-[10px] text-muted-foreground">계좌 로그인 필요</p>
        )}
        {activeAccountId && loading && (
          <p className="text-[10px] text-muted-foreground">불러오는 중...</p>
        )}
        {error && <p className="text-[10px] text-red-500">{error}</p>}
        {activeAccountId && !loading && (
          <>
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-muted-foreground">보유종목수</span>
                <span className="font-mono">{values.max_positions} / 50</span>
              </div>
              <Slider
                max={50}
                min={1}
                step={1}
                value={[values.max_positions]}
                onValueChange={(v: [number]) =>
                  updateField('max_positions', v[0])
                }
                disabled={saving}
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-muted-foreground">현금비중(%)</span>
                <span className="font-mono">
                  {values.target_cash_ratio}% / 100%
                </span>
              </div>
              <Slider
                max={100}
                min={0}
                step={1}
                value={[values.target_cash_ratio]}
                onValueChange={(v: [number]) =>
                  updateField('target_cash_ratio', v[0])
                }
                disabled={saving}
              />
            </div>
            <div className="flex justify-end pt-1">
              <Button
                variant="outline"
                disabled={!dirty || saving}
                onClick={handleSave}
                className="h-6 px-2 text-[10px] !text-xs !leading-none !py-0"
              >
                {saving ? '저장중...' : '저장'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
