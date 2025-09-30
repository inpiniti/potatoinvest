"use client";
import * as React from "react";
import { PieChart, Pie, LabelList } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import { useStudioData } from "@/hooks/useStudioData";
import type { Output1Item } from "@/hooks/usePresentBalance";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RecommendedItem {
  stock: string;
  ratio: string;
  person_count: number;
  cash: number | null;
  avg_ratio?: string | null;
  sum_ratio?: string | null;
}

function parseRatioNum(ratio: string) {
  const n = parseFloat((ratio || "").replace(/%/g, ""));
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
    getPriceDetail,
    getOpenOrdersMap,
  } = useStudioData();
  const [settings, setSettings] = React.useState({
    max_positions: 20,
    target_cash_ratio: 10,
  });
  const [usdKrw, setUsdKrw] = React.useState<number | null>(null);
  const [totalAssetUsd, setTotalAssetUsd] = React.useState<number | null>(null);
  const [totAsstKrw, setTotAsstKrw] = React.useState<number | null>(null);
  const [openOrdersMap, setOpenOrdersMap] = React.useState<
    Record<string, boolean>
  >({});

  // Preload open orders map (체결중)
  React.useEffect(() => {
    getOpenOrdersMap()
      .then((m) => setOpenOrdersMap(m))
      .catch(() => setOpenOrdersMap({}));
    const id = setInterval(() => {
      getOpenOrdersMap()
        .then((m) => setOpenOrdersMap(m))
        .catch(() => {});
    }, 10_000);
    return () => clearInterval(id);
  }, [getOpenOrdersMap]);

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
    window.addEventListener("account-settings-changed", handler);
    return () =>
      window.removeEventListener("account-settings-changed", handler);
  }, [activeAccountId]);

  React.useEffect(() => {
    if (typeof exchangeRate === "number") {
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
        const n = parseFloat(raw.replace(/,/g, ""));
        if (!isNaN(n)) setTotAsstKrw(n);
        else setTotAsstKrw(null);
      }
    }
    window.addEventListener("present-balance-updated", handleBalance);
    return () =>
      window.removeEventListener("present-balance-updated", handleBalance);
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
      const n = parseFloat(String(raw).replace(/,/g, ""));
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
      const ratioStr = p.allocPct.toFixed(2) + "%";
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
        stock: "CASH",
        ratio: cashPercent.toFixed(2) + "%",
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
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
      "var(--chart-6, hsl(var(--primary)))",
      "var(--chart-7, hsl(var(--secondary)))",
      "var(--chart-8, hsl(var(--muted)))",
      "var(--chart-9, #4ade80)",
      "var(--chart-10, #fbbf24)",
      "var(--chart-11, #60a5fa)",
      "var(--chart-12, #f87171)",
    ];
    return recommended.map((r, idx) => ({
      code: r.stock,
      value: parseRatioNum(r.ratio),
      fill:
        r.stock === "CASH"
          ? "var(--chart-other,#a1a1aa)"
          : palette[idx % palette.length],
    }));
  }, [recommended]);

  const chartConfig: ChartConfig = React.useMemo(() => {
    const base: ChartConfig = { value: { label: "비중(%)" } };
    chartData.forEach((d) => {
      (base as Record<string, { label: string }>)[d.code] = { label: d.code };
    });
    return base;
  }, [chartData]);

  // Derive holdings map from presentBalance.output1
  const holdingsMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    const list: Output1Item[] = Array.isArray(presentBalance?.output1)
      ? (presentBalance?.output1 as Output1Item[])
      : [];
    for (const it of list) {
      const code = String(it?.pdno || it?.ovrs_pdno || "").toUpperCase();
      const qty = Number(
        (it?.ccld_qty_smtl1 || it?.cblc_qty13 || "0")
          .toString()
          .replace(/,/g, "")
      );
      if (code) map[code] = isFinite(qty) ? qty : 0;
    }
    return map;
  }, [presentBalance]);

  // Local async cache for price detail lookups per row
  const [priceRows, setPriceRows] = React.useState<
    Record<string, { last: number; excd?: string }>
  >({});
  const ensurePrice = React.useCallback(
    async (code: string) => {
      const key = code.toUpperCase();
      if (priceRows[key]) return;
      const d = await getPriceDetail(key);
      if (d && d.last) {
        setPriceRows((prev) => ({
          ...prev,
          [key]: { last: d.last, excd: d.excd_used },
        }));
      }
    },
    [getPriceDetail, priceRows]
  );

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
            : "데이터를 불러오는 중 오류가 발생했습니다."}
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
                  <TableHead className="w-24">Code</TableHead>
                  <TableHead className="w-20">Ratio</TableHead>
                  <TableHead className="w-20">Persons</TableHead>
                  <TableHead className="w-24">Cash</TableHead>
                  <TableHead className="w-24">현재가격</TableHead>
                  <TableHead className="w-20">가능수량</TableHead>
                  <TableHead className="w-20">보유수량</TableHead>
                  <TableHead className="w-20">차이수량</TableHead>
                  <TableHead className="w-20">매매수량</TableHead>
                  <TableHead className="w-20">버튼</TableHead>
                  <TableHead className="w-16">체결중</TableHead>
                  <TableHead className="w-16">시장</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommended.map((r) => (
                  <TableRow key={r.stock}>
                    <TableCell className="font-medium">
                      {r.stock === "CASH" ? (
                        "CASH"
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
                      {r.cash != null ? r.cash.toLocaleString() : "-"}
                    </TableCell>
                    {/* 현재가격 */}
                    <TableCell>
                      {r.stock === "CASH" ? (
                        "-"
                      ) : (
                        <PriceCell
                          code={String(r.stock)}
                          ensurePrice={ensurePrice}
                          priceRows={priceRows}
                        />
                      )}
                    </TableCell>
                    {/* 가능/보유/차이/매매 */}
                    {(() => {
                      if (r.stock === "CASH") {
                        return (
                          <>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>-</TableCell>
                          </>
                        );
                      }
                      const code = String(r.stock).toUpperCase();
                      const last = priceRows[code]?.last ?? null;
                      const possibleQty =
                        last && r.cash != null
                          ? Math.floor(r.cash / last)
                          : null;
                      const holdQty = holdingsMap[code] ?? 0;
                      const diffQty =
                        possibleQty != null ? possibleQty - holdQty : null;
                      const tradeQty =
                        diffQty != null ? Math.floor(Math.abs(diffQty)) : null;
                      const action =
                        diffQty != null && diffQty > 0
                          ? "구매"
                          : diffQty != null && diffQty < 0
                          ? "판매"
                          : "-";
                      return (
                        <>
                          <TableCell>
                            {possibleQty != null ? possibleQty : "-"}
                          </TableCell>
                          <TableCell>{holdQty}</TableCell>
                          <TableCell>
                            {diffQty != null ? diffQty : "-"}
                          </TableCell>
                          <TableCell>
                            {tradeQty != null ? tradeQty : "-"}
                          </TableCell>
                          <TableCell>
                            {action === "-" ? (
                              "-"
                            ) : (
                              <Button
                                size="sm"
                                variant={
                                  action === "구매" ? "default" : "secondary"
                                }
                                disabled
                              >
                                {action}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            {openOrdersMap[code] ? (
                              <span className="text-amber-600">체결중</span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{priceRows[code]?.excd ?? "-"}</TableCell>
                        </>
                      );
                    })()}
                  </TableRow>
                ))}
                {(() => {
                  // 추가: 시뮬레이션 목록에 포함되지 않은 보유 종목도 표에 표시
                  // 비교용 표준화: KIS 형식(대문자 + . , -> /)으로 맞춰 중복 방지 (예: BRK.B vs BRK/B)
                  const toKis = (c: string) =>
                    c.toUpperCase().replace(/[.,]/g, "/");
                  const recSet = new Set(
                    recommended
                      .filter((r) => r.stock !== "CASH")
                      .map((r) => toKis(String(r.stock)))
                  );
                  const holdingOnlyCodes = Object.keys(holdingsMap)
                    .filter((code) => !recSet.has(toKis(code)))
                    .filter((code) => (holdingsMap[code] ?? 0) > 0)
                    .sort(
                      (a, b) => (holdingsMap[b] ?? 0) - (holdingsMap[a] ?? 0)
                    );

                  if (holdingOnlyCodes.length === 0) return null;
                  return (
                    <>
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          className="bg-muted/40 text-xs text-muted-foreground"
                        >
                          내 보유 (시뮬레이션 외)
                        </TableCell>
                      </TableRow>
                      {holdingOnlyCodes.map((code) => (
                        <TableRow key={`hold-${code}`}>
                          {/* Code */}
                          <TableCell className="font-medium">
                            <Link
                              href={`/studio/stock/${encodeURIComponent(code)}`}
                              className="text-primary"
                            >
                              {code}
                            </Link>
                          </TableCell>
                          {/* Ratio */}
                          <TableCell>-</TableCell>
                          {/* Persons */}
                          <TableCell>-</TableCell>
                          {/* Cash */}
                          <TableCell>-</TableCell>
                          {/* 현재가격 */}
                          <TableCell>
                            <PriceCell
                              code={code}
                              ensurePrice={ensurePrice}
                              priceRows={priceRows}
                            />
                          </TableCell>
                          {/* 가능수량 */}
                          <TableCell>-</TableCell>
                          {/* 보유수량 */}
                          <TableCell>{holdingsMap[code]}</TableCell>
                          {/* 차이수량 */}
                          <TableCell>-</TableCell>
                          {/* 매매수량: 보유수량 그대로 */}
                          <TableCell>{holdingsMap[code]}</TableCell>
                          {/* 버튼 */}
                          <TableCell>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                toast("판매 주문 기능은 곧 제공됩니다.")
                              }
                            >
                              판매
                            </Button>
                          </TableCell>
                          {/* 체결중 */}
                          <TableCell>
                            {openOrdersMap[code] ? (
                              <span className="text-amber-600">체결중</span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          {/* 시장 */}
                          <TableCell>{priceRows[code]?.excd ?? "-"}</TableCell>
                        </TableRow>
                      ))}
                    </>
                  );
                })()}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

function PriceCell({
  code,
  ensurePrice,
  priceRows,
}: {
  code: string;
  ensurePrice: (code: string) => Promise<void>;
  priceRows: Record<string, { last: number; excd?: string }>;
}) {
  React.useEffect(() => {
    ensurePrice(code);
  }, [code, ensurePrice]);
  const last = priceRows[code.toUpperCase()]?.last;
  return <span>{last != null ? last.toLocaleString() : "..."}</span>;
}
