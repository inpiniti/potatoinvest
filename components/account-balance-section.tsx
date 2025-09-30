'use client';
import * as React from 'react';
import { RefreshCcw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudioData } from '@/hooks/useStudioData';

interface Props {
  isVts?: boolean;
}

type OutputEntry = Record<string, unknown>;

type PresentBalanceSummary = Record<string, string | undefined>;

export function AccountBalanceSection({ isVts }: Props) {
  const {
    activeAccountId,
    presentBalance,
    presentBalanceLoading,
    presentBalanceFetching,
    presentBalanceError,
    setPresentBalanceOptions,
    exchangeRate,
    mutations,
  } = useStudioData();
  const [ccy, setCcy] = React.useState<'KRW' | 'USD'>('KRW');

  React.useEffect(() => {
    setPresentBalanceOptions((prev) => {
      const prevOptions = prev as typeof prev & { isVts?: boolean };
      if (typeof isVts === 'boolean') {
        if (prevOptions.isVts === isVts) return prev;
        return { ...prev, isVts };
      }
      if (typeof prevOptions.isVts !== 'undefined') {
        const rest = { ...prevOptions } as typeof prevOptions;
        delete rest.isVts;
        return rest;
      }
      return prev;
    });
  }, [isVts, setPresentBalanceOptions]);

  const output1 = Array.isArray(presentBalance?.output1)
    ? (presentBalance?.output1 as OutputEntry[])
    : [];
  const output2 = Array.isArray(presentBalance?.output2)
    ? (presentBalance?.output2 as OutputEntry[])
    : [];
  const output3Raw = presentBalance?.output3;
  const output3: PresentBalanceSummary | undefined = Array.isArray(output3Raw)
    ? (output3Raw[0] as PresentBalanceSummary | undefined)
    : (output3Raw as PresentBalanceSummary | undefined);

  React.useEffect(() => {
    if (!activeAccountId) return;
    if (output3?.tot_asst_amt) {
      try {
        window.dispatchEvent(
          new CustomEvent('present-balance-updated', {
            detail: {
              accountId: activeAccountId,
              tot_asst_amt: output3.tot_asst_amt,
            },
          })
        );
      } catch {}
    }
  }, [activeAccountId, output3?.tot_asst_amt]);

  React.useEffect(() => {
    function handleImmediate(ev: Event) {
      const detail = (ev as CustomEvent).detail;
      if (!detail?.accountId) return;
      if (detail.accountId === activeAccountId) {
        mutations.refreshPresentBalance().catch((error) => {
          console.error('잔고 새로고침 실패', error);
        });
      }
    }
    window.addEventListener('account-token-issued', handleImmediate);
    return () =>
      window.removeEventListener('account-token-issued', handleImmediate);
  }, [activeAccountId, mutations]);

  const fmt = React.useCallback((value: string | number | undefined | null) => {
    if (value === undefined || value === null) return '-';
    const s = String(value).trim();
    if (s === '') return '-';
    if (!/^-?\d+(\.\d+)?$/.test(s)) return s;
    const [intPart, decPart] = s.split('.');
    const intFormatted = Number(intPart).toLocaleString();
    return decPart ? `${intFormatted}.${decPart}` : intFormatted;
  }, []);

  const plColor = (val?: string) => {
    if (!val) return '';
    const n = Number(val);
    if (Number.isNaN(n) || n === 0) return '';
    return n > 0
      ? 'text-green-600 dark:text-green-500'
      : 'text-red-600 dark:text-red-400';
  };

  const fmtPercent2 = (raw?: string) => {
    if (!raw) return '-';
    const n = Number(raw);
    if (Number.isNaN(n)) return raw;
    return n.toFixed(2);
  };

  const usdToKrw = typeof exchangeRate === 'number' ? exchangeRate : undefined;

  const convertIfNeeded = (raw?: string) => {
    if (!raw) return '-';
    if (ccy === 'KRW') return fmt(raw);
    if (!usdToKrw) return '-';
    if (!/^\-?\d+(\.\d+)?$/.test(raw)) return '-';
    const val = Number(raw) / usdToKrw;
    return val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const refresh = React.useCallback(() => {
    return mutations.refreshPresentBalance().catch((error) => {
      console.error(error);
    });
  }, [mutations]);

  const errorMessage =
    presentBalanceError instanceof Error
      ? presentBalanceError.message
      : presentBalanceError
      ? '잔고 정보를 불러오는 중 오류가 발생했습니다.'
      : null;

  return (
    <div className="mt-2 space-y-2 pb-2 border-b">
      <div className="flex items-center justify-between px-2 gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold tracking-wide text-muted-foreground">
            계좌 요약
          </h4>
          <Tabs
            value={ccy}
            onValueChange={(value) => setCcy(value as 'KRW' | 'USD')}
            className="h-5"
          >
            <TabsList className="h-5 p-[2px] rounded-md bg-transparent border text-[9px]">
              <TabsTrigger value="KRW" className="px-1 py-0 h-4 text-[9px]">
                원화
              </TabsTrigger>
              <TabsTrigger value="USD" className="px-1 py-0 h-4 text-[9px]">
                달러
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-1">
          {ccy === 'USD' && (
            <span
              className="text-[8px] text-muted-foreground"
              title="USD→KRW 환율"
            >
              {usdToKrw ? `₩${usdToKrw.toLocaleString()}` : '환율...'}
            </span>
          )}
          <button
            onClick={() => refresh()}
            disabled={!activeAccountId || presentBalanceFetching}
            className="h-5 w-5 inline-flex items-center justify-center rounded border text-muted-foreground hover:text-foreground hover:border-foreground disabled:opacity-40"
            title="새로고침"
          >
            <RefreshCcw
              className={`h-3 w-3 ${
                presentBalanceFetching ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>
      </div>
      <div className="px-2 pb-1 space-y-1">
        {!activeAccountId && (
          <p className="text-[10px] text-red-500">
            활성 계좌 로그인 후 조회 가능
          </p>
        )}
        {activeAccountId && presentBalanceLoading && (
          <p className="text-[10px] text-muted-foreground">불러오는 중...</p>
        )}
        {activeAccountId &&
          !presentBalanceLoading &&
          presentBalanceFetching && (
            <p className="text-[10px] text-muted-foreground">갱신 중...</p>
          )}
        {activeAccountId && errorMessage && (
          <p className="text-[10px] text-destructive">{errorMessage}</p>
        )}
        {activeAccountId && !presentBalanceLoading && !errorMessage && (
          <>
            {output3 && (
              <div className="rounded-md border bg-surface-inset p-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] leading-tight">
                  <LabelValue
                    label="총자산"
                    value={convertIfNeeded(output3.tot_asst_amt)}
                    unit={ccy === 'KRW' ? '원' : 'USD'}
                  />
                  <LabelValue
                    label="총예수금"
                    value={convertIfNeeded(output3.tot_dncl_amt)}
                    unit={ccy === 'KRW' ? '원' : 'USD'}
                  />
                  <LabelValue
                    label="평가금액"
                    value={convertIfNeeded(output3.evlu_amt_smtl)}
                    unit={ccy === 'KRW' ? '원' : 'USD'}
                  />
                  <LabelValue
                    label="평가손익"
                    value={convertIfNeeded(output3.evlu_pfls_amt_smtl)}
                    unit={ccy === 'KRW' ? '원' : 'USD'}
                    valueClass={plColor(output3.evlu_pfls_amt_smtl)}
                  />
                  <LabelValue
                    label="평가수익률"
                    value={fmtPercent2(output3.evlu_erng_rt1)}
                    unit={output3.evlu_erng_rt1 ? '%' : undefined}
                    valueClass={plColor(output3.evlu_erng_rt1)}
                  />
                  <LabelValue
                    label="출금가능"
                    value={convertIfNeeded(output3.wdrw_psbl_tot_amt)}
                    unit={ccy === 'KRW' ? '원' : 'USD'}
                  />
                  <LabelValue
                    label="외화평가총액"
                    value={convertIfNeeded(output3.frcr_evlu_tota)}
                    unit={ccy === 'KRW' ? '원' : 'USD'}
                  />
                  <LabelValue
                    label="미결제매수"
                    value={convertIfNeeded(output3.ustl_buy_amt_smtl)}
                    unit={ccy === 'KRW' ? '원' : 'USD'}
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
