'use client';
import * as React from 'react';
import { useStudioData } from '@/hooks/useStudioData';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AccountMetaSettings {
  id: number;
  max_positions?: number | null;
  target_cash_ratio?: number | null;
}

export function AccountSettingsSection() {
  const {
    activeAccountId,
    accounts,
    accountsLoading,
    accountsError,
    mutations,
  } = useStudioData();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [values, setValues] = React.useState({
    max_positions: 20,
    target_cash_ratio: 10,
  });
  const [dirty, setDirty] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const activeAccount = React.useMemo<AccountMetaSettings | undefined>(() => {
    if (!activeAccountId) return undefined;
    return accounts.find((a) => a.id === activeAccountId);
  }, [accounts, activeAccountId]);

  const syncFromAccount = React.useCallback(
    (source: 'fetch' | 'change') => {
      if (!activeAccountId || !activeAccount) return;
      const maxPositions =
        typeof activeAccount.max_positions === 'number'
          ? activeAccount.max_positions
          : 20;
      const targetCashRatio =
        typeof activeAccount.target_cash_ratio === 'number'
          ? activeAccount.target_cash_ratio
          : 10;
      setValues({
        max_positions: maxPositions,
        target_cash_ratio: targetCashRatio,
      });
      setDirty(false);
      try {
        window.dispatchEvent(
          new CustomEvent('account-settings-changed', {
            detail: {
              accountId: activeAccountId,
              max_positions: maxPositions,
              target_cash_ratio: targetCashRatio,
              dirty: false,
              source,
            },
          })
        );
      } catch {}
    },
    [activeAccountId, activeAccount]
  );

  React.useEffect(() => {
    syncFromAccount('fetch');
  }, [syncFromAccount]);

  React.useEffect(() => {
    function handleTokenIssued(ev: Event) {
      const detail = (ev as CustomEvent).detail;
      if (detail?.accountId === activeAccountId) {
        setRefreshing(true);
        mutations
          .refreshAccounts()
          .catch((err) => console.error(err))
          .finally(() => setRefreshing(false));
      }
    }
    window.addEventListener('account-token-issued', handleTokenIssued);
    return () =>
      window.removeEventListener('account-token-issued', handleTokenIssued);
  }, [activeAccountId, mutations]);

  const updateField = (
    key: 'max_positions' | 'target_cash_ratio',
    val: number
  ) => {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
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

  const handleRefresh = async () => {
    if (!activeAccountId) return;
    setRefreshing(true);
    setError(null);
    try {
      await mutations.refreshAccounts();
      syncFromAccount('fetch');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '설정을 불러오지 못했습니다.'
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleSave = async () => {
    if (!activeAccountId) return;
    setSaving(true);
    setError(null);
    try {
      await mutations.updateAccountSettings({
        accountId: activeAccountId,
        max_positions: values.max_positions,
        target_cash_ratio: values.target_cash_ratio,
      });
      setDirty(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '설정을 저장하지 못했습니다.'
      );
    } finally {
      setSaving(false);
    }
  };

  const showLoading = accountsLoading || refreshing;
  const accountsLoadError =
    accountsError instanceof Error
      ? accountsError.message
      : accountsError
      ? '계좌 정보를 불러오는 중 오류가 발생했습니다.'
      : null;

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
        {activeAccountId && showLoading && (
          <p className="text-[10px] text-muted-foreground">불러오는 중...</p>
        )}
        {(accountsLoadError || error) && (
          <p className="text-[10px] text-red-500">
            {error || accountsLoadError}
          </p>
        )}
        {activeAccountId && !showLoading && !accountsLoadError && (
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
            <div className="flex justify-between pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={handleRefresh}
                disabled={saving || refreshing}
              >
                새로고침
              </Button>
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
