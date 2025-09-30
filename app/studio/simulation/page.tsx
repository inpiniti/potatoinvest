'use client';
import * as React from 'react';
import { PieChart, Pie, LabelList } from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import Link from 'next/link';
import { useStudioData } from '@/hooks/useStudioData';

interface RecommendedItem {
  stock: string;
  ratio: string;
  person_count: number;
  cash: number | null;
  avg_ratio?: string | null;
  sum_ratio?: string | null;
}

function parseRatioNum(ratio: string) {
  const n = parseFloat((ratio || '').replace(/%/g, ''));
  return isNaN(n) ? 0 : n;
}

export default function PortfolioSimulationPage() {
  const {
    activeAccountId,
    exchangeRate,
    presentBalance,
    dataromaBasedOnStock,
    dataromaLoading,
    dataromaError,
  } = useStudioData();
  const [settings, setSettings] = React.useState({
    max_positions: 20,
    target_cash_ratio: 10,
  });
  const [usdKrw, setUsdKrw] = React.useState<number | null>(null);
  const [totalAssetUsd, setTotalAssetUsd] = React.useState<number | null>(null);
  const [totAsstKrw, setTotAsstKrw] = React.useState<number | null>(null);

  // Listen to settings change events
  React.useEffect(() => {
    function handler(ev: Event) {
      const detail = (ev as CustomEvent).detail;
      if (!detail) return;
      if (detail.accountId && detail.accountId !== activeAccountId) return;
      setSettings({
        max_positions: detail.max_positions,
        target_cash_ratio: detail.target_cash_ratio,
      });
    }
    window.addEventListener('account-settings-changed', handler);
    return () =>
      window.removeEventListener('account-settings-changed', handler);
  }, [activeAccountId]);

  React.useEffect(() => {
    if (typeof exchangeRate === 'number') {
      setUsdKrw(exchangeRate);
    } else {
      setUsdKrw(null);
    }
  }, [exchangeRate]);

  // Listen to account balance broadcast instead of refetching API
  React.useEffect(() => {
    function handleBalance(ev: Event) {
      const detail = (ev as CustomEvent).detail;
      if (!detail) return;
      if (detail.accountId !== activeAccountId) return;
      const raw = detail.tot_asst_amt as string | undefined;
      if (raw) {
        const n = parseFloat(raw.replace(/,/g, ''));
        if (!isNaN(n)) setTotAsstKrw(n);
        else setTotAsstKrw(null);
      }
    }
    window.addEventListener('present-balance-updated', handleBalance);
    return () =>
      window.removeEventListener('present-balance-updated', handleBalance);
  }, [activeAccountId]);

  React.useEffect(() => {
    if (!activeAccountId) {
      setTotAsstKrw(null);
      return;
    }
    if (!presentBalance) return;
    const output3Raw = presentBalance.output3;
    const output3 = Array.isArray(output3Raw) ? output3Raw[0] : output3Raw;
    const raw = output3?.tot_asst_amt;
    if (raw) {
      const n = parseFloat(String(raw).replace(/,/g, ''));
      if (!isNaN(n)) {
        setTotAsstKrw(n);
        return;
      }
    }
    setTotAsstKrw(null);
  }, [activeAccountId, presentBalance]);

  // Derive USD total when KRW + rate available
  React.useEffect(() => {
    if (totAsstKrw && usdKrw) {
      setTotalAssetUsd(parseFloat((totAsstKrw / usdKrw).toFixed(2)));
    } else {
      setTotalAssetUsd(null);
    }
  }, [totAsstKrw, usdKrw]);

  // Recompute recommended on the fly using dataroma dataset + settings
  const recommended: RecommendedItem[] = React.useMemo(() => {
    if (!dataromaBasedOnStock.length) return [];
    const top = settings.max_positions;
    const cashPercent = settings.target_cash_ratio;
    const investAlloc = 100 - cashPercent; // percent allocated to stocks
    const stockArr = dataromaBasedOnStock as Array<{
      stock: string;
      person_count: number;
      sum_ratio: string;
      avg_ratio?: string;
    }>;
    const sliced = stockArr.slice(0, top);
    const numericSumRatios = sliced.map((s) => parseRatioNum(s.sum_ratio));
    let weightSum = numericSumRatios.reduce((a, b) => a + b, 0);
    if (weightSum === 0) weightSum = sliced.length || 1;
    const provisional = sliced.map((s, idx) => {
      const base = numericSumRatios[idx] || 0;
      const allocPct =
        weightSum === 0
          ? investAlloc / sliced.length
          : (base / weightSum) * investAlloc;
      return { ...s, allocPct };
    });
    const investedSum = provisional.reduce((a, b) => a + b.allocPct, 0);
    const drift = investAlloc - investedSum;
    if (Math.abs(drift) >= 0.01 && provisional.length) {
      provisional[0].allocPct += drift;
    }
    const totalUsd = totalAssetUsd; // may be null until populated
    const items: RecommendedItem[] = provisional.map((p) => {
      const ratioStr = p.allocPct.toFixed(2) + '%';
      const cashAlloc = totalUsd
        ? Math.round((p.allocPct / 100) * totalUsd)
        : null;
      return {
        stock: p.stock,
        ratio: ratioStr,
        person_count: p.person_count,
        sum_ratio: p.sum_ratio,
        avg_ratio: p.avg_ratio || null,
        cash: cashAlloc,
      };
    });
    if (cashPercent > 0) {
      items.push({
        stock: 'CASH',
        ratio: cashPercent.toFixed(2) + '%',
        person_count: 0,
        cash: totalUsd ? Math.round((cashPercent / 100) * totalUsd) : null,
        avg_ratio: null,
        sum_ratio: null,
      });
    }
    return items;
  }, [dataromaBasedOnStock, settings, totalAssetUsd]);

  const chartData = React.useMemo(() => {
    const palette = [
      'var(--chart-1)',
      'var(--chart-2)',
      'var(--chart-3)',
      'var(--chart-4)',
      'var(--chart-5)',
      'var(--chart-6, hsl(var(--primary)))',
      'var(--chart-7, hsl(var(--secondary)))',
      'var(--chart-8, hsl(var(--muted)))',
      'var(--chart-9, #4ade80)',
      'var(--chart-10, #fbbf24)',
      'var(--chart-11, #60a5fa)',
      'var(--chart-12, #f87171)',
    ];
    return recommended.map((r, idx) => ({
      code: r.stock,
      value: parseRatioNum(r.ratio),
      fill:
        r.stock === 'CASH'
          ? 'var(--chart-other,#a1a1aa)'
          : palette[idx % palette.length],
    }));
  }, [recommended]);

  const chartConfig: ChartConfig = React.useMemo(() => {
    const base: ChartConfig = { value: { label: '비중(%)' } };
    chartData.forEach((d) => {
      (base as Record<string, { label: string }>)[d.code] = { label: d.code };
    });
    return base;
  }, [chartData]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          포트폴리오 시뮬레이션
        </h1>
        <p className="text-muted-foreground text-sm">
          계좌 설정 (보유종목수 / 현금비중) 실시간 반영
        </p>
      </div>
      {dataromaLoading && (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      )}
      {!!dataromaError && (
        <p className="text-sm text-destructive">
          {dataromaError instanceof Error
            ? dataromaError.message
            : '데이터를 불러오는 중 오류가 발생했습니다.'}
        </p>
      )}
      {!dataromaLoading && !dataromaError && recommended.length > 0 && (
        <>
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Recommended Allocation</CardTitle>
              <CardDescription>
                Top {settings.max_positions} (현금 {settings.target_cash_ratio}
                %)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4 pt-4">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[360px]"
              >
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="code" hideLabel />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="code"
                    strokeWidth={1}
                  >
                    <LabelList
                      dataKey="code"
                      className="fill-background"
                      stroke="none"
                      fontSize={11}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Code</TableHead>
                  <TableHead className="w-28">Ratio</TableHead>
                  <TableHead className="w-28">Persons</TableHead>
                  <TableHead className="w-32">Cash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommended.map((r) => (
                  <TableRow key={r.stock}>
                    <TableCell className="font-medium">
                      {r.stock === 'CASH' ? (
                        'CASH'
                      ) : (
                        <Link
                          href={`/studio/stock/${encodeURIComponent(
                            String(r.stock).toUpperCase()
                          )}`}
                          className="text-primary"
                        >
                          {r.stock}
                        </Link>
                      )}
                    </TableCell>
                    <TableCell>{r.ratio}</TableCell>
                    <TableCell>{r.person_count}</TableCell>
                    <TableCell>
                      {r.cash != null ? r.cash.toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
