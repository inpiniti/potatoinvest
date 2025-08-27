'use client';
import * as React from 'react';
import {
  usePresentBalance,
  Output1Item,
  Output2Item,
  Output3Item,
} from '@/hooks/usePresentBalance';
import { accountTokenStore } from '@/store/accountTokenStore';
import { RefreshCcw } from 'lucide-react';

interface Props {
  isVts?: boolean;
}

export function AccountBalanceSection(p: Props) {
  const { activeAccountId } = accountTokenStore();
  const params = activeAccountId
    ? {
        accountId: activeAccountId,
        kiAccessToken:
          accountTokenStore.getState().tokens[activeAccountId]?.access_token,
        isVts: p.isVts,
      }
    : null;
  const { data, isLoading, error, refetch, isFetching } =
    usePresentBalance(params);

  // When token just issued (custom event from AccountsSection), trigger immediate refetch ignoring stale
  React.useEffect(() => {
    function handleImmediate() {
      if (activeAccountId) {
        refetch({ cancelRefetch: false });
      }
    }
    window.addEventListener('account-token-issued', handleImmediate);
    return () =>
      window.removeEventListener('account-token-issued', handleImmediate);
  }, [activeAccountId, refetch]);

  const output1: Output1Item[] = data?.output1 || [];
  const output2: Output2Item[] = data?.output2 || [];
  const output3: Output3Item | undefined = Array.isArray(data?.output3)
    ? data?.output3?.[0]
    : (data?.output3 as Output3Item | undefined);

  const fmt = React.useCallback((v: string | number | undefined | null) => {
    if (v === undefined || v === null) return '-';
    const s = String(v).trim();
    if (s === '') return '-';
    if (!/^-?\d+(\.\d+)?$/.test(s)) return s;
    const [intPart, decPart] = s.split('.');
    const intFormatted = Number(intPart).toLocaleString();
    return decPart ? `${intFormatted}.${decPart}` : intFormatted;
  }, []);

  const plColor = (val?: string) => {
    if (!val) return '';
    const n = Number(val);
    if (isNaN(n) || n === 0) return '';
    return n > 0
      ? 'text-green-600 dark:text-green-500'
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="mt-2 space-y-2 pb-2 border-b">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-xs font-semibold tracking-wide text-muted-foreground">
          계좌 요약
        </h4>
        <button
          onClick={() => refetch()}
          disabled={!activeAccountId || isFetching}
          className="h-5 w-5 inline-flex items-center justify-center rounded border text-muted-foreground hover:text-foreground hover:border-foreground disabled:opacity-40"
          title="새로고침"
        >
          <RefreshCcw
            className={'h-3 w-3 ' + (isFetching ? 'animate-spin' : '')}
          />
        </button>
      </div>
      <div className="px-2 pb-1 space-y-1">
        {!activeAccountId && (
          <p className="text-[10px] text-red-500">
            활성 계좌 로그인 후 조회 가능
          </p>
        )}
        {activeAccountId && isLoading && (
          <p className="text-[10px] text-muted-foreground">불러오는 중...</p>
        )}
        {activeAccountId && !isLoading && isFetching && (
          <p className="text-[10px] text-muted-foreground">갱신 중...</p>
        )}
        {activeAccountId && error && (
          <p className="text-[10px] text-destructive">
            {(error as Error).message}
          </p>
        )}
        {activeAccountId && !isLoading && !error && (
          <>
            {output3 && (
              <div className="rounded-md border bg-surface-inset p-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] leading-tight">
                  <LabelValue
                    label="총자산"
                    value={fmt(output3.tot_asst_amt)}
                    unit="원"
                  />
                  <LabelValue
                    label="총예수금"
                    value={fmt(output3.tot_dncl_amt)}
                    unit="원"
                  />
                  <LabelValue
                    label="평가금액"
                    value={fmt(output3.evlu_amt_smtl)}
                    unit="원"
                  />
                  <LabelValue
                    label="평가손익"
                    value={fmt(output3.evlu_pfls_amt_smtl)}
                    unit="원"
                    valueClass={plColor(output3.evlu_pfls_amt_smtl)}
                  />
                  <LabelValue
                    label="평가수익률"
                    value={output3.evlu_erng_rt1 || '-'}
                    unit={output3.evlu_erng_rt1 ? '%' : undefined}
                    valueClass={plColor(output3.evlu_erng_rt1)}
                  />
                  <LabelValue
                    label="출금가능"
                    value={fmt(output3.wdrw_psbl_tot_amt)}
                    unit="원"
                  />
                  <LabelValue
                    label="외화평가총액"
                    value={fmt(output3.frcr_evlu_tota)}
                    unit="원"
                  />
                  <LabelValue
                    label="미결제매수"
                    value={fmt(output3.ustl_buy_amt_smtl)}
                    unit="원"
                  />
                </div>
              </div>
            )}
            {!output3 && output2.length === 0 && output1.length === 0 && (
              <p className="text-[10px] text-muted-foreground">데이터 없음</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function LabelValue({
  label,
  value,
  valueClass,
  unit,
}: {
  label: string;
  value: unknown;
  valueClass?: string;
  unit?: string;
}) {
  return (
    <div>
      <div className="text-[9px] text-muted-foreground">{label}</div>
      <div
        className={`font-mono text-[10px] leading-normal truncate ${
          valueClass || ''
        }`}
        title={String(value ?? '')}
      >
        <span>{String(value ?? '-')}</span>
        {unit && (
          <span className="font-normal text-[8px] text-muted-foreground/80 tracking-tight">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
